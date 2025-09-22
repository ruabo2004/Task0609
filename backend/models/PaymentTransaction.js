const { pool } = require('../config/database');

class PaymentTransaction {
  constructor(data) {
    this.transaction_id = data.transaction_id;
    this.payment_id = data.payment_id;
    this.booking_id = data.booking_id;
    this.customer_id = data.customer_id;
    this.transaction_type = data.transaction_type;
    this.payment_method = data.payment_method;
    this.provider = data.provider;
    this.amount = data.amount;
    this.currency = data.currency;
    this.status = data.status;
    this.gateway_transaction_id = data.gateway_transaction_id;
    this.gateway_reference = data.gateway_reference;
    this.gateway_response = data.gateway_response;
    this.failure_reason = data.failure_reason;
    this.processing_fee = data.processing_fee;
    this.net_amount = data.net_amount;
    this.exchange_rate = data.exchange_rate;
    this.initiated_at = data.initiated_at;
    this.completed_at = data.completed_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(transactionData) {
    try {
      const {
        paymentId,
        bookingId,
        customerId,
        transactionType = 'payment',
        paymentMethod,
        provider,
        amount,
        currency = 'VND',
        gatewayTransactionId = null,
        gatewayReference = null,
        processingFee = 0,
        exchangeRate = 1
      } = transactionData;

      const netAmount = amount - processingFee;

      const [result] = await pool.execute(
        `INSERT INTO payment_transactions 
         (payment_id, booking_id, customer_id, transaction_type, payment_method, provider, 
          amount, currency, status, gateway_transaction_id, gateway_reference, 
          processing_fee, net_amount, exchange_rate, initiated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, NOW())`,
        [
          paymentId, bookingId, customerId, transactionType, paymentMethod, provider,
          amount, currency, gatewayTransactionId, gatewayReference,
          processingFee, netAmount, exchangeRate
        ]
      );

      const [rows] = await pool.execute(
        'SELECT * FROM payment_transactions WHERE transaction_id = ?',
        [result.insertId]
      );

      return new PaymentTransaction(rows[0]);
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  static async updateStatus(transactionId, status, gatewayResponse = null, failureReason = null) {
    try {
      let query = 'UPDATE payment_transactions SET status = ?, updated_at = NOW()';
      const params = [status];

      if (status === 'completed') {
        query += ', completed_at = NOW()';
      }

      if (gatewayResponse) {
        query += ', gateway_response = ?';
        params.push(JSON.stringify(gatewayResponse));
      }

      if (failureReason) {
        query += ', failure_reason = ?';
        params.push(failureReason);
      }

      query += ' WHERE transaction_id = ?';
      params.push(transactionId);

      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating transaction status: ${error.message}`);
    }
  }

  static async findById(transactionId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM payment_transactions WHERE transaction_id = ?',
        [transactionId]
      );
      return rows.length > 0 ? new PaymentTransaction(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error fetching transaction: ${error.message}`);
    }
  }

  static async findByPaymentId(paymentId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM payment_transactions WHERE payment_id = ? ORDER BY created_at DESC',
        [paymentId]
      );
      return rows.map(row => new PaymentTransaction(row));
    } catch (error) {
      throw new Error(`Error fetching transactions by payment: ${error.message}`);
    }
  }

  static async findByCustomerId(customerId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        transactionType = null,
        dateFrom = null,
        dateTo = null
      } = options;

      let query = `
        SELECT pt.*, p.booking_id, b.booking_code, b.room_name
        FROM payment_transactions pt
        LEFT JOIN payments p ON pt.payment_id = p.payment_id
        LEFT JOIN bookings b ON pt.booking_id = b.booking_id
        WHERE pt.customer_id = ?
      `;
      const params = [customerId];

      if (status) {
        query += ' AND pt.status = ?';
        params.push(status);
      }

      if (transactionType) {
        query += ' AND pt.transaction_type = ?';
        params.push(transactionType);
      }

      if (dateFrom) {
        query += ' AND pt.created_at >= ?';
        params.push(dateFrom);
      }

      if (dateTo) {
        query += ' AND pt.created_at <= ?';
        params.push(dateTo);
      }

      const countQuery = query.replace(
        'SELECT pt.*, p.booking_id, b.booking_code, b.room_name', 
        'SELECT COUNT(*) as total'
      );
      const [countResult] = await pool.execute(countQuery, params);
      const total = countResult[0].total;

      query += ' ORDER BY pt.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);

      const [rows] = await pool.execute(query, params);

