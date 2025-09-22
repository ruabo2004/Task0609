const { pool } = require('../config/database');

class Notification {
  constructor(data) {
    this.notification_id = data.notification_id;
    this.customer_id = data.customer_id;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.data = data.data;
    this.read_at = data.read_at;
    this.priority = data.priority;
    this.action_url = data.action_url;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(notificationData) {
    try {
      const {
        customerId,
        type,
        title,
        message,
        data = null,
        priority = 'normal',
        actionUrl = null,
        expiresAt = null
      } = notificationData;

      const dataJson = data ? JSON.stringify(data) : null;

      const [result] = await pool.execute(
        `INSERT INTO notifications 
         (customer_id, type, title, message, data, priority, action_url, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [customerId, type, title, message, dataJson, priority, actionUrl, expiresAt]
      );

      const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE notification_id = ?',
        [result.insertId]
      );

      return new Notification(rows[0]);
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  static async findByCustomerId(customerId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        unreadOnly = false,
        type = null,
        priority = null,
        includeExpired = false
      } = options;

      let query = `
        SELECT * FROM notifications 
        WHERE customer_id = ?
      `;
      const params = [customerId];

      if (unreadOnly) {
        query += ' AND read_at IS NULL';
      }

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      if (priority) {
        query += ' AND priority = ?';
        params.push(priority);
      }

      if (!includeExpired) {
        query += ' AND (expires_at IS NULL OR expires_at > NOW())';
      }

      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const [countResult] = await pool.execute(countQuery, params);
      const total = countResult[0].total;

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);

      const [rows] = await pool.execute(query, params);

      return {
        notifications: rows.map(row => new Notification(row)),
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
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  static async findById(notificationId, customerId = null) {
    try {
      let query = 'SELECT * FROM notifications WHERE notification_id = ?';
      const params = [notificationId];

      if (customerId) {
        query += ' AND customer_id = ?';
        params.push(customerId);
      }

      const [rows] = await pool.execute(query, params);
      return rows.length > 0 ? new Notification(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error fetching notification: ${error.message}`);
    }
  }

  static async markAsRead(notificationId, customerId) {
    try {
      const [result] = await pool.execute(
        'UPDATE notifications SET read_at = NOW() WHERE notification_id = ? AND customer_id = ? AND read_at IS NULL',
        [notificationId, customerId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  static async markAllAsRead(customerId, type = null) {
    try {
      let query = 'UPDATE notifications SET read_at = NOW() WHERE customer_id = ? AND read_at IS NULL';
      const params = [customerId];

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      const [result] = await pool.execute(query, params);
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  static async delete(notificationId, customerId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM notifications WHERE notification_id = ? AND customer_id = ?',
        [notificationId, customerId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  static async deleteAll(customerId, type = null) {
    try {
      let query = 'DELETE FROM notifications WHERE customer_id = ?';
      const params = [customerId];

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      const [result] = await pool.execute(query, params);
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error deleting notifications: ${error.message}`);
    }
  }

  static async getUnreadCount(customerId, type = null) {
    try {
      let query = `
        SELECT COUNT(*) as unread_count 
        FROM notifications 
        WHERE customer_id = ? 
        AND read_at IS NULL 
        AND (expires_at IS NULL OR expires_at > NOW())
      `;
      const params = [customerId];

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      const [rows] = await pool.execute(query, params);
      return rows[0].unread_count;
    } catch (error) {
      throw new Error(`Error getting unread count: ${error.message}`);
    }
  }

  static async cleanupExpired() {
    try {
      const [result] = await pool.execute(
        'DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at <= NOW()'
      );

      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error cleaning up expired notifications: ${error.message}`);
    }
  }

  static async bulkCreate(notifications) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const results = [];
      
      for (const notificationData of notifications) {
        const {
          customerId,
          type,
          title,
          message,
          data = null,
          priority = 'normal',
          actionUrl = null,
          expiresAt = null
        } = notificationData;

        const dataJson = data ? JSON.stringify(data) : null;

        const [result] = await connection.execute(
          `INSERT INTO notifications 
           (customer_id, type, title, message, data, priority, action_url, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [customerId, type, title, message, dataJson, priority, actionUrl, expiresAt]
        );

        results.push(result.insertId);
      }

      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error bulk creating notifications: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async createBookingNotification(customerId, bookingId, notificationType, bookingData) {
    const notificationTemplates = {
      booking_confirmed: {
        title: 'Đặt phòng được xác nhận',
        message: `Đặt phòng ${bookingData.booking_code} đã được xác nhận. Check-in: ${bookingData.check_in_date}`,
        type: 'booking',
        priority: 'high'
      },
      booking_cancelled: {
        title: 'Đặt phòng đã bị hủy',
        message: `Đặt phòng ${bookingData.booking_code} đã bị hủy thành công.`,
        type: 'booking',
        priority: 'normal'
      },
      payment_successful: {
        title: 'Thanh toán thành công',
        message: `Thanh toán cho đặt phòng ${bookingData.booking_code} đã hoàn tất.`,
        type: 'payment',
        priority: 'high'
      },
      payment_failed: {
        title: 'Thanh toán thất bại',
        message: `Thanh toán cho đặt phòng ${bookingData.booking_code} không thành công. Vui lòng thử lại.`,
        type: 'payment',
        priority: 'urgent'
      },
      checkin_reminder: {
        title: 'Nhắc nhở check-in',
        message: `Đặt phòng ${bookingData.booking_code} sẽ check-in vào ngày mai. Chuẩn bị hành trình của bạn!`,
        type: 'reminder',
        priority: 'normal'
      }
    };

    const template = notificationTemplates[notificationType];
    if (!template) {
      throw new Error(`Unknown notification type: ${notificationType}`);
    }

    return await Notification.create({
      customerId,
      type: template.type,
      title: template.title,
      message: template.message,
      data: {
        booking_id: bookingId,
        booking_code: bookingData.booking_code,
        notification_type: notificationType
      },
      priority: template.priority,
      actionUrl: `/booking-history/${bookingId}`
    });
  }

  getData() {
    return this.data ? JSON.parse(this.data) : null;
  }

  isRead() {
    return this.read_at !== null;
  }

  isExpired() {
    return this.expires_at && new Date(this.expires_at) <= new Date();
  }

  toJSON() {
    return {
      notification_id: this.notification_id,
      customer_id: this.customer_id,
      type: this.type,
      title: this.title,
      message: this.message,
      data: this.getData(),
      read_at: this.read_at,
      priority: this.priority,
      action_url: this.action_url,
      expires_at: this.expires_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
      is_read: this.isRead(),
      is_expired: this.isExpired()
    };
  }
}

module.exports = Notification;


