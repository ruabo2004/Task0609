// Review Model
// Will be implemented in Week 4

const { executeQuery } = require("../config/database");

class Review {
  constructor(reviewData) {
    this.id = reviewData.id;
    this.booking_id = reviewData.booking_id;
    this.user_id = reviewData.user_id;
    this.rating = reviewData.rating;
    this.comment = reviewData.comment;
    this.created_at = reviewData.created_at;
    this.updated_at = reviewData.updated_at;
  }

  // Static methods for database operations

  // @desc    Get all reviews with pagination and filters
  static async getAll(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT r.*, u.full_name as customer_name, u.avatar as customer_avatar,
               b.check_in_date, b.check_out_date, rm.room_number, rm.room_type
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        JOIN rooms rm ON b.room_id = rm.id
        WHERE 1=1
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters
      if (filters.rating) {
        query += " AND r.rating = ?";
        countQuery += " AND r.rating = ?";
        queryParams.push(filters.rating);
      }

      if (filters.min_rating) {
        query += " AND r.rating >= ?";
        countQuery += " AND r.rating >= ?";
        queryParams.push(filters.min_rating);
      }

      if (filters.user_id) {
        query += " AND r.user_id = ?";
        countQuery += " AND r.user_id = ?";
        queryParams.push(filters.user_id);
      }

      if (filters.room_id) {
        query += " AND b.room_id = ?";
        countQuery += " AND b.room_id = ?";
        queryParams.push(filters.room_id);
      }

      if (filters.room_type) {
        query += " AND rm.room_type = ?";
        countQuery += " AND rm.room_type = ?";
        queryParams.push(filters.room_type);
      }

      if (filters.search) {
        query += " AND (r.comment LIKE ? OR u.full_name LIKE ?)";
        countQuery += " AND (r.comment LIKE ? OR u.full_name LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      query += ` ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const [reviews, totalResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, queryParams),
      ]);

