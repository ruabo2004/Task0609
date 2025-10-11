// Review Controller
// Handles review and rating system

const { Review, Booking } = require("../models");
const {
  success,
  error,
  created,
  notFound,
  paginated,
  forbidden,
} = require("../utils/responseHelper");
const { validationResult } = require("express-validator");

const reviewController = {
  // @desc    Get all reviews
  // @route   GET /api/reviews
  // @access  Public
  getAllReviews: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        rating: req.query.rating,
        min_rating: req.query.min_rating,
        user_id: req.query.user_id,
        room_id: req.query.room_id,
        room_type: req.query.room_type,
        search: req.query.search,
      };

      const result = await Review.getAll(filters, page, limit);

      return paginated(
        res,
        result.reviews,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Reviews retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get review by ID
  // @route   GET /api/reviews/:id
  // @access  Public
  getReviewById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);
      if (!review) {
        return notFound(res, "Review not found");
      }

      const reviewResponse = review.toJSON();
      return success(
        res,
        { review: reviewResponse },
        "Review retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Create new review
  // @route   POST /api/reviews
  // @access  Private
  createReview: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { booking_id, rating, comment } = req.body;

      // Validate rating
      if (rating < 1 || rating > 5) {
        return error(res, "Rating must be between 1 and 5", 400);
      }

      // Check if booking exists and belongs to user
      const booking = await Booking.findById(booking_id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      if (booking.user_id !== req.user.id) {
        return forbidden(res, "You can only review your own bookings");
      }

      // Check if booking is completed
      if (booking.status !== "checked_out") {
        return error(res, "You can only review completed bookings", 400);
      }

      // Check if review already exists
      const existingReview = await Review.findByBookingId(booking_id);
      if (existingReview) {
        return error(res, "Review already exists for this booking", 409);
      }

      const reviewData = {
        booking_id,
        user_id: req.user.id,
        rating,
        comment: comment || null,
      };

      const review = await Review.create(reviewData);
      const reviewResponse = review.toJSON();

      return created(
        res,
        { review: reviewResponse },
        "Review created successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Update review
  // @route   PUT /api/reviews/:id
  // @access  Private (own review)
  updateReview: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await Review.findById(id);
      if (!review) {
        return notFound(res, "Review not found");
      }

      // Check if user owns this review
      if (review.user_id !== req.user.id) {
        return forbidden(res, "You can only update your own reviews");
      }

      // Check if review can be edited (within 24 hours)
      if (!review.canBeEdited()) {
        return error(
          res,
          "Review can only be edited within 24 hours of creation",
          400
        );
      }

      // Validate rating if provided
      if (rating && (rating < 1 || rating > 5)) {
        return error(res, "Rating must be between 1 and 5", 400);
      }

      const updatedReview = await review.update({
        rating,
        comment,
      });

      const reviewResponse = updatedReview.toJSON();
      return success(
        res,
        { review: reviewResponse },
        "Review updated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Delete review
  // @route   DELETE /api/reviews/:id
  // @access  Private (own review) / Admin
  deleteReview: async (req, res, next) => {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);
      if (!review) {
        return notFound(res, "Review not found");
      }

      // Check if user can delete this review
      if (req.user.role !== "admin" && review.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      await review.delete();
      return success(res, null, "Review deleted successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get reviews by user ID
  // @route   GET /api/reviews/user/:user_id
  // @access  Public
  getReviewsByUserId: async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Review.getByUserId(user_id, page, limit);

      return paginated(
        res,
        result.reviews,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "User reviews retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get reviews by room ID
  // @route   GET /api/reviews/room/:room_id
  // @access  Public
  getReviewsByRoomId: async (req, res, next) => {
    try {
      const { room_id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Review.getByRoomId(room_id, page, limit);

      return paginated(
        res,
        result.reviews,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Room reviews retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get user's reviews
  // @route   GET /api/reviews/my-reviews
  // @access  Private
  getMyReviews: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Review.getByUserId(req.user.id, page, limit);

      return paginated(
        res,
        result.reviews,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Your reviews retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get review statistics
  // @route   GET /api/reviews/stats
  // @access  Public
  getReviewStats: async (req, res, next) => {
    try {
      const filters = {
        room_id: req.query.room_id,
        room_type: req.query.room_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
      };

      const stats = await Review.getStatistics(filters);

      return success(
        res,
        { stats },
        "Review statistics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get room average rating
  // @route   GET /api/reviews/room/:room_id/average
  // @access  Public
  getRoomAverageRating: async (req, res, next) => {
    try {
      const { room_id } = req.params;

      const ratingData = await Review.getRoomAverageRating(room_id);

      return success(
        res,
        {
          room_id: parseInt(room_id),
          ...ratingData,
        },
        "Room average rating retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get recent reviews
  // @route   GET /api/reviews/recent
  // @access  Public
  getRecentReviews: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const reviews = await Review.getRecentReviews(limit);
      const reviewResponses = reviews.map((review) => review.toJSON());

      return success(
        res,
        { reviews: reviewResponses },
        "Recent reviews retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get top rated reviews
  // @route   GET /api/reviews/top-rated
  // @access  Public
  getTopRatedReviews: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const reviews = await Review.getTopRatedReviews(limit);
      const reviewResponses = reviews.map((review) => review.toJSON());

      return success(
        res,
        { reviews: reviewResponses },
        "Top rated reviews retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Check if user can review booking
  // @route   GET /api/reviews/can-review/:booking_id
  // @access  Private
  canReviewBooking: async (req, res, next) => {
    try {
      const { booking_id } = req.params;

      // Check if booking exists and belongs to user
      const booking = await Booking.findById(booking_id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      if (booking.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      // Check conditions for reviewing
      const canReview = booking.status === "checked_out";
      const existingReview = await Review.findByBookingId(booking_id);
      const hasExistingReview = !!existingReview;

      return success(
        res,
        {
          can_review: canReview && !hasExistingReview,
          reasons: {
            booking_completed: booking.status === "checked_out",
            no_existing_review: !hasExistingReview,
            booking_status: booking.status,
          },
        },
        "Review eligibility checked"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get random testimonials for homepage
  // @route   GET /api/reviews/testimonials
  // @access  Public
  getRandomTestimonials: async (req, res, next) => {
    try {
      const count = parseInt(req.query.count) || 3;
      const testimonials = await Review.getRandomTestimonials(count);
      return success(
        res,
        { testimonials },
        "Random testimonials retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },
};

// Merge placeholder methods
Object.assign(reviewController, require("./placeholders"));

module.exports = reviewController;
