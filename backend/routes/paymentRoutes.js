const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { paymentValidation, generalValidation } = require('../middleware/validation');

router.post('/momo/callback', paymentController.handleMoMoCallback);
router.post('/momo/ipn', paymentController.handleMoMoIPN);

router.use(authenticateToken);

router.post('/momo/create', paymentValidation.createMoMoPayment, paymentController.createMoMoPayment);
router.get('/customer', paymentController.getCustomerPayments);
router.get('/:paymentId', generalValidation.idParam, paymentController.getPaymentStatus);
router.get('/:paymentId/momo/query', generalValidation.idParam, paymentController.queryMoMoPaymentStatus);

module.exports = router;
