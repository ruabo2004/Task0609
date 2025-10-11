// StaffTask Model
// Enhanced implementation for Employee Module

const { executeQuery, getConnection } = require("../config/database");
const { logger } = require("../utils/logger");

class StaffTask {
  constructor(taskData) {
    this.id = taskData.id;
    this.assigned_to = taskData.assigned_to;
    this.assigned_by = taskData.assigned_by;
    this.task_type = taskData.task_type;
    this.title = taskData.title;
    this.description = taskData.description;
    this.priority = taskData.priority;
    this.status = taskData.status;
    this.room_id = taskData.room_id;
    this.booking_id = taskData.booking_id;
    this.due_date = taskData.due_date;
    this.completed_at = taskData.completed_at;
    this.created_at = taskData.created_at;
    this.updated_at = taskData.updated_at;
    // Additional joined fields
    this.assigned_to_name = taskData.assigned_to_name;
    this.assigned_by_name = taskData.assigned_by_name;
    this.room_number = taskData.room_number;
    this.department = taskData.department;
  }

  // Static methods for database operations

  // @desc    Create new staff task
  static async create(taskData) {
    try {
      logger.debug("Creating staff task", { taskData });

      const query = `
        INSERT INTO staff_tasks (
          assigned_to, assigned_by, task_type, title, description, 
          priority, status, room_id, booking_id, due_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        taskData.assigned_to,
        taskData.assigned_by || null,
        taskData.task_type,
        taskData.title,
        taskData.description || null,
        taskData.priority || "medium",
        taskData.status || "pending",
        taskData.room_id || null,
        taskData.booking_id || null,
        taskData.due_date || null,
      ];

      const result = await executeQuery(query, values);
      return await StaffTask.findById(result.insertId);
    } catch (error) {
      logger.error("Error creating staff task", error, { taskData });
      throw error;
    }
  }

  // @desc    Find staff task by ID
  static async findById(id) {
    try {
      const query = `
        SELECT st.*,
               u1.full_name as assigned_to_name,
               u2.full_name as assigned_by_name,
               r.room_number,
               sp.department
        FROM staff_tasks st
        LEFT JOIN users u1 ON st.assigned_to = u1.id
        LEFT JOIN users u2 ON st.assigned_by = u2.id
        LEFT JOIN rooms r ON st.room_id = r.id
        LEFT JOIN staff_profiles sp ON u1.id = sp.user_id
        WHERE st.id = ?
      `;
      const results = await executeQuery(query, [id]);

      if (results.length === 0) {
        return null;
      }

      return new StaffTask(results[0]);
    } catch (error) {
      logger.error("Error finding staff task by ID", error, { id });
      throw error;
    }
  }

  // @desc    Find staff tasks by staff ID
  static async findByStaffId(staffId, filters = {}) {
    try {
      const { status, priority, task_type, date_from, date_to } = filters;

      let query = `
        SELECT st.*,
               u1.full_name as assigned_to_name,
               u2.full_name as assigned_by_name,
               r.room_number,
               sp.department
        FROM staff_tasks st
        LEFT JOIN users u1 ON st.assigned_to = u1.id
        LEFT JOIN users u2 ON st.assigned_by = u2.id
        LEFT JOIN rooms r ON st.room_id = r.id
        LEFT JOIN staff_profiles sp ON u1.id = sp.user_id
        WHERE st.assigned_to = ?
      `;
      const queryParams = [staffId];

      // Apply filters
      if (status) {
        query += " AND st.status = ?";
        queryParams.push(status);
      }

      if (priority) {
        query += " AND st.priority = ?";
        queryParams.push(priority);
      }

      if (task_type) {
        query += " AND st.task_type = ?";
        queryParams.push(task_type);
      }

      if (date_from) {
        query += " AND DATE(st.created_at) >= ?";
        queryParams.push(date_from);
      }

      if (date_to) {
        query += " AND DATE(st.created_at) <= ?";
        queryParams.push(date_to);
      }

      query +=
        " ORDER BY st.priority DESC, st.due_date ASC, st.created_at DESC";

      const results = await executeQuery(query, queryParams);
      return results.map((taskData) => new StaffTask(taskData));
    } catch (error) {
      logger.error("Error finding staff tasks by staff ID", error, {
        staffId,
        filters,
      });
      throw error;
    }
  }

  // @desc    Get all staff tasks with filters
  static async getAll(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        task_type,
        department,
        assigned_to,
        date_from,
        date_to,
      } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT st.*,
               u1.full_name as assigned_to_name,
               u2.full_name as assigned_by_name,
               r.room_number,
               sp.department
        FROM staff_tasks st
        LEFT JOIN users u1 ON st.assigned_to = u1.id
        LEFT JOIN users u2 ON st.assigned_by = u2.id
        LEFT JOIN rooms r ON st.room_id = r.id
        LEFT JOIN staff_profiles sp ON u1.id = sp.user_id
        WHERE 1=1
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM staff_tasks st
        LEFT JOIN users u1 ON st.assigned_to = u1.id
        LEFT JOIN staff_profiles sp ON u1.id = sp.user_id
        WHERE 1=1
      `;

      const queryParams = [];
      const countParams = [];

      // Apply filters
      if (status) {
        query += " AND st.status = ?";
        countQuery += " AND st.status = ?";
        queryParams.push(status);
        countParams.push(status);
      }

      if (priority) {
        query += " AND st.priority = ?";
        countQuery += " AND st.priority = ?";
        queryParams.push(priority);
        countParams.push(priority);
      }

      if (task_type) {
        query += " AND st.task_type = ?";
        countQuery += " AND st.task_type = ?";
        queryParams.push(task_type);
        countParams.push(task_type);
      }

      if (department) {
        query += " AND sp.department = ?";
        countQuery += " AND sp.department = ?";
        queryParams.push(department);
        countParams.push(department);
      }

      if (assigned_to) {
        query += " AND st.assigned_to = ?";
        countQuery += " AND st.assigned_to = ?";
        queryParams.push(assigned_to);
        countParams.push(assigned_to);
      }

      if (date_from) {
        query += " AND DATE(st.created_at) >= ?";
        countQuery += " AND DATE(st.created_at) >= ?";
        queryParams.push(date_from);
        countParams.push(date_from);
      }

      if (date_to) {
        query += " AND DATE(st.created_at) <= ?";
        countQuery += " AND DATE(st.created_at) <= ?";
        queryParams.push(date_to);
        countParams.push(date_to);
      }

      query += ` ORDER BY st.priority DESC, st.due_date ASC, st.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const [tasks, totalResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, countParams),
      ]);

      return {
        tasks: tasks.map((taskData) => new StaffTask(taskData)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      logger.error("Error getting all staff tasks", error, { filters });
      throw error;
    }
  }

  // @desc    Get tasks by status
  static async getTasksByStatus(status) {
    try {
      const query = `
        SELECT st.*,
               u1.full_name as assigned_to_name,
               u2.full_name as assigned_by_name,
               r.room_number,
               sp.department
        FROM staff_tasks st
        LEFT JOIN users u1 ON st.assigned_to = u1.id
        LEFT JOIN users u2 ON st.assigned_by = u2.id
        LEFT JOIN rooms r ON st.room_id = r.id
        LEFT JOIN staff_profiles sp ON u1.id = sp.user_id
        WHERE st.status = ?
        ORDER BY st.priority DESC, st.due_date ASC
      `;
      const results = await executeQuery(query, [status]);
      return results.map((taskData) => new StaffTask(taskData));
    } catch (error) {
      logger.error("Error getting tasks by status", error, { status });
      throw error;
    }
  }

  // @desc    Get overdue tasks
  static async getOverdueTasks() {
    try {
      const query = `
        SELECT st.*,
               u1.full_name as assigned_to_name,
               u2.full_name as assigned_by_name,
               r.room_number,
               sp.department
        FROM staff_tasks st
        LEFT JOIN users u1 ON st.assigned_to = u1.id
        LEFT JOIN users u2 ON st.assigned_by = u2.id
        LEFT JOIN rooms r ON st.room_id = r.id
        LEFT JOIN staff_profiles sp ON u1.id = sp.user_id
        WHERE st.due_date < NOW() 
        AND st.status NOT IN ('completed', 'cancelled')
        ORDER BY st.due_date ASC, st.priority DESC
      `;
      const results = await executeQuery(query);
      return results.map((taskData) => new StaffTask(taskData));
    } catch (error) {
      logger.error("Error getting overdue tasks", error);
      throw error;
    }
  }

  // Instance methods

  // @desc    Update staff task
  async update(updateData) {
    try {
      logger.debug("Updating staff task", { id: this.id, updateData });

      const allowedFields = [
        "assigned_to",
        "task_type",
        "title",
        "description",
        "priority",
        "status",
        "room_id",
        "booking_id",
        "due_date",
      ];

      const updateFields = [];
      const values = [];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      }

      // Set completed_at when status changes to completed
      if (updateData.status === "completed" && this.status !== "completed") {
        updateFields.push("completed_at = CURRENT_TIMESTAMP");
      }

      if (updateFields.length === 0) {
        return this;
      }

      values.push(this.id);
      const query = `
        UPDATE staff_tasks 
        SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      await executeQuery(query, values);
      return await StaffTask.findById(this.id);
    } catch (error) {
      logger.error("Error updating staff task", error, {
        id: this.id,
        updateData,
      });
      throw error;
    }
  }

