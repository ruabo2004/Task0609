import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import roomService from "@services/roomService";
import { toast } from "react-toastify";

/**
 * Hook for managing rooms data and operations
 */
export const useRooms = (params = {}) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort_by: "price",
    sort_order: "asc",
    ...params,
  });

  const queryClient = useQueryClient();

  // Query for rooms list
  const {
    data: roomsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(["rooms", filters], () => roomService.getAllRooms(filters), {
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      toast.error(error.message || "Không thể tải danh sách phòng");
    },
  });

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  // Change page
  const changePage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // Change sort
  const changeSort = useCallback((sort_by, sort_order = "asc") => {
    setFilters((prev) => ({ ...prev, sort_by, sort_order, page: 1 }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 12,
      sort_by: "price",
      sort_order: "asc",
    });
  }, []);

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation(
    (roomId) => roomService.addToFavorites(roomId),
    {
      onSuccess: () => {
        toast.success("Đã thêm vào danh sách yêu thích");
        queryClient.invalidateQueries(["favorites"]);
      },
      onError: (error) => {
        toast.error(error.message || "Không thể thêm vào danh sách yêu thích");
      },
    }
  );

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation(
    (roomId) => roomService.removeFromFavorites(roomId),
    {
      onSuccess: () => {
        toast.success("Đã xóa khỏi danh sách yêu thích");
        queryClient.invalidateQueries(["favorites"]);
      },
      onError: (error) => {
        toast.error(error.message || "Không thể xóa khỏi danh sách yêu thích");
      },
    }
  );

  // Debug raw data
  console.log("🔧 useRooms - Raw API response:", roomsData);

  const rooms = roomsData?.data?.rooms || [];
  const pagination = roomsData?.data?.pagination || {};
  const meta = roomsData?.data?.meta || {};

  return {
    // Data
    rooms,
    pagination,
    meta,
    filters,

    // Loading states
    isLoading,
    isError,
    error,

    // Actions
    updateFilters,
    changePage,
    changeSort,
    resetFilters,
    refetch,

    // Mutations
    addToFavorites: addToFavoritesMutation.mutate,
    removeFromFavorites: removeFromFavoritesMutation.mutate,
    isAddingToFavorites: addToFavoritesMutation.isLoading,
    isRemovingFromFavorites: removeFromFavoritesMutation.isLoading,
  };
};

/**
 * Hook for getting a single room by ID
 */
export const useRoom = (roomId) => {
  const {
    data: roomData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(["room", roomId], () => roomService.getRoomById(roomId), {
    enabled: !!roomId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    onError: (error) => {
      toast.error(error.message || "Không thể tải thông tin phòng");
    },
  });

  const room = roomData?.data?.room || null;

  return {
    room,
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook for checking room availability
 */
export const useRoomAvailability = (roomId, checkInDate, checkOutDate) => {
  const {
    data: availabilityData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ["room-availability", roomId, checkInDate, checkOutDate],
    () => roomService.checkRoomAvailability(roomId, checkInDate, checkOutDate),
    {
      enabled: !!(roomId && checkInDate && checkOutDate),
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        // Don't show toast for availability errors
        console.warn("Room availability check failed:", error);
      },
    }
  );

  const availability = availabilityData?.data || null;

  return {
    availability,
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook for getting available rooms for date range
 */
export const useAvailableRooms = (checkInDate, checkOutDate) => {
  const {
    data: availableRoomsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ["available-rooms", checkInDate, checkOutDate],
    () => roomService.getAvailableRooms(checkInDate, checkOutDate),
    {
      enabled: !!(checkInDate && checkOutDate),
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        toast.error(error.message || "Không thể tải danh sách phòng trống");
      },
    }
  );

  const availableRooms = availableRoomsData?.data?.rooms || [];
  const dateRange = availableRoomsData?.data?.date_range || {};

  return {
    availableRooms,
    dateRange,
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook for getting room pricing
 */
export const useRoomPricing = (
  roomId,
  checkInDate,
  checkOutDate,
  guests = {}
) => {
  const {
    data: pricingData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ["room-pricing", roomId, checkInDate, checkOutDate, guests],
    () => roomService.getRoomPricing(roomId, checkInDate, checkOutDate, guests),
    {
      enabled: !!(roomId && checkInDate && checkOutDate),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.warn("Room pricing fetch failed:", error);
      },
    }
  );

  const pricing = pricingData?.data?.pricing || null;

  return {
    pricing,
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook for getting similar rooms
 */
export const useSimilarRooms = (roomId, limit = 4) => {
  const {
    data: similarRoomsData,
    isLoading,
    isError,
    error,
  } = useQuery(
    ["similar-rooms", roomId, limit],
    () => roomService.getSimilarRooms(roomId, limit),
    {
      enabled: !!roomId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error) => {
        console.warn("Similar rooms fetch failed:", error);
      },
    }
  );

  const similarRooms = similarRoomsData?.data?.rooms || [];

  return {
    similarRooms,
    isLoading,
    isError,
    error,
  };
};

/**
 * Hook for getting user's favorite rooms
 */
export const useFavoriteRooms = (params = {}) => {
  const {
    data: favoritesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ["favorites", params],
    () => roomService.getFavoriteRooms(params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        toast.error(error.message || "Không thể tải danh sách yêu thích");
      },
    }
  );

  const favoriteRooms = favoritesData?.data?.rooms || [];
  const pagination = favoritesData?.data?.pagination || {};

  return {
    favoriteRooms,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useRooms;
