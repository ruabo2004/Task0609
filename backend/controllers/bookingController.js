const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { validationResult } = require('express-validator');

const createBooking = async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      room_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      special_requests,
      additional_services = []
    } = req.body;

    const customer_id = req.customer.customer_id;

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    const room = await Room.findByIdWithDetails(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (number_of_guests > room.max_occupancy) {
      return res.status(400).json({
        success: false,
        message: `Number of guests (${number_of_guests}) exceeds room capacity (${room.max_occupancy})`
      });
    }

    const costCalculation = await Booking.calculateTotalAmount(
      room_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      additional_services
    );

    const booking = await Booking.create({
      customer_id,
      room_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      total_amount: costCalculation.total_amount,
      special_requests,
      additional_services
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking,
        costBreakdown: costCalculation
      }
    });
  } catch (error) {
    if (error.message.includes('not available')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdWithDetails(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customer_id !== req.customer.customer_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your booking'
      });
    }

    res.json({
      success: true,
      message: 'Booking retrieved successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get booking',
      error: error.message
    });
  }
};

const getCustomerBookings = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const { status, limit = 10, offset = 0 } = req.query;

    let bookings = await Booking.getByCustomerId(customer_id);

    if (status) {
      bookings = bookings.filter(booking => booking.booking_status === status);
    }

    const totalBookings = bookings.length;
    const paginatedBookings = bookings.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      message: 'Customer bookings retrieved successfully',
      data: {
        bookings: paginatedBookings,
        pagination: {
          total: totalBookings,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalBookings
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get customer bookings',
      error: error.message
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdWithDetails(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customer_id !== req.customer.customer_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your booking'
      });
    }

    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24 && booking.booking_status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking within 24 hours of check-in'
      });
    }

    const bookingInstance = new Booking(booking);
    await bookingInstance.cancel();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: await Booking.findByIdWithDetails(bookingId)
      }
    });
  } catch (error) {
    if (error.message.includes('Cannot cancel booking')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

const calculateBookingCost = async (req, res) => {
  try {
    const {
      room_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      additional_services = []
    } = req.body;

    const room = await Room.findByIdWithDetails(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    const costCalculation = await Booking.calculateTotalAmount(
      room_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      additional_services
    );

    res.json({
      success: true,
      message: 'Booking cost calculated successfully',
      data: {
        room: {
          room_id: room.room_id,
          room_number: room.room_number,
          type_name: room.type_name,
          base_price: room.base_price
        },
        dates: {
          check_in_date,
          check_out_date,
          number_of_nights: costCalculation.number_of_nights
        },
        cost_breakdown: costCalculation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate booking cost',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getCustomerBookings,
  cancelBooking,
  calculateBookingCost
};
