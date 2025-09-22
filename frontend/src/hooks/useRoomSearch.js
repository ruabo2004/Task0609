import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "react-query";
import searchService from "@services/searchService";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { toast } from "react-toastify";

/**
 * Hook for room search functionality
 */
export const useRoomSearch = (initialParams = {}) => {
  const [searchParams, setSearchParams] = useState({
    q: "",
    page: 1,
    limit: 12,
    sort_by: "relevance",
    sort_order: "desc",
    ...initialParams,
  });

  const [searchHistory, setSearchHistory] = useLocalStorage(
    "search-history",
    []
  );
  const [isSearching, setIsSearching] = useState(false);

  // Search rooms query
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ["room-search", searchParams],
    () => searchService.searchRooms(searchParams),
    {
      enabled: false, // Only search when explicitly triggered
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        setIsSearching(false);
        // Add to local search history if query exists
        if (searchParams.q && searchParams.q.trim()) {
          addToSearchHistory(searchParams.q.trim());
        }
      },
      onError: (error) => {
        setIsSearching(false);
        toast.error(error.message || "Tìm kiếm thất bại");
      },
    }
  );

  // Search suggestions query
  const [suggestionsQuery, setSuggestionsQuery] = useState("");
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useQuery(
    ["search-suggestions", suggestionsQuery],
    () => searchService.getSuggestions(suggestionsQuery, 5),
    {
      enabled: suggestionsQuery.length >= 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: () => {
        // Don't show error for suggestions
      },
    }
  );

  // Popular searches query
  const { data: popularSearchesData, isLoading: isLoadingPopular } = useQuery(
    ["popular-searches"],
    () => searchService.getPopularSearches("30d", 10),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      onError: () => {
        // Don't show error for popular searches
      },
    }
  );

  // Log search click mutation
  const logClickMutation = useMutation(
    ({ logId, resultId, position }) =>
      searchService.logClick(logId, resultId, position),
    {
      onError: () => {
        // Don't show error for analytics
      },
    }
  );

  // Update search params
  const updateSearchParams = useCallback((newParams) => {
    setSearchParams((prev) => ({
      ...prev,
      ...newParams,
      page: newParams.page || 1, // Reset page unless explicitly set
    }));
  }, []);

  // Perform search
  const search = useCallback(
    (params = {}) => {
      const finalParams = { ...searchParams, ...params };
      setSearchParams(finalParams);
      setIsSearching(true);
      refetch();
    },
    [searchParams, refetch]
  );

  // Quick search with just query
  const quickSearch = useCallback(
    (query) => {
      search({ q: query, page: 1 });
    },
    [search]
  );

  // Change page
  const changePage = useCallback(
    (page) => {
      updateSearchParams({ page });
      refetch();
    },
    [updateSearchParams, refetch]
  );

  // Change sort
  const changeSort = useCallback(
    (sort_by, sort_order = "desc") => {
      updateSearchParams({ sort_by, sort_order, page: 1 });
      refetch();
    },
    [updateSearchParams, refetch]
  );

  // Apply filters
  const applyFilters = useCallback(
    (filters) => {
      updateSearchParams({ ...filters, page: 1 });
      refetch();
    },
    [updateSearchParams, refetch]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchParams({
      q: "",
      page: 1,
      limit: 12,
      sort_by: "relevance",
      sort_order: "desc",
    });
  }, []);

  // Get suggestions for query
  const getSuggestions = useCallback((query) => {
    setSuggestionsQuery(query);
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestionsQuery("");
  }, []);

  // Add to search history
  const addToSearchHistory = useCallback(
    (query) => {
      const newHistory = [
        query,
        ...searchHistory.filter((item) => item !== query),
      ].slice(0, 10); // Keep only last 10 searches

      setSearchHistory(newHistory);
    },
    [searchHistory, setSearchHistory]
  );

  // Remove from search history
  const removeFromSearchHistory = useCallback(
    (query) => {
      setSearchHistory((prev) => prev.filter((item) => item !== query));
    },
    [setSearchHistory]
  );

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, [setSearchHistory]);

  // Log search result click
  const logResultClick = useCallback(
    (resultId, position) => {
      const logId = searchResults?.data?.search?.log_id;
      if (logId) {
        logClickMutation.mutate({ logId, resultId, position });
      }
    },
    [searchResults, logClickMutation]
  );

  // Get current search state
  const hasQuery = searchParams.q && searchParams.q.trim().length > 0;
  const hasFilters = Object.keys(searchParams).some(
    (key) =>
      !["q", "page", "limit", "sort_by", "sort_order"].includes(key) &&
      searchParams[key] !== undefined &&
      searchParams[key] !== ""
  );
  const hasResults = searchResults?.data?.rooms?.length > 0;

  // Extract data
  const rooms = searchResults?.data?.rooms || [];
  const pagination = searchResults?.data?.pagination || {};
  const filters = searchResults?.data?.filters || {};
  const searchInfo = searchResults?.data?.search || {};
  const suggestions = suggestionsData?.data?.suggestions || [];
  const popularSearches = popularSearchesData?.data?.searches || [];

  return {
    // Search state
    searchParams,
    isSearching: isSearching || isLoading,
    isError,
    error,
    hasQuery,
    hasFilters,
    hasResults,

    // Results
    rooms,
    pagination,
    filters,
    searchInfo,
    suggestions,
    popularSearches,
    searchHistory,

    // Loading states
    isLoadingSuggestions,
    isLoadingPopular,

    // Actions
    search,
    quickSearch,
    updateSearchParams,
    changePage,
    changeSort,
    applyFilters,
    clearSearch,

    // Suggestions
    getSuggestions,
    clearSuggestions,

    // History
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,

    // Analytics
    logResultClick,

    // Utils
    refetch,
  };
};

/**
 * Hook for advanced search functionality
 */
export const useAdvancedSearch = () => {
  const [criteria, setCriteria] = useState({});

  const {
    data: searchResults,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ["advanced-search", criteria],
    () => searchService.advancedSearch(criteria),
    {
      enabled: Object.keys(criteria).length > 0,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        toast.error(error.message || "Tìm kiếm nâng cao thất bại");
      },
    }
  );

  const updateCriteria = useCallback((newCriteria) => {
    setCriteria((prev) => ({ ...prev, ...newCriteria }));
  }, []);

  const clearCriteria = useCallback(() => {
    setCriteria({});
  }, []);

  const rooms = searchResults?.data?.rooms || [];
  const pagination = searchResults?.data?.pagination || {};

  return {
    criteria,
    rooms,
    pagination,
    isLoading,
    isError,
    error,
    updateCriteria,
    clearCriteria,
    refetch,
  };
};

export default useRoomSearch;
