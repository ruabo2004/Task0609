import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import bookingService from "@services/bookingService";

/**
 * Hook for managing bookings
 * @param {Object} options - Hook options
 * @returns {Object} Booking management functions and state
 */
export const useBookings = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    autoRefetch = true,
    enableNotifications = true,
    cacheTime = 10 * 60 * 1000, // 10 minutes
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 10,
    sort_by: "created_at",
    sort_order: "desc",
  });

  // ==========================================
  // QUERIES
  // ==========================================

  // Get user bookings
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery(
    ["bookings", filters],
    () => bookingService.getUserBookings(filters),
    {
      enabled: autoRefetch,
      keepPreviousData: true,
      staleTime,
      cacheTime,
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể tải danh sách booking");
        }
      },
    }
  );

  // Get booking statistics
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery(["booking-stats"], () => bookingService.getBookingStats(), {
    enabled: autoRefetch,
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    onError: (error) => {
      console.error("Error loading booking stats:", error);
    },
  });

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Create booking
  const createBookingMutation = useMutation(
    (bookingData) => bookingService.createBooking(bookingData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["bookings"]);
        queryClient.invalidateQueries(["booking-stats"]);

        if (enableNotifications) {
          toast.success("Đặt phòng thành công!");
        }

        return data;
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể tạo booking");
        }
      },
    }
  );

  // Update booking status
  const updateBookingStatusMutation = useMutation(
    ({ bookingId, status, notes }) =>
      bookingService.updateBookingStatus(bookingId, status, notes),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["bookings"]);
        queryClient.invalidateQueries(["booking", variables.bookingId]);

        if (enableNotifications) {
          toast.success("Cập nhật trạng thái booking thành công!");
        }

        return data;
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể cập nhật trạng thái booking");
        }
      },
    }
  );

  // Cancel booking
  const cancelBookingMutation = useMutation(
    ({ bookingId, reason }) => bookingService.cancelBooking(bookingId, reason),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["bookings"]);
        queryClient.invalidateQueries(["booking", variables.bookingId]);

        if (enableNotifications) {
          toast.success("Hủy booking thành công!");
        }

        return data;
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể hủy booking");
        }
      },
    }
  );

  // Modify booking dates
  const modifyBookingDatesMutation = useMutation(
    ({ bookingId, newDates }) =>
      bookingService.modifyBookingDates(bookingId, newDates),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["bookings"]);
        queryClient.invalidateQueries(["booking", variables.bookingId]);

        if (enableNotifications) {
          toast.success("Thay đổi ngày booking thành công!");
        }

        return data;
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể thay đổi ngày booking");
        }
      },
    }
  );

  // Add guests to booking
  const addGuestsMutation = useMutation(
    ({ bookingId, guests }) =>
      bookingService.addGuestsToBooking(bookingId, guests),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["booking", variables.bookingId]);

        if (enableNotifications) {
          toast.success("Thêm khách thành công!");
        }

        return data;
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể thêm khách");
        }
      },
    }
  );

  // Submit review
  const submitReviewMutation = useMutation(
    ({ bookingId, reviewData }) =>
      bookingService.submitReview(bookingId, reviewData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["booking", variables.bookingId]);
        queryClient.invalidateQueries(["bookings"]);

        if (enableNotifications) {
          toast.success("Gửi đánh giá thành công!");
        }

        return data;
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể gửi đánh giá");
        }
      },
    }
  );

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const bookings = useMemo(() => {
    return bookingsData?.data?.bookings || [];
  }, [bookingsData]);

  const pagination = useMemo(() => {
    return bookingsData?.data?.pagination || {};
  }, [bookingsData]);

  const stats = useMemo(() => {
    return statsData?.data || {};
  }, [statsData]);

  // Filter bookings by status
  const activeBookings = useMemo(() => {
    return bookings.filter((booking) =>
      ["confirmed", "checked_in"].includes(booking.status)
    );
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === "completed");
  }, [bookings]);

  const cancelledBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === "cancelled");
  }, [bookings]);

  const pendingBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === "pending");
  }, [bookings]);

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1, // Reset to page 1 when filters change
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      status: "",
      page: 1,
      limit: 10,
      sort_by: "created_at",
      sort_order: "desc",
    });
  }, []);

  // Handle pagination
  const handlePageChange = useCallback(
    (page) => {
      updateFilters({ page });
    },
    [updateFilters]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (sortBy, sortOrder = "desc") => {
      updateFilters({
        sort_by: sortBy,
        sort_order: sortOrder,
        page: 1,
      });
    },
    [updateFilters]
  );

  // Create booking
  const createBooking = useCallback(
    async (bookingData) => {
      try {
        const result = await createBookingMutation.mutateAsync(bookingData);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [createBookingMutation]
  );

  // Update booking status
  const updateBookingStatus = useCallback(
    async (bookingId, status, notes = "") => {
      try {
        const result = await updateBookingStatusMutation.mutateAsync({
          bookingId,
          status,
          notes,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [updateBookingStatusMutation]
  );

  // Cancel booking
  const cancelBooking = useCallback(
    async (bookingId, reason = "") => {
      try {
        const result = await cancelBookingMutation.mutateAsync({
          bookingId,
          reason,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [cancelBookingMutation]
  );

  // Modify booking dates
  const modifyBookingDates = useCallback(
    async (bookingId, newDates) => {
      try {
        const result = await modifyBookingDatesMutation.mutateAsync({
          bookingId,
          newDates,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [modifyBookingDatesMutation]
  );

  // Add guests
  const addGuests = useCallback(
    async (bookingId, guests) => {
      try {
        const result = await addGuestsMutation.mutateAsync({
          bookingId,
          guests,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [addGuestsMutation]
  );

  // Submit review
  const submitReview = useCallback(
    async (bookingId, reviewData) => {
      try {
        const result = await submitReviewMutation.mutateAsync({
          bookingId,
          reviewData,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [submitReviewMutation]
  );

  // ==========================================
  // RETURN VALUES
  // ==========================================

  return {
    // Data
    bookings,
    pagination,
    stats,
    activeBookings,
    completedBookings,
    cancelledBookings,
    pendingBookings,

    // Loading states
    isLoading: isLoadingBookings,
    isLoadingStats,
    isCreating: createBookingMutation.isLoading,
    isUpdating: updateBookingStatusMutation.isLoading,
    isCancelling: cancelBookingMutation.isLoading,
    isModifying: modifyBookingDatesMutation.isLoading,
    isAddingGuests: addGuestsMutation.isLoading,
    isSubmittingReview: submitReviewMutation.isLoading,

    // Error states
    error: bookingsError,
    statsError,
    createError: createBookingMutation.error,
    updateError: updateBookingStatusMutation.error,
    cancelError: cancelBookingMutation.error,
    modifyError: modifyBookingDatesMutation.error,
    addGuestsError: addGuestsMutation.error,
    reviewError: submitReviewMutation.error,

    // Actions
    createBooking,
    updateBookingStatus,
    cancelBooking,
    modifyBookingDates,
    addGuests,
    submitReview,
    refetchBookings,

    // Filter management
    filters,
    updateFilters,
    resetFilters,
    handlePageChange,
    handleSortChange,

    // Utility functions
    hasActiveFilters: Object.values(filters).some(
      (value) =>
        value !== "" &&
        value !== 1 &&
        value !== 10 &&
        value !== "created_at" &&
        value !== "desc"
    ),
    totalBookings: pagination.total_items || 0,
    hasNextPage: pagination.has_next_page || false,
    hasPrevPage: pagination.has_prev_page || false,
  };
};

/**
 * Hook for managing a single booking
 * @param {number} bookingId - Booking ID
 * @param {Object} options - Hook options
 * @returns {Object} Single booking management functions and state
 */
export const useBooking = (bookingId, options = {}) => {
  const queryClient = useQueryClient();
  const {
    enabled = true,
    refetchInterval = false,
    enableNotifications = true,
  } = options;

  // Get single booking
  const {
    data: bookingData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["booking", bookingId],
    () => bookingService.getBookingById(bookingId),
    {
      enabled: enabled && !!bookingId,
      refetchInterval,
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể tải thông tin booking");
        }
      },
    }
  );

  const booking = useMemo(() => {
    return bookingData?.data || null;
  }, [bookingData]);

  return {
    booking,
    isLoading,
    error,
    refetch,
  };
};

export default useBookings;


