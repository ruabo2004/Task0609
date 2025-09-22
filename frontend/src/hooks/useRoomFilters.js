import { useState, useCallback, useMemo } from "react";
import { useRoomTypes } from "@hooks/useRoomTypes";

/**
 * Hook for managing room search filters
 */
export const useRoomFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    // Price filters
    min_price: null,
    max_price: null,

    // Date filters
    check_in_date: null,
    check_out_date: null,

    // Guest filters
    num_adults: 1,
    num_children: 0,

    // Room type filters
    type_id: null,

    // Amenity filters
    amenities: [],

    // Location/View filters
    view_type: null,
    floor_number: null,

    // Bed type filters
    bed_type: null,

    // Feature filters
    wifi_required: false,
    balcony_required: false,
    smoking_allowed: false,
    pet_allowed: false,

    // Availability filters
    available_only: true,

    ...initialFilters,
  });

  const { roomTypes, getPriceRange, getAllAmenities } = useRoomTypes();

  // Update single filter
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Update multiple filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      min_price: null,
      max_price: null,
      check_in_date: null,
      check_out_date: null,
      num_adults: 1,
      num_children: 0,
      type_id: null,
      amenities: [],
      view_type: null,
      floor_number: null,
      bed_type: null,
      wifi_required: false,
      balcony_required: false,
      smoking_allowed: false,
      pet_allowed: false,
      available_only: true,
    });
  }, []);

  // Reset specific filter category
  const resetFilterCategory = useCallback(
    (category) => {
      switch (category) {
        case "price":
          updateFilters({ min_price: null, max_price: null });
          break;
        case "dates":
          updateFilters({ check_in_date: null, check_out_date: null });
          break;
        case "guests":
          updateFilters({ num_adults: 1, num_children: 0 });
          break;
        case "amenities":
          updateFilters({ amenities: [] });
          break;
        case "features":
          updateFilters({
            wifi_required: false,
            balcony_required: false,
            smoking_allowed: false,
            pet_allowed: false,
          });
          break;
        case "room":
          updateFilters({
            type_id: null,
            view_type: null,
            bed_type: null,
            floor_number: null,
          });
          break;
        default:
          break;
      }
    },
    [updateFilters]
  );

  // Toggle amenity filter
  const toggleAmenity = useCallback((amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  // Set price range
  const setPriceRange = useCallback(
    (min, max) => {
      updateFilters({ min_price: min, max_price: max });
    },
    [updateFilters]
  );

  // Set date range
  const setDateRange = useCallback(
    (checkIn, checkOut) => {
      updateFilters({
        check_in_date: checkIn,
        check_out_date: checkOut,
      });
    },
    [updateFilters]
  );

  // Set guest count
  const setGuestCount = useCallback(
    (adults, children = 0) => {
      updateFilters({
        num_adults: adults,
        num_children: children,
      });
    },
    [updateFilters]
  );

  // Toggle boolean filter
  const toggleBooleanFilter = useCallback((key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Get active filters count
  const getActiveFiltersCount = useMemo(() => {
    let count = 0;

    // Price filters
    if (filters.min_price !== null || filters.max_price !== null) count++;

    // Date filters
    if (filters.check_in_date || filters.check_out_date) count++;

    // Guest filters (if different from default)
    if (filters.num_adults !== 1 || filters.num_children !== 0) count++;

    // Room type
    if (filters.type_id) count++;

    // Amenities
    if (filters.amenities.length > 0) count++;

    // Room features
    if (filters.view_type || filters.bed_type || filters.floor_number) count++;

    // Boolean features
    if (
      filters.wifi_required ||
      filters.balcony_required ||
      filters.smoking_allowed ||
      filters.pet_allowed
    )
      count++;

    return count;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = getActiveFiltersCount > 0;

  // Get filter options
  const filterOptions = useMemo(() => {
    const priceRange = getPriceRange();
    const allAmenities = getAllAmenities();

    return {
      priceRange,
      roomTypes: roomTypes || [],
      amenities: allAmenities,
      viewTypes: [
        { value: "sea", label: "View biển" },
        { value: "mountain", label: "View núi" },
        { value: "city", label: "View thành phố" },
        { value: "garden", label: "View vườn" },
        { value: "pool", label: "View hồ bơi" },
      ],
      bedTypes: [
        { value: "single", label: "Giường đơn" },
        { value: "double", label: "Giường đôi" },
        { value: "queen", label: "Giường Queen" },
        { value: "king", label: "Giường King" },
        { value: "twin", label: "Hai giường đơn" },
      ],
      floorNumbers: Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: `Tầng ${i + 1}`,
      })),
    };
  }, [roomTypes, getPriceRange, getAllAmenities]);

  // Get clean filters (remove null/empty values)
  const getCleanFilters = useMemo(() => {
    const cleanFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        cleanFilters[key] = value;
      }
    });

    return cleanFilters;
  }, [filters]);

  // Get filter summary for display
  const getFilterSummary = useMemo(() => {
    const summary = [];

    // Price range
    if (filters.min_price !== null || filters.max_price !== null) {
      const min = filters.min_price
        ? `${filters.min_price.toLocaleString()}đ`
        : "";
      const max = filters.max_price
        ? `${filters.max_price.toLocaleString()}đ`
        : "";
      if (min && max) {
        summary.push(`Giá: ${min} - ${max}`);
      } else if (min) {
        summary.push(`Giá từ: ${min}`);
      } else if (max) {
        summary.push(`Giá đến: ${max}`);
      }
    }

    // Guest count
    if (filters.num_adults !== 1 || filters.num_children !== 0) {
      const adults = `${filters.num_adults} người lớn`;
      const children =
        filters.num_children > 0 ? `, ${filters.num_children} trẻ em` : "";
      summary.push(`${adults}${children}`);
    }

    // Room type
    if (filters.type_id) {
      const roomType = roomTypes.find(
        (type) => type.type_id === filters.type_id
      );
      if (roomType) {
        summary.push(roomType.type_name);
      }
    }

    // Amenities
    if (filters.amenities.length > 0) {
      summary.push(`${filters.amenities.length} tiện nghi`);
    }

    // View type
    if (filters.view_type) {
      const viewType = filterOptions.viewTypes.find(
        (v) => v.value === filters.view_type
      );
      if (viewType) {
        summary.push(viewType.label);
      }
    }

    // Bed type
    if (filters.bed_type) {
      const bedType = filterOptions.bedTypes.find(
        (b) => b.value === filters.bed_type
      );
      if (bedType) {
        summary.push(bedType.label);
      }
    }

    return summary;
  }, [filters, roomTypes, filterOptions]);

  // Validate date range
  const validateDateRange = useMemo(() => {
    if (!filters.check_in_date || !filters.check_out_date) {
      return { isValid: true, error: null };
    }

    const checkIn = new Date(filters.check_in_date);
    const checkOut = new Date(filters.check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return { isValid: false, error: "Ngày check-in không thể trong quá khứ" };
    }

    if (checkOut <= checkIn) {
      return { isValid: false, error: "Ngày check-out phải sau ngày check-in" };
    }

    return { isValid: true, error: null };
  }, [filters.check_in_date, filters.check_out_date]);

  return {
    // Current filters
    filters,
    cleanFilters: getCleanFilters,

    // Filter state
    hasActiveFilters,
    activeFiltersCount: getActiveFiltersCount,
    filterSummary: getFilterSummary,

    // Filter options
    filterOptions,

    // Validation
    dateValidation: validateDateRange,

    // Actions
    updateFilter,
    updateFilters,
    resetFilters,
    resetFilterCategory,
    toggleAmenity,
    setPriceRange,
    setDateRange,
    setGuestCount,
    toggleBooleanFilter,
  };
};

export default useRoomFilters;
