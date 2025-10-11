// AttendanceLog Model
// Enhanced implementation for Employee Module

const { executeQuery, getConnection } = require("../config/database");
const { logger } = require("../utils/logger");

class AttendanceLog {
  constructor(logData) {
    this.id = logData.id;
    this.staff_id = logData.staff_id;
    this.shift_id = logData.shift_id;
    this.check_in_time = logData.check_in_time;
    this.check_out_time = logData.check_out_time;
    this.work_hours = logData.work_hours;
    this.status = logData.status;
    this.notes = logData.notes;
    this.created_at = logData.created_at;
    this.updated_at = logData.updated_at;
    // Additional joined fields
    this.staff_name = logData.staff_name;
    this.department = logData.department;
    this.shift_type = logData.shift_type;
  }

  // Static methods for database operations

  // @desc    Create new attendance log (Check-in)
  static async create(logData) {
    try {
      logger.debug("Creating attendance log", { logData });

      const query = `
        INSERT INTO attendance_logs (
          staff_id, shift_id, check_in_time, status, notes
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        logData.staff_id,
        logData.shift_id || null,
        logData.check_in_time || new Date(),
        logData.status || "on_time",
        logData.notes || null,
      ];

      const result = await executeQuery(query, values);
      return await AttendanceLog.findById(result.insertId);
    } catch (error) {
      logger.error("Error creating attendance log", error, { logData });
      throw error;
    }
  }

  // @desc    Find attendance log by ID
  static async findById(id) {
    try {
      const query = `
        SELECT al.*,
               u.full_name as staff_name,
               sp.department,
               ws.shift_type
        FROM attendance_logs al
        LEFT JOIN users u ON al.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        LEFT JOIN work_shifts ws ON al.shift_id = ws.id
        WHERE al.id = ?
      `;
      const results = await executeQuery(query, [id]);

      if (results.length === 0) {
        return null;
      }

      return new AttendanceLog(results[0]);
    } catch (error) {
      logger.error("Error finding attendance log by ID", error, { id });
      throw error;
    }
  }

  // @desc    Find attendance logs by staff ID
  static async findByStaffId(staffId, dateRange = {}) {
    try {
      let query = `
        SELECT al.*,
               u.full_name as staff_name,
               sp.department,
               ws.shift_type
        FROM attendance_logs al
        LEFT JOIN users u ON al.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        LEFT JOIN work_shifts ws ON al.shift_id = ws.id
        WHERE al.staff_id = ?
      `;
      const queryParams = [staffId];

      if (dateRange.from) {
        query += " AND DATE(al.check_in_time) >= ?";
        queryParams.push(dateRange.from);
      }

      if (dateRange.to) {
        query += " AND DATE(al.check_in_time) <= ?";
        queryParams.push(dateRange.to);
      }

      query += " ORDER BY al.check_in_time DESC";

      const results = await executeQuery(query, queryParams);
      return results.map((logData) => new AttendanceLog(logData));
    } catch (error) {
      logger.error("Error finding attendance logs by staff ID", error, {
        staffId,
        dateRange,
      });
      throw error;
    }
  }

  // @desc    Find attendance logs by date
  static async findByDate(date) {
    try {
      const query = `
        SELECT al.*,
               u.full_name as staff_name,
               sp.department,
               sp.position,
               ws.shift_type
        FROM attendance_logs al
        LEFT JOIN users u ON al.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        LEFT JOIN work_shifts ws ON al.shift_id = ws.id
        WHERE DATE(al.check_in_time) = ?
        ORDER BY al.check_in_time
      `;
      const results = await executeQuery(query, [date]);
      return results.map((logData) => new AttendanceLog(logData));
    } catch (error) {
      logger.error("Error finding attendance logs by date", error, { date });
      throw error;
    }
  }

  // @desc    Get all attendance logs with filters
  static async getAll(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        staff_id,
        department,
        status,
        date_from,
        date_to,
      } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT al.*,
               u.full_name as staff_name,
               sp.department,
               sp.position,
               ws.shift_type
        FROM attendance_logs al
        LEFT JOIN users u ON al.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        LEFT JOIN work_shifts ws ON al.shift_id = ws.id
        WHERE 1=1
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM attendance_logs al
        LEFT JOIN users u ON al.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        WHERE 1=1
      `;

      const queryParams = [];
      const countParams = [];

      // Apply filters
      if (staff_id) {
        query += " AND al.staff_id = ?";
        countQuery += " AND al.staff_id = ?";
        queryParams.push(staff_id);
        countParams.push(staff_id);
      }

      if (department) {
        query += " AND sp.department = ?";
        countQuery += " AND sp.department = ?";
        queryParams.push(department);
        countParams.push(department);
      }

      if (status) {
        query += " AND al.status = ?";
        countQuery += " AND al.status = ?";
        queryParams.push(status);
        countParams.push(status);
      }

      if (date_from) {
        query += " AND DATE(al.check_in_time) >= ?";
        countQuery += " AND DATE(al.check_in_time) >= ?";
        queryParams.push(date_from);
        countParams.push(date_from);
      }

      if (date_to) {
        query += " AND DATE(al.check_in_time) <= ?";
        countQuery += " AND DATE(al.check_in_time) <= ?";
        queryParams.push(date_to);
        countParams.push(date_to);
      }

      query += ` ORDER BY al.check_in_time DESC LIMIT ${limit} OFFSET ${offset}`;

      const [logs, totalResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, countParams),
      ]);

