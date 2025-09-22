const { pool } = require('../config/database');

class PaymentMethod {
  constructor(data) {
    this.method_id = data.method_id;
    this.customer_id = data.customer_id;
    this.method_type = data.method_type;
    this.provider = data.provider;
    this.account_info = data.account_info;
    this.is_default = data.is_default;
    this.is_active = data.is_active;
    this.last_used_at = data.last_used_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(methodData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        customerId,
        methodType,
        provider,
        accountInfo,
        isDefault = false
      } = methodData;

      if (isDefault) {
        await connection.execute(
          'UPDATE payment_methods SET is_default = FALSE WHERE customer_id = ?',
          [customerId]
        );
      }

      const encryptedInfo = JSON.stringify(accountInfo);

      const [result] = await connection.execute(
        `INSERT INTO payment_methods 
         (customer_id, method_type, provider, account_info, is_default, is_active)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [customerId, methodType, provider, encryptedInfo, isDefault]
      );

      await connection.commit();

      const [rows] = await connection.execute(
        'SELECT * FROM payment_methods WHERE method_id = ?',
        [result.insertId]
      );

      return new PaymentMethod(rows[0]);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating payment method: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findByCustomerId(customerId, activeOnly = true) {
    try {
      let query = 'SELECT * FROM payment_methods WHERE customer_id = ?';
      const params = [customerId];

      if (activeOnly) {
        query += ' AND is_active = TRUE';
      }

      query += ' ORDER BY is_default DESC, last_used_at DESC';

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new PaymentMethod(row));
    } catch (error) {
      throw new Error(`Error fetching payment methods: ${error.message}`);
    }
  }

  static async findById(methodId, customerId = null) {
    try {
      let query = 'SELECT * FROM payment_methods WHERE method_id = ?';
      const params = [methodId];

      if (customerId) {
        query += ' AND customer_id = ?';
        params.push(customerId);
      }

      const [rows] = await pool.execute(query, params);
      return rows.length > 0 ? new PaymentMethod(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error fetching payment method: ${error.message}`);
    }
  }

  static async setAsDefault(methodId, customerId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      await connection.execute(
        'UPDATE payment_methods SET is_default = FALSE WHERE customer_id = ?',
        [customerId]
      );

      const [result] = await connection.execute(
        'UPDATE payment_methods SET is_default = TRUE WHERE method_id = ? AND customer_id = ?',
        [methodId, customerId]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error setting default payment method: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async updateLastUsed(methodId) {
    try {
      const [result] = await pool.execute(
        'UPDATE payment_methods SET last_used_at = NOW() WHERE method_id = ?',
        [methodId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating last used: ${error.message}`);
    }
  }

  static async delete(methodId, customerId) {
    try {
      const [result] = await pool.execute(
        'UPDATE payment_methods SET is_active = FALSE WHERE method_id = ? AND customer_id = ?',
        [methodId, customerId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting payment method: ${error.message}`);
    }
  }

  getAccountInfo() {
    return this.account_info ? JSON.parse(this.account_info) : null;
  }

  getMaskedAccountInfo() {
    const info = this.getAccountInfo();
    if (!info) return null;

    const masked = { ...info };
    
    if (masked.cardNumber) {
      masked.cardNumber = '**** **** **** ' + masked.cardNumber.slice(-4);
    }
    
    if (masked.accountNumber) {
      masked.accountNumber = '*'.repeat(masked.accountNumber.length - 4) + masked.accountNumber.slice(-4);
    }

    if (masked.phone) {
      masked.phone = masked.phone.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
    }

    delete masked.cvv;
    delete masked.pin;
    delete masked.password;

    return masked;
  }

  toJSON() {
    return {
      method_id: this.method_id,
      customer_id: this.customer_id,
      method_type: this.method_type,
      provider: this.provider,
      account_info: this.getMaskedAccountInfo(),
      is_default: this.is_default,
      is_active: this.is_active,
      last_used_at: this.last_used_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PaymentMethod;


