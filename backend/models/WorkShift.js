// WorkShift Model
// Enhanced implementation for Employee Module

const { executeQuery, getConnection } = require("../config/database");
const { logger } = require("../utils/logger");

class WorkShift {
  constructor(shiftData) {
    this.id = shiftData.id;
    this.staff_id = shiftData.staff_id;
    this.shift_date = shiftData.shift_date;
    this.shift_type = shiftData.shift_type;
    this.start_time = shiftData.start_time;
    this.end_time = shiftData.end_time;
    this.status = shiftData.status;
    this.notes = shiftData.notes;
    this.created_at = shiftData.created_at;
    this.updated_at = shiftData.updated_at;
    // Additional joined fields
    this.staff_name = shiftData.staff_name;
    this.department = shiftData.department;
  }

  // Static methods for database operations

  // @desc    Create new work shift
  static async create(shiftData) {
    try {
      logger.debug("Creating work shift", { shiftData });

      // Check for conflicts first
      const conflicts = await WorkShift.getShiftConflicts(
        shiftData.staff_id,
        shiftData.shift_date,
        shiftData.start_time,
        shiftData.end_time
      );

      if (conflicts.length > 0) {
        throw new Error("Shift conflicts with existing schedule");
      }

      const query = `
        INSERT INTO work_shifts (
          staff_id, shift_date, shift_type, start_time, end_time, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        shiftData.staff_id,
        shiftData.shift_date,
        shiftData.shift_type,
        shiftData.start_time,
        shiftData.end_time,
        shiftData.status || "scheduled",
        shiftData.notes || null,
      ];

      const result = await executeQuery(query, values);
      return await WorkShift.findById(result.insertId);
    } catch (error) {
      logger.error("Error creating work shift", error, { shiftData });
      throw error;
    }
  }

  // @desc    Find work shift by ID
  static async findById(id) {
    try {
      const query = `
        SELECT ws.*, u.full_name as staff_name, sp.department
        FROM work_shifts ws
        LEFT JOIN users u ON ws.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        WHERE ws.id = ?
      `;
      const results = await executeQuery(query, [id]);

      if (results.length === 0) {
        return null;
      }

      return new WorkShift(results[0]);
    } catch (error) {
      logger.error("Error finding work shift by ID", error, { id });
      throw error;
    }
  }

  // @desc    Find work shifts by staff ID
  static async findByStaffId(staffId, dateRange = {}) {
    try {
      let query = `
        SELECT ws.*, u.full_name as staff_name, sp.department
        FROM work_shifts ws
        LEFT JOIN users u ON ws.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        WHERE ws.staff_id = ?
      `;
      const queryParams = [staffId];

      if (dateRange.from) {
        query += " AND ws.shift_date >= ?";
        queryParams.push(dateRange.from);
      }

      if (dateRange.to) {
        query += " AND ws.shift_date <= ?";
        queryParams.push(dateRange.to);
      }

      query += " ORDER BY ws.shift_date, ws.start_time";

      const results = await executeQuery(query, queryParams);
      return results.map((shiftData) => new WorkShift(shiftData));
    } catch (error) {
      logger.error("Error finding work shifts by staff ID", error, {
        staffId,
        dateRange,
      });
      throw error;
    }
  }

  // @desc    Find work shifts by date
  static async findByDate(date) {
    try {
      const query = `
        SELECT ws.*, u.full_name as staff_name, sp.department, sp.position
        FROM work_shifts ws
        LEFT JOIN users u ON ws.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        WHERE ws.shift_date = ?
        ORDER BY ws.start_time, sp.department
      `;
      const results = await executeQuery(query, [date]);
      return results.map((shiftData) => new WorkShift(shiftData));
    } catch (error) {
      logger.error("Error finding work shifts by date", error, { date });
      throw error;
    }
  }

  // @desc    Get all work shifts with filters
  static async getAll(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        department,
        status,
        date_from,
        date_to,
        staff_id,
      } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT ws.*, u.full_name as staff_name, sp.department, sp.position
        FROM work_shifts ws
        LEFT JOIN users u ON ws.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        WHERE 1=1
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM work_shifts ws
        LEFT JOIN users u ON ws.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        WHERE 1=1
      `;

      const queryParams = [];
      const countParams = [];

      // Apply filters
      if (department) {
        query += " AND sp.department = ?";
        countQuery += " AND sp.department = ?";
        queryParams.push(department);
        countParams.push(department);
      }

      if (status) {
        query += " AND ws.status = ?";
        countQuery += " AND ws.status = ?";
        queryParams.push(status);
        countParams.push(status);
      }

      if (staff_id) {
        query += " AND ws.staff_id = ?";
        countQuery += " AND ws.staff_id = ?";
        queryParams.push(staff_id);
        countParams.push(staff_id);
      }

      if (date_from) {
        query += " AND ws.shift_date >= ?";
        countQuery += " AND ws.shift_date >= ?";
        queryParams.push(date_from);
        countParams.push(date_from);
      }

      if (date_to) {
        query += " AND ws.shift_date <= ?";
        countQuery += " AND ws.shift_date <= ?";
        queryParams.push(date_to);
        countParams.push(date_to);
      }

      query += ` ORDER BY ws.shift_date DESC, ws.start_time LIMIT ${limit} OFFSET ${offset}`;

      const [shifts, totalResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, countParams),
      ]);

