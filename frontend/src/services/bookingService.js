import api from "./api";

class BookingService {
  // ==========================================
  // BOOKING MANAGEMENT
  // ==========================================

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking information
   * @returns {Promise} API response
   */
  async createBooking(bookingData) {
    try {
      const response = await api.post("/bookings", bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking by ID
   * @param {number} bookingId - Booking ID
   * @returns {Promise} API response
   */
  async getBookingById(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all bookings for current user
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getUserBookings(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sort_by = "created_at",
        sort_order = "desc",
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by,
        sort_order,
      });

      if (status) {
        queryParams.append("status", status);
      }

      const response = await api.get(`/bookings/my?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update booking status
   * @param {number} bookingId - Booking ID
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   * @returns {Promise} API response
   */
  async updateBookingStatus(bookingId, status, notes = "") {
    try {
      const response = await api.put(`/bookings/${bookingId}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a booking
   * @param {number} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} API response
   */
  async cancelBooking(bookingId, reason = "") {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`, {
        cancellation_reason: reason,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // AVAILABILITY & PRICING
  // ==========================================

  /**
   * Check room availability
   * @param {Object} params - Check parameters
   * @returns {Promise} API response
   */
  async checkAvailability(params) {
    try {
      const { room_id, check_in_date, check_out_date, guests = 1 } = params;

      const queryParams = new URLSearchParams({
        room_id: room_id.toString(),
        check_in_date,
        check_out_date,
        guests: guests.toString(),
      });

      const response = await api.get(`/bookings/availability?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking price calculation
   * @param {Object} params - Price calculation parameters
   * @returns {Promise} API response
   */
  async calculatePrice(params) {
    try {
      const response = await api.post("/bookings/calculate-price", params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available time slots for a room
   * @param {Object} params - Time slot parameters
   * @returns {Promise} API response
   */
  async getAvailableTimeSlots(params) {
    try {
      const { room_id, date, duration_hours = 1 } = params;

      const queryParams = new URLSearchParams({
        room_id: room_id.toString(),
        date,
        duration_hours: duration_hours.toString(),
      });

      const response = await api.get(`/bookings/time-slots?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // BOOKING MODIFICATIONS
  // ==========================================

  /**
   * Modify booking dates
   * @param {number} bookingId - Booking ID
   * @param {Object} newDates - New check-in and check-out dates
   * @returns {Promise} API response
   */
  async modifyBookingDates(bookingId, newDates) {
    try {
      const response = await api.put(`/bookings/${bookingId}/dates`, newDates);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add guests to booking
   * @param {number} bookingId - Booking ID
   * @param {Array} guests - Guest information array
   * @returns {Promise} API response
   */
  async addGuestsToBooking(bookingId, guests) {
    try {
      const response = await api.post(`/bookings/${bookingId}/guests`, {
        guests,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update guest information
   * @param {number} bookingId - Booking ID
   * @param {number} guestId - Guest ID
   * @param {Object} guestData - Updated guest data
   * @returns {Promise} API response
   */
  async updateGuestInfo(bookingId, guestId, guestData) {
    try {
      const response = await api.put(
        `/bookings/${bookingId}/guests/${guestId}`,
        guestData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // BOOKING EXTRAS & SERVICES
  // ==========================================

  /**
   * Add extra services to booking
   * @param {number} bookingId - Booking ID
   * @param {Array} services - Array of service IDs and quantities
   * @returns {Promise} API response
   */
  async addExtraServices(bookingId, services) {
    try {
      const response = await api.post(`/bookings/${bookingId}/services`, {
        services,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available extra services
   * @param {number} roomId - Room ID (optional)
   * @returns {Promise} API response
   */
  async getExtraServices(roomId = null) {
    try {
      const url = roomId ? `/services?room_id=${roomId}` : "/services";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // BOOKING REVIEWS & FEEDBACK
  // ==========================================

  /**
   * Submit booking review
   * @param {number} bookingId - Booking ID
   * @param {Object} reviewData - Review data
   * @returns {Promise} API response
   */
  async submitReview(bookingId, reviewData) {
    try {
      const response = await api.post(
        `/bookings/${bookingId}/review`,
        reviewData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking review
   * @param {number} bookingId - Booking ID
   * @returns {Promise} API response
   */
  async getBookingReview(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}/review`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // BOOKING DOCUMENTS & RECEIPTS
  // ==========================================

  /**
   * Get booking receipt/invoice
   * @param {number} bookingId - Booking ID
   * @param {string} format - Receipt format (pdf, html)
   * @returns {Promise} API response
   */
  async getBookingReceipt(bookingId, format = "pdf") {
    try {
      const response = await api.get(`/bookings/${bookingId}/receipt`, {
        params: { format },
        responseType: format === "pdf" ? "blob" : "json",
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking confirmation details
   * @param {string} confirmationCode - Booking confirmation code
   * @returns {Promise} API response
   */
  async getBookingByConfirmation(confirmationCode) {
    try {
      const response = await api.get(
        `/bookings/confirmation/${confirmationCode}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // BOOKING STATISTICS
  // ==========================================

  /**
   * Get user booking statistics
   * @param {Object} params - Statistics parameters
   * @returns {Promise} API response
   */
  async getBookingStats(params = {}) {
    try {
      const { start_date, end_date, group_by = "month" } = params;

      const queryParams = new URLSearchParams({
        group_by,
      });

      if (start_date) queryParams.append("start_date", start_date);
      if (end_date) queryParams.append("end_date", end_date);

      const response = await api.get(`/bookings/stats?${queryParams}`);
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
          return new Error(data.message || "Dữ liệu booking không hợp lệ");
        case 401:
          return new Error("Vui lòng đăng nhập để đặt phòng");
        case 403:
          return new Error("Bạn không có quyền thực hiện thao tác này");
        case 404:
          return new Error("Không tìm thấy booking");
        case 409:
          return new Error("Phòng đã được đặt trong thời gian này");
        case 422:
          return new Error(data.message || "Thông tin booking không hợp lệ");
        case 500:
          return new Error("Lỗi server. Vui lòng thử lại sau");
        default:
          return new Error(data.message || "Có lỗi xảy ra khi xử lý booking");
      }
    } else if (error.request) {
      return new Error("Không thể kết nối đến server");
    } else {
      return new Error(error.message || "Có lỗi không xác định xảy ra");
    }
  }
}

export default new BookingService();


