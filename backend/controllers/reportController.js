// Report Controller
// Handles analytics and staff reports

const { StaffReport, Payment, Booking, User, Room } = require("../models");
const {
  success,
  error,
  created,
  notFound,
  paginated,
  forbidden,
} = require("../utils/responseHelper");
const { validationResult } = require("express-validator");

const reportController = {
  // @desc    Get all staff reports (Admin only)
  // @route   GET /api/reports/staff
  // @access  Private/Admin
  getAllStaffReports: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        staff_id: req.query.staff_id,
        report_date: req.query.report_date,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
      };

      const result = await StaffReport.getAll(filters, page, limit);

      return paginated(
        res,
        result.reports,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Staff reports retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get staff report by ID
  // @route   GET /api/reports/staff/:id
  // @access  Private/Admin/Staff (own report)
  getStaffReportById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const report = await StaffReport.findById(id);
      if (!report) {
        return notFound(res, "Staff report not found");
      }

      // Check access permissions
      if (req.user.role === "staff" && report.staff_id !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      const reportResponse = report.toJSON();
      return success(
        res,
        { report: reportResponse },
        "Staff report retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Create or update staff report
  // @route   POST /api/reports/staff
  // @access  Private/Staff/Admin
  createOrUpdateStaffReport: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const {
        staff_id,
        report_date,
        checkins_count,
        checkouts_count,
        total_revenue,
        notes,
      } = req.body;

      // If user is staff, they can only create reports for themselves
      const targetStaffId =
        req.user.role === "staff" ? req.user.id : staff_id || req.user.id;

      const reportData = {
        staff_id: targetStaffId,
        report_date,
        checkins_count: checkins_count || 0,
        checkouts_count: checkouts_count || 0,
        total_revenue: total_revenue || 0,
        notes,
      };

      const report = await StaffReport.createOrUpdate(reportData);
      const reportResponse = report.toJSON();

      return success(
        res,
        { report: reportResponse },
        "Staff report saved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Auto-generate staff report for date
  // @route   POST /api/reports/staff/auto-generate
  // @access  Private/Admin
  autoGenerateStaffReport: async (req, res, next) => {
    try {
      const { staff_id, report_date } = req.body;

      if (!staff_id || !report_date) {
        return error(res, "Staff ID and report date are required", 400);
      }

      const report = await StaffReport.autoGenerateReport(
        staff_id,
        report_date
      );
      const reportResponse = report.toJSON();

      return success(
        res,
        { report: reportResponse },
        "Staff report auto-generated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get staff performance statistics
  // @route   GET /api/reports/staff/:staff_id/performance
  // @access  Private/Admin/Staff (own performance)
  getStaffPerformance: async (req, res, next) => {
    try {
      const { staff_id } = req.params;
      const { start_date, end_date } = req.query;

      // Check access permissions
      if (req.user.role === "staff" && parseInt(staff_id) !== req.user.id) {
        return forbidden(res, "Access denied");
      }

      if (!start_date || !end_date) {
        return error(res, "Start date and end date are required", 400);
      }

      const performance = await StaffReport.getStaffPerformanceStats(
        staff_id,
        start_date,
        end_date
      );

      return success(
        res,
        {
          staff_id: parseInt(staff_id),
          period: { start_date, end_date },
          performance,
        },
        "Staff performance retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get team performance comparison (Admin only)
  // @route   GET /api/reports/team-performance
  // @access  Private/Admin
  getTeamPerformance: async (req, res, next) => {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return error(res, "Start date and end date are required", 400);
      }

      const teamPerformance = await StaffReport.getTeamPerformanceComparison(
        start_date,
        end_date
      );

      return success(
        res,
        {
          period: { start_date, end_date },
          team_performance: teamPerformance,
        },
        "Team performance comparison retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get daily summary
  // @route   GET /api/reports/daily-summary
  // @access  Private/Admin/Staff
  getDailySummary: async (req, res, next) => {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return error(res, "Start date and end date are required", 400);
      }

      const dailySummary = await StaffReport.getDailySummary(
        start_date,
        end_date
      );

      return success(
        res,
        {
          period: { start_date, end_date },
          daily_summary: dailySummary,
        },
        "Daily summary retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get my reports (Staff only)
  // @route   GET /api/reports/my-reports
  // @access  Private/Staff
  getMyReports: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await StaffReport.getByStaffId(req.user.id, page, limit);

      return paginated(
        res,
        result.reports,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "Your reports retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get reports overview
  // @route   GET /api/reports/overview
  // @access  Private/Admin/Staff
  getReportsOverview: async (req, res, next) => {
    try {
      const { executeQuery } = require("../config/database");

      // Simple test data
      const testData = {
        stats: {
          totalBookings: 28,
          totalRevenue: 64740000,
          totalCustomers: 15,
          averageBookingValue: 2312142,
          occupancyRate: 0,
          growthRate: 12.3,
        },
        bookingsByStatus: [
          { status: "confirmed", count: 15, percentage: 54 },
          { status: "checked_out", count: 10, percentage: 36 },
          { status: "cancelled", count: 3, percentage: 10 },
        ],
        revenueByMonth: [
          { month: "Tháng 10", revenue: 32000000, bookings: 12 },
          { month: "Tháng 9", revenue: 28000000, bookings: 11 },
          { month: "Tháng 8", revenue: 25000000, bookings: 10 },
        ],
        topRooms: [
          {
            room_number: "101",
            room_type: "Deluxe",
            bookings: 8,
            revenue: 15000000,
          },
          {
            room_number: "201",
            room_type: "Suite",
            bookings: 6,
            revenue: 12000000,
          },
        ],
        topCustomers: [
          {
            name: "Nguyễn Văn A",
            email: "a@gmail.com",
            bookings: 5,
            total_spent: 10000000,
          },
          {
            name: "Trần Thị B",
            email: "b@gmail.com",
            bookings: 4,
            total_spent: 8000000,
          },
        ],
      };

      return success(res, testData, "Reports overview retrieved successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get business analytics dashboard (Admin only)
  // @route   GET /api/reports/dashboard
  // @access  Private/Admin
  getDashboardAnalytics: async (req, res, next) => {
    try {
      const { executeQuery } = require("../config/database");

      // Get overall statistics
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
          (SELECT COUNT(*) FROM rooms) as total_rooms,
          (SELECT COUNT(*) FROM bookings) as total_bookings,
          (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as active_bookings,
          (SELECT COUNT(*) FROM reviews) as total_reviews,
          (SELECT AVG(rating) FROM reviews) as avg_rating,
          (SELECT SUM(amount) FROM payments WHERE payment_status = 'completed') as total_revenue,
          (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURDATE()) as bookings_today,
          (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as new_customers_today
      `;

      // Get monthly revenue for the last 12 months
      const revenueQuery = `
        SELECT 
          DATE_FORMAT(payment_date, '%Y-%m') as month,
          SUM(amount) as revenue
        FROM payments 
        WHERE payment_status = 'completed' 
        AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
        ORDER BY month ASC
      `;

      // Get room occupancy rates
      const occupancyQuery = `
        SELECT 
          r.room_type,
          COUNT(DISTINCT r.id) as total_rooms,
          COUNT(DISTINCT CASE WHEN r.status = 'occupied' THEN r.id END) as occupied_rooms,
          ROUND((COUNT(DISTINCT CASE WHEN r.status = 'occupied' THEN r.id END) / COUNT(DISTINCT r.id)) * 100, 2) as occupancy_rate
        FROM rooms r
        GROUP BY r.room_type
      `;

      // Get top performing rooms
      const topRoomsQuery = `
        SELECT 
          r.room_number,
          r.room_type,
          COUNT(b.id) as booking_count,
          SUM(b.total_amount) as total_revenue,
          AVG(rv.rating) as avg_rating
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        LEFT JOIN reviews rv ON b.id = rv.booking_id
        GROUP BY r.id
        ORDER BY total_revenue DESC
        LIMIT 10
      `;

      const [stats, monthlyRevenue, occupancyRates, topRooms] =
        await Promise.all([
          executeQuery(statsQuery),
          executeQuery(revenueQuery),
          executeQuery(occupancyQuery),
          executeQuery(topRoomsQuery),
        ]);

      const dashboard = {
        overview: stats[0],
        monthly_revenue: monthlyRevenue,
        occupancy_rates: occupancyRates,
        top_performing_rooms: topRooms,
      };

      return success(
        res,
        { dashboard },
        "Dashboard analytics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get revenue report
  // @route   GET /api/reports/revenue
  // @access  Private/Admin
  getRevenueReport: async (req, res, next) => {
    try {
      const { start_date, end_date, group_by } = req.query;

      if (!start_date || !end_date) {
        return error(res, "Start date and end_date are required", 400);
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

      // Get revenue data
      const revenue = await Payment.getRevenueByDateRange(
        start_date,
        end_date,
        groupBy
      );

      // Get payment method breakdown
      const { executeQuery } = require("../config/database");
      const paymentMethodQuery = `
        SELECT 
          payment_method,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount
        FROM payments 
        WHERE payment_status = 'completed'
        AND DATE(payment_date) BETWEEN ? AND ?
        GROUP BY payment_method
        ORDER BY total_amount DESC
      `;

      const paymentMethods = await executeQuery(paymentMethodQuery, [
        start_date,
        end_date,
      ]);

      return success(
        res,
        {
          period: { start_date, end_date, group_by: groupBy },
          revenue_timeline: revenue,
          payment_methods: paymentMethods,
        },
        "Revenue report retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get booking analytics
  // @route   GET /api/reports/bookings
  // @access  Private/Admin/Staff
  getBookingAnalytics: async (req, res, next) => {
    try {
      const { start_date, end_date } = req.query;

      const { executeQuery } = require("../config/database");

      let dateFilter = "";
      const params = [];

      if (start_date && end_date) {
        dateFilter = "WHERE DATE(b.created_at) BETWEEN ? AND ?";
        params.push(start_date, end_date);
      }

      const analyticsQuery = `
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bookings,
          COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN b.status = 'checked_in' THEN 1 END) as active_bookings,
          COUNT(CASE WHEN b.status = 'checked_out' THEN 1 END) as completed_bookings,
          COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
          AVG(b.total_amount) as avg_booking_value,
          AVG(DATEDIFF(b.check_out_date, b.check_in_date)) as avg_stay_duration,
          AVG(b.guests_count) as avg_guests_per_booking
        FROM bookings b
        ${dateFilter}
      `;

      const roomTypeQuery = `
        SELECT 
          r.room_type,
          COUNT(b.id) as booking_count,
          AVG(b.total_amount) as avg_booking_value
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        ${dateFilter}
        GROUP BY r.room_type
        ORDER BY booking_count DESC
      `;

      const [analytics, roomTypeBreakdown] = await Promise.all([
        executeQuery(analyticsQuery, params),
        executeQuery(roomTypeQuery, params),
      ]);

      return success(
        res,
        {
          period:
            start_date && end_date ? { start_date, end_date } : "all_time",
          analytics: analytics[0],
          room_type_breakdown: roomTypeBreakdown,
        },
        "Booking analytics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },
};

// Merge placeholder methods
Object.assign(reportController, require("./placeholders"));

module.exports = reportController;
