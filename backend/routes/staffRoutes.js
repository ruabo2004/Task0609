const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const {
  authenticateToken,
  requireStaff,
  requirePermission,
} = require("../middleware/authEnhanced");
const { body, param, query } = require("express-validator");

// Staff validation rules
const staffValidation = {
  updateBookingStatus: [
    param("bookingId").isInt({ min: 1 }).withMessage("Invalid booking ID"),
    body("status")
      .isIn(["confirmed", "cancelled"])
      .withMessage("Status must be confirmed or cancelled"),
    body("staff_notes")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Notes must be less than 1000 characters"),
  ],

  checkIn: [
    param("bookingId").isInt({ min: 1 }).withMessage("Invalid booking ID"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes must be less than 500 characters"),
  ],

  checkOut: [
    param("bookingId").isInt({ min: 1 }).withMessage("Invalid booking ID"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes must be less than 500 characters"),
    body("additional_charges")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Additional charges must be positive"),
  ],

  updateDailyReport: [
    param("reportId").isInt({ min: 1 }).withMessage("Invalid report ID"),
    body("shift_type")
      .optional()
      .isIn(["morning", "afternoon", "night"])
      .withMessage("Invalid shift type"),
    body("check_ins_count")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Check-ins count must be positive"),
    body("check_outs_count")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Check-outs count must be positive"),
    body("notes")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Notes must be less than 2000 characters"),
  ],

  getBookings: [
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
    query("check_in_date")
      .optional()
      .isISO8601()
      .withMessage("Invalid check-in date"),
    query("check_out_date")
      .optional()
      .isISO8601()
      .withMessage("Invalid check-out date"),
  ],
};

// Apply authentication and staff role requirement to all routes
router.use(authenticateToken);
router.use(requireStaff);

// Add employee info to request
router.use(async (req, res, next) => {
  try {
    const Employee = require("../models/Employee");
    const employee = await Employee.findByCustomerId(req.user.customer_id);

    if (!employee && req.user.role === "staff") {
      return res.status(403).json({
        success: false,
        message: "Staff record not found. Please contact administrator.",
      });
    }

    req.employee = employee;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching employee data",
      error: error.message,
    });
  }
});

// ===============================================
// DASHBOARD ROUTES
// ===============================================

/**
 * GET /api/staff/dashboard
 * Get staff dashboard overview
 */
router.get("/dashboard", staffController.getDashboard);

// ===============================================
// BOOKING MANAGEMENT ROUTES
// ===============================================

/**
 * GET /api/staff/bookings
 * Get all bookings for staff management
 */
router.get(
  "/bookings",
  staffValidation.getBookings,
  requirePermission("booking_management"),
  staffController.getAllBookings
);

/**
 * PUT /api/staff/bookings/:bookingId/status
 * Update booking status (approve/reject)
 */
router.put(
  "/bookings/:bookingId/status",
  staffValidation.updateBookingStatus,
  requirePermission("booking_management"),
  staffController.updateBookingStatus
);

/**
 * POST /api/staff/bookings/:bookingId/checkin
 * Check-in customer
 */
router.post(
  "/bookings/:bookingId/checkin",
  staffValidation.checkIn,
  requirePermission("checkin_checkout"),
  staffController.checkInCustomer
);

/**
 * POST /api/staff/bookings/:bookingId/checkout
 * Check-out customer
 */
router.post(
  "/bookings/:bookingId/checkout",
  staffValidation.checkOut,
  requirePermission("checkin_checkout"),
  staffController.checkOutCustomer
);

// ===============================================
// DAILY REPORTS ROUTES
// ===============================================

/**
 * GET /api/staff/reports/daily
 * Get daily report for current employee
 */
router.get(
  "/reports/daily",
  requirePermission("daily_reports"),
  staffController.getDailyReports
);

/**
 * PUT /api/staff/reports/daily/:reportId
 * Update daily report
 */
router.put(
  "/reports/daily/:reportId",
  staffValidation.updateDailyReport,
  requirePermission("daily_reports"),
  staffController.updateDailyReport
);

/**
 * POST /api/staff/reports/daily/:reportId/submit
 * Submit daily report for approval
 */
router.post(
  "/reports/daily/:reportId/submit",
  param("reportId").isInt({ min: 1 }).withMessage("Invalid report ID"),
  requirePermission("daily_reports"),
  staffController.submitDailyReport
);

