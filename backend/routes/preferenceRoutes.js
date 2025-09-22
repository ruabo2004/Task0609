const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticateToken);

const preferenceValidation = {
  updatePreference: [
    body('value')
      .notEmpty()
      .withMessage('Value is required'),
    body('type')
      .optional()
      .isIn(['string', 'number', 'boolean', 'json', 'object'])
      .withMessage('Type must be one of: string, number, boolean, json, object'),
    body('category')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be between 1 and 50 characters'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean')
  ],

  bulkUpdate: [
    body('preferences')
      .isArray({ min: 1 })
      .withMessage('Preferences must be a non-empty array'),
    body('preferences.*.key')
      .notEmpty()
      .withMessage('Each preference must have a key'),
    body('preferences.*.value')
      .exists()
      .withMessage('Each preference must have a value'),
    body('preferences.*.type')
      .optional()
      .isIn(['string', 'number', 'boolean', 'json', 'object'])
      .withMessage('Type must be one of: string, number, boolean, json, object'),
    body('preferences.*.category')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be between 1 and 50 characters')
  ],

  importPreferences: [
    body('preferences')
      .isObject()
      .withMessage('Preferences must be an object'),
    body('overwrite')
      .optional()
      .isBoolean()
      .withMessage('Overwrite must be a boolean')
  ]
};

router.get('/', preferenceController.getUserPreferences);

router.get('/defaults', preferenceController.getDefaultPreferences);

router.post('/initialize', preferenceController.initializePreferences);

router.get('/export', preferenceController.exportPreferences);

router.post('/import', preferenceValidation.importPreferences, preferenceController.importPreferences);

router.post('/bulk', preferenceValidation.bulkUpdate, preferenceController.bulkUpdatePreferences);

router.delete('/reset', preferenceController.resetPreferences);

router.get('/:key', preferenceController.getPreferenceByKey);

router.put('/:key', preferenceValidation.updatePreference, preferenceController.updatePreference);

router.delete('/:key', preferenceController.deletePreference);

module.exports = router;


