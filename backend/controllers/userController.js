// User Controller
// Handles user profile management and admin user operations

const { User } = require("../models");
const {
  success,
  error,
  created,
  notFound,
  paginated,
  forbidden,
} = require("../utils/responseHelper");
const { validationResult } = require("express-validator");
const { logger } = require("../utils/logger");

const userController = {
  // @desc    Get current user profile
  // @route   GET /api/users/profile
  // @access  Private
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return notFound(res, "User not found");
      }

      const userResponse = user.toJSON();
      return success(
        res,
        { user: userResponse },
        "Profile retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Update user profile
  // @route   PUT /api/users/profile
  // @access  Private
  updateProfile: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return notFound(res, "User not found");
      }

      const {
        full_name,
        phone,
        date_of_birth,
        nationality,
        id_number,
        address,
      } = req.body;

      // Update user profile
      const updatedUser = await user.update({
        full_name,
        phone,
        date_of_birth,
        nationality,
        id_number,
        address,
      });

      const userResponse = updatedUser.toJSON();
      return success(
        res,
        { user: userResponse },
        "Profile updated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Upload user avatar
  // @route   POST /api/users/profile/avatar
  // @access  Private
  uploadAvatar: async (req, res, next) => {
    try {
      if (!req.file) {
        return error(res, "No file uploaded", 400);
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return notFound(res, "User not found");
      }

      // Update avatar path
      const avatarPath = `/uploads/users/${req.file.filename}`;
      const updatedUser = await user.update({ avatar: avatarPath });

      const userResponse = updatedUser.toJSON();
      return success(
        res,
        { user: userResponse },
        "Avatar uploaded successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get all users (Admin only)
  // @route   GET /api/users
  // @access  Private/Admin
  getAllUsers: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const role = req.query.role;

      const result = await User.getAll(page, limit, role);
      // Convert User instances to JSON objects
      const userResponses = result.users.map((user) => user.toJSON());

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: userResponses,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.total,
          itemsPerPage: limit,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("❌ Error in getAllUsers:", err);
      next(err);
    }
  },

  // @desc    Get user by ID (Admin only)
  // @route   GET /api/users/:id
  // @access  Private/Admin
  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return notFound(res, "User not found");
      }

      const userResponse = user.toJSON();
      return success(
        res,
        { user: userResponse },
        "User retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Create new user (Admin only)
  // @route   POST /api/users
  // @access  Private/Admin
  createUser: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { email, password, full_name, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return error(res, "Email already registered", 409);
      }

      // Create new user
      const userData = {
        email,
        password,
        full_name,
        phone,
        role: role || "customer",
      };

      const user = await User.create(userData);
      if (!user) {
        return error(res, "Failed to create user", 500);
      }

      const userResponse = user.toJSON();
      return created(res, { user: userResponse }, "User created successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Update user (Admin only)
  // @route   PUT /api/users/:id
  // @access  Private/Admin
  updateUser: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { id } = req.params;
      const {
        full_name,
        email,
        phone,
        role,
        is_active,
        date_of_birth,
        nationality,
        id_number,
        address,
        department,
      } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return notFound(res, "User not found");
      }

      // Prevent admin from deactivating themselves
      if (req.user.id === parseInt(id) && is_active === false) {
        return forbidden(res, "Cannot deactivate your own account");
      }

      // Build update object with only provided fields
      const updateData = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
      if (nationality !== undefined) updateData.nationality = nationality;
      if (id_number !== undefined) updateData.id_number = id_number;
      if (address !== undefined) updateData.address = address;
      if (department !== undefined) updateData.department = department;

      // Update user
      const updatedUser = await user.update(updateData);

      const userResponse = updatedUser.toJSON();
      return success(res, { user: userResponse }, "User updated successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Delete user (Admin only)
  // @route   DELETE /api/users/:id
  // @access  Private/Admin
  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (req.user.id === parseInt(id)) {
        return forbidden(res, "Không thể xóa tài khoản của chính mình");
      }

      const user = await User.findById(id);
      if (!user) {
        return notFound(res, "Không tìm thấy người dùng");
      }

      // Soft delete user
      await user.delete();

      return success(res, null, "Xóa người dùng thành công");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get user statistics (Admin only)
  // @route   GET /api/users/stats
  // @access  Private/Admin
  getUserStats: async (req, res, next) => {
    try {
      const { executeQuery } = require("../config/database");

      const query = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
          COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
          COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_users,
          COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_users,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_today,
          COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as new_this_week,
          COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as new_this_month
        FROM users
      `;

      const result = await executeQuery(query);
      const stats = result[0];

      return success(res, { stats }, "User statistics retrieved successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Search users (Admin only)
  // @route   GET /api/users/search
  // @access  Private/Admin
  searchUsers: async (req, res, next) => {
    try {
      const { query, role, status } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      if (!query) {
        return error(res, "Search query is required", 400);
      }

      const { executeQuery } = require("../config/database");

      let searchQuery = `
        SELECT * FROM users 
        WHERE (full_name LIKE ? OR email LIKE ?)
      `;
      let countQuery = `
        SELECT COUNT(*) as total FROM users 
        WHERE (full_name LIKE ? OR email LIKE ?)
      `;

      const searchTerm = `%${query}%`;
      const queryParams = [searchTerm, searchTerm];

      // Apply filters
      if (role) {
        searchQuery += " AND role = ?";
        countQuery += " AND role = ?";
        queryParams.push(role);
      }

      if (status === "active") {
        searchQuery += " AND is_active = TRUE";
        countQuery += " AND is_active = TRUE";
      } else if (status === "inactive") {
        searchQuery += " AND is_active = FALSE";
        countQuery += " AND is_active = FALSE";
      }

      searchQuery += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      const paginationParams = [...queryParams, limit, offset];

      const [users, totalResult] = await Promise.all([
        executeQuery(searchQuery, paginationParams),
        executeQuery(countQuery, queryParams),
      ]);

      const userObjects = users.map((userData) => new User(userData));
      const userResponses = userObjects.map((user) => user.toJSON());

      return paginated(
        res,
        userResponses,
        {
          page,
          totalPages: Math.ceil(totalResult[0].total / limit),
          total: totalResult[0].total,
          limit,
        },
        "Search results retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get user bookings
  // @route   GET /api/users/:id/bookings
  // @access  Private (own bookings) / Admin
  getUserBookings: async (req, res, next) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Check if user is accessing their own bookings or is admin
      if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
        return forbidden(res, "Access denied");
      }

      const user = await User.findById(id);
      if (!user) {
        return notFound(res, "User not found");
      }

      const { Booking } = require("../models");
      const result = await Booking.findByUserId(id, page, limit);

      return paginated(
        res,
        result.bookings,
        {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        "User bookings retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Activate user (Admin only)
  // @route   PUT /api/users/:id/activate
  // @access  Private/Admin
  activateUser: async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return notFound(res, "User not found");
      }

      const updatedUser = await user.update({ is_active: true });
      const userResponse = updatedUser.toJSON();

      return success(
        res,
        { user: userResponse },
        "User activated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Deactivate user (Admin only)
  // @route   PUT /api/users/:id/deactivate
  // @access  Private/Admin
  deactivateUser: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Prevent admin from deactivating themselves
      if (req.user.id === parseInt(id)) {
        return forbidden(res, "Cannot deactivate your own account");
      }

      const user = await User.findById(id);
      if (!user) {
        return notFound(res, "User not found");
      }

      const updatedUser = await user.update({ is_active: false });
      const userResponse = updatedUser.toJSON();

      return success(
        res,
        { user: userResponse },
        "User deactivated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Delete user account (soft delete)
  // @route   DELETE /api/users/me
  // @access  Private
  deleteMyAccount: async (req, res, next) => {
    try {
      const userId = req.user.id;

      logger.info(`User ${userId} requested account deletion`);

      // Soft delete: set is_active to false
      const { executeQuery } = require("../config/database");
      await executeQuery(
        "UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?",
        [userId]
      );

      logger.info(`User ${userId} account deleted successfully`);

      return success(res, null, "Tài khoản đã được xóa thành công");
    } catch (err) {
      logger.error("Delete account error:", err);
      next(err);
    }
  },
};

// Merge placeholder methods
Object.assign(userController, require("./placeholders"));

module.exports = userController;
