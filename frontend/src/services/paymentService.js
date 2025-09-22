import api from "./api";

class PaymentService {
  // ==========================================
  // PAYMENT PROCESSING
  // ==========================================

  /**
   * Process payment for booking
   * @param {Object} paymentData - Payment information
   * @returns {Promise} API response
   */
  async processPayment(paymentData) {
    try {
      const response = await api.post("/payments/process", paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create payment intent (for Stripe, etc.)
   * @param {Object} intentData - Payment intent data
   * @returns {Promise} API response
   */
  async createPaymentIntent(intentData) {
    try {
      const response = await api.post("/payments/create-intent", intentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm payment
   * @param {string} paymentIntentId - Payment intent ID
   * @param {Object} confirmData - Confirmation data
   * @returns {Promise} API response
   */
  async confirmPayment(paymentIntentId, confirmData = {}) {
    try {
      const response = await api.post(
        `/payments/confirm/${paymentIntentId}`,
        confirmData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // PAYMENT METHODS
  // ==========================================

  /**
   * Get available payment methods
   * @returns {Promise} API response
   */
  async getPaymentMethods() {
    try {
      const response = await api.get("/payments/methods");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Save payment method for user
   * @param {Object} methodData - Payment method data
   * @returns {Promise} API response
   */
  async savePaymentMethod(methodData) {
    try {
      const response = await api.post("/payments/methods", methodData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's saved payment methods
   * @returns {Promise} API response
   */
  async getUserPaymentMethods() {
    try {
      const response = await api.get("/payments/methods/user");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete saved payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise} API response
   */
  async deletePaymentMethod(methodId) {
    try {
      const response = await api.delete(`/payments/methods/${methodId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // PAYMENT HISTORY & TRANSACTIONS
  // ==========================================

  /**
   * Get payment history for user
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getPaymentHistory(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        start_date,
        end_date,
        status,
        booking_id,
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (start_date) queryParams.append("start_date", start_date);
      if (end_date) queryParams.append("end_date", end_date);
      if (status) queryParams.append("status", status);
      if (booking_id) queryParams.append("booking_id", booking_id.toString());

      const response = await api.get(`/payments/history?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment details by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise} API response
   */
  async getPaymentById(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment receipt
   * @param {string} paymentId - Payment ID
   * @param {string} format - Receipt format (pdf, html)
   * @returns {Promise} API response
   */
  async getPaymentReceipt(paymentId, format = "pdf") {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`, {
        params: { format },
        responseType: format === "pdf" ? "blob" : "json",
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // REFUNDS & CANCELLATIONS
  // ==========================================

  /**
   * Process refund
   * @param {Object} refundData - Refund information
   * @returns {Promise} API response
   */
  async processRefund(refundData) {
    try {
      const response = await api.post("/payments/refund", refundData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get refund status
   * @param {string} refundId - Refund ID
   * @returns {Promise} API response
   */
  async getRefundStatus(refundId) {
    try {
      const response = await api.get(`/payments/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel payment
   * @param {string} paymentId - Payment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} API response
   */
  async cancelPayment(paymentId, reason = "") {
    try {
      const response = await api.post(`/payments/${paymentId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // PAYMENT VALIDATION & SECURITY
  // ==========================================

  /**
   * Validate payment card
   * @param {Object} cardData - Card information
   * @returns {Promise} API response
   */
  async validateCard(cardData) {
    try {
      const response = await api.post("/payments/validate-card", cardData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify payment security code
   * @param {Object} verificationData - Verification data
   * @returns {Promise} API response
   */
  async verifySecurityCode(verificationData) {
    try {
      const response = await api.post(
        "/payments/verify-security",
        verificationData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // PAYMENT ANALYTICS
  // ==========================================

  /**
   * Get payment statistics for user
   * @param {Object} params - Statistics parameters
   * @returns {Promise} API response
   */
  async getPaymentStats(params = {}) {
    try {
      const { start_date, end_date, group_by = "month" } = params;

      const queryParams = new URLSearchParams({
        group_by,
      });

      if (start_date) queryParams.append("start_date", start_date);
      if (end_date) queryParams.append("end_date", end_date);

      const response = await api.get(`/payments/stats?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // PROMOTIONAL & DISCOUNT CODES
  // ==========================================

  /**
   * Apply discount code
   * @param {Object} discountData - Discount code and booking info
   * @returns {Promise} API response
   */
  async applyDiscountCode(discountData) {
    try {
      const response = await api.post("/payments/apply-discount", discountData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate discount code
   * @param {string} code - Discount code
   * @param {Object} bookingData - Booking information
   * @returns {Promise} API response
   */
  async validateDiscountCode(code, bookingData = {}) {
    try {
      const response = await api.post("/payments/validate-discount", {
        code,
        ...bookingData,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove discount code
   * @param {string} bookingId - Booking ID
   * @returns {Promise} API response
   */
  async removeDiscountCode(bookingId) {
    try {
      const response = await api.delete(`/payments/discount/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // PAYMENT NOTIFICATIONS
  // ==========================================

  /**
   * Get payment notifications
   * @returns {Promise} API response
   */
  async getPaymentNotifications() {
    try {
      const response = await api.get("/payments/notifications");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark payment notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} API response
   */
  async markNotificationRead(notificationId) {
    try {
      const response = await api.put(
        `/payments/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // PAYMENT WEBHOOKS & CALLBACKS
  // ==========================================

  /**
   * Handle payment webhook
   * @param {Object} webhookData - Webhook payload
   * @returns {Promise} API response
   */
  async handlePaymentWebhook(webhookData) {
    try {
      const response = await api.post("/payments/webhook", webhookData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} Processed error
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return new Error(data.message || "Thông tin thanh toán không hợp lệ");
        case 401:
          return new Error("Vui lòng đăng nhập để thực hiện thanh toán");
        case 402:
          return new Error(
            "Thanh toán không thành công. Vui lòng kiểm tra thông tin thẻ"
          );
        case 403:
          return new Error("Bạn không có quyền thực hiện giao dịch này");
        case 404:
          return new Error("Không tìm thấy thông tin thanh toán");
        case 409:
          return new Error("Giao dịch đã được xử lý trước đó");
        case 422:
          return new Error(data.message || "Dữ liệu thanh toán không hợp lệ");
        case 429:
          return new Error(
            "Quá nhiều yêu cầu thanh toán. Vui lòng thử lại sau"
          );
        case 500:
          return new Error("Lỗi hệ thống thanh toán. Vui lòng thử lại sau");
        case 502:
          return new Error("Lỗi kết nối với cổng thanh toán");
        case 503:
          return new Error("Hệ thống thanh toán đang bảo trì");
        default:
          return new Error(
            data.message || "Có lỗi xảy ra khi xử lý thanh toán"
          );
      }
    } else if (error.request) {
      return new Error("Không thể kết nối đến hệ thống thanh toán");
    } else {
      return new Error(error.message || "Có lỗi không xác định xảy ra");
    }
  }
}

export default new PaymentService();


