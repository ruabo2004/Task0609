import {
  format,
  parse,
  parseISO,
  isValid,
  addDays,
  subDays,
  addWeeks,
  addMonths,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  isAfter,
  isBefore,
  isWithinInterval,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  eachDayOfInterval,
  getDay,
  getWeek,
  getMonth,
  getYear,
  setHours,
  setMinutes,
  min,
  max,
} from "date-fns";
import { vi } from "date-fns/locale";

// ==========================================
// DATE FORMATTING
// ==========================================

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} formatString - Format string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatString = "dd/MM/yyyy", options = {}) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";

    return format(dateObj, formatString, {
      locale: vi,
      ...options,
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
};

/**
 * Format date for API (ISO string)
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
export const formatDateForAPI = (date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";

    return format(dateObj, "yyyy-MM-dd");
  } catch (error) {
    console.error("API date formatting error:", error);
    return "";
  }
};

/**
 * Format time for display
 * @param {Date|string} date - Date/time to format
 * @param {string} formatString - Format string
 * @returns {string} Formatted time
 */
export const formatTime = (date, formatString = "HH:mm") => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";

    return format(dateObj, formatString, { locale: vi });
  } catch (error) {
    console.error("Time formatting error:", error);
    return "";
  }
};

/**
 * Format date range for display
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate, options = {}) => {
  const {
    separator = " - ",
    sameMonthFormat = "dd",
    differentMonthFormat = "dd/MM",
    differentYearFormat = "dd/MM/yyyy",
    showYear = false,
  } = options;

  try {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    if (!isValid(start) || !isValid(end)) return "";

    // Same day
    if (isSameDay(start, end)) {
      return formatDate(
        start,
        showYear ? differentYearFormat : differentMonthFormat
      );
    }

    // Same month and year
    if (isSameMonth(start, end) && isSameYear(start, end)) {
      const startFormatted = formatDate(start, sameMonthFormat);
      const endFormatted = formatDate(
        end,
        showYear ? differentYearFormat : differentMonthFormat
      );
      return `${startFormatted}${separator}${endFormatted}`;
    }

    // Same year
    if (isSameYear(start, end) && !showYear) {
      const startFormatted = formatDate(start, differentMonthFormat);
      const endFormatted = formatDate(end, differentMonthFormat);
      return `${startFormatted}${separator}${endFormatted}`;
    }

    // Different years or showYear is true
    const startFormatted = formatDate(start, differentYearFormat);
    const endFormatted = formatDate(end, differentYearFormat);
    return `${startFormatted}${separator}${endFormatted}`;
  } catch (error) {
    console.error("Date range formatting error:", error);
    return "";
  }
};

// ==========================================
// DATE PARSING
// ==========================================

/**
 * Parse date from string
 * @param {string} dateString - Date string to parse
 * @param {string} formatString - Expected format
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (dateString, formatString = "dd/MM/yyyy") => {
  if (!dateString) return null;

  try {
    // Try parsing as ISO first
    if (dateString.includes("T") || dateString.includes("-")) {
      const isoDate = parseISO(dateString);
      if (isValid(isoDate)) return isoDate;
    }

    // Parse with specified format
    const parsedDate = parse(dateString, formatString, new Date(), {
      locale: vi,
    });
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
};

/**
 * Parse time string to date object
 * @param {string} timeString - Time string (HH:mm)
 * @param {Date} baseDate - Base date (default: today)
 * @returns {Date|null} Date with time set
 */
export const parseTime = (timeString, baseDate = new Date()) => {
  if (!timeString) return null;

  try {
    const [hours, minutes] = timeString.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    const result = setMinutes(setHours(startOfDay(baseDate), hours), minutes);
    return isValid(result) ? result : null;
  } catch (error) {
    console.error("Time parsing error:", error);
    return null;
  }
};

// ==========================================
// DATE VALIDATION
// ==========================================

/**
 * Validate date string
 * @param {string} dateString - Date string to validate
 * @param {string} formatString - Expected format
 * @returns {boolean} Is valid date
 */
