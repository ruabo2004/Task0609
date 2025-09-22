const { pool } = require("../config/database");

class AdditionalService {
  constructor(data) {
    this.service_id = data.service_id;
    this.service_name = data.service_name;
    this.service_type = data.service_type;
    this.description = data.description;
    this.price = data.price;
    this.unit = data.unit;
    this.availability_hours = data.availability_hours;
    this.advance_booking_required = data.advance_booking_required;
    this.max_quantity = data.max_quantity;
    this.images = data.images;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Create a new additional service
   */
  static async create(serviceData) {
    const {
      service_name,
      service_type,
      description,
      price,
      unit = "fixed",
      availability_hours,
      advance_booking_required = 0,
      max_quantity = 10,
      images,
      status = "active",
    } = serviceData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO additional_services 
         (service_name, service_type, description, price, unit, availability_hours, 
          advance_booking_required, max_quantity, images, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          service_name,
          service_type,
          description,
          price,
          unit,
          JSON.stringify(availability_hours),
          advance_booking_required,
          max_quantity,
          JSON.stringify(images),
          status,
        ]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating additional service: ${error.message}`);
    }
  }

  /**
   * Find service by ID
   */
  static async findById(service_id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM additional_services WHERE service_id = ?",
        [service_id]
      );

      if (rows.length === 0) return null;

      const serviceData = rows[0];
      // Parse JSON fields
      if (serviceData.availability_hours) {
        serviceData.availability_hours = JSON.parse(
          serviceData.availability_hours
        );
      }
      if (serviceData.images) {
        serviceData.images = JSON.parse(serviceData.images);
      }

      return new AdditionalService(serviceData);
    } catch (error) {
      throw new Error(`Error finding additional service: ${error.message}`);
    }
  }

  /**
   * Get all services with filters and pagination
   */
  static async getAllWithFilters(filters = {}) {
    try {
      const {
        service_type,
        status = "active",
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "desc",
      } = filters;

      let query = "SELECT * FROM additional_services WHERE 1=1";
      const queryParams = [];

      // Apply filters
      if (service_type) {
        query += " AND service_type = ?";
        queryParams.push(service_type);
      }

      if (status) {
        query += " AND status = ?";
        queryParams.push(status);
      }

      // Add sorting
      const validSortFields = [
        "service_name",
        "service_type",
        "price",
        "created_at",
      ];
      const sortField = validSortFields.includes(sortBy)
        ? sortBy
        : "created_at";
      const sortDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

      query += ` ORDER BY ${sortField} ${sortDirection}`;

      // Add pagination
      const offset = (page - 1) * limit;
      query += " LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      const [rows] = await pool.execute(query, queryParams);

      // Get total count
      let countQuery =
        "SELECT COUNT(*) as total FROM additional_services WHERE 1=1";
      const countParams = [];

      if (service_type) {
        countQuery += " AND service_type = ?";
        countParams.push(service_type);
      }

      if (status) {
        countQuery += " AND status = ?";
        countParams.push(status);
      }

      const [countRows] = await pool.execute(countQuery, countParams);
      const total = countRows[0].total;

      // Parse JSON fields for each service
      const services = rows.map((serviceData) => {
        if (serviceData.availability_hours) {
          serviceData.availability_hours = JSON.parse(
            serviceData.availability_hours
          );
        }
        if (serviceData.images) {
          serviceData.images = JSON.parse(serviceData.images);
        }
        return new AdditionalService(serviceData);
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
      throw new Error(`Error getting additional services: ${error.message}`);
    }
  }

  /**
   * Update service
   */
  static async update(service_id, updateData) {
    try {
      const fieldsToUpdate = [];
      const values = [];

      // Define updatable fields
      const updatableFields = [
        "service_name",
        "service_type",
        "description",
        "price",
        "unit",
        "availability_hours",
        "advance_booking_required",
        "max_quantity",
        "images",
        "status",
      ];

      updatableFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          fieldsToUpdate.push(`${field} = ?`);

          // Handle JSON fields
          if (field === "availability_hours" || field === "images") {
            values.push(JSON.stringify(updateData[field]));
          } else {
            values.push(updateData[field]);
          }
        }
      });

      if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields to update");
      }

      values.push(service_id);

      await pool.execute(
        `UPDATE additional_services SET ${fieldsToUpdate.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP WHERE service_id = ?`,
        values
      );

      return await this.findById(service_id);
    } catch (error) {
      throw new Error(`Error updating additional service: ${error.message}`);
    }
  }

  /**
   * Delete service
   */
  static async delete(service_id) {
    try {
      await pool.execute(
        "DELETE FROM additional_services WHERE service_id = ?",
        [service_id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error deleting additional service: ${error.message}`);
    }
  }

