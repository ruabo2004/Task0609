// Work Shift Controller
// Enhanced implementation for Employee Module

const { WorkShift, StaffProfile, User } = require("../models");
const { logger } = require("../utils/logger");
const responseHelper = require("../utils/responseHelper");
const { validateWorkShift } = require("../utils/validation");

class WorkShiftController {
  // @desc    Create new work shift
  // @route   POST /api/staff/shifts
  // @access  Admin/Manager
  static async createShift(req, res) {
    try {
      logger.info("Creating work shift", {
        body: req.body,
        user: req.user?.id,
      });

      // Validate input
      const validation = validateWorkShift(req.body);
      if (!validation.isValid) {
        return responseHelper.validationError(res, validation.errors);
      }

      // Check if staff member exists
      const staff = await User.findById(req.body.staff_id);
      if (!staff || staff.role !== "staff") {
        return responseHelper.notFound(res, "Staff member not found");
      }

      // Check staff profile status
      const staffProfile = await StaffProfile.findByUserId(req.body.staff_id);
      if (!staffProfile || staffProfile.status !== "active") {
        return responseHelper.badRequest(res, "Staff member is not active");
      }

      const shift = await WorkShift.create(req.body);

      logger.info("Work shift created successfully", {
        shiftId: shift.id,
        staffId: shift.staff_id,
        date: shift.shift_date,
      });

      return responseHelper.success(
        res,
        shift,
        "Work shift created successfully",
        201
      );
    } catch (error) {
      if (error.message.includes("conflicts")) {
        logger.warn("Shift conflict detected", {
          body: req.body,
          error: error.message,
        });
        return responseHelper.conflict(res, error.message);
      }

      logger.error("Error creating work shift", error, {
        body: req.body,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to create work shift", 500);
    }
  }

  // @desc    Get all work shifts with filters
  // @route   GET /api/staff/shifts
  // @access  Admin/Manager
  static async getAllShifts(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        department: req.query.department,
        status: req.query.status,
        staff_id: req.query.staff_id,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
      };

      logger.info("Getting all work shifts", { filters, user: req.user?.id });

      const result = await WorkShift.getAll(filters);

      return responseHelper.success(
        res,
        result,
        "Work shifts retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting work shifts", error, {
        query: req.query,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve work shifts");
    }
  }

  // @desc    Get work shift by ID
  // @route   GET /api/staff/shifts/:id
  // @access  Admin/Manager/Staff(own)
  static async getShiftById(req, res) {
    try {
      const shiftId = req.params.id;

      logger.info("Getting work shift by ID", {
        shiftId,
        user: req.user?.id,
      });

      const shift = await WorkShift.findById(shiftId);
      if (!shift) {
        return responseHelper.notFound(res, "Work shift not found");
      }

      // Check permissions - staff can only view their own shifts
      if (req.user.role === "staff" && shift.staff_id !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      return responseHelper.success(
        res,
        shift,
        "Work shift retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting work shift", error, {
        shiftId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve work shift");
    }
  }

  // @desc    Get work shifts by staff ID
  // @route   GET /api/staff/shifts/staff/:staffId
  // @access  Admin/Manager/Staff(own)
  static async getShiftsByStaffId(req, res) {
    try {
      const staffId = req.params.staffId;
      const dateRange = {
        from: req.query.date_from,
        to: req.query.date_to,
      };

      logger.info("Getting work shifts by staff ID", {
        staffId,
        dateRange,
        user: req.user?.id,
      });

      // Check permissions
      if (req.user.role === "staff" && parseInt(staffId) !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      const shifts = await WorkShift.findByStaffId(staffId, dateRange);

      return responseHelper.success(
        res,
        shifts,
        "Work shifts retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting work shifts by staff ID", error, {
        staffId: req.params.staffId,
        dateRange: { from: req.query.date_from, to: req.query.date_to },
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve work shifts");
    }
  }

  // @desc    Get work shifts by date
  // @route   GET /api/staff/shifts/date/:date
  // @access  Admin/Manager
  static async getShiftsByDate(req, res) {
    try {
      const date = req.params.date;

      logger.info("Getting work shifts by date", {
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

      const shifts = await WorkShift.findByDate(date);

      return responseHelper.success(
        res,
        shifts,
        `Work shifts for ${date} retrieved successfully`
      );
    } catch (error) {
      logger.error("Error getting work shifts by date", error, {
        date: req.params.date,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve work shifts");
    }
  }

  // @desc    Get weekly schedule
  // @route   GET /api/staff/shifts/weekly/:startDate
  // @access  Admin/Manager
  static async getWeeklySchedule(req, res) {
    try {
      const startDate = req.params.startDate;

      logger.info("Getting weekly schedule", {
        startDate,
        user: req.user?.id,
      });

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        return responseHelper.badRequest(
          res,
          "Invalid date format. Use YYYY-MM-DD"
        );
      }

      const shifts = await WorkShift.getWeeklySchedule(startDate);

      return responseHelper.success(
        res,
        shifts,
        `Weekly schedule starting ${startDate} retrieved successfully`
      );
    } catch (error) {
      logger.error("Error getting weekly schedule", error, {
        startDate: req.params.startDate,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve weekly schedule");
    }
  }

  // @desc    Get current user's shifts
  // @route   GET /api/staff/shifts/my-shifts
  // @access  Staff
  static async getMyShifts(req, res) {
    try {
      const dateRange = {
        from: req.query.date_from,
        to: req.query.date_to,
      };

      logger.info("Getting current user's shifts", {
        userId: req.user.id,
        dateRange,
      });

      const shifts = await WorkShift.findByStaffId(req.user.id, dateRange);

      return responseHelper.success(
        res,
        shifts,
        "Your shifts retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting current user's shifts", error, {
        userId: req.user.id,
        dateRange: { from: req.query.date_from, to: req.query.date_to },
      });
      return responseHelper.error(res, "Failed to retrieve your shifts", 500);
    }
  }

  // @desc    Update work shift
  // @route   PUT /api/staff/shifts/:id
  // @access  Admin/Manager
  static async updateShift(req, res) {
    try {
      const shiftId = req.params.id;

      logger.info("Updating work shift", {
        shiftId,
        body: req.body,
        user: req.user?.id,
      });

      const shift = await WorkShift.findById(shiftId);
      if (!shift) {
        return responseHelper.notFound(res, "Work shift not found");
      }

      // Validate update data
      const validation = validateWorkShift(req.body, false); // false = update mode
      if (!validation.isValid) {
        return responseHelper.validationError(res, validation.errors);
      }

      const updatedShift = await shift.update(req.body);

      logger.info("Work shift updated successfully", {
        shiftId,
        staffId: updatedShift.staff_id,
      });

      return responseHelper.success(
        res,
        updatedShift,
        "Work shift updated successfully"
      );
    } catch (error) {
      if (error.message.includes("conflicts")) {
        logger.warn("Shift update conflict detected", {
          shiftId: req.params.id,
          body: req.body,
          error: error.message,
        });
        return responseHelper.conflict(res, error.message);
      }

      logger.error("Error updating work shift", error, {
        shiftId: req.params.id,
        body: req.body,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to update work shift");
    }
  }

  // @desc    Assign shift to staff member
  // @route   POST /api/staff/shifts/assign
  // @access  Admin/Manager
  static async assignShift(req, res) {
    try {
      const { staff_id, ...shiftData } = req.body;

      logger.info("Assigning shift to staff member", {
        staffId: staff_id,
        shiftData,
        user: req.user?.id,
      });

      // Check if staff member exists and is active
      const staff = await User.findById(staff_id);
      if (!staff || staff.role !== "staff") {
        return responseHelper.notFound(res, "Staff member not found");
      }

      const staffProfile = await StaffProfile.findByUserId(staff_id);
      if (!staffProfile || staffProfile.status !== "active") {
        return responseHelper.badRequest(res, "Staff member is not active");
      }

      const shift = await WorkShift.assignShift(staff_id, shiftData);

      logger.info("Shift assigned successfully", {
        shiftId: shift.id,
        staffId: staff_id,
      });

      return responseHelper.success(
        res,
        shift,
        "Shift assigned successfully",
        201
      );
    } catch (error) {
      if (error.message.includes("conflicts")) {
        logger.warn("Shift assignment conflict detected", {
          body: req.body,
          error: error.message,
        });
        return responseHelper.conflict(res, error.message);
      }

      logger.error("Error assigning shift", error, {
        body: req.body,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to assign shift");
    }
  }

  // @desc    Mark shift as completed
  // @route   PATCH /api/staff/shifts/:id/complete
  // @access  Admin/Manager/Staff(own)
  static async markCompleted(req, res) {
    try {
      const shiftId = req.params.id;

      logger.info("Marking shift as completed", {
        shiftId,
        user: req.user?.id,
      });

      const shift = await WorkShift.findById(shiftId);
      if (!shift) {
        return responseHelper.notFound(res, "Work shift not found");
      }

      // Check permissions - staff can only complete their own shifts
      if (req.user.role === "staff" && shift.staff_id !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      if (shift.status === "completed") {
        return responseHelper.badRequest(res, "Shift is already completed");
      }

      const updatedShift = await shift.markCompleted();

      logger.info("Shift marked as completed successfully", {
        shiftId,
        staffId: updatedShift.staff_id,
      });

      return responseHelper.success(
        res,
        updatedShift,
        "Shift marked as completed"
      );
    } catch (error) {
      logger.error("Error marking shift as completed", error, {
        shiftId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to mark shift as completed");
    }
  }

  // @desc    Mark shift as missed
  // @route   PATCH /api/staff/shifts/:id/missed
  // @access  Admin/Manager
  static async markMissed(req, res) {
    try {
      const shiftId = req.params.id;

      logger.info("Marking shift as missed", {
        shiftId,
        user: req.user?.id,
      });

      const shift = await WorkShift.findById(shiftId);
      if (!shift) {
        return responseHelper.notFound(res, "Work shift not found");
      }

      if (shift.status === "completed") {
        return responseHelper.badRequest(
          res,
          "Cannot mark completed shift as missed"
        );
      }

      const updatedShift = await shift.markMissed();

      logger.info("Shift marked as missed successfully", {
        shiftId,
        staffId: updatedShift.staff_id,
      });

      return responseHelper.success(
        res,
        updatedShift,
        "Shift marked as missed"
      );
    } catch (error) {
      logger.error("Error marking shift as missed", error, {
        shiftId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to mark shift as missed");
    }
  }

  // @desc    Delete work shift
  // @route   DELETE /api/staff/shifts/:id
  // @access  Admin/Manager
  static async deleteShift(req, res) {
    try {
      const shiftId = req.params.id;

      logger.info("Deleting work shift", {
        shiftId,
        user: req.user?.id,
      });

      const shift = await WorkShift.findById(shiftId);
      if (!shift) {
        return responseHelper.notFound(res, "Work shift not found");
      }

      await shift.delete();

      logger.info("Work shift deleted successfully", {
        shiftId,
        staffId: shift.staff_id,
      });

      return responseHelper.success(
        res,
        null,
        "Work shift deleted successfully"
      );
    } catch (error) {
      if (error.message.includes("Cannot delete completed")) {
        return responseHelper.badRequest(res, error.message);
      }

      logger.error("Error deleting work shift", error, {
        shiftId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to delete work shift");
    }
  }

  // @desc    Check shift conflicts
  // @route   POST /api/staff/shifts/check-conflicts
  // @access  Admin/Manager
  static async checkConflicts(req, res) {
    try {
      const { staff_id, shift_date, start_time, end_time, exclude_shift_id } =
        req.body;

      logger.info("Checking shift conflicts", {
        staffId: staff_id,
        date: shift_date,
        startTime: start_time,
        endTime: end_time,
        user: req.user?.id,
      });

      if (!staff_id || !shift_date || !start_time || !end_time) {
        return responseHelper.badRequest(
          res,
          "Missing required fields: staff_id, shift_date, start_time, end_time"
        );
      }

      const conflicts = await WorkShift.getShiftConflicts(
        staff_id,
        shift_date,
        start_time,
        end_time,
        exclude_shift_id
      );

      const hasConflicts = conflicts.length > 0;

      return responseHelper.success(
        res,
        {
          has_conflicts: hasConflicts,
          conflicts: conflicts,
          message: hasConflicts
            ? "Shift conflicts detected"
            : "No conflicts found",
        },
        "Conflict check completed"
      );
    } catch (error) {
      logger.error("Error checking shift conflicts", error, {
        body: req.body,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to check shift conflicts");
    }
  }
}

module.exports = {
  createShift: WorkShiftController.createShift,
  getAllShifts: WorkShiftController.getAllShifts,
  getShiftById: WorkShiftController.getShiftById,
  getShiftsByStaffId: WorkShiftController.getShiftsByStaffId,
  getShiftsByDate: WorkShiftController.getShiftsByDate,
  getWeeklySchedule: WorkShiftController.getWeeklySchedule,
  getMyShifts: WorkShiftController.getMyShifts,
  updateShift: WorkShiftController.updateShift,
  assignShift: WorkShiftController.assignShift,
  markCompleted: WorkShiftController.markCompleted,
  markMissed: WorkShiftController.markMissed,
  deleteShift: WorkShiftController.deleteShift,
  checkConflicts: WorkShiftController.checkConflicts,
};
