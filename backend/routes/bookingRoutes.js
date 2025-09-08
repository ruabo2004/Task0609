const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');
const { bookingValidation, generalValidation } = require('../middleware/validation');

router.use(authenticateToken);

router.post('/', bookingValidation.createBooking, bookingController.createBooking);
router.get('/', generalValidation.pagination, bookingController.getCustomerBookings);
router.get('/:bookingId', generalValidation.bookingIdParam, bookingController.getBookingById);
router.put('/:bookingId/cancel', generalValidation.bookingIdParam, bookingController.cancelBooking);

router.post('/calculate-cost', bookingValidation.calculateCost, bookingController.calculateBookingCost);

module.exports = router;
