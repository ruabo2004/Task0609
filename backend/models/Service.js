// Service Model
// Will be implemented in Week 4

const { executeQuery } = require("../config/database");

class Service {
  constructor(serviceData) {
    this.id = serviceData.id;
    this.name = serviceData.name;
    this.description = serviceData.description;
    this.price = serviceData.price;
    this.category = serviceData.category;
    this.is_active = serviceData.is_active;
    this.created_at = serviceData.created_at;
    this.updated_at = serviceData.updated_at;
  }

  // Static methods for database operations

  // @desc    Get all services with filters
  static async getAll(filters = {}) {
    try {
      let query = "SELECT * FROM services WHERE 1=1";
      const queryParams = [];

      // Apply filters
      if (filters.category) {
        query += " AND category = ?";
        queryParams.push(filters.category);
      }

      if (filters.is_active !== undefined) {
        query += " AND is_active = ?";
        queryParams.push(filters.is_active);
      }

      if (filters.min_price) {
        query += " AND price >= ?";
        queryParams.push(filters.min_price);
      }

      if (filters.max_price) {
        query += " AND price <= ?";
        queryParams.push(filters.max_price);
      }

      if (filters.search) {
        query += " AND (name LIKE ? OR description LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      query += " ORDER BY category ASC, name ASC";

      const results = await executeQuery(query, queryParams);
      return results.map((service) => new Service(service));
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get services by category
  static async getByCategory(category) {
    try {
      const query =
        "SELECT * FROM services WHERE category = ? AND is_active = TRUE ORDER BY name ASC";
      const results = await executeQuery(query, [category]);
      return results.map((service) => new Service(service));
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get active services only
  static async getActive() {
    try {
      const query =
        "SELECT * FROM services WHERE is_active = TRUE ORDER BY category ASC, name ASC";
      const results = await executeQuery(query);
      return results.map((service) => new Service(service));
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find service by ID
  static async findById(id) {
    try {
      const query = "SELECT * FROM services WHERE id = ?";
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new Service(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find service by name
  static async findByName(name) {
    try {
      const query = "SELECT * FROM services WHERE name = ?";
      const results = await executeQuery(query, [name]);
      return results.length > 0 ? new Service(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Create new service
  static async create(serviceData) {
    try {
      const query = `
        INSERT INTO services (name, description, price, category, is_active)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        serviceData.name,
        serviceData.description || null,
        serviceData.price,
        serviceData.category,
        serviceData.is_active !== undefined ? serviceData.is_active : true,
      ];

      const result = await executeQuery(query, values);
      return await Service.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get service categories
  static async getCategories() {
    try {
      const query = `
        SELECT category, COUNT(*) as service_count
        FROM services
        WHERE is_active = TRUE
        GROUP BY category
        ORDER BY category ASC
      `;
      const results = await executeQuery(query);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get service statistics
  static async getStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_services,
          COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_services,
          COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_services,
          AVG(price) as average_price,
          MIN(price) as min_price,
          MAX(price) as max_price
        FROM services
      `;
      const results = await executeQuery(query);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get popular services (most booked)
  static async getPopularServices(limit = 10) {
    try {
      const query = `
        SELECT s.*, COUNT(bs.id) as booking_count
        FROM services s
        LEFT JOIN booking_services bs ON s.id = bs.service_id
        WHERE s.is_active = TRUE
        GROUP BY s.id
        ORDER BY booking_count DESC, s.name ASC
        LIMIT ?
      `;
      const results = await executeQuery(query, [limit]);
      return results.map((service) => new Service(service));
    } catch (error) {
      throw error;
    }
  }

  // Instance methods

  // @desc    Update service
  async update(updateData) {
    try {
      const allowedFields = [
        "name",
        "description",
        "price",
        "category",
        "is_active",
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
      const query = `UPDATE services SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

      await executeQuery(query, values);
      return await Service.findById(this.id);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Delete service
  async delete() {
    try {
      // Check if service is used in any bookings
      const usageQuery =
        "SELECT COUNT(*) as count FROM booking_services WHERE service_id = ?";
      const usageResult = await executeQuery(usageQuery, [this.id]);

      if (usageResult[0].count > 0) {
        // Soft delete by deactivating
        const query =
          "UPDATE services SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        await executeQuery(query, [this.id]);
        this.is_active = false;
        return { deleted: false, deactivated: true };
      } else {
        // Hard delete if not used
        const query = "DELETE FROM services WHERE id = ?";
        await executeQuery(query, [this.id]);
        return { deleted: true, deactivated: false };
      }
    } catch (error) {
      throw error;
    }
  }

  // @desc    Activate service
  async activate() {
    try {
      const query =
        "UPDATE services SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      await executeQuery(query, [this.id]);
      this.is_active = true;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Deactivate service
  async deactivate() {
    try {
      const query =
        "UPDATE services SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      await executeQuery(query, [this.id]);
      this.is_active = false;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get booking count for this service
  async getBookingCount() {
    try {
      const query =
        "SELECT COUNT(*) as count FROM booking_services WHERE service_id = ?";
      const results = await executeQuery(query, [this.id]);
      return results[0].count;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get revenue generated by this service
  async getRevenue(startDate = null, endDate = null) {
    try {
      let query = `
        SELECT SUM(bs.quantity * bs.price) as total_revenue
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        WHERE bs.service_id = ? AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      `;
      const params = [this.id];

      if (startDate && endDate) {
        query += " AND DATE(b.created_at) BETWEEN ? AND ?";
        params.push(startDate, endDate);
      }

      const results = await executeQuery(query, params);
      return results[0].total_revenue || 0;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Check if service is active
  isActive() {
    return this.is_active === true || this.is_active === 1;
  }

  // @desc    Get formatted price
  getFormattedPrice() {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(this.price);
  }

  // @desc    Get category display name
  getCategoryName() {
    const categoryNames = {
      food: "Ăn uống",
      tour: "Tour du lịch",
      transport: "Vận chuyển",
      other: "Khác",
    };
    return categoryNames[this.category] || this.category;
  }

  // @desc    Get service icon based on category
  getCategoryIcon() {
    const categoryIcons = {
      food: "🍽️",
      tour: "🗺️",
      transport: "🚗",
      other: "🛎️",
    };
    return categoryIcons[this.category] || "📋";
  }

  // @desc    Get JSON representation
  toJSON() {
    return {
      ...this,
      formatted_price: this.getFormattedPrice(),
      category_name: this.getCategoryName(),
      category_icon: this.getCategoryIcon(),
      is_active_status: this.isActive(),
    };
  }
}

module.exports = Service;