      return {
        logs: logs.map((logData) => new AttendanceLog(logData)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      logger.error("Error getting all attendance logs", error, { filters });
      throw error;
    }
  }

  // @desc    Check-in staff member
  static async checkIn(staffId, shiftId = null) {
    try {
      const checkInTime = new Date();

      // Check if already checked in today
      const existingLog = await AttendanceLog.findTodayLog(staffId);
      if (existingLog) {
        throw new Error("Staff member already checked in today");
      }

      // Determine status based on shift schedule
      let status = "on_time";
      if (shiftId) {
        const shift = await executeQuery(
          "SELECT * FROM work_shifts WHERE id = ?",
          [shiftId]
        );
        if (shift.length > 0) {
          const shiftStartTime = new Date(
            `${shift[0].shift_date} ${shift[0].start_time}`
          );
          const gracePeriod = 15 * 60 * 1000; // 15 minutes in milliseconds

          if (checkInTime > shiftStartTime + gracePeriod) {
            status = "late";
          }
        }
      }

      const logData = {
        staff_id: staffId,
        shift_id: shiftId,
        check_in_time: checkInTime,
        status: status,
      };

      return await AttendanceLog.create(logData);
    } catch (error) {
      logger.error("Error checking in staff", error, { staffId, shiftId });
      throw error;
    }
  }

