// Payment Controller
// Handles payment processing and management

const { Payment, Booking } = require("../models");
const { executeQuery } = require("../config/database");
const {
  success,
  error,
  created,
  notFound,
  paginated,
  forbidden,
} = require("../utils/responseHelper");
const { validationResult } = require("express-validator");

const paymentController = {
  // @desc    Get all payments (Admin/Staff only)
  // @route   GET /api/payments
  // @access  Private/Admin/Staff
  getAllPayments: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        payment_status: req.query.status,
        payment_method: req.query.method,
        booking_id: req.query.booking_id,
        user_id: req.query.user_id,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
      };

      const result = await Payment.getAll(filters, page, limit);

      return paginated(
        res,
        result.payments,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Payments retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get payment by ID
  // @route   GET /api/payments/:id
  // @access  Private (own payment) / Admin/Staff
  getPaymentById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const payment = await Payment.findById(id);
      if (!payment) {
        return notFound(res, "Payment not found");
      }

      // Check if user can access this payment
      if (req.user.role === "customer" && payment.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      const paymentResponse = payment.toJSON();
      return success(
        res,
        { payment: paymentResponse },
        "Payment retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Create payment for booking
  // @route   POST /api/payments
  // @access  Private
  createPayment: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { booking_id, payment_method, amount, notes, payment_status } =
        req.body;

      // Validate booking
      const booking = await Booking.findById(booking_id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      // Check if user owns this booking
      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      const paymentData = {
        booking_id,
        amount: amount || booking.total_amount,
        payment_method,
        payment_status: payment_status || "pending",
        notes,
      };

      const payment = await Payment.create(paymentData);
      const paymentResponse = payment.toJSON();

      // If this is a completed cash payment for additional services,
      // update all other pending payments for this booking to completed
      if (payment_status === "completed" && payment_method === "cash") {
        try {
          await executeQuery(
            `UPDATE payments 
             SET payment_status = 'completed', payment_date = NOW() 
             WHERE booking_id = ? AND payment_method = 'additional_services' AND payment_status = 'pending' AND id != ?`,
            [booking_id, payment.id]
          );
          console.log(
            `Updated all pending additional_services payments for booking ${booking_id} to completed`
          );
        } catch (error) {
          console.error("Error updating pending payments:", error);
          // Don't fail the main request if this fails
        }
      }

      return created(
        res,
        { payment: paymentResponse },
        "Payment created successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Update payment status (Admin/Staff only)
  // @route   PUT /api/payments/:id/status
  // @access  Private/Admin/Staff
  updatePaymentStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, transaction_id, notes } = req.body;

      if (!status) {
        return error(res, "Payment status is required", 400);
      }

      const validStatuses = ["pending", "completed", "failed", "refunded"];
      if (!validStatuses.includes(status)) {
        return error(res, "Invalid payment status", 400);
      }

      const payment = await Payment.findById(id);
      if (!payment) {
        return notFound(res, "Payment not found");
      }

      const updatedPayment = await payment.updateStatus(
        status,
        transaction_id,
        notes
      );
      const paymentResponse = updatedPayment.toJSON();

      return success(
        res,
        { payment: paymentResponse },
        "Payment status updated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Update payment (Admin/Staff only)
  // @route   PUT /api/payments/:id
  // @access  Private/Admin/Staff
  updatePayment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { payment_method, payment_status, notes } = req.body;

      const payment = await Payment.findById(id);
      if (!payment) {
        return notFound(res, "Payment not found");
      }

      // Update payment
      const updatedPayment = await payment.update({
        payment_method,
        payment_status,
        notes,
      });

      // If this is a completed cash payment for additional services,
      // update all other pending payments for this booking to completed
      if (payment_status === "completed" && payment_method === "cash") {
        try {
          await executeQuery(
            `UPDATE payments 
             SET payment_status = 'completed', payment_date = NOW() 
             WHERE booking_id = ? AND payment_method = 'additional_services' AND payment_status = 'pending' AND id != ?`,
            [payment.booking_id, payment.id]
          );
          console.log(
            `Updated all pending additional_services payments for booking ${payment.booking_id} to completed`
          );
        } catch (error) {
          console.error("Error updating pending payments:", error);
          // Don't fail the main request if this fails
        }
      }

      return success(
        res,
        { payment: updatedPayment.toJSON() },
        "Payment updated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Process refund (Admin only)
  // @route   POST /api/payments/:id/refund
  // @access  Private/Admin
  processRefund: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { refund_amount, notes } = req.body;

      const payment = await Payment.findById(id);
      if (!payment) {
        return notFound(res, "Payment not found");
      }

      if (!payment.canBeRefunded()) {
        return error(res, "Payment cannot be refunded", 400);
      }

      const refundedPayment = await payment.processRefund(refund_amount, notes);
      const paymentResponse = refundedPayment.toJSON();

      return success(
        res,
        { payment: paymentResponse },
        "Refund processed successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get payment statistics (Admin/Staff only)
  // @route   GET /api/payments/stats
  // @access  Private/Admin/Staff
  getPaymentStats: async (req, res, next) => {
    try {
      const { date_from, date_to, payment_method } = req.query;

      const filters = {};
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;
      if (payment_method) filters.payment_method = payment_method;

      const stats = await Payment.getStatistics(filters);

      return success(
        res,
        { stats },
        "Payment statistics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get revenue by date range (Admin/Staff only)
  // @route   GET /api/payments/revenue
  // @access  Private/Admin/Staff
  getRevenue: async (req, res, next) => {
    try {
      const { start_date, end_date, group_by } = req.query;

      if (!start_date || !end_date) {
        return error(res, "Start date and end date are required", 400);
      }

      const groupBy = group_by || "day";
      const validGroupBy = ["day", "month", "year"];

      if (!validGroupBy.includes(groupBy)) {
        return error(
          res,
          "Invalid group_by parameter. Use: day, month, or year",
          400
        );
      }

      const revenue = await Payment.getRevenueByDateRange(
        start_date,
        end_date,
        groupBy
      );

      return success(
        res,
        {
          revenue,
          period: { start_date, end_date, group_by: groupBy },
        },
        "Revenue data retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get user's payments
  // @route   GET /api/payments/my-payments
  // @access  Private
  getMyPayments: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        user_id: req.user.id,
        payment_status: req.query.payment_status,
        payment_method: req.query.payment_method,
        booking_id: req.query.booking_id,
      };
      const result = await Payment.getAll(filters, page, limit);

      return paginated(
        res,
        result.payments,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Your payments retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get payments by booking ID
  // @route   GET /api/payments/booking/:booking_id
  // @access  Private (own booking) / Admin/Staff
  getPaymentsByBookingId: async (req, res, next) => {
    try {
      const { booking_id } = req.params;

      // Validate booking exists and user has access
      const booking = await Booking.findById(booking_id);
      if (!booking) {
        return notFound(res, "Booking not found");
      }

      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      const payments = await Payment.findByBookingId(booking_id);
      const paymentResponses = payments.map((payment) => payment.toJSON());

      return success(
        res,
        { payments: paymentResponses },
        "Booking payments retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },
};

// Merge placeholder methods
Object.assign(paymentController, require("./placeholders"));

module.exports = paymentController;
