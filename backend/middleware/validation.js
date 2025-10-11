// Validation Middleware
// Input validation rules using express-validator

const { body, param, query, validationResult } = require("express-validator");
const { error } = require("../utils/responseHelper");

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, "Validation failed", 400, errors.array());
  }
  next();
};

// Authentication validations
const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("full_name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("phone")
    .optional()
    .isLength({ min: 10, max: 11 })
    .withMessage("Phone number must be 10-11 digits")
    .matches(/^0[0-9]{9,10}$/)
    .withMessage(
      "Please provide a valid Vietnamese phone number (starting with 0)"
    ),
  body("role")
    .optional()
    .isIn(["customer", "staff", "admin"])
    .withMessage("Role must be customer, staff, or admin"),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const validateRefreshToken = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  handleValidationErrors,
];

const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  handleValidationErrors,
];

const validateForgotPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
];

const validateResetPassword = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  handleValidationErrors,
];

// User validations
const validateUpdateProfile = [
  body("full_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value === "") return true;

      if (value.length < 10 || value.length > 11) {
        throw new Error("Phone number must be 10-11 digits");
      }

      if (!/^0[0-9]{9,10}$/.test(value)) {
        throw new Error(
          "Please provide a valid Vietnamese phone number (starting with 0)"
        );
      }

      return true;
    }),
  body("date_of_birth")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value === "") return true; // Allow empty/null values

      // Check if it's a valid date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error("Date of birth must be in YYYY-MM-DD format");
      }

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Date of birth must be a valid date");
      }

      return true;
    }),
  body("nationality")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === "") return true;
      if (value.length < 2 || value.length > 100) {
        throw new Error("Nationality must be between 2 and 100 characters");
      }
      return true;
    }),
  body("id_number")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === "") return true;
      if (value.length < 5 || value.length > 50) {
        throw new Error("ID number must be between 5 and 50 characters");
      }
      return true;
    }),
  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === "") return true;
      if (value.length > 500) {
        throw new Error("Address must not exceed 500 characters");
      }
      return true;
    }),
  handleValidationErrors,
];

const validateCreateUser = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("full_name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("phone")
    .optional()
    .isMobilePhone("vi-VN")
    .withMessage("Please provide a valid Vietnamese phone number"),
  body("role")
    .isIn(["customer", "staff", "admin"])
    .withMessage("Role must be customer, staff, or admin"),
  handleValidationErrors,
];

const validateUpdateUser = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
  body("full_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("phone")
    .optional()
    .isMobilePhone("vi-VN")
    .withMessage("Please provide a valid Vietnamese phone number"),
  body("role")
    .optional()
    .isIn(["customer", "staff", "admin"])
    .withMessage("Role must be customer, staff, or admin"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
  handleValidationErrors,
];

// Room validations
const validateCreateRoom = [
  body("room_number")
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage("Room number must be between 1 and 10 characters"),
  body("room_type")
    .isIn(["single", "double", "suite", "family"])
    .withMessage("Room type must be single, double, suite, or family"),
  body("capacity")
    .isInt({ min: 1, max: 10 })
    .withMessage("Capacity must be between 1 and 10"),
  body("price_per_night")
    .isFloat({ min: 0 })
    .withMessage("Price per night must be a positive number"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array"),
  body("images").optional().isArray().withMessage("Images must be an array"),
  body("status")
    .optional()
    .isIn(["available", "occupied", "maintenance"])
    .withMessage("Status must be available, occupied, or maintenance"),
  handleValidationErrors,
];

const validateUpdateRoom = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Room ID must be a positive integer"),
  body("room_number")
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage("Room number must be between 1 and 10 characters"),
  body("room_type")
    .optional()
    .isIn(["single", "double", "suite", "family"])
    .withMessage("Room type must be single, double, suite, or family"),
  body("capacity")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Capacity must be between 1 and 10"),
  body("price_per_night")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price per night must be a positive number"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("status")
    .optional()
    .isIn(["available", "occupied", "maintenance"])
    .withMessage("Status must be available, occupied, or maintenance"),
  handleValidationErrors,
];

const validateRoomAvailability = [
  query("check_in")
    .isISO8601()
    .withMessage("Check-in date must be a valid date (YYYY-MM-DD)"),
  query("check_out")
    .isISO8601()
    .withMessage("Check-out date must be a valid date (YYYY-MM-DD)"),
  query("room_type")
    .optional()
    .isIn(["single", "double", "suite", "family"])
    .withMessage("Room type must be single, double, suite, or family"),
  query("guests")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Guests must be between 1 and 10"),
  handleValidationErrors,
];

// Booking validations
const validateCheckAvailability = [
  body("room_id")
    .isInt({ min: 1 })
    .withMessage("Room ID must be a positive integer"),
  body("check_in_date")
    .isISO8601()
    .withMessage("Check-in date must be a valid date (YYYY-MM-DD)"),
  body("check_out_date")
    .isISO8601()
    .withMessage("Check-out date must be a valid date (YYYY-MM-DD)"),
  handleValidationErrors,
];

const validateCreateBooking = [
  body("room_id")
    .isInt({ min: 1 })
    .withMessage("Room ID must be a positive integer"),
  body("check_in_date")
    .isISO8601()
    .withMessage("Check-in date must be a valid date (YYYY-MM-DD)"),
  body("check_out_date")
    .isISO8601()
    .withMessage("Check-out date must be a valid date (YYYY-MM-DD)"),
  body("guests_count")
    .isInt({ min: 1, max: 10 })
    .withMessage("Guests count must be between 1 and 10"),
  body("special_requests")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Special requests must not exceed 500 characters"),
  handleValidationErrors,
];

const validateUpdateBooking = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Booking ID must be a positive integer"),
  body("check_in_date")
    .optional()
    .isISO8601()
    .withMessage("Check-in date must be a valid date (YYYY-MM-DD)"),
  body("check_out_date")
    .optional()
    .isISO8601()
    .withMessage("Check-out date must be a valid date (YYYY-MM-DD)"),
  body("guests_count")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Guests count must be between 1 and 10"),
  body("special_requests")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Special requests must not exceed 500 characters"),
  handleValidationErrors,
];

