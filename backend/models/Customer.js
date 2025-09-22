const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

class Customer {
  constructor(data) {
    this.customer_id = data.customer_id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.phone = data.phone;
    this.address = data.address;
    this.date_of_birth = data.date_of_birth;
    this.gender = data.gender;
    this.id_number = data.id_number;
    this.profile_image = data.profile_image;
    this.email_verified = data.email_verified;
    this.phone_verified = data.phone_verified;
    this.status = data.status;
    this.role = data.role;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(customerData) {
    const { full_name, email, password, phone, address, date_of_birth } =
      customerData;

    try {
      const password_hash = await bcrypt.hash(password, 12);

      const [result] = await pool.execute(
        `INSERT INTO customers (full_name, email, password_hash, phone, address, date_of_birth) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [full_name, email, password_hash, phone, address, date_of_birth]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
  }

  static async findById(customer_id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM customers WHERE customer_id = ? AND status = ?",
        [customer_id, "active"]
      );

      return rows.length > 0 ? new Customer(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding customer: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM customers WHERE email = ? AND status = ?",
        [email, "active"]
      );

      return rows.length > 0 ? new Customer(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding customer by email: ${error.message}`);
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async update(updateData) {
    const { full_name, phone, address, date_of_birth } = updateData;

    try {
      await pool.execute(
        `UPDATE customers 
         SET full_name = ?, phone = ?, address = ?, date_of_birth = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE customer_id = ?`,
        [full_name, phone, address, date_of_birth, this.customer_id]
      );

      return await Customer.findById(this.customer_id);
    } catch (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const isValidPassword = await Customer.verifyPassword(
        currentPassword,
        this.password_hash
      );
      if (!isValidPassword) {
        throw new Error("Current password is incorrect");
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      await pool.execute(
        "UPDATE customers SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?",
        [newPasswordHash, this.customer_id]
      );

      return true;
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  async getBookingHistory() {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, r.room_number, rt.type_name, rt.base_price
         FROM bookings b
         JOIN rooms r ON b.room_id = r.room_id
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE b.customer_id = ?
         ORDER BY b.booking_date DESC`,
        [this.customer_id]
      );

      return rows;
    } catch (error) {
      throw new Error(`Error getting booking history: ${error.message}`);
    }
  }

  async getReviews() {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, b.booking_id, rm.room_number
         FROM reviews r
         JOIN bookings b ON r.booking_id = b.booking_id
         JOIN rooms rm ON b.room_id = rm.room_id
         WHERE r.customer_id = ?
         ORDER BY r.created_at DESC`,
        [this.customer_id]
      );

      return rows;
    } catch (error) {
      throw new Error(`Error getting reviews: ${error.message}`);
    }
  }

  async deactivate() {
    try {
      await pool.execute(
        "UPDATE customers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?",
        ["inactive", this.customer_id]
      );

      return true;
    } catch (error) {
      throw new Error(`Error deactivating customer: ${error.message}`);
    }
  }

  toJSON() {
    const { password_hash, ...customer } = this;
    return customer;
  }
}

module.exports = Customer;
