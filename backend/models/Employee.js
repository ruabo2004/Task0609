const { pool } = require("../config/database");

class Employee {
  constructor(employeeData) {
    this.employee_id = employeeData.employee_id;
    this.customer_id = employeeData.customer_id;
    this.employee_code = employeeData.employee_code;
    this.position = employeeData.position;
    this.department = employeeData.department;
    this.hire_date = employeeData.hire_date;
    this.salary = employeeData.salary;
    this.shift_type = employeeData.shift_type;
    this.permissions = employeeData.permissions;
    this.supervisor_id = employeeData.supervisor_id;
    this.status = employeeData.status;
    this.created_at = employeeData.created_at;
    this.updated_at = employeeData.updated_at;
  }

  /**
   * Find employee by ID
   */
  static async findById(employeeId) {
    try {
      const [rows] = await pool.execute(
        `SELECT e.*, c.full_name, c.email, c.phone, c.role
         FROM employees e 
         JOIN customers c ON e.customer_id = c.customer_id 
         WHERE e.employee_id = ? AND e.status = 'active'`,
        [employeeId]
      );

      if (rows.length === 0) return null;

      const employeeData = rows[0];
      // Parse JSON fields
      if (employeeData.permissions) {
        employeeData.permissions = JSON.parse(employeeData.permissions);
      }

      return new Employee(employeeData);
    } catch (error) {
      throw new Error(`Failed to find employee: ${error.message}`);
    }
  }

  /**
   * Find employee by customer ID
   */
  static async findByCustomerId(customerId) {
    try {
      const [rows] = await pool.execute(
        `SELECT e.*, c.full_name, c.email, c.phone, c.role
         FROM employees e 
         JOIN customers c ON e.customer_id = c.customer_id 
         WHERE e.customer_id = ? AND e.status = 'active'`,
        [customerId]
      );

      if (rows.length === 0) return null;

      const employeeData = rows[0];
      if (employeeData.permissions) {
        employeeData.permissions = JSON.parse(employeeData.permissions);
      }

      return new Employee(employeeData);
    } catch (error) {
      throw new Error(
        `Failed to find employee by customer ID: ${error.message}`
      );
    }
  }

  /**
   * Find employee by employee code
   */
  static async findByEmployeeCode(employeeCode) {
    try {
      const [rows] = await pool.execute(
        `SELECT e.*, c.full_name, c.email, c.phone, c.role
         FROM employees e 
         JOIN customers c ON e.customer_id = c.customer_id 
         WHERE e.employee_code = ? AND e.status = 'active'`,
        [employeeCode]
      );

      if (rows.length === 0) return null;

      const employeeData = rows[0];
      if (employeeData.permissions) {
        employeeData.permissions = JSON.parse(employeeData.permissions);
      }

      return new Employee(employeeData);
    } catch (error) {
      throw new Error(`Failed to find employee by code: ${error.message}`);
    }
  }

