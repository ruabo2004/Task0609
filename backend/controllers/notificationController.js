const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

const getNotifications = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const {
      page = 1,
      limit = 20,
      unread_only = 'false',
      type,
      priority,
      include_expired = 'false'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unread_only === 'true',
      type: type || null,
      priority: priority || null,
      includeExpired: include_expired === 'true'
    };

    const result = await Notification.findByCustomerId(customerId, options);

    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: result.notifications.map(notification => notification.toJSON()),
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { id } = req.params;

    const notification = await Notification.findById(parseInt(id), customerId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification retrieved successfully',
      data: {
        notification: notification.toJSON()
      }
    });
  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification',
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { id } = req.params;

    const marked = await Notification.markAsRead(parseInt(id), customerId);

    if (!marked) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or already read'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { type } = req.query;

    const markedCount = await Notification.markAllAsRead(customerId, type);

    res.json({
      success: true,
      message: 'Notifications marked as read',
      data: {
        marked_count: markedCount
      }
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { id } = req.params;

    const deleted = await Notification.delete(parseInt(id), customerId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { type } = req.query;

    const deletedCount = await Notification.deleteAll(customerId, type);

    res.json({
      success: true,
      message: 'Notifications deleted successfully',
      data: {
        deleted_count: deletedCount
      }
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notifications',
      error: error.message
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { type } = req.query;

    const unreadCount = await Notification.getUnreadCount(customerId, type);

    res.json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: {
        unread_count: unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

const createNotification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const customerId = req.customer.customer_id;
    const {
      type,
      title,
      message,
      data,
      priority = 'normal',
      action_url,
      expires_at
    } = req.body;

    const notification = await Notification.create({
      customerId,
      type,
      title,
      message,
      data,
      priority,
      actionUrl: action_url,
      expiresAt: expires_at
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification: notification.toJSON()
      }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

const getNotificationStats = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;

    const [totalCount, unreadCount, readCount] = await Promise.all([
      Notification.findByCustomerId(customerId, { limit: 1 }).then(result => result.pagination.total),
      Notification.getUnreadCount(customerId),
      Notification.findByCustomerId(customerId, { limit: 1 }).then(result => result.pagination.total) - 
        await Notification.getUnreadCount(customerId)
    ]);

    const typeStats = {};
    const types = ['booking', 'payment', 'system', 'promotion', 'reminder'];
    
    for (const type of types) {
      const typeUnread = await Notification.getUnreadCount(customerId, type);
      typeStats[type] = { unread: typeUnread };
    }

    res.json({
      success: true,
      message: 'Notification stats retrieved successfully',
      data: {
        total: totalCount,
        unread: unreadCount,
        read: readCount,
        by_type: typeStats
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification stats',
      error: error.message
    });
  }
};

const bulkActions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const customerId = req.customer.customer_id;
    const { action, notification_ids } = req.body;

    if (!['mark_read', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be mark_read or delete.'
      });
    }

    let results = 0;

    if (action === 'mark_read') {
      for (const id of notification_ids) {
        const marked = await Notification.markAsRead(parseInt(id), customerId);
        if (marked) results++;
      }
    } else if (action === 'delete') {
      for (const id of notification_ids) {
        const deleted = await Notification.delete(parseInt(id), customerId);
        if (deleted) results++;
      }
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        processed: results,
        total: notification_ids.length
      }
    });
  } catch (error) {
    console.error('Bulk actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk actions',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createNotification,
  getNotificationStats,
  bulkActions
};


