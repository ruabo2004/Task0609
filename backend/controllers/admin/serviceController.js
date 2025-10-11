// Admin Service Management Controller
// Handles CRUD operations for services

const { executeQuery } = require("../../config/database");
const { success } = require("../../utils/responseHelper");
const { ErrorFactory } = require("../../utils/errors");

const serviceController = {
  // @desc    Get all services with filters
  // @route   GET /api/admin/services
  // @access  Private/Admin
  getAll: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        status,
        search,
        sort_by = "created_at",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const limitInt = parseInt(limit);
      const offsetInt = parseInt(offset);

      // Validate sort_by
      const validSortFields = [
        "id",
        "name",
        "price",
        "category",
        "is_available",
        "created_at",
      ];
      const sortBy = validSortFields.includes(sort_by) ? sort_by : "created_at";
      const orderBy = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Build WHERE clause
      let whereConditions = [];
      let params = [];

      if (category && category !== "all") {
        whereConditions.push("category = ?");
        params.push(category);
      }

      if (status !== undefined && status !== "all") {
        const isActive = status === "available" || status === "active" ? 1 : 0;
        whereConditions.push("is_active = ?");
        params.push(isActive);
      }

      if (search) {
        whereConditions.push("(name LIKE ? OR description LIKE ?)");
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam);
      }

      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";

      // Get services with usage statistics
      const servicesQuery = `
        SELECT 
          s.*,
          COUNT(DISTINCT bs.id) as usage_count,
          COALESCE(SUM(bs.total_price), 0) as total_revenue
        FROM services s
        LEFT JOIN booking_services bs ON s.id = bs.service_id
        ${whereClause}
        GROUP BY s.id
        ORDER BY s.${sortBy} ${orderBy}
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;

      // Count total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM services s
        ${whereClause}
      `;

      const [services, totalResult] = await Promise.all([
        executeQuery(servicesQuery, params),
        executeQuery(countQuery, params),
      ]);

      const sanitizedServices = services.map((s) => ({
        ...s,
        usage_count: parseInt(s.usage_count),
        total_revenue: parseFloat(s.total_revenue),
      }));

      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return success(res, {
        services: sanitizedServices,
        pagination: {
          page: parseInt(page),
          limit: limitInt,
          total,
          totalPages,
        },
      });
    } catch (err) {
      console.error("Error in getAll services:", err);
      next(err);
    }
  },

  // @desc    Get service by ID
  // @route   GET /api/admin/services/:id
  // @access  Private/Admin
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Get service details with statistics
      const serviceQuery = `
        SELECT 
          s.*,
          COUNT(DISTINCT bs.id) as usage_count,
          COALESCE(SUM(bs.total_price), 0) as total_revenue,
          COALESCE(AVG(bs.quantity), 0) as avg_quantity
        FROM services s
        LEFT JOIN booking_services bs ON s.id = bs.service_id
        WHERE s.id = ?
        GROUP BY s.id
      `;

      const result = await executeQuery(serviceQuery, [id]);

      if (result.length === 0) {
        throw ErrorFactory.notFound("Service not found");
      }

      const service = result[0];

      return success(res, {
        ...service,
        usage_count: parseInt(service.usage_count),
        total_revenue: parseFloat(service.total_revenue),
        avg_quantity: parseFloat(service.avg_quantity).toFixed(2),
      });
    } catch (err) {
      console.error("Error in getById service:", err);
      next(err);
    }
  },

  // @desc    Create new service
  // @route   POST /api/admin/services
  // @access  Private/Admin
  create: async (req, res, next) => {
    try {
      const {
        name,
        description,
        price,
        category,
        is_available = 1,
        is_active = 1,
      } = req.body;

      // Validate required fields
      if (!name || !price) {
        throw ErrorFactory.validation("Name and price are required");
      }

      // Check if service name already exists
      const checkQuery = "SELECT id FROM services WHERE name = ?";
      const existing = await executeQuery(checkQuery, [name]);

      if (existing.length > 0) {
        throw ErrorFactory.validation("Service name already exists");
      }

      // Validate and normalize fields
      const priceNumber = parseFloat(price);
      if (Number.isNaN(priceNumber)) {
        throw ErrorFactory.validation("Price must be a number");
      }

      // Coerce category to allowed enum values or default to 'other'
      const allowedCategories = new Set([
        "food",
        "transport",
        "entertainment",
        "spa",
        "other",
      ]);
      const normalizedCategory = allowedCategories.has(
        (category || "").toString().trim()
      )
        ? category
        : "other";

      // Use is_active (database column name) - support both is_available and is_active from frontend
      const activeStatus = (
        is_available !== undefined ? is_available : is_active
      )
        ? 1
        : 0;

      // Insert service
      const insertQuery = `
        INSERT INTO services (name, description, price, category, is_active)
        VALUES (?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        name,
        description || null,
        priceNumber,
        normalizedCategory,
        activeStatus,
      ]);

      // Get created service
      const createdService = await executeQuery(
        "SELECT * FROM services WHERE id = ?",
        [result.insertId]
      );

      return success(
        res,
        createdService[0],
        "Service created successfully",
        201
      );
    } catch (err) {
      console.error("Error in create service:", err);
      next(err);
    }
  },

  // @desc    Update service
  // @route   PUT /api/admin/services/:id
  // @access  Private/Admin
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, price, category, is_available, is_active } =
        req.body;

      // Check if service exists
      const checkQuery = "SELECT id FROM services WHERE id = ?";
      const existing = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        throw ErrorFactory.notFound("Service not found");
      }

      // If name is being changed, check for duplicates
      if (name) {
        const duplicateQuery =
          "SELECT id FROM services WHERE name = ? AND id != ?";
        const duplicate = await executeQuery(duplicateQuery, [name, id]);

        if (duplicate.length > 0) {
          throw ErrorFactory.validation("Service name already exists");
        }
      }

      // Build update query
      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push("name = ?");
        params.push(name);
      }
      if (description !== undefined) {
        updates.push("description = ?");
        params.push(description);
      }
      if (price !== undefined) {
        updates.push("price = ?");
        params.push(price);
      }
      if (category !== undefined) {
        updates.push("category = ?");
        params.push(category);
      }
      // Support both is_available and is_active from frontend
      const activeStatus =
        is_available !== undefined ? is_available : is_active;
      if (activeStatus !== undefined) {
        updates.push("is_active = ?");
        params.push(activeStatus ? 1 : 0);
      }

      if (updates.length === 0) {
        throw ErrorFactory.validation("No fields to update");
      }

      updates.push("updated_at = NOW()");
      params.push(id);

      const updateQuery = `
        UPDATE services 
        SET ${updates.join(", ")}
        WHERE id = ?
      `;

      await executeQuery(updateQuery, params);

      // Get updated service
      const updatedService = await executeQuery(
        "SELECT * FROM services WHERE id = ?",
        [id]
      );

      return success(res, updatedService[0], "Service updated successfully");
    } catch (err) {
      console.error("Error in update service:", err);
      next(err);
    }
  },

  // @desc    Delete service
  // @route   DELETE /api/admin/services/:id
  // @access  Private/Admin
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if service exists
      const checkQuery = "SELECT id, name FROM services WHERE id = ?";
      const existing = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        throw ErrorFactory.notFound("Service not found");
      }

      // Check for active bookings using this service
      const activeBookingsQuery = `
        SELECT COUNT(*) as count 
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        WHERE bs.service_id = ? 
        AND b.status IN ('confirmed', 'checked_in', 'pending')
      `;
      const activeBookings = await executeQuery(activeBookingsQuery, [id]);

      if (activeBookings[0].count > 0) {
        throw ErrorFactory.validation(
          "Cannot delete service with active bookings. Set as unavailable instead."
        );
      }

      // Delete service
      await executeQuery("DELETE FROM services WHERE id = ?", [id]);

      return success(res, null, "Service deleted successfully");
    } catch (err) {
      console.error("Error in delete service:", err);
      next(err);
    }
  },
};

module.exports = serviceController;