  /**
   * Get all employees with pagination and filters
   */
  static async getAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        position = null,
        department = null,
        status = "active",
        search = null,
      } = options;

      const offset = (page - 1) * limit;
      let whereConditions = [];
      let queryParams = [];

      // Build WHERE conditions
      if (status) {
        whereConditions.push("e.status = ?");
        queryParams.push(status);
      }

      if (position) {
        whereConditions.push("e.position = ?");
        queryParams.push(position);
      }

      if (department) {
        whereConditions.push("e.department = ?");
        queryParams.push(department);
      }

      if (search) {
        whereConditions.push(
          "(c.full_name LIKE ? OR e.employee_code LIKE ? OR c.email LIKE ?)"
        );
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count
      const [countRows] = await pool.execute(
        `SELECT COUNT(*) as total 
         FROM employees e 
         JOIN customers c ON e.customer_id = c.customer_id 
         ${whereClause}`,
        queryParams
      );

      const total = countRows[0].total;

      // Get employees
      const [rows] = await pool.execute(
        `SELECT e.*, c.full_name, c.email, c.phone, c.role,
                s.full_name as supervisor_name
         FROM employees e 
         JOIN customers c ON e.customer_id = c.customer_id 
         LEFT JOIN employees se ON e.supervisor_id = se.employee_id
         LEFT JOIN customers s ON se.customer_id = s.customer_id
         ${whereClause}
         ORDER BY e.created_at DESC
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      const employees = rows.map((employeeData) => {
        if (employeeData.permissions) {
          employeeData.permissions = JSON.parse(employeeData.permissions);
        }
        return new Employee(employeeData);
      });

      return {
        employees,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get employees: ${error.message}`);
    }
  }

  /**
   * Create new employee
   */
  static async create(employeeData) {
    try {
      const {
        customer_id,
        position,
        department = "Operations",
        hire_date,
        salary,
        shift_type = "flexible",
        permissions = [],
        supervisor_id = null,
      } = employeeData;

      // Generate employee code if not provided
      const employee_code = await this.generateEmployeeCode();

      const [result] = await pool.execute(
        `INSERT INTO employees 
         (customer_id, employee_code, position, department, hire_date, salary, shift_type, permissions, supervisor_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customer_id,
          employee_code,
          position,
          department,
          hire_date,
          salary,
          shift_type,
          JSON.stringify(permissions),
          supervisor_id,
        ]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  }

  /**
   * Update employee
   */
  async update(updateData) {
    try {
      const {
        position,
        department,
        salary,
        shift_type,
        permissions,
        supervisor_id,
        status,
      } = updateData;

      const setClause = [];
      const queryParams = [];

      if (position !== undefined) {
        setClause.push("position = ?");
        queryParams.push(position);
      }

      if (department !== undefined) {
        setClause.push("department = ?");
        queryParams.push(department);
      }

      if (salary !== undefined) {
        setClause.push("salary = ?");
        queryParams.push(salary);
      }

      if (shift_type !== undefined) {
        setClause.push("shift_type = ?");
        queryParams.push(shift_type);
      }

      if (permissions !== undefined) {
        setClause.push("permissions = ?");
        queryParams.push(JSON.stringify(permissions));
      }

      if (supervisor_id !== undefined) {
        setClause.push("supervisor_id = ?");
        queryParams.push(supervisor_id);
      }

      if (status !== undefined) {
        setClause.push("status = ?");
        queryParams.push(status);
      }

      if (setClause.length === 0) {
        throw new Error("No fields to update");
      }

      queryParams.push(this.employee_id);

      await pool.execute(
        `UPDATE employees SET ${setClause.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP WHERE employee_id = ?`,
        queryParams
      );

      return await Employee.findById(this.employee_id);
    } catch (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  }

  /**
   * Delete employee (soft delete)
   */
  async delete() {
    try {
      await pool.execute(
        `UPDATE employees SET status = 'terminated', updated_at = CURRENT_TIMESTAMP WHERE employee_id = ?`,
        [this.employee_id]
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  }

  /**
   * Generate unique employee code
   */
  static async generateEmployeeCode() {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) as count FROM employees"
      );

      const count = rows[0].count + 1;
      return `EMP${count.toString().padStart(3, "0")}`;
    } catch (error) {
      throw new Error(`Failed to generate employee code: ${error.message}`);
    }
  }

  /**
   * Get employee permissions
   */
  getPermissions() {
    return this.permissions || [];
  }

  /**
   * Check if employee has specific permission
   */
  hasPermission(permission) {
    const permissions = this.getPermissions();
    return permissions.includes(permission) || permissions.includes("*");
  }

  /**
   * Get employee's work shifts
   */
  async getWorkShifts(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM work_shifts 
         WHERE employee_id = ? AND shift_date BETWEEN ? AND ?
         ORDER BY shift_date ASC, start_time ASC`,
        [this.employee_id, startDate, endDate]
      );

      return rows.map((shift) => {
        if (shift.tasks) {
          shift.tasks = JSON.parse(shift.tasks);
        }
        return shift;
      });
    } catch (error) {
      throw new Error(`Failed to get work shifts: ${error.message}`);
    }
  }

  /**
   * Get employee's daily reports
   */
  async getDailyReports(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT dr.*, approver.full_name as approver_name
         FROM daily_reports dr
         LEFT JOIN employees ae ON dr.approved_by = ae.employee_id
         LEFT JOIN customers approver ON ae.customer_id = approver.customer_id
         WHERE dr.employee_id = ? AND dr.report_date BETWEEN ? AND ?
         ORDER BY dr.report_date DESC`,
        [this.employee_id, startDate, endDate]
      );

      return rows.map((report) => {
        // Parse JSON fields
        if (report.room_issues)
          report.room_issues = JSON.parse(report.room_issues);
        if (report.guest_feedback)
          report.guest_feedback = JSON.parse(report.guest_feedback);
        if (report.maintenance_requests)
          report.maintenance_requests = JSON.parse(report.maintenance_requests);
        if (report.revenue_summary)
          report.revenue_summary = JSON.parse(report.revenue_summary);
        return report;
      });
    } catch (error) {
      throw new Error(`Failed to get daily reports: ${error.message}`);
    }
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      employee_id: this.employee_id,
      customer_id: this.customer_id,
      employee_code: this.employee_code,
      position: this.position,
      department: this.department,
      hire_date: this.hire_date,
      salary: this.salary,
      shift_type: this.shift_type,
      permissions: this.permissions,
      supervisor_id: this.supervisor_id,
      status: this.status,
      full_name: this.full_name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      supervisor_name: this.supervisor_name,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Employee;
