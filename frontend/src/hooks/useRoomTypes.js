import { useQuery } from "react-query";
import roomService from "@services/roomService";
import { toast } from "react-toastify";

/**
 * Hook for managing room types data
 */
export const useRoomTypes = () => {
  const {
    data: roomTypesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(["room-types"], () => roomService.getRoomTypes(), {
    staleTime: 30 * 60 * 1000, // 30 minutes - room types don't change often
    cacheTime: 60 * 60 * 1000, // 1 hour
    onError: (error) => {
      toast.error(error.message || "Không thể tải danh sách loại phòng");
    },
  });

  const roomTypes = roomTypesData?.data?.room_types || [];

  // Helper function to get room type by ID
  const getRoomTypeById = (typeId) => {
    return roomTypes.find((type) => type.type_id === typeId) || null;
  };

  // Helper function to get room type by name
  const getRoomTypeByName = (typeName) => {
    return (
      roomTypes.find(
        (type) => type.type_name.toLowerCase() === typeName.toLowerCase()
      ) || null
    );
  };

  // Get available room types (status = 'active')
  const getAvailableRoomTypes = () => {
    return roomTypes.filter((type) => type.status === "active");
  };

  // Get room types with available rooms
  const getRoomTypesWithAvailability = () => {
    return roomTypes.filter((type) => type.available_count > 0);
  };

  // Get room types sorted by price
  const getRoomTypesByPrice = (order = "asc") => {
    return [...roomTypes].sort((a, b) => {
      if (order === "asc") {
        return a.base_price - b.base_price;
      } else {
        return b.base_price - a.base_price;
      }
    });
  };

  // Get room types sorted by popularity (room count)
  const getRoomTypesByPopularity = () => {
    return [...roomTypes].sort((a, b) => b.room_count - a.room_count);
  };

  // Get room types that match guest capacity
  const getRoomTypesByCapacity = (guestCount) => {
    return roomTypes.filter((type) => type.max_occupancy >= guestCount);
  };

  // Get price range for all room types
  const getPriceRange = () => {
    if (roomTypes.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = roomTypes.map((type) => type.base_price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  };

  // Get unique amenities across all room types
  const getAllAmenities = () => {
    const amenitiesSet = new Set();
    roomTypes.forEach((type) => {
      if (type.amenities && Array.isArray(type.amenities)) {
        type.amenities.forEach((amenity) => amenitiesSet.add(amenity));
      }
    });
    return Array.from(amenitiesSet).sort();
  };

  // Filter room types by amenities
  const filterByAmenities = (requiredAmenities = []) => {
    if (requiredAmenities.length === 0) return roomTypes;

    return roomTypes.filter((type) => {
      if (!type.amenities || !Array.isArray(type.amenities)) return false;

      return requiredAmenities.every((amenity) =>
        type.amenities.includes(amenity)
      );
    });
  };

  // Filter room types by price range
  const filterByPriceRange = (minPrice, maxPrice) => {
    return roomTypes.filter((type) => {
      const price = type.base_price;
      return price >= minPrice && price <= maxPrice;
    });
  };

  return {
    // Data
    roomTypes,
    isLoading,
    isError,
    error,

    // Actions
    refetch,

    // Helper functions
    getRoomTypeById,
    getRoomTypeByName,
    getAvailableRoomTypes,
    getRoomTypesWithAvailability,
    getRoomTypesByPrice,
    getRoomTypesByPopularity,
    getRoomTypesByCapacity,
    getPriceRange,
    getAllAmenities,
    filterByAmenities,
    filterByPriceRange,
  };
};

/**
 * Hook for getting rooms of a specific type
 */
export const useRoomsByType = (typeId, params = {}) => {
  const {
    data: roomsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ["rooms-by-type", typeId, params],
    () => roomService.getRoomsByType(typeId, params),
    {
      enabled: !!typeId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        toast.error(error.message || "Không thể tải danh sách phòng theo loại");
      },
    }
  );

  const rooms = roomsData?.data?.rooms || [];
  const typeInfo = roomsData?.data?.type_info || {};
  const pagination = roomsData?.data?.pagination || {};

  return {
    rooms,
    typeInfo,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useRoomTypes;
