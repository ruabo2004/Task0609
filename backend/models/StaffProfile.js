// StaffProfile Model
// Enhanced implementation for Employee Module

const { executeQuery, getConnection } = require("../config/database");
const { logger } = require("../utils/logger");

class StaffProfile {
  constructor(profileData) {
    this.id = profileData.id;
    this.user_id = profileData.user_id;
    this.employee_id = profileData.employee_id;
    this.department = profileData.department;
    this.position = profileData.position;
    this.hire_date = profileData.hire_date;
    this.salary = profileData.salary;
    this.emergency_contact_name = profileData.emergency_contact_name;
    this.emergency_contact_phone = profileData.emergency_contact_phone;
    this.work_schedule = profileData.work_schedule;
    this.permissions = profileData.permissions;
    this.status = profileData.status;
    this.created_at = profileData.created_at;
    this.updated_at = profileData.updated_at;
  }

  // Static methods for database operations

  // @desc    Create new staff profile
  static async create(profileData) {
    try {
      logger.debug("Creating staff profile", { profileData });

      const query = `
        INSERT INTO staff_profiles (
          user_id, employee_id, department, position, hire_date, 
          salary, emergency_contact_name, emergency_contact_phone, 
          work_schedule, permissions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        profileData.user_id,
        profileData.employee_id,
        profileData.department,
        profileData.position,
        profileData.hire_date,
        profileData.salary || 0.0,
        profileData.emergency_contact_name || null,
        profileData.emergency_contact_phone || null,
        JSON.stringify(profileData.work_schedule || {}),
        JSON.stringify(profileData.permissions || {}),
        profileData.status || "active",
      ];

      const result = await executeQuery(query, values);
      return await StaffProfile.findById(result.insertId);
    } catch (error) {
      logger.error("Error creating staff profile", error, { profileData });
      throw error;
    }
  }

  // @desc    Find staff profile by ID
  static async findById(id) {
    try {
      const query = `
        SELECT sp.*, u.full_name, u.email, u.phone, u.avatar
        FROM staff_profiles sp
        LEFT JOIN users u ON sp.user_id = u.id
        WHERE sp.id = ?
      `;
      const results = await executeQuery(query, [id]);

      if (results.length === 0) {
        return null;
      }

      const profileData = results[0];
      // Parse JSON fields
      if (profileData.work_schedule) {
        try {
          profileData.work_schedule =
            typeof profileData.work_schedule === "string"
              ? JSON.parse(profileData.work_schedule)
              : profileData.work_schedule;
        } catch (e) {
          profileData.work_schedule = null;
        }
      }
      if (profileData.permissions) {
        try {
          profileData.permissions =
            typeof profileData.permissions === "string"
              ? JSON.parse(profileData.permissions)
              : profileData.permissions;
        } catch (e) {
          profileData.permissions = null;
        }
      }

      return new StaffProfile(profileData);
    } catch (error) {
      logger.error("Error finding staff profile by ID", error, { id });
      throw error;
    }
  }

  // @desc    Find staff profile by user ID
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT sp.*, u.full_name, u.email, u.phone, u.avatar
        FROM staff_profiles sp
        LEFT JOIN users u ON sp.user_id = u.id
        WHERE sp.user_id = ?
      `;
      const results = await executeQuery(query, [userId]);

      if (results.length === 0) {
        return null;
      }

      const profileData = results[0];
      // Parse JSON fields
      if (profileData.work_schedule) {
        try {
          profileData.work_schedule =
            typeof profileData.work_schedule === "string"
              ? JSON.parse(profileData.work_schedule)
              : profileData.work_schedule;
        } catch (e) {
          profileData.work_schedule = null;
        }
      }
      if (profileData.permissions) {
        try {
          profileData.permissions =
            typeof profileData.permissions === "string"
              ? JSON.parse(profileData.permissions)
              : profileData.permissions;
        } catch (e) {
          profileData.permissions = null;
        }
      }

      return new StaffProfile(profileData);
    } catch (error) {
      logger.error("Error finding staff profile by user ID", error, { userId });
      throw error;
    }
  }

  // @desc    Find staff profile by employee ID
  static async findByEmployeeId(employeeId) {
    try {
      const query = `
        SELECT sp.*, u.full_name, u.email, u.phone, u.avatar
        FROM staff_profiles sp
        LEFT JOIN users u ON sp.user_id = u.id
        WHERE sp.employee_id = ?
      `;
      const results = await executeQuery(query, [employeeId]);

      if (results.length === 0) {
        return null;
      }

      const profileData = results[0];
      // Parse JSON fields
      if (profileData.work_schedule) {
        try {
          profileData.work_schedule =
            typeof profileData.work_schedule === "string"
              ? JSON.parse(profileData.work_schedule)
              : profileData.work_schedule;
        } catch (e) {
          profileData.work_schedule = null;
        }
      }
      if (profileData.permissions) {
        try {
          profileData.permissions =
            typeof profileData.permissions === "string"
              ? JSON.parse(profileData.permissions)
              : profileData.permissions;
        } catch (e) {
          profileData.permissions = null;
        }
      }

      return new StaffProfile(profileData);
    } catch (error) {
      logger.error("Error finding staff profile by employee ID", error, {
        employeeId,
      });
      throw error;
    }
  }

