const Employee = require("../models/Employee");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { validationResult } = require("express-validator");
const { pool } = require("../config/database");

/**
 * Get staff dashboard overview
 */
const getDashboard = async (req, res) => {
  try {
    const employeeId = req.employee?.employee_id;
    const today = new Date().toISOString().split("T")[0];

    // Get today's stats
    const [todayStats] = await pool.execute(
      `SELECT 
        COUNT(CASE WHEN DATE(check_in_time) = ? THEN 1 END) as checkins_today,
        COUNT(CASE WHEN DATE(check_out_time) = ? THEN 1 END) as checkouts_today,
        COUNT(CASE WHEN booking_status = 'confirmed' AND check_in_date = ? THEN 1 END) as expected_checkins,
        COUNT(CASE WHEN booking_status = 'confirmed' AND check_out_date = ? THEN 1 END) as expected_checkouts
       FROM bookings`,
      [today, today, today, today]
    );

    // Get pending tasks
    const [pendingTasks] = await pool.execute(
      `SELECT COUNT(*) as pending_bookings
       FROM bookings 
       WHERE booking_status = 'pending'`
    );

    // Get room status summary
    const [roomStatus] = await pool.execute(
      `SELECT 
        status,
        COUNT(*) as count
       FROM rooms 
       GROUP BY status`
    );

    // Get my recent activities (if employee)
    let recentActivities = [];
    if (employeeId) {
      const [activities] = await pool.execute(
        `SELECT 
          'checkin' as activity_type,
          b.booking_code,
          c.full_name as customer_name,
          b.check_in_time as activity_time,
          r.room_number
         FROM bookings b
         JOIN customers c ON b.customer_id = c.customer_id
         JOIN rooms r ON b.room_id = r.room_id
         WHERE b.checked_in_by = ?
         UNION ALL
         SELECT 
          'checkout' as activity_type,
          b.booking_code,
          c.full_name as customer_name,
          b.check_out_time as activity_time,
          r.room_number
         FROM bookings b
         JOIN customers c ON b.customer_id = c.customer_id
         JOIN rooms r ON b.room_id = r.room_id
         WHERE b.checked_out_by = ?
         ORDER BY activity_time DESC
         LIMIT 10`,
        [employeeId, employeeId]
      );
      recentActivities = activities;
    }

    res.json({
      success: true,
      message: "Staff dashboard data retrieved successfully",
      data: {
        today_stats: todayStats[0],
        pending_tasks: pendingTasks[0],
        room_status: roomStatus,
        recent_activities: recentActivities,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get staff dashboard",
      error: error.message,
    });
  }
};

/**
 * Get all bookings for staff management
 */
const getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = null,
      check_in_date = null,
      check_out_date = null,
      search = null,
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push("b.booking_status = ?");
      queryParams.push(status);
    }

    if (check_in_date) {
      whereConditions.push("DATE(b.check_in_date) = ?");
      queryParams.push(check_in_date);
    }

    if (check_out_date) {
      whereConditions.push("DATE(b.check_out_date) = ?");
      queryParams.push(check_out_date);
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
};

/**
 * Update booking status (approve/reject)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { bookingId } = req.params;
    const { status, staff_notes } = req.body;
    const employeeId = req.employee?.employee_id;

    // Validate status
    const validStatuses = ["confirmed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: confirmed, cancelled",
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking can be updated
    if (booking.booking_status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be updated",
      });
    }

    // Update booking
    await pool.execute(
      `UPDATE bookings 
       SET booking_status = ?, staff_notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = ?`,
      [status, staff_notes || null, bookingId]
    );

    // Log activity
    if (employeeId) {
      await pool.execute(
        `INSERT INTO booking_activities (booking_id, employee_id, activity_type, notes)
         VALUES (?, ?, ?, ?)`,
        [
          bookingId,
          employeeId,
          `status_change_${status}`,
          staff_notes || `Status changed to ${status}`,
        ]
      );
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: {
        booking_id: bookingId,
        new_status: status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};

/**
 * Check-in customer
 */
const checkInCustomer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { notes } = req.body;
    const employeeId = req.employee?.employee_id;

    // Check if booking exists and is confirmed
    const [bookingRows] = await pool.execute(
      `SELECT * FROM bookings WHERE booking_id = ? AND booking_status = 'confirmed'`,
      [bookingId]
    );

    if (bookingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not confirmed",
      });
    }

    const booking = bookingRows[0];

    // Check if already checked in
    if (booking.check_in_time) {
      return res.status(400).json({
        success: false,
        message: "Customer already checked in",
      });
    }

    // Check if check-in date is today or in the past
    const today = new Date();
    const checkInDate = new Date(booking.check_in_date);
    if (checkInDate > today) {
      return res.status(400).json({
        success: false,
        message: "Check-in date has not arrived yet",
      });
    }

    // Update booking with check-in info
    await pool.execute(
      `UPDATE bookings 
       SET check_in_time = CURRENT_TIMESTAMP, 
           checked_in_by = ?,
           staff_notes = CONCAT(COALESCE(staff_notes, ''), ?, '\n[Check-in: ', NOW(), '] - ', COALESCE(?, 'Customer checked in'), '\n')
       WHERE booking_id = ?`,
      [employeeId, "\n", notes || "Customer checked in", bookingId]
    );

    // Update room status to occupied
    await pool.execute(
      `UPDATE rooms SET status = 'occupied' WHERE room_id = ?`,
      [booking.room_id]
    );

    res.json({
      success: true,
      message: "Customer checked in successfully",
      data: {
        booking_id: bookingId,
        check_in_time: new Date().toISOString(),
        checked_in_by: employeeId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check in customer",
      error: error.message,
    });
  }
};

/**
 * Check-out customer
 */
