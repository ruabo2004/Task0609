const momoService = require('./momoService');
const config = require('../config/config');

class PaymentGatewayService {
  constructor() {
    this.gateways = {
      momo: momoService,
      vnpay: null, // Will be implemented
      paypal: null, // Will be implemented
      stripe: null, // Will be implemented
      bank_transfer: null // Manual bank transfer
    };
  }

  getAvailableGateways() {
    return [
      {
        id: 'momo',
        name: 'MoMo E-Wallet',
        type: 'e_wallet',
        description: 'Thanh toán qua ví điện tử MoMo',
        fees: {
          percentage: 2.5,
          fixed: 0
        },
        supported_currencies: ['VND'],
        min_amount: 10000,
        max_amount: 50000000,
        processing_time: 'instant',
        icon: '/icons/momo.png',
        is_active: true
      },
      {
        id: 'vnpay',
        name: 'VNPay Gateway',
        type: 'gateway',
        description: 'Thanh toán qua thẻ ATM, Visa, MasterCard',
        fees: {
          percentage: 1.8,
          fixed: 0
        },
        supported_currencies: ['VND'],
        min_amount: 10000,
        max_amount: 100000000,
        processing_time: 'instant',
        icon: '/icons/vnpay.png',
        is_active: false // Not implemented yet
      },
      {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        type: 'bank_transfer',
        description: 'Chuyển khoản trực tiếp qua ngân hàng',
        fees: {
          percentage: 0,
          fixed: 0
        },
        supported_currencies: ['VND'],
        min_amount: 10000,
        max_amount: 1000000000,
        processing_time: '1-3 business days',
        icon: '/icons/bank.png',
        is_active: true
      },
      {
        id: 'cash',
        name: 'Tiền mặt',
        type: 'cash',
        description: 'Thanh toán bằng tiền mặt tại chỗ',
        fees: {
          percentage: 0,
          fixed: 0
        },
        supported_currencies: ['VND'],
        min_amount: 0,
        max_amount: 50000000,
        processing_time: 'on_checkin',
        icon: '/icons/cash.png',
        is_active: true
      }
    ];
  }

  getGatewayById(gatewayId) {
    const gateways = this.getAvailableGateways();
    return gateways.find(gateway => gateway.id === gatewayId);
  }

  validatePaymentAmount(gatewayId, amount) {
    const gateway = this.getGatewayById(gatewayId);
    if (!gateway) {
      throw new Error(`Gateway ${gatewayId} not found`);
    }

    if (!gateway.is_active) {
      throw new Error(`Gateway ${gatewayId} is not active`);
    }

    if (amount < gateway.min_amount) {
      throw new Error(`Amount ${amount} is below minimum ${gateway.min_amount} for ${gateway.name}`);
    }

    if (amount > gateway.max_amount) {
      throw new Error(`Amount ${amount} exceeds maximum ${gateway.max_amount} for ${gateway.name}`);
    }

    return true;
  }

  calculateFees(gatewayId, amount) {
    const gateway = this.getGatewayById(gatewayId);
    if (!gateway) {
      throw new Error(`Gateway ${gatewayId} not found`);
    }

    const percentageFee = (amount * gateway.fees.percentage) / 100;
    const fixedFee = gateway.fees.fixed;
    const totalFee = percentageFee + fixedFee;

    return {
      amount,
      percentage_fee: percentageFee,
      fixed_fee: fixedFee,
      total_fee: totalFee,
      net_amount: amount - totalFee,
      fee_rate: gateway.fees.percentage
    };
  }

  async createPayment(gatewayId, paymentData) {
    this.validatePaymentAmount(gatewayId, paymentData.amount);

    const gateway = this.gateways[gatewayId];
    if (!gateway) {
      throw new Error(`Gateway service for ${gatewayId} not implemented`);
    }

    switch (gatewayId) {
      case 'momo':
        return await this.createMoMoPayment(paymentData);
      
      case 'bank_transfer':
        return await this.createBankTransferPayment(paymentData);
      
      case 'cash':
        return await this.createCashPayment(paymentData);
      
      default:
        throw new Error(`Payment creation not implemented for ${gatewayId}`);
    }
  }

