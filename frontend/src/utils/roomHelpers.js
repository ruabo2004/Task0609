/**
 * Room Helper Functions
 * Utility functions for room-related operations
 */

/**
 * Format room price with currency
 */
export const formatPrice = (price, currency = "VND") => {
  if (!price && price !== 0) return "N/A";

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return formattedPrice;
};

/**
 * Format price without currency symbol
 */
export const formatPriceNumber = (price) => {
  if (!price && price !== 0) return "N/A";

  return new Intl.NumberFormat("vi-VN").format(price);
};

/**
 * Get room status display
 */
export const getRoomStatusDisplay = (status) => {
  const statusMap = {
    available: { label: "Có sẵn", color: "green" },
    occupied: { label: "Đã đặt", color: "red" },
    maintenance: { label: "Bảo trì", color: "yellow" },
    cleaning: { label: "Dọn dẹp", color: "blue" },
    blocked: { label: "Không khả dụng", color: "gray" },
  };

  return statusMap[status] || { label: status, color: "gray" };
};

/**
 * Get cleaning status display
 */
export const getCleaningStatusDisplay = (status) => {
  const statusMap = {
    clean: { label: "Sạch sẽ", color: "green" },
    dirty: { label: "Cần dọn", color: "red" },
    cleaning: { label: "Đang dọn", color: "yellow" },
    inspecting: { label: "Kiểm tra", color: "blue" },
  };

  return statusMap[status] || { label: status, color: "gray" };
};

/**
 * Get view type display
 */
export const getViewTypeDisplay = (viewType) => {
  const viewMap = {
    sea: "View biển",
    mountain: "View núi",
    city: "View thành phố",
    garden: "View vườn",
    pool: "View hồ bơi",
    courtyard: "View sân trong",
  };

  return viewMap[viewType] || viewType;
};

/**
 * Get bed type display
 */
export const getBedTypeDisplay = (bedType) => {
  const bedMap = {
    single: "Giường đơn",
    double: "Giường đôi",
    queen: "Giường Queen",
    king: "Giường King",
    twin: "Hai giường đơn",
  };

  return bedMap[bedType] || bedType;
};

/**
 * Get bathroom type display
 */
export const getBathroomTypeDisplay = (bathroomType) => {
  const bathroomMap = {
    private: "Phòng tắm riêng",
    shared: "Phòng tắm chung",
    ensuite: "Phòng tắm trong phòng",
  };

  return bathroomMap[bathroomType] || bathroomType;
};

/**
 * Calculate room capacity text
 */
export const getRoomCapacityText = (
  maxOccupancy,
  numAdults = 0,
  numChildren = 0
) => {
  const total = numAdults + numChildren;

  if (numAdults && numChildren) {
    return `${numAdults} người lớn, ${numChildren} trẻ em (tối đa ${maxOccupancy})`;
  } else if (numAdults) {
    return `${numAdults} khách (tối đa ${maxOccupancy})`;
  } else {
    return `Tối đa ${maxOccupancy} khách`;
  }
};

/**
 * Check if room can accommodate guests
 */
export const canAccommodateGuests = (room, numAdults, numChildren = 0) => {
  const totalGuests = numAdults + numChildren;
  return totalGuests <= room.max_occupancy;
};

/**
 * Calculate total nights between dates
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Calculate room price for date range
 */
export const calculateRoomPrice = (room, checkIn, checkOut, pricing = null) => {
  const nights = calculateNights(checkIn, checkOut);

  if (nights <= 0) return { nights: 0, total: 0, breakdown: [] };

  // Use pricing data if available, otherwise use base prices
  if (pricing && pricing.nightly_breakdown) {
    const total = pricing.nightly_breakdown.reduce(
      (sum, night) => sum + night.price,
      0
    );
    return {
      nights,
      total,
      breakdown: pricing.nightly_breakdown,
      baseAmount: total,
      taxAmount: pricing.tax_amount || 0,
      finalAmount: pricing.final_amount || total,
    };
  }

  // Fallback to simple calculation
  const basePrice = room.price_per_night || 0;
  const total = basePrice * nights;

  return {
    nights,
    total,
    breakdown: [],
    baseAmount: total,
    taxAmount: 0,
    finalAmount: total,
  };
};

/**
 * Check if date is weekend
 */
export const isWeekend = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Check if date is holiday (basic implementation)
 */
export const isHoliday = (date) => {
  // This is a basic implementation - in real app, you'd have a holidays database
  const holidays = [
    "2025-01-01", // New Year
    "2025-02-14", // Valentine's Day
    "2025-04-30", // Liberation Day
    "2025-05-01", // Labor Day
    "2025-09-02", // National Day
    // Add more holidays as needed
  ];

  const dateStr = new Date(date).toISOString().split("T")[0];
  return holidays.includes(dateStr);
};

/**
 * Get price for specific date
 */
export const getPriceForDate = (room, date) => {
  if (isHoliday(date)) {
    return room.holiday_price || room.weekend_price || room.price_per_night;
  } else if (isWeekend(date)) {
    return room.weekend_price || room.price_per_night;
  } else {
    return room.price_per_night;
  }
};

/**
 * Generate room slug for URL
 */
export const generateRoomSlug = (room) => {
  if (!room.room_name) return room.room_id?.toString() || "";

  return room.room_name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
};

/**
 * Get room image URL with fallback
 */
