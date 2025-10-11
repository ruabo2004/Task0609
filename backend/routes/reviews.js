const express = require("express");
const router = express.Router();
const { reviewController } = require("../controllers");
const { authenticate, authorize, reviewValidation } = require("../middleware");

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  reviewController.getAllReviews
);

/**
 * @route   GET /api/reviews/stats
 * @desc    Get review statistics (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/stats",
  authenticate,
  authorize("admin", "staff"),
  reviewController.getReviewStatistics
);

/**
 * @route   GET /api/reviews/testimonials
 * @desc    Get random testimonials for homepage
 * @access  Public
 */
router.get("/testimonials", reviewController.getRandomTestimonials);

/**
 * @route   GET /api/reviews/recent
 * @desc    Get recent reviews
 * @access  Public
 */
router.get("/recent", reviewController.getRecentReviews);

/**
 * @route   GET /api/reviews/top-rated
 * @desc    Get top rated reviews
 * @access  Public
 */
router.get("/top-rated", reviewController.getTopRatedReviews);

/**
 * @route   GET /api/reviews/user
 * @desc    Get current user's reviews
 * @access  Private
 */
router.get("/user", authenticate, reviewController.getUserReviews);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews by user ID (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/user/:userId",
  authenticate,
  authorize("admin", "staff"),
  reviewController.getReviewsByUserId
);

/**
 * @route   GET /api/reviews/room/:roomId
 * @desc    Get reviews by room ID
 * @access  Public
 */
router.get("/room/:roomId", reviewController.getReviewsByRoomId);

/**
 * @route   GET /api/reviews/room/:roomId/rating
 * @desc    Get average rating for a room
 * @access  Public
 */
router.get("/room/:roomId/rating", reviewController.getRoomAverageRating);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get review by ID
 * @access  Public
 */
router.get("/:id", reviewController.getReviewById);

/**
 * @route   POST /api/reviews
 * @desc    Create new review
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  reviewValidation.createReview,
  reviewController.createReview
);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review (Owner only)
 * @access  Private
 */
router.put(
  "/:id",
  authenticate,
  reviewValidation.updateReview,
  reviewController.updateReview
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review (Owner or Admin only)
 * @access  Private
 */
router.delete("/:id", authenticate, reviewController.deleteReview);

/**
 * @route   GET /api/reviews/booking/:bookingId/can-review
 * @desc    Check if user can review a booking
 * @access  Private
 */
router.get(
  "/booking/:bookingId/can-review",
  authenticate,
  reviewController.canUserReviewBooking
);

module.exports = router;