      return {
        reviews: reviews.map((review) => new Review(review)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get reviews by user ID
  static async getByUserId(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const query = `
        SELECT r.*, b.check_in_date, b.check_out_date, 
               rm.room_number, rm.room_type, rm.images
        FROM reviews r
        JOIN bookings b ON r.booking_id = b.id
        JOIN rooms rm ON b.room_id = rm.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countQuery =
        "SELECT COUNT(*) as total FROM reviews WHERE user_id = ?";

      const [reviews, totalResult] = await Promise.all([
        executeQuery(query, [userId]),
        executeQuery(countQuery, [userId]),
      ]);

      return {
        reviews: reviews.map((review) => new Review(review)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get reviews by room ID
  static async getByRoomId(roomId, page = 1, limit = 10) {
    try {
      // Ensure all parameters are integers
      const roomIdInt = parseInt(roomId);
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const offset = (pageInt - 1) * limitInt;

      const query = `
        SELECT r.*, u.full_name as customer_name, u.avatar as customer_avatar,
               b.check_in_date, b.check_out_date
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        WHERE b.room_id = ?
        ORDER BY r.created_at DESC
        LIMIT ${offset}, ${limitInt}
      `;
      const countQuery = `
        SELECT COUNT(*) as total
        FROM reviews r
        JOIN bookings b ON r.booking_id = b.id
        WHERE b.room_id = ?
      `;

      const [reviews, totalResult] = await Promise.all([
        executeQuery(query, [roomIdInt]),
        executeQuery(countQuery, [roomIdInt]),
      ]);

      return {
        reviews: reviews.map((review) => new Review(review)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find review by ID
  static async findById(id) {
    try {
      const query = `
        SELECT r.*, u.full_name as customer_name, u.avatar as customer_avatar,
               b.check_in_date, b.check_out_date, rm.room_number, rm.room_type
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        JOIN rooms rm ON b.room_id = rm.id
        WHERE r.id = ?
      `;
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new Review(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find review by booking ID
  static async findByBookingId(bookingId) {
    try {
      const query = `
        SELECT r.*, u.full_name as customer_name, u.avatar as customer_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.booking_id = ?
      `;
      const results = await executeQuery(query, [bookingId]);
      return results.length > 0 ? new Review(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Create new review
  static async create(reviewData) {
    try {
      // Validate booking exists and belongs to user
      const bookingQuery = `
        SELECT id, user_id, status 
        FROM bookings 
        WHERE id = ? AND user_id = ?
      `;
      const bookingResult = await executeQuery(bookingQuery, [
        reviewData.booking_id,
        reviewData.user_id,
      ]);

      if (bookingResult.length === 0) {
        throw new Error("Booking not found or does not belong to user");
      }

      const booking = bookingResult[0];
      if (booking.status !== "checked_out") {
        throw new Error("Can only review completed bookings");
      }

      // Check if review already exists for this booking
      const existingReview = await Review.findByBookingId(
        reviewData.booking_id
      );
      if (existingReview) {
        throw new Error("Review already exists for this booking");
      }

      // Create review
      const insertQuery = `
        INSERT INTO reviews (booking_id, user_id, rating, comment)
        VALUES (?, ?, ?, ?)
      `;

      const values = [
        reviewData.booking_id,
        reviewData.user_id,
        reviewData.rating,
        reviewData.comment || null,
      ];

      const result = await executeQuery(insertQuery, values);
      return await Review.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get review statistics
  static async getStatistics(filters = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
        FROM reviews r
        JOIN bookings b ON r.booking_id = b.id
        WHERE 1=1
      `;
      const queryParams = [];

      if (filters.room_id) {
        query += " AND b.room_id = ?";
        queryParams.push(filters.room_id);
      }

      if (filters.room_type) {
        query += " AND b.room_id IN (SELECT id FROM rooms WHERE room_type = ?)";
        queryParams.push(filters.room_type);
      }

      if (filters.start_date && filters.end_date) {
        query += " AND DATE(r.created_at) BETWEEN ? AND ?";
        queryParams.push(filters.start_date, filters.end_date);
      }

      const results = await executeQuery(query, queryParams);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get room average rating
  static async getRoomAverageRating(roomId) {
    try {
      const query = `
        SELECT AVG(r.rating) as average_rating, COUNT(r.id) as review_count
        FROM reviews r
        JOIN bookings b ON r.booking_id = b.id
        WHERE b.room_id = ?
      `;
      const results = await executeQuery(query, [roomId]);
      return {
        average_rating: results[0].average_rating || 0,
        review_count: results[0].review_count || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get recent reviews
  static async getRecentReviews(limit = 5) {
    try {
      const query = `
        SELECT r.*, u.full_name as customer_name, u.avatar as customer_avatar,
               rm.room_number, rm.room_type
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        JOIN rooms rm ON b.room_id = rm.id
        ORDER BY r.created_at DESC
        LIMIT ?
      `;
      const results = await executeQuery(query, [limit]);
      return results.map((review) => new Review(review));
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get top rated reviews
  static async getTopRatedReviews(limit = 5) {
    try {
      const query = `
        SELECT r.*, u.full_name as customer_name, u.avatar as customer_avatar,
               rm.room_number, rm.room_type
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        JOIN rooms rm ON b.room_id = rm.id
        WHERE r.rating >= 4 AND r.comment IS NOT NULL AND LENGTH(r.comment) > 10
        ORDER BY r.rating DESC, r.created_at DESC
        LIMIT ?
      `;
      const results = await executeQuery(query, [limit]);
      return results.map((review) => new Review(review));
    } catch (error) {
      throw error;
    }
  }

  // Instance methods

  // @desc    Update review
  async update(updateData) {
    try {
      const allowedFields = ["rating", "comment"];
      const updateFields = [];
      const values = [];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      }

      if (updateFields.length === 0) {
        return this;
      }

      values.push(this.id);
      const query = `UPDATE reviews SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

      await executeQuery(query, values);
      return await Review.findById(this.id);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Delete review
  async delete() {
    try {
      const query = "DELETE FROM reviews WHERE id = ?";
      await executeQuery(query, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Check if review can be edited (within 24 hours)
  canBeEdited() {
    const now = new Date();
    const createdAt = new Date(this.created_at);
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  }

  // @desc    Get rating stars as string
  getRatingStars() {
    return "★".repeat(this.rating) + "☆".repeat(5 - this.rating);
  }

  // @desc    Get rating color class
  getRatingColorClass() {
    if (this.rating >= 4) return "text-green-500";
    if (this.rating >= 3) return "text-yellow-500";
    if (this.rating >= 2) return "text-orange-500";
    return "text-red-500";
  }

  // @desc    Get formatted date
  getFormattedDate() {
    return new Date(this.created_at).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // @desc    Get review sentiment
  getReviewSentiment() {
    if (this.rating >= 4) return "positive";
    if (this.rating >= 3) return "neutral";
    return "negative";
  }

  // @desc    Check if review has comment
  hasComment() {
    return this.comment && this.comment.trim().length > 0;
  }

  // @desc    Get truncated comment
  getTruncatedComment(maxLength = 100) {
    if (!this.hasComment()) return "";

    if (this.comment.length <= maxLength) {
      return this.comment;
    }

    return this.comment.substring(0, maxLength).trim() + "...";
  }

  // @desc    Get random testimonials for homepage
  static async getRandomTestimonials(count = 3) {
    try {
      // Ensure count is a number
      const limit = parseInt(count) || 3;

      // First get all qualifying reviews
      const getAllQuery = `
        SELECT r.*, u.full_name as customer_name, u.avatar as customer_avatar,
               rm.room_number, rm.room_type
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        JOIN rooms rm ON b.room_id = rm.id
        WHERE r.rating >= 3 AND r.comment IS NOT NULL AND r.comment != ''
      `;

      const allResults = await executeQuery(getAllQuery);

      // Randomly shuffle and take the required count
      const shuffled = allResults.sort(() => 0.5 - Math.random());
      const results = shuffled.slice(0, limit);

      return results.map((reviewData) => {
        const review = new Review(reviewData);
        return {
          id: review.id,
          name: reviewData.customer_name || "Khách hàng",
          role: this.getRoleByRoomType(reviewData.room_type),
          image: reviewData.customer_avatar || this.getDefaultAvatar(),
          rating: review.rating,
          comment: review.comment,
          room_type: reviewData.room_type,
          room_number: reviewData.room_number,
        };
      });
    } catch (error) {
      console.error("Error fetching random testimonials:", error);
      throw error;
    }
  }

  // @desc    Get role description based on room type
  static getRoleByRoomType(roomType) {
    const roleMap = {
      single: "Du khách",
      double: "Cặp đôi",
      suite: "Khách VIP",
      family: "Gia đình",
      deluxe: "Khách doanh nhân",
    };
    return roleMap[roomType] || "Khách hàng";
  }

  // @desc    Get default avatar based on name hash
  static getDefaultAvatar() {
    const avatars = [
      "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  // @desc    Get JSON representation
  toJSON() {
    return {
      ...this,
      rating_stars: this.getRatingStars(),
      rating_color_class: this.getRatingColorClass(),
      formatted_date: this.getFormattedDate(),
      review_sentiment: this.getReviewSentiment(),
      has_comment: this.hasComment(),
      truncated_comment: this.getTruncatedComment(),
      can_be_edited: this.canBeEdited(),
    };
  }
}

module.exports = Review;