const checkOutCustomer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { notes, additional_charges = 0 } = req.body;
    const employeeId = req.employee?.employee_id;

    // Check if booking exists and is checked in
    const [bookingRows] = await pool.execute(
      `SELECT * FROM bookings WHERE booking_id = ? AND check_in_time IS NOT NULL`,
      [bookingId]
    );

    if (bookingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or customer not checked in",
      });
    }

    const booking = bookingRows[0];

    // Check if already checked out
    if (booking.check_out_time) {
      return res.status(400).json({
        success: false,
        message: "Customer already checked out",
      });
    }

    // Update booking with check-out info
    await pool.execute(
      `UPDATE bookings 
       SET check_out_time = CURRENT_TIMESTAMP, 
           checked_out_by = ?,
           total_amount = total_amount + ?,
           staff_notes = CONCAT(COALESCE(staff_notes, ''), '\n[Check-out: ', NOW(), '] - ', COALESCE(?, 'Customer checked out'), '\n')
       WHERE booking_id = ?`,
      [
        employeeId,
        additional_charges,
        notes || "Customer checked out",
        bookingId,
      ]
    );

    // Update room status to available and cleaning needed
    await pool.execute(
      `UPDATE rooms SET status = 'available', cleaning_status = 'dirty' WHERE room_id = ?`,
      [booking.room_id]
    );

    res.json({
      success: true,
      message: "Customer checked out successfully",
      data: {
        booking_id: bookingId,
        check_out_time: new Date().toISOString(),
        checked_out_by: employeeId,
        additional_charges: additional_charges,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check out customer",
      error: error.message,
    });
  }
};

/**
 * Get daily reports
 */
const getDailyReports = async (req, res) => {
  try {
    const employeeId = req.employee?.employee_id;
    const { date = new Date().toISOString().split("T")[0] } = req.query;

    // Get or create daily report
    let [reportRows] = await pool.execute(
      `SELECT * FROM daily_reports WHERE employee_id = ? AND report_date = ?`,
      [employeeId, date]
    );

    let report;
    if (reportRows.length === 0) {
      // Create new report
      const [result] = await pool.execute(
        `INSERT INTO daily_reports (employee_id, report_date, shift_type) VALUES (?, ?, 'morning')`,
        [employeeId, date]
      );

      report = {
        report_id: result.insertId,
        employee_id: employeeId,
        report_date: date,
        shift_type: "morning",
        check_ins_count: 0,
        check_outs_count: 0,
        room_issues: [],
        guest_feedback: [],
        maintenance_requests: [],
        revenue_summary: {},
        notes: "",
        status: "draft",
      };
    } else {
      report = reportRows[0];
      // Parse JSON fields
      if (report.room_issues)
        report.room_issues = JSON.parse(report.room_issues);
      if (report.guest_feedback)
        report.guest_feedback = JSON.parse(report.guest_feedback);
      if (report.maintenance_requests)
        report.maintenance_requests = JSON.parse(report.maintenance_requests);
      if (report.revenue_summary)
        report.revenue_summary = JSON.parse(report.revenue_summary);
    }

    res.json({
      success: true,
      message: "Daily report retrieved successfully",
      data: { report },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get daily report",
      error: error.message,
    });
  }
};

/**
 * Update daily report
 */
const updateDailyReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const {
      shift_type,
      check_ins_count,
      check_outs_count,
      room_issues,
      guest_feedback,
      maintenance_requests,
      revenue_summary,
      notes,
    } = req.body;

    const employeeId = req.employee?.employee_id;

    // Check if report exists and belongs to employee
    const [reportRows] = await pool.execute(
      `SELECT * FROM daily_reports WHERE report_id = ? AND employee_id = ?`,
      [reportId, employeeId]
    );

    if (reportRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Daily report not found",
      });
    }

    // Update report
    await pool.execute(
      `UPDATE daily_reports 
       SET shift_type = COALESCE(?, shift_type),
           check_ins_count = COALESCE(?, check_ins_count),
           check_outs_count = COALESCE(?, check_outs_count),
           room_issues = COALESCE(?, room_issues),
           guest_feedback = COALESCE(?, guest_feedback),
           maintenance_requests = COALESCE(?, maintenance_requests),
           revenue_summary = COALESCE(?, revenue_summary),
           notes = COALESCE(?, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE report_id = ?`,
      [
        shift_type,
        check_ins_count,
        check_outs_count,
        room_issues ? JSON.stringify(room_issues) : null,
        guest_feedback ? JSON.stringify(guest_feedback) : null,
        maintenance_requests ? JSON.stringify(maintenance_requests) : null,
        revenue_summary ? JSON.stringify(revenue_summary) : null,
        notes,
        reportId,
      ]
    );

    res.json({
      success: true,
      message: "Daily report updated successfully",
      data: { report_id: reportId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update daily report",
      error: error.message,
    });
  }
};

/**
 * Submit daily report for approval
 */
const submitDailyReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const employeeId = req.employee?.employee_id;

    // Check if report exists and belongs to employee
    const [reportRows] = await pool.execute(
      `SELECT * FROM daily_reports WHERE report_id = ? AND employee_id = ? AND status = 'draft'`,
      [reportId, employeeId]
    );

    if (reportRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Daily report not found or already submitted",
      });
    }

    // Submit report
    await pool.execute(
      `UPDATE daily_reports SET status = 'submitted', updated_at = CURRENT_TIMESTAMP WHERE report_id = ?`,
      [reportId]
    );

    res.json({
      success: true,
      message: "Daily report submitted for approval",
      data: { report_id: reportId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit daily report",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getAllBookings,
  updateBookingStatus,
  checkInCustomer,
  checkOutCustomer,
  getDailyReports,
  updateDailyReport,
  submitDailyReport,
};
