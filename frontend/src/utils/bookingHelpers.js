import {
  format,
  differenceInDays,
  addDays,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
} from "date-fns";
import { vi } from "date-fns/locale";

// ==========================================
// BOOKING STATUS HELPERS
// ==========================================

/**
 * Get booking status display information
 * @param {string} status - Booking status
 * @returns {Object} Status display info
 */
export const getBookingStatusInfo = (status) => {
  const statusMap = {
    pending: {
      label: "Chờ xác nhận",
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
      icon: "⏳",
      description: "Booking đang chờ xác nhận từ chủ nhà",
    },
    confirmed: {
      label: "Đã xác nhận",
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      icon: "✅",
      description: "Booking đã được xác nhận",
    },
    checked_in: {
      label: "Đã check-in",
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      icon: "🏠",
      description: "Khách đã check-in",
    },
    checked_out: {
      label: "Đã check-out",
      color: "gray",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-200",
      icon: "👋",
      description: "Khách đã check-out",
    },
    completed: {
      label: "Hoàn thành",
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      icon: "🎉",
      description: "Booking đã hoàn thành",
    },
    cancelled: {
      label: "Đã hủy",
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-200",
      icon: "❌",
      description: "Booking đã bị hủy",
    },
    no_show: {
      label: "Không đến",
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      borderColor: "border-orange-200",
      icon: "👻",
      description: "Khách không đến theo lịch hẹn",
    },
    refunded: {
      label: "Đã hoàn tiền",
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
      icon: "💰",
      description: "Đã hoàn tiền cho khách",
    },
  };

  return (
    statusMap[status] || {
      label: "Không xác định",
      color: "gray",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-200",
      icon: "❓",
      description: "Trạng thái không xác định",
    }
  );
};

/**
 * Check if booking can be cancelled
 * @param {Object} booking - Booking object
 * @returns {boolean} Can cancel
 */
export const canCancelBooking = (booking) => {
  if (!booking) return false;

  const cancellableStatuses = ["pending", "confirmed"];
  const now = new Date();
  const checkInDate = parseISO(booking.check_in_date);

  // Check if status allows cancellation
  if (!cancellableStatuses.includes(booking.status)) {
    return false;
  }

  // Check if within cancellation window (e.g., 24 hours before check-in)
  const hoursBeforeCheckIn = differenceInDays(checkInDate, now) * 24;
  const cancellationWindow = booking.cancellation_policy?.hours_before || 24;

  return hoursBeforeCheckIn >= cancellationWindow;
};

/**
 * Check if booking can be modified
 * @param {Object} booking - Booking object
 * @returns {boolean} Can modify
 */
export const canModifyBooking = (booking) => {
  if (!booking) return false;

  const modifiableStatuses = ["pending", "confirmed"];
  const now = new Date();
  const checkInDate = parseISO(booking.check_in_date);

  // Check if status allows modification
  if (!modifiableStatuses.includes(booking.status)) {
    return false;
  }

  // Check if within modification window
  const hoursBeforeCheckIn = differenceInDays(checkInDate, now) * 24;
  const modificationWindow = booking.modification_policy?.hours_before || 48;

  return hoursBeforeCheckIn >= modificationWindow;
};

// ==========================================
// DATE HELPERS
// ==========================================

/**
 * Format booking dates for display
 * @param {string} checkInDate - Check-in date
 * @param {string} checkOutDate - Check-out date
 * @returns {Object} Formatted date info
 */
export const formatBookingDates = (checkInDate, checkOutDate) => {
  try {
    const checkIn = parseISO(checkInDate);
    const checkOut = parseISO(checkOutDate);

    if (!isValid(checkIn) || !isValid(checkOut)) {
      return { error: "Ngày không hợp lệ" };
    }

    const nights = differenceInDays(checkOut, checkIn);

    return {
      checkInFormatted: format(checkIn, "EEEE, dd/MM/yyyy", { locale: vi }),
      checkOutFormatted: format(checkOut, "EEEE, dd/MM/yyyy", { locale: vi }),
      checkInShort: format(checkIn, "dd/MM"),
      checkOutShort: format(checkOut, "dd/MM"),
      nights,
      duration: `${nights} đêm`,
      range: `${format(checkIn, "dd/MM", { locale: vi })} - ${format(
        checkOut,
        "dd/MM",
        { locale: vi }
      )}`,
    };
  } catch (error) {
    return { error: "Lỗi định dạng ngày" };
  }
};