export const isValidDateString = (dateString, formatString = "dd/MM/yyyy") => {
  const parsed = parseDate(dateString, formatString);
  return parsed !== null;
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is in the past
 */
export const isDateInPast = (date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;

    return isBefore(startOfDay(dateObj), startOfDay(new Date()));
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is in the future
 */
export const isDateInFuture = (date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;

    return isAfter(startOfDay(dateObj), startOfDay(new Date()));
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is today
 */
export const isToday = (date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;

    return isSameDay(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

/**
 * Validate date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Object} Validation result
 */
export const validateDateRange = (startDate, endDate) => {
  try {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    const errors = [];

    if (!isValid(start)) {
      errors.push("Ngày bắt đầu không hợp lệ");
    }

    if (!isValid(end)) {
      errors.push("Ngày kết thúc không hợp lệ");
    }

    if (isValid(start) && isValid(end)) {
      if (isAfter(start, end)) {
        errors.push("Ngày bắt đầu không thể sau ngày kết thúc");
      }

      if (isSameDay(start, end)) {
        errors.push("Ngày bắt đầu và kết thúc không thể giống nhau");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ["Lỗi xác thực ngày tháng"],
    };
  }
};

// ==========================================
// DATE CALCULATIONS
// ==========================================

/**
 * Calculate difference between dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} unit - Unit (days, weeks, months, years)
 * @returns {number} Difference
 */
export const getDateDifference = (startDate, endDate, unit = "days") => {
  try {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    if (!isValid(start) || !isValid(end)) return 0;

    switch (unit) {
      case "days":
        return differenceInDays(end, start);
      case "weeks":
        return differenceInWeeks(end, start);
      case "months":
        return differenceInMonths(end, start);
      case "years":
        return differenceInYears(end, start);
      default:
        return differenceInDays(end, start);
    }
  } catch (error) {
    console.error("Date difference calculation error:", error);
    return 0;
  }
};

/**
 * Add time to date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit (days, weeks, months)
 * @returns {Date|null} New date
 */
export const addToDate = (date, amount, unit = "days") => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return null;

    switch (unit) {
      case "days":
        return addDays(dateObj, amount);
      case "weeks":
        return addWeeks(dateObj, amount);
      case "months":
        return addMonths(dateObj, amount);
      default:
        return addDays(dateObj, amount);
    }
  } catch (error) {
    console.error("Date addition error:", error);
    return null;
  }
};

/**
 * Subtract time from date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to subtract
 * @param {string} unit - Unit (days, weeks, months)
 * @returns {Date|null} New date
 */
export const subtractFromDate = (date, amount, unit = "days") => {
  return addToDate(date, -amount, unit);
};

// ==========================================
// DATE RANGES
// ==========================================

/**
 * Get predefined date ranges
 * @returns {Object} Predefined ranges
 */
export const getDateRanges = () => {
  const today = new Date();

  return {
    today: {
      label: "Hôm nay",
      start: startOfDay(today),
      end: endOfDay(today),
    },
    yesterday: {
      label: "Hôm qua",
      start: startOfDay(subDays(today, 1)),
      end: endOfDay(subDays(today, 1)),
    },
    thisWeek: {
      label: "Tuần này",
      start: startOfWeek(today, { locale: vi }),
      end: endOfWeek(today, { locale: vi }),
    },
    lastWeek: {
      label: "Tuần trước",
      start: startOfWeek(subDays(today, 7), { locale: vi }),
      end: endOfWeek(subDays(today, 7), { locale: vi }),
    },
    thisMonth: {
      label: "Tháng này",
      start: startOfMonth(today),
      end: endOfMonth(today),
    },
    lastMonth: {
      label: "Tháng trước",
      start: startOfMonth(subDays(today, 30)),
      end: endOfMonth(subDays(today, 30)),
    },
    thisYear: {
      label: "Năm này",
      start: startOfYear(today),
      end: endOfYear(today),
    },
    last7Days: {
      label: "7 ngày qua",
      start: startOfDay(subDays(today, 7)),
      end: endOfDay(today),
    },
    last30Days: {
      label: "30 ngày qua",
      start: startOfDay(subDays(today, 30)),
      end: endOfDay(today),
    },
    last90Days: {
      label: "90 ngày qua",
      start: startOfDay(subDays(today, 90)),
      end: endOfDay(today),
    },
  };
};

/**
 * Generate date range array
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Date[]} Array of dates
 */
export const generateDateRange = (startDate, endDate) => {
  try {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    if (!isValid(start) || !isValid(end)) return [];

    return eachDayOfInterval({ start, end });
  } catch (error) {
    console.error("Date range generation error:", error);
    return [];
  }
};

// ==========================================
// BOOKING SPECIFIC DATE UTILITIES
// ==========================================

/**
 * Calculate checkout date from checkin and nights
 * @param {Date|string} checkinDate - Checkin date
 * @param {number} nights - Number of nights
 * @returns {Date|null} Checkout date
 */
export const calculateCheckoutDate = (checkinDate, nights) => {
  try {
    const checkin =
      typeof checkinDate === "string" ? parseISO(checkinDate) : checkinDate;
    if (!isValid(checkin) || nights < 1) return null;

    return addDays(checkin, nights);
  } catch (error) {
    console.error("Checkout date calculation error:", error);
    return null;
  }
};

/**
 * Get available checkin times
 * @returns {Array} Array of time options
 */
export const getCheckinTimes = () => {
  const times = [];

  // Standard checkin from 14:00 to 22:00
  for (let hour = 14; hour <= 22; hour++) {
    times.push({
      value: `${hour.toString().padStart(2, "0")}:00`,
      label: `${hour}:00`,
    });

    if (hour < 22) {
      times.push({
        value: `${hour.toString().padStart(2, "0")}:30`,
        label: `${hour}:30`,
      });
    }
  }

  return times;
};

/**
 * Get available checkout times
 * @returns {Array} Array of time options
 */
export const getCheckoutTimes = () => {
  const times = [];

  // Standard checkout from 8:00 to 12:00
  for (let hour = 8; hour <= 12; hour++) {
    times.push({
      value: `${hour.toString().padStart(2, "0")}:00`,
      label: `${hour}:00`,
    });

    if (hour < 12) {
      times.push({
        value: `${hour.toString().padStart(2, "0")}:30`,
        label: `${hour}:30`,
      });
    }
  }

  return times;
};

/**
 * Check if date is a weekend
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is weekend
 */
export const isWeekend = (date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;

    const dayOfWeek = getDay(dateObj);
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  } catch (error) {
    return false;
  }
};

/**
 * Get season from date
 * @param {Date|string} date - Date to check
 * @returns {string} Season name
 */
export const getSeason = (date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "unknown";

    const month = getMonth(dateObj) + 1; // getMonth returns 0-11

    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  } catch (error) {
    return "unknown";
  }
};

/**
 * Get Vietnamese season name
 * @param {Date|string} date - Date to check
 * @returns {string} Vietnamese season name
 */
export const getVietnameseSeason = (date) => {
  const season = getSeason(date);
  const seasonNames = {
    spring: "Mùa xuân",
    summer: "Mùa hè",
    autumn: "Mùa thu",
    winter: "Mùa đông",
    unknown: "Không xác định",
  };

  return seasonNames[season];
};

export default {
  formatDate,
  formatDateForAPI,
  formatTime,
  formatDateRange,
  parseDate,
  parseTime,
  isValidDateString,
  isDateInPast,
  isDateInFuture,
  isToday,
  validateDateRange,
  getDateDifference,
  addToDate,
  subtractFromDate,
  getDateRanges,
  generateDateRange,
  calculateCheckoutDate,
  getCheckinTimes,
  getCheckoutTimes,
  isWeekend,
  getSeason,
  getVietnameseSeason,
};


