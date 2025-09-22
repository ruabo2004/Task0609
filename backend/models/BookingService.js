const { pool } = require("../config/database");

class BookingService {
  constructor(data) {
    this.booking_service_id = data.booking_service_id;
    this.booking_id = data.booking_id;
    this.service_id = data.service_id;
    this.quantity = data.quantity;
    this.unit_price = data.unit_price;
    this.total_price = data.total_price;
    this.service_date = data.service_date;
    this.service_time = data.service_time;
    this.status = data.status;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Create a new booking service
   */
  static async create(bookingServiceData) {
    const {
      booking_id,
      service_id,
      quantity,
      unit_price,
      total_price,
      service_date,
      service_time,
      notes = "",
      status = "pending",
    } = bookingServiceData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO booking_services 
         (booking_id, service_id, quantity, unit_price, total_price, 
          service_date, service_time, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          booking_id,
          service_id,
          quantity,
          unit_price,
          total_price,
          service_date,
          service_time,
          status,
          notes,
        ]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating booking service: ${error.message}`);
    }
  }

  /**
   * Find booking service by ID
   */
  static async findById(booking_service_id) {
    try {
      const [rows] = await pool.execute(
        `SELECT bs.*, s.service_name, s.service_type, s.description 
         FROM booking_services bs
         JOIN additional_services s ON bs.service_id = s.service_id
         WHERE bs.booking_service_id = ?`,
        [booking_service_id]
      );

      return rows.length > 0 ? new BookingService(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding booking service: ${error.message}`);
    }
  }

  /**
   * Get booking by ID (for validation)
   */
  static async getBookingById(booking_id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM bookings WHERE booking_id = ?",
        [booking_id]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error getting booking: ${error.message}`);
    }
  }

  /**
   * Get all services for a booking
   */
  static async getByBookingId(booking_id) {
    try {
      const [rows] = await pool.execute(
        `SELECT bs.*, s.service_name, s.service_type, s.description, s.images
         FROM booking_services bs
         JOIN additional_services s ON bs.service_id = s.service_id
         WHERE bs.booking_id = ?
         ORDER BY bs.created_at DESC`,
        [booking_id]
      );

      return rows.map((row) => {
        // Parse images if exists
        if (row.images) {
          row.images = JSON.parse(row.images);
        }
        return new BookingService(row);
      });
    } catch (error) {
      throw new Error(`Error getting booking services: ${error.message}`);
    }
  }

  /**
   * Update booking service status
   */
  static async updateStatus(booking_service_id, status, notes = "") {
    try {
      const updateQuery = notes
        ? "UPDATE booking_services SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_service_id = ?"
        : "UPDATE booking_services SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_service_id = ?";

      const params = notes
        ? [status, notes, booking_service_id]
        : [status, booking_service_id];

      await pool.execute(updateQuery, params);

      return await this.findById(booking_service_id);
    } catch (error) {
      throw new Error(
        `Error updating booking service status: ${error.message}`
      );
    }
  }

  /**
   * Cancel booking service
   */
  static async cancel(booking_service_id, reason = "") {
    try {
      return await this.updateStatus(booking_service_id, "cancelled", reason);
    } catch (error) {
      throw new Error(`Error cancelling booking service: ${error.message}`);
    }
  }

  /**
   * Confirm booking service
   */
  static async confirm(booking_service_id, notes = "") {
    try {
      return await this.updateStatus(booking_service_id, "confirmed", notes);
    } catch (error) {
      throw new Error(`Error confirming booking service: ${error.message}`);
    }
  }

  /**
   * Complete booking service
   */
  static async complete(booking_service_id, notes = "") {
    try {
      return await this.updateStatus(booking_service_id, "completed", notes);
    } catch (error) {
      throw new Error(`Error completing booking service: ${error.message}`);
    }
  }

  /**
   * Get services by customer
   */
  static async getByCustomerId(customer_id, filters = {}) {
    try {
      const { status, page = 1, limit = 20 } = filters;

      let query = `
        SELECT bs.*, s.service_name, s.service_type, s.description, s.images,
               b.booking_code, b.check_in_date, b.check_out_date
        FROM booking_services bs
        JOIN additional_services s ON bs.service_id = s.service_id
        JOIN bookings b ON bs.booking_id = b.booking_id
        WHERE b.customer_id = ?
      `;
      const queryParams = [customer_id];

      if (status) {
        query += " AND bs.status = ?";
        queryParams.push(status);
      }

      query += " ORDER BY bs.created_at DESC";

      // Add pagination
      const offset = (page - 1) * limit;
      query += " LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      const [rows] = await pool.execute(query, queryParams);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.booking_id
        WHERE b.customer_id = ?
      `;
      const countParams = [customer_id];

      if (status) {
        countQuery += " AND bs.status = ?";
        countParams.push(status);
      }

      const [countRows] = await pool.execute(countQuery, countParams);
      const total = countRows[0].total;

      const services = rows.map((row) => {
        if (row.images) {
          row.images = JSON.parse(row.images);
        }
        return new BookingService(row);
      });

      return {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(
        `Error getting customer booking services: ${error.message}`
      );
    }
  }

  /**
   * Get total revenue for booking services
   */
  static async getTotalRevenue(timeframe = "30d") {
    try {
      let dateFilter = "";

      switch (timeframe) {
        case "7d":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
          break;
        case "30d":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
          break;
        case "90d":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)";
          break;
        case "1y":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
          break;
        default:
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      }

      const [rows] = await pool.execute(`
        SELECT 
          SUM(total_price) as total_revenue,
          COUNT(*) as total_bookings,
          AVG(total_price) as avg_price
        FROM booking_services
        WHERE status IN ('confirmed', 'completed') AND ${dateFilter}
      `);

      return rows[0];
    } catch (error) {
      throw new Error(
        `Error getting booking services revenue: ${error.message}`
      );
    }
  }

  /**
   * Delete booking service
   */
  static async delete(booking_service_id) {
    try {
      await pool.execute(
        "DELETE FROM booking_services WHERE booking_service_id = ?",
        [booking_service_id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error deleting booking service: ${error.message}`);
    }
  }

  toJSON() {
    return {
      booking_service_id: this.booking_service_id,
      booking_id: this.booking_id,
      service_id: this.service_id,
      quantity: this.quantity,
      unit_price: this.unit_price,
      total_price: this.total_price,
      service_date: this.service_date,
      service_time: this.service_time,
      status: this.status,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Include service details if available
      service_name: this.service_name,
      service_type: this.service_type,
      description: this.description,
      images: this.images,
      // Include booking details if available
      booking_code: this.booking_code,
      check_in_date: this.check_in_date,
      check_out_date: this.check_out_date,
    };
  }
}

module.exports = BookingService;
