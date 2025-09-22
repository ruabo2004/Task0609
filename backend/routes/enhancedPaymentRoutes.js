const express = require('express');
const router = express.Router();
const enhancedPaymentController = require('../controllers/enhancedPaymentController');
const { authenticateToken } = require('../middleware/auth');
const { body, query } = require('express-validator');

const paymentValidation = {
  createPayment: [
    body('booking_id')
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a valid positive integer'),
    body('payment_method')
      .isIn(['momo', 'vnpay', 'bank_transfer', 'cash', 'paypal', 'stripe'])
      .withMessage('Invalid payment method'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number'),
    body('currency')
      .optional()
      .isIn(['VND', 'USD'])
      .withMessage('Currency must be VND or USD'),
    body('return_url')
      .optional()
      .isURL()
      .withMessage('Return URL must be a valid URL'),
    body('cancel_url')
      .optional()
      .isURL()
      .withMessage('Cancel URL must be a valid URL')
  ],

  calculateFees: [
    body('payment_method')
      .isIn(['momo', 'vnpay', 'bank_transfer', 'cash', 'paypal', 'stripe'])
      .withMessage('Invalid payment method'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number')
  ],

  createRefund: [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Refund amount must be a positive number'),
    body('reason')
      .notEmpty()
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters')
  ],

  addPaymentMethod: [
    body('method_type')
      .isIn(['momo', 'vnpay', 'bank_transfer', 'cash', 'paypal', 'stripe'])
      .withMessage('Invalid payment method type'),
    body('provider')
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .withMessage('Provider must be between 2 and 50 characters'),
    body('account_info')
      .isObject()
      .withMessage('Account info must be an object'),
    body('is_default')
      .optional()
      .isBoolean()
      .withMessage('is_default must be a boolean')
  ],

  getPayments: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['pending', 'paid', 'failed', 'refunded'])
      .withMessage('Invalid payment status'),
    query('payment_method')
      .optional()
      .isIn(['momo', 'vnpay', 'bank_transfer', 'cash', 'paypal', 'stripe'])
      .withMessage('Invalid payment method'),
    query('date_from')
      .optional()
      .isISO8601()
      .withMessage('Date from must be a valid ISO8601 date'),
    query('date_to')
      .optional()
      .isISO8601()
      .withMessage('Date to must be a valid ISO8601 date')
  ],

  getAnalytics: [
    query('timeframe')
      .optional()
      .isIn(['7d', '30d', '90d', '1y'])
      .withMessage('Timeframe must be one of: 7d, 30d, 90d, 1y')
  ]
};

router.get('/methods', enhancedPaymentController.getAvailablePaymentMethods);

router.post('/calculate-fees', paymentValidation.calculateFees, enhancedPaymentController.calculatePaymentFees);

router.post('/create', authenticateToken, paymentValidation.createPayment, enhancedPaymentController.createPayment);

router.post('/webhook/:gateway', enhancedPaymentController.handlePaymentWebhook);

router.get('/payments', authenticateToken, paymentValidation.getPayments, enhancedPaymentController.getCustomerPayments);

router.get('/analytics', authenticateToken, paymentValidation.getAnalytics, enhancedPaymentController.getPaymentAnalytics);

router.get('/saved-methods', authenticateToken, enhancedPaymentController.getCustomerPaymentMethods);

router.post('/saved-methods', authenticateToken, paymentValidation.addPaymentMethod, enhancedPaymentController.addPaymentMethod);

router.put('/saved-methods/:methodId/default', authenticateToken, enhancedPaymentController.setDefaultPaymentMethod);

router.delete('/saved-methods/:methodId', authenticateToken, enhancedPaymentController.deletePaymentMethod);

router.get('/:paymentId', authenticateToken, enhancedPaymentController.getPaymentStatus);

router.post('/:paymentId/refund', authenticateToken, paymentValidation.createRefund, enhancedPaymentController.createRefund);

module.exports = router;


