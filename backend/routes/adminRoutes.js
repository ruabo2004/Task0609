const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authEnhanced");
const { body, param, query } = require("express-validator");

// Apply authentication and admin role requirement to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Admin validation rules
const adminValidation = {
  updateCustomerStatus: [
    param("customerId").isInt({ min: 1 }).withMessage("Invalid customer ID"),
    body("status")
      .isIn(["active", "inactive", "banned"])
      .withMessage("Invalid status"),
    body("reason")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Reason must be less than 500 characters"),
  ],

  createEmployee: [
    body("full_name")
      .notEmpty()
      .isLength({ min: 2, max: 255 })
      .withMessage("Full name must be between 2 and 255 characters"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("phone")
      .matches(/^[0-9]{10,11}$/)
      .withMessage("Phone must be 10-11 digits"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("position")
      .isIn(["receptionist", "manager", "housekeeping", "maintenance"])
      .withMessage("Invalid position"),
    body("department")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Department must be less than 100 characters"),
    body("hire_date").isISO8601().withMessage("Invalid hire date"),
    body("salary")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Salary must be positive"),
    body("shift_type")
      .optional()
      .isIn(["morning", "afternoon", "night", "flexible"])
      .withMessage("Invalid shift type"),
    body("permissions")
      .optional()
      .isArray()
      .withMessage("Permissions must be an array"),
    body("supervisor_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid supervisor ID"),
  ],

  updateEmployee: [
    param("employeeId").isInt({ min: 1 }).withMessage("Invalid employee ID"),
    body("position")
      .optional()
      .isIn(["receptionist", "manager", "housekeeping", "maintenance"])
      .withMessage("Invalid position"),
    body("department")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Department must be less than 100 characters"),
    body("salary")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Salary must be positive"),
    body("shift_type")
      .optional()
      .isIn(["morning", "afternoon", "night", "flexible"])
      .withMessage("Invalid shift type"),
    body("permissions")
      .optional()
      .isArray()
      .withMessage("Permissions must be an array"),
    body("supervisor_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid supervisor ID"),
    body("status")
      .optional()
      .isIn(["active", "inactive", "terminated"])
      .withMessage("Invalid status"),
  ],

  createRoom: [
    body("room_number")
      .notEmpty()
      .isLength({ max: 50 })
      .withMessage(
        "Room number is required and must be less than 50 characters"
      ),
    body("type_id").isInt({ min: 1 }).withMessage("Invalid room type ID"),
    body("room_name")
      .notEmpty()
      .isLength({ max: 255 })
      .withMessage(
        "Room name is required and must be less than 255 characters"
      ),
    body("floor_number")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Floor number must be positive"),
    body("room_size")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Room size must be positive"),
    body("price_per_night")
      .isFloat({ min: 0 })
      .withMessage("Price per night must be positive"),
    body("weekend_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Weekend price must be positive"),
    body("holiday_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Holiday price must be positive"),
    body("view_type")
      .optional()
      .isIn(["sea", "mountain", "city", "garden", "pool"])
      .withMessage("Invalid view type"),
    body("bed_type")
      .optional()
      .isIn(["single", "double", "queen", "king", "twin"])
      .withMessage("Invalid bed type"),
    body("bathroom_type")
      .optional()
      .isIn(["private", "shared"])
      .withMessage("Invalid bathroom type"),
  ],

  updateRoom: [
    param("roomId").isInt({ min: 1 }).withMessage("Invalid room ID"),
    body("room_number")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Room number must be less than 50 characters"),
    body("type_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid room type ID"),
    body("room_name")
      .optional()
      .isLength({ max: 255 })
      .withMessage("Room name must be less than 255 characters"),
    body("floor_number")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Floor number must be positive"),
    body("room_size")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Room size must be positive"),
    body("price_per_night")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price per night must be positive"),
    body("weekend_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Weekend price must be positive"),
    body("holiday_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Holiday price must be positive"),
    body("status")
      .optional()
      .isIn(["available", "occupied", "maintenance", "out_of_order"])
      .withMessage("Invalid room status"),
    body("cleaning_status")
      .optional()
      .isIn(["clean", "dirty", "cleaning"])
      .withMessage("Invalid cleaning status"),
  ],

  deleteAction: [
    body("reason")
      .optional()
      .isLength({ min: 5, max: 500 })
      .withMessage("Reason must be between 5 and 500 characters"),
  ],

  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be positive"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  customerFilters: [
    query("role")
      .optional()
      .isIn(["customer", "staff", "admin"])
      .withMessage("Invalid role"),
    query("status")
      .optional()
      .isIn(["active", "inactive", "banned"])
      .withMessage("Invalid status"),
    query("sort_by")
      .optional()
      .isIn([
        "created_at",
        "full_name",
        "email",
        "total_bookings",
        "total_spent",
      ])
      .withMessage("Invalid sort field"),
    query("sort_order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sort order"),
  ],

  employeeFilters: [
    query("position")
      .optional()
      .isIn(["receptionist", "manager", "housekeeping", "maintenance"])
      .withMessage("Invalid position"),
    query("department")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Invalid department"),
    query("status")
      .optional()
      .isIn(["active", "inactive", "terminated"])
      .withMessage("Invalid status"),
  ],
};

// ===============================================
// DASHBOARD ROUTES
// ===============================================

/**
 * GET /api/admin/dashboard
 * Get admin dashboard overview
 */
router.get("/dashboard", adminController.getDashboard);

// ===============================================
// CUSTOMER MANAGEMENT ROUTES
// ===============================================

/**
 * GET /api/admin/customers
 * Get all customers with filters and pagination
 */
router.get(
  "/customers",
  adminValidation.pagination,
  adminValidation.customerFilters,
  adminController.getAllCustomers
);

/**
 * GET /api/admin/customers/:customerId
 * Get customer details by ID
 */
router.get(
  "/customers/:customerId",
  param("customerId").isInt({ min: 1 }).withMessage("Invalid customer ID"),
  adminController.getCustomerById
);

/**
 * PUT /api/admin/customers/:customerId/status
 * Update customer status (active/inactive/banned)
 */
router.put(
  "/customers/:customerId/status",
  adminValidation.updateCustomerStatus,
  adminController.updateCustomerStatus
);

// ===============================================
// EMPLOYEE MANAGEMENT ROUTES
// ===============================================

/**
 * GET /api/admin/employees
 * Get all employees with filters and pagination
 */
router.get(
  "/employees",
  adminValidation.pagination,
  adminValidation.employeeFilters,
  adminController.getAllEmployees
);

/**
 * POST /api/admin/employees
 * Create new employee
 */
router.post(
  "/employees",
  adminValidation.createEmployee,
  adminController.createEmployee
);

/**
 * PUT /api/admin/employees/:employeeId
 * Update employee
 */
router.put(
  "/employees/:employeeId",
  adminValidation.updateEmployee,
  adminController.updateEmployee
);

/**
 * DELETE /api/admin/employees/:employeeId
 * Delete employee (soft delete)
 */
router.delete(
  "/employees/:employeeId",
  param("employeeId").isInt({ min: 1 }).withMessage("Invalid employee ID"),
  adminValidation.deleteAction,
  adminController.deleteEmployee
);

// ===============================================
// ROOM MANAGEMENT ROUTES
// ===============================================

/**
 * POST /api/admin/rooms
 * Create new room
 */
router.post("/rooms", adminValidation.createRoom, adminController.createRoom);

/**
 * PUT /api/admin/rooms/:roomId
 * Update room
 */
router.put(
  "/rooms/:roomId",
  adminValidation.updateRoom,
  adminController.updateRoom
);

/**
 * DELETE /api/admin/rooms/:roomId
 * Delete room
 */
router.delete(
  "/rooms/:roomId",
  param("roomId").isInt({ min: 1 }).withMessage("Invalid room ID"),
  adminValidation.deleteAction,
  adminController.deleteRoom
);

// ===============================================
// BOOKING MANAGEMENT ROUTES
// ===============================================

/**
 * GET /api/admin/bookings
 * Get all bookings for admin view
 */
router.get(
  "/bookings",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be positive"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["pending", "confirmed", "cancelled", "completed"])
      .withMessage("Invalid status"),
    query("payment_status")
      .optional()
      .isIn(["pending", "partial", "paid", "refunded"])
      .withMessage("Invalid payment status"),
    query("date_from")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format"),
    query("date_to").optional().isISO8601().withMessage("Invalid date format"),
  ],
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        payment_status = null,
        date_from = null,
        date_to = null,
        search = null,
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = [];
      let queryParams = [];

      if (status) {
        whereConditions.push("b.booking_status = ?");
        queryParams.push(status);
      }

      if (payment_status) {
        whereConditions.push("b.payment_status = ?");
        queryParams.push(payment_status);
      }

      if (date_from) {
        whereConditions.push("DATE(b.created_at) >= ?");
        queryParams.push(date_from);
      }

      if (date_to) {
        whereConditions.push("DATE(b.created_at) <= ?");
        queryParams.push(date_to);
      }

      if (search) {
        whereConditions.push(
          "(b.booking_code LIKE ? OR c.full_name LIKE ? OR c.email LIKE ?)"
        );
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const { pool } = require("../config/database");

      // Get total count
      const [countRows] = await pool.execute(
        `SELECT COUNT(*) as total FROM bookings b 
         JOIN customers c ON b.customer_id = c.customer_id 
         ${whereClause}`,
        queryParams
      );

      // Get bookings
      const [rows] = await pool.execute(
        `SELECT 
          b.*,
          c.full_name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          r.room_number,
          rt.type_name as room_type,
          checkin_staff.full_name as checked_in_by_name,
          checkout_staff.full_name as checked_out_by_name
         FROM bookings b
         JOIN customers c ON b.customer_id = c.customer_id
         JOIN rooms r ON b.room_id = r.room_id
         JOIN room_types rt ON r.type_id = rt.type_id
         LEFT JOIN employees e1 ON b.checked_in_by = e1.employee_id
         LEFT JOIN customers checkin_staff ON e1.customer_id = checkin_staff.customer_id
         LEFT JOIN employees e2 ON b.checked_out_by = e2.employee_id
         LEFT JOIN customers checkout_staff ON e2.customer_id = checkout_staff.customer_id
         ${whereClause}
         ORDER BY b.created_at DESC
         LIMIT ? OFFSET ?`,
        [...queryParams, parseInt(limit), offset]
      );

      const total = countRows[0].total;

      res.json({
        success: true,
        message: "Bookings retrieved successfully",
        data: {
          bookings: rows,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(total / limit),
            total_items: total,
            items_per_page: parseInt(limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get bookings",
        error: error.message,
      });
    }
  }
);

// ===============================================
// REPORTS & ANALYTICS ROUTES
// ===============================================

/**
 * GET /api/admin/reports/revenue
 * Get revenue reports
 */
router.get(
  "/reports/revenue",
  [
    query("period")
      .optional()
      .isIn(["daily", "weekly", "monthly", "yearly"])
      .withMessage("Invalid period"),
    query("start_date")
      .optional()
      .isISO8601()
      .withMessage("Invalid start date"),
    query("end_date").optional().isISO8601().withMessage("Invalid end date"),
  ],
  async (req, res) => {
    try {
      const { period = "monthly", start_date, end_date } = req.query;
      const { pool } = require("../config/database");

      let dateFormat, groupBy;
      switch (period) {
        case "daily":
          dateFormat = "%Y-%m-%d";
          groupBy = "DATE(created_at)";
          break;
        case "weekly":
          dateFormat = "%Y-%u";
          groupBy = "YEARWEEK(created_at)";
          break;
        case "monthly":
          dateFormat = "%Y-%m";
          groupBy = "YEAR(created_at), MONTH(created_at)";
          break;
        case "yearly":
          dateFormat = "%Y";
          groupBy = "YEAR(created_at)";
          break;
      }

      let whereClause = "";
      let queryParams = [];

      if (start_date && end_date) {
        whereClause = "WHERE DATE(created_at) BETWEEN ? AND ?";
        queryParams = [start_date, end_date];
      }

      const [rows] = await pool.execute(
        `SELECT 
          DATE_FORMAT(created_at, '${dateFormat}') as period,
          COUNT(*) as total_bookings,
          SUM(total_amount) as total_revenue,
          SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid_revenue,
          AVG(total_amount) as average_booking_value
         FROM bookings 
         ${whereClause}
         GROUP BY ${groupBy}
         ORDER BY period ASC`,
        queryParams
      );

      // Calculate summary
      const summary = {
        total_bookings: rows.reduce((sum, row) => sum + row.total_bookings, 0),
        total_revenue: rows.reduce(
          (sum, row) => sum + parseFloat(row.total_revenue || 0),
          0
        ),
        paid_revenue: rows.reduce(
          (sum, row) => sum + parseFloat(row.paid_revenue || 0),
          0
        ),
        average_booking_value:
          rows.length > 0
            ? rows.reduce(
                (sum, row) => sum + parseFloat(row.average_booking_value || 0),
                0
              ) / rows.length
            : 0,
      };

      res.json({
        success: true,
        message: "Revenue report retrieved successfully",
        data: {
          period,
          summary,
          details: rows,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get revenue report",
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/admin/reports/occupancy
 * Get room occupancy statistics
 */
router.get(
  "/reports/occupancy",
  [
    query("start_date")
      .optional()
      .isISO8601()
      .withMessage("Invalid start date"),
    query("end_date").optional().isISO8601().withMessage("Invalid end date"),
  ],
  async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      const { pool } = require("../config/database");

      const startDate =
        start_date ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      const endDate = end_date || new Date().toISOString().split("T")[0];

      // Get total rooms
      const [totalRoomsResult] = await pool.execute(
        "SELECT COUNT(*) as total FROM rooms"
      );
      const totalRooms = totalRoomsResult[0].total;

      // Get occupancy by date
      const [occupancyData] = await pool.execute(
        `SELECT 
          date,
          COUNT(CASE WHEN status = 'booked' THEN 1 END) as occupied_rooms,
          COUNT(*) as available_dates,
          ROUND(COUNT(CASE WHEN status = 'booked' THEN 1 END) * 100.0 / ?, 2) as occupancy_rate
         FROM room_availability 
         WHERE date BETWEEN ? AND ?
         GROUP BY date
         ORDER BY date ASC`,
        [totalRooms, startDate, endDate]
      );

      // Get occupancy by room type
      const [roomTypeOccupancy] = await pool.execute(
        `SELECT 
          rt.type_name,
          COUNT(DISTINCT r.room_id) as total_rooms,
          COUNT(CASE WHEN ra.status = 'booked' THEN 1 END) as booked_dates,
          ROUND(COUNT(CASE WHEN ra.status = 'booked' THEN 1 END) * 100.0 / (COUNT(DISTINCT r.room_id) * DATEDIFF(?, ?)), 2) as occupancy_rate
         FROM room_types rt
         LEFT JOIN rooms r ON rt.type_id = r.type_id
         LEFT JOIN room_availability ra ON r.room_id = ra.room_id AND ra.date BETWEEN ? AND ?
         GROUP BY rt.type_id, rt.type_name
         ORDER BY occupancy_rate DESC`,
        [endDate, startDate, startDate, endDate]
      );

      // Calculate overall statistics
      const totalBookedDates = occupancyData.reduce(
        (sum, day) => sum + day.occupied_rooms,
        0
      );
      const totalPossibleDates = totalRooms * occupancyData.length;
      const averageOccupancyRate =
        totalPossibleDates > 0
          ? ((totalBookedDates / totalPossibleDates) * 100).toFixed(2)
          : 0;

      res.json({
        success: true,
        message: "Occupancy report retrieved successfully",
        data: {
          period: { start_date: startDate, end_date: endDate },
          summary: {
            total_rooms: totalRooms,
            average_occupancy_rate: parseFloat(averageOccupancyRate),
            total_booked_dates: totalBookedDates,
            total_possible_dates: totalPossibleDates,
          },
          daily_occupancy: occupancyData,
          room_type_occupancy: roomTypeOccupancy,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get occupancy report",
        error: error.message,
      });
    }
  }
);

module.exports = router;
