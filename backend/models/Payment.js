// Payment Model
// Will be implemented in Week 4

const { executeQuery, getConnection } = require("../config/database");

class Payment {
  constructor(paymentData) {
    this.id = paymentData.id;
    this.booking_id = paymentData.booking_id;
    this.amount = paymentData.amount;
    this.payment_method = paymentData.payment_method;
    this.payment_status = paymentData.payment_status;
    this.transaction_id = paymentData.transaction_id;
    this.payment_date = paymentData.payment_date;
    this.notes = paymentData.notes;
  }

  // Static methods for database operations

  // @desc    Get all payments with filters and pagination
  static async getAll(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT p.*, b.id as booking_id, b.user_id, b.total_amount as booking_amount,
               u.full_name as customer_name, u.email as customer_email,
               r.room_number, r.room_type
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE 1=1
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters
      if (filters.payment_status) {
        query += " AND p.payment_status = ?";
        countQuery += " AND p.payment_status = ?";
        queryParams.push(filters.payment_status);
      }

      if (filters.payment_method) {
        query += " AND p.payment_method = ?";
        countQuery += " AND p.payment_method = ?";
        queryParams.push(filters.payment_method);
      }

      if (filters.booking_id) {
        query += " AND p.booking_id = ?";
        countQuery += " AND p.booking_id = ?";
        queryParams.push(filters.booking_id);
      }

      if (filters.user_id) {
        query += " AND b.user_id = ?";
        countQuery += " AND b.user_id = ?";
        queryParams.push(filters.user_id);
      }

      if (filters.date_from) {
        query += " AND DATE(p.payment_date) >= ?";
        countQuery += " AND DATE(p.payment_date) >= ?";
        queryParams.push(filters.date_from);
      }

      if (filters.date_to) {
        query += " AND DATE(p.payment_date) <= ?";
        countQuery += " AND DATE(p.payment_date) <= ?";
        queryParams.push(filters.date_to);
      }

      query += ` ORDER BY p.payment_date DESC LIMIT ${limit} OFFSET ${offset}`;

      const [payments, totalResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, queryParams),
      ]);

      return {
        payments: payments.map((payment) => new Payment(payment)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find payment by ID
  static async findById(id) {
    try {
      const query = `
        SELECT p.*, b.id as booking_id, b.user_id, b.total_amount as booking_amount,
               b.check_in_date, b.check_out_date,
               u.full_name as customer_name, u.email as customer_email,
               r.room_number, r.room_type
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE p.id = ?
      `;
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new Payment(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find payment by transaction ID
  static async findByTransactionId(transactionId) {
    try {
      const query = "SELECT * FROM payments WHERE transaction_id = ?";
      const results = await executeQuery(query, [transactionId]);
      return results.length > 0 ? new Payment(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get payments by booking ID
  static async findByBookingId(bookingId) {
    try {
      const query = `
        SELECT p.*, b.total_amount as booking_amount
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE p.booking_id = ?
        ORDER BY p.payment_date DESC
      `;
      const results = await executeQuery(query, [bookingId]);
      return results.map((payment) => new Payment(payment));
    } catch (error) {
      throw error;
    }
  }

  // @desc    Create new payment
  static async create(paymentData) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Validate booking exists
      const bookingQuery =
        "SELECT id, total_amount, status FROM bookings WHERE id = ?";
      const bookingResult = await connection.execute(bookingQuery, [
        paymentData.booking_id,
      ]);

      if (bookingResult[0].length === 0) {
        throw new Error("Booking not found");
      }

      const booking = bookingResult[0][0];

      // Check if booking is in valid status for payment
      // Allow payment creation for additional services even when checked_in or checked_out
      if (
        !["pending", "confirmed", "checked_in", "checked_out"].includes(
          booking.status
        )
      ) {
        throw new Error("Cannot create payment for this booking status");
      }

      // Create payment record
      const insertQuery = `
        INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const values = [
        paymentData.booking_id,
        paymentData.amount,
        paymentData.payment_method,
        paymentData.payment_status || "pending",
        paymentData.transaction_id || null,
        paymentData.notes || null,
      ];

      const result = await connection.execute(insertQuery, values);
      await connection.commit();

      return await Payment.findById(result[0].insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Get payment statistics
  static async getStatistics(filters = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_payments,
          SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_revenue,
          SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN payment_status = 'failed' THEN amount ELSE 0 END) as failed_amount,
          AVG(CASE WHEN payment_status = 'completed' THEN amount ELSE NULL END) as avg_payment_amount
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE 1=1
      `;
      const queryParams = [];

      if (filters.date_from) {
        query += " AND DATE(p.payment_date) >= ?";
        queryParams.push(filters.date_from);
      }

      if (filters.date_to) {
        query += " AND DATE(p.payment_date) <= ?";
        queryParams.push(filters.date_to);
      }

      if (filters.payment_method) {
        query += " AND p.payment_method = ?";
        queryParams.push(filters.payment_method);
      }

      const results = await executeQuery(query, queryParams);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get revenue by date range
  static async getRevenueByDateRange(startDate, endDate, groupBy = "day") {
    try {
      let dateFormat;
      switch (groupBy) {
        case "month":
          dateFormat = "%Y-%m";
          break;
        case "year":
          dateFormat = "%Y";
          break;
        default:
          dateFormat = "%Y-%m-%d";
      }

      const query = `
        SELECT 
          DATE_FORMAT(payment_date, ?) as period,
          COUNT(*) as payment_count,
          SUM(amount) as total_revenue,
          AVG(amount) as avg_payment
        FROM payments
        WHERE payment_status = 'completed'
        AND DATE(payment_date) BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(payment_date, ?)
        ORDER BY period ASC
      `;

      const results = await executeQuery(query, [
        dateFormat,
        startDate,
        endDate,
        dateFormat,
      ]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Instance methods

  // @desc    Update payment status
  async updateStatus(newStatus, transactionId = null, notes = null) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const updateFields = ["payment_status = ?"];
      const values = [newStatus];

      if (transactionId) {
        updateFields.push("transaction_id = ?");
        values.push(transactionId);
      }

      if (notes) {
        updateFields.push("notes = ?");
        values.push(notes);
      }

      if (newStatus === "completed") {
        updateFields.push("payment_date = CURRENT_TIMESTAMP");
      }

      values.push(this.id);
      const query = `UPDATE payments SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;

      await connection.execute(query, values);

      // If payment is completed, update booking status to confirmed
      if (newStatus === "completed") {
        const bookingQuery =
          "UPDATE bookings SET status = 'confirmed' WHERE id = ? AND status = 'pending'";
        await connection.execute(bookingQuery, [this.booking_id]);
      }

      await connection.commit();

      return await Payment.findById(this.id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Update payment
  async update(updateData) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const updateFields = [];
      const values = [];

      if (updateData.payment_method) {
        updateFields.push("payment_method = ?");
        values.push(updateData.payment_method);
      }

      if (updateData.payment_status) {
        updateFields.push("payment_status = ?");
        values.push(updateData.payment_status);
      }

      if (updateData.notes) {
        updateFields.push("notes = ?");
        values.push(updateData.notes);
      }

      if (updateData.payment_status === "completed") {
        updateFields.push("payment_date = CURRENT_TIMESTAMP");
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(this.id);
      const query = `UPDATE payments SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;

      await connection.execute(query, values);

      // If payment is completed, update booking status to confirmed
      if (updateData.payment_status === "completed") {
        const bookingQuery =
          "UPDATE bookings SET status = 'confirmed' WHERE id = ? AND status = 'pending'";
        await connection.execute(bookingQuery, [this.booking_id]);
      }

      await connection.commit();

      return await Payment.findById(this.id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Process refund
  async processRefund(refundAmount = null, notes = null) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Create refund payment record
      const refundQuery = `
        INSERT INTO payments (booking_id, amount, payment_method, payment_status, notes)
        VALUES (?, ?, ?, 'completed', ?)
      `;

      const refundAmountToProcess = refundAmount || this.amount;
      const refundNotes = notes || `Refund for payment ID: ${this.id}`;

      await connection.execute(refundQuery, [
        this.booking_id,
        -Math.abs(refundAmountToProcess), // Negative amount for refund
        this.payment_method,
        refundNotes,
      ]);

      // Update original payment status to refunded
      const updateQuery =
        "UPDATE payments SET payment_status = 'refunded' WHERE id = ?";
      await connection.execute(updateQuery, [this.id]);

      // Update booking status to cancelled
      const bookingQuery =
        "UPDATE bookings SET status = 'cancelled' WHERE id = ?";
      await connection.execute(bookingQuery, [this.booking_id]);

      await connection.commit();

      return await Payment.findById(this.id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Check if payment can be refunded
  canBeRefunded() {
    return this.payment_status === "completed" && this.amount > 0;
  }

  // @desc    Check if payment is successful
  isSuccessful() {
    return this.payment_status === "completed";
  }

  // @desc    Check if payment is pending
  isPending() {
    return this.payment_status === "pending";
  }

  // @desc    Check if payment failed
  isFailed() {
    return this.payment_status === "failed";
  }

  // @desc    Get formatted amount
  getFormattedAmount() {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(this.amount);
  }

  // @desc    Get payment method display name
  getPaymentMethodName() {
    const methodNames = {
      cash: "Tiền mặt",
      card: "Thẻ tín dụng",
      vnpay: "VNPay",
      momo: "MoMo",
    };
    return methodNames[this.payment_method] || this.payment_method;
  }

  // @desc    Get payment status display name
  getPaymentStatusName() {
    const statusNames = {
      pending: "Đang chờ",
      completed: "Hoàn thành",
      failed: "Thất bại",
      refunded: "Đã hoàn tiền",
    };
    return statusNames[this.payment_status] || this.payment_status;
  }

  // @desc    Get JSON representation
  toJSON() {
    return {
      ...this,
      formatted_amount: this.getFormattedAmount(),
      payment_method_name: this.getPaymentMethodName(),
      payment_status_name: this.getPaymentStatusName(),
      can_be_refunded: this.canBeRefunded(),
      is_successful: this.isSuccessful(),
      is_pending: this.isPending(),
      is_failed: this.isFailed(),
    };
  }
}

module.exports = Payment;