// ===============================================
// ROOM MANAGEMENT ROUTES (Basic for staff)
// ===============================================

/**
 * PUT /api/staff/rooms/:roomId/status
 * Update room status (cleaning, maintenance, etc.)
 */
router.put(
  "/rooms/:roomId/status",
  [
    param("roomId").isInt({ min: 1 }).withMessage("Invalid room ID"),
    body("status")
      .isIn(["available", "occupied", "maintenance", "out_of_order"])
      .withMessage("Invalid room status"),
    body("cleaning_status")
      .optional()
      .isIn(["clean", "dirty", "cleaning"])
      .withMessage("Invalid cleaning status"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes must be less than 500 characters"),
  ],
  requirePermission("room_management"),
  async (req, res) => {
    try {
      const { roomId } = req.params;
      const { status, cleaning_status, notes } = req.body;
      const { pool } = require("../config/database");

      // Update room status
      const setClause = [];
      const queryParams = [];

      if (status) {
        setClause.push("status = ?");
        queryParams.push(status);
      }

      if (cleaning_status) {
        setClause.push("cleaning_status = ?");
        queryParams.push(cleaning_status);
      }

      queryParams.push(roomId);

      await pool.execute(
        `UPDATE rooms SET ${setClause.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?`,
        queryParams
      );

      // Log activity if notes provided
      if (notes) {
        await pool.execute(
          `INSERT INTO room_activities (room_id, employee_id, activity_type, notes) VALUES (?, ?, ?, ?)`,
          [roomId, req.employee?.employee_id, "status_change", notes]
        );
      }

      res.json({
        success: true,
        message: "Room status updated successfully",
        data: { room_id: roomId, status, cleaning_status },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update room status",
        error: error.message,
      });
    }
  }
);

// ===============================================
// MAINTENANCE REQUESTS
// ===============================================

/**
 * POST /api/staff/maintenance/request
 * Create maintenance request
 */
router.post(
  "/maintenance/request",
  [
    body("room_id").isInt({ min: 1 }).withMessage("Invalid room ID"),
    body("issue_type")
      .isIn([
        "plumbing",
        "electrical",
        "cleaning",
        "furniture",
        "appliance",
        "other",
      ])
      .withMessage("Invalid issue type"),
    body("priority")
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Invalid priority"),
    body("description")
      .notEmpty()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be between 10 and 1000 characters"),
  ],
  requirePermission("maintenance_request"),
  async (req, res) => {
    try {
      const { room_id, issue_type, priority, description, estimated_time } =
        req.body;
      const employee_id = req.employee?.employee_id;
      const { pool } = require("../config/database");

      const [result] = await pool.execute(
        `INSERT INTO maintenance_requests 
         (room_id, reported_by, issue_type, priority, description, estimated_time, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          room_id,
          employee_id,
          issue_type,
          priority,
          description,
          estimated_time || null,
        ]
      );

      res.json({
        success: true,
        message: "Maintenance request created successfully",
        data: { request_id: result.insertId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create maintenance request",
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/staff/maintenance/requests
 * Get maintenance requests
 */
router.get(
  "/maintenance/requests",
  requirePermission("maintenance_request"),
  async (req, res) => {
    try {
      const { status = null, room_id = null } = req.query;
      const { pool } = require("../config/database");

      let whereConditions = [];
      let queryParams = [];

      if (status) {
        whereConditions.push("mr.status = ?");
        queryParams.push(status);
      }

      if (room_id) {
        whereConditions.push("mr.room_id = ?");
        queryParams.push(room_id);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const [rows] = await pool.execute(
        `SELECT 
          mr.*,
          r.room_number,
          reporter.full_name as reported_by_name,
          assignee.full_name as assigned_to_name
         FROM maintenance_requests mr
         JOIN rooms r ON mr.room_id = r.room_id
         LEFT JOIN employees re ON mr.reported_by = re.employee_id
         LEFT JOIN customers reporter ON re.customer_id = reporter.customer_id
         LEFT JOIN employees ae ON mr.assigned_to = ae.employee_id
         LEFT JOIN customers assignee ON ae.customer_id = assignee.customer_id
         ${whereClause}
         ORDER BY mr.created_at DESC`,
        queryParams
      );

      res.json({
        success: true,
        message: "Maintenance requests retrieved successfully",
        data: { requests: rows },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get maintenance requests",
        error: error.message,
      });
    }
  }
);

module.exports = router;