  async createMoMoPayment(paymentData) {
    const {
      orderId,
      amount,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData
    } = paymentData;

    try {
      const momoResponse = await momoService.createMoMoPaymentRequest(
        orderId,
        amount,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData
      );

      return {
        success: true,
        payment_method: 'momo',
        provider: 'momo',
        gateway_response: momoResponse,
        payment_url: momoResponse.payUrl,
        qr_code_url: momoResponse.qrCodeUrl,
        deep_link: momoResponse.deeplink,
        transaction_id: momoResponse.transId,
        processing_fee: this.calculateFees('momo', amount).total_fee
      };
    } catch (error) {
      throw new Error(`MoMo payment creation failed: ${error.message}`);
    }
  }

  async createBankTransferPayment(paymentData) {
    const { orderId, amount, customerInfo } = paymentData;

    const bankInfo = {
      bank_name: 'Vietcombank',
      account_number: '1234567890',
      account_name: 'HOMESTAY MANAGEMENT SYSTEM',
      branch: 'Chi nhánh TP.HCM',
      transfer_content: `Thanh toan don hang ${orderId}`,
      amount: amount,
      qr_code: `https://api.vietqr.io/v2/generate/970436/1234567890/${amount}/${orderId}/vietqr_net_2.jpg`
    };

    return {
      success: true,
      payment_method: 'bank_transfer',
      provider: 'manual',
      bank_info: bankInfo,
      instructions: [
        'Chuyển khoản theo thông tin tài khoản bên dưới',
        'Ghi chính xác nội dung chuyển khoản',
        'Thanh toán sẽ được xác nhận trong 1-3 ngày làm việc',
        'Liên hệ hotline nếu cần hỗ trợ'
      ],
      processing_fee: 0,
      estimated_completion: '1-3 business days'
    };
  }

  async createCashPayment(paymentData) {
    const { orderId, amount } = paymentData;

    return {
      success: true,
      payment_method: 'cash',
      provider: 'manual',
      instructions: [
        'Thanh toán bằng tiền mặt khi check-in',
        'Vui lòng chuẩn bị đúng số tiền',
        'Sẽ được nhận hóa đơn khi thanh toán',
        'Liên hệ lễ tân nếu cần hỗ trợ'
      ],
      amount: amount,
      processing_fee: 0,
      payment_time: 'on_checkin'
    };
  }

  async verifyPayment(gatewayId, verificationData) {
    const gateway = this.gateways[gatewayId];
    if (!gateway) {
      throw new Error(`Gateway service for ${gatewayId} not implemented`);
    }

    switch (gatewayId) {
      case 'momo':
        return await this.verifyMoMoPayment(verificationData);
      
      default:
        throw new Error(`Payment verification not implemented for ${gatewayId}`);
    }
  }

  async verifyMoMoPayment(verificationData) {
    try {
      const isValid = await momoService.handleMoMoIpn(verificationData);
      return {
        is_valid: isValid,
        transaction_status: verificationData.resultCode === 0 ? 'completed' : 'failed',
        gateway_transaction_id: verificationData.transId,
        failure_reason: verificationData.resultCode !== 0 ? verificationData.message : null
      };
    } catch (error) {
      throw new Error(`MoMo payment verification failed: ${error.message}`);
    }
  }

  async queryPaymentStatus(gatewayId, queryData) {
    const gateway = this.gateways[gatewayId];
    if (!gateway) {
      throw new Error(`Gateway service for ${gatewayId} not implemented`);
    }

    switch (gatewayId) {
      case 'momo':
        return await this.queryMoMoPaymentStatus(queryData);
      
      default:
        throw new Error(`Payment status query not implemented for ${gatewayId}`);
    }
  }