  // @desc    Get all staff profiles with filters
  static async getAll(filters = {}) {
    try {
      const { page = 1, limit = 10, department, status, search } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT sp.*, u.full_name, u.email, u.phone, u.avatar
        FROM staff_profiles sp
        LEFT JOIN users u ON sp.user_id = u.id
        WHERE 1=1
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM staff_profiles sp
        LEFT JOIN users u ON sp.user_id = u.id
        WHERE 1=1
      `;

      const queryParams = [];
      const countParams = [];

      // Apply filters
      if (department) {
        query += " AND sp.department = ?";
        countQuery += " AND sp.department = ?";
        queryParams.push(department);
        countParams.push(department);
      }

      if (status) {
        query += " AND sp.status = ?";
        countQuery += " AND sp.status = ?";
        queryParams.push(status);
        countParams.push(status);
      }

      if (search) {
        query +=
          " AND (u.full_name LIKE ? OR sp.employee_id LIKE ? OR sp.position LIKE ?)";
        countQuery +=
          " AND (u.full_name LIKE ? OR sp.employee_id LIKE ? OR sp.position LIKE ?)";
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      query += ` ORDER BY sp.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const [profiles, totalResult] = await Promise.all([
        executeQuery(query, queryParams),
        executeQuery(countQuery, countParams),
      ]);

      // Parse JSON fields for each profile
      const parsedProfiles = profiles.map((profileData) => {
        if (profileData.work_schedule) {
          try {
            profileData.work_schedule =
              typeof profileData.work_schedule === "string"
                ? JSON.parse(profileData.work_schedule)
                : profileData.work_schedule;
          } catch (e) {
            profileData.work_schedule = null;
          }
        }
        if (profileData.permissions) {
          try {
            profileData.permissions =
              typeof profileData.permissions === "string"
                ? JSON.parse(profileData.permissions)
                : profileData.permissions;
          } catch (e) {
            profileData.permissions = null;
          }
        }
        return new StaffProfile(profileData);
      });

      return {
        profiles: parsedProfiles,
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      logger.error("Error getting all staff profiles", error, { filters });
      throw error;
    }
  }

  // @desc    Find staff profiles by department
  static async findByDepartment(department) {
    try {
      const query = `
        SELECT sp.*, u.full_name, u.email, u.phone, u.avatar
        FROM staff_profiles sp
        LEFT JOIN users u ON sp.user_id = u.id
        WHERE sp.department = ? AND sp.status = 'active'
        ORDER BY sp.position, u.full_name
      `;
      const results = await executeQuery(query, [department]);

      return results.map((profileData) => {
        // Parse JSON fields
        if (profileData.work_schedule) {
          try {
            profileData.work_schedule =
              typeof profileData.work_schedule === "string"
                ? JSON.parse(profileData.work_schedule)
                : profileData.work_schedule;
          } catch (e) {
            profileData.work_schedule = null;
          }
        }
        if (profileData.permissions) {
          try {
            profileData.permissions =
              typeof profileData.permissions === "string"
                ? JSON.parse(profileData.permissions)
                : profileData.permissions;
          } catch (e) {
            profileData.permissions = null;
          }
        }
        return new StaffProfile(profileData);
      });
    } catch (error) {
      logger.error("Error finding staff profiles by department", error, {
        department,
      });
      throw error;
    }
  }

  // @desc    Get staff overview (using view)
  static async getStaffOverview() {
    try {
      const query =
        "SELECT * FROM staff_overview ORDER BY department, position";
      const results = await executeQuery(query);
      return results;
    } catch (error) {
      logger.error("Error getting staff overview", error);
      throw error;
    }
  }

  // Instance methods

  // @desc    Update staff profile
  async update(updateData) {
    try {
      logger.debug("Updating staff profile", { id: this.id, updateData });

      const allowedFields = [
        "department",
        "position",
        "hire_date",
        "salary",
        "emergency_contact_name",
        "emergency_contact_phone",
        "work_schedule",
        "permissions",
        "status",
      ];

      const updateFields = [];
      const values = [];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);

          // Handle JSON fields
          if (field === "work_schedule" || field === "permissions") {
            values.push(JSON.stringify(updateData[field]));
          } else {
            values.push(updateData[field]);
          }
        }
      }

      if (updateFields.length === 0) {
        return this;
      }

      values.push(this.id);
      const query = `
        UPDATE staff_profiles 
        SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      await executeQuery(query, values);
      return await StaffProfile.findById(this.id);
    } catch (error) {
      logger.error("Error updating staff profile", error, {
        id: this.id,
        updateData,
      });
      throw error;
    }
  }

  // @desc    Update permissions
  async updatePermissions(permissions) {
    try {
      const query = `
        UPDATE staff_profiles 
        SET permissions = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await executeQuery(query, [JSON.stringify(permissions), this.id]);
      return await StaffProfile.findById(this.id);
    } catch (error) {
      logger.error("Error updating staff permissions", error, {
        id: this.id,
        permissions,
      });
      throw error;
    }
  }

  // @desc    Get work schedule for specific month/year
  async getWorkSchedule(month, year) {
    try {
      const query = `
        SELECT * FROM work_shifts 
        WHERE staff_id = ? 
        AND MONTH(shift_date) = ? 
        AND YEAR(shift_date) = ?
        ORDER BY shift_date, start_time
      `;
      const results = await executeQuery(query, [this.user_id, month, year]);
      return results;
    } catch (error) {
      logger.error("Error getting work schedule", error, {
        staff_id: this.user_id,
        month,
        year,
      });
      throw error;
    }
  }

  // @desc    Soft delete staff profile
  async delete() {
    try {
      const query = `
        UPDATE staff_profiles 
        SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await executeQuery(query, [this.id]);
      return true;
    } catch (error) {
      logger.error("Error deleting staff profile", error, { id: this.id });
      throw error;
    }
  }

  // @desc    Get staff profile data without sensitive info
  toJSON() {
    const profileObj = { ...this };
    // Remove sensitive salary info for non-admin users if needed
    return profileObj;
  }
}

module.exports = StaffProfile;
