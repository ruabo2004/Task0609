const express = require("express");
const router = express.Router();
const { paymentController } = require("../controllers");
const { authenticate, authorize, paymentValidation } = require("../middleware");

/**
 * @route   GET /api/payments
 * @desc    Get all payments (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  paymentController.getAllPayments
);

/**
 * @route   GET /api/payments/stats
 * @desc    Get payment statistics (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/stats",
  authenticate,
  authorize("admin", "staff"),
  paymentController.getPaymentStatistics
);

/**
 * @route   GET /api/payments/revenue
 * @desc    Get revenue by date range (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/revenue",
  authenticate,
  authorize("admin", "staff"),
  paymentController.getRevenueByDateRange
);

/**
 * @route   GET /api/payments/user
 * @desc    Get current user's payments
 * @access  Private
 */
router.get("/user", authenticate, paymentController.getMyPayments);

/**
 * @route   GET /api/payments/booking/:bookingId
 * @desc    Get payments by booking ID
 * @access  Private
 */
router.get(
  "/booking/:bookingId",
  authenticate,
  paymentController.getPaymentsByBookingId
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get("/:id", authenticate, paymentController.getPaymentById);

/**
 * @route   POST /api/payments
 * @desc    Create new payment
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  paymentValidation.createPayment,
  paymentController.createPayment
);

/**
 * @route   PUT /api/payments/:id/status
 * @desc    Update payment status (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "staff"),
  paymentValidation.updateStatus,
  paymentController.updatePaymentStatus
);

/**
 * @route   PUT /api/payments/:id
 * @desc    Update payment (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  paymentController.updatePayment
);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Process refund (Admin only)
 * @access  Private/Admin
 */
router.post(
  "/:id/refund",
  authenticate,
  authorize("admin"),
  paymentValidation.processRefund,
  paymentController.processRefund
);

/**
 * @route   DELETE /api/payments/all
 * @desc    Delete all payments (Admin only) - DANGEROUS
 * @access  Private/Admin
 */
router.delete(
  "/all",
  authenticate,
  authorize("admin"),
  paymentController.deleteAllPayments
);

module.exports = router;
