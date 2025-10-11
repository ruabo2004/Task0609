// Admin Customer Management Controller
// Handles customer data management and analytics

const { executeQuery } = require("../../config/database");
const { success } = require("../../utils/responseHelper");
const { ErrorFactory } = require("../../utils/errors");

const customerController = {
  // @desc    Get all customers with filters
  // @route   GET /api/admin/customers
  // @access  Private/Admin
  getAll: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        loyalty_level,
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
        "email",
        "full_name",
        "loyalty_level",
        "loyalty_points",
        "created_at",
      ];
      const sortBy = validSortFields.includes(sort_by) ? sort_by : "created_at";
      const orderBy = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Build WHERE clause
      let whereConditions = ["role = 'customer'"];
      let params = [];

      if (loyalty_level && loyalty_level !== "all") {
        whereConditions.push("loyalty_level = ?");
        params.push(loyalty_level);
      }

      if (status && status !== "all") {
        const isActive = status === "active" ? 1 : 0;
        whereConditions.push("is_active = ?");
        params.push(isActive);
      }

      if (search) {
        whereConditions.push(
          "(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)"
        );
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      const whereClause = "WHERE " + whereConditions.join(" AND ");

      // Get customers with booking statistics
      const customersQuery = `
        SELECT 
          u.id,
          u.email,
          u.full_name,
          u.phone,
          u.role,
          u.is_active,
          u.created_at,
          u.updated_at,
          COUNT(DISTINCT b.id) as total_bookings,
          COALESCE(SUM(b.total_amount), 0) as total_spent,
          MAX(b.created_at) as last_booking_date
        FROM users u
        LEFT JOIN bookings b ON u.id = b.user_id
        ${whereClause}
        GROUP BY u.id
        ORDER BY u.${sortBy} ${orderBy}
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;

      // Count total
      const countQuery = `
        SELECT COUNT(DISTINCT u.id) as total
        FROM users u
        ${whereClause}
      `;

      const [customers, totalResult] = await Promise.all([
        executeQuery(customersQuery, params),
        executeQuery(countQuery, params),
      ]);

      // Remove password from response
      const sanitizedCustomers = customers.map((c) => {
        const { password, ...customerWithoutPassword } = c;
        return {
          ...customerWithoutPassword,
          total_bookings: parseInt(customerWithoutPassword.total_bookings),
          total_spent: parseFloat(customerWithoutPassword.total_spent),
        };
      });

      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return success(res, {
        customers: sanitizedCustomers,
        pagination: {
          page: parseInt(page),
          limit: limitInt,
          total,
          totalPages,
        },
      });
    } catch (err) {
      console.error("Error in getAll customers:", err);
      next(err);
    }
  },

  // @desc    Get customer by ID with full details
  // @route   GET /api/admin/customers/:id
  // @access  Private/Admin
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Get customer basic info
      const customerQuery = `
        SELECT *
        FROM users
        WHERE id = ? AND role = 'customer'
      `;

      // Get booking statistics
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT b.id) as total_bookings,
          COALESCE(SUM(b.total_amount), 0) as total_spent,
          COALESCE(AVG(b.total_amount), 0) as avg_booking_value,
          MAX(b.created_at) as last_booking_date,
          COALESCE(SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_bookings
        FROM bookings b
        WHERE b.user_id = ?
      `;

      // Get recent bookings
      const bookingsQuery = `
        SELECT 
          b.id,
          b.check_in_date,
          b.check_out_date,
          b.status,
          b.total_amount,
          r.room_number,
          r.room_type
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
        LIMIT 10
      `;

      const [customerResult, statsResult, bookingsResult] = await Promise.all([
        executeQuery(customerQuery, [id]),
        executeQuery(statsQuery, [id]),
        executeQuery(bookingsQuery, [id]),
      ]);

      if (customerResult.length === 0) {
        throw ErrorFactory.notFound("Customer not found");
      }

      const { password, ...customerData } = customerResult[0];
      const stats = statsResult[0] || {};

      return success(res, {
        ...customerData,
        statistics: {
          total_bookings: parseInt(stats.total_bookings || 0),
          total_spent: parseFloat(stats.total_spent || 0),
          avg_booking_value: parseFloat(stats.avg_booking_value || 0),
          last_booking_date: stats.last_booking_date,
          cancelled_bookings: parseInt(stats.cancelled_bookings || 0),
        },
        recent_bookings: bookingsResult,
      });
    } catch (err) {
      console.error("Error in getById customer:", err);
      next(err);
    }
  },

  // @desc    Update customer information
  // @route   PUT /api/admin/customers/:id
  // @access  Private/Admin
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { full_name, phone, is_active } = req.body;

      // Check if customer exists
      const checkQuery =
        "SELECT id FROM users WHERE id = ? AND role = 'customer'";
      const existing = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        throw ErrorFactory.notFound("Customer not found");
      }

      // Build update query
      const updates = [];
      const params = [];

      if (full_name !== undefined) {
        updates.push("full_name = ?");
        params.push(full_name);
      }
      if (phone !== undefined) {
        updates.push("phone = ?");
        params.push(phone);
      }
      if (is_active !== undefined) {
        updates.push("is_active = ?");
        params.push(is_active ? 1 : 0);
      }

      if (updates.length === 0) {
        throw ErrorFactory.validation("No fields to update");
      }

      updates.push("updated_at = NOW()");
      params.push(id);

      const updateQuery = `
        UPDATE users 
        SET ${updates.join(", ")}
        WHERE id = ?
      `;

      await executeQuery(updateQuery, params);

      // Get updated customer (without password)
      const updatedCustomer = await executeQuery(
        "SELECT id, email, full_name, phone, role, is_active, created_at, updated_at FROM users WHERE id = ?",
        [id]
      );

      return success(res, updatedCustomer[0], "Customer updated successfully");
    } catch (err) {
      console.error("Error in update customer:", err);
      next(err);
    }
  },
};

module.exports = customerController;
