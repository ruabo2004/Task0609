const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const momoService = require('../services/momoService');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

const createMoMoPayment = async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { booking_id } = req.body;
    const customer_id = req.customer.customer_id;

    const booking = await Booking.findByIdWithDetails(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your booking'
      });
    }

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }

    const existingPayments = await Payment.findByBookingId(booking_id);
    const hasPendingOrCompletedPayment = existingPayments.some(
      payment => payment.payment_status === 'pending' || payment.payment_status === 'completed'
    );

    if (hasPendingOrCompletedPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this booking'
      });
    }

    const paymentData = {
      booking_id: booking_id,
      payment_method: 'momo',
      amount: booking.total_amount,
      payment_status: 'pending'
    };

    const payment = await Payment.create(paymentData);

    const momoAmount = momoService.formatAmount(booking.total_amount);
    const orderInfo = `Thanh toan dat phong ${booking.room_number} - ${booking.customer_name}`;

    const momoRequest = await momoService.createPaymentRequest({
      bookingId: booking_id,
      amount: momoAmount,
      orderInfo: orderInfo,
      customerInfo: {
        name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone
      }
    });

    if (!momoRequest.success) {
      
      await payment.updateStatus('failed', {
        payment_data: momoRequest
      });

      return res.status(400).json({
        success: false,
        message: momoRequest.message || 'Failed to create MoMo payment',
        error: momoRequest
      });
    }

    await payment.updateStatus('pending', {
      payment_data: momoRequest
    });

    await pool.execute(
      'UPDATE payments SET momo_order_id = ?, momo_request_id = ? WHERE payment_id = ?',
      [momoRequest.orderId, momoRequest.requestId, payment.payment_id]
    );

    res.status(201).json({
      success: true,
      message: 'MoMo payment created successfully',
      data: {
        payment_id: payment.payment_id,
        booking_id: booking_id,
        amount: momoAmount,
        currency: 'VND',
        momo_pay_url: momoRequest.payUrl,
        momo_qr_code: momoRequest.qrCodeUrl,
        momo_deeplink: momoRequest.deeplink,
        order_id: momoRequest.orderId,
        request_id: momoRequest.requestId
      }
    });

  } catch (error) {
    console.error('Create MoMo Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create MoMo payment',
      error: error.message
    });
  }
};

const handleMoMoCallback = async (req, res) => {
  try {
    console.log('MoMo Callback Data:', req.body);

    const callbackData = req.body;
    const verification = momoService.verifyPaymentCallback(callbackData);

    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    const payment = await Payment.findByMoMoOrderId(verification.orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const newStatus = verification.isSuccess ? 'completed' : 'failed';
    const transactionData = {
      transaction_id: verification.transactionId,
      payment_data: {
        momo_callback: callbackData,
        verification: verification
      }
    };

    await payment.updateStatus(newStatus, transactionData);

    if (verification.isSuccess) {
      const booking = await Booking.findByIdWithDetails(payment.booking_id);
      if (booking) {
        const bookingInstance = new Booking(booking);
        await bookingInstance.updateStatus('confirmed');
      }
    }

    res.json({
      success: true,
      message: verification.isSuccess ? 'Payment completed successfully' : 'Payment failed',
      data: {
        payment_id: payment.payment_id,
        booking_id: payment.booking_id,
        status: newStatus,
        transaction_id: verification.transactionId,
        amount: verification.amount
      }
    });

  } catch (error) {
    console.error('MoMo Callback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process MoMo callback',
      error: error.message
    });
  }
};

const handleMoMoIPN = async (req, res) => {
  try {
    console.log('MoMo IPN Data:', req.body);

    const ipnData = req.body;
    const ipnResult = momoService.handleIPN(ipnData);

    if (!ipnResult.success) {
      return res.status(400).json({
        RspCode: '97',
        Message: ipnResult.message
      });
    }

    const payment = await Payment.findByMoMoOrderId(ipnResult.orderId);
    if (!payment) {
      return res.status(404).json({
        RspCode: '02',
        Message: 'Payment not found'
      });
    }

    if (payment.payment_status === 'pending') {
      const newStatus = ipnResult.isPaymentSuccess ? 'completed' : 'failed';
      const transactionData = {
        transaction_id: ipnResult.transactionId,
        payment_data: {
          momo_ipn: ipnData,
          ipn_result: ipnResult
        }
      };

      await payment.updateStatus(newStatus, transactionData);

      if (ipnResult.isPaymentSuccess) {
        const booking = await Booking.findByIdWithDetails(payment.booking_id);
        if (booking && booking.booking_status === 'pending') {
          const bookingInstance = new Booking(booking);
          await bookingInstance.updateStatus('confirmed');
        }
      }
    }

    res.json({
      RspCode: '00',
      Message: 'Success'
    });

  } catch (error) {
    console.error('MoMo IPN Error:', error);
    res.status(500).json({
      RspCode: '99',
      Message: 'Internal server error'
    });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const customer_id = req.customer.customer_id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const booking = await Booking.findByIdWithDetails(payment.booking_id);
    if (!booking || booking.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Payment status retrieved successfully',
      data: {
        payment: payment.toJSON(),
        booking: {
          booking_id: booking.booking_id,
          room_number: booking.room_number,
          type_name: booking.type_name,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          booking_status: booking.booking_status
        }
      }
    });

  } catch (error) {
    console.error('Get Payment Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

const getCustomerPayments = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const { status, limit = 10, offset = 0 } = req.query;

    let payments = await Payment.getByCustomerId(customer_id);

    if (status) {
      payments = payments.filter(payment => payment.payment_status === status);
    }

    const totalPayments = payments.length;
    const paginatedPayments = payments.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      message: 'Customer payments retrieved successfully',
      data: {
        payments: paginatedPayments,
        pagination: {
          total: totalPayments,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalPayments
        }
      }
    });

  } catch (error) {
    console.error('Get Customer Payments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer payments',
      error: error.message
    });
  }
};

const queryMoMoPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const customer_id = req.customer.customer_id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const booking = await Booking.findByIdWithDetails(payment.booking_id);
    if (!booking || booking.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (payment.payment_method !== 'momo' || !payment.momo_order_id || !payment.momo_request_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MoMo payment'
      });
    }

    const queryResult = await momoService.queryPaymentStatus(
      payment.momo_order_id,
      payment.momo_request_id
    );

    if (!queryResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to query payment status',
        error: queryResult.message
      });
    }

    res.json({
      success: true,
      message: 'MoMo payment status queried successfully',
      data: {
        payment_id: payment.payment_id,
        local_status: payment.payment_status,
        momo_status: queryResult.data,
        last_updated: payment.payment_date
      }
    });

  } catch (error) {
    console.error('Query MoMo Payment Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query MoMo payment status',
      error: error.message
    });
  }
};

module.exports = {
  createMoMoPayment,
  handleMoMoCallback,
  handleMoMoIPN,
  getPaymentStatus,
  getCustomerPayments,
  queryMoMoPaymentStatus
};
