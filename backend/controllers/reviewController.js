const Review = require("../models/Review");
const Booking = require("../models/Booking");
const { validationResult } = require("express-validator");

/**
 * Create a new review
 * @route POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const customer_id = req.customer.customer_id;
    const {
      booking_id,
      room_id,
      rating,
      cleanliness_rating,
      service_rating,
      location_rating,
      value_rating,
      amenities_rating,
      title,
      comment,
      pros,
      cons,
      images,
    } = req.body;

    // Verify booking belongs to customer and is completed
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings",
      });
    }

    if (
      booking.booking_status !== "checked_out" &&
      booking.booking_status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "You can only review completed stays",
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findByBookingId(booking_id);
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Review already exists for this booking",
      });
    }

    const reviewData = {
      booking_id,
      customer_id,
      room_id,
      rating,
      cleanliness_rating,
      service_rating,
      location_rating,
      value_rating,
      amenities_rating,
      title,
      comment,
      pros,
      cons,
      images,
    };

    const review = await Review.create(reviewData);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: { review },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

/**
 * Get review by ID
 * @route GET /api/reviews/:id
 */
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdWithDetails(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      message: "Review retrieved successfully",
      data: { review },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get review",
      error: error.message,
    });
  }
};

/**
 * Get reviews for a room
 * @route GET /api/rooms/:roomId/reviews
 */
const getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort_by = "created_at",
      sort_order = "desc",
      min_rating,
      status = "approved",
    } = req.query;

    const filters = {
      room_id: roomId,
      status,
      min_rating: min_rating ? parseFloat(min_rating) : null,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort_by,
      sortOrder: sort_order,
    };

    const result = await Review.getByRoomId(filters);

    res.json({
      success: true,
      message: "Room reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get room reviews",
      error: error.message,
    });
  }
};

/**
 * Get customer reviews
 * @route GET /api/customers/reviews
 */
const getCustomerReviews = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const {
      page = 1,
      limit = 10,
      sort_by = "created_at",
      sort_order = "desc",
      status,
    } = req.query;

    const filters = {
      customer_id,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort_by,
      sortOrder: sort_order,
    };

    const result = await Review.getByCustomerId(filters);

    res.json({
      success: true,
      message: "Customer reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get customer reviews",
      error: error.message,
    });
  }
};

/**
 * Update review (Customer can only update their own)
 * @route PUT /api/reviews/:id
 */
const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const customer_id = req.customer.customer_id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }

    // Check if review is still editable (within 7 days and not responded by admin)
    const reviewDate = new Date(review.created_at);
    const now = new Date();
    const daysDiff = (now - reviewDate) / (1000 * 60 * 60 * 24);

    if (daysDiff > 7 || review.admin_response) {
      return res.status(400).json({
        success: false,
        message: "Review can no longer be edited",
      });
    }

    const updateData = req.body;
    const updatedReview = await Review.update(id, updateData);

    res.json({
      success: true,
      message: "Review updated successfully",
      data: { review: updatedReview },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

/**
 * Delete review (Customer can only delete their own)
 * @route DELETE /api/reviews/:id
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.customer.customer_id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    await Review.delete(id);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

/**
 * Mark review as helpful
 * @route POST /api/reviews/:id/helpful
 */
const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.customer.customer_id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.customer_id === customer_id) {
      return res.status(400).json({
        success: false,
        message: "You cannot mark your own review as helpful",
      });
    }

    await Review.incrementHelpfulCount(id);

    res.json({
      success: true,
      message: "Review marked as helpful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark review as helpful",
      error: error.message,
    });
  }
};

/**
 * Get review statistics for a room
 * @route GET /api/rooms/:roomId/reviews/statistics
 */
const getRoomReviewStatistics = async (req, res) => {
  try {
    const { roomId } = req.params;

    const statistics = await Review.getRoomStatistics(roomId);

    res.json({
      success: true,
      message: "Room review statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get room review statistics",
      error: error.message,
    });
  }
};

// ===============================================
// ADMIN ONLY FUNCTIONS
// ===============================================

/**
 * Get all reviews for admin management
 * @route GET /api/admin/reviews
 */
const getAllReviewsForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      room_id,
      customer_id,
      min_rating,
      sort_by = "created_at",
      sort_order = "desc",
    } = req.query;

    const filters = {
      status,
      room_id: room_id ? parseInt(room_id) : null,
      customer_id: customer_id ? parseInt(customer_id) : null,
      min_rating: min_rating ? parseFloat(min_rating) : null,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort_by,
      sortOrder: sort_order,
    };

    const result = await Review.getAllWithFilters(filters);

    res.json({
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};

/**
 * Update review status (Admin only)
 * @route PUT /api/admin/reviews/:id/status
 */
const updateReviewStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { status, admin_response } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const updatedReview = await Review.updateStatus(id, status, admin_response);

    res.json({
      success: true,
      message: "Review status updated successfully",
      data: { review: updatedReview },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update review status",
      error: error.message,
    });
  }
};

/**
 * Get review analytics (Admin only)
 * @route GET /api/admin/reviews/analytics
 */
const getReviewAnalytics = async (req, res) => {
  try {
    const { timeframe = "30d" } = req.query;

    const analytics = await Review.getAnalytics(timeframe);

    res.json({
      success: true,
      message: "Review analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get review analytics",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getReviewById,
  getRoomReviews,
  getCustomerReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getRoomReviewStatistics,
  // Admin functions
  getAllReviewsForAdmin,
  updateReviewStatus,
  getReviewAnalytics,
};