/**
 * Get booking duration information
 * @param {string} checkInDate - Check-in date
 * @param {string} checkOutDate - Check-out date
 * @returns {Object} Duration info
 */
export const getBookingDuration = (checkInDate, checkOutDate) => {
  try {
    const checkIn = parseISO(checkInDate);
    const checkOut = parseISO(checkOutDate);

    if (!isValid(checkIn) || !isValid(checkOut)) {
      return { error: "Ngày không hợp lệ" };
    }

    const nights = differenceInDays(checkOut, checkIn);
    const days = nights + 1;

    return {
      nights,
      days,
      nightsText: `${nights} đêm`,
      daysText: `${days} ngày`,
      fullText: `${days} ngày, ${nights} đêm`,
    };
  } catch (error) {
    return { error: "Lỗi tính toán thời gian" };
  }
};

// ==========================================
// GUEST HELPERS
// ==========================================

/**
 * Format guest count for display
 * @param {number} adults - Number of adults
 * @param {number} children - Number of children
 * @param {number} infants - Number of infants
 * @returns {string} Formatted guest count
 */
export const formatGuestCount = (adults = 0, children = 0, infants = 0) => {
  const parts = [];

  if (adults > 0) {
    parts.push(`${adults} người lớn`);
  }

  if (children > 0) {
    parts.push(`${children} trẻ em`);
  }

  if (infants > 0) {
    parts.push(`${infants} em bé`);
  }

  return parts.length > 0 ? parts.join(", ") : "0 khách";
};

/**
 * Get total guest count
 * @param {number} adults - Number of adults
 * @param {number} children - Number of children
 * @param {number} infants - Number of infants
 * @returns {number} Total guests
 */
export const getTotalGuests = (adults = 0, children = 0, infants = 0) => {
  return (adults || 0) + (children || 0) + (infants || 0);
};

/**
 * Validate guest count against room capacity
 * @param {Object} guestCount - Guest count object
 * @param {Object} roomCapacity - Room capacity object
 * @returns {Object} Validation result
 */
export const validateGuestCount = (guestCount, roomCapacity) => {
  const { adults = 0, children = 0, infants = 0 } = guestCount;
  const {
    max_adults = 2,
    max_children = 2,
    max_infants = 1,
    max_total = 4,
  } = roomCapacity;

  const errors = [];
  const total = getTotalGuests(adults, children, infants);

  if (adults > max_adults) {
    errors.push(`Số người lớn không được vượt quá ${max_adults}`);
  }

  if (children > max_children) {
    errors.push(`Số trẻ em không được vượt quá ${max_children}`);
  }

  if (infants > max_infants) {
    errors.push(`Số em bé không được vượt quá ${max_infants}`);
  }

  if (total > max_total) {
    errors.push(`Tổng số khách không được vượt quá ${max_total}`);
  }

  if (adults === 0) {
    errors.push("Phải có ít nhất 1 người lớn");
  }

  return {
    isValid: errors.length === 0,
    errors,
    total,
  };
};

// ==========================================
// PRICE HELPERS
// ==========================================

/**
 * Format price for display
 * @param {number} amount - Price amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted price
 */
export const formatPrice = (amount, currency = "VND") => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0đ";
  }

  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Calculate booking total with breakdown
 * @param {Object} priceData - Price calculation data
 * @returns {Object} Price breakdown
 */
