const UserPreference = require('../models/UserPreference');
const { validationResult } = require('express-validator');

const getUserPreferences = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { category, formatted = 'true' } = req.query;

    let preferences;
    
    if (formatted === 'true') {
      preferences = await UserPreference.getFormattedPreferences(customerId);
    } else {
      preferences = await UserPreference.findByCustomerId(customerId, category);
    }

    res.json({
      success: true,
      message: 'User preferences retrieved successfully',
      data: {
        preferences,
        count: Array.isArray(preferences) ? preferences.length : Object.keys(preferences).length
      }
    });
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user preferences',
      error: error.message
    });
  }
};

const getPreferenceByKey = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { key } = req.params;

    const preference = await UserPreference.findByKey(customerId, key);

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: 'Preference not found'
      });
    }

    res.json({
      success: true,
      message: 'Preference retrieved successfully',
      data: {
        preference: {
          key: preference.preference_key,
          value: preference.getValue(),
          type: preference.preference_type,
          category: preference.category,
          isPublic: preference.is_public,
          updatedAt: preference.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get preference by key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve preference',
      error: error.message
    });
  }
};

const updatePreference = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const customerId = req.customer.customer_id;
    const { key } = req.params;
    const { value, type, category, isPublic } = req.body;

    const preference = await UserPreference.upsert(customerId, key, value, {
      preferenceType: type,
      category,
      isPublic
    });

    res.json({
      success: true,
      message: 'Preference updated successfully',
      data: {
        preference: {
          key: preference.preference_key,
          value: preference.getValue(),
          type: preference.preference_type,
          category: preference.category,
          isPublic: preference.is_public,
          updatedAt: preference.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update preference error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preference',
      error: error.message
    });
  }
};

const bulkUpdatePreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const customerId = req.customer.customer_id;
    const { preferences } = req.body;

    if (!Array.isArray(preferences) || preferences.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Preferences array is required and cannot be empty'
      });
    }

    const results = await UserPreference.bulkUpsert(customerId, preferences);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        updatedCount: results.length,
        preferences: results
      }
    });
  } catch (error) {
    console.error('Bulk update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

const deletePreference = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { key } = req.params;

    const deleted = await UserPreference.delete(customerId, key);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Preference not found'
      });
    }

    res.json({
      success: true,
      message: 'Preference deleted successfully'
    });
  } catch (error) {
    console.error('Delete preference error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete preference',
      error: error.message
    });
  }
};

const resetPreferences = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { category } = req.query;

    if (category) {
      const deletedCount = await UserPreference.deleteByCategory(customerId, category);
      
      res.json({
        success: true,
        message: `Preferences in category '${category}' reset successfully`,
        data: {
          deletedCount
        }
      });
    } else {
      const defaultPrefs = await UserPreference.initializeDefaultPreferences(customerId);
      
      res.json({
        success: true,
        message: 'All preferences reset to defaults',
        data: {
          preferences: defaultPrefs
        }
      });
    }
  } catch (error) {
    console.error('Reset preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset preferences',
      error: error.message
    });
  }
};

const getDefaultPreferences = async (req, res) => {
  try {
    const defaultPreferences = await UserPreference.getDefaultPreferences();

    res.json({
      success: true,
      message: 'Default preferences retrieved successfully',
      data: {
        preferences: defaultPreferences
      }
    });
  } catch (error) {
    console.error('Get default preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve default preferences',
      error: error.message
    });
  }
};

const initializePreferences = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;

    const existingPrefs = await UserPreference.findByCustomerId(customerId);
    
    if (existingPrefs.length > 0) {
      return res.json({
        success: true,
        message: 'Preferences already initialized',
        data: {
          preferencesCount: existingPrefs.length
        }
      });
    }

    const initializedPrefs = await UserPreference.initializeDefaultPreferences(customerId);

    res.status(201).json({
      success: true,
      message: 'Preferences initialized successfully',
      data: {
        preferences: initializedPrefs,
        count: initializedPrefs.length
      }
    });
  } catch (error) {
    console.error('Initialize preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize preferences',
      error: error.message
    });
  }
};

const exportPreferences = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { format = 'json' } = req.query;

    const preferences = await UserPreference.getFormattedPreferences(customerId);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="preferences.json"');
      res.json(preferences);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format. Only JSON is supported.'
      });
    }
  } catch (error) {
    console.error('Export preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export preferences',
      error: error.message
    });
  }
};

const importPreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const customerId = req.customer.customer_id;
    const { preferences, overwrite = false } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Preferences object is required'
      });
    }

    if (overwrite) {
      const categories = Object.keys(preferences);
      for (const category of categories) {
        await UserPreference.deleteByCategory(customerId, category);
      }
    }

    const preferencesToImport = [];
    for (const [category, settings] of Object.entries(preferences)) {
      for (const [key, value] of Object.entries(settings)) {
        preferencesToImport.push({
          key: `${category}.${key}`,
          value,
          type: typeof value,
          category,
          isPublic: false
        });
      }
    }

    const results = await UserPreference.bulkUpsert(customerId, preferencesToImport);

    res.json({
      success: true,
      message: 'Preferences imported successfully',
      data: {
        importedCount: results.length,
        overwrite
      }
    });
  } catch (error) {
    console.error('Import preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import preferences',
      error: error.message
    });
  }
};

module.exports = {
  getUserPreferences,
  getPreferenceByKey,
  updatePreference,
  bulkUpdatePreferences,
  deletePreference,
  resetPreferences,
  getDefaultPreferences,
  initializePreferences,
  exportPreferences,
  importPreferences
};


