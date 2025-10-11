// Booking Controller
// Handles booking lifecycle management

const { Booking, Room, User, BookingService, Payment } = require("../models");
const {
  success,
  error,
  created,
  notFound,
  paginated,
  forbidden,
} = require("../utils/responseHelper");
const { validationResult } = require("express-validator");

const bookingController = {
  // @desc    Get all bookings
  // @route   GET /api/bookings
  // @access  Private/Admin/Staff
  getAllBookings: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        status: req.query.status,
        user_id: req.query.user_id,
        room_id: req.query.room_id,
        check_in_from: req.query.check_in_from,
        check_in_to: req.query.check_in_to,
      };

      const result = await Booking.getAll(filters, page, limit);

      console.log("📊 Booking.getAll() result:", {
        total: result.total,
        count: result.bookings.length,
        page: result.page,
        totalPages: result.totalPages,
      });

      // Serialize booking instances to JSON
      const bookingsData = result.bookings.map((booking) => {
        const bookingJson = booking.toJSON();
        // Add joined data that's not in toJSON()
        return {
          ...bookingJson,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          room_number: booking.room_number,
          room_type: booking.room_type,
          price_per_night: booking.price_per_night,
          room_images: booking.room_images,
        };
      });

      if (bookingsData.length > 0) {

      }

      return paginated(
        res,
        bookingsData,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Bookings retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get booking by ID
  // @route   GET /api/bookings/:id
  // @access  Private (own booking) / Admin/Staff
  getBookingById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const booking = await Booking.findById(id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      // Check if user can access this booking
      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      // Get booking services
      const services = await booking.getServices();

      const bookingResponse = {
        ...booking.toJSON(),
        services,
      };

      return success(
        res,
        { booking: bookingResponse },
        "Booking retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Check room availability for specific dates
  // @route   POST /api/bookings/check-availability
  // @access  Public
  checkRoomAvailability: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { room_id, check_in_date, check_out_date } = req.body;

      // Validate dates
      const checkInDate = new Date(check_in_date);
      const checkOutDate = new Date(check_out_date);

      if (checkInDate >= checkOutDate) {
        return error(res, "Check-out date must be after check-in date", 400);
      }

      // Compare dates properly - only compare date parts, not time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDateOnly = new Date(checkInDate);
      checkInDateOnly.setHours(0, 0, 0, 0);

      if (checkInDateOnly < today) {
        return error(res, "Check-in date cannot be in the past", 400);
      }

      // Check if room exists
      const room = await Room.findById(room_id);
      if (!room) {
        return notFound(res, "Room not found");
      }

      // Check room availability
      const availabilityResult = await Booking.checkAvailability(
        room_id,
        check_in_date,
        check_out_date
      );

      const responseData = {
        room_id: parseInt(room_id),
        check_in_date,
        check_out_date,
        available: availabilityResult.available,
        room_info: {
          room_number: room.room_number,
          room_type: room.room_type,
          price_per_night: room.price_per_night,
        },
      };

      if (availabilityResult.available === false) {
        responseData.conflicting_bookings =
          availabilityResult.conflictingBookings;
      }

      return success(
        res,
        responseData,
        availabilityResult.available
          ? "Room is available for the selected dates"
          : "Room is not available for the selected dates"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Create new booking
  // @route   POST /api/bookings
  // @access  Private
  createBooking: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const {
        room_id,
        check_in_date,
        check_out_date,
        guests_count,
        special_requests,
      } = req.body;

      // Validate dates
      const checkInDate = new Date(check_in_date);
      const checkOutDate = new Date(check_out_date);

      if (checkInDate >= checkOutDate) {
        return error(res, "Check-out date must be after check-in date", 400);
      }

      // Compare dates properly - only compare date parts, not time
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
      const checkInDateOnly = new Date(checkInDate);
      checkInDateOnly.setHours(0, 0, 0, 0); // Set to start of day

      if (checkInDateOnly < today) {
        return error(res, "Check-in date cannot be in the past", 400);
      }

      // Check room exists and capacity
      const room = await Room.findById(room_id);
      if (!room) {
        return notFound(res, "Room not found");
      }

      if (guests_count > room.capacity) {
        return error(
          res,
          `Room capacity is ${room.capacity}, but ${guests_count} guests requested`,
          400
        );
      }

      // Check room availability
      const availabilityResult = await Booking.checkAvailability(
        room_id,
        check_in_date,
        check_out_date
      );
      if (!availabilityResult.available) {
        const conflictDates = (availabilityResult.conflictingBookings || [])
          .map(
            (booking) => `${booking.check_in_date} to ${booking.check_out_date}`
          )
          .join(", ");
        return error(
          res,
          `Room is not available for the selected dates. Conflicting bookings: ${
            conflictDates || "Unknown"
          }`,
          409
        );
      }

      const bookingData = {
        user_id: req.user.id,
        room_id,
        check_in_date,
        check_out_date,
        guests_count,
        special_requests,
      };

      const booking = await Booking.create(bookingData);
      if (!booking) {
        return error(res, "Failed to create booking", 500);
      }

      const bookingResponse = booking.toJSON();
      return success(
        res,
        { booking: bookingResponse },
        "Booking created successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Update booking
  // @route   PUT /api/bookings/:id
  // @access  Private (own booking) / Admin/Staff
  updateBooking: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { id } = req.params;
      const { check_in_date, check_out_date, guests_count, special_requests } =
        req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      // Check if user can modify this booking
      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      // Check if booking can be modified
      if (!booking.canBeModified()) {
        return error(res, "Booking cannot be modified", 400);
      }

      // Validate dates if provided
      if (check_in_date || check_out_date) {
        const checkInDate = new Date(check_in_date || booking.check_in_date);
        const checkOutDate = new Date(check_out_date || booking.check_out_date);

        if (checkInDate >= checkOutDate) {
          return error(res, "Check-out date must be after check-in date", 400);
        }

        if (checkInDate < new Date()) {
          return error(res, "Check-in date cannot be in the past", 400);
        }
      }

      // Check room capacity if guests count is being updated
      if (guests_count) {
        const room = await Room.findById(booking.room_id);
        if (guests_count > room.capacity) {
          return error(
            res,
            `Room capacity is ${room.capacity}, but ${guests_count} guests requested`,
            400
          );
        }
      }

      const updatedBooking = await booking.update({
        check_in_date,
        check_out_date,
        guests_count,
        special_requests,
      });

      const bookingResponse = updatedBooking.toJSON();
      return success(
        res,
        { booking: bookingResponse },
        "Booking updated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Cancel booking
  // @route   PUT /api/bookings/:id/cancel
  // @access  Private (own booking) / Admin/Staff
  cancelBooking: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      // Check if user can cancel this booking
      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      // Check if booking can be cancelled
      if (!booking.canBeCancelled()) {
        return error(res, "Booking cannot be cancelled", 400);
      }

      const cancelledBooking = await booking.cancel();

      // TODO: Handle refund if payment was made
      // This would involve checking payments and processing refunds

      const bookingResponse = cancelledBooking.toJSON();
      return success(
        res,
        { booking: bookingResponse },
        "Booking cancelled successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Confirm booking (Staff/Admin only)
  // @route   PUT /api/bookings/:id/confirm
  // @access  Private/Staff/Admin
  confirmBooking: async (req, res, next) => {
    try {
      const { id } = req.params;

      const booking = await Booking.findById(id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      if (booking.status !== "pending") {
        return error(res, "Only pending bookings can be confirmed", 400);
      }

      const confirmedBooking = await booking.confirm();
      const bookingResponse = confirmedBooking.toJSON();

      return success(
        res,
        { booking: bookingResponse },
        "Booking confirmed successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Check in (Staff/Admin only)
  // @route   PUT /api/bookings/:id/checkin
  // @access  Private/Staff/Admin
  checkIn: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      if (booking.status !== "confirmed") {
        return error(res, "Only confirmed bookings can be checked in", 400);
      }

      // Check if check-in date is today or in the past
      const today = new Date();
      const checkInDate = new Date(booking.check_in_date);

      if (checkInDate > today) {
        return error(res, "Cannot check in before check-in date", 400);
      }

      const checkedInBooking = await booking.checkIn();

      // Update room status to occupied
      const room = await Room.findById(booking.room_id);
      await room.updateStatus("occupied");

      const bookingResponse = checkedInBooking.toJSON();
      return success(res, { booking: bookingResponse }, "Check-in successful");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Check out (Staff/Admin only)
  // @route   PUT /api/bookings/:id/checkout
  // @access  Private/Staff/Admin
  checkOut: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { notes, additional_charges } = req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      // Allow checkout for confirmed bookings (not just checked_in)
      if (!["confirmed", "checked_in"].includes(booking.status)) {
        return error(
          res,
          "Only confirmed or checked-in bookings can be checked out",
          400
        );
      }

      // Check for pending payments for additional services
      const { executeQuery } = require("../config/database");
      const pendingPaymentQuery = `
        SELECT p.*, b.total_amount
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE p.booking_id = ? AND p.payment_status = 'pending' AND p.payment_method = 'additional_services'
        ORDER BY p.created_at DESC
        LIMIT 1
      `;
      const pendingPayments = await executeQuery(pendingPaymentQuery, [id]);

      console.log(
        `🔍 Checkout for booking ${id}: Found ${pendingPayments.length} pending payments:`,
        pendingPayments
      );

      if (pendingPayments.length > 0) {
        const pendingPayment = pendingPayments[0];

        console.log(
          `❌ Blocking checkout for booking ${id} due to pending payment:`,
          {
            id: pendingPayment.id,
            amount: pendingPayment.amount,
            status: pendingPayment.payment_status,
            method: pendingPayment.payment_method,
          }
        );

        // Block checkout if there are unpaid additional services
        return error(
          res,
          "Chưa thanh toán dịch vụ bổ sung. Vui lòng thanh toán trước khi checkout.",
          400
        );
      }

      const checkedOutBooking = await booking.checkOut();

      // Update room status to available
      const room = await Room.findById(booking.room_id);
      await room.updateStatus("available");

      // Handle additional charges if any
      if (additional_charges && additional_charges > 0) {
        // Create additional payment record
        // This would be implemented based on payment processing requirements
      }

      const bookingResponse = checkedOutBooking.toJSON();
      return success(res, { booking: bookingResponse }, "Check-out successful");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get user's bookings
  // @route   GET /api/bookings/my-bookings
  // @access  Private
  getMyBookings: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Booking.findByUserId(req.user.id, page, limit);

      // Add has_review field to each booking
      const { executeQuery } = require("../config/database");
      const bookingsWithReview = await Promise.all(
        result.bookings.map(async (booking) => {
          // Check if this booking has a review
          const reviewQuery = `
            SELECT COUNT(*) as review_count 
            FROM reviews 
            WHERE booking_id = ?
          `;
          const reviewResult = await executeQuery(reviewQuery, [booking.id]);
          const hasReview = reviewResult[0].review_count > 0;

          return {
            ...booking,
            has_review: hasReview,
          };
        })
      );

      return paginated(
        res,
        bookingsWithReview,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Your bookings retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Add service to booking
  // @route   POST /api/bookings/:id/services
  // @access  Private (own booking) / Admin/Staff
  addServiceToBooking: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { service_id, quantity } = req.body;

      if (!service_id || !quantity || quantity <= 0) {
        return error(res, "Service ID and valid quantity are required", 400);
      }

      const booking = await Booking.findById(id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      // Check if user can modify this booking
      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      const bookingService = await BookingService.addToBooking(
        id,
        service_id,
        quantity
      );
      const serviceResponse = bookingService.toJSON();

      // Always create pending payment for additional services
      const { executeQuery } = require("../config/database");

      // Get the service price from the added service
      const serviceQuery = `
        SELECT bs.*, s.price as service_price
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.id = ?
      `;
      const serviceResult = await executeQuery(serviceQuery, [
        bookingService.id,
      ]);

      let paymentInfo = null;
      if (serviceResult.length > 0) {
        const service = serviceResult[0];
        const serviceAmount =
          parseFloat(service.service_price) * parseInt(service.quantity);

        // Create new payment for additional services
        const Payment = require("../models/Payment");
        const additionalPayment = await Payment.create({
          booking_id: id,
          amount: serviceAmount,
          payment_method: "additional_services",
          payment_status: "pending",
          notes: `Thanh toán cho dịch vụ: ${service.name} (x${service.quantity})`,
        });

        paymentInfo = {
          requires_payment: true,
          additional_amount: serviceAmount,
          payment_id: additionalPayment.id,
          message: `Cần thanh toán ${serviceAmount.toLocaleString(
            "vi-VN"
          )} VND cho dịch vụ "${service.name}" vừa thêm.`,
        };
      }

      return created(
        res,
        {
          service: serviceResponse,
          payment_info: paymentInfo,
        },
        paymentInfo
          ? "Service added successfully. Additional payment required."
          : "Service added to booking successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get booking services
  // @route   GET /api/bookings/:id/services
  // @access  Private (own booking) / Admin/Staff
  getBookingServices: async (req, res, next) => {
    try {
      const { id } = req.params;

      const booking = await Booking.findById(id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      // Check if user can access this booking
      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      const services = await BookingService.getByBookingId(id);
      const serviceResponses = services.map((service) => service.toJSON());

      return success(
        res,
        { services: serviceResponses },
        "Booking services retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Remove a specific service from a booking
  // @route   DELETE /api/bookings/:bookingId/services/:bookingServiceId
  // @access  Private (own booking) / Admin/Staff
  removeServiceFromBooking: async (req, res, next) => {
    try {
      const { bookingId, bookingServiceId } = req.params;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      // Permission: customers can only modify their own bookings
      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      // Remove booking service by id and update totals
      const bs = new BookingService({
        id: bookingServiceId,
        booking_id: bookingId,
      });
      await bs.remove();

      return success(
        res,
        { removedId: bookingServiceId },
        "Service removed from booking successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get booking statistics (Admin/Staff only)
  // @route   GET /api/bookings/stats
  // @access  Private/Admin/Staff
  getBookingStats: async (req, res, next) => {
    try {
      const { executeQuery } = require("../config/database");

      const query = `
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN status = 'checked_in' THEN 1 END) as checked_in_bookings,
          COUNT(CASE WHEN status = 'checked_out' THEN 1 END) as completed_bookings,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
          AVG(total_amount) as avg_booking_value,
          SUM(CASE WHEN status IN ('confirmed', 'checked_in', 'checked_out') THEN total_amount ELSE 0 END) as total_revenue,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as bookings_today,
          COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as bookings_this_week,
          COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as bookings_this_month
        FROM bookings
      `;

      const result = await executeQuery(query);
      const stats = result[0];

      return success(
        res,
        { stats },
        "Booking statistics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Search bookings
  // @route   GET /api/bookings/search
  // @access  Private/Admin/Staff
  searchBookings: async (req, res, next) => {
    try {
      const { query, status, date_from, date_to } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      if (!query) {
        return error(res, "Search query is required", 400);
      }

      const { executeQuery } = require("../config/database");

      let searchQuery = `
        SELECT b.*, u.full_name as customer_name, u.email as customer_email,
               r.room_number, r.room_type
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE (u.full_name LIKE ? OR u.email LIKE ? OR r.room_number LIKE ?)
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE (u.full_name LIKE ? OR u.email LIKE ? OR r.room_number LIKE ?)
      `;

      const searchTerm = `%${query}%`;
      const queryParams = [searchTerm, searchTerm, searchTerm];

      // Apply filters
      if (status) {
        searchQuery += " AND b.status = ?";
        countQuery += " AND b.status = ?";
        queryParams.push(status);
      }

      if (date_from) {
        searchQuery += " AND DATE(b.check_in_date) >= ?";
        countQuery += " AND DATE(b.check_in_date) >= ?";
        queryParams.push(date_from);
      }

      if (date_to) {
        searchQuery += " AND DATE(b.check_in_date) <= ?";
        countQuery += " AND DATE(b.check_in_date) <= ?";
        queryParams.push(date_to);
      }

      searchQuery += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
      const paginationParams = [...queryParams, limit, offset];

      const [bookings, totalResult] = await Promise.all([
        executeQuery(searchQuery, paginationParams),
        executeQuery(countQuery, queryParams),
      ]);

      const bookingObjects = bookings.map(
        (bookingData) => new Booking(bookingData)
      );

      return paginated(
        res,
        bookingObjects,
        {
          page,
          totalPages: Math.ceil(totalResult[0].total / limit),
          total: totalResult[0].total,
          limit,
        },
        "Search results retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get booking statistics (Admin/Staff only)
  // @route   GET /api/bookings/stats
  // @access  Private/Admin/Staff
  getBookingStatistics: async (req, res, next) => {
    try {
      const { executeQuery } = require("../config/database");

      const stats = await executeQuery(`
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN status = 'checked_in' THEN 1 END) as checked_in_bookings,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
          AVG(total_amount) as average_booking_value,
          SUM(total_amount) as total_revenue
        FROM bookings
      `);

      return success(
        res,
        { statistics: stats[0] },
        "Booking statistics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get current user's booking statistics
  // @route   GET /api/bookings/user/stats
  // @access  Private
  getUserBookingStats: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Get user's booking statistics
      const stats = await Booking.getUserStats(userId);

      return success(
        res,
        stats,
        "User booking statistics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },
};

module.exports = bookingController;