      return {
        transactions: rows.map(row => new PaymentTransaction(row)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching customer transactions: ${error.message}`);
    }
  }

  static async getTransactionStats(customerId = null, timeframe = '30d') {
    try {
      let dateCondition = '';
      let params = [];

      if (timeframe === '7d') {
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (timeframe === '30d') {
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      } else if (timeframe === '90d') {
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
      }

      let customerCondition = '';
      if (customerId) {
        customerCondition = 'AND customer_id = ?';
        params.push(customerId);
      }

      const [statsRows] = await pool.execute(
        `SELECT 
           COUNT(*) as total_transactions,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_transactions,
           COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
           COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
           COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as total_amount,
           COALESCE(SUM(CASE WHEN status = 'completed' THEN processing_fee END), 0) as total_fees,
           COALESCE(AVG(CASE WHEN status = 'completed' THEN amount END), 0) as avg_transaction_amount,
           COUNT(DISTINCT customer_id) as unique_customers,
           COUNT(DISTINCT payment_method) as payment_methods_used
         FROM payment_transactions 
         WHERE 1=1 ${dateCondition} ${customerCondition}`,
        params
      );

      const [methodStats] = await pool.execute(
        `SELECT 
           payment_method,
           provider,
           COUNT(*) as transaction_count,
           COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as total_amount,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_count,
           (COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*) * 100) as success_rate
         FROM payment_transactions 
         WHERE 1=1 ${dateCondition} ${customerCondition}
         GROUP BY payment_method, provider
         ORDER BY transaction_count DESC`,
        params
      );

      const [dailyStats] = await pool.execute(
        `SELECT 
           DATE(created_at) as transaction_date,
           COUNT(*) as transaction_count,
           COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as daily_amount,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_count
         FROM payment_transactions 
         WHERE 1=1 ${dateCondition} ${customerCondition}
         GROUP BY DATE(created_at) 
         ORDER BY transaction_date DESC 
         LIMIT 30`,
        params
      );

      return {
        overview: statsRows[0],
        byPaymentMethod: methodStats,
        dailyTrends: dailyStats
      };
    } catch (error) {
      throw new Error(`Error getting transaction stats: ${error.message}`);
    }
  }

  static async createRefund(originalTransactionId, refundAmount, reason) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const originalTransaction = await PaymentTransaction.findById(originalTransactionId);
      if (!originalTransaction) {
        throw new Error('Original transaction not found');
      }

      if (originalTransaction.status !== 'completed') {
        throw new Error('Can only refund completed transactions');
      }

      if (refundAmount > originalTransaction.net_amount) {
        throw new Error('Refund amount cannot exceed original net amount');
      }

      const refundTransaction = await PaymentTransaction.create({
        paymentId: originalTransaction.payment_id,
        bookingId: originalTransaction.booking_id,
        customerId: originalTransaction.customer_id,
        transactionType: 'refund',
        paymentMethod: originalTransaction.payment_method,
        provider: originalTransaction.provider,
        amount: -refundAmount,
        currency: originalTransaction.currency,
        processingFee: 0,
        exchangeRate: originalTransaction.exchange_rate
      });

      await connection.execute(
        'INSERT INTO refunds (transaction_id, original_transaction_id, refund_amount, reason, status) VALUES (?, ?, ?, ?, ?)',
        [refundTransaction.transaction_id, originalTransactionId, refundAmount, reason, 'pending']
      );

      await connection.commit();
      return refundTransaction;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating refund: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  getGatewayResponse() {
    return this.gateway_response ? JSON.parse(this.gateway_response) : null;
  }

  isSuccessful() {
    return this.status === 'completed';
  }

  isFailed() {
    return this.status === 'failed';
  }

  isPending() {
    return this.status === 'pending';
  }

  toJSON() {
    return {
      transaction_id: this.transaction_id,
      payment_id: this.payment_id,
      booking_id: this.booking_id,
      customer_id: this.customer_id,
      transaction_type: this.transaction_type,
      payment_method: this.payment_method,
      provider: this.provider,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      gateway_transaction_id: this.gateway_transaction_id,
      gateway_reference: this.gateway_reference,
      gateway_response: this.getGatewayResponse(),
      failure_reason: this.failure_reason,
      processing_fee: this.processing_fee,
      net_amount: this.net_amount,
      exchange_rate: this.exchange_rate,
      initiated_at: this.initiated_at,
      completed_at: this.completed_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
      is_successful: this.isSuccessful(),
      is_failed: this.isFailed(),
      is_pending: this.isPending()
    };
  }
}

module.exports = PaymentTransaction;


