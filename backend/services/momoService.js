const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class MoMoService {
  constructor() {
    this.partnerCode = config.momo.partnerCode;
    this.accessKey = config.momo.accessKey;
    this.secretKey = config.momo.secretKey;
    this.endpoint = config.momo.endpoint;
    this.redirectUrl = config.momo.redirectUrl;
    this.ipnUrl = config.momo.ipnUrl;
    this.requestType = config.momo.requestType;
    this.extraData = config.momo.extraData;
  }

  generateSignature(rawData) {
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawData)
      .digest('hex');
    return signature;
  }

  async createPaymentRequest(bookingData) {
    const {
      bookingId,
      amount,
      orderInfo,
      customerInfo = {}
    } = bookingData;

    const orderId = `HOMESTAY_${bookingId}_${Date.now()}`;
    const requestId = uuidv4();

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${this.extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${requestId}&requestType=${this.requestType}`;
    
    const signature = this.generateSignature(rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      extraData: this.extraData,
      requestType: this.requestType,
      signature: signature,
      lang: 'vi'
    };

    try {
      console.log('MoMo Payment Request:', JSON.stringify(requestBody, null, 2));
      
      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      console.log('MoMo Response:', JSON.stringify(response.data, null, 2));

      if (response.data.resultCode === 0) {
        return {
          success: true,
          payUrl: response.data.payUrl,
          orderId: orderId,
          requestId: requestId,
          qrCodeUrl: response.data.qrCodeUrl,
          deeplink: response.data.deeplink,
          deeplinkMiniApp: response.data.deeplinkMiniApp
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Payment request failed',
          resultCode: response.data.resultCode
        };
      }
    } catch (error) {
      console.error('MoMo API Error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to connect to MoMo payment gateway',
        error: error.message
      };
    }
  }

  verifyPaymentCallback(callbackData) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = callbackData;

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = this.generateSignature(rawSignature);

    return {
      isValid: signature === expectedSignature,
      resultCode: parseInt(resultCode),
      isSuccess: parseInt(resultCode) === 0,
      transactionId: transId,
      orderId: orderId,
      amount: parseInt(amount),
      message: message
    };
  }

  handleIPN(ipnData) {
    const verification = this.verifyPaymentCallback(ipnData);
    
    if (!verification.isValid) {
      return {
        success: false,
        message: 'Invalid signature'
      };
    }

    return {
      success: true,
      isPaymentSuccess: verification.isSuccess,
      transactionId: verification.transactionId,
      orderId: verification.orderId,
      amount: verification.amount,
      resultCode: verification.resultCode,
      message: verification.message
    };
  }

  async queryPaymentStatus(orderId, requestId) {
    const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}`;
    const signature = this.generateSignature(rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: 'vi'
    };

    try {
      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/query',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('MoMo Query Error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to query payment status',
        error: error.message
      };
    }
  }

  formatAmount(amount) {
    return Math.round(parseFloat(amount));
  }

  extractBookingIdFromOrderId(orderId) {
    const parts = orderId.split('_');
    if (parts.length >= 3 && parts[0] === 'HOMESTAY') {
      return parseInt(parts[1]);
    }
    return null;
  }
}

module.exports = new MoMoService();
