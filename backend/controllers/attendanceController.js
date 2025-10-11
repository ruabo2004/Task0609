// Attendance Controller
// Enhanced implementation for Employee Module

const { AttendanceLog, StaffProfile, WorkShift, User } = require("../models");
const { logger } = require("../utils/logger");
const responseHelper = require("../utils/responseHelper");

class AttendanceController {
  // @desc    Staff check-in
  // @route   POST /api/staff/attendance/check-in
  // @access  Staff
  static async checkIn(req, res) {
    try {
      const staffId = req.user.id;
      const { shift_id } = req.body;

      logger.info("Staff checking in", {
        staffId,
        shiftId: shift_id,
        user: req.user?.id,
      });

      // Check staff profile status
      const staffProfile = await StaffProfile.findByUserId(staffId);
      if (!staffProfile || staffProfile.status !== "active") {
        return responseHelper.badRequest(res, "Staff member is not active");
      }

      // Validate shift if provided
      if (shift_id) {
        const shift = await WorkShift.findById(shift_id);
        if (!shift) {
          return responseHelper.notFound(res, "Work shift not found");
        }

        if (shift.staff_id !== staffId) {
          return responseHelper.forbidden(res, "Shift is not assigned to you");
        }

        // Check if shift is for today
        const today = new Date().toISOString().split("T")[0];
        if (shift.shift_date !== today) {
          return responseHelper.badRequest(res, "Shift is not for today");
        }
      }

      const attendanceLog = await AttendanceLog.checkIn(staffId, shift_id);

      logger.info("Staff checked in successfully", {
        staffId,
        attendanceId: attendanceLog.id,
        status: attendanceLog.status,
      });

      return responseHelper.success(
        res,
        attendanceLog,
        "Checked in successfully",
        201
      );
    } catch (error) {
      if (error.message.includes("already checked in")) {
        return responseHelper.conflict(res, error.message);
      }

      logger.error("Error during check-in", error, {
        staffId: req.user.id,
        shiftId: req.body.shift_id,
      });
      return responseHelper.error(res, "Failed to check in");
    }
  }

  // @desc    Staff check-out
  // @route   POST /api/staff/attendance/check-out
  // @access  Staff
  static async checkOut(req, res) {
    try {
      const staffId = req.user.id;

      logger.info("Staff checking out", {
        staffId,
        user: req.user?.id,
      });

      const attendanceLog = await AttendanceLog.checkOut(staffId);

      logger.info("Staff checked out successfully", {
        staffId,
        attendanceId: attendanceLog.id,
        workHours: attendanceLog.work_hours,
      });

      return responseHelper.success(
        res,
        attendanceLog,
        "Checked out successfully"
      );
    } catch (error) {
      if (
        error.message.includes("No check-in record") ||
        error.message.includes("already checked out")
      ) {
        return responseHelper.badRequest(res, error.message);
      }

      logger.error("Error during check-out", error, {
        staffId: req.user.id,
      });
      return responseHelper.error(res, "Failed to check out");
    }
  }

  // @desc    Get all attendance logs with filters
  // @route   GET /api/staff/attendance
  // @access  Admin/Manager
  static async getAllAttendance(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        staff_id: req.query.staff_id,
        department: req.query.department,
        status: req.query.status,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
      };

      logger.info("Getting all attendance logs", {
        filters,
        user: req.user?.id,
      });

      const result = await AttendanceLog.getAll(filters);

      return responseHelper.success(
        res,
        result,
        "Attendance logs retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting attendance logs", error, {
        query: req.query,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve attendance logs");
    }
  }