  // @desc    Assign task to staff member
  async assignTo(staffId) {
    try {
      const query = `
        UPDATE staff_tasks 
        SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await executeQuery(query, [staffId, this.id]);
      return await StaffTask.findById(this.id);
    } catch (error) {
      logger.error("Error assigning task", error, { id: this.id, staffId });
      throw error;
    }
  }

  // @desc    Mark task as in progress
  async markInProgress() {
    try {
      const query = `
        UPDATE staff_tasks 
        SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await executeQuery(query, [this.id]);
      return await StaffTask.findById(this.id);
    } catch (error) {
      logger.error("Error marking task as in progress", error, { id: this.id });
      throw error;
    }
  }

  // @desc    Mark task as completed
  async markCompleted() {
    try {
      const query = `
        UPDATE staff_tasks 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await executeQuery(query, [this.id]);
      return await StaffTask.findById(this.id);
    } catch (error) {
      logger.error("Error marking task as completed", error, { id: this.id });
      throw error;
    }
  }

  // @desc    Set task priority
  async setPriority(priority) {
    try {
      const validPriorities = ["low", "medium", "high", "urgent"];
      if (!validPriorities.includes(priority)) {
        throw new Error("Invalid priority level");
      }

      const query = `
        UPDATE staff_tasks 
        SET priority = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await executeQuery(query, [priority, this.id]);
      return await StaffTask.findById(this.id);
    } catch (error) {
      logger.error("Error setting task priority", error, {
        id: this.id,
        priority,
      });
      throw error;
    }
  }

