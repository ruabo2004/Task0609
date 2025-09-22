import api from "./api";
import { API_ENDPOINTS } from "@utils/constants";

/**
 * Room Service
 * Handles all room-related API calls
 */
class RoomService {
  /**
   * Get all rooms with pagination and sorting
   */
  async getAllRooms(params = {}) {
    try {
      const {
        page = 1,
        limit = 12,
        sort_by = "price",
        sort_order = "asc",
        ...filters
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by,
        sort_order,
      });

      // Add valid filters only
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          value !== false
        ) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/rooms?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId) {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all room types
   */
  async getRoomTypes() {
    try {
      const response = await api.get("/rooms/types");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search rooms with advanced filters
   */
  async searchRooms(searchParams = {}) {
    try {
      const {
        check_in_date,
        check_out_date,
        num_adults = 1,
        num_children = 0,
        type_id,
        min_price,
        max_price,
        view_type,
        bed_type,
        amenities,
        floor_number,
        wifi_required,
        balcony_required,
        page = 1,
        limit = 12,
        sort_by = "price",
        sort_order = "asc",
      } = searchParams;

      const params = new URLSearchParams();

      // Add all non-null parameters
      if (check_in_date) params.append("check_in_date", check_in_date);
      if (check_out_date) params.append("check_out_date", check_out_date);
      if (num_adults) params.append("num_adults", num_adults.toString());
      if (num_children) params.append("num_children", num_children.toString());
      if (type_id) params.append("type_id", type_id.toString());
      if (min_price) params.append("min_price", min_price.toString());
      if (max_price) params.append("max_price", max_price.toString());
      if (view_type) params.append("view_type", view_type);
      if (bed_type) params.append("bed_type", bed_type);
      if (amenities) params.append("amenities", amenities);
      if (floor_number) params.append("floor_number", floor_number.toString());
      if (wifi_required !== undefined)
        params.append("wifi_required", wifi_required.toString());
      if (balcony_required !== undefined)
        params.append("balcony_required", balcony_required.toString());

      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sort_by", sort_by);
      params.append("sort_order", sort_order);

      const response = await api.get(`/rooms/search?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available rooms for specific dates
   */
  async getAvailableRooms(checkInDate, checkOutDate) {
    try {
      const params = new URLSearchParams({
        checkInDate,
        checkOutDate,
      });

      const response = await api.get(`/rooms/available?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get rooms by type
   */
  async getRoomsByType(typeId, params = {}) {
    try {
      const { page = 1, limit = 12, status = "available" } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
      });

      const response = await api.get(`/rooms/type/${typeId}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check room availability for specific dates
   */
  async checkRoomAvailability(roomId, checkInDate, checkOutDate) {
    try {
      const params = new URLSearchParams({
        checkInDate,
        checkOutDate,
      });

      const response = await api.get(`/rooms/${roomId}/availability?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get room pricing for specific dates
   */
  async getRoomPricing(roomId, checkInDate, checkOutDate, guests = {}) {
    try {
      const { num_adults = 1, num_children = 0 } = guests;

      const params = new URLSearchParams({
        checkInDate,
        checkOutDate,
        num_adults: num_adults.toString(),
        num_children: num_children.toString(),
      });

      const response = await api.get(`/rooms/${roomId}/pricing?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get room amenities and features
   */
  async getRoomAmenities(roomId) {
    try {
      const response = await api.get(`/rooms/${roomId}/amenities`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get room images
   */
  async getRoomImages(roomId) {
    try {
      const response = await api.get(`/rooms/${roomId}/images`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get similar rooms
   */
  async getSimilarRooms(roomId, limit = 4) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await api.get(`/rooms/${roomId}/similar?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get room reviews
   */
  async getRoomReviews(roomId, params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort_by = "created_at",
        sort_order = "desc",
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by,
        sort_order,
      });

      const response = await api.get(`/rooms/${roomId}/reviews?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add room to favorites (if authenticated)
   */
  async addToFavorites(roomId) {
    try {
      const response = await api.post(`/rooms/${roomId}/favorite`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove room from favorites
   */
  async removeFromFavorites(roomId) {
    try {
      const response = await api.delete(`/rooms/${roomId}/favorite`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's favorite rooms
   */
  async getFavoriteRooms(params = {}) {
    try {
      const { page = 1, limit = 12 } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/rooms/favorites?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        message: data?.message || "Có lỗi xảy ra khi lấy thông tin phòng",
        status,
        errors: data?.errors || [],
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: "Không thể kết nối đến máy chủ",
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || "Có lỗi không xác định",
        status: 0,
      };
    }
  }
}

// Export singleton instance
const roomService = new RoomService();
export default roomService;
