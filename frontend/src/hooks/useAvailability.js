import { useState, useCallback, useMemo } from "react";
import { useQuery } from "react-query";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  isValid as isValidDate,
} from "date-fns";
import bookingService from "@services/bookingService";

/**
 * Hook for managing room availability checking
 * @param {Object} options - Hook options
 * @returns {Object} Availability management functions and state
 */
export const useAvailability = (options = {}) => {
  const {
    roomId,
    autoCheck = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 2 * 60 * 1000, // 2 minutes
  } = options;

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  const [checkParams, setCheckParams] = useState({
    room_id: roomId || null,
    check_in_date: "",
    check_out_date: "",
    guests: 1,
  });

  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // ==========================================
  // AVAILABILITY QUERY
  // ==========================================

  const {
    data: availabilityData,
    isLoading: isCheckingAvailability,
    error: availabilityError,
    refetch: recheckAvailability,
  } = useQuery(
    ["availability", checkParams],
    () => bookingService.checkAvailability(checkParams),
    {
      enabled:
        autoCheck &&
        !!checkParams.room_id &&
        !!checkParams.check_in_date &&
        !!checkParams.check_out_date &&
        checkParams.guests > 0,
      staleTime,
      cacheTime,
      retry: 2,
      onError: (error) => {
        console.error("Availability check error:", error);
      },
    }
  );

  // ==========================================
  // CALENDAR AVAILABILITY QUERY
  // ==========================================

  const calendarQueryParams = useMemo(() => {
    const startDate = startOfMonth(calendarMonth);
    const endDate = endOfMonth(calendarMonth);

    return {
      room_id: roomId,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    };
  }, [roomId, calendarMonth]);

  const {
    data: calendarAvailabilityData,
    isLoading: isLoadingCalendar,
    error: calendarError,
  } = useQuery(
    ["calendar-availability", calendarQueryParams],
    () =>
      bookingService.getCalendarAvailability?.(calendarQueryParams) ||
      Promise.resolve({ data: { available_dates: [], blocked_dates: [] } }),
    {
      enabled: !!roomId && autoCheck,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  // ==========================================
  // TIME SLOTS QUERY
  // ==========================================

  const [timeSlotDate, setTimeSlotDate] = useState("");

  const {
    data: timeSlotsData,
    isLoading: isLoadingTimeSlots,
    error: timeSlotsError,
  } = useQuery(
    ["time-slots", roomId, timeSlotDate],
    () =>
      bookingService.getAvailableTimeSlots({
        room_id: roomId,
        date: timeSlotDate,
        duration_hours: 1,
      }),
    {
      enabled: !!roomId && !!timeSlotDate && autoCheck,
      staleTime,
      cacheTime,
    }
  );

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const availability = useMemo(() => {
    return availabilityData?.data || null;
  }, [availabilityData]);

  const isAvailable = useMemo(() => {
    return availability?.available === true;
  }, [availability]);

  const availabilityMessage = useMemo(() => {
    if (!availability) return "";
    return (
      availability.message ||
      (isAvailable ? "Phòng có sẵn" : "Phòng không có sẵn")
    );
  }, [availability, isAvailable]);

  const calendarAvailability = useMemo(() => {
    return (
      calendarAvailabilityData?.data || {
        available_dates: [],
        blocked_dates: [],
      }
    );
  }, [calendarAvailabilityData]);

  const timeSlots = useMemo(() => {
    return timeSlotsData?.data?.time_slots || [];
  }, [timeSlotsData]);

  // Generate calendar days with availability status
  const calendarDays = useMemo(() => {
    const startDate = startOfMonth(calendarMonth);
    const endDate = endOfMonth(calendarMonth);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const { available_dates = [], blocked_dates = [] } = calendarAvailability;

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const isAvailable = available_dates.includes(dateStr);
      const isBlocked = blocked_dates.includes(dateStr);
      const isPast = isBefore(day, new Date());

      return {
        date: day,
        dateStr,
        isAvailable: isAvailable && !isPast,
        isBlocked: isBlocked || isPast,
        isPast,
        isToday: isEqual(day, new Date()),
        isSelected: isDateInRange(day, selectedDateRange),
        isRangeStart:
          selectedDateRange.startDate &&
          isEqual(day, selectedDateRange.startDate),
        isRangeEnd:
          selectedDateRange.endDate && isEqual(day, selectedDateRange.endDate),
        isInRange: isDateInRange(day, selectedDateRange, false),
      };
    });
  }, [calendarMonth, calendarAvailability, selectedDateRange]);

  // Check if dates are valid for booking
  const isDateRangeValid = useMemo(() => {
    const { startDate, endDate } = selectedDateRange;
    if (!startDate || !endDate) return false;

    return isAfter(endDate, startDate) && isAfter(startDate, new Date());
  }, [selectedDateRange]);

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  // Check if a date is in the selected range
  const isDateInRange = useCallback((date, range, includeEnds = true) => {
    const { startDate, endDate } = range;
    if (!startDate || !endDate) return false;

    if (includeEnds) {
      return (
        isEqual(date, startDate) ||
        isEqual(date, endDate) ||
        (isAfter(date, startDate) && isBefore(date, endDate))
      );
    } else {
      return isAfter(date, startDate) && isBefore(date, endDate);
    }
  }, []);

  // Get availability status for a specific date
  const getDateAvailability = useCallback(
    (date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const { available_dates = [], blocked_dates = [] } = calendarAvailability;

      if (blocked_dates.includes(dateStr) || isBefore(date, new Date())) {
        return { available: false, reason: "blocked" };
      }

      if (available_dates.includes(dateStr)) {
        return { available: true, reason: "available" };
      }

      return { available: false, reason: "unknown" };
    },
    [calendarAvailability]
  );

  // ==========================================
  // ACTION FUNCTIONS
  // ==========================================

  // Check availability for specific dates and guests
  const checkAvailability = useCallback(
    async (params) => {
      const newParams = {
        room_id: roomId,
        ...params,
      };

      setCheckParams(newParams);

      if (autoCheck) {
        return recheckAvailability();
      } else {
        // Manual check
        try {
          const result = await bookingService.checkAvailability(newParams);
          return result.data;
        } catch (error) {
          throw error;
        }
      }
    },
    [roomId, autoCheck, recheckAvailability]
  );

  // Select date range
  const selectDateRange = useCallback(
    (startDate, endDate) => {
      const newRange = {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      };

      setSelectedDateRange(newRange);

      // Auto-check availability if range is complete
      if (newRange.startDate && newRange.endDate && autoCheck) {
        const params = {
          check_in_date: format(newRange.startDate, "yyyy-MM-dd"),
          check_out_date: format(newRange.endDate, "yyyy-MM-dd"),
          guests: checkParams.guests,
        };

        setCheckParams((prev) => ({ ...prev, ...params }));
      }
    },
    [autoCheck, checkParams.guests]
  );

  // Select single date (for check-in or check-out)
  const selectDate = useCallback(
    (date, type = "check_in") => {
      const selectedDate = new Date(date);

      if (type === "check_in") {
        const newRange = {
          startDate: selectedDate,
          endDate:
            selectedDateRange.endDate &&
            isAfter(selectedDateRange.endDate, selectedDate)
              ? selectedDateRange.endDate
              : null,
        };
        setSelectedDateRange(newRange);
      } else if (type === "check_out") {
        const newRange = {
          startDate:
            selectedDateRange.startDate &&
            isBefore(selectedDateRange.startDate, selectedDate)
              ? selectedDateRange.startDate
              : null,
          endDate: selectedDate,
        };
        setSelectedDateRange(newRange);
      }
    },
    [selectedDateRange]
  );

  // Clear date selection
  const clearDateSelection = useCallback(() => {
    setSelectedDateRange({ startDate: null, endDate: null });
    setCheckParams((prev) => ({
      ...prev,
      check_in_date: "",
      check_out_date: "",
    }));
  }, []);

  // Navigate calendar
  const navigateCalendar = useCallback((direction) => {
    if (direction === "next") {
      setCalendarMonth((prev) => addDays(endOfMonth(prev), 1));
    } else if (direction === "prev") {
      setCalendarMonth((prev) => addDays(startOfMonth(prev), -1));
    }
  }, []);

  // Go to specific month
  const goToMonth = useCallback((date) => {
    setCalendarMonth(new Date(date));
  }, []);

  // Set guest count
  const setGuestCount = useCallback((count) => {
    setCheckParams((prev) => ({ ...prev, guests: Math.max(1, count) }));
  }, []);

  // Load time slots for a specific date
  const loadTimeSlots = useCallback((date) => {
    const dateStr = format(new Date(date), "yyyy-MM-dd");
    setTimeSlotDate(dateStr);
  }, []);

  // ==========================================
  // VALIDATION FUNCTIONS
  // ==========================================

  // Check if a date range is bookable
  const isRangeBookable = useCallback(
    (startDate, endDate) => {
      if (!startDate || !endDate) return false;

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Check if dates are valid
      if (!isValidDate(start) || !isValidDate(end)) return false;

      // Check if range is valid (end after start, start after today)
      if (!isAfter(end, start) || !isAfter(start, new Date())) return false;

      // Check each day in range for availability
      const days = eachDayOfInterval({ start, end: addDays(end, -1) }); // Exclude checkout date

      return days.every((day) => {
        const availability = getDateAvailability(day);
        return availability.available;
      });
    },
    [getDateAvailability]
  );

  // Get minimum stay requirements
  const getMinimumStay = useCallback(
    (date) => {
      // This would typically come from the API
      // For now, return default minimum stay
      return availability?.minimum_stay || 1;
    },
    [availability]
  );

  // ==========================================
  // RETURN VALUES
  // ==========================================

  return {
    // Availability data
    availability,
    isAvailable,
    availabilityMessage,
    isCheckingAvailability,
    availabilityError,

    // Calendar data
    calendarDays,
    calendarMonth,
    isLoadingCalendar,
    calendarError,

    // Time slots
    timeSlots,
    isLoadingTimeSlots,
    timeSlotsError,

    // Date selection
    selectedDateRange,
    isDateRangeValid,

    // Check parameters
    checkParams,

    // Actions
    checkAvailability,
    recheckAvailability,
    selectDateRange,
    selectDate,
    clearDateSelection,
    navigateCalendar,
    goToMonth,
    setGuestCount,
    loadTimeSlots,

    // Utility functions
    getDateAvailability,
    isRangeBookable,
    getMinimumStay,
    isDateInRange,

    // Loading states
    isLoading: isCheckingAvailability || isLoadingCalendar,
    hasError: !!availabilityError || !!calendarError || !!timeSlotsError,
    error: availabilityError || calendarError || timeSlotsError,
  };
};

export default useAvailability;