  // @desc    Delete staff task
  async delete() {
    try {
      // Only allow deletion of pending or cancelled tasks
      if (this.status === "completed") {
        throw new Error("Cannot delete completed tasks");
      }

      const query = "DELETE FROM staff_tasks WHERE id = ?";
      await executeQuery(query, [this.id]);
      return true;
    } catch (error) {
      logger.error("Error deleting staff task", error, { id: this.id });
      throw error;
    }
  }

  // @desc    Check if task is overdue
  isOverdue() {
    if (
      !this.due_date ||
      this.status === "completed" ||
      this.status === "cancelled"
    ) {
      return false;
    }
    return new Date(this.due_date) < new Date();
  }

  // @desc    Get priority color for UI
  getPriorityColor() {
    const colors = {
      low: "green",
      medium: "yellow",
      high: "orange",
      urgent: "red",
    };
    return colors[this.priority] || "gray";
  }

  // @desc    Get status color for UI
  getStatusColor() {
    const colors = {
      pending: "gray",
      in_progress: "blue",
      completed: "green",
      cancelled: "red",
    };
    return colors[this.status] || "gray";
  }

  // @desc    Get staff task data
  toJSON() {
    const taskObj = { ...this };
    taskObj.is_overdue = this.isOverdue();
    taskObj.priority_color = this.getPriorityColor();
    taskObj.status_color = this.getStatusColor();
    return taskObj;
  }
}

module.exports = StaffTask;
