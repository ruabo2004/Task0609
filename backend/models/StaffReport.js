// StaffReport Model
// Will be implemented in Week 4

const { executeQuery, getConnection } = require("../config/database");

class StaffReport {
  constructor(reportData) {
    this.id = reportData.id;
    this.staff_id = reportData.staff_id;
    this.report_date = reportData.report_date;
    this.checkins_count = reportData.checkins_count;
    this.checkouts_count = reportData.checkouts_count;
    this.total_revenue = reportData.total_revenue;
    this.notes = reportData.notes;
    this.created_at = reportData.created_at;
  }

  // Static methods for database operations

  // @desc    Get all staff reports with pagination and filters
  static async getAll(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT sr.*, u.full_name as staff_name, u.email as staff_email
        FROM staff_reports sr
        JOIN users u ON sr.staff_id = u.id
        WHERE u.role = 'staff'
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM staff_reports sr
        JOIN users u ON sr.staff_id = u.id
        WHERE u.role = 'staff'
      `;
      const queryParams = [];

      // Apply filters
      if (filters.staff_id) {
        query += " AND sr.staff_id = ?";
        countQuery += " AND sr.staff_id = ?";
        queryParams.push(filters.staff_id);
      }

      if (filters.report_date) {
        query += " AND sr.report_date = ?";
        countQuery += " AND sr.report_date = ?";
        queryParams.push(filters.report_date);
      }

      if (filters.date_from) {
        query += " AND sr.report_date >= ?";
        countQuery += " AND sr.report_date >= ?";
        queryParams.push(filters.date_from);
      }

      if (filters.date_to) {
        query += " AND sr.report_date <= ?";
        countQuery += " AND sr.report_date <= ?";
        queryParams.push(filters.date_to);
      }

      query += ` ORDER BY sr.report_date DESC, sr.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const [reports, totalResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, queryParams),
      ]);

      return {
        reports: reports.map((report) => new StaffReport(report)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get reports by staff ID
  static async getByStaffId(staffId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const query = `
        SELECT sr.*, u.full_name as staff_name
        FROM staff_reports sr
        JOIN users u ON sr.staff_id = u.id
        WHERE sr.staff_id = ?
        ORDER BY sr.report_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countQuery =
        "SELECT COUNT(*) as total FROM staff_reports WHERE staff_id = ?";

      const [reports, totalResult] = await Promise.all([
        executeQuery(query, [staffId]),
        executeQuery(countQuery, [staffId]),
      ]);

      return {
        reports: reports.map((report) => new StaffReport(report)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find report by ID
  static async findById(id) {
    try {
      const query = `
        SELECT sr.*, u.full_name as staff_name, u.email as staff_email
        FROM staff_reports sr
        JOIN users u ON sr.staff_id = u.id
        WHERE sr.id = ?
      `;
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new StaffReport(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find report by staff and date
  static async findByStaffAndDate(staffId, reportDate) {
    try {
      const query =
        "SELECT * FROM staff_reports WHERE staff_id = ? AND report_date = ?";
      const results = await executeQuery(query, [staffId, reportDate]);
      return results.length > 0 ? new StaffReport(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Create or update daily report
  static async createOrUpdate(reportData) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Validate staff exists and has correct role
      const staffQuery =
        "SELECT id, full_name, role FROM users WHERE id = ? AND role = 'staff' AND is_active = TRUE";
      const staffResult = await connection.execute(staffQuery, [
        reportData.staff_id,
      ]);

      if (staffResult[0].length === 0) {
        throw new Error("Staff member not found or inactive");
      }

      // Check if report already exists for this staff and date
      const existingQuery =
        "SELECT id FROM staff_reports WHERE staff_id = ? AND report_date = ?";
      const existingResult = await connection.execute(existingQuery, [
        reportData.staff_id,
        reportData.report_date,
      ]);

      let reportId;

      if (existingResult[0].length > 0) {
        // Update existing report
        reportId = existingResult[0][0].id;
        const updateQuery = `
          UPDATE staff_reports 
          SET checkins_count = ?, checkouts_count = ?, total_revenue = ?, notes = ?
          WHERE id = ?
        `;
        await connection.execute(updateQuery, [
          reportData.checkins_count || 0,
          reportData.checkouts_count || 0,
          reportData.total_revenue || 0,
          reportData.notes || null,
          reportId,
        ]);
      } else {
        // Create new report
        const insertQuery = `
          INSERT INTO staff_reports (staff_id, report_date, checkins_count, checkouts_count, total_revenue, notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        const insertResult = await connection.execute(insertQuery, [
          reportData.staff_id,
          reportData.report_date,
          reportData.checkins_count || 0,
          reportData.checkouts_count || 0,
          reportData.total_revenue || 0,
          reportData.notes || null,
        ]);
        reportId = insertResult[0].insertId;
      }

      await connection.commit();
      return await StaffReport.findById(reportId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Auto-generate report from booking data
  static async autoGenerateReport(staffId, reportDate) {
    try {
      // Get check-ins for the day
      const checkinQuery = `
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
        FROM bookings
        WHERE status = 'checked_in' 
        AND DATE(updated_at) = ?
        AND id IN (
          SELECT booking_id FROM booking_logs 
          WHERE staff_id = ? AND action = 'check_in' AND DATE(created_at) = ?
        )
      `;

      // Get check-outs for the day
      const checkoutQuery = `
        SELECT COUNT(*) as count
        FROM bookings
        WHERE status = 'checked_out'
        AND DATE(updated_at) = ?
        AND id IN (
          SELECT booking_id FROM booking_logs 
          WHERE staff_id = ? AND action = 'check_out' AND DATE(created_at) = ?
        )
      `;

      // Note: This assumes we have a booking_logs table to track staff actions
      // For now, we'll use a simplified approach
      const simplifiedCheckinQuery = `
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
        FROM bookings
        WHERE status IN ('checked_in', 'checked_out')
        AND DATE(check_in_date) = ?
      `;

      const simplifiedCheckoutQuery = `
        SELECT COUNT(*) as count
        FROM bookings
        WHERE status = 'checked_out'
        AND DATE(check_out_date) = ?
      `;

      const [checkinResult, checkoutResult] = await Promise.all([
        executeQuery(simplifiedCheckinQuery, [reportDate]),
        executeQuery(simplifiedCheckoutQuery, [reportDate]),
      ]);

      const reportData = {
        staff_id: staffId,
        report_date: reportDate,
        checkins_count: checkinResult[0].count,
        checkouts_count: checkoutResult[0].count,
        total_revenue: checkinResult[0].revenue,
        notes: "Auto-generated report",
      };

      return await StaffReport.createOrUpdate(reportData);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get staff performance statistics
  static async getStaffPerformanceStats(staffId, startDate, endDate) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_report_days,
          SUM(checkins_count) as total_checkins,
          SUM(checkouts_count) as total_checkouts,
          SUM(total_revenue) as total_revenue,
          AVG(checkins_count) as avg_checkins_per_day,
          AVG(checkouts_count) as avg_checkouts_per_day,
          AVG(total_revenue) as avg_revenue_per_day,
          MAX(checkins_count + checkouts_count) as best_day_activities,
          MAX(total_revenue) as best_day_revenue
        FROM staff_reports
        WHERE staff_id = ? AND report_date BETWEEN ? AND ?
      `;
      const results = await executeQuery(query, [staffId, startDate, endDate]);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get team performance comparison
  static async getTeamPerformanceComparison(startDate, endDate) {
    try {
      const query = `
        SELECT 
          u.id as staff_id,
          u.full_name as staff_name,
          COUNT(sr.id) as report_days,
          SUM(sr.checkins_count) as total_checkins,
          SUM(sr.checkouts_count) as total_checkouts,
          SUM(sr.total_revenue) as total_revenue,
          AVG(sr.checkins_count + sr.checkouts_count) as avg_daily_activities,
          AVG(sr.total_revenue) as avg_daily_revenue
        FROM users u
        LEFT JOIN staff_reports sr ON u.id = sr.staff_id 
          AND sr.report_date BETWEEN ? AND ?
        WHERE u.role = 'staff' AND u.is_active = TRUE
        GROUP BY u.id, u.full_name
        ORDER BY total_revenue DESC, total_checkins DESC
      `;
      const results = await executeQuery(query, [startDate, endDate]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get daily summary for date range
  static async getDailySummary(startDate, endDate) {
    try {
      const query = `
        SELECT 
          report_date,
          COUNT(DISTINCT staff_id) as active_staff,
          SUM(checkins_count) as total_checkins,
          SUM(checkouts_count) as total_checkouts,
          SUM(total_revenue) as total_revenue,
          AVG(checkins_count + checkouts_count) as avg_activities_per_staff
        FROM staff_reports
        WHERE report_date BETWEEN ? AND ?
        GROUP BY report_date
        ORDER BY report_date DESC
      `;
      const results = await executeQuery(query, [startDate, endDate]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Instance methods

  // @desc    Update report
  async update(updateData) {
    try {
      const allowedFields = [
        "checkins_count",
        "checkouts_count",
        "total_revenue",
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
      const query = `UPDATE staff_reports SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;

      await executeQuery(query, values);
      return await StaffReport.findById(this.id);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Delete report
  async delete() {
    try {
      const query = "DELETE FROM staff_reports WHERE id = ?";
      await executeQuery(query, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get total activities count
  getTotalActivities() {
    return (this.checkins_count || 0) + (this.checkouts_count || 0);
  }

  // @desc    Get formatted revenue
  getFormattedRevenue() {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(this.total_revenue || 0);
  }

  // @desc    Get formatted date
  getFormattedDate() {
    return new Date(this.report_date).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // @desc    Get performance level
  getPerformanceLevel() {
    const totalActivities = this.getTotalActivities();
    const revenue = this.total_revenue || 0;

    if (totalActivities >= 10 && revenue >= 5000000) return "excellent";
    if (totalActivities >= 7 && revenue >= 3000000) return "good";
    if (totalActivities >= 5 && revenue >= 1000000) return "average";
    return "needs_improvement";
  }

  // @desc    Get performance color class
  getPerformanceColorClass() {
    const level = this.getPerformanceLevel();
    switch (level) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "average":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  }

  // @desc    Get performance badge
  getPerformanceBadge() {
    const level = this.getPerformanceLevel();
    const badges = {
      excellent: "🌟 Xuất sắc",
      good: "👍 Tốt",
      average: "📊 Trung bình",
      needs_improvement: "📈 Cần cải thiện",
    };
    return badges[level];
  }

  // @desc    Check if report can be edited (within 7 days)
  canBeEdited() {
    const now = new Date();
    const reportDate = new Date(this.report_date);
    const daysDiff = (now - reportDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  }

  // @desc    Get JSON representation
  toJSON() {
    return {
      ...this,
      total_activities: this.getTotalActivities(),
      formatted_revenue: this.getFormattedRevenue(),
      formatted_date: this.getFormattedDate(),
      performance_level: this.getPerformanceLevel(),
      performance_color_class: this.getPerformanceColorClass(),
      performance_badge: this.getPerformanceBadge(),
      can_be_edited: this.canBeEdited(),
    };
  }
}

module.exports = StaffReport;
