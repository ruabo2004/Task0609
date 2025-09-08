const Room = require('../models/Room');
const { validationResult } = require('express-validator');

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.getAllRoomsWithDetails();

    res.json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: {
        rooms
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get rooms',
      error: error.message
    });
  }
};

const getAvailableRooms = async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    const rooms = await Room.getAvailableRooms(checkInDate, checkOutDate);

    res.json({
      success: true,
      message: 'Available rooms retrieved successfully',
      data: {
        rooms,
        searchCriteria: {
          checkInDate,
          checkOutDate
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get available rooms',
      error: error.message
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
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room retrieved successfully',
      data: {
        room
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get room',
      error: error.message
    });
  }
};

const getRoomsByType = async (req, res) => {
  try {
    const { roomTypeId } = req.params;

    const rooms = await Room.getRoomsByType(roomTypeId);

    res.json({
      success: true,
      message: 'Rooms by type retrieved successfully',
      data: {
        rooms
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get rooms by type',
      error: error.message
    });
  }
};

const getRoomTypes = async (req, res) => {
  try {
    const roomTypes = await Room.getRoomTypes();

    res.json({
      success: true,
      message: 'Room types retrieved successfully',
      data: {
        roomTypes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get room types',
      error: error.message
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
      maxOccupancy 
    } = req.query;

    const filters = {
      checkInDate,
      checkOutDate,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      roomType: roomType ? parseInt(roomType) : null,
      maxOccupancy: maxOccupancy ? parseInt(maxOccupancy) : null
    };

    const rooms = await Room.searchRooms(filters);

    res.json({
      success: true,
      message: 'Room search completed successfully',
      data: {
        rooms,
        searchCriteria: filters,
        totalResults: rooms.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search rooms',
      error: error.message
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
        message: 'Check-in and check-out dates are required'
      });
    }

    const isAvailable = await Room.checkAvailability(roomId, checkInDate, checkOutDate);

    res.json({
      success: true,
      message: 'Availability check completed',
      data: {
        roomId: parseInt(roomId),
        checkInDate,
        checkOutDate,
        isAvailable
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
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
  checkAvailability
};
