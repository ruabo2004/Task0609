// Admin Room Controller
// Handles CRUD operations for rooms

const { executeQuery } = require("../../config/database");
const { success } = require("../../utils/responseHelper");
const { ErrorFactory } = require("../../utils/errors");
const {
  addCalculatedSizeToRooms,
  addCalculatedSize,
} = require("../../utils/roomUtils");

const roomController = {
  // @desc    Get all rooms with filters (Admin view)
  // @route   GET /api/admin/rooms
  // @access  Private/Admin
  getAll: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        search,
        sort_by = "created_at",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const limitInt = parseInt(limit);
      const offsetInt = parseInt(offset);

      // Validate sort_by to prevent SQL injection
      const validSortFields = [
        "id",
        "room_number",
        "room_type",
        "price_per_night",
        "capacity",
        "status",
        "created_at",
        "updated_at",
      ];
      const sortBy = validSortFields.includes(sort_by) ? sort_by : "created_at";
      const orderBy = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Build WHERE clause
      let whereConditions = [];
      let params = [];

      if (status && status !== "all") {
        whereConditions.push("r.status = ?");
        params.push(status);
      }

      if (type && type !== "all") {
        whereConditions.push("r.room_type = ?");
        params.push(type);
      }

      if (search) {
        whereConditions.push(
          "(room_number LIKE ? OR description LIKE ? OR amenities LIKE ?)"
        );
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";

      // Get rooms with booking count
      const roomsQuery = `
        SELECT 
          r.*,
          COUNT(DISTINCT b.id) as total_bookings,
          COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'checked_in') THEN 1 ELSE 0 END), 0) as active_bookings
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id
        ${whereClause}
        GROUP BY r.id
        ORDER BY r.${sortBy} ${orderBy}
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;

      // Count total
      const countQuery = `
        SELECT COUNT(DISTINCT r.id) as total
        FROM rooms r
        ${whereClause}
      `;

      const [rooms, totalResult] = await Promise.all([
        executeQuery(roomsQuery, params),
        executeQuery(countQuery, params),
      ]);

      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const roomsWithCalculatedSize = rooms.map((room) => {
        const roomData = {
          ...room,
          amenities:
            typeof room.amenities === "string"
              ? JSON.parse(room.amenities || "[]")
              : room.amenities,
          images:
            typeof room.images === "string"
              ? JSON.parse(room.images || "[]")
              : room.images,
          total_bookings: parseInt(room.total_bookings),
          active_bookings: parseInt(room.active_bookings),
        };
        return addCalculatedSize(roomData);
      });

      return success(res, {
        rooms: roomsWithCalculatedSize,
        pagination: {
          page: parseInt(page),
          limit: limitInt,
          total,
          totalPages,
        },
      });
    } catch (err) {
      console.error("Error in getAll rooms:", err);
      next(err);
    }
  },

  // @desc    Get room by ID with full details
  // @route   GET /api/admin/rooms/:id
  // @access  Private/Admin
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Get room details
      const roomQuery = `
        SELECT 
          r.*,
          COUNT(DISTINCT b.id) as total_bookings,
          COALESCE(AVG(rev.rating), 0) as avg_rating,
          COUNT(DISTINCT rev.id) as total_reviews
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id
        LEFT JOIN reviews rev ON b.id = rev.booking_id
        WHERE r.id = ?
        GROUP BY r.id
      `;

      // Get recent bookings for this room
      const bookingsQuery = `
        SELECT 
          b.id,
          b.check_in_date,
          b.check_out_date,
          b.status,
          b.total_amount,
          u.full_name as customer_name,
          u.email as customer_email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.room_id = ?
        ORDER BY b.created_at DESC
        LIMIT 10
      `;

      const [roomResult, bookings] = await Promise.all([
        executeQuery(roomQuery, [id]),
        executeQuery(bookingsQuery, [id]),
      ]);

      if (roomResult.length === 0) {
        throw ErrorFactory.notFound("Room not found");
      }

      const room = roomResult[0];

      const roomData = {
        ...room,
        amenities:
          typeof room.amenities === "string"
            ? JSON.parse(room.amenities || "[]")
            : room.amenities,
        images:
          typeof room.images === "string"
            ? JSON.parse(room.images || "[]")
            : room.images,
        total_bookings: parseInt(room.total_bookings),
        avg_rating: parseFloat(room.avg_rating).toFixed(1),
        total_reviews: parseInt(room.total_reviews),
        recent_bookings: bookings,
      };

      const roomWithSize = addCalculatedSize(roomData);

      return success(res, roomWithSize);
    } catch (err) {
      console.error("Error in getById room:", err);
      next(err);
    }
  },

  // @desc    Create new room
  // @route   POST /api/admin/rooms
  // @access  Private/Admin
  create: async (req, res, next) => {
    try {
      const {
        room_number,
        room_type,
        price_per_night,
        description,
        capacity,
        amenities = [],
        images = [],
        status = "available",
      } = req.body;

      // Validate required fields
      if (!room_number || !room_type || !price_per_night || !capacity) {
        throw ErrorFactory.validation(
          "Room number, type, price, and capacity are required"
        );
      }

      // Validate room_type
      const validTypes = ["single", "double", "suite", "family"];
      if (!validTypes.includes(room_type)) {
        throw ErrorFactory.validation(
          `Invalid room type. Must be one of: ${validTypes.join(", ")}`
        );
      }

      // Check if room number already exists
      const checkQuery = "SELECT id FROM rooms WHERE room_number = ?";
      const existing = await executeQuery(checkQuery, [room_number]);

      if (existing.length > 0) {
        throw ErrorFactory.validation("Room number already exists");
      }

      // Insert room
      const insertQuery = `
        INSERT INTO rooms (
          room_number, room_type, price_per_night, description,
          capacity, amenities, images, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        room_number,
        room_type,
        price_per_night,
        description || null,
        capacity,
        Array.isArray(amenities) ? JSON.stringify(amenities) : amenities,
        Array.isArray(images) ? JSON.stringify(images) : images,
        status,
      ]);

      // Get created room
      const createdRoom = await executeQuery(
        "SELECT * FROM rooms WHERE id = ?",
        [result.insertId]
      );

      const room = createdRoom[0];
      const roomData = {
        ...room,
        amenities:
          typeof room.amenities === "string"
            ? JSON.parse(room.amenities)
            : room.amenities,
        images:
          typeof room.images === "string"
            ? JSON.parse(room.images)
            : room.images,
      };

      const roomWithSize = addCalculatedSize(roomData);

      return success(res, roomWithSize, "Room created successfully", 201);
    } catch (err) {
      console.error("Error in create room:", err);
      next(err);
    }
  },

  // @desc    Update room
  // @route   PUT /api/admin/rooms/:id
  // @access  Private/Admin
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        room_number,
        room_type,
        price_per_night,
        description,
        capacity,
        amenities,
        images,
        status,
      } = req.body;

      // Check if room exists
      const checkQuery = "SELECT id FROM rooms WHERE id = ?";
      const existing = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        throw ErrorFactory.notFound("Room not found");
      }

      // If room_number is being changed, check for duplicates
      if (room_number) {
        const duplicateQuery =
          "SELECT id FROM rooms WHERE room_number = ? AND id != ?";
        const duplicate = await executeQuery(duplicateQuery, [room_number, id]);

        if (duplicate.length > 0) {
          throw ErrorFactory.validation("Room number already exists");
        }
      }

      // Build update query dynamically
      const updates = [];
      const params = [];

      if (room_number !== undefined) {
        updates.push("room_number = ?");
        params.push(room_number);
      }
      if (room_type !== undefined) {
        updates.push("room_type = ?");
        params.push(room_type);
      }
      if (price_per_night !== undefined) {
        updates.push("price_per_night = ?");
        params.push(price_per_night);
      }
      if (description !== undefined) {
        updates.push("description = ?");
        params.push(description);
      }
      if (capacity !== undefined) {
        updates.push("capacity = ?");
        params.push(capacity);
      }
      if (amenities !== undefined) {
        updates.push("amenities = ?");
        params.push(
          typeof amenities === "string" ? amenities : JSON.stringify(amenities)
        );
      }
      if (images !== undefined) {
        updates.push("images = ?");
        params.push(
          typeof images === "string" ? images : JSON.stringify(images)
        );
      }
      if (status !== undefined) {
        updates.push("status = ?");
        params.push(status);
      }

      if (updates.length === 0) {
        throw ErrorFactory.validation("No fields to update");
      }

      updates.push("updated_at = NOW()");
      params.push(id);

      const updateQuery = `
        UPDATE rooms 
        SET ${updates.join(", ")}
        WHERE id = ?
      `;

      await executeQuery(updateQuery, params);

      // Get updated room
      const updatedRoom = await executeQuery(
        "SELECT * FROM rooms WHERE id = ?",
        [id]
      );

      const room = updatedRoom[0];
      const roomData = {
        ...room,
        amenities:
          typeof room.amenities === "string"
            ? JSON.parse(room.amenities)
            : room.amenities,
        images:
          typeof room.images === "string"
            ? JSON.parse(room.images)
            : room.images,
      };

      const roomWithSize = addCalculatedSize(roomData);

      return success(res, roomWithSize);
    } catch (err) {
      console.error("Error in update room:", err);
      next(err);
    }
  },

  // @desc    Delete room (soft delete)
  // @route   DELETE /api/admin/rooms/:id
  // @access  Private/Admin
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if room exists
      const checkQuery = "SELECT id, room_number FROM rooms WHERE id = ?";
      const existing = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        throw ErrorFactory.notFound("Room not found");
      }

      // Check for active bookings
      const activeBookingsQuery = `
        SELECT COUNT(*) as count 
        FROM bookings 
        WHERE room_id = ? 
        AND status IN ('confirmed', 'checked_in', 'pending')
      `;
      const activeBookings = await executeQuery(activeBookingsQuery, [id]);

      if (activeBookings[0].count > 0) {
        throw ErrorFactory.validation(
          "Cannot delete room with active bookings. Cancel or complete bookings first."
        );
      }

      // Hard delete since status doesn't have 'deleted' in ENUM
      await executeQuery("DELETE FROM rooms WHERE id = ?", [id]);

      return success(res, null, "Room deleted successfully");
    } catch (err) {
      console.error("Error in delete room:", err);
      next(err);
    }
  },

  // @desc    Update room status
  // @route   PATCH /api/admin/rooms/:id/status
  // @access  Private/Admin
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw ErrorFactory.validation("Status is required");
      }

      const validStatuses = ["available", "occupied", "maintenance", "deleted"];
      if (!validStatuses.includes(status)) {
        throw ErrorFactory.validation("Invalid status");
      }

      // Check if room exists
      const checkQuery = "SELECT id FROM rooms WHERE id = ?";
      const existing = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        throw ErrorFactory.notFound("Room not found");
      }

      await executeQuery(
        "UPDATE rooms SET status = ?, updated_at = NOW() WHERE id = ?",
        [status, id]
      );

      const updatedRoom = await executeQuery(
        "SELECT * FROM rooms WHERE id = ?",
        [id]
      );

      const room = updatedRoom[0];
      return success(res, {
        ...room,
        amenities:
          typeof room.amenities === "string"
            ? JSON.parse(room.amenities)
            : room.amenities,
        images:
          typeof room.images === "string"
            ? JSON.parse(room.images)
            : room.images,
      });
    } catch (err) {
      console.error("Error in updateStatus room:", err);
      next(err);
    }
  },

  // @desc    Get room statistics
  // @route   GET /api/admin/rooms/:id/statistics
  // @access  Private/Admin
  getStatistics: async (req, res, next) => {
    try {
      const { id } = req.params;

      const statsQuery = `
        SELECT 
          COUNT(DISTINCT b.id) as total_bookings,
          COALESCE(SUM(b.total_amount), 0) as total_revenue,
          COALESCE(AVG(b.total_amount), 0) as avg_booking_value,
          COALESCE(AVG(rev.rating), 0) as avg_rating,
          COUNT(DISTINCT rev.id) as total_reviews,
          COALESCE(SUM(DATEDIFF(b.check_out_date, b.check_in_date)), 0) as total_nights_booked
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id 
          AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        LEFT JOIN reviews rev ON b.id = rev.booking_id
        WHERE r.id = ?
        GROUP BY r.id
      `;

      const result = await executeQuery(statsQuery, [id]);

      if (result.length === 0) {
        throw ErrorFactory.notFound("Room not found");
      }

      return success(res, {
        total_bookings: parseInt(result[0].total_bookings),
        total_revenue: parseFloat(result[0].total_revenue),
        avg_booking_value: parseFloat(result[0].avg_booking_value),
        avg_rating: parseFloat(result[0].avg_rating).toFixed(1),
        total_reviews: parseInt(result[0].total_reviews),
        total_nights_booked: parseInt(result[0].total_nights_booked),
      });
    } catch (err) {
      console.error("Error in getStatistics room:", err);
      next(err);
    }
  },
};

module.exports = roomController;