  /**
   * Get available services for a specific date/time
   */
  static async getAvailableServices(date, time) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM additional_services 
         WHERE status = 'active' 
         ORDER BY service_type, service_name`
      );

      // Parse JSON fields and filter by availability
      const services = rows.map((serviceData) => {
        if (serviceData.availability_hours) {
          serviceData.availability_hours = JSON.parse(
            serviceData.availability_hours
          );
        }
        if (serviceData.images) {
          serviceData.images = JSON.parse(serviceData.images);
        }
        return new AdditionalService(serviceData);
      });

      // Filter by time availability if time is provided
      if (time) {
        return services.filter((service) => {
          if (
            !service.availability_hours ||
            service.availability_hours.length === 0
          ) {
            return true; // Available 24/7 if no hours specified
          }

          // Check if current time falls within availability hours
          return service.availability_hours.some((timeRange) => {
            const [start, end] = timeRange.split("-");
            return time >= start && time <= end;
          });
        });
      }

      return services;
    } catch (error) {
      throw new Error(`Error getting available services: ${error.message}`);
    }
  }

  /**
   * Get service statistics
   */
  static async getStatistics(timeframe = "30d") {
    try {
      let dateFilter = "";

      switch (timeframe) {
        case "7d":
          dateFilter =
            "DATE(bs.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
          break;
        case "30d":
          dateFilter =
            "DATE(bs.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
          break;
        case "90d":
          dateFilter =
            "DATE(bs.created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)";
          break;
        case "1y":
          dateFilter =
            "DATE(bs.created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
          break;
        default:
          dateFilter =
            "DATE(bs.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      }

      // Get service usage statistics
      const [statsRows] = await pool.execute(`
        SELECT 
          s.service_id,
          s.service_name,
          s.service_type,
          COUNT(bs.booking_service_id) as booking_count,
          SUM(bs.total_price) as total_revenue,
          AVG(bs.total_price) as avg_price,
          SUM(bs.quantity) as total_quantity
        FROM additional_services s
        LEFT JOIN booking_services bs ON s.service_id = bs.service_id AND ${dateFilter}
        GROUP BY s.service_id, s.service_name, s.service_type
        ORDER BY total_revenue DESC
      `);

      // Get total statistics
      const [totalStats] = await pool.execute(`
        SELECT 
          COUNT(DISTINCT s.service_id) as total_services,
          COUNT(bs.booking_service_id) as total_bookings,
          SUM(bs.total_price) as total_revenue,
          COUNT(DISTINCT bs.booking_id) as unique_bookings
        FROM additional_services s
        LEFT JOIN booking_services bs ON s.service_id = bs.service_id AND ${dateFilter}
      `);

      // Get service type breakdown
      const [typeStats] = await pool.execute(`
        SELECT 
          s.service_type,
          COUNT(bs.booking_service_id) as booking_count,
          SUM(bs.total_price) as revenue
        FROM additional_services s
        LEFT JOIN booking_services bs ON s.service_id = bs.service_id AND ${dateFilter}
        GROUP BY s.service_type
        ORDER BY revenue DESC
      `);

      return {
        timeframe,
        total_statistics: totalStats[0],
        service_performance: statsRows,
        type_breakdown: typeStats,
      };
    } catch (error) {
      throw new Error(`Error getting service statistics: ${error.message}`);
    }
  }

  /**
   * Get services by type
   */
  static async getByType(service_type, status = "active") {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM additional_services WHERE service_type = ? AND status = ? ORDER BY service_name",
        [service_type, status]
      );

      return rows.map((serviceData) => {
        if (serviceData.availability_hours) {
          serviceData.availability_hours = JSON.parse(
            serviceData.availability_hours
          );
        }
        if (serviceData.images) {
          serviceData.images = JSON.parse(serviceData.images);
        }
        return new AdditionalService(serviceData);
      });
    } catch (error) {
      throw new Error(`Error getting services by type: ${error.message}`);
    }
  }

  toJSON() {
    return {
      service_id: this.service_id,
      service_name: this.service_name,
      service_type: this.service_type,
      description: this.description,
      price: this.price,
      unit: this.unit,
      availability_hours: this.availability_hours,
      advance_booking_required: this.advance_booking_required,
      max_quantity: this.max_quantity,
      images: this.images,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = AdditionalService;