export const calculateBookingTotal = (priceData) => {
  const {
    base_price = 0,
    nights = 1,
    extra_guest_fee = 0,
    service_fees = [],
    taxes = [],
    discounts = [],
    cleaning_fee = 0,
    security_deposit = 0,
  } = priceData;

  // Base accommodation cost
  const accommodationTotal = base_price * nights;

  // Extra services total
  const servicesTotal = (service_fees || []).reduce((sum, service) => {
    return sum + (service.amount || 0);
  }, 0);

  // Taxes total
  const taxesTotal = (taxes || []).reduce((sum, tax) => {
    return sum + (tax.amount || 0);
  }, 0);

  // Discounts total
  const discountsTotal = (discounts || []).reduce((sum, discount) => {
    return sum + (discount.amount || 0);
  }, 0);

  // Subtotal before taxes and fees
  const subtotal = accommodationTotal + extra_guest_fee + servicesTotal;

  // Total before discounts
  const totalBeforeDiscounts = subtotal + taxesTotal + cleaning_fee;

  // Final total
  const finalTotal = totalBeforeDiscounts - discountsTotal;

  // Amount due (excluding security deposit)
  const amountDue = finalTotal;

  // Total with deposit
  const totalWithDeposit = finalTotal + security_deposit;

  return {
    accommodationTotal,
    servicesTotal,
    taxesTotal,
    discountsTotal,
    subtotal,
    totalBeforeDiscounts,
    finalTotal,
    amountDue,
    securityDeposit: security_deposit,
    totalWithDeposit,
    breakdown: {
      accommodation: {
        label: `Phòng (${nights} đêm)`,
        amount: accommodationTotal,
      },
      extraGuest:
        extra_guest_fee > 0
          ? {
              label: "Phí khách thêm",
              amount: extra_guest_fee,
            }
          : null,
      services:
        servicesTotal > 0
          ? {
              label: "Dịch vụ thêm",
              amount: servicesTotal,
              details: service_fees,
            }
          : null,
      cleaning:
        cleaning_fee > 0
          ? {
              label: "Phí dọn dẹp",
              amount: cleaning_fee,
            }
          : null,
      taxes:
        taxesTotal > 0
          ? {
              label: "Thuế và phí",
              amount: taxesTotal,
              details: taxes,
            }
          : null,
      discounts:
        discountsTotal > 0
          ? {
              label: "Giảm giá",
              amount: -discountsTotal,
              details: discounts,
            }
          : null,
      deposit:
        security_deposit > 0
          ? {
              label: "Tiền đặt cọc",
              amount: security_deposit,
            }
          : null,
    },
  };
};

// ==========================================
// BOOKING VALIDATION
// ==========================================

/**
 * Validate booking data
 * @param {Object} bookingData - Booking data to validate
 * @returns {Object} Validation result
 */
