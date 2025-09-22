const { pool } = require('../config/database');

class PaymentSchedule {
  constructor(data) {
    this.schedule_id = data.schedule_id;
    this.customer_id = data.customer_id;
    this.booking_id = data.booking_id;
    this.schedule_type = data.schedule_type;
    this.payment_method = data.payment_method;
    this.total_amount = data.total_amount;
    this.installment_count = data.installment_count;
    this.installment_amount = data.installment_amount;
    this.frequency = data.frequency;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.status = data.status;
    this.next_payment_date = data.next_payment_date;
    this.completed_payments = data.completed_payments;
    this.remaining_amount = data.remaining_amount;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(scheduleData) {
    try {
      const {
        customerId,
        bookingId,
        scheduleType = 'installment',
        paymentMethod,
        totalAmount,
        installmentCount,
        frequency = 'monthly',
        startDate
      } = scheduleData;

      const installmentAmount = Math.ceil(totalAmount / installmentCount);
      const endDate = this.calculateEndDate(startDate, installmentCount, frequency);

      const [result] = await pool.execute(
        `INSERT INTO payment_schedules 
         (customer_id, booking_id, schedule_type, payment_method, total_amount, 
          installment_count, installment_amount, frequency, start_date, end_date, 
          status, next_payment_date, remaining_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        [
          customerId, bookingId, scheduleType, paymentMethod, totalAmount,
          installmentCount, installmentAmount, frequency, startDate, endDate,
          startDate, totalAmount
        ]
      );

      const [rows] = await pool.execute(
        'SELECT * FROM payment_schedules WHERE schedule_id = ?',
        [result.insertId]
      );

      return new PaymentSchedule(rows[0]);
    } catch (error) {
      throw new Error(`Error creating payment schedule: ${error.message}`);
    }
  }

  static calculateEndDate(startDate, installmentCount, frequency) {
    const start = new Date(startDate);
    let months = 0;

    switch (frequency) {
      case 'weekly':
        start.setDate(start.getDate() + (installmentCount * 7));
        break;
      case 'monthly':
        months = installmentCount;
        break;
      case 'quarterly':
        months = installmentCount * 3;
        break;
      case 'yearly':
        months = installmentCount * 12;
        break;
      default:
        months = installmentCount;
    }

    if (months > 0) {
      start.setMonth(start.getMonth() + months);
    }

    return start.toISOString().split('T')[0];
  }

  static async findByCustomerId(customerId, status = null) {
    try {
      let query = `
        SELECT ps.*, b.booking_code, b.room_name
        FROM payment_schedules ps
        LEFT JOIN bookings b ON ps.booking_id = b.booking_id
        WHERE ps.customer_id = ?
      `;
      const params = [customerId];

      if (status) {
        query += ' AND ps.status = ?';
        params.push(status);
      }

      query += ' ORDER BY ps.created_at DESC';

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new PaymentSchedule(row));
    } catch (error) {
      throw new Error(`Error fetching payment schedules: ${error.message}`);
    }
  }

  static async findById(scheduleId, customerId = null) {
    try {
      let query = 'SELECT * FROM payment_schedules WHERE schedule_id = ?';
      const params = [scheduleId];

      if (customerId) {
        query += ' AND customer_id = ?';
        params.push(customerId);
      }

      const [rows] = await pool.execute(query, params);
      return rows.length > 0 ? new PaymentSchedule(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error fetching payment schedule: ${error.message}`);
    }
  }

  static async findDuePayments(dueDate = null) {
    try {
      const targetDate = dueDate || new Date().toISOString().split('T')[0];
      
      const [rows] = await pool.execute(
        `SELECT ps.*, c.full_name, c.email, c.phone, b.booking_code
         FROM payment_schedules ps
         JOIN customers c ON ps.customer_id = c.customer_id
         JOIN bookings b ON ps.booking_id = b.booking_id
         WHERE ps.status = 'active'
         AND ps.next_payment_date <= ?
         AND ps.remaining_amount > 0
         ORDER BY ps.next_payment_date ASC`,
        [targetDate]
      );

      return rows.map(row => new PaymentSchedule(row));
    } catch (error) {
      throw new Error(`Error fetching due payments: ${error.message}`);
    }
  }

  static async processScheduledPayment(scheduleId, paymentData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const schedule = await PaymentSchedule.findById(scheduleId);
      if (!schedule) {
        throw new Error('Payment schedule not found');
      }

      if (schedule.status !== 'active') {
        throw new Error('Payment schedule is not active');
      }

      if (schedule.remaining_amount <= 0) {
        throw new Error('No remaining amount to pay');
      }

      const paymentAmount = Math.min(schedule.installment_amount, schedule.remaining_amount);
      const newRemainingAmount = schedule.remaining_amount - paymentAmount;
      const newCompletedPayments = schedule.completed_payments + 1;

      await connection.execute(
        `UPDATE payment_schedules 
         SET completed_payments = ?,
             remaining_amount = ?,
             next_payment_date = ?,
             status = ?,
             updated_at = NOW()
         WHERE schedule_id = ?`,
        [
          newCompletedPayments,
          newRemainingAmount,
          newRemainingAmount > 0 ? PaymentSchedule.calculateNextPaymentDate(schedule.next_payment_date, schedule.frequency) : null,
          newRemainingAmount > 0 ? 'active' : 'completed',
          scheduleId
        ]
      );

      await connection.execute(
        `INSERT INTO scheduled_payments 
         (schedule_id, payment_amount, payment_date, status, payment_details)
         VALUES (?, ?, NOW(), 'completed', ?)`,
        [scheduleId, paymentAmount, JSON.stringify(paymentData)]
      );

      await connection.commit();

      return {
        schedule_id: scheduleId,
        payment_amount: paymentAmount,
        remaining_amount: newRemainingAmount,
        completed_payments: newCompletedPayments,
        is_completed: newRemainingAmount <= 0
      };
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error processing scheduled payment: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static calculateNextPaymentDate(currentDate, frequency) {
    const next = new Date(currentDate);

    switch (frequency) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }

    return next.toISOString().split('T')[0];
  }

  static async cancel(scheduleId, customerId, reason) {
    try {
      const [result] = await pool.execute(
        `UPDATE payment_schedules 
         SET status = 'cancelled', 
             updated_at = NOW()
         WHERE schedule_id = ? AND customer_id = ? AND status = 'active'`,
        [scheduleId, customerId]
      );

      if (result.affectedRows > 0) {
        await pool.execute(
          `INSERT INTO schedule_cancellations 
           (schedule_id, customer_id, reason, cancelled_at)
           VALUES (?, ?, ?, NOW())`,
          [scheduleId, customerId, reason]
        );
      }

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error cancelling payment schedule: ${error.message}`);
    }
  }

  static async getScheduleStats(customerId = null, timeframe = '30d') {
    try {
      let dateCondition = '';
      let params = [];

      if (timeframe === '7d') {
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (timeframe === '30d') {
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      }

      let customerCondition = '';
      if (customerId) {
        customerCondition = 'AND customer_id = ?';
        params.push(customerId);
      }

      const [stats] = await pool.execute(
        `SELECT 
           COUNT(*) as total_schedules,
           COUNT(CASE WHEN status = 'active' THEN 1 END) as active_schedules,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_schedules,
           COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_schedules,
           COALESCE(SUM(total_amount), 0) as total_scheduled_amount,
           COALESCE(SUM(total_amount - remaining_amount), 0) as total_paid_amount,
           COALESCE(SUM(remaining_amount), 0) as total_remaining_amount,
           COALESCE(AVG(installment_count), 0) as avg_installments
         FROM payment_schedules 
         WHERE 1=1 ${dateCondition} ${customerCondition}`,
        params
      );

      const [upcomingPayments] = await pool.execute(
        `SELECT 
           COUNT(*) as due_count,
           COALESCE(SUM(installment_amount), 0) as due_amount
         FROM payment_schedules 
         WHERE status = 'active'
         AND next_payment_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
         ${customerCondition}`,
        params
      );

      return {
        overview: stats[0],
        upcoming_payments: upcomingPayments[0],
        completion_rate: stats[0].total_schedules > 0
          ? ((stats[0].completed_schedules / stats[0].total_schedules) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      throw new Error(`Error getting schedule stats: ${error.message}`);
    }
  }

  getProgress() {
    const totalInstallments = this.installment_count;
    const completedInstallments = this.completed_payments;
    const progressPercentage = (completedInstallments / totalInstallments) * 100;

    return {
      total_installments: totalInstallments,
      completed_installments: completedInstallments,
      remaining_installments: totalInstallments - completedInstallments,
      progress_percentage: Math.round(progressPercentage),
      amount_paid: this.total_amount - this.remaining_amount,
      amount_remaining: this.remaining_amount
    };
  }

  isActive() {
    return this.status === 'active';
  }

  isCompleted() {
    return this.status === 'completed';
  }

  isCancelled() {
    return this.status === 'cancelled';
  }

  isDue() {
    const today = new Date().toISOString().split('T')[0];
    return this.next_payment_date && this.next_payment_date <= today && this.isActive();
  }

  toJSON() {
    return {
      schedule_id: this.schedule_id,
      customer_id: this.customer_id,
      booking_id: this.booking_id,
      schedule_type: this.schedule_type,
      payment_method: this.payment_method,
      total_amount: this.total_amount,
      installment_count: this.installment_count,
      installment_amount: this.installment_amount,
      frequency: this.frequency,
      start_date: this.start_date,
      end_date: this.end_date,
      status: this.status,
      next_payment_date: this.next_payment_date,
      completed_payments: this.completed_payments,
      remaining_amount: this.remaining_amount,
      created_at: this.created_at,
      updated_at: this.updated_at,
      progress: this.getProgress(),
      is_active: this.isActive(),
      is_completed: this.isCompleted(),
      is_cancelled: this.isCancelled(),
      is_due: this.isDue()
    };
  }
}

module.exports = PaymentSchedule;


