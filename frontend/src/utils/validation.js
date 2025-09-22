import { VALIDATION_MESSAGES } from "./constants";
import config from "@config/config";

/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean|string} true if valid, error message if invalid
 */
export const validateEmail = (email) => {
  if (!email) return VALIDATION_MESSAGES.REQUIRED;
  if (!config.validation.email.pattern.test(email)) {
    return config.validation.email.message;
  }
  return true;
};

/**
 * Validate phone number format (Vietnamese)
 * @param {string} phone
 * @returns {boolean|string} true if valid, error message if invalid
 */
export const validatePhone = (phone) => {
  if (!phone) return VALIDATION_MESSAGES.REQUIRED;
  if (!config.validation.phone.pattern.test(phone)) {
    return config.validation.phone.message;
  }
  return true;
};

/**
 * Validate password
 * @param {string} password
 * @returns {boolean|string} true if valid, error message if invalid
 */
export const validatePassword = (password) => {
  if (!password) return VALIDATION_MESSAGES.REQUIRED;
  if (password.length < config.validation.password.minLength) {
    return config.validation.password.message;
  }
  return true;
};

/**
 * Validate password confirmation
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {boolean|string} true if valid, error message if invalid
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) return VALIDATION_MESSAGES.REQUIRED;
  if (password !== confirmPassword) {
    return VALIDATION_MESSAGES.PASSWORD_MISMATCH;
  }
  return true;
};

/**
 * Validate full name
 * @param {string} fullName
 * @returns {boolean|string} true if valid, error message if invalid
 */
export const validateFullName = (fullName) => {
  if (!fullName) return VALIDATION_MESSAGES.REQUIRED;
  const trimmedName = fullName.trim();
  if (trimmedName.length < config.validation.fullName.minLength) {
    return VALIDATION_MESSAGES.NAME_MIN_LENGTH;
  }
  if (trimmedName.length > config.validation.fullName.maxLength) {
    return VALIDATION_MESSAGES.NAME_MAX_LENGTH;
  }
  return true;
};

/**
 * Validate date of birth (must be 18+ years old)
 * @param {string} dateOfBirth - Date in YYYY-MM-DD format
 * @returns {boolean|string} true if valid, error message if invalid
 */
export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return true; // Optional field

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred this year
  const actualAge =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age;

  if (actualAge < 18) {
    return VALIDATION_MESSAGES.AGE_MINIMUM;
  }

  return true;
};

/**
 * Validate required field
 * @param {any} value
 * @param {string} fieldName
 * @returns {boolean|string} true if valid, error message if invalid
 */
export const validateRequired = (value, fieldName = "") => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return fieldName
      ? `${fieldName} là bắt buộc`
      : VALIDATION_MESSAGES.REQUIRED;
  }
  return true;
};

/**
 * Check password strength
 * @param {string} password
 * @returns {object} Strength analysis object
 */
export const checkPasswordStrength = (password) => {
  const strength = {
    score: 0,
    level: "weak",
    feedback: [],
    isValid: false,
  };

  if (!password) return strength;

  // Length check
  if (password.length >= 8) {
    strength.score += 1;
  } else {
    strength.feedback.push("Ít nhất 8 ký tự");
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    strength.score += 1;
  } else {
    strength.feedback.push("Có chữ thường");
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    strength.score += 1;
  } else {
    strength.feedback.push("Có chữ hoa");
  }

  // Number check
  if (/[0-9]/.test(password)) {
    strength.score += 1;
  } else {
    strength.feedback.push("Có số");
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    strength.score += 1;
  } else {
    strength.feedback.push("Có ký tự đặc biệt");
  }

  // Determine strength level
  if (strength.score < 3) {
    strength.level = "weak";
    strength.isValid = false;
  } else if (strength.score < 4) {
    strength.level = "medium";
    strength.isValid = true;
  } else {
    strength.level = "strong";
    strength.isValid = true;
  }

  return strength;
};

/**
 * React Hook Form validation rules
 */
export const validationRules = {
  email: {
    required: VALIDATION_MESSAGES.REQUIRED,
    pattern: {
      value: config.validation.email.pattern,
      message: config.validation.email.message,
    },
  },

  password: {
    required: VALIDATION_MESSAGES.REQUIRED,
    minLength: {
      value: config.validation.password.minLength,
      message: config.validation.password.message,
    },
  },

  loginPassword: {
    required: VALIDATION_MESSAGES.REQUIRED,
  },

  confirmPassword: (watchPassword) => ({
    required: VALIDATION_MESSAGES.REQUIRED,
    validate: (value) =>
      value === watchPassword || VALIDATION_MESSAGES.PASSWORD_MISMATCH,
  }),

  phone: {
    required: VALIDATION_MESSAGES.REQUIRED,
    pattern: {
      value: config.validation.phone.pattern,
      message: config.validation.phone.message,
    },
  },

  fullName: {
    required: VALIDATION_MESSAGES.REQUIRED,
    minLength: {
      value: config.validation.fullName.minLength,
      message: VALIDATION_MESSAGES.NAME_MIN_LENGTH,
    },
    maxLength: {
      value: config.validation.fullName.maxLength,
      message: VALIDATION_MESSAGES.NAME_MAX_LENGTH,
    },
  },

  dateOfBirth: {
    validate: validateDateOfBirth,
  },

  required: {
    required: VALIDATION_MESSAGES.REQUIRED,
  },
};
