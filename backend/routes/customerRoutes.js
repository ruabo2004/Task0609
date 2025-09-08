const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');
const { customerValidation } = require('../middleware/validation');

router.post('/register', customerValidation.register, customerController.register);
router.post('/login', customerValidation.login, customerController.login);

router.use(authenticateToken); 

router.get('/profile', customerController.getProfile);
router.put('/profile', customerValidation.updateProfile, customerController.updateProfile);
router.put('/change-password', customerValidation.changePassword, customerController.changePassword);
router.get('/booking-history', customerController.getBookingHistory);
router.get('/reviews', customerController.getReviews);
router.delete('/deactivate', customerController.deactivateAccount);

module.exports = router;
