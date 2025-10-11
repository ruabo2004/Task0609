// Room Controller
// Handles room management operations

const { Room } = require("../models");
const {
  success,
  error,
  created,
  notFound,
  paginated,
} = require("../utils/responseHelper");
const { validationResult } = require("express-validator");
const {
  addCalculatedSizeToRooms,
  addCalculatedSize,
} = require("../utils/roomUtils");

const roomController = {
  // @desc    Get all rooms
  // @route   GET /api/rooms
  // @access  Public
  getAllRooms: async (req, res, next) => {
    try {
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;

      const filters = {
        room_type: req.query.room_type,
        status: req.query.status,
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        search: req.query.search,
        sort: req.query.sort,
        featured: req.query.featured === "true", // Check for featured flag
      };

      // Use getAllWithRating if featured or rating needed
      const result =
        filters.featured || req.query.with_rating === "true"
          ? await Room.getAllWithRatingPaginated(filters, page, limit)
          : await Room.getAllPaginated(filters, page, limit);

      // Add calculated size to rooms
      if (result.rooms) {
        result.rooms = addCalculatedSizeToRooms(result.rooms);
      }

      return success(res, result, "Rooms retrieved successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get room by ID
  // @route   GET /api/rooms/:id
  // @access  Public
  getRoomById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const room = await Room.findById(id);
      if (!room) {
        return notFound(res, "Room not found");
      }

      const roomResponse = room.toJSON();
      const roomWithSize = addCalculatedSize(roomResponse);

      return success(
        res,
        { room: roomWithSize },
        "Room retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get available rooms for date range
  // @route   GET /api/rooms/available
  // @access  Public
  getAvailableRooms: async (req, res, next) => {
    try {
      const { check_in, check_out, room_type, guests } = req.query;

      if (!check_in || !check_out) {
        return error(res, "Check-in and check-out dates are required", 400);
      }

      // Validate dates
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);

      if (checkInDate >= checkOutDate) {
        return error(res, "Check-out date must be after check-in date", 400);
      }

      if (checkInDate < new Date()) {
        return error(res, "Check-in date cannot be in the past", 400);
      }

      // Parse guests parameter
      const guestCount = guests ? parseInt(guests) : null;

      const rooms = await Room.getAvailable(
        check_in,
        check_out,
        room_type,
        guestCount
      );
      // Handle direct database results from stored procedure
      const roomResponses = rooms.map((room) => {
        // If room is already a plain object from stored procedure, return as is
        if (typeof room.toJSON === "function") {
          return room.toJSON();
        } else {
          // Parse JSON fields if they are strings
          return {
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
        }
      });

      const roomsWithSize = addCalculatedSizeToRooms(roomResponses);

      return success(
        res,
        {
          rooms: roomsWithSize,
          filters: { check_in, check_out, room_type, guests: guestCount },
        },
        "Available rooms retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get booked dates for a specific room
  // @route   GET /api/rooms/:id/booked-dates
  // @access  Public
  getRoomBookedDates: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      // Check if room exists
      const room = await Room.findById(id);
      if (!room) {
        return notFound(res, "Room not found");
      }

      // Set default date range if not provided (next 3 months)
      const startDate = start_date || new Date().toISOString().split("T")[0];
      const endDate =
        end_date ||
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

      // Get all confirmed/checked-in bookings for this room in the date range
      const query = `
        SELECT 
          check_in_date, 
          check_out_date,
          status
        FROM bookings 
        WHERE room_id = ? 
        AND status IN ('confirmed', 'checked_in', 'pending')
        AND (
          (check_in_date <= ? AND check_out_date > ?) OR
          (check_in_date >= ? AND check_in_date < ?)
        )
        ORDER BY check_in_date ASC
      `;

      const { executeQuery } = require("../config/database");
      const bookings = await executeQuery(query, [
        id,
        endDate,
        startDate,
        startDate,
        endDate,
      ]);

      // Generate array of booked dates
      const bookedDates = [];
      const bookedRanges = [];

      bookings.forEach((booking) => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);

        // Add to ranges for easier processing
        bookedRanges.push({
          start: checkIn.toISOString().split("T")[0],
          end: checkOut.toISOString().split("T")[0],
          status: booking.status,
        });

        // Generate individual dates
        const currentDate = new Date(checkIn);
        while (currentDate < checkOut) {
          bookedDates.push(currentDate.toISOString().split("T")[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      return success(
        res,
        {
          room_id: parseInt(id),
          room_info: {
            room_number: room.room_number,
            room_type: room.room_type,
          },
          date_range: {
            start: startDate,
            end: endDate,
          },
          booked_dates: [...new Set(bookedDates)].sort(), // Remove duplicates and sort
          booked_ranges: bookedRanges,
          total_bookings: bookings.length,
        },
        "Room booked dates retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Create new room (Admin/Staff only)
  // @route   POST /api/rooms
  // @access  Private/Admin/Staff
  createRoom: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const {
        room_number,
        room_type,
        capacity,
        price_per_night,
        description,
        amenities,
        images,
        status,
      } = req.body;

      // Check if room number already exists
      const existingRoom = await Room.findByRoomNumber(room_number);
      if (existingRoom) {
        return error(res, "Room number already exists", 409);
      }

      const roomData = {
        room_number,
        room_type,
        capacity,
        price_per_night,
        description,
        amenities: amenities || [],
        images: images || [],
        status: status || "available",
      };

      const room = await Room.create(roomData);
      if (!room) {
        return error(res, "Failed to create room", 500);
      }

      const roomResponse = room.toJSON();
      return created(res, { room: roomResponse }, "Room created successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Update room (Admin/Staff only)
  // @route   PUT /api/rooms/:id
  // @access  Private/Admin/Staff
  updateRoom: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { id } = req.params;
      const {
        room_number,
        room_type,
        capacity,
        price_per_night,
        description,
        amenities,
        images,
        status,
      } = req.body;

      const room = await Room.findById(id);
      if (!room) {
        return notFound(res, "Room not found");
      }

      // Check if room number is being changed and already exists
      if (room_number && room_number !== room.room_number) {
        const existingRoom = await Room.findByRoomNumber(room_number);
        if (existingRoom) {
          return error(res, "Room number already exists", 409);
        }
      }

      const updatedRoom = await room.update({
        room_number,
        room_type,
        capacity,
        price_per_night,
        description,
        amenities,
        images,
        status,
      });

      const roomResponse = updatedRoom.toJSON();
      return success(res, { room: roomResponse }, "Room updated successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Delete room (Admin only)
  // @route   DELETE /api/rooms/:id
  // @access  Private/Admin
  deleteRoom: async (req, res, next) => {
    try {
      const { id } = req.params;

      const room = await Room.findById(id);
      if (!room) {
        return notFound(res, "Room not found");
      }

      // Check if room has active bookings
      const { executeQuery } = require("../config/database");
      const bookingCheck = await executeQuery(
        "SELECT COUNT(*) as count FROM bookings WHERE room_id = ? AND status IN ('confirmed', 'checked_in')",
        [id]
      );

      if (bookingCheck[0].count > 0) {
        return error(res, "Cannot delete room with active bookings", 400);
      }

      await room.delete();
      return success(res, null, "Room deleted successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Upload room images (Admin/Staff only)
  // @route   POST /api/rooms/:id/images
  // @access  Private/Admin/Staff
  uploadRoomImages: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!req.files || req.files.length === 0) {

        return error(res, "No files uploaded", 400);
      }

      const room = await Room.findById(id);
      if (!room) {

        return notFound(res, "Room not found");
      }

      // Get current images - use toJSON() to ensure proper parsing
      const roomJSON = room.toJSON();

      const currentImages = Array.isArray(roomJSON.images)
        ? roomJSON.images
        : [];

      // Add new image paths
      const newImages = req.files.map(
        (file) => `/uploads/rooms/${file.filename}`
      );

      const allImages = [...currentImages, ...newImages];

      const updatedRoom = await room.update({ images: allImages });
      const roomResponse = updatedRoom.toJSON();

      return success(
        res,
        { room: roomResponse },
        "Room images uploaded successfully"
      );
    } catch (err) {
      console.error("❌ Upload error:", err);
      next(err);
    }
  },

  // @desc    Update room status (Staff only)
  // @route   PUT /api/rooms/:id/status
  // @access  Private/Staff/Admin
  updateRoomStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return error(res, "Status is required", 400);
      }

      const validStatuses = ["available", "occupied", "maintenance"];
      if (!validStatuses.includes(status)) {
        return error(res, "Invalid status", 400);
      }

      const room = await Room.findById(id);
      if (!room) {
        return notFound(res, "Room not found");
      }

      const updatedRoom = await room.updateStatus(status);
      const roomResponse = updatedRoom.toJSON();

      return success(
        res,
        { room: roomResponse },
        "Room status updated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get room statistics (Admin/Staff only)
  // @route   GET /api/rooms/stats
  // @access  Private/Admin/Staff
  getRoomStats: async (req, res, next) => {
    try {
      const { executeQuery } = require("../config/database");

      const query = `
        SELECT 
          COUNT(*) as total_rooms,
          COUNT(CASE WHEN status = 'available' THEN 1 END) as available_rooms,
          COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_rooms,
          COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_rooms,
          COUNT(CASE WHEN room_type = 'single' THEN 1 END) as single_rooms,
          COUNT(CASE WHEN room_type = 'double' THEN 1 END) as double_rooms,
          COUNT(CASE WHEN room_type = 'suite' THEN 1 END) as suite_rooms,
          COUNT(CASE WHEN room_type = 'family' THEN 1 END) as family_rooms,
          AVG(price_per_night) as avg_price,
          MIN(price_per_night) as min_price,
          MAX(price_per_night) as max_price,
          SUM(capacity) as total_capacity
        FROM rooms
      `;

      const result = await executeQuery(query);
      const stats = result[0];

      // Calculate occupancy rate
      const occupancyRate =
        stats.total_rooms > 0
          ? ((stats.occupied_rooms / stats.total_rooms) * 100).toFixed(2)
          : 0;

      stats.occupancy_rate = parseFloat(occupancyRate);

      return success(res, { stats }, "Room statistics retrieved successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Search rooms
  // @route   GET /api/rooms/search
  // @access  Public
  searchRooms: async (req, res, next) => {
    try {
      const { query, room_type, min_price, max_price, capacity, amenities } =
        req.query;

      if (!query) {
        return error(res, "Search query is required", 400);
      }

      const { executeQuery } = require("../config/database");

      let searchQuery = `
        SELECT * FROM rooms 
        WHERE (room_number LIKE ? OR description LIKE ?)
      `;

      const searchTerm = `%${query}%`;
      const queryParams = [searchTerm, searchTerm];

      // Apply filters
      if (room_type) {
        searchQuery += " AND room_type = ?";
        queryParams.push(room_type);
      }

      if (min_price) {
        searchQuery += " AND price_per_night >= ?";
        queryParams.push(min_price);
      }

      if (max_price) {
        searchQuery += " AND price_per_night <= ?";
        queryParams.push(max_price);
      }

      if (capacity) {
        searchQuery += " AND capacity >= ?";
        queryParams.push(capacity);
      }

      if (amenities) {
        // Search in amenities JSON field
        const amenityList = amenities.split(",");
        for (const amenity of amenityList) {
          searchQuery += " AND JSON_SEARCH(amenities, 'one', ?) IS NOT NULL";
          queryParams.push(amenity.trim());
        }
      }

      searchQuery += " ORDER BY price_per_night ASC";

      const rooms = await executeQuery(searchQuery, queryParams);
      const roomObjects = rooms.map((roomData) => new Room(roomData));
      const roomResponses = roomObjects.map((room) => room.toJSON());
      const roomsWithSize = addCalculatedSizeToRooms(roomResponses);

      return success(
        res,
        {
          rooms: roomsWithSize,
          search_params: {
            query,
            room_type,
            min_price,
            max_price,
            capacity,
            amenities,
          },
        },
        "Search results retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get room reviews
  // @route   GET /api/rooms/:id/reviews
  // @access  Public
  getRoomReviews: async (req, res, next) => {
    try {
      const { id } = req.params;
      const roomId = parseInt(id);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const room = await Room.findById(roomId);
      if (!room) {
        return notFound(res, "Room not found");
      }

      const { Review } = require("../models");
      const result = await Review.getByRoomId(roomId, page, limit);

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

  // @desc    Get room bookings (Admin/Staff only)
  // @route   GET /api/rooms/:id/bookings
  // @access  Private/Admin/Staff
  getRoomBookings: async (req, res, next) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const room = await Room.findById(id);
      if (!room) {
        return notFound(res, "Room not found");
      }

      const { Booking } = require("../models");
      const filters = { room_id: id };
      const result = await Booking.getAll(filters, page, limit);

      return paginated(
        res,
        result.bookings,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Room bookings retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get room types
  // @route   GET /api/rooms/types
  // @access  Public
  getRoomTypes: async (req, res, next) => {
    try {
      const { executeQuery } = require("../config/database");

      const query = `
        SELECT 
          room_type,
          COUNT(*) as room_count,
          AVG(price_per_night) as avg_price,
          MIN(price_per_night) as min_price,
          MAX(price_per_night) as max_price,
          AVG(capacity) as avg_capacity
        FROM rooms
        GROUP BY room_type
        ORDER BY room_type ASC
      `;

      const roomTypes = await executeQuery(query);

      return success(
        res,
        { room_types: roomTypes },
        "Room types retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get room statistics (Admin/Staff only)
  // @route   GET /api/rooms/stats
  // @access  Private/Admin/Staff
  getRoomStatistics: async (req, res, next) => {
    try {
      const { executeQuery } = require("../config/database");

      const stats = await executeQuery(`
        SELECT 
          COUNT(*) as total_rooms,
          COUNT(CASE WHEN status = 'available' THEN 1 END) as available_rooms,
          COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_rooms,
          COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_rooms,
          AVG(price_per_night) as average_price,
          COUNT(CASE WHEN room_type = 'single' THEN 1 END) as single_rooms,
          COUNT(CASE WHEN room_type = 'double' THEN 1 END) as double_rooms,
          COUNT(CASE WHEN room_type = 'suite' THEN 1 END) as suite_rooms,
          COUNT(CASE WHEN room_type = 'family' THEN 1 END) as family_rooms
        FROM rooms
      `);

      return success(
        res,
        { statistics: stats[0] },
        "Room statistics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },
};

module.exports = roomController;