  // @desc    Check-out staff member
  static async checkOut(staffId) {
    try {
      const checkOutTime = new Date();

      // Find today's attendance log
      const todayLog = await AttendanceLog.findTodayLog(staffId);
      if (!todayLog) {
        throw new Error("No check-in record found for today");
      }

      if (todayLog.check_out_time) {
        throw new Error("Staff member already checked out today");
      }

      // Calculate work hours
      const checkInTime = new Date(todayLog.check_in_time);
      const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours

      // Update status if checking out early
      let status = todayLog.status;
      if (todayLog.shift_id) {
        const shift = await executeQuery(
          "SELECT * FROM work_shifts WHERE id = ?",
          [todayLog.shift_id]
        );
        if (shift.length > 0) {
          const shiftEndTime = new Date(
            `${shift[0].shift_date} ${shift[0].end_time}`
          );
          if (checkOutTime < shiftEndTime - 15 * 60 * 1000) {
            // 15 minutes grace period
            status = "early_leave";
          }
        }
      }

      const query = `
        UPDATE attendance_logs 
        SET check_out_time = ?, work_hours = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await executeQuery(query, [
        checkOutTime,
        workHours.toFixed(2),
        status,
        todayLog.id,
      ]);

      return await AttendanceLog.findById(todayLog.id);
    } catch (error) {
      logger.error("Error checking out staff", error, { staffId });
      throw error;
    }
  }

  // @desc    Find today's attendance log for staff
  static async findTodayLog(staffId) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const query = `
        SELECT * FROM attendance_logs 
        WHERE staff_id = ? AND DATE(check_in_time) = ?
      `;
      const results = await executeQuery(query, [staffId, today]);

      if (results.length === 0) {
        return null;
      }

      return new AttendanceLog(results[0]);
    } catch (error) {
      logger.error("Error finding today's attendance log", error, { staffId });
      throw error;
    }
  }

  // @desc    Calculate work hours for staff member on specific date
  static async calculateWorkHours(staffId, date) {
    try {
      const query = `
        SELECT work_hours FROM attendance_logs 
        WHERE staff_id = ? AND DATE(check_in_time) = ?
      `;
      const results = await executeQuery(query, [staffId, date]);

      if (results.length === 0 || !results[0].work_hours) {
        return 0;
      }

      return parseFloat(results[0].work_hours);
    } catch (error) {
      logger.error("Error calculating work hours", error, { staffId, date });
      throw error;
    }
  }

  // @desc    Get monthly attendance for staff member
  static async getMonthlyAttendance(staffId, month, year) {
    try {
      const query = `
        SELECT DATE(check_in_time) as date, 
               check_in_time, 
               check_out_time, 
               work_hours, 
               status
        FROM attendance_logs 
        WHERE staff_id = ? 
        AND MONTH(check_in_time) = ? 
        AND YEAR(check_in_time) = ?
        ORDER BY check_in_time
      `;
      const results = await executeQuery(query, [staffId, month, year]);
      return results;
    } catch (error) {
      logger.error("Error getting monthly attendance", error, {
        staffId,
        month,
        year,
      });
      throw error;
    }
  }

  // @desc    Get attendance report for date range
  static async getAttendanceReport(dateRange) {
    try {
      const { from, to, department } = dateRange;

      let query = `
        SELECT al.*,
               u.full_name as staff_name,
               sp.department,
               sp.position
        FROM attendance_logs al
        LEFT JOIN users u ON al.staff_id = u.id
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        WHERE DATE(al.check_in_time) BETWEEN ? AND ?
      `;
      const queryParams = [from, to];

      if (department) {
        query += " AND sp.department = ?";
        queryParams.push(department);
      }

      query += " ORDER BY al.check_in_time";

      const results = await executeQuery(query, queryParams);
      return results.map((logData) => new AttendanceLog(logData));
    } catch (error) {
      logger.error("Error getting attendance report", error, { dateRange });
      throw error;
    }
  }

  // Instance methods

  // @desc    Update attendance log
  async update(updateData) {
    try {
      logger.debug("Updating attendance log", { id: this.id, updateData });

      const allowedFields = ["status", "notes"];
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
        UPDATE attendance_logs 
        SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      await executeQuery(query, values);
      return await AttendanceLog.findById(this.id);
    } catch (error) {
      logger.error("Error updating attendance log", error, {
        id: this.id,
        updateData,
      });
      throw error;
    }
  }

  // @desc    Get formatted work duration
  getWorkDuration() {
    if (!this.work_hours) {
      return "N/A";
    }

    const hours = Math.floor(this.work_hours);
    const minutes = Math.round((this.work_hours - hours) * 60);
    return `${hours}h ${minutes}m`;
  }

  // @desc    Get status color for UI
  getStatusColor() {
    const colors = {
      on_time: "green",
      late: "yellow",
      early_leave: "orange",
      absent: "red",
    };
    return colors[this.status] || "gray";
  }

  // @desc    Check if attendance is complete (has both check-in and check-out)
  isComplete() {
    return this.check_in_time && this.check_out_time;
  }

  // @desc    Get attendance log data
  toJSON() {
    const logObj = { ...this };
    logObj.work_duration = this.getWorkDuration();
    logObj.status_color = this.getStatusColor();
    logObj.is_complete = this.isComplete();
    return logObj;
  }
}

module.exports = AttendanceLog;
