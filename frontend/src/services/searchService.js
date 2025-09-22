import api from "./api";

/**
 * Search Service
 * Handles search-related API calls and analytics
 */
class SearchService {
  /**
   * Search rooms with query and filters
   */
  async searchRooms(searchParams = {}) {
    try {
      const {
        q = "",
        page = 1,
        limit = 12,
        sort_by = "relevance",
        sort_order = "desc",
        min_price,
        max_price,
        room_type,
        location,
        amenities,
        check_in_date,
        check_out_date,
        guests = 1,
        available_only = true,
      } = searchParams;

      const params = new URLSearchParams();

      // Add search parameters
      if (q) params.append("q", q);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sort_by", sort_by);
      params.append("sort_order", sort_order);
      params.append("available_only", available_only.toString());

      // Add filters
      if (min_price) params.append("min_price", min_price.toString());
      if (max_price) params.append("max_price", max_price.toString());
      if (room_type) params.append("room_type", room_type);
      if (location) params.append("location", location);
      if (amenities) params.append("amenities", amenities);
      if (check_in_date) params.append("check_in_date", check_in_date);
      if (check_out_date) params.append("check_out_date", check_out_date);
      if (guests) params.append("guests", guests.toString());

      const response = await api.get(`/search/rooms?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSuggestions(query, limit = 5) {
    try {
      if (!query || query.length < 1) {
        return { data: { suggestions: [] } };
      }

      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      });

      const response = await api.get(`/search/suggestions?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(timeframe = "30d", limit = 10) {
    try {
      const params = new URLSearchParams({
        timeframe,
        limit: limit.toString(),
      });

      const response = await api.get(`/search/popular?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Log search result click for analytics
   */
  async logClick(logId, resultId, position) {
    try {
      const response = await api.post("/search/click", {
        log_id: logId,
        result_id: resultId,
        position,
      });
      return response.data;
    } catch (error) {
      // Don't throw error for analytics - just log it
      console.warn("Failed to log search click:", error);
      return null;
    }
  }

  /**
   * Get search history for authenticated user
   */
  async getSearchHistory(limit = 20) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await api.get(`/search/history?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory() {
    try {
      const response = await api.delete("/search/history");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get search analytics for user
   */
  async getSearchAnalytics(timeframe = "30d", customerId = null) {
    try {
      const params = new URLSearchParams({
        timeframe,
      });

      if (customerId) {
        params.append("customer_id", customerId.toString());
      }

      const response = await api.get(`/search/analytics?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Advanced search with complex criteria
   */
  async advancedSearch(criteria) {
    try {
      const response = await api.post("/search/advanced", {
        search_criteria: criteria,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Save search query for later
   */
  async saveSearch(searchParams, name) {
    try {
      const response = await api.post("/search/save", {
        search_params: searchParams,
        name,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get saved searches
   */
  async getSavedSearches() {
    try {
      const response = await api.get("/search/saved");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId) {
    try {
      const response = await api.delete(`/search/saved/${searchId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get search filters and their available options
   */
  async getSearchFilters() {
    try {
      const response = await api.get("/search/filters");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(limit = 10) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await api.get(`/search/trending?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Auto-complete search query
   */
  async autoComplete(query, limit = 5) {
    try {
      if (!query || query.length < 2) {
        return { data: { suggestions: [] } };
      }

      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      });

      const response = await api.get(`/search/autocomplete?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search with voice input (if supported)
   */
  async voiceSearch(audioBlob) {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await api.post("/search/voice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get search suggestions based on user preferences
   */
  async getPersonalizedSuggestions(limit = 5) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await api.get(`/search/personalized?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Report search issue
   */
  async reportSearchIssue(searchQuery, issue, description = "") {
    try {
      const response = await api.post("/search/report-issue", {
        search_query: searchQuery,
        issue,
        description,
      });
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
        message: data?.message || "Có lỗi xảy ra khi tìm kiếm",
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
const searchService = new SearchService();
export default searchService;
