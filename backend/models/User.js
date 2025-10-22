// User Model
// Enhanced implementation with full business logic

const { executeQuery, getConnection } = require("../config/database");
const bcrypt = require("bcryptjs");
const { logger } = require("../utils/logger");
const crypto = require("crypto");

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.password = userData.password;
    this.full_name = userData.full_name;
    this.phone = userData.phone;
    this.date_of_birth = userData.date_of_birth;
    this.nationality = userData.nationality;
    this.id_number = userData.id_number;
    this.address = userData.address;
    this.role = userData.role;
    this.avatar = userData.avatar;
    this.is_active = userData.is_active;
    this.department = userData.department;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Static methods for database operations

  // @desc    Find user by email
  static async findByEmail(email) {
    try {
      logger.debug("Finding user by email", { email });
      const query = `
        SELECT *, 
        DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth_formatted 
        FROM users WHERE email = ? AND is_active = TRUE
      `;
      const results = await executeQuery(query, [email]);

      if (results.length > 0) {
        logger.debug("User found by email", { userId: results[0].id });

        // Use formatted date to avoid timezone issues
        const userData = results[0];
        if (userData.date_of_birth_formatted) {
          userData.date_of_birth = userData.date_of_birth_formatted;
        }
        delete userData.date_of_birth_formatted;

        return new User(userData);
      }

      logger.debug("No user found with email", { email });
      return null;
    } catch (error) {
      logger.error("Error finding user by email", error, { email });
      throw error;
    }
  }

  // @desc    Find user by ID
  static async findById(id) {
    try {
      // TODO: Implement in Week 3
      const query = `
        SELECT *, 
        DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth_formatted 
        FROM users WHERE id = ? AND is_active = TRUE
      `;
      const results = await executeQuery(query, [id]);

      if (results.length === 0) {
        return null;
      }

      // Use formatted date to avoid timezone issues
      const userData = results[0];
      if (userData.date_of_birth_formatted) {
        userData.date_of_birth = userData.date_of_birth_formatted;
      }
      delete userData.date_of_birth_formatted;

      return new User(userData);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Create new user
  static async create(userData) {
    try {
      // TODO: Implement in Week 3
      // Hash password before saving
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const query = `
        INSERT INTO users (email, password, full_name, phone, date_of_birth, nationality, id_number, address, role, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        userData.email,
        hashedPassword,
        userData.full_name,
        userData.phone || null,
        userData.date_of_birth || null,
        userData.nationality || "Vietnamese",
        userData.id_number || null,
        userData.address || null,
        userData.role || "customer",
        userData.avatar || null,
      ];

      const result = await executeQuery(query, values);
      return await User.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get all users with pagination
  static async getAll(page = 1, limit = 10, role = null) {
    try {
      // TODO: Implement in Week 3
      const offset = (page - 1) * limit;

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit);
      const offsetInt = parseInt(offset);

      let query = "SELECT * FROM users WHERE is_active = TRUE";
      let countQuery =
        "SELECT COUNT(*) as total FROM users WHERE is_active = TRUE";
      const queryParams = [];

      if (role) {
        query += " AND role = ?";
        countQuery += " AND role = ?";
        queryParams.push(role);
      }

      // Use string interpolation for LIMIT/OFFSET to avoid MySQL prepared statement issues
      query += ` ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

      const [users, totalResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, role ? [role] : []),
      ]);

      return {
        users: users.map((user) => new User(user)),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // Instance methods

  // @desc    Update user data
  async update(updateData) {
    try {
      // TODO: Implement in Week 3
      const allowedFields = [
        "full_name",
        "email",
        "phone",
        "date_of_birth",
        "nationality",
        "id_number",
        "address",
        "avatar",
        "role",
        "is_active",
        "department",
      ];
      const updateFields = [];
      const values = [];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          // Convert empty strings to null for database
          const value = updateData[field] === "" ? null : updateData[field];
          values.push(value);
        }
      }

      if (updateFields.length === 0) {
        return this;
      }

      values.push(this.id);
      const query = `UPDATE users SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

      const result = await executeQuery(query, values);

      const updatedUser = await User.findById(this.id);

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Compare password
  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Soft delete user
  async delete() {
    try {
      // TODO: Implement in Week 3
      const query =
        "UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      await executeQuery(query, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get user data without password
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      full_name: this.full_name,
      phone: this.phone,
      date_of_birth: this.date_of_birth,
      nationality: this.nationality,
      id_number: this.id_number,
      address: this.address,
      role: this.role,
      avatar: this.avatar,
      is_active: this.is_active,
      department: this.department,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = User;
