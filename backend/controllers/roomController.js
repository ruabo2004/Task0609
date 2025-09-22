const Room = require("../models/Room");
const { validationResult } = require("express-validator");

const getAllRooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort_by = "price",
      sort_order = "asc",
      min_price,
      max_price,
      room_type,
      num_adults,
      num_children,
      check_in_date,
      check_out_date,
      wifi_required,
      balcony_required,
      smoking_allowed,
      pet_allowed,
      available_only,
      view_type,
      bed_type,
    } = req.query;

    // Build filters object
    const filters = {};

    if (min_price) filters.minPrice = parseFloat(min_price);
    if (max_price) filters.maxPrice = parseFloat(max_price);
    if (room_type) filters.roomType = parseInt(room_type);
    if (num_adults)
      filters.maxOccupancy =
        parseInt(num_adults) + (parseInt(num_children) || 0);
    if (check_in_date && check_out_date) {
      filters.checkInDate = check_in_date;
      filters.checkOutDate = check_out_date;
    }
    if (wifi_required === "true") filters.wifiRequired = true;
    if (balcony_required === "true") filters.balconyRequired = true;
    if (smoking_allowed === "true") filters.smokingAllowed = true;
    if (pet_allowed === "true") filters.petAllowed = true;
    if (available_only === "true") filters.availableOnly = true;
    if (view_type) filters.viewType = view_type;
    if (bed_type) filters.bedType = bed_type;

    // Get filtered rooms
    let rooms;
    if (Object.keys(filters).length > 0) {
      rooms = await Room.searchRooms(filters);
    } else {
      rooms = await Room.getAllRoomsWithDetails();
    }

    // Apply sorting
    if (sort_by) {
      rooms.sort((a, b) => {
        let aValue, bValue;

        switch (sort_by) {
          case "price":
            aValue = parseFloat(a.price_per_night) || 0;
            bValue = parseFloat(b.price_per_night) || 0;
            break;
          case "name":
            aValue = a.room_name || "";
            bValue = b.room_name || "";
            break;
          case "type":
            aValue = a.type_name || "";
            bValue = b.type_name || "";
            break;
          case "size":
            aValue = parseFloat(a.room_size) || 0;
            bValue = parseFloat(b.room_size) || 0;
            break;
          default:
            return 0;
        }

        if (typeof aValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sort_order === "desc" ? -comparison : comparison;
        } else {
          return sort_order === "desc" ? bValue - aValue : aValue - bValue;
        }
      });
    }

    // Apply pagination
    const totalRooms = rooms.length;
    const totalPages = Math.ceil(totalRooms / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRooms = rooms.slice(startIndex, endIndex);

    res.json({
      success: true,
      message: "Rooms retrieved successfully",
      data: {
        rooms: paginatedRooms,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalRooms,
          items_per_page: parseInt(limit),
          has_next_page: page < totalPages,
          has_prev_page: page > 1,
        },
        filters: filters,
        sort: {
          sort_by,
          sort_order,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get rooms",
      error: error.message,
    });
  }
};

const getAvailableRooms = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Check-in and check-out dates are required",
      });
    }

    const rooms = await Room.getAvailableRooms(checkInDate, checkOutDate);

    res.json({
      success: true,
      message: "Available rooms retrieved successfully",
      data: {
        rooms,
        searchCriteria: {
          checkInDate,
          checkOutDate,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get available rooms",
      error: error.message,
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByIdWithDetails(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      message: "Room retrieved successfully",
      data: {
        room,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get room",
      error: error.message,
    });
  }
};

const getRoomsByType = async (req, res) => {
  try {
    const { roomTypeId } = req.params;

    const rooms = await Room.getRoomsByType(roomTypeId);

    res.json({
      success: true,
      message: "Rooms by type retrieved successfully",
      data: {
        rooms,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get rooms by type",
      error: error.message,
    });
  }
};

const getRoomTypes = async (req, res) => {
  try {
    const roomTypes = await Room.getRoomTypes();

    res.json({
      success: true,
      message: "Room types retrieved successfully",
      data: {
        roomTypes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get room types",
      error: error.message,
    });
  }
};

const searchRooms = async (req, res) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      minPrice,
      maxPrice,
      roomType,
      maxOccupancy,
    } = req.query;

    const filters = {
      checkInDate,
      checkOutDate,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      roomType: roomType ? parseInt(roomType) : null,
      maxOccupancy: maxOccupancy ? parseInt(maxOccupancy) : null,
    };

    const rooms = await Room.searchRooms(filters);

    res.json({
      success: true,
      message: "Room search completed successfully",
      data: {
        rooms,
        searchCriteria: filters,
        totalResults: rooms.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search rooms",
      error: error.message,
    });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Check-in and check-out dates are required",
      });
    }

    const isAvailable = await Room.checkAvailability(
      roomId,
      checkInDate,
      checkOutDate
    );

    res.json({
      success: true,
      message: "Availability check completed",
      data: {
        roomId: parseInt(roomId),
        checkInDate,
        checkOutDate,
        isAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check availability",
      error: error.message,
    });
  }
};

const getRoomPricing = async (req, res) => {
  try {
    const { roomId } = req.params;
    const {
      checkInDate,
      checkOutDate,
      num_adults = 1,
      num_children = 0,
    } = req.query;

    // Mock pricing calculation - replace with actual logic
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Calculate nights - fix timezone issues
    const checkIn = new Date(checkInDate + 'T00:00:00');
    const checkOut = new Date(checkOutDate + 'T00:00:00');
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    console.log('Date calculation:', {
      checkInDate,
      checkOutDate,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      timeDiff,
      nights
    });

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid date range. Check-in: ${checkInDate}, Check-out: ${checkOutDate}, Nights: ${nights}`,
      });
    }

    // Mock pricing calculation
    const basePrice = parseFloat(room.base_price);
    const subtotal = basePrice * nights;
    const taxes = subtotal * 0.1; // 10% tax
    const serviceFee = subtotal * 0.05; // 5% service fee
    const finalAmount = subtotal + taxes + serviceFee;

    res.json({
      success: true,
      message: "Pricing calculated successfully",
      data: {
        roomId: parseInt(roomId),
        checkInDate,
        checkOutDate,
        nights,
        basePrice,
        subtotal,
        taxes,
        serviceFee,
        finalAmount,
        guests: {
          adults: parseInt(num_adults),
          children: parseInt(num_children),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate pricing",
      error: error.message,
    });
  }
};

const getSimilarRooms = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 4 } = req.query;

    // Get the current room to find similar ones
    const currentRoom = await Room.findById(roomId);
    if (!currentRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Mock similar rooms logic - get rooms of same type, excluding current room
    const similarRooms = await Room.getSimilarRooms(
      roomId,
      currentRoom.type_id,
      parseInt(limit)
    );

    res.json({
      success: true,
      message: "Similar rooms retrieved successfully",
      data: {
        rooms: similarRooms,
        total: similarRooms.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get similar rooms",
      error: error.message,
    });
  }
};

module.exports = {
  getAllRooms,
  getAvailableRooms,
  getRoomById,
  getRoomsByType,
  getRoomTypes,
  searchRooms,
  checkAvailability,
  getRoomPricing,
  getSimilarRooms,
};
