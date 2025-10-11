// Validation Helper Functions
// Custom validation utilities and sanitizers

const validator = require("validator");
const { body, param, query } = require("express-validator");

/**
 * Custom validation helpers
 */
const validationHelpers = {
  /**
   * Validate Vietnamese phone number
   */
  isVietnamesePhone: (value) => {
    const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/;
    return phoneRegex.test(value.replace(/\s/g, ""));
  },

  /**
   * Validate password strength
   */
  isStrongPassword: (value) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(value);
  },

  /**
   * Validate date is in the future
   */
  isFutureDate: (value) => {
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
  },

  /**
   * Validate date range (check-in to check-out)
   */
  isValidDateRange: (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return checkOutDate > checkInDate;
  },

  /**
   * Validate file type for images
   */
  isValidImageType: (mimetype) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    return allowedTypes.includes(mimetype);
  },

  /**
   * Validate file size (in bytes)
   */
  isValidFileSize: (size, maxSizeInMB = 5) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return size <= maxSizeInBytes;
  },

  /**
   * Sanitize and validate room amenities
   */
  validateAmenities: (amenities) => {
    const validAmenities = [
      "wifi",
      "air_conditioning",
      "tv",
      "refrigerator",
      "balcony",
      "bathroom",
      "hot_water",
      "towels",
      "bed_sheets",
      "wardrobe",
      "desk",
      "chair",
      "safe_box",
      "mini_bar",
      "coffee_maker",
      "hair_dryer",
      "iron",
      "laundry",
      "room_service",
      "parking",
    ];

    if (!Array.isArray(amenities)) {
      return false;
    }

    return amenities.every(
      (amenity) =>
        typeof amenity === "string" &&
        validAmenities.includes(amenity.toLowerCase())
    );
  },

  /**
   * Validate room capacity based on room type
   */
  validateRoomCapacity: (roomType, capacity) => {
    const capacityRules = {
      single: { min: 1, max: 2 },
      double: { min: 1, max: 4 },
      suite: { min: 1, max: 6 },
      family: { min: 3, max: 10 },
    };

    const rule = capacityRules[roomType];
    if (!rule) return false;

    return capacity >= rule.min && capacity <= rule.max;
  },

  /**
   * Validate price range
   */
  validatePriceRange: (price, minPrice = 0, maxPrice = 10000000) => {
    return price >= minPrice && price <= maxPrice;
  },

  /**
   * Validate booking duration (minimum 1 night, maximum 30 nights)
   */
  validateBookingDuration: (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 1 && diffDays <= 30;
  },

  /**
   * Validate and sanitize search query
   */
  sanitizeSearchQuery: (query) => {
    if (!query || typeof query !== "string") {
      return "";
    }

    // Remove special characters, keep only alphanumeric and spaces
    return query
      .trim()
      .replace(/[^a-zA-Z0-9\s\u00C0-\u017F]/g, "") // Allow Vietnamese characters
      .replace(/\s+/g, " ")
      .substring(0, 100); // Limit length
  },

  /**
   * Validate email domain
   */
  isAllowedEmailDomain: (email) => {
    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "protonmail.com",
    ];

    const domain = email.split("@")[1];
    return allowedDomains.includes(domain.toLowerCase());
  },

  /**
   * Validate Vietnamese ID card number (CCCD)
   */
  isValidVietnameseID: (idNumber) => {
    // New format: 12 digits (starting from 2021)
    // Old format: 9 digits
    const newFormatRegex = /^\d{12}$/;
    const oldFormatRegex = /^\d{9}$/;

    return newFormatRegex.test(idNumber) || oldFormatRegex.test(idNumber);
  },
};

/**
 * Common validation chains
 */
const commonValidations = {
  /**
   * Enhanced email validation
   */
  email: () =>
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail()
      .custom((value) => {
        if (!validationHelpers.isAllowedEmailDomain(value)) {
          throw new Error("Email domain is not allowed");
        }
        return true;
      }),

  /**
   * Enhanced password validation
   */
  password: () =>
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .custom((value) => {
        if (!validationHelpers.isStrongPassword(value)) {
          throw new Error(
            "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
          );
        }
        return true;
      }),

  /**
   * Enhanced phone validation
   */
  phone: () =>
    body("phone")
      .optional()
      .custom((value) => {
        if (value && !validationHelpers.isVietnamesePhone(value)) {
          throw new Error("Please provide a valid Vietnamese phone number");
        }
        return true;
      }),

  /**
   * Date validation for bookings
   */
  checkInDate: () =>
    body("check_in_date")
      .isISO8601()
      .withMessage("Check-in date must be a valid date")
      .custom((value) => {
        if (!validationHelpers.isFutureDate(value)) {
          throw new Error("Check-in date must be today or in the future");
        }
        return true;
      }),

  /**
   * Check-out date validation
   */
  checkOutDate: () =>
    body("check_out_date")
      .isISO8601()
      .withMessage("Check-out date must be a valid date")
      .custom((value, { req }) => {
        const checkInDate = req.body.check_in_date;

        if (!validationHelpers.isValidDateRange(checkInDate, value)) {
          throw new Error("Check-out date must be after check-in date");
        }

        if (!validationHelpers.validateBookingDuration(checkInDate, value)) {
          throw new Error("Booking duration must be between 1 and 30 nights");
        }

        return true;
      }),

  /**
   * Room capacity validation
   */
  roomCapacity: () =>
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1")
      .custom((value, { req }) => {
        const roomType = req.body.room_type;

        if (
          roomType &&
          !validationHelpers.validateRoomCapacity(roomType, value)
        ) {
          throw new Error(
            `Capacity ${value} is not valid for room type ${roomType}`
          );
        }

        return true;
      }),

  /**
   * Price validation
   */
  price: () =>
    body("price_per_night")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number")
      .custom((value) => {
        if (!validationHelpers.validatePriceRange(value)) {
          throw new Error("Price must be between 0 and 10,000,000 VND");
        }
        return true;
      }),

  /**
   * Search query validation
   */
  searchQuery: () =>
    query("q")
      .optional()
      .customSanitizer((value) => validationHelpers.sanitizeSearchQuery(value))
      .isLength({ min: 1, max: 100 })
      .withMessage("Search query must be between 1 and 100 characters"),

  /**
   * Pagination validation
   */
  pagination: () => [
    query("page")
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage("Page must be between 1 and 1000"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
};

/**
 * Sanitization helpers
 */
const sanitizers = {
  /**
   * Sanitize text input
   */
  sanitizeText: (text) => {
    if (!text) return "";
    return validator.escape(text.toString().trim());
  },

  /**
   * Sanitize HTML content
   */
  sanitizeHTML: (html) => {
    if (!html) return "";
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
  },

  /**
   * Sanitize file name
   */
  sanitizeFileName: (fileName) => {
    if (!fileName) return "";
    return fileName
      .replace(/[^a-z0-9._-]/gi, "_")
      .toLowerCase()
      .substring(0, 100);
  },

  /**
   * Sanitize phone number
   */
  sanitizePhone: (phone) => {
    if (!phone) return "";
    return phone.replace(/[^0-9+]/g, "");
  },
};

module.exports = {
  validationHelpers,
  commonValidations,
  sanitizers,
};
