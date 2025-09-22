const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const { body, query } = require('express-validator');

router.use(authenticateToken);

const notificationValidation = {
  create: [
    body('type')
      .isIn(['booking', 'payment', 'system', 'promotion', 'reminder'])
      .withMessage('Type must be one of: booking, payment, system, promotion, reminder'),
    body('title')
      .notEmpty()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('message')
      .notEmpty()
      .isLength({ min: 1, max: 500 })
      .withMessage('Message must be between 1 and 500 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Priority must be one of: low, normal, high, urgent'),
    body('action_url')
      .optional()
      .isURL()
      .withMessage('Action URL must be a valid URL'),
    body('expires_at')
      .optional()
      .isISO8601()
      .withMessage('Expires at must be a valid ISO8601 date')
  ],

  bulkActions: [
    body('action')
      .isIn(['mark_read', 'delete'])
      .withMessage('Action must be mark_read or delete'),
    body('notification_ids')
      .isArray({ min: 1 })
      .withMessage('Notification IDs must be a non-empty array'),
    body('notification_ids.*')
      .isInt({ min: 1 })
      .withMessage('Each notification ID must be a positive integer')
  ],

  getNotifications: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('unread_only')
      .optional()
      .isBoolean()
      .withMessage('Unread only must be a boolean'),
    query('type')
      .optional()
      .isIn(['booking', 'payment', 'system', 'promotion', 'reminder'])
      .withMessage('Type must be one of: booking, payment, system, promotion, reminder'),
    query('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Priority must be one of: low, normal, high, urgent')
  ]
};

router.get('/', notificationValidation.getNotifications, notificationController.getNotifications);

router.get('/unread-count', notificationController.getUnreadCount);

router.get('/stats', notificationController.getNotificationStats);

router.post('/', notificationValidation.create, notificationController.createNotification);

router.post('/bulk-actions', notificationValidation.bulkActions, notificationController.bulkActions);

router.put('/mark-all-read', notificationController.markAllAsRead);

router.delete('/clear-all', notificationController.deleteAllNotifications);

router.get('/:id', notificationController.getNotificationById);

router.put('/:id/mark-read', notificationController.markAsRead);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;


