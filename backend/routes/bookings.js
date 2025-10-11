const express = require("express");
const router = express.Router();
const { bookingController } = require("../controllers");
const { authenticate, authorize, bookingValidation } = require("../middleware");

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  bookingController.getAllBookings
);

/**
 * @route   GET /api/bookings/stats
 * @desc    Get booking statistics (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/stats",
  authenticate,
  authorize("admin", "staff"),
  bookingController.getBookingStatistics
);

/**
 * @route   GET /api/bookings/search
 * @desc    Search bookings (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/search",
  authenticate,
  authorize("admin", "staff"),
  bookingController.searchBookings
);

/**
 * @route   GET /api/bookings/user
 * @desc    Get current user's bookings
 * @access  Private
 */
router.get("/user", authenticate, bookingController.getMyBookings);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get current user's bookings (alias for /user)
 * @access  Private
 */
router.get("/my-bookings", authenticate, bookingController.getMyBookings);

/**
 * @route   GET /api/bookings/user/stats
 * @desc    Get current user's booking statistics
 * @access  Private
 */
router.get("/user/stats", authenticate, bookingController.getUserBookingStats);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get("/:id", authenticate, bookingController.getBookingById);

/**
 * @route   GET /api/bookings/:id/services
 * @desc    Get services for a booking
 * @access  Private
 */
router.get("/:id/services", authenticate, bookingController.getBookingServices);

/**
 * @route   POST /api/bookings/check-availability
 * @desc    Check room availability for specific dates
 * @access  Public
 */
router.post(
  "/check-availability",
  bookingValidation.checkAvailability,
  bookingController.checkRoomAvailability
);

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  bookingValidation.createBooking,
  bookingController.createBooking
);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking
 * @access  Private
 */
router.put(
  "/:id",
  authenticate,
  bookingValidation.updateBooking,
  bookingController.updateBooking
);

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private
 */
router.put("/:id/cancel", authenticate, bookingController.cancelBooking);

/**
 * @route   PUT /api/bookings/:id/confirm
 * @desc    Confirm booking (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id/confirm",
  authenticate,
  authorize("admin", "staff"),
  bookingController.confirmBooking
);

/**
 * @route   PUT /api/bookings/:id/checkin
 * @desc    Check-in booking (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id/checkin",
  authenticate,
  authorize("admin", "staff"),
  bookingController.checkIn
);

/**
 * @route   PUT /api/bookings/:id/checkout
 * @desc    Check-out booking (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id/checkout",
  authenticate,
  authorize("admin", "staff"),
  bookingController.checkOut
);

/**
 * @route   POST /api/bookings/:id/services
 * @desc    Add service to booking
 * @access  Private
 */
router.post(
  "/:id/services",
  authenticate,
  bookingValidation.addService,
  bookingController.addServiceToBooking
);

/**
 * @route   DELETE /api/bookings/:bookingId/services/:bookingServiceId
 * @desc    Remove service from booking
 * @access  Private
 */
router.delete(
  "/:bookingId/services/:bookingServiceId",
  authenticate,
  bookingController.removeServiceFromBooking
);

module.exports = router;
