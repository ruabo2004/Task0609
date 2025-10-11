// Response Helper Functions
// Standardized API response formats

const responseHelper = {
  // @desc    Success response
  success: (res, data = null, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },

  // @desc    Error response
  error: (res, message = "Server Error", statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
    });
  },

  // @desc    Validation error response
  validationError: (res, errors, message = "Validation failed") => {
    return res.status(400).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  },

  // @desc    Unauthorized response
  unauthorized: (res, message = "Unauthorized access") => {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  },

  // @desc    Forbidden response
  forbidden: (res, message = "Forbidden access") => {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  },

  // @desc    Not found response
  notFound: (res, message = "Resource not found") => {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  },

  // @desc    Paginated response
  paginated: (res, data, pagination, message = "Success") => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.total,
        itemsPerPage: pagination.limit || 10,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  },

  // @desc    Created response
  created: (res, data = null, message = "Resource created successfully") => {
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },

  // @desc    No content response
  noContent: (res, message = "No content") => {
    return res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = responseHelper;
