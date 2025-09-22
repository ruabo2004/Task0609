const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authEnhanced");
const { body, query, param } = require("express-validator");

// Validation rules
const reviewValidation = {
  createReview: [
    body("booking_id")
      .isInt({ min: 1 })
      .withMessage("Booking ID must be a positive integer"),
    body("room_id")
      .isInt({ min: 1 })
      .withMessage("Room ID must be a positive integer"),
    body("rating")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("cleanliness_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Cleanliness rating must be between 1 and 5"),
    body("service_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Service rating must be between 1 and 5"),
    body("location_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Location rating must be between 1 and 5"),
    body("value_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Value rating must be between 1 and 5"),
    body("amenities_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Amenities rating must be between 1 and 5"),
    body("title")
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage("Title must be between 3 and 255 characters"),
    body("comment")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Comment must not exceed 2000 characters"),
    body("pros")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Pros must not exceed 1000 characters"),
    body("cons")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Cons must not exceed 1000 characters"),
    body("images").optional().isArray().withMessage("Images must be an array"),
  ],

  updateReview: [
    body("rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("cleanliness_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Cleanliness rating must be between 1 and 5"),
    body("service_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Service rating must be between 1 and 5"),
    body("location_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Location rating must be between 1 and 5"),
    body("value_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Value rating must be between 1 and 5"),
    body("amenities_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Amenities rating must be between 1 and 5"),
    body("title")
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage("Title must be between 3 and 255 characters"),
    body("comment")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Comment must not exceed 2000 characters"),
    body("pros")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Pros must not exceed 1000 characters"),
    body("cons")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Cons must not exceed 1000 characters"),
    body("images").optional().isArray().withMessage("Images must be an array"),
  ],

  updateStatus: [
    body("status")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Status must be pending, approved, or rejected"),
    body("admin_response")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Admin response must not exceed 1000 characters"),
  ],

  getReviews: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("sort_by")
      .optional()
      .isIn(["created_at", "rating", "helpful_count"])
      .withMessage("Invalid sort field"),
    query("sort_order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be asc or desc"),
    query("min_rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Min rating must be between 1 and 5"),
    query("status")
      .optional()
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Invalid status"),
  ],

  getAnalytics: [
    query("timeframe")
      .optional()
      .isIn(["7d", "30d", "90d", "1y"])
      .withMessage("Timeframe must be one of: 7d, 30d, 90d, 1y"),
  ],
};

// ===============================================
// PUBLIC ROUTES (No authentication required)
// ===============================================

/**
 * GET /api/reviews/:id
 * Get review by ID (public)
 */
router.get(
  "/:id",
  param("id")
    .isInt({ min: 1 })
    .withMessage("Review ID must be a positive integer"),
  reviewController.getReviewById
);

// ===============================================
// ROOM-SPECIFIC ROUTES (Public)
// ===============================================

/**
 * GET /api/rooms/:roomId/reviews
 * Get reviews for a specific room (public)
 */
router.get(
  "/rooms/:roomId/reviews",
  param("roomId")
    .isInt({ min: 1 })
    .withMessage("Room ID must be a positive integer"),
  reviewValidation.getReviews,
  reviewController.getRoomReviews
);

/**
 * GET /api/rooms/:roomId/reviews/statistics
 * Get review statistics for a room (public)
 */
router.get(
  "/rooms/:roomId/reviews/statistics",
  param("roomId")
    .isInt({ min: 1 })
    .withMessage("Room ID must be a positive integer"),
  reviewController.getRoomReviewStatistics
);

// ===============================================
// AUTHENTICATED ROUTES (Customer functionality)
// ===============================================

/**
 * POST /api/reviews
 * Create a new review (Customer only)
 */
router.post(
  "/",
  authenticateToken,
  reviewValidation.createReview,
  reviewController.createReview
);

/**
 * GET /api/reviews/my-reviews
 * Get customer's own reviews
 */
router.get(
  "/my-reviews",
  authenticateToken,
  reviewValidation.getReviews,
  reviewController.getCustomerReviews
);

/**
 * PUT /api/reviews/:id
 * Update review (Customer can only update own reviews)
 */
router.put(
  "/:id",
  authenticateToken,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Review ID must be a positive integer"),
  reviewValidation.updateReview,
  reviewController.updateReview
);

/**
 * DELETE /api/reviews/:id
 * Delete review (Customer can only delete own reviews)
 */
router.delete(
  "/:id",
  authenticateToken,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Review ID must be a positive integer"),
  reviewController.deleteReview
);

/**
 * POST /api/reviews/:id/helpful
 * Mark review as helpful
 */
router.post(
  "/:id/helpful",
  authenticateToken,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Review ID must be a positive integer"),
  reviewController.markHelpful
);

// ===============================================
// ADMIN ROUTES (Review management)
// ===============================================

/**
 * GET /api/reviews/admin/all
 * Get all reviews for admin management
 */
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  reviewValidation.getReviews,
  reviewController.getAllReviewsForAdmin
);

/**
 * PUT /api/reviews/admin/:id/status
 * Update review status (Admin only)
 */
router.put(
  "/admin/:id/status",
  authenticateToken,
  requireAdmin,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Review ID must be a positive integer"),
  reviewValidation.updateStatus,
  reviewController.updateReviewStatus
);

/**
 * GET /api/reviews/admin/analytics
 * Get review analytics (Admin only)
 */
router.get(
  "/admin/analytics",
  authenticateToken,
  requireAdmin,
  reviewValidation.getAnalytics,
  reviewController.getReviewAnalytics
);

module.exports = router;
