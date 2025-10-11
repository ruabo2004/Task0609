// Room Model
// Will be implemented in Week 3

const { executeQuery } = require("../config/database");

class Room {
  constructor(roomData) {
    this.id = roomData.id;
    this.room_number = roomData.room_number;
    this.room_type = roomData.room_type;
    this.capacity = roomData.capacity;
    this.price_per_night = roomData.price_per_night;
    this.description = roomData.description;
    this.amenities = roomData.amenities;
    this.images = roomData.images;
    this.status = roomData.status;
    this.created_at = roomData.created_at;
    this.updated_at = roomData.updated_at;
  }

  // Static methods for database operations

  // @desc    Get all rooms with filters
  static async getAll(filters = {}) {
    try {
      // TODO: Implement in Week 3
      let query = "SELECT * FROM rooms WHERE 1=1";
      const queryParams = [];

      if (filters.room_type) {
        query += " AND room_type = ?";
        queryParams.push(filters.room_type);
      }

      if (filters.status) {
        query += " AND status = ?";
        queryParams.push(filters.status);
      }

      if (filters.min_price) {
        query += " AND price_per_night >= ?";
        queryParams.push(filters.min_price);
      }

      if (filters.max_price) {
        query += " AND price_per_night <= ?";
        queryParams.push(filters.max_price);
      }

      query += " ORDER BY room_number ASC";

      const results = await executeQuery(query, queryParams);
      return results.map((room) => new Room(room));
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get all rooms with average rating
  static async getAllWithRating(filters = {}) {
    try {
      let query = `
        SELECT r.*, 
               COALESCE(AVG(rv.rating), 4.5) as average_rating,
               COUNT(rv.id) as review_count
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id
        LEFT JOIN reviews rv ON b.id = rv.booking_id
        WHERE 1=1
      `;
      const queryParams = [];

      if (filters.room_type) {
        query += " AND r.room_type = ?";
        queryParams.push(filters.room_type);
      }

      if (filters.status) {
        query += " AND r.status = ?";
        queryParams.push(filters.status);
      }

      if (filters.min_price) {
        query += " AND r.price_per_night >= ?";
        queryParams.push(filters.min_price);
      }

      if (filters.max_price) {
        query += " AND r.price_per_night <= ?";
        queryParams.push(filters.max_price);
      }

      query += " GROUP BY r.id";

      // Default order by rating desc for featured rooms
      if (filters.featured) {
        query += " ORDER BY average_rating DESC, r.price_per_night ASC";
      } else {
        query += " ORDER BY r.room_number ASC";
      }

      const results = await executeQuery(query, queryParams);
      return results.map((room) => {
        const roomInstance = new Room(room);
        roomInstance.average_rating = parseFloat(room.average_rating);
        roomInstance.review_count = parseInt(room.review_count);
        return roomInstance;
      });
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find room by ID
  static async findById(id) {
    try {
      // TODO: Implement in Week 3
      const query = "SELECT * FROM rooms WHERE id = ?";
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new Room(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find room by room number
  static async findByRoomNumber(roomNumber) {
    try {
      // TODO: Implement in Week 3
      const query = "SELECT * FROM rooms WHERE room_number = ?";
      const results = await executeQuery(query, [roomNumber]);
      return results.length > 0 ? new Room(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get available rooms for date range
  static async getAvailable(checkIn, checkOut, roomType = null, guests = null) {
    try {
      const query = "CALL GetAvailableRooms(?, ?, ?, ?)";
      const results = await executeQuery(query, [
        checkIn,
        checkOut,
        roomType,
        guests,
      ]);
      return results[0].map((room) => new Room(room));
    } catch (error) {
      throw error;
    }
  }

  // @desc    Create new room
  static async create(roomData) {
    try {
      // TODO: Implement in Week 3
      const query = `
        INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, amenities, images, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        roomData.room_number,
        roomData.room_type,
        roomData.capacity,
        roomData.price_per_night,
        roomData.description || null,
        JSON.stringify(roomData.amenities || []),
        JSON.stringify(roomData.images || []),
        roomData.status || "available",
      ];

      const result = await executeQuery(query, values);
      return await Room.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Instance methods

  // @desc    Update room data
  async update(updateData) {
    try {
      // TODO: Implement in Week 3
      const allowedFields = [
        "room_number",
        "room_type",
        "capacity",
        "price_per_night",
        "description",
        "amenities",
        "images",
        "status",
      ];

      const updateFields = [];
      const values = [];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          if (field === "amenities" || field === "images") {
            updateFields.push(`${field} = ?`);
            values.push(JSON.stringify(updateData[field]));
          } else {
            updateFields.push(`${field} = ?`);
            values.push(updateData[field]);
          }
        }
      }

      if (updateFields.length === 0) {
        return this;
      }

      values.push(this.id);
      const query = `UPDATE rooms SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

      await executeQuery(query, values);
      return await Room.findById(this.id);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Delete room
  async delete() {
    try {
      // TODO: Implement in Week 3
      const query = "DELETE FROM rooms WHERE id = ?";
      await executeQuery(query, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Update room status
  async updateStatus(newStatus) {
    try {
      // TODO: Implement in Week 3
      const query =
        "UPDATE rooms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      await executeQuery(query, [newStatus, this.id]);
      this.status = newStatus;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get all rooms with pagination
  static async getAllPaginated(filters = {}, page = 1, limit = 12) {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = "SELECT * FROM rooms WHERE 1=1";
      let countQuery = "SELECT COUNT(*) as total FROM rooms WHERE 1=1";
      const queryParams = [];
      const countParams = [];

      // Apply filters
      if (filters.room_type) {
        query += " AND room_type = ?";
        countQuery += " AND room_type = ?";
        queryParams.push(filters.room_type);
        countParams.push(filters.room_type);
      }

      if (filters.status) {
        query += " AND status = ?";
        countQuery += " AND status = ?";
        queryParams.push(filters.status);
        countParams.push(filters.status);
      }

      if (filters.min_price) {
        query += " AND price_per_night >= ?";
        countQuery += " AND price_per_night >= ?";
        queryParams.push(filters.min_price);
        countParams.push(filters.min_price);
      }

      if (filters.max_price) {
        query += " AND price_per_night <= ?";
        countQuery += " AND price_per_night <= ?";
        queryParams.push(filters.max_price);
        countParams.push(filters.max_price);
      }

      if (filters.search) {
        const searchValue = filters.search.trim();

        // If search looks like a room number (only digits), search room_number only
        if (/^\d+$/.test(searchValue)) {
          query += " AND room_number = ?";
          countQuery += " AND room_number = ?";
          queryParams.push(searchValue);
          countParams.push(searchValue);
        } else {
          // Otherwise, search across all fields
          query +=
            " AND (room_number LIKE ? OR description LIKE ? OR room_type LIKE ?)";
          countQuery +=
            " AND (room_number LIKE ? OR description LIKE ? OR room_type LIKE ?)";
          const searchTerm = `%${searchValue}%`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
          countParams.push(searchTerm, searchTerm, searchTerm);
        }
      }

      // Apply sorting
      if (filters.sort) {
        switch (filters.sort) {
          case "price_asc":
            query += " ORDER BY price_per_night ASC";
            break;
          case "price_desc":
            query += " ORDER BY price_per_night DESC";
            break;
          case "name_asc":
            query += " ORDER BY room_number ASC";
            break;
          case "name_desc":
            query += " ORDER BY room_number DESC";
            break;
          default:
            query += " ORDER BY room_number ASC";
        }
      } else {
        query += " ORDER BY room_number ASC";
      }

      // Add pagination
      // Add pagination (use string interpolation due to MySQL prepared statement limitations)
      const safeLimit = Math.max(1, Math.min(100, parseInt(limit))); // Validate limit 1-100
      const safeOffset = Math.max(0, parseInt(offset)); // Validate offset >= 0
      query += ` LIMIT ${safeOffset}, ${safeLimit}`;

      // Execute queries
      const [rooms, countResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, countParams),
      ]);

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        rooms: rooms.map((room) => new Room(room).toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get all rooms with rating and pagination
  static async getAllWithRatingPaginated(filters = {}, page = 1, limit = 12) {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = `
        SELECT r.*, 
               COALESCE(AVG(rv.rating), 4.5) as average_rating,
               COUNT(rv.id) as review_count
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id
        LEFT JOIN reviews rv ON b.id = rv.booking_id
        WHERE 1=1
      `;

      let countQuery = `
        SELECT COUNT(DISTINCT r.id) as total
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id
        LEFT JOIN reviews rv ON b.id = rv.booking_id
        WHERE 1=1
      `;

      const queryParams = [];
      const countParams = [];

      // Apply filters (same as getAllPaginated)
      if (filters.room_type) {
        query += " AND r.room_type = ?";
        countQuery += " AND r.room_type = ?";
        queryParams.push(filters.room_type);
        countParams.push(filters.room_type);
      }

      if (filters.status) {
        query += " AND r.status = ?";
        countQuery += " AND r.status = ?";
        queryParams.push(filters.status);
        countParams.push(filters.status);
      }

      if (filters.min_price) {
        query += " AND r.price_per_night >= ?";
        countQuery += " AND r.price_per_night >= ?";
        queryParams.push(filters.min_price);
        countParams.push(filters.min_price);
      }

      if (filters.max_price) {
        query += " AND r.price_per_night <= ?";
        countQuery += " AND r.price_per_night <= ?";
        queryParams.push(filters.max_price);
        countParams.push(filters.max_price);
      }

      if (filters.search) {
        const searchValue = filters.search.trim();

        // If search looks like a room number (only digits), search room_number only
        if (/^\d+$/.test(searchValue)) {
          query += " AND r.room_number = ?";
          countQuery += " AND r.room_number = ?";
          queryParams.push(searchValue);
          countParams.push(searchValue);
        } else {
          // Otherwise, search across all fields
          query +=
            " AND (r.room_number LIKE ? OR r.description LIKE ? OR r.room_type LIKE ?)";
          countQuery +=
            " AND (r.room_number LIKE ? OR r.description LIKE ? OR r.room_type LIKE ?)";
          const searchTerm = `%${searchValue}%`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
          countParams.push(searchTerm, searchTerm, searchTerm);
        }
      }

      query += " GROUP BY r.id";

      // Apply sorting
      if (filters.featured || filters.sort === "rating") {
        query += " ORDER BY average_rating DESC, r.price_per_night ASC";
      } else if (filters.sort) {
        switch (filters.sort) {
          case "price_asc":
            query += " ORDER BY r.price_per_night ASC";
            break;
          case "price_desc":
            query += " ORDER BY r.price_per_night DESC";
            break;
          case "name_asc":
            query += " ORDER BY r.room_number ASC";
            break;
          case "name_desc":
            query += " ORDER BY r.room_number DESC";
            break;
          default:
            query += " ORDER BY r.room_number ASC";
        }
      } else {
        query += " ORDER BY r.room_number ASC";
      }

      // Add pagination
      // Add pagination (use string interpolation due to MySQL prepared statement limitations)
      const safeLimit = Math.max(1, Math.min(100, parseInt(limit))); // Validate limit 1-100
      const safeOffset = Math.max(0, parseInt(offset)); // Validate offset >= 0
      query += ` LIMIT ${safeOffset}, ${safeLimit}`;

      // Execute queries
      const [rooms, countResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, countParams),
      ]);

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const roomsWithRating = rooms.map((room) => {
        const roomInstance = new Room(room);
        const roomJSON = roomInstance.toJSON();
        roomJSON.average_rating = parseFloat(room.average_rating);
        roomJSON.review_count = parseInt(room.review_count);
        roomJSON.rating = parseFloat(room.average_rating); // Add rating alias for frontend
        return roomJSON;
      });

      return {
        rooms: roomsWithRating,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get room data with parsed JSON fields
  toJSON() {
    // Parse images
    let parsedImages =
      typeof this.images === "string" ? JSON.parse(this.images) : this.images;

    // Add /uploads/rooms/ prefix if images don't already have it
    if (Array.isArray(parsedImages)) {
      parsedImages = parsedImages.map((img) => {
        if (img && !img.startsWith("http") && !img.startsWith("/uploads/")) {
          return `/uploads/rooms/${img}`;
        }
        return img;
      });
    }

    return {
      ...this,
      amenities:
        typeof this.amenities === "string"
          ? JSON.parse(this.amenities)
          : this.amenities,
      images: parsedImages,
    };
  }
}

module.exports = Room;
