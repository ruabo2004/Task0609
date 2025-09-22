const Room = require('../models/Room');
const SearchLog = require('../models/SearchLog');
const { validationResult } = require('express-validator');

const searchRooms = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      q: query = '',
      page = 1,
      limit = 12,
      sort_by = 'relevance',
      sort_order = 'desc',
      min_price,
      max_price,
      room_type,
      location,
      amenities,
      check_in_date,
      check_out_date,
      guests,
      available_only = 'true'
    } = req.query;

    const customerId = req.customer?.customer_id || null;
    const sessionId = req.sessionID || null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const filters = {
      min_price: min_price ? parseFloat(min_price) : null,
      max_price: max_price ? parseFloat(max_price) : null,
      room_type: room_type || null,
      location: location || null,
      amenities: amenities ? amenities.split(',').map(a => a.trim()) : null,
      check_in_date: check_in_date || null,
      check_out_date: check_out_date || null,
      guests: guests ? parseInt(guests) : null,
      available_only: available_only === 'true'
    };

    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });

    const searchParams = {
      query: query.trim(),
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort_by,
      sortOrder: sort_order,
      filters
    };

    const results = await Room.searchRooms(searchParams);
    const searchTime = Date.now() - startTime;

    const searchLogData = {
      customerId,
      searchQuery: query.trim() || null,
      searchType: 'rooms',
      filtersApplied: Object.keys(filters).length > 0 ? filters : null,
      resultsCount: results.total,
      pageNumber: parseInt(page),
      sortBy: sort_by,
      sortOrder: sort_order,
      sessionId,
      ipAddress,
      userAgent,
      searchTimeMs: searchTime
    };

    const searchLog = await SearchLog.create(searchLogData);

    let suggestions = [];
    if (results.total === 0 && query.trim()) {
      suggestions = await SearchLog.getSearchSuggestions(query.trim(), 5);
    }

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        rooms: results.rooms,
        pagination: results.pagination,
        filters: {
          applied: filters,
          available: {
            room_types: results.available_filters?.room_types || [],
            price_range: results.available_filters?.price_range || {},
            amenities: results.available_filters?.amenities || [],
            locations: results.available_filters?.locations || []
          }
        },
        search: {
          query: query.trim(),
          total_results: results.total,
          search_time_ms: searchTime,
          log_id: searchLog.log_id
        },
        suggestions: suggestions.length > 0 ? suggestions : undefined
      }
    });

  } catch (error) {
    console.error('Search rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        message: 'Query too short for suggestions',
        data: {
          suggestions: []
        }
      });
    }

    const suggestions = await SearchLog.getSearchSuggestions(query.trim(), parseInt(limit));

    res.json({
      success: true,
      message: 'Search suggestions retrieved successfully',
      data: {
        query: query.trim(),
        suggestions
      }
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions',
      error: error.message
    });
  }
};

const getPopularSearches = async (req, res) => {
  try {
    const { timeframe = '30d', limit = 10 } = req.query;

    const popularSearches = await SearchLog.getPopularSearches(parseInt(limit), timeframe);

    res.json({
      success: true,
      message: 'Popular searches retrieved successfully',
      data: {
        timeframe,
        searches: popularSearches
      }
    });

  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular searches',
      error: error.message
    });
  }
};

const logSearchClick = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { log_id, result_id, position } = req.body;

    const updated = await SearchLog.updateClickData(
      parseInt(log_id),
      parseInt(result_id),
      parseInt(position)
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Search log not found'
      });
    }

    res.json({
      success: true,
      message: 'Search click logged successfully'
    });

  } catch (error) {
    console.error('Log search click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log search click',
      error: error.message
    });
  }
};

const getSearchHistory = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const { limit = 20 } = req.query;

    const searchHistory = await SearchLog.getCustomerSearchHistory(
      customerId,
      parseInt(limit)
    );

    res.json({
      success: true,
      message: 'Search history retrieved successfully',
      data: {
        history: searchHistory,
        count: searchHistory.length
      }
    });

  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search history',
      error: error.message
    });
  }
};

const getSearchAnalytics = async (req, res) => {
  try {
    const { timeframe = '30d', customer_id } = req.query;
    const requestingCustomerId = req.customer?.customer_id;

    if (customer_id && customer_id !== requestingCustomerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - can only view your own analytics'
      });
    }

    const analytics = await SearchLog.getSearchAnalytics(
      customer_id ? parseInt(customer_id) : null,
      timeframe
    );

    res.json({
      success: true,
      message: 'Search analytics retrieved successfully',
      data: {
        timeframe,
        analytics
      }
    });

  } catch (error) {
    console.error('Get search analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search analytics',
      error: error.message
    });
  }
};

const getPopularFilters = async (req, res) => {
  try {
    const { search_type = 'rooms', timeframe = '30d' } = req.query;

    const popularFilters = await SearchLog.getPopularFilters(search_type, timeframe);

    res.json({
      success: true,
      message: 'Popular filters retrieved successfully',
      data: {
        search_type,
        timeframe,
        filters: popularFilters
      }
    });

  } catch (error) {
    console.error('Get popular filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular filters',
      error: error.message
    });
  }
};

const advancedSearch = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      search_criteria,
      sort_by = 'relevance',
      sort_order = 'desc',
      page = 1,
      limit = 12
    } = req.body;

    const customerId = req.customer?.customer_id || null;
    const sessionId = req.sessionID || null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const searchParams = {
      query: search_criteria.query || '',
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort_by,
      sortOrder: sort_order,
      filters: search_criteria.filters || {}
    };

    const results = await Room.searchRooms(searchParams);
    const searchTime = Date.now() - startTime;

    const searchLogData = {
      customerId,
      searchQuery: search_criteria.query || null,
      searchType: 'rooms_advanced',
      filtersApplied: search_criteria.filters || null,
      resultsCount: results.total,
      pageNumber: parseInt(page),
      sortBy: sort_by,
      sortOrder: sort_order,
      sessionId,
      ipAddress,
      userAgent,
      searchTimeMs: searchTime
    };

    await SearchLog.create(searchLogData);

    res.json({
      success: true,
      message: 'Advanced search completed successfully',
      data: {
        rooms: results.rooms,
        pagination: results.pagination,
        search_criteria,
        search_stats: {
          total_results: results.total,
          search_time_ms: searchTime,
          filters_applied: Object.keys(search_criteria.filters || {}).length
        }
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Advanced search failed',
      error: error.message
    });
  }
};

const clearSearchHistory = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    
    await SearchLog.deleteCustomerSearches(customerId);

    res.json({
      success: true,
      message: 'Search history cleared successfully'
    });

  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear search history',
      error: error.message
    });
  }
};

module.exports = {
  searchRooms,
  getSearchSuggestions,
  getPopularSearches,
  logSearchClick,
  getSearchHistory,
  getSearchAnalytics,
  getPopularFilters,
  advancedSearch,
  clearSearchHistory
};