  async queryMoMoPaymentStatus(queryData) {
    try {
      const { orderId, requestId } = queryData;
      const statusResponse = await momoService.queryMoMoPaymentStatus(orderId, requestId);
      
      return {
        transaction_status: statusResponse.resultCode === 0 ? 'completed' : 'failed',
        amount: statusResponse.amount,
        gateway_transaction_id: statusResponse.transId,
        gateway_response: statusResponse,
        failure_reason: statusResponse.resultCode !== 0 ? statusResponse.message : null
      };
    } catch (error) {
      throw new Error(`MoMo status query failed: ${error.message}`);
    }
  }

  async processRefund(gatewayId, refundData) {
    const gateway = this.gateways[gatewayId];
    if (!gateway) {
      throw new Error(`Gateway service for ${gatewayId} not implemented`);
    }

    switch (gatewayId) {
      case 'momo':
        return await this.processMoMoRefund(refundData);
      
      case 'bank_transfer':
      case 'cash':
        return await this.processManualRefund(gatewayId, refundData);
      
      default:
        throw new Error(`Refund processing not implemented for ${gatewayId}`);
    }
  }

  async processMoMoRefund(refundData) {
    // MoMo refund implementation would go here
    // For now, return manual refund process
    return {
      success: false,
      refund_method: 'manual',
      message: 'MoMo refunds require manual processing. Customer service will contact you within 24 hours.',
      estimated_time: '1-3 business days',
      contact_info: {
        phone: '1900-xxxx',
        email: 'support@homestay.com'
      }
    };
  }

  async processManualRefund(gatewayId, refundData) {
    const { amount, reason } = refundData;
    
    return {
      success: true,
      refund_method: 'manual',
      amount: amount,
      reason: reason,
      message: `Refund of ${amount} VND will be processed manually. Customer service will contact you within 24 hours.`,
      estimated_time: '3-5 business days',
      contact_info: {
        phone: '1900-xxxx',
        email: 'support@homestay.com'
      }
    };
  }

  getPaymentMethodDisplay(methodType, provider) {
    const displays = {
      'momo': { name: 'Ví MoMo', icon: '💳', color: '#d82d8b' },
      'vnpay': { name: 'VNPay', icon: '💳', color: '#1f4e79' },
      'bank_transfer': { name: 'Chuyển khoản', icon: '🏦', color: '#2563eb' },
      'cash': { name: 'Tiền mặt', icon: '💵', color: '#059669' },
      'paypal': { name: 'PayPal', icon: '💰', color: '#0070ba' },
      'stripe': { name: 'Thẻ tín dụng', icon: '💳', color: '#6772e5' }
    };

    return displays[methodType] || { name: methodType, icon: '💳', color: '#6b7280' };
  }

  validatePaymentMethod(methodType, accountInfo) {
    const validators = {
      'momo': this.validateMoMoAccount,
      'bank_transfer': this.validateBankAccount,
      'cash': () => true, // No validation needed for cash
    };

    const validator = validators[methodType];
    if (!validator) {
      throw new Error(`Validation not implemented for payment method: ${methodType}`);
    }

    return validator(accountInfo);
  }

  validateMoMoAccount(accountInfo) {
    const { phone } = accountInfo;
    
    if (!phone) {
      throw new Error('Phone number is required for MoMo');
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number format');
    }

    return true;
  }

  validateBankAccount(accountInfo) {
    const { bank_code, account_number, account_name } = accountInfo;
    
    if (!bank_code || !account_number || !account_name) {
      throw new Error('Bank code, account number, and account name are required');
    }

    if (account_number.length < 6 || account_number.length > 20) {
      throw new Error('Account number must be between 6 and 20 digits');
    }

    return true;
  }
}

module.exports = new PaymentGatewayService();


