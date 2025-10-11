// Staff Task Controller
// Enhanced implementation for Employee Module

const { StaffTask, StaffProfile, User, Room, Booking } = require("../models");
const { logger } = require("../utils/logger");
const responseHelper = require("../utils/responseHelper");
const { validateStaffTask } = require("../utils/validation");

class StaffTaskController {
  // @desc    Create new staff task
  // @route   POST /api/staff/tasks
  // @access  Admin/Manager
  static async createTask(req, res) {
    try {
      logger.info("Creating staff task", {
        body: req.body,
        user: req.user?.id,
      });

      // Validate input
      const validation = validateStaffTask(req.body);
      if (!validation.isValid) {
        return responseHelper.validationError(res, validation.errors);
      }

      // Check if assigned staff member exists
      const staff = await User.findById(req.body.assigned_to);
      if (!staff || staff.role !== "staff") {
        return responseHelper.notFound(res, "Assigned staff member not found");
      }

      // Check staff profile status
      const staffProfile = await StaffProfile.findByUserId(
        req.body.assigned_to
      );
      if (!staffProfile || staffProfile.status !== "active") {
        return responseHelper.badRequest(
          res,
          "Assigned staff member is not active"
        );
      }

      // Validate room if provided
      if (req.body.room_id) {
        const room = await Room.findById(req.body.room_id);
        if (!room) {
          return responseHelper.notFound(res, "Room not found");
        }
      }

      // Validate booking if provided
      if (req.body.booking_id) {
        const booking = await Booking.findById(req.body.booking_id);
        if (!booking) {
          return responseHelper.notFound(res, "Booking not found");
        }
      }

      // Set assigned_by to current user
      req.body.assigned_by = req.user.id;

      const task = await StaffTask.create(req.body);

      logger.info("Staff task created successfully", {
        taskId: task.id,
        assignedTo: task.assigned_to,
        taskType: task.task_type,
      });

      return responseHelper.success(
        res,
        task,
        "Staff task created successfully",
        201
      );
    } catch (error) {
      logger.error("Error creating staff task", error, {
        body: req.body,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to create staff task", 500);
    }
  }

  // @desc    Get all staff tasks with filters
  // @route   GET /api/staff/tasks
  // @access  Admin/Manager
  static async getAllTasks(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status,
        priority: req.query.priority,
        task_type: req.query.task_type,
        department: req.query.department,
        assigned_to: req.query.assigned_to,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
      };

      logger.info("Getting all staff tasks", { filters, user: req.user?.id });

      const result = await StaffTask.getAll(filters);

      return responseHelper.success(
        res,
        result,
        "Staff tasks retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting staff tasks", error, {
        query: req.query,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve staff tasks");
    }
  }

  // @desc    Get staff task by ID
  // @route   GET /api/staff/tasks/:id
  // @access  Admin/Manager/Staff(assigned)
  static async getTaskById(req, res) {
    try {
      const taskId = req.params.id;

      logger.info("Getting staff task by ID", {
        taskId,
        user: req.user?.id,
      });

      const task = await StaffTask.findById(taskId);
      if (!task) {
        return responseHelper.notFound(res, "Staff task not found");
      }

      // Check permissions - staff can only view tasks assigned to them
      if (req.user.role === "staff" && task.assigned_to !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      return responseHelper.success(
        res,
        task,
        "Staff task retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting staff task", error, {
        taskId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve staff task");
    }
  }

  // @desc    Get tasks by staff ID
  // @route   GET /api/staff/tasks/staff/:staffId
  // @access  Admin/Manager/Staff(own)
  static async getTasksByStaffId(req, res) {
    try {
      const staffId = req.params.staffId;
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        task_type: req.query.task_type,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
      };

      logger.info("Getting tasks by staff ID", {
        staffId,
        filters,
        user: req.user?.id,
      });

      // Check permissions
      if (req.user.role === "staff" && parseInt(staffId) !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      const tasks = await StaffTask.findByStaffId(staffId, filters);

      return responseHelper.success(
        res,
        tasks,
        "Staff tasks retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting tasks by staff ID", error, {
        staffId: req.params.staffId,
        filters: req.query,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve staff tasks");
    }
  }

  // @desc    Get current user's tasks
  // @route   GET /api/staff/tasks/my-tasks
  // @access  Staff
  static async getMyTasks(req, res) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        task_type: req.query.task_type,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
      };

      logger.info("Getting current user's tasks", {
        userId: req.user.id,
        filters,
      });

      const tasks = await StaffTask.findByStaffId(req.user.id, filters);

      return responseHelper.success(
        res,
        tasks,
        "Your tasks retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting current user's tasks", error, {
        userId: req.user.id,
        filters: req.query,
      });
      return responseHelper.error(res, "Failed to retrieve your tasks", 500);
    }
  }

  // @desc    Get tasks by status
  // @route   GET /api/staff/tasks/status/:status
  // @access  Admin/Manager
  static async getTasksByStatus(req, res) {
    try {
      const status = req.params.status;

      logger.info("Getting tasks by status", {
        status,
        user: req.user?.id,
      });

      const validStatuses = [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return responseHelper.badRequest(
          res,
          "Invalid status. Must be: pending, in_progress, completed, or cancelled"
        );
      }

      const tasks = await StaffTask.getTasksByStatus(status);

      return responseHelper.success(
        res,
        tasks,
        `Tasks with status '${status}' retrieved successfully`
      );
    } catch (error) {
      logger.error("Error getting tasks by status", error, {
        status: req.params.status,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve tasks");
    }
  }

  // @desc    Get overdue tasks
  // @route   GET /api/staff/tasks/overdue
  // @access  Admin/Manager
  static async getOverdueTasks(req, res) {
    try {
      logger.info("Getting overdue tasks", { user: req.user?.id });

      const tasks = await StaffTask.getOverdueTasks();

      return responseHelper.success(
        res,
        tasks,
        "Overdue tasks retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting overdue tasks", error, {
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve overdue tasks");
    }
  }

  // @desc    Update staff task
  // @route   PUT /api/staff/tasks/:id
  // @access  Admin/Manager/Staff(assigned - limited fields)
  static async updateTask(req, res) {
    try {
      const taskId = req.params.id;

      logger.info("Updating staff task", {
        taskId,
        body: req.body,
        user: req.user?.id,
      });

      const task = await StaffTask.findById(taskId);
      if (!task) {
        return responseHelper.notFound(res, "Staff task not found");
      }

      // Check permissions and restrict fields for staff
      if (req.user.role === "staff") {
        if (task.assigned_to !== req.user.id) {
          return responseHelper.forbidden(res, "Access denied");
        }

        // Staff can only update status and notes
        const allowedFields = ["status"];
        const filteredBody = {};
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            filteredBody[field] = req.body[field];
          }
        }
        req.body = filteredBody;
      }

      // Validate update data
      const validation = validateStaffTask(req.body, false); // false = update mode
      if (!validation.isValid) {
        return responseHelper.validationError(res, validation.errors);
      }

      // Validate room if being updated
      if (req.body.room_id && req.body.room_id !== task.room_id) {
        const room = await Room.findById(req.body.room_id);
        if (!room) {
          return responseHelper.notFound(res, "Room not found");
        }
      }

      // Validate booking if being updated
      if (req.body.booking_id && req.body.booking_id !== task.booking_id) {
        const booking = await Booking.findById(req.body.booking_id);
        if (!booking) {
          return responseHelper.notFound(res, "Booking not found");
        }
      }

      const updatedTask = await task.update(req.body);

      logger.info("Staff task updated successfully", {
        taskId,
        assignedTo: updatedTask.assigned_to,
      });

      return responseHelper.success(
        res,
        updatedTask,
        "Staff task updated successfully"
      );
    } catch (error) {
      logger.error("Error updating staff task", error, {
        taskId: req.params.id,
        body: req.body,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to update staff task");
    }
  }

  // @desc    Assign task to staff member
  // @route   PATCH /api/staff/tasks/:id/assign
  // @access  Admin/Manager
  static async assignTask(req, res) {
    try {
      const taskId = req.params.id;
      const { staff_id } = req.body;

      logger.info("Assigning task to staff member", {
        taskId,
        staffId: staff_id,
        user: req.user?.id,
      });

      const task = await StaffTask.findById(taskId);
      if (!task) {
        return responseHelper.notFound(res, "Staff task not found");
      }

      // Check if new staff member exists and is active
      const staff = await User.findById(staff_id);
      if (!staff || staff.role !== "staff") {
        return responseHelper.notFound(res, "Staff member not found");
      }

      const staffProfile = await StaffProfile.findByUserId(staff_id);
      if (!staffProfile || staffProfile.status !== "active") {
        return responseHelper.badRequest(res, "Staff member is not active");
      }

      const updatedTask = await task.assignTo(staff_id);

      logger.info("Task assigned successfully", {
        taskId,
        oldStaffId: task.assigned_to,
        newStaffId: staff_id,
      });

      return responseHelper.success(
        res,
        updatedTask,
        "Task assigned successfully"
      );
    } catch (error) {
      logger.error("Error assigning task", error, {
        taskId: req.params.id,
        staffId: req.body.staff_id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to assign task");
    }
  }

  // @desc    Mark task as in progress
  // @route   PATCH /api/staff/tasks/:id/start
  // @access  Admin/Manager/Staff(assigned)
  static async startTask(req, res) {
    try {
      const taskId = req.params.id;

      logger.info("Starting task", {
        taskId,
        user: req.user?.id,
      });

      const task = await StaffTask.findById(taskId);
      if (!task) {
        return responseHelper.notFound(res, "Staff task not found");
      }

      // Check permissions
      if (req.user.role === "staff" && task.assigned_to !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      if (task.status !== "pending") {
        return responseHelper.badRequest(
          res,
          "Task must be in pending status to start"
        );
      }

      const updatedTask = await task.markInProgress();

      logger.info("Task started successfully", {
        taskId,
        assignedTo: updatedTask.assigned_to,
      });

      return responseHelper.success(
        res,
        updatedTask,
        "Task started successfully"
      );
    } catch (error) {
      logger.error("Error starting task", error, {
        taskId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to start task");
    }
  }

  // @desc    Mark task as completed
  // @route   PATCH /api/staff/tasks/:id/complete
  // @access  Admin/Manager/Staff(assigned)
  static async completeTask(req, res) {
    try {
      const taskId = req.params.id;

      logger.info("Completing task", {
        taskId,
        user: req.user?.id,
      });

      const task = await StaffTask.findById(taskId);
      if (!task) {
        return responseHelper.notFound(res, "Staff task not found");
      }

      // Check permissions
      if (req.user.role === "staff" && task.assigned_to !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      if (task.status === "completed") {
        return responseHelper.badRequest(res, "Task is already completed");
      }

      if (task.status === "cancelled") {
        return responseHelper.badRequest(res, "Cannot complete cancelled task");
      }

      const updatedTask = await task.markCompleted();

      logger.info("Task completed successfully", {
        taskId,
        assignedTo: updatedTask.assigned_to,
      });

      return responseHelper.success(
        res,
        updatedTask,
        "Task completed successfully"
      );
    } catch (error) {
      logger.error("Error completing task", error, {
        taskId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to complete task");
    }
  }

  // @desc    Set task priority
  // @route   PATCH /api/staff/tasks/:id/priority
  // @access  Admin/Manager
  static async setPriority(req, res) {
    try {
      const taskId = req.params.id;
      const { priority } = req.body;

      logger.info("Setting task priority", {
        taskId,
        priority,
        user: req.user?.id,
      });

      const task = await StaffTask.findById(taskId);
      if (!task) {
        return responseHelper.notFound(res, "Staff task not found");
      }

      if (!priority) {
        return responseHelper.badRequest(res, "Priority is required");
      }

      const updatedTask = await task.setPriority(priority);

      logger.info("Task priority updated successfully", {
        taskId,
        priority,
        assignedTo: updatedTask.assigned_to,
      });

      return responseHelper.success(
        res,
        updatedTask,
        `Task priority set to ${priority}`
      );
    } catch (error) {
      if (error.message.includes("Invalid priority")) {
        return responseHelper.badRequest(res, error.message);
      }

      logger.error("Error setting task priority", error, {
        taskId: req.params.id,
        priority: req.body.priority,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to set task priority");
    }
  }

  // @desc    Delete staff task
  // @route   DELETE /api/staff/tasks/:id
  // @access  Admin/Manager
  static async deleteTask(req, res) {
    try {
      const taskId = req.params.id;

      logger.info("Deleting staff task", {
        taskId,
        user: req.user?.id,
      });

      const task = await StaffTask.findById(taskId);
      if (!task) {
        return responseHelper.notFound(res, "Staff task not found");
      }

      await task.delete();

      logger.info("Staff task deleted successfully", {
        taskId,
        assignedTo: task.assigned_to,
      });

      return responseHelper.success(
        res,
        null,
        "Staff task deleted successfully"
      );
    } catch (error) {
      if (error.message.includes("Cannot delete completed")) {
        return responseHelper.badRequest(res, error.message);
      }

      logger.error("Error deleting staff task", error, {
        taskId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to delete staff task");
    }
  }

  // @desc    Cancel task
  // @route   PATCH /api/staff/tasks/:id/cancel
  // @access  Admin/Manager
  static async cancelTask(req, res) {
    try {
      const taskId = req.params.id;
      const { reason } = req.body;

      logger.info("Cancelling task", {
        taskId,
        reason,
        user: req.user?.id,
      });

      const task = await StaffTask.findById(taskId);
      if (!task) {
        return responseHelper.notFound(res, "Staff task not found");
      }

      if (task.status === "completed") {
        return responseHelper.badRequest(res, "Cannot cancel completed task");
      }

      if (task.status === "cancelled") {
        return responseHelper.badRequest(res, "Task is already cancelled");
      }

      const updateData = {
        status: "cancelled",
      };

      const updatedTask = await task.update(updateData);

      logger.info("Task cancelled successfully", {
        taskId,
        reason,
        assignedTo: updatedTask.assigned_to,
      });

      return responseHelper.success(
        res,
        updatedTask,
        "Task cancelled successfully"
      );
    } catch (error) {
      logger.error("Error cancelling task", error, {
        taskId: req.params.id,
        reason: req.body.reason,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to cancel task");
    }
  }
}

module.exports = {
  createTask: StaffTaskController.createTask,
  getAllTasks: StaffTaskController.getAllTasks,
  getTaskById: StaffTaskController.getTaskById,
  getTasksByStaffId: StaffTaskController.getTasksByStaffId,
  getMyTasks: StaffTaskController.getMyTasks,
  getTasksByStatus: StaffTaskController.getTasksByStatus,
  getOverdueTasks: StaffTaskController.getOverdueTasks,
  updateTask: StaffTaskController.updateTask,
  assignTask: StaffTaskController.assignTask,
  startTask: StaffTaskController.startTask,
  completeTask: StaffTaskController.completeTask,
  setPriority: StaffTaskController.setPriority,
  deleteTask: StaffTaskController.deleteTask,
  cancelTask: StaffTaskController.cancelTask,
};