// Payment validations
const validateCreatePayment = [
  body("booking_id")
    .isInt({ min: 1 })
    .withMessage("Booking ID must be a positive integer"),
  body("payment_method")
    .isIn(["cash", "card", "vnpay", "momo", "additional_services"])
    .withMessage(
      "Payment method must be cash, card, vnpay, momo, or additional_services"
    ),
  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
  handleValidationErrors,
];

const validateUpdatePaymentStatus = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Payment ID must be a positive integer"),
  body("status")
    .isIn(["pending", "completed", "failed", "refunded"])
    .withMessage("Status must be pending, completed, failed, or refunded"),
  body("transaction_id")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Transaction ID must not exceed 100 characters"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
  handleValidationErrors,
];

// Service validations
const validateCreateService = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Service name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("category")
    .isIn(["food", "tour", "transport", "other"])
    .withMessage("Category must be food, tour, transport, or other"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
  handleValidationErrors,
];

const validateUpdateService = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Service ID must be a positive integer"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Service name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("category")
    .optional()
    .isIn(["food", "tour", "transport", "other"])
    .withMessage("Category must be food, tour, transport, or other"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
  handleValidationErrors,
];

// Review validations
const validateCreateReview = [
  body("booking_id")
    .isInt({ min: 1 })
    .withMessage("Booking ID must be a positive integer"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment must not exceed 1000 characters"),
  handleValidationErrors,
];

const validateUpdateReview = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Review ID must be a positive integer"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment must not exceed 1000 characters"),
  handleValidationErrors,
];

// Common validations
const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  handleValidationErrors,
];

const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

const validateDateRange = [
  query("start_date")
    .isISO8601()
    .withMessage("Start date must be a valid date (YYYY-MM-DD)"),
  query("end_date")
    .isISO8601()
    .withMessage("End date must be a valid date (YYYY-MM-DD)"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  // Auth validations
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  // User validations
  validateUpdateProfile,
  validateCreateUser,
  validateUpdateUser,
  // Room validations
  validateCreateRoom,
  validateUpdateRoom,
  validateRoomAvailability,
  // Booking validations
  validateCheckAvailability,
  validateCreateBooking,
  validateUpdateBooking,
  // Payment validations
  validateCreatePayment,
  validateUpdatePaymentStatus,
  // Service validations
  validateCreateService,
  validateUpdateService,
  // Review validations
  validateCreateReview,
  validateUpdateReview,
  // Common validations
  validateId,
  validatePagination,
  validateDateRange,
};