export const getRoomImageUrl = (room, index = 0, size = "medium") => {
  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

  if (room.images && room.images.length > index) {
    const image = room.images[index];
    return `${apiBaseUrl}/images/room/${image}`;
  }

  // Fallback to placeholder with size
  const dimensions =
    size === "large" ? "600/400" : size === "small" ? "200/150" : "400/300";
  return `${apiBaseUrl}/images/placeholder/${dimensions}`;
};

/**
 * Get all room images URLs
 */
export const getRoomImageUrls = (room) => {
  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

  if (!room.images || room.images.length === 0) {
    return [`${apiBaseUrl}/images/placeholder/400/300`];
  }

  return room.images.map((image) => `${apiBaseUrl}/images/room/${image}`);
};

/**
 * Filter rooms by amenities
 */
export const filterRoomsByAmenities = (rooms, requiredAmenities) => {
  if (!requiredAmenities || requiredAmenities.length === 0) return rooms;

  return rooms.filter((room) => {
    if (!room.amenities || room.amenities.length === 0) return false;

    return requiredAmenities.every((amenity) =>
      room.amenities.includes(amenity)
    );
  });
};

/**
 * Sort rooms by criteria
 */
export const sortRooms = (rooms, sortBy, sortOrder = "asc") => {
  const sortedRooms = [...rooms];

  sortedRooms.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "price":
        aValue = a.price_per_night || 0;
        bValue = b.price_per_night || 0;
        break;
      case "type":
        aValue = a.type_name || "";
        bValue = b.type_name || "";
        break;
      case "size":
        aValue = a.room_size || 0;
        bValue = b.room_size || 0;
        break;
      case "rating":
        aValue = a.average_rating || 0;
        bValue = b.average_rating || 0;
        break;
      case "name":
        aValue = a.room_name || "";
        bValue = b.room_name || "";
        break;
      case "capacity":
        aValue = a.max_occupancy || 0;
        bValue = b.max_occupancy || 0;
        break;
      default:
        return 0;
    }

    if (typeof aValue === "string") {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    } else {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

  return sortedRooms;
};

/**
 * Group rooms by type
 */
export const groupRoomsByType = (rooms) => {
  return rooms.reduce((groups, room) => {
    const type = room.type_name || "Other";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(room);
    return groups;
  }, {});
};

/**
 * Get room availability status for date range
 */
export const getRoomAvailabilityStatus = (room, checkIn, checkOut) => {
  // This would typically check against booking data
  // For now, return based on room status
  if (room.status === "available") {
    return { available: true, message: "Có sẵn" };
  } else if (room.status === "occupied") {
    return { available: false, message: "Đã được đặt" };
  } else if (room.status === "maintenance") {
    return { available: false, message: "Đang bảo trì" };
  } else {
    return { available: false, message: "Không khả dụng" };
  }
};

/**
 * Calculate discount amount
 */
export const calculateDiscount = (originalPrice, discountPercent) => {
  if (!discountPercent || discountPercent <= 0) return 0;

  return Math.round(originalPrice * (discountPercent / 100));
};

/**
 * Get room features list
 */
export const getRoomFeatures = (room) => {
  const features = [];

  if (room.wifi_available) features.push("WiFi miễn phí");
  if (room.ac_available) features.push("Điều hòa");
  if (room.tv_available) features.push("TV");
  if (room.fridge_available) features.push("Tủ lạnh");
  if (room.balcony_available) features.push("Ban công");
  if (room.bathroom_type === "private") features.push("Phòng tắm riêng");

  return features;
};

/**
 * Check if room matches search criteria
 */
export const roomMatchesCriteria = (room, criteria) => {
  // Price range
  if (criteria.minPrice && room.price_per_night < criteria.minPrice)
    return false;
  if (criteria.maxPrice && room.price_per_night > criteria.maxPrice)
    return false;

  // Capacity
  if (criteria.guests && room.max_occupancy < criteria.guests) return false;

  // Room type
  if (criteria.roomType && room.type_id !== criteria.roomType) return false;

  // Amenities
  if (criteria.amenities && criteria.amenities.length > 0) {
    const hasAllAmenities = criteria.amenities.every(
      (amenity) => room.amenities && room.amenities.includes(amenity)
    );
    if (!hasAllAmenities) return false;
  }

  // View type
  if (criteria.viewType && room.view_type !== criteria.viewType) return false;

  // Bed type
  if (criteria.bedType && room.bed_type !== criteria.bedType) return false;

  return true;
};

/**
 * Format room description
 */
export const formatRoomDescription = (room) => {
  const parts = [];

  if (room.room_size) {
    parts.push(`${room.room_size}m²`);
  }

  if (room.max_occupancy) {
    parts.push(`tối đa ${room.max_occupancy} khách`);
  }

  if (room.view_type) {
    parts.push(getViewTypeDisplay(room.view_type));
  }

  if (room.bed_type) {
    parts.push(getBedTypeDisplay(room.bed_type));
  }

  return parts.join(" • ");
};

export default {
  formatPrice,
  formatPriceNumber,
  getRoomStatusDisplay,
  getCleaningStatusDisplay,
  getViewTypeDisplay,
  getBedTypeDisplay,
  getBathroomTypeDisplay,
  getRoomCapacityText,
  canAccommodateGuests,
  calculateNights,
  calculateRoomPrice,
  isWeekend,
  isHoliday,
  getPriceForDate,
  generateRoomSlug,
  getRoomImageUrl,
  getRoomImageUrls,
  filterRoomsByAmenities,
  sortRooms,
  groupRoomsByType,
  getRoomAvailabilityStatus,
  calculateDiscount,
  getRoomFeatures,
  roomMatchesCriteria,
  formatRoomDescription,
};
