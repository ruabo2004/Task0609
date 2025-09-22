const { pool } = require('../config/database');

class UserPreference {
  constructor(data) {
    this.preference_id = data.preference_id;
    this.customer_id = data.customer_id;
    this.preference_key = data.preference_key;
    this.preference_value = data.preference_value;
    this.preference_type = data.preference_type;
    this.category = data.category;
    this.is_public = data.is_public;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findByCustomerId(customerId, category = null) {
    try {
      let query = `
        SELECT * FROM customer_preferences 
        WHERE customer_id = ?
      `;
      const params = [customerId];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY category, preference_key';

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new UserPreference(row));
    } catch (error) {
      throw new Error(`Error fetching user preferences: ${error.message}`);
    }
  }

  static async findByKey(customerId, preferenceKey) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM customer_preferences WHERE customer_id = ? AND preference_key = ?',
        [customerId, preferenceKey]
      );
      return rows.length > 0 ? new UserPreference(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error fetching preference: ${error.message}`);
    }
  }

  static async upsert(customerId, preferenceKey, preferenceValue, options = {}) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        preferenceType = 'string',
        category = 'general',
        isPublic = false
      } = options;

      const valueToStore = typeof preferenceValue === 'object' 
        ? JSON.stringify(preferenceValue) 
        : String(preferenceValue);

      const [result] = await connection.execute(
        `INSERT INTO customer_preferences 
         (customer_id, preference_key, preference_value, preference_type, category, is_public)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         preference_value = VALUES(preference_value),
         preference_type = VALUES(preference_type),
         category = VALUES(category),
         is_public = VALUES(is_public),
         updated_at = CURRENT_TIMESTAMP`,
        [customerId, preferenceKey, valueToStore, preferenceType, category, isPublic]
      );

      await connection.commit();

      const preference = await UserPreference.findByKey(customerId, preferenceKey);
      return preference;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error upserting preference: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async bulkUpsert(customerId, preferences) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const results = [];
      
      for (const pref of preferences) {
        const {
          key,
          value,
          type = 'string',
          category = 'general',
          isPublic = false
        } = pref;

        const valueToStore = typeof value === 'object' 
          ? JSON.stringify(value) 
          : String(value);

        await connection.execute(
          `INSERT INTO customer_preferences 
           (customer_id, preference_key, preference_value, preference_type, category, is_public)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           preference_value = VALUES(preference_value),
           preference_type = VALUES(preference_type),
           category = VALUES(category),
           is_public = VALUES(is_public),
           updated_at = CURRENT_TIMESTAMP`,
          [customerId, key, valueToStore, type, category, isPublic]
        );

        results.push({ key, value, type, category, isPublic });
      }

      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error bulk upserting preferences: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async delete(customerId, preferenceKey) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM customer_preferences WHERE customer_id = ? AND preference_key = ?',
        [customerId, preferenceKey]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting preference: ${error.message}`);
    }
  }

  static async deleteByCategory(customerId, category) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM customer_preferences WHERE customer_id = ? AND category = ?',
        [customerId, category]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error deleting preferences by category: ${error.message}`);
    }
  }

  static async getDefaultPreferences() {
    return {
      theme: {
        mode: 'light',
        primaryColor: '#4f9d9d',
        fontSize: 'medium',
        compactMode: false
      },
      language: {
        locale: 'vi',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        currency: 'VND'
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        booking: true,
        payment: true
      },
      privacy: {
        profileVisibility: 'private',
        showEmail: false,
        showPhone: false,
        allowLocationTracking: false
      },
      booking: {
        defaultGuests: 2,
        preferredCheckInTime: '14:00',
        preferredCheckOutTime: '11:00',
        autoSaveFormData: true
      },
      display: {
        itemsPerPage: 12,
        viewMode: 'grid',
        showImages: true,
        autoPlayVideos: false
      }
    };
  }

  static async initializeDefaultPreferences(customerId) {
    try {
      const defaultPrefs = await UserPreference.getDefaultPreferences();
      const preferences = [];

      for (const [category, settings] of Object.entries(defaultPrefs)) {
        for (const [key, value] of Object.entries(settings)) {
          preferences.push({
            key: `${category}.${key}`,
            value,
            type: typeof value,
            category,
            isPublic: false
          });
        }
      }

      return await UserPreference.bulkUpsert(customerId, preferences);
    } catch (error) {
      throw new Error(`Error initializing default preferences: ${error.message}`);
    }
  }

  getValue() {
    if (this.preference_type === 'json' || this.preference_type === 'object') {
      try {
        return JSON.parse(this.preference_value);
      } catch {
        return this.preference_value;
      }
    }
    
    if (this.preference_type === 'boolean') {
      return this.preference_value === 'true' || this.preference_value === '1';
    }
    
    if (this.preference_type === 'number') {
      return Number(this.preference_value);
    }
    
    return this.preference_value;
  }

  static async getFormattedPreferences(customerId) {
    try {
      const preferences = await UserPreference.findByCustomerId(customerId);
      const formatted = {};

      preferences.forEach(pref => {
        const keys = pref.preference_key.split('.');
        let current = formatted;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = pref.getValue();
      });

      const defaultPrefs = await UserPreference.getDefaultPreferences();
      return { ...defaultPrefs, ...formatted };
    } catch (error) {
      throw new Error(`Error formatting preferences: ${error.message}`);
    }
  }
}

module.exports = UserPreference;


