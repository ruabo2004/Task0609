const { pool } = require("../config/database");

class Review {
  constructor(data) {
    this.review_id = data.review_id;
    this.booking_id = data.booking_id;
    this.customer_id = data.customer_id;
    this.room_id = data.room_id;
    this.rating = data.rating;
    this.cleanliness_rating = data.cleanliness_rating;
    this.service_rating = data.service_rating;
    this.location_rating = data.location_rating;
    this.value_rating = data.value_rating;
    this.amenities_rating = data.amenities_rating;
    this.title = data.title;
    this.comment = data.comment;
    this.pros = data.pros;
    this.cons = data.cons;
    this.images = data.images;
    this.helpful_count = data.helpful_count;
    this.verified_stay = data.verified_stay;
    this.review_status = data.review_status;
    this.admin_response = data.admin_response;
    this.admin_response_date = data.admin_response_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;

    // Additional fields from joins
    this.customer_name = data.customer_name;
    this.room_number = data.room_number;
    this.room_name = data.room_name;
    this.booking_code = data.booking_code;
  }

  /**
   * Create a new review
   */
  static async create(reviewData) {
    const {
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
    } = reviewData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO reviews 
         (booking_id, customer_id, room_id, rating, cleanliness_rating, service_rating,
          location_rating, value_rating, amenities_rating, title, comment, pros, cons, images)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
          JSON.stringify(images || []),
        ]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating review: ${error.message}`);
    }
  }

  /**
   * Find review by ID
   */
  static async findById(review_id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM reviews WHERE review_id = ?",
        [review_id]
      );

      if (rows.length === 0) return null;

      const reviewData = rows[0];
      if (reviewData.images) {
        reviewData.images = JSON.parse(reviewData.images);
      }

      return new Review(reviewData);
    } catch (error) {
      throw new Error(`Error finding review: ${error.message}`);
    }
  }

  /**
   * Find review by ID with customer and room details
   */
  static async findByIdWithDetails(review_id) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, c.full_name as customer_name, rm.room_number, rm.room_name, b.booking_code
         FROM reviews r
         JOIN customers c ON r.customer_id = c.customer_id
         JOIN rooms rm ON r.room_id = rm.room_id
         JOIN bookings b ON r.booking_id = b.booking_id
         WHERE r.review_id = ?`,
        [review_id]
      );

      if (rows.length === 0) return null;

      const reviewData = rows[0];
      if (reviewData.images) {
        reviewData.images = JSON.parse(reviewData.images);
      }

      return new Review(reviewData);
    } catch (error) {
      throw new Error(`Error finding review with details: ${error.message}`);
    }
  }

  /**
   * Find review by booking ID
   */
  static async findByBookingId(booking_id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM reviews WHERE booking_id = ?",
        [booking_id]
      );

      if (rows.length === 0) return null;

      const reviewData = rows[0];
      if (reviewData.images) {
        reviewData.images = JSON.parse(reviewData.images);
      }

      return new Review(reviewData);
    } catch (error) {
      throw new Error(`Error finding review by booking: ${error.message}`);
    }
  }

  /**
   * Get reviews by room ID with pagination and filters
   */
  static async getByRoomId(filters = {}) {
    try {
      const {
        room_id,
        status = "approved",
        min_rating,
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "desc",
      } = filters;

      let query = `
        SELECT r.*, c.full_name as customer_name, b.booking_code
        FROM reviews r
        JOIN customers c ON r.customer_id = c.customer_id
        JOIN bookings b ON r.booking_id = b.booking_id
        WHERE r.room_id = ?
      `;
      const queryParams = [room_id];

      if (status) {
        query += " AND r.review_status = ?";
        queryParams.push(status);
      }

      if (min_rating) {
        query += " AND r.rating >= ?";
        queryParams.push(min_rating);
      }

      // Add sorting
      const validSortFields = ["created_at", "rating", "helpful_count"];
      const sortField = validSortFields.includes(sortBy)
        ? sortBy
        : "created_at";
      const sortDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";
      query += ` ORDER BY r.${sortField} ${sortDirection}`;

      // Add pagination
      const offset = (page - 1) * limit;
      query += " LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      const [rows] = await pool.execute(query, queryParams);

      // Get total count
      let countQuery =
        "SELECT COUNT(*) as total FROM reviews WHERE room_id = ?";
      const countParams = [room_id];

      if (status) {
        countQuery += " AND review_status = ?";
        countParams.push(status);
      }

      if (min_rating) {
        countQuery += " AND rating >= ?";
        countParams.push(min_rating);
      }

      const [countRows] = await pool.execute(countQuery, countParams);
      const total = countRows[0].total;

      const reviews = rows.map((reviewData) => {
        if (reviewData.images) {
          reviewData.images = JSON.parse(reviewData.images);
        }
        return new Review(reviewData);
      });

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error getting room reviews: ${error.message}`);
    }
  }

  /**
   * Get reviews by customer ID
   */
  static async getByCustomerId(filters = {}) {
    try {
      const {
        customer_id,
        status,
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "desc",
      } = filters;

      let query = `
        SELECT r.*, rm.room_number, rm.room_name, b.booking_code
        FROM reviews r
        JOIN rooms rm ON r.room_id = rm.room_id
        JOIN bookings b ON r.booking_id = b.booking_id
        WHERE r.customer_id = ?
      `;
      const queryParams = [customer_id];

      if (status) {
        query += " AND r.review_status = ?";
        queryParams.push(status);
      }

      // Add sorting
      const validSortFields = ["created_at", "rating", "review_status"];
      const sortField = validSortFields.includes(sortBy)
        ? sortBy
        : "created_at";
      const sortDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";
      query += ` ORDER BY r.${sortField} ${sortDirection}`;

      // Add pagination
      const offset = (page - 1) * limit;
      query += " LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      const [rows] = await pool.execute(query, queryParams);

      // Get total count
      let countQuery =
        "SELECT COUNT(*) as total FROM reviews WHERE customer_id = ?";
      const countParams = [customer_id];

      if (status) {
        countQuery += " AND review_status = ?";
        countParams.push(status);
      }

      const [countRows] = await pool.execute(countQuery, countParams);
      const total = countRows[0].total;

      const reviews = rows.map((reviewData) => {
        if (reviewData.images) {
          reviewData.images = JSON.parse(reviewData.images);
        }
        return new Review(reviewData);
      });

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error getting customer reviews: ${error.message}`);
    }
  }

  /**
   * Get all reviews with filters (Admin)
   */
  static async getAllWithFilters(filters = {}) {
    try {
      const {
        status,
        room_id,
        customer_id,
        min_rating,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "desc",
      } = filters;

      let query = `
        SELECT r.*, c.full_name as customer_name, rm.room_number, rm.room_name, b.booking_code
        FROM reviews r
        JOIN customers c ON r.customer_id = c.customer_id
        JOIN rooms rm ON r.room_id = rm.room_id
        JOIN bookings b ON r.booking_id = b.booking_id
        WHERE 1=1
      `;
      const queryParams = [];

      if (status) {
        query += " AND r.review_status = ?";
        queryParams.push(status);
      }

      if (room_id) {
        query += " AND r.room_id = ?";
        queryParams.push(room_id);
      }

      if (customer_id) {
        query += " AND r.customer_id = ?";
        queryParams.push(customer_id);
      }

      if (min_rating) {
        query += " AND r.rating >= ?";
        queryParams.push(min_rating);
      }

      // Add sorting
      const validSortFields = [
        "created_at",
        "rating",
        "review_status",
        "helpful_count",
      ];
      const sortField = validSortFields.includes(sortBy)
        ? sortBy
        : "created_at";
      const sortDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";
      query += ` ORDER BY r.${sortField} ${sortDirection}`;

      // Add pagination
      const offset = (page - 1) * limit;
      query += " LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      const [rows] = await pool.execute(query, queryParams);

      // Get total count
      let countQuery = "SELECT COUNT(*) as total FROM reviews r WHERE 1=1";
      const countParams = [];

      if (status) {
        countQuery += " AND r.review_status = ?";
        countParams.push(status);
      }

      if (room_id) {
        countQuery += " AND r.room_id = ?";
        countParams.push(room_id);
      }

      if (customer_id) {
        countQuery += " AND r.customer_id = ?";
        countParams.push(customer_id);
      }

      if (min_rating) {
        countQuery += " AND r.rating >= ?";
        countParams.push(min_rating);
      }

      const [countRows] = await pool.execute(countQuery, countParams);
      const total = countRows[0].total;

      const reviews = rows.map((reviewData) => {
        if (reviewData.images) {
          reviewData.images = JSON.parse(reviewData.images);
        }
        return new Review(reviewData);
      });

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error getting reviews with filters: ${error.message}`);
    }
  }

  /**
   * Update review
   */
  static async update(review_id, updateData) {
    try {
      const fieldsToUpdate = [];
      const values = [];

      const updatableFields = [
        "rating",
        "cleanliness_rating",
        "service_rating",
        "location_rating",
        "value_rating",
        "amenities_rating",
        "title",
        "comment",
        "pros",
        "cons",
        "images",
      ];

      updatableFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          fieldsToUpdate.push(`${field} = ?`);

          if (field === "images") {
            values.push(JSON.stringify(updateData[field]));
          } else {
            values.push(updateData[field]);
          }
        }
      });

      if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields to update");
      }

      values.push(review_id);

      await pool.execute(
        `UPDATE reviews SET ${fieldsToUpdate.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP WHERE review_id = ?`,
        values
      );

      return await this.findById(review_id);
    } catch (error) {
      throw new Error(`Error updating review: ${error.message}`);
    }
  }

  /**
   * Update review status (Admin)
   */
  static async updateStatus(review_id, status, admin_response = null) {
    try {
      const updateQuery = admin_response
        ? "UPDATE reviews SET review_status = ?, admin_response = ?, admin_response_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE review_id = ?"
        : "UPDATE reviews SET review_status = ?, updated_at = CURRENT_TIMESTAMP WHERE review_id = ?";

      const params = admin_response
        ? [status, admin_response, review_id]
        : [status, review_id];

      await pool.execute(updateQuery, params);

      return await this.findById(review_id);
    } catch (error) {
      throw new Error(`Error updating review status: ${error.message}`);
    }
  }

  /**
   * Delete review
   */
  static async delete(review_id) {
    try {
      await pool.execute("DELETE FROM reviews WHERE review_id = ?", [
        review_id,
      ]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting review: ${error.message}`);
    }
  }

  /**
   * Increment helpful count
   */
  static async incrementHelpfulCount(review_id) {
    try {
      await pool.execute(
        "UPDATE reviews SET helpful_count = helpful_count + 1 WHERE review_id = ?",
        [review_id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error incrementing helpful count: ${error.message}`);
    }
  }

  /**
   * Get room review statistics
   */
  static async getRoomStatistics(room_id) {
    try {
      const [stats] = await pool.execute(
        `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating,
          AVG(cleanliness_rating) as avg_cleanliness,
          AVG(service_rating) as avg_service,
          AVG(location_rating) as avg_location,
          AVG(value_rating) as avg_value,
          AVG(amenities_rating) as avg_amenities,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
        FROM reviews 
        WHERE room_id = ? AND review_status = 'approved'
      `,
        [room_id]
      );

      return stats[0];
    } catch (error) {
      throw new Error(`Error getting room review statistics: ${error.message}`);
    }
  }

  /**
   * Get review analytics (Admin)
   */
  static async getAnalytics(timeframe = "30d") {
    try {
      let dateFilter = "";

      switch (timeframe) {
        case "7d":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
          break;
        case "30d":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
          break;
        case "90d":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)";
          break;
        case "1y":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
          break;
        default:
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      }

      // Overall statistics
      const [overallStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN review_status = 'pending' THEN 1 END) as pending_reviews,
          COUNT(CASE WHEN review_status = 'approved' THEN 1 END) as approved_reviews,
          COUNT(CASE WHEN review_status = 'rejected' THEN 1 END) as rejected_reviews,
          SUM(helpful_count) as total_helpful_votes
        FROM reviews 
        WHERE ${dateFilter}
      `);

      // Rating distribution
      const [ratingDist] = await pool.execute(`
        SELECT 
          rating,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reviews WHERE ${dateFilter})), 2) as percentage
        FROM reviews 
        WHERE ${dateFilter}
        GROUP BY rating
        ORDER BY rating DESC
      `);

      // Top rated rooms
      const [topRooms] = await pool.execute(`
        SELECT 
          r.room_id,
          rm.room_number,
          rm.room_name,
          AVG(r.rating) as average_rating,
          COUNT(r.review_id) as review_count
        FROM reviews r
        JOIN rooms rm ON r.room_id = rm.room_id
        WHERE ${dateFilter} AND r.review_status = 'approved'
        GROUP BY r.room_id, rm.room_number, rm.room_name
        HAVING review_count >= 3
        ORDER BY average_rating DESC, review_count DESC
        LIMIT 10
      `);

      return {
        timeframe,
        overall_statistics: overallStats[0],
        rating_distribution: ratingDist,
        top_rated_rooms: topRooms,
      };
    } catch (error) {
      throw new Error(`Error getting review analytics: ${error.message}`);
    }
  }

  toJSON() {
    return {
      review_id: this.review_id,
      booking_id: this.booking_id,
      customer_id: this.customer_id,
      room_id: this.room_id,
      rating: this.rating,
      cleanliness_rating: this.cleanliness_rating,
      service_rating: this.service_rating,
      location_rating: this.location_rating,
      value_rating: this.value_rating,
      amenities_rating: this.amenities_rating,
      title: this.title,
      comment: this.comment,
      pros: this.pros,
      cons: this.cons,
      images: this.images,
      helpful_count: this.helpful_count,
      verified_stay: this.verified_stay,
      review_status: this.review_status,
      admin_response: this.admin_response,
      admin_response_date: this.admin_response_date,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Additional fields from joins
      customer_name: this.customer_name,
      room_number: this.room_number,
      room_name: this.room_name,
      booking_code: this.booking_code,
    };
  }
}

module.exports = Review;