export const validateBookingData = (bookingData) => {
  const errors = {};
  const {
    room_id,
    check_in_date,
    check_out_date,
    adults,
    children,
    infants,
    contact_name,
    contact_email,
    contact_phone,
    terms_accepted,
  } = bookingData;

  // Required fields
  if (!room_id) {
    errors.room_id = "Vui lòng chọn phòng";
  }

  if (!check_in_date) {
    errors.check_in_date = "Vui lòng chọn ngày check-in";
  }

  if (!check_out_date) {
    errors.check_out_date = "Vui lòng chọn ngày check-out";
  }

  // Date validation
  if (check_in_date && check_out_date) {
    try {
      const checkIn = parseISO(check_in_date);
      const checkOut = parseISO(check_out_date);
      const now = startOfDay(new Date());

      if (!isValid(checkIn) || !isValid(checkOut)) {
        errors.dates = "Ngày không hợp lệ";
      } else {
        if (checkIn < now) {
          errors.check_in_date = "Ngày check-in không thể là quá khứ";
        }

        if (checkOut <= checkIn) {
          errors.check_out_date = "Ngày check-out phải sau ngày check-in";
        }

        const nights = differenceInDays(checkOut, checkIn);
        if (nights > 30) {
          errors.dates = "Thời gian lưu trú không được vượt quá 30 đêm";
        }
      }
    } catch (error) {
      errors.dates = "Lỗi xử lý ngày tháng";
    }
  }

  // Guest count validation
  const totalGuests = getTotalGuests(adults, children, infants);
  if (totalGuests === 0) {
    errors.guests = "Phải có ít nhất 1 khách";
  }

  if (!adults || adults < 1) {
    errors.adults = "Phải có ít nhất 1 người lớn";
  }

  // Contact information
  if (!contact_name || contact_name.trim().length < 2) {
    errors.contact_name = "Tên liên hệ phải có ít nhất 2 ký tự";
  }

  if (!contact_email) {
    errors.contact_email = "Email liên hệ là bắt buộc";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      errors.contact_email = "Email không hợp lệ";
    }
  }

  if (!contact_phone) {
    errors.contact_phone = "Số điện thoại liên hệ là bắt buộc";
  } else {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(contact_phone.replace(/\D/g, ""))) {
      errors.contact_phone = "Số điện thoại không hợp lệ";
    }
  }

  // Terms acceptance
  if (!terms_accepted) {
    errors.terms_accepted = "Vui lòng đồng ý với điều khoản và điều kiện";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ==========================================
// BOOKING SEARCH & FILTER
// ==========================================

/**
 * Filter bookings by criteria
 * @param {Array} bookings - Array of bookings
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered bookings
 */
export const filterBookings = (bookings, filters) => {
  if (!Array.isArray(bookings)) return [];

  return bookings.filter((booking) => {
    // Status filter
    if (filters.status && booking.status !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.start_date || filters.end_date) {
      const bookingDate = parseISO(booking.check_in_date);

      if (filters.start_date) {
        const startDate = parseISO(filters.start_date);
        if (bookingDate < startDate) return false;
      }

      if (filters.end_date) {
        const endDate = parseISO(filters.end_date);
        if (bookingDate > endDate) return false;
      }
    }

    // Room filter
    if (filters.room_id && booking.room_id !== filters.room_id) {
      return false;
    }

    // Guest name search
    if (filters.guest_name) {
      const searchTerm = filters.guest_name.toLowerCase();
      const guestName = booking.contact_name?.toLowerCase() || "";
      if (!guestName.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Sort bookings by criteria
 * @param {Array} bookings - Array of bookings
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Array} Sorted bookings
 */
export const sortBookings = (
  bookings,
  sortBy = "check_in_date",
  sortOrder = "desc"
) => {
  if (!Array.isArray(bookings)) return [];

  return [...bookings].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date fields
    if (
      sortBy.includes("date") ||
      sortBy === "created_at" ||
      sortBy === "updated_at"
    ) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle numeric fields
    if (
      sortBy.includes("amount") ||
      sortBy.includes("price") ||
      sortBy === "total_guests"
    ) {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }

    // Handle string fields
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;

    return sortOrder === "desc" ? -comparison : comparison;
  });
};

// ==========================================
// BOOKING EXPORT HELPERS
// ==========================================

/**
 * Generate booking summary for export
 * @param {Object} booking - Booking object
 * @returns {Object} Booking summary
 */
export const generateBookingSummary = (booking) => {
  const dateInfo = formatBookingDates(
    booking.check_in_date,
    booking.check_out_date
  );
  const guestInfo = formatGuestCount(
    booking.adults,
    booking.children,
    booking.infants
  );
  const statusInfo = getBookingStatusInfo(booking.status);

  return {
    bookingId: booking.booking_id,
    confirmationCode: booking.confirmation_code,
    roomNumber: booking.room?.room_number || "N/A",
    roomType: booking.room?.type_name || "N/A",
    guestName: booking.contact_name,
    guestEmail: booking.contact_email,
    guestPhone: booking.contact_phone,
    checkIn: dateInfo.checkInFormatted,
    checkOut: dateInfo.checkOutFormatted,
    nights: dateInfo.nights,
    guests: guestInfo,
    status: statusInfo.label,
    totalAmount: formatPrice(booking.total_amount),
    createdAt: format(parseISO(booking.created_at), "dd/MM/yyyy HH:mm", {
      locale: vi,
    }),
    specialRequests: booking.special_requests || "Không có",
  };
};

export default {
  getBookingStatusInfo,
  canCancelBooking,
  canModifyBooking,
  formatBookingDates,
  getBookingDuration,
  formatGuestCount,
  getTotalGuests,
  validateGuestCount,
  formatPrice,
  calculateBookingTotal,
  validateBookingData,
  filterBookings,
  sortBookings,
  generateBookingSummary,
};


