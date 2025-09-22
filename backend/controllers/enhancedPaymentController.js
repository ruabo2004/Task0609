const Payment = require('../models/Payment');
const PaymentMethod = require('../models/PaymentMethod');
const PaymentTransaction = require('../models/PaymentTransaction');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const paymentGatewayService = require('../services/paymentGatewayService');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

const getAvailablePaymentMethods = async (req, res) => {
  try {
    const gateways = paymentGatewayService.getAvailableGateways();
    const activeGateways = gateways.filter(gateway => gateway.is_active);

    res.json({
      success: true,
      message: 'Available payment methods retrieved successfully',
      data: {
        payment_methods: activeGateways,
        count: activeGateways.length
      }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
      error: error.message
    });
  }
};

const calculatePaymentFees = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { payment_method, amount } = req.body;

    try {
      paymentGatewayService.validatePaymentAmount(payment_method, amount);
      const feeCalculation = paymentGatewayService.calculateFees(payment_method, amount);

      res.json({
        success: true,
        message: 'Payment fees calculated successfully',
        data: {
          fee_calculation: feeCalculation,
          payment_method: payment_method
        }
      });
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }
  } catch (error) {
    console.error('Calculate payment fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate payment fees',
      error: error.message
    });
  }
};

const createPayment = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    await connection.beginTransaction();

    const {
      booking_id,
      payment_method,
      amount,
      currency = 'VND',
      return_url,
      cancel_url
    } = req.body;

    const customerId = req.customer.customer_id;

    const booking = await Booking.findByIdWithDetails(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customer_id !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your booking'
      });
    }

    if (!['pending', 'confirmed'].includes(booking.booking_status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in a payable status'
      });
    }

    paymentGatewayService.validatePaymentAmount(payment_method, amount);

    const existingPayments = await Payment.findByBookingId(booking_id);
    const totalPaid = existingPayments
      .filter(p => p.payment_status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    if (totalPaid + amount > booking.total_amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds remaining balance',
        details: {
          total_amount: booking.total_amount,
          already_paid: totalPaid,
          remaining: booking.total_amount - totalPaid,
          requested: amount
        }
      });
    }

    const gateway = paymentGatewayService.getGatewayById(payment_method);
    const fees = paymentGatewayService.calculateFees(payment_method, amount);

    const payment = await Payment.create({
      booking_id,
      customer_id: customerId,
      amount,
      payment_method,
      payment_status: 'pending',
      transaction_id: `PAY_${Date.now()}_${booking_id}`,
      currency
    });

    const transaction = await PaymentTransaction.create({
      paymentId: payment.payment_id,
      bookingId: booking_id,
      customerId: customerId,
      transactionType: 'payment',
      paymentMethod: payment_method,
      provider: gateway.name.toLowerCase().replace(/\s+/g, '_'),
      amount,
      currency,
      processingFee: fees.total_fee
    });

    let paymentResponse;
    
    try {
      const paymentData = {
        orderId: payment.transaction_id,
        amount,
        orderInfo: `Thanh toan booking ${booking.booking_code}`,
        redirectUrl: return_url || `${req.protocol}://${req.get('host')}/payment/success`,
        ipnUrl: `${req.protocol}://${req.get('host')}/api/payment/webhook/${payment_method}`,
        customerInfo: {
          customerId,
          bookingId: booking_id
        }
      };

      paymentResponse = await paymentGatewayService.createPayment(payment_method, paymentData);

      await Payment.updateGatewayInfo(payment.payment_id, {
        gateway_transaction_id: paymentResponse.transaction_id,
        gateway_response: paymentResponse.gateway_response,
        payment_url: paymentResponse.payment_url
      });

      await PaymentTransaction.updateStatus(
        transaction.transaction_id,
        'pending',
        paymentResponse.gateway_response
      );

    } catch (gatewayError) {
      await PaymentTransaction.updateStatus(
        transaction.transaction_id,
        'failed',
        null,
        gatewayError.message
      );

      throw gatewayError;
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        payment: {
          payment_id: payment.payment_id,
          booking_id: booking_id,
          amount,
          payment_method,
          status: 'pending',
          transaction_id: payment.transaction_id,
          created_at: payment.created_at
        },
        gateway_response: paymentResponse,
        next_action: {
          type: paymentResponse.payment_url ? 'redirect' : 'display_info',
          url: paymentResponse.payment_url,
          instructions: paymentResponse.instructions,
          qr_code: paymentResponse.qr_code_url || paymentResponse.bank_info?.qr_code
        }
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

const handlePaymentWebhook = async (req, res) => {
  try {
    const { gateway } = req.params;
    const webhookData = req.body;

    console.log(`Received ${gateway} webhook:`, webhookData);

    let verificationResult;
    try {
      verificationResult = await paymentGatewayService.verifyPayment(gateway, webhookData);
    } catch (verifyError) {
      console.error('Payment verification failed:', verifyError);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    const { transaction_status, gateway_transaction_id, failure_reason } = verificationResult;

    let orderId = webhookData.orderId || webhookData.orderCode || webhookData.vnp_TxnRef;
    
    const payment = await Payment.findByTransactionId(orderId);
    if (!payment) {
      console.error('Payment not found for orderId:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const transactions = await PaymentTransaction.findByPaymentId(payment.payment_id);
    const pendingTransaction = transactions.find(t => t.status === 'pending');

    if (pendingTransaction) {
      await PaymentTransaction.updateStatus(
        pendingTransaction.transaction_id,
        transaction_status,
        webhookData,
        failure_reason
      );
    }

    const newStatus = transaction_status === 'completed' ? 'paid' : 'failed';
    await Payment.updateStatus(payment.payment_id, newStatus);

    if (transaction_status === 'completed') {
      const booking = await Booking.findByIdWithDetails(payment.booking_id);
      
      if (booking && booking.booking_status === 'pending') {
        await Booking.updateStatus(payment.booking_id, 'confirmed');
      }

      await Notification.createBookingNotification(
        payment.customer_id,
        payment.booking_id,
        'payment_successful',
        {
          booking_code: booking?.booking_code || payment.booking_id,
          amount: payment.amount
        }
      );
    } else {
      await Notification.createBookingNotification(
        payment.customer_id,
        payment.booking_id,
        'payment_failed',
        {
          booking_code: booking?.booking_code || payment.booking_id,
          amount: payment.amount,
          reason: failure_reason
        }
      );
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const customerId = req.customer.customer_id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.customer_id !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const transactions = await PaymentTransaction.findByPaymentId(paymentId);
    const latestTransaction = transactions[0];

    const gatewayDisplay = paymentGatewayService.getPaymentMethodDisplay(
      payment.payment_method, 
      latestTransaction?.provider
    );

    res.json({
      success: true,
      message: 'Payment status retrieved successfully',
      data: {
        payment: {
          payment_id: payment.payment_id,
          booking_id: payment.booking_id,
          amount: payment.amount,
          payment_method: payment.payment_method,
          payment_status: payment.payment_status,
          transaction_id: payment.transaction_id,
          gateway_transaction_id: payment.momo_order_id || latestTransaction?.gateway_transaction_id,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
          gateway_display: gatewayDisplay
        },
        transactions: transactions.map(t => t.toJSON()),
        latest_transaction: latestTransaction?.toJSON()
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment status',
      error: error.message
    });
  }
};

const getCustomerPayments = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const {
      page = 1,
      limit = 20,
      status,
      payment_method,
      date_from,
      date_to
    } = req.query;

    const payments = await Payment.findCustomerPayments(customerId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      paymentMethod: payment_method,
      dateFrom: date_from,
      dateTo: date_to
    });

    const paymentsWithDisplay = payments.payments.map(payment => ({
      ...payment,
      gateway_display: paymentGatewayService.getPaymentMethodDisplay(payment.payment_method)
    }));

    res.json({
      success: true,
      message: 'Customer payments retrieved successfully',
      data: {
        payments: paymentsWithDisplay,
        pagination: payments.pagination
      }
    });

  } catch (error) {
    console.error('Get customer payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer payments',
      error: error.message
    });
  }
};

const createRefund = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    await connection.beginTransaction();

    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const customerId = req.customer.customer_id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.customer_id !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (payment.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }

    const transactions = await PaymentTransaction.findByPaymentId(paymentId);
    const originalTransaction = transactions.find(t => t.transaction_type === 'payment' && t.status === 'completed');

    if (!originalTransaction) {
      return res.status(400).json({
        success: false,
        message: 'No completed transaction found for refund'
      });
    }

    if (amount > originalTransaction.net_amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed original payment amount',
        details: {
          original_amount: originalTransaction.net_amount,
          requested_amount: amount
        }
      });
    }

    const refundTransaction = await PaymentTransaction.createRefund(
      originalTransaction.transaction_id,
      amount,
      reason
    );

    let refundResponse;
    try {
      refundResponse = await paymentGatewayService.processRefund(payment.payment_method, {
        original_transaction_id: originalTransaction.gateway_transaction_id,
        amount,
        reason,
        currency: originalTransaction.currency
      });

      await PaymentTransaction.updateStatus(
        refundTransaction.transaction_id,
        refundResponse.success ? 'completed' : 'pending',
        refundResponse
      );

    } catch (refundError) {
      await PaymentTransaction.updateStatus(
        refundTransaction.transaction_id,
        'failed',
        null,
        refundError.message
      );
    }

    await connection.commit();

    await Notification.create({
      customerId: payment.customer_id,
      type: 'payment',
      title: 'Yêu cầu hoàn tiền',
      message: `Yêu cầu hoàn tiền ${amount.toLocaleString()} VND đã được tiếp nhận`,
      data: {
        payment_id: paymentId,
        refund_amount: amount,
        reason
      },
      priority: 'normal'
    });

    res.json({
      success: true,
      message: 'Refund request created successfully',
      data: {
        refund_transaction: refundTransaction.toJSON(),
        refund_response: refundResponse,
        estimated_completion: refundResponse?.estimated_time || '3-5 business days'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create refund',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

const getPaymentAnalytics = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { timeframe = '30d' } = req.query;

    const analytics = await PaymentTransaction.getTransactionStats(customerId, timeframe);

    const summary = {
      total_transactions: analytics.overview.total_transactions,
      successful_transactions: analytics.overview.successful_transactions,
      success_rate: analytics.overview.total_transactions > 0 
        ? (analytics.overview.successful_transactions / analytics.overview.total_transactions * 100).toFixed(2)
        : 0,
      total_amount: analytics.overview.total_amount,
      total_fees: analytics.overview.total_fees,
      average_transaction: analytics.overview.avg_transaction_amount,
      favorite_payment_method: analytics.byPaymentMethod[0]?.payment_method || null
    };

    res.json({
      success: true,
      message: 'Payment analytics retrieved successfully',
      data: {
        timeframe,
        summary,
        by_payment_method: analytics.byPaymentMethod,
        daily_trends: analytics.dailyTrends
      }
    });

  } catch (error) {
    console.error('Get payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment analytics',
      error: error.message
    });
  }
};

