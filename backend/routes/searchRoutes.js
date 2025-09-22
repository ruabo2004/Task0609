const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { query, body } = require('express-validator');

const searchValidation = {
  searchRooms: [
    query('q')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Search query must not exceed 200 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort_by')
      .optional()
      .isIn(['relevance', 'price', 'rating', 'distance', 'created_at'])
      .withMessage('Sort by must be one of: relevance, price, rating, distance, created_at'),
    query('sort_order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('min_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min price must be a positive number'),
    query('max_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max price must be a positive number'),
    query('guests')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Guests must be between 1 and 20')
  ],

  searchSuggestions: [
    query('q')
      .notEmpty()
      .isLength({ min: 1, max: 100 })
      .withMessage('Query must be between 1 and 100 characters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Limit must be between 1 and 20')
  ],

  logClick: [
    body('log_id')
      .isInt({ min: 1 })
      .withMessage('Log ID must be a positive integer'),
    body('result_id')
      .isInt({ min: 1 })
      .withMessage('Result ID must be a positive integer'),
    body('position')
      .isInt({ min: 1 })
      .withMessage('Position must be a positive integer')
  ],

  advancedSearch: [
    body('search_criteria')
      .isObject()
      .withMessage('Search criteria must be an object'),
    body('search_criteria.query')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Search query must not exceed 200 characters'),
    body('search_criteria.filters')
      .optional()
      .isObject()
      .withMessage('Filters must be an object'),
    body('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    body('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

router.get('/rooms', optionalAuth, searchValidation.searchRooms, searchController.searchRooms);

router.get('/suggestions', searchValidation.searchSuggestions, searchController.getSearchSuggestions);

router.get('/popular', searchController.getPopularSearches);

router.get('/popular-filters', searchController.getPopularFilters);

router.post('/click', optionalAuth, searchValidation.logClick, searchController.logSearchClick);

router.post('/advanced', optionalAuth, searchValidation.advancedSearch, searchController.advancedSearch);

router.get('/history', authenticateToken, searchController.getSearchHistory);

router.delete('/history', authenticateToken, searchController.clearSearchHistory);

router.get('/analytics', authenticateToken, searchController.getSearchAnalytics);

module.exports = router;


