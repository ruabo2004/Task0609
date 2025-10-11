// Validation Utility Functions
// Will be implemented in Week 3

const { body, param, query, validationResult } = require("express-validator");

const validationRules = {
  // User validation rules
  user: {
    register: [
      body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
      body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
          "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
      body("full_name")
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
    ],

    login: [
      body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
      body("password").notEmpty().withMessage("Password is required"),
    ],

    updateProfile: [
      body("full_name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
      body("phone")
        .optional()
        .isMobilePhone("vi-VN")
        .withMessage("Please provide a valid Vietnamese phone number"),
      body("email")
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    ],
  },

  // Room validation rules
  room: {
    create: [
      body("room_number")
        .trim()
        .notEmpty()
        .withMessage("Room number is required")
        .isLength({ max: 20 })
        .withMessage("Room number must not exceed 20 characters"),
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
      body("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array"),
      body("status")
        .optional()
        .isIn(["available", "occupied", "maintenance"])
        .withMessage("Status must be available, occupied, or maintenance"),
    ],

    update: [
      body("room_number")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Room number cannot be empty")
        .isLength({ max: 20 })
        .withMessage("Room number must not exceed 20 characters"),
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
    ],
  },

  // Booking validation rules
  booking: {
    create: [
      body("room_id")
        .isInt({ min: 1 })
        .withMessage("Room ID must be a positive integer"),
      body("check_in_date")
        .isISO8601()
        .toDate()
        .withMessage("Check-in date must be a valid date"),
      body("check_out_date")
        .isISO8601()
        .toDate()
        .withMessage("Check-out date must be a valid date")
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.check_in_date)) {
            throw new Error("Check-out date must be after check-in date");
          }
          return true;
        }),
      body("guests_count")
        .isInt({ min: 1, max: 10 })
        .withMessage("Guests count must be between 1 and 10"),
      body("special_requests")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Special requests must not exceed 500 characters"),
    ],
  },

  // Common validation rules
  common: {
    id: [
      param("id")
        .isInt({ min: 1 })
        .withMessage("ID must be a positive integer"),
    ],

    pagination: [
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
      query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
    ],
  },
};

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// Employee Module validation functions
const validateStaffProfile = (data, isCreate = true) => {
  const errors = [];

  if (isCreate) {
    if (!data.user_id || !Number.isInteger(data.user_id) || data.user_id < 1) {
      errors.push("Valid user ID is required");
    }

    if (
      !data.department ||
      !["reception", "housekeeping", "maintenance", "management"].includes(
        data.department
      )
    ) {
      errors.push(
        "Department must be: reception, housekeeping, maintenance, or management"
      );
    }

    if (
      !data.position ||
      data.position.trim().length < 2 ||
      data.position.trim().length > 100
    ) {
      errors.push("Position must be between 2 and 100 characters");
    }

    if (!data.hire_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.hire_date)) {
      errors.push("Valid hire date is required (YYYY-MM-DD)");
    }
  }

  if (
    data.employee_id &&
    (data.employee_id.length < 3 ||
      data.employee_id.length > 20 ||
      !/^[A-Z0-9]+$/.test(data.employee_id))
  ) {
    errors.push("Employee ID must be 3-20 characters, alphanumeric uppercase");
  }

  if (data.salary && (isNaN(data.salary) || data.salary < 0)) {
    errors.push("Salary must be a positive number");
  }

  if (
    data.emergency_contact_phone &&
    !/^(0|\+84)[0-9]{9,10}$/.test(data.emergency_contact_phone)
  ) {
    errors.push("Please provide a valid Vietnamese phone number");
  }

  if (
    data.status &&
    !["active", "inactive", "on_leave"].includes(data.status)
  ) {
    errors.push("Status must be: active, inactive, or on_leave");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateWorkShift = (data, isCreate = true) => {
  const errors = [];

  if (isCreate) {
    if (
      !data.staff_id ||
      !Number.isInteger(data.staff_id) ||
      data.staff_id < 1
    ) {
      errors.push("Valid staff ID is required");
    }

    if (!data.shift_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.shift_date)) {
      errors.push("Valid shift date is required (YYYY-MM-DD)");
    }

    if (
      !data.shift_type ||
      !["morning", "afternoon", "night", "full_day"].includes(data.shift_type)
    ) {
      errors.push("Shift type must be: morning, afternoon, night, or full_day");
    }

    if (
      !data.start_time ||
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.start_time)
    ) {
      errors.push("Start time must be in HH:MM format");
    }

    if (
      !data.end_time ||
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.end_time)
    ) {
      errors.push("End time must be in HH:MM format");
    }
  }

  if (
    data.status &&
    !["scheduled", "completed", "missed", "cancelled"].includes(data.status)
  ) {
    errors.push("Status must be: scheduled, completed, missed, or cancelled");
  }

  if (data.notes && data.notes.length > 500) {
    errors.push("Notes must be less than 500 characters");
  }

  // Validate time logic
  if (data.start_time && data.end_time) {
    const [startHour, startMin] = data.start_time.split(":").map(Number);
    const [endHour, endMin] = data.end_time.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      errors.push("End time must be after start time");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateStaffTask = (data, isCreate = true) => {
  const errors = [];

  if (isCreate) {
    if (
      !data.assigned_to ||
      !Number.isInteger(data.assigned_to) ||
      data.assigned_to < 1
    ) {
      errors.push("Valid assigned staff ID is required");
    }

    if (
      !data.task_type ||
      !["cleaning", "maintenance", "check_in", "check_out", "other"].includes(
        data.task_type
      )
    ) {
      errors.push(
        "Task type must be: cleaning, maintenance, check_in, check_out, or other"
      );
    }

    if (
      !data.title ||
      data.title.trim().length < 3 ||
      data.title.trim().length > 255
    ) {
      errors.push("Title must be between 3 and 255 characters");
    }
  }

  if (data.description && data.description.length > 1000) {
    errors.push("Description must be less than 1000 characters");
  }

  if (
    data.priority &&
    !["low", "medium", "high", "urgent"].includes(data.priority)
  ) {
    errors.push("Priority must be: low, medium, high, or urgent");
  }

  if (
    data.status &&
    !["pending", "in_progress", "completed", "cancelled"].includes(data.status)
  ) {
    errors.push(
      "Status must be: pending, in_progress, completed, or cancelled"
    );
  }

  if (data.room_id && (!Number.isInteger(data.room_id) || data.room_id < 1)) {
    errors.push("Room ID must be a valid integer");
  }

  if (
    data.booking_id &&
    (!Number.isInteger(data.booking_id) || data.booking_id < 1)
  ) {
    errors.push("Booking ID must be a valid integer");
  }

  if (
    data.due_date &&
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data.due_date) &&
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(data.due_date)
  ) {
    errors.push("Due date must be a valid datetime");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateAttendance = (data, type = "update") => {
  const errors = [];

  if (type === "checkIn") {
    if (
      data.shift_id &&
      (!Number.isInteger(data.shift_id) || data.shift_id < 1)
    ) {
      errors.push("Shift ID must be a valid integer");
    }
  }

  if (type === "update") {
    if (
      data.status &&
      !["on_time", "late", "early_leave", "absent"].includes(data.status)
    ) {
      errors.push("Status must be: on_time, late, early_leave, or absent");
    }

    if (data.notes && data.notes.length > 500) {
      errors.push("Notes must be less than 500 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validationRules,
  handleValidationErrors,
  // Employee Module validators
  validateStaffProfile,
  validateWorkShift,
  validateStaffTask,
  validateAttendance,
};