const getCustomerPaymentMethods = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;

    const paymentMethods = await PaymentMethod.findByCustomerId(customerId);

    res.json({
      success: true,
      message: 'Customer payment methods retrieved successfully',
      data: {
        payment_methods: paymentMethods.map(method => method.toJSON()),
        count: paymentMethods.length
      }
    });

  } catch (error) {
    console.error('Get customer payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
      error: error.message
    });
  }
};

const addPaymentMethod = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const customerId = req.customer.customer_id;
    const { method_type, provider, account_info, is_default = false } = req.body;

    try {
      paymentGatewayService.validatePaymentMethod(method_type, account_info);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    const paymentMethod = await PaymentMethod.create({
      customerId,
      methodType: method_type,
      provider,
      accountInfo: account_info,
      isDefault: is_default
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: {
        payment_method: paymentMethod.toJSON()
      }
    });

  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method',
      error: error.message
    });
  }
};

const setDefaultPaymentMethod = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { methodId } = req.params;

    const updated = await PaymentMethod.setAsDefault(parseInt(methodId), customerId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      message: 'Default payment method updated successfully'
    });

  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default payment method',
      error: error.message
    });
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { methodId } = req.params;

    const deleted = await PaymentMethod.delete(parseInt(methodId), customerId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method',
      error: error.message
    });
  }
};

module.exports = {
  getAvailablePaymentMethods,
  calculatePaymentFees,
  createPayment,
  handlePaymentWebhook,
  getPaymentStatus,
  getCustomerPayments,
  createRefund,
  getPaymentAnalytics,
  getCustomerPaymentMethods,
  addPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod
};