      return {
        shifts: shifts.map((shiftData) => new WorkShift(shiftData)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      logger.error("Error getting all work shifts", error, { filters });
      throw error;
    }
  }

  // @desc    Get weekly schedule starting from a date
  static async getWeeklySchedule(startDate) {
    try {
      const query = `
        SELECT ws.*, u.full_name as staff_name, sp.department, sp.position
        FROM work_shifts ws
        LEFT JOIN users u ON ws.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        WHERE ws.shift_date BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)
        ORDER BY ws.shift_date, ws.start_time
      `;
      const results = await executeQuery(query, [startDate, startDate]);
      return results.map((shiftData) => new WorkShift(shiftData));
    } catch (error) {
      logger.error("Error getting weekly schedule", error, { startDate });
      throw error;
    }
  }

  // @desc    Assign shift to staff member
  static async assignShift(staffId, shiftData) {
    try {
      const newShiftData = {
        ...shiftData,
        staff_id: staffId,
        status: "scheduled",
      };
      return await WorkShift.create(newShiftData);
    } catch (error) {
      logger.error("Error assigning shift", error, { staffId, shiftData });
      throw error;
    }
  }

  // @desc    Get shift conflicts
  static async getShiftConflicts(
    staffId,
    date,
    startTime,
    endTime,
    excludeShiftId = null
  ) {
    try {
      let query = `
        SELECT * FROM work_shifts 
        WHERE staff_id = ? 
        AND shift_date = ? 
        AND status IN ('scheduled', 'completed')
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `;
      const queryParams = [
        staffId,
        date,
        startTime,
        startTime,
        endTime,
        endTime,
        startTime,
        endTime,
      ];

      if (excludeShiftId) {
        query += " AND id != ?";
        queryParams.push(excludeShiftId);
      }

      const results = await executeQuery(query, queryParams);
      return results;
    } catch (error) {
      logger.error("Error checking shift conflicts", error, {
        staffId,
        date,
        startTime,
        endTime,
        excludeShiftId,
      });
      throw error;
    }
  }

  // Instance methods

  // @desc    Update work shift
  async update(updateData) {
    try {
      logger.debug("Updating work shift", { id: this.id, updateData });

      // Check for conflicts if time/date changed
      if (
        updateData.shift_date ||
        updateData.start_time ||
        updateData.end_time
      ) {
        const conflicts = await WorkShift.getShiftConflicts(
          this.staff_id,
          updateData.shift_date || this.shift_date,
          updateData.start_time || this.start_time,
          updateData.end_time || this.end_time,
          this.id // Exclude current shift from conflict check
        );

        if (conflicts.length > 0) {
          throw new Error("Updated shift conflicts with existing schedule");
        }
      }

      const allowedFields = [
        "shift_date",
        "shift_type",
        "start_time",
        "end_time",
        "status",
        "notes",
      ];

      const updateFields = [];
      const values = [];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      }

      if (updateFields.length === 0) {
        return this;
      }

      values.push(this.id);
      const query = `
        UPDATE work_shifts 
        SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      await executeQuery(query, values);
      return await WorkShift.findById(this.id);
    } catch (error) {
      logger.error("Error updating work shift", error, {
        id: this.id,
        updateData,
      });
      throw error;
    }
  }

  // @desc    Mark shift as completed
  async markCompleted() {
    try {
      const query = `
        UPDATE work_shifts 
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await executeQuery(query, [this.id]);
      return await WorkShift.findById(this.id);
    } catch (error) {
      logger.error("Error marking shift as completed", error, { id: this.id });
      throw error;
    }
  }

  // @desc    Mark shift as missed
  async markMissed() {
    try {
      const query = `
        UPDATE work_shifts 
        SET status = 'missed', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await executeQuery(query, [this.id]);
      return await WorkShift.findById(this.id);
    } catch (error) {
      logger.error("Error marking shift as missed", error, { id: this.id });
      throw error;
    }
  }

  // @desc    Delete work shift
  async delete() {
    try {
      // Only allow deletion of scheduled shifts
      if (this.status === "completed") {
        throw new Error("Cannot delete completed shifts");
      }

      const query = "DELETE FROM work_shifts WHERE id = ?";
      await executeQuery(query, [this.id]);
      return true;
    } catch (error) {
      logger.error("Error deleting work shift", error, { id: this.id });
      throw error;
    }
  }

  // @desc    Get work shift data
  toJSON() {
    return { ...this };
  }
}

module.exports = WorkShift;
