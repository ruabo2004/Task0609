const { pool } = require('../config/database');

class Payment {
  constructor(data) {
    this.payment_id = data.payment_id;
    this.booking_id = data.booking_id;
    this.payment_method = data.payment_method;
    this.amount = data.amount;
    this.payment_status = data.payment_status;
    this.transaction_id = data.transaction_id;
    this.payment_date = data.payment_date;
    this.momo_order_id = data.momo_order_id;
    this.momo_request_id = data.momo_request_id;
    this.payment_data = data.payment_data;
  }

  static async create(paymentData) {
    const {
      booking_id,
      payment_method,
      amount,
      payment_status = 'pending',
      transaction_id = null,
      momo_order_id = null,
      momo_request_id = null,
      payment_data = null
    } = paymentData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO payments (booking_id, payment_method, amount, payment_status, transaction_id, momo_order_id, momo_request_id, payment_data) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [booking_id, payment_method, amount, payment_status, transaction_id, momo_order_id, momo_request_id, JSON.stringify(payment_data)]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating payment: ${error.message}`);
    }
  }

  static async findById(payment_id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM payments WHERE payment_id = ?',
        [payment_id]
      );

      if (rows.length === 0) return null;

      const payment = rows[0];
      if (payment.payment_data) {
        payment.payment_data = JSON.parse(payment.payment_data);
      }

      return new Payment(payment);
    } catch (error) {
      throw new Error(`Error finding payment: ${error.message}`);
    }
  }

  static async findByBookingId(booking_id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM payments WHERE booking_id = ? ORDER BY payment_date DESC',
        [booking_id]
      );

      return rows.map(payment => {
        if (payment.payment_data) {
          payment.payment_data = JSON.parse(payment.payment_data);
        }
        return new Payment(payment);
      });
    } catch (error) {
      throw new Error(`Error finding payments by booking: ${error.message}`);
    }
  }

  static async findByMoMoOrderId(momo_order_id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM payments WHERE momo_order_id = ?',
        [momo_order_id]
      );

      if (rows.length === 0) return null;

      const payment = rows[0];
      if (payment.payment_data) {
        payment.payment_data = JSON.parse(payment.payment_data);
      }

      return new Payment(payment);
    } catch (error) {
      throw new Error(`Error finding payment by MoMo order ID: ${error.message}`);
    }
  }

  async updateStatus(status, transactionData = {}) {
    try {
      const { transaction_id, payment_data } = transactionData;

      await pool.execute(
        `UPDATE payments 
         SET payment_status = ?, 
             transaction_id = COALESCE(?, transaction_id),
             payment_data = COALESCE(?, payment_data),
             payment_date = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE payment_date END
         WHERE payment_id = ?`,
        [status, transaction_id, JSON.stringify(payment_data), status, this.payment_id]
      );

      return await Payment.findById(this.payment_id);
    } catch (error) {
      throw new Error(`Error updating payment status: ${error.message}`);
    }
  }

  static async getByCustomerId(customer_id) {
    try {
      const [rows] = await pool.execute(
        `SELECT p.*, b.customer_id, b.check_in_date, b.check_out_date, r.room_number, rt.type_name
         FROM payments p
         JOIN bookings b ON p.booking_id = b.booking_id
         JOIN rooms r ON b.room_id = r.room_id
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE b.customer_id = ?
         ORDER BY p.payment_date DESC`,
        [customer_id]
      );

      return rows.map(payment => {
        if (payment.payment_data) {
          payment.payment_data = JSON.parse(payment.payment_data);
        }
        return payment;
      });
    } catch (error) {
      throw new Error(`Error getting payments by customer: ${error.message}`);
    }
  }

  static async getPaymentStats(dateFrom = null, dateTo = null) {
    try {
      let query = `
        SELECT 
          payment_method,
          payment_status,
          COUNT(*) as payment_count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount
        FROM payments
      `;
      
      const params = [];
      
      if (dateFrom && dateTo) {
        query += ' WHERE DATE(payment_date) BETWEEN ? AND ?';
        params.push(dateFrom, dateTo);
      }
      
      query += ' GROUP BY payment_method, payment_status ORDER BY payment_method, payment_status';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting payment statistics: ${error.message}`);
    }
  }

  isCompleted() {
    return this.payment_status === 'completed';
  }

  isPending() {
    return this.payment_status === 'pending';
  }

  isFailed() {
    return this.payment_status === 'failed';
  }

  getFormattedAmount() {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(this.amount);
  }

  toJSON() {
    return {
      payment_id: this.payment_id,
      booking_id: this.booking_id,
      payment_method: this.payment_method,
      amount: this.amount,
      payment_status: this.payment_status,
      transaction_id: this.transaction_id,
      payment_date: this.payment_date,
      momo_order_id: this.momo_order_id,
      momo_request_id: this.momo_request_id,
      payment_data: this.payment_data,
      formatted_amount: this.getFormattedAmount()
    };
  }
}

module.exports = Payment;