  // @desc    Get attendance log by ID
  // @route   GET /api/staff/attendance/:id
  // @access  Admin/Manager/Staff(own)
  static async getAttendanceById(req, res) {
    try {
      const attendanceId = req.params.id;

      logger.info("Getting attendance log by ID", {
        attendanceId,
        user: req.user?.id,
      });

      const attendance = await AttendanceLog.findById(attendanceId);
      if (!attendance) {
        return responseHelper.notFound(res, "Attendance log not found");
      }

      // Check permissions - staff can only view their own attendance
      if (req.user.role === "staff" && attendance.staff_id !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      return responseHelper.success(
        res,
        attendance,
        "Attendance log retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting attendance log", error, {
        attendanceId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve attendance log");
    }
  }

  // @desc    Get attendance by staff ID
  // @route   GET /api/staff/attendance/staff/:staffId
  // @access  Admin/Manager/Staff(own)
  static async getAttendanceByStaffId(req, res) {
    try {
      const staffId = req.params.staffId;
      const dateRange = {
        from: req.query.date_from,
        to: req.query.date_to,
      };

      logger.info("Getting attendance by staff ID", {
        staffId,
        dateRange,
        user: req.user?.id,
      });

      // Check permissions
      if (req.user.role === "staff" && parseInt(staffId) !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      const attendance = await AttendanceLog.findByStaffId(staffId, dateRange);

      return responseHelper.success(
        res,
        attendance,
        "Attendance logs retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting attendance by staff ID", error, {
        staffId: req.params.staffId,
        dateRange: { from: req.query.date_from, to: req.query.date_to },
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve attendance logs");
    }
  }

  // @desc    Get attendance by date
  // @route   GET /api/staff/attendance/date/:date
  // @access  Admin/Manager
  static async getAttendanceByDate(req, res) {
    try {
      const date = req.params.date;

      logger.info("Getting attendance by date", {
        date,
        user: req.user?.id,
      });

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return responseHelper.badRequest(
          res,
          "Invalid date format. Use YYYY-MM-DD"
        );
      }

      const attendance = await AttendanceLog.findByDate(date);

      return responseHelper.success(
        res,
        attendance,
        `Attendance for ${date} retrieved successfully`
      );
    } catch (error) {
      logger.error("Error getting attendance by date", error, {
        date: req.params.date,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve attendance");
    }
  }

  // @desc    Get current user's attendance
  // @route   GET /api/staff/attendance/my-attendance
  // @access  Staff
  static async getMyAttendance(req, res) {
    try {
      const dateRange = {
        from: req.query.date_from,
        to: req.query.date_to,
      };

      logger.info("Getting current user's attendance", {
        userId: req.user.id,
        dateRange,
      });

      const attendance = await AttendanceLog.findByStaffId(
        req.user.id,
        dateRange
      );

      return responseHelper.success(
        res,
        attendance,
        "Your attendance retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting current user's attendance", error, {
        userId: req.user.id,
        dateRange: { from: req.query.date_from, to: req.query.date_to },
      });
      return responseHelper.error(res, "Failed to retrieve your attendance");
    }
  }

  // @desc    Get today's attendance status
  // @route   GET /api/staff/attendance/today
  // @access  Staff
  static async getTodayAttendance(req, res) {
    try {
      const staffId = req.user.id;

      logger.info("Getting today's attendance status", {
        staffId,
        user: req.user?.id,
      });

      const todayLog = await AttendanceLog.findTodayLog(staffId);

      if (!todayLog) {
        return responseHelper.success(
          res,
          {
            checked_in: false,
            checked_out: false,
            message: "Not checked in yet today",
          },
          "Today's attendance status retrieved"
        );
      }

      const response = {
        checked_in: true,
        checked_out: !!todayLog.check_out_time,
        attendance_log: todayLog,
        message: todayLog.check_out_time
          ? "Checked out for today"
          : "Checked in, not checked out yet",
      };

      return responseHelper.success(
        res,
        response,
        "Today's attendance status retrieved"
      );
    } catch (error) {
      logger.error("Error getting today's attendance status", error, {
        staffId: req.user.id,
      });
      return responseHelper.error(
        res,
        "Failed to get today's attendance status"
      );
    }
  }

  // @desc    Get monthly attendance for staff
  // @route   GET /api/staff/attendance/monthly/:staffId
  // @access  Admin/Manager/Staff(own)
  static async getMonthlyAttendance(req, res) {
    try {
      const staffId = req.params.staffId;
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();

      logger.info("Getting monthly attendance", {
        staffId,
        month,
        year,
        user: req.user?.id,
      });

      // Check permissions
      if (req.user.role === "staff" && parseInt(staffId) !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      // Validate month and year
      if (month < 1 || month > 12) {
        return responseHelper.badRequest(
          res,
          "Invalid month. Must be between 1 and 12"
        );
      }

      if (year < 2020 || year > new Date().getFullYear() + 1) {
        return responseHelper.badRequest(res, "Invalid year");
      }

      const attendance = await AttendanceLog.getMonthlyAttendance(
        staffId,
        month,
        year
      );

      // Calculate summary
      const summary = {
        total_days: attendance.length,
        total_work_hours: attendance.reduce(
          (sum, log) => sum + (parseFloat(log.work_hours) || 0),
          0
        ),
        on_time_days: attendance.filter((log) => log.status === "on_time")
          .length,
        late_days: attendance.filter((log) => log.status === "late").length,
        early_leave_days: attendance.filter(
          (log) => log.status === "early_leave"
        ).length,
        absent_days: attendance.filter((log) => log.status === "absent").length,
      };

      return responseHelper.success(
        res,
        {
          month,
          year,
          attendance,
          summary,
        },
        `Monthly attendance for ${month}/${year} retrieved successfully`
      );
    } catch (error) {
      logger.error("Error getting monthly attendance", error, {
        staffId: req.params.staffId,
        month: req.query.month,
        year: req.query.year,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve monthly attendance");
    }
  }

  // @desc    Get attendance report
  // @route   GET /api/staff/attendance/report
  // @access  Admin/Manager
  static async getAttendanceReport(req, res) {
    try {
      const { date_from, date_to, department } = req.query;

      logger.info("Getting attendance report", {
        dateFrom: date_from,
        dateTo: date_to,
        department,
        user: req.user?.id,
      });

      if (!date_from || !date_to) {
        return responseHelper.badRequest(
          res,
          "date_from and date_to are required"
        );
      }

      // Validate date formats
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date_from) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date_to)
      ) {
        return responseHelper.badRequest(
          res,
          "Invalid date format. Use YYYY-MM-DD"
        );
      }

      const dateRange = { from: date_from, to: date_to, department };
      const attendance = await AttendanceLog.getAttendanceReport(dateRange);

      // Calculate report summary
      const summary = {
        total_records: attendance.length,
        total_work_hours: attendance.reduce(
          (sum, log) => sum + (parseFloat(log.work_hours) || 0),
          0
        ),
        on_time_count: attendance.filter((log) => log.status === "on_time")
          .length,
        late_count: attendance.filter((log) => log.status === "late").length,
        early_leave_count: attendance.filter(
          (log) => log.status === "early_leave"
        ).length,
        absent_count: attendance.filter((log) => log.status === "absent")
          .length,
      };

      // Group by staff
      const byStaff = attendance.reduce((acc, log) => {
        const key = log.staff_id;
        if (!acc[key]) {
          acc[key] = {
            staff_id: log.staff_id,
            staff_name: log.staff_name,
            department: log.department,
            records: [],
            total_hours: 0,
            total_days: 0,
          };
        }
        acc[key].records.push(log);
        acc[key].total_hours += parseFloat(log.work_hours) || 0;
        acc[key].total_days += 1;
        return acc;
      }, {});

      return responseHelper.success(
        res,
        {
          date_range: { from: date_from, to: date_to },
          department: department || "all",
          summary,
          by_staff: Object.values(byStaff),
          detailed_records: attendance,
        },
        "Attendance report generated successfully"
      );
    } catch (error) {
      logger.error("Error getting attendance report", error, {
        query: req.query,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to generate attendance report");
    }
  }

  // @desc    Update attendance log
  // @route   PUT /api/staff/attendance/:id
  // @access  Admin/Manager
  static async updateAttendance(req, res) {
    try {
      const attendanceId = req.params.id;
      const { status, notes } = req.body;

      logger.info("Updating attendance log", {
        attendanceId,
        status,
        notes,
        user: req.user?.id,
      });

      const attendance = await AttendanceLog.findById(attendanceId);
      if (!attendance) {
        return responseHelper.notFound(res, "Attendance log not found");
      }

      const updateData = {};
      if (status !== undefined) {
        const validStatuses = ["on_time", "late", "early_leave", "absent"];
        if (!validStatuses.includes(status)) {
          return responseHelper.badRequest(
            res,
            "Invalid status. Must be: on_time, late, early_leave, or absent"
          );
        }
        updateData.status = status;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const updatedAttendance = await attendance.update(updateData);

      logger.info("Attendance log updated successfully", {
        attendanceId,
        staffId: updatedAttendance.staff_id,
      });

      return responseHelper.success(
        res,
        updatedAttendance,
        "Attendance log updated successfully"
      );
    } catch (error) {
      logger.error("Error updating attendance log", error, {
        attendanceId: req.params.id,
        body: req.body,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to update attendance log");
    }
  }

  // @desc    Calculate work hours for date
  // @route   GET /api/staff/attendance/work-hours/:staffId/:date
  // @access  Admin/Manager/Staff(own)
  static async calculateWorkHours(req, res) {
    try {
      const staffId = req.params.staffId;
      const date = req.params.date;

      logger.info("Calculating work hours", {
        staffId,
        date,
        user: req.user?.id,
      });

      // Check permissions
      if (req.user.role === "staff" && parseInt(staffId) !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return responseHelper.badRequest(
          res,
          "Invalid date format. Use YYYY-MM-DD"
        );
      }

      const workHours = await AttendanceLog.calculateWorkHours(staffId, date);

      return responseHelper.success(
        res,
        {
          staff_id: parseInt(staffId),
          date,
          work_hours: workHours,
          formatted_hours:
            workHours > 0
              ? `${Math.floor(workHours)}h ${Math.round((workHours % 1) * 60)}m`
              : "0h 0m",
        },
        "Work hours calculated successfully"
      );
    } catch (error) {
      logger.error("Error calculating work hours", error, {
        staffId: req.params.staffId,
        date: req.params.date,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to calculate work hours");
    }
  }
}

module.exports = {
  checkIn: AttendanceController.checkIn,
  checkOut: AttendanceController.checkOut,
  getAllAttendance: AttendanceController.getAllAttendance,
  getAttendanceById: AttendanceController.getAttendanceById,
  getAttendanceByStaffId: AttendanceController.getAttendanceByStaffId,
  getAttendanceByDate: AttendanceController.getAttendanceByDate,
  getMyAttendance: AttendanceController.getMyAttendance,
  getTodayAttendance: AttendanceController.getTodayAttendance,
  getMonthlyAttendance: AttendanceController.getMonthlyAttendance,
  getAttendanceReport: AttendanceController.getAttendanceReport,
  updateAttendance: AttendanceController.updateAttendance,
  calculateWorkHours: AttendanceController.calculateWorkHours,
};
