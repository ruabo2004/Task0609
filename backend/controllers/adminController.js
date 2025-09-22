const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const { validationResult } = require("express-validator");
const { pool } = require("../config/database");
const bcrypt = require("bcrypt");
const config = require("../config/config");

/**
 * Get admin dashboard overview
 */
const getDashboard = async (req, res) => {
  try {
    // Get key metrics
    const [metrics] = await pool.execute(
      `SELECT 
        (SELECT COUNT(*) FROM customers WHERE role = 'customer' AND status = 'active') as total_customers,
        (SELECT COUNT(*) FROM employees WHERE status = 'active') as total_staff,
        (SELECT COUNT(*) FROM rooms) as total_rooms,
        (SELECT COUNT(*) FROM bookings WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())) as monthly_bookings,
        (SELECT SUM(total_amount) FROM bookings WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) AND payment_status = 'paid') as monthly_revenue,
        (SELECT COUNT(*) FROM bookings WHERE booking_status = 'pending') as pending_bookings,
        (SELECT COUNT(*) FROM rooms WHERE status = 'occupied') as occupied_rooms`
    );

    // Get recent bookings
    const [recentBookings] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.booking_code,
        b.booking_status,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        c.full_name as customer_name,
        r.room_number
       FROM bookings b
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN rooms r ON b.room_id = r.room_id
       ORDER BY b.created_at DESC
       LIMIT 10`
    );

    // Get revenue trend (last 7 days)
    const [revenueTrend] = await pool.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
       FROM bookings 
       WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
         AND payment_status = 'paid'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // Get room occupancy
    const [roomOccupancy] = await pool.execute(
      `SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rooms), 2) as percentage
       FROM rooms 
       GROUP BY status`
    );

    res.json({
      success: true,
      message: "Admin dashboard data retrieved successfully",
      data: {
        metrics: metrics[0],
        recent_bookings: recentBookings,
        revenue_trend: revenueTrend,
        room_occupancy: roomOccupancy,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get admin dashboard",
      error: error.message,
    });
  }
};

// ===============================================
// CUSTOMER MANAGEMENT
// ===============================================

/**
 * Get all customers with filters and pagination
 */
const getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role = null,
      status = null,
      search = null,
      sort_by = "created_at",
      sort_order = "desc",
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    if (role) {
      whereConditions.push("role = ?");
      queryParams.push(role);
    }

    if (status) {
      whereConditions.push("status = ?");
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push(
        "(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)"
      );
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";
    const orderClause = `ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;

    // Get total count
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      queryParams
    );

    // Get customers
    const [rows] = await pool.execute(
      `SELECT 
        customer_id,
        full_name,
        email,
        phone,
        role,
        status,
        email_verified,
        phone_verified,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM bookings WHERE customer_id = customers.customer_id) as total_bookings,
        (SELECT SUM(total_amount) FROM bookings WHERE customer_id = customers.customer_id AND payment_status = 'paid') as total_spent
       FROM customers 
       ${whereClause}
       ${orderClause}
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), offset]
    );

    const total = countRows[0].total;

    res.json({
      success: true,
      message: "Customers retrieved successfully",
      data: {
        customers: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get customers",
      error: error.message,
    });
  }
};

/**
 * Get customer details by ID
 */
const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Get customer's bookings
    const [bookings] = await pool.execute(
      `SELECT 
        b.*,
        r.room_number,
        rt.type_name as room_type
       FROM bookings b
       JOIN rooms r ON b.room_id = r.room_id
       JOIN room_types rt ON r.type_id = rt.type_id
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`,
      [customerId]
    );

    // Get customer's payments
    const [payments] = await pool.execute(
      `SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC`,
      [customerId]
    );

    res.json({
      success: true,
      message: "Customer details retrieved successfully",
      data: {
        customer: customer.toJSON(),
        bookings,
        payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get customer details",
      error: error.message,
    });
  }
};

/**
 * Update customer status
 */
const updateCustomerStatus = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, reason } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await pool.execute(
      `UPDATE customers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?`,
      [status, customerId]
    );

    // Log the action
    await pool.execute(
      `INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason, details)
       VALUES (?, 'status_change', 'customer', ?, ?, ?)`,
      [
        req.user.customer_id,
        customerId,
        reason || "Status updated by admin",
        JSON.stringify({ old_status: customer.status, new_status: status }),
      ]
    );

    res.json({
      success: true,
      message: "Customer status updated successfully",
      data: { customer_id: customerId, new_status: status },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update customer status",
      error: error.message,
    });
  }
};

// ===============================================
// EMPLOYEE MANAGEMENT
// ===============================================

/**
 * Get all employees
 */
const getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      position = null,
      department = null,
      status = "active",
      search = null,
    } = req.query;

    const result = await Employee.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      position,
      department,
      status,
      search,
    });

    res.json({
      success: true,
      message: "Employees retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get employees",
      error: error.message,
    });
  }
};

/**
 * Create new employee
 */
const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      full_name,
      email,
      phone,
      password,
      position,
      department,
      hire_date,
      salary,
      shift_type,
      permissions,
      supervisor_id,
    } = req.body;

    // Check if email already exists
    const existingCustomer = await Customer.findByEmail(email);
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create customer account first
    const hashedPassword = await bcrypt.hash(
      password,
      config.security.bcryptSaltRounds
    );

    const [customerResult] = await pool.execute(
      `INSERT INTO customers (full_name, email, phone, password_hash, role, status, email_verified)
       VALUES (?, ?, ?, ?, 'staff', 'active', TRUE)`,
      [full_name, email, phone, hashedPassword]
    );

    const customerId = customerResult.insertId;

    // Create employee record
    const employee = await Employee.create({
      customer_id: customerId,
      position,
      department,
      hire_date,
      salary,
      shift_type,
      permissions: permissions || [],
      supervisor_id,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: { employee: employee.toJSON() },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

/**
 * Update employee
 */
const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updateData = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const updatedEmployee = await employee.update(updateData);

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: { employee: updatedEmployee.toJSON() },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

/**
 * Delete employee
 */
const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { reason } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await employee.delete();

    // Log the action
    await pool.execute(
      `INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason)
       VALUES (?, 'delete', 'employee', ?, ?)`,
      [
        req.user.customer_id,
        employeeId,
        reason || "Employee terminated by admin",
      ]
    );

    res.json({
      success: true,
      message: "Employee deleted successfully",
      data: { employee_id: employeeId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};

// ===============================================
// ROOM MANAGEMENT
// ===============================================

/**
 * Create new room
 */
const createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      room_number,
      type_id,
      room_name,
      description,
      floor_number,
      room_size,
      price_per_night,
      weekend_price,
      holiday_price,
      amenities,
      images,
      view_type,
      bed_type,
      bathroom_type,
      wifi_available,
      ac_available,
      tv_available,
      fridge_available,
      balcony_available,
      smoking_allowed,
      pet_allowed,
    } = req.body;

    // Check if room number already exists
    const [existingRoom] = await pool.execute(
      "SELECT room_id FROM rooms WHERE room_number = ?",
      [room_number]
    );

    if (existingRoom.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Room number already exists",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO rooms (
        room_number, type_id, room_name, description, floor_number, room_size,
        price_per_night, weekend_price, holiday_price, amenities, images,
        view_type, bed_type, bathroom_type, wifi_available, ac_available,
        tv_available, fridge_available, balcony_available, smoking_allowed, pet_allowed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room_number,
        type_id,
        room_name,
        description,
        floor_number,
        room_size,
        price_per_night,
        weekend_price,
        holiday_price,
        amenities ? JSON.stringify(amenities) : null,
        images ? JSON.stringify(images) : null,
        view_type,
        bed_type,
        bathroom_type,
        wifi_available,
        ac_available,
        tv_available,
        fridge_available,
        balcony_available,
        smoking_allowed,
        pet_allowed,
      ]
    );

    const room = await Room.findByIdWithDetails(result.insertId);

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: { room },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: error.message,
    });
  }
};

/**
 * Update room
 */
const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const updateData = req.body;

    const room = await Room.findByIdWithDetails(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const setClause = [];
    const queryParams = [];

    // Build dynamic update query
    const allowedFields = [
      "room_number",
      "type_id",
      "room_name",
      "description",
      "floor_number",
      "room_size",
      "price_per_night",
      "weekend_price",
      "holiday_price",
      "view_type",
      "bed_type",
      "bathroom_type",
      "wifi_available",
      "ac_available",
      "tv_available",
      "fridge_available",
      "balcony_available",
      "smoking_allowed",
      "pet_allowed",
      "status",
      "cleaning_status",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        setClause.push(`${field} = ?`);
        queryParams.push(updateData[field]);
      }
    });

    // Handle JSON fields
    if (updateData.amenities !== undefined) {
      setClause.push("amenities = ?");
      queryParams.push(JSON.stringify(updateData.amenities));
    }

    if (updateData.images !== undefined) {
      setClause.push("images = ?");
      queryParams.push(JSON.stringify(updateData.images));
    }

    if (setClause.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    queryParams.push(roomId);

    await pool.execute(
      `UPDATE rooms SET ${setClause.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?`,
      queryParams
    );

    const updatedRoom = await Room.findByIdWithDetails(roomId);

    res.json({
      success: true,
      message: "Room updated successfully",
      data: { room: updatedRoom },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: error.message,
    });
  }
};

/**
 * Delete room
 */
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { reason } = req.body;

    const room = await Room.findByIdWithDetails(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if room has active bookings
    const [activeBookings] = await pool.execute(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE room_id = ? AND booking_status IN ('confirmed', 'pending')`,
      [roomId]
    );

    if (activeBookings[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete room with active bookings",
      });
    }

    await pool.execute("DELETE FROM rooms WHERE room_id = ?", [roomId]);

    // Log the action
    await pool.execute(
      `INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason)
       VALUES (?, 'delete', 'room', ?, ?)`,
      [req.user.customer_id, roomId, reason || "Room deleted by admin"]
    );

    res.json({
      success: true,
      message: "Room deleted successfully",
      data: { room_id: roomId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createRoom,
  updateRoom,
  deleteRoom,
};
