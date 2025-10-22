// Admin Dashboard Controller
// Handles dashboard statistics and overview

const { executeQuery } = require("../../config/database");
const { success, error } = require("../../utils/responseHelper");

const dashboardController = {
  // @desc    Get dashboard overview statistics
  // @route   GET /api/admin/dashboard/overview
  // @access  Private/Admin
  getOverview: async (req, res, next) => {
    try {
      // Calculate total revenue from ALL completed payments
      // This includes: room bookings (with VAT) + additional services
      const totalRevenueQuery = `
        SELECT COALESCE(SUM(p.amount), 0) as total_revenue
        FROM payments p
        WHERE p.payment_status = 'completed'
      `;

      // Count total bookings
      const bookingsQuery = `
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m') THEN 1 END) as bookings_this_month
        FROM bookings
        WHERE status != 'cancelled'
      `;

      // Count rooms
      const roomsQuery = `
        SELECT 
          COUNT(*) as total_rooms,
          COUNT(CASE WHEN status = 'available' THEN 1 END) as available_rooms
        FROM rooms
      `;

      // Count staff
      const staffQuery = `
        SELECT COUNT(*) as total_staff
        FROM users
        WHERE role = 'staff' AND is_active = 1
      `;

      // Count customers
      const customersQuery = `
        SELECT COUNT(*) as total_customers
        FROM users
        WHERE role = 'customer'
      `;

      // Calculate occupancy rate (based on current room status)
      const occupancyQuery = `
        SELECT 
          COUNT(*) as total_rooms,
          SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms
        FROM rooms
      `;

      const [totalRevenueResult, bookings, rooms, staff, customers, occupancy] =
        await Promise.all([
          executeQuery(totalRevenueQuery),
          executeQuery(bookingsQuery),
          executeQuery(roomsQuery),
          executeQuery(staffQuery),
          executeQuery(customersQuery),
          executeQuery(occupancyQuery),
        ]);

      const occupancyRate =
        occupancy[0].total_rooms > 0
          ? (occupancy[0].occupied_rooms / occupancy[0].total_rooms) * 100
          : 0;

      const totalRevenue = parseFloat(totalRevenueResult[0].total_revenue || 0);

      // Calculate revenue growth (this month vs last month)
      // Only count completed payments for accurate comparison
      const currentMonthRevenueQuery = `
        SELECT COALESCE(SUM(p.amount), 0) as current_month_revenue
        FROM payments p
        WHERE p.payment_status = 'completed' 
          AND DATE_FORMAT(p.payment_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
      `;

      const lastMonthRevenueQuery = `
        SELECT COALESCE(SUM(p.amount), 0) as last_month_revenue
        FROM payments p
        WHERE p.payment_status = 'completed' 
          AND DATE_FORMAT(p.payment_date, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
      `;

      const [currentMonthResult, lastMonthResult] = await Promise.all([
        executeQuery(currentMonthRevenueQuery),
        executeQuery(lastMonthRevenueQuery),
      ]);

      const currentMonthRevenue = parseFloat(
        currentMonthResult[0].current_month_revenue || 0
      );
      const lastMonthRevenue = parseFloat(
        lastMonthResult[0].last_month_revenue || 0
      );

      let revenueGrowth = 0;
      if (lastMonthRevenue > 0) {
        revenueGrowth =
          ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        revenueGrowth = Math.round(revenueGrowth * 10) / 10;
      }

      return success(res, {
        totalRevenue: totalRevenue,
        totalBookings: parseInt(bookings[0].total_bookings),
        bookingsThisMonth: parseInt(bookings[0].bookings_this_month),
        totalRooms: parseInt(rooms[0].total_rooms),
        availableRooms: parseInt(rooms[0].available_rooms),
        totalStaff: parseInt(staff[0].total_staff),
        totalCustomers: parseInt(customers[0].total_customers),
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        revenueGrowth: revenueGrowth,
      });
    } catch (err) {
      console.error("Error in getOverview:", err);
      next(err);
    }
  },

  // @desc    Get revenue analytics
  // @route   GET /api/admin/dashboard/revenue
  // @access  Private/Admin
  getRevenueAnalytics: async (req, res, next) => {
    try {
      const { period = "monthly", from, to } = req.query;

      let dateFormat;
      switch (period) {
        case "daily":
          dateFormat = "%Y-%m-%d";
          break;
        case "yearly":
          dateFormat = "%Y";
          break;
        default: // monthly
          dateFormat = "%Y-%m";
      }

      let query = `
        SELECT 
          DATE_FORMAT(COALESCE(p.payment_date, p.created_at), '${dateFormat}') as period,
          SUM(p.amount) as revenue,
          COUNT(DISTINCT p.booking_id) as bookings
        FROM payments p
        WHERE p.payment_status = 'completed'
      `;

      const params = [];
      if (from && to) {
        query += ` AND COALESCE(p.payment_date, p.created_at) BETWEEN ? AND ?`;
        params.push(from, to);
      } else {
        // Default: last 12 months
        query += ` AND COALESCE(p.payment_date, p.created_at) >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`;
      }

      query += ` GROUP BY period ORDER BY period ASC`;

      const results = await executeQuery(query, params);

      const labels = results.map((r) => r.period);
      const data = results.map((r) => parseFloat(r.revenue));
      const total = data.reduce((sum, val) => sum + val, 0);

      return success(res, {
        labels,
        data,
        total,
        period,
      });
    } catch (err) {
      console.error("Error in getRevenueAnalytics:", err);
      next(err);
    }
  },

  // @desc    Get occupancy rate
  // @route   GET /api/admin/dashboard/occupancy
  // @access  Private/Admin
  getOccupancyRate: async (req, res, next) => {
    try {
      const { from, to } = req.query;

      // Calculate occupancy based on bookings in date range
      let query = `
        SELECT 
          COUNT(DISTINCT r.id) as total_rooms,
          COUNT(DISTINCT CASE 
            WHEN b.status IN ('confirmed', 'checked_in', 'checked_out')
            THEN r.id 
          END) as booked_rooms
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id
      `;

      const params = [];
      if (from && to) {
        query += ` WHERE b.check_in_date <= ? AND b.check_out_date >= ?`;
        params.push(to, from);
      }

      const results = await executeQuery(query, params);

      const totalRooms = results[0].total_rooms;
      const bookedRooms = results[0].booked_rooms || 0;
      const occupancyRate =
        totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0;

      return success(res, {
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        totalRooms,
        bookedRooms,
        availableRooms: totalRooms - bookedRooms,
      });
    } catch (err) {
      console.error("Error in getOccupancyRate:", err);
      next(err);
    }
  },

  // @desc    Get top performing rooms
  // @route   GET /api/admin/dashboard/top-rooms
  // @access  Private/Admin
  getTopRooms: async (req, res, next) => {
    try {
      const { limit = 5 } = req.query;

      // Use string interpolation for LIMIT to avoid MySQL prepared statement issues
      const limitInt = parseInt(limit);
      const query = `
        SELECT 
          r.id as room_id,
          r.room_number,
          r.room_type,
          COUNT(DISTINCT b.id) as bookings,
          COALESCE(SUM(CASE 
            WHEN p.payment_method != 'additional_services' THEN p.amount 
            ELSE 0 
          END), 0) as revenue,
          COALESCE(AVG(rev.rating), 0) as avg_rating
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id 
          AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        LEFT JOIN payments p ON b.id = p.booking_id 
          AND p.payment_status = 'completed'
        LEFT JOIN reviews rev ON b.id = rev.booking_id
        GROUP BY r.id, r.room_number, r.room_type
        ORDER BY revenue DESC
        LIMIT ${limitInt}
      `;

      const results = await executeQuery(query);

      return success(
        res,
        results.map((r) => ({
          room_id: r.room_id,
          room_number: r.room_number,
          room_type: r.room_type,
          bookings: parseInt(r.bookings),
          revenue: parseFloat(r.revenue),
          avg_rating: parseFloat(r.avg_rating).toFixed(1),
        }))
      );
    } catch (err) {
      console.error("Error in getTopRooms:", err);
      next(err);
    }
  },

  // @desc    Get recent activities
  // @route   GET /api/admin/dashboard/activities
  // @access  Private/Admin
  getRecentActivities: async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;
      const limitInt = parseInt(limit);

      const query = `
        SELECT 
          'booking' as type,
          CONCAT(u.full_name, ' đặt phòng ', r.room_number) as action,
          u.full_name as user,
          b.created_at as time
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        ORDER BY b.created_at DESC
        LIMIT ${limitInt}
      `;

      const results = await executeQuery(query);

      return success(
        res,
        results.map((r) => ({
          type: r.type,
          user: r.user,
          action: r.action,
          time: r.time,
        }))
      );
    } catch (err) {
      console.error("Error in getRecentActivities:", err);
      next(err);
    }
  },
};

module.exports = dashboardController;
