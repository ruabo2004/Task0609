// Admin Booking Management Controller
// Handles booking management from admin perspective

const { executeQuery } = require("../../config/database");
const { success } = require("../../utils/responseHelper");
const { ErrorFactory } = require("../../utils/errors");

const adminBookingController = {
  // @desc    Get all bookings with filters (Admin view)
  // @route   GET /api/admin/bookings
  // @access  Private/Admin
  getAll: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        date_from,
        date_to,
        sort_by = "created_at",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const limitInt = parseInt(limit);
      const offsetInt = parseInt(offset);

      // Validate sort_by
      const validSortFields = [
        "id",
        "check_in_date",
        "check_out_date",
        "total_amount",
        "status",
        "created_at",
      ];
      const sortBy = validSortFields.includes(sort_by) ? sort_by : "created_at";
      const orderBy = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Build WHERE clause
      let whereConditions = [];
      let params = [];

      if (status && status !== "all") {
        whereConditions.push("b.status = ?");
        params.push(status);
      }

      if (date_from && date_to) {
        whereConditions.push("b.check_in_date BETWEEN ? AND ?");
        params.push(date_from, date_to);
      }

      if (search) {
        whereConditions.push(
          "(u.full_name LIKE ? OR u.email LIKE ? OR r.room_number LIKE ? OR b.id = ?)"
        );
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, search);
      }

      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";

      // Get bookings with customer and room info
      const bookingsQuery = `
        SELECT 
          b.*,
          u.full_name as customer_name,
          u.email as customer_email,
          u.phone as customer_phone,
          r.room_number,
          r.room_type,
          r.price_per_night
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        ${whereClause}
        ORDER BY b.${sortBy} ${orderBy}
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;

      // Count total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        ${whereClause}
      `;

      const [bookings, totalResult] = await Promise.all([
        executeQuery(bookingsQuery, params),
        executeQuery(countQuery, params),
      ]);

      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return success(res, {
        bookings: bookings.map((b) => ({
          ...b,
          total_amount: parseFloat(b.total_amount),
          price_per_night: parseFloat(b.price_per_night),
        })),
        pagination: {
          page: parseInt(page),
          limit: limitInt,
          total,
          totalPages,
        },
      });
    } catch (err) {
      console.error("Error in getAll bookings:", err);
      next(err);
    }
  },

  // @desc    Get booking by ID with full details
  // @route   GET /api/admin/bookings/:id
  // @access  Private/Admin
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Get booking with customer, room, and services
      const bookingQuery = `
        SELECT 
          b.*,
          u.full_name as customer_name,
          u.email as customer_email,
          u.phone as customer_phone,
          u.loyalty_level,
          r.room_number,
          r.room_type,
          r.price_per_night,
          r.capacity
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ?
      `;

      // Get services for this booking
      const servicesQuery = `
        SELECT 
          bs.*,
          s.name as service_name,
          s.description as service_description
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.booking_id = ?
      `;

      // Get payments for this booking
      const paymentsQuery = `
        SELECT *
        FROM payments
        WHERE booking_id = ?
        ORDER BY created_at DESC
      `;

      const [bookingResult, servicesResult, paymentsResult] = await Promise.all(
        [
          executeQuery(bookingQuery, [id]),
          executeQuery(servicesQuery, [id]),
          executeQuery(paymentsQuery, [id]),
        ]
      );

      if (bookingResult.length === 0) {
        throw ErrorFactory.notFound("Booking not found");
      }

      const booking = bookingResult[0];

      return success(res, {
        ...booking,
        total_amount: parseFloat(booking.total_amount),
        price_per_night: parseFloat(booking.price_per_night),
        services: servicesResult.map((s) => ({
          ...s,
          price: parseFloat(s.price),
          total: parseFloat(s.price) * parseInt(s.quantity),
        })),
        payments: paymentsResult.map((p) => ({
          ...p,
          amount: parseFloat(p.amount),
        })),
      });
    } catch (err) {
      console.error("Error in getById booking:", err);
      next(err);
    }
  },

  // @desc    Confirm booking
  // @route   PATCH /api/admin/bookings/:id/confirm
  // @access  Private/Admin/Staff
  confirmBooking: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if booking exists
      const checkQuery = "SELECT id, status FROM bookings WHERE id = ?";
      const existing = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        throw ErrorFactory.notFound("Booking not found");
      }

      await executeQuery(
        "UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = ?",
        [id]
      );

      const updatedBooking = await executeQuery(
        `SELECT 
          b.*,
          u.full_name as customer_name,
          r.room_number
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ?`,
        [id]
      );

      return success(
        res,
        {
          ...updatedBooking[0],
          total_amount: parseFloat(updatedBooking[0].total_amount),
        },
        "Booking confirmed successfully"
      );
    } catch (err) {
      console.error("Error in confirmBooking:", err);
      next(err);
    }
  },

  // @desc    Check-in booking
  // @route   PATCH /api/admin/bookings/:id/check-in
  // @access  Private/Admin/Staff
  checkInBooking: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if booking exists
      const checkQuery = "SELECT id, status FROM bookings WHERE id = ?";
      const existing = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        throw ErrorFactory.notFound("Booking not found");
      }

      await executeQuery(
        "UPDATE bookings SET status = 'checked_in', updated_at = NOW() WHERE id = ?",
        [id]
      );

      const updatedBooking = await executeQuery(
        `SELECT 
          b.*,
          u.full_name as customer_name,
          r.room_number
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ?`,
        [id]
      );

      return success(
        res,
        {
          ...updatedBooking[0],
          total_amount: parseFloat(updatedBooking[0].total_amount),
        },
        "Check-in successful"
      );
    } catch (err) {
      console.error("Error in checkInBooking:", err);
      next(err);
    }
  },

  // @desc    Cancel booking (Admin/Staff)
  // @route   DELETE /api/admin/bookings/:id
  // @access  Private/Admin
  cancelBooking: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Check if booking exists
      const checkQuery = "SELECT id, status FROM bookings WHERE id = ?";
      const existing = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        throw ErrorFactory.notFound("Booking not found");
      }

      if (existing[0].status === "checked_out") {
        throw ErrorFactory.validation("Cannot cancel completed booking");
      }

      if (existing[0].status === "cancelled") {
        throw ErrorFactory.validation("Booking already cancelled");
      }

      // Update booking status to cancelled
      await executeQuery(
        "UPDATE bookings SET status = 'cancelled', notes = ?, updated_at = NOW() WHERE id = ?",
        [reason || "Cancelled by admin", id]
      );

      return success(res, null, "Booking cancelled successfully");
    } catch (err) {
      console.error("Error in cancelBooking:", err);
      next(err);
    }
  },
};

module.exports = adminBookingController;
