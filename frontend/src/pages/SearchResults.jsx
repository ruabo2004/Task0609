import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Filter, Grid, List, TrendingUp, Clock, X } from "lucide-react";
import { useRoomSearch } from "@hooks/useRoomSearch";
import RoomGrid from "@components/Room/RoomGrid";
import RoomFilter from "@components/Room/RoomFilter";
import SearchBar from "@components/Search/SearchBar";
import LoadingSpinner from "@components/Common/LoadingSpinner";
import Button from "@components/Form/Button";

/**
 * SearchResults Page
 * Display search results with filters and suggestions
 */
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [layout, setLayout] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Get search parameters from URL
  const getSearchParamsFromUrl = () => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (key === "page" || key === "limit" || key === "guests") {
        params[key] = parseInt(value);
      } else if (key === "min_price" || key === "max_price") {
        params[key] = parseInt(value);
      } else if (key === "amenities") {
        params[key] = value.split(",").filter(Boolean);
      } else if (key === "available_only") {
        params[key] = value === "true";
      } else {
        params[key] = value;
      }
    }
    return params;
  };

  const {
    searchParams: currentSearchParams,
    rooms,
    pagination,
    filters,
    searchInfo,
    suggestions,
    popularSearches,
    searchHistory,
    isSearching,
    isError,
    error,
    hasQuery,
    hasFilters,
    hasResults,
    search,
    updateSearchParams,
    changePage,
    changeSort,
    applyFilters,
    clearSearch,
    logResultClick,
  } = useRoomSearch(getSearchParamsFromUrl());

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(currentSearchParams).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, value.toString());
        }
      }
    });

    setSearchParams(params, { replace: true });
  }, [currentSearchParams, setSearchParams]);

  // Perform initial search on component mount
  useEffect(() => {
    const urlParams = getSearchParamsFromUrl();
    if (Object.keys(urlParams).length > 0) {
      search(urlParams);
    }
  }, []);

  // Handle new search
  const handleSearch = (query) => {
    const newParams = { ...currentSearchParams, q: query, page: 1 };
    search(newParams);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    const updatedParams = { ...currentSearchParams, ...newFilters, page: 1 };
    applyFilters(updatedParams);
  };

  // Handle filter reset
  const handleFiltersReset = () => {
    const basicParams = {
      q: currentSearchParams.q || "",
      page: 1,
      limit: 12,
      sort_by: "relevance",
      sort_order: "desc",
    };
    search(basicParams);
  };

  // Handle sort change
  const handleSortChange = (sortBy, sortOrder) => {
    changeSort(sortBy, sortOrder);
  };

  // Handle page change
  const handlePageChange = (page) => {
    changePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle room selection
  const handleRoomSelect = (room, position) => {
    // Log click for analytics
    logResultClick(room.room_id, position);

    // Navigate to room detail
    navigate(`/rooms/${room.room_id}`);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion);
  };

  // Handle popular search click
  const handlePopularSearchClick = (popularSearch) => {
    handleSearch(popularSearch.search_query);
  };

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    handleSearch(historyItem);
  };

  // Sort options
  const sortOptions = [
    {
      value: "relevance_desc",
      label: "Phù hợp nhất",
      sort_by: "relevance",
      sort_order: "desc",
    },
    {
      value: "price_asc",
      label: "Giá thấp đến cao",
      sort_by: "price",
      sort_order: "asc",
    },
    {
      value: "price_desc",
      label: "Giá cao đến thấp",
      sort_by: "price",
      sort_order: "desc",
    },
    {
      value: "rating_desc",
      label: "Đánh giá cao nhất",
      sort_by: "rating",
      sort_order: "desc",
    },
    {
      value: "created_desc",
      label: "Mới nhất",
      sort_by: "created_at",
      sort_order: "desc",
    },
  ];

  // Remove filter tag
  const removeFilter = (filterKey) => {
    const newFilters = { ...currentSearchParams };
    delete newFilters[filterKey];
    search(newFilters);
  };

  // Get active filter tags
  const getActiveFilterTags = () => {
    const tags = [];

    if (currentSearchParams.min_price || currentSearchParams.max_price) {
      const min = currentSearchParams.min_price
        ? `${currentSearchParams.min_price.toLocaleString()}đ`
        : "";
      const max = currentSearchParams.max_price
        ? `${currentSearchParams.max_price.toLocaleString()}đ`
        : "";
      tags.push({
        key: "price",
        label:
          min && max ? `${min} - ${max}` : min ? `Từ ${min}` : `Đến ${max}`,
        onRemove: () => {
          const newFilters = { ...currentSearchParams };
          delete newFilters.min_price;
          delete newFilters.max_price;
          search(newFilters);
        },
      });
    }

    if (currentSearchParams.room_type) {
      tags.push({
        key: "room_type",
        label: currentSearchParams.room_type,
        onRemove: () => removeFilter("room_type"),
      });
    }

    if (currentSearchParams.location) {
      tags.push({
        key: "location",
        label: currentSearchParams.location,
        onRemove: () => removeFilter("location"),
      });
    }

    if (
      currentSearchParams.amenities &&
      currentSearchParams.amenities.length > 0
    ) {
      tags.push({
        key: "amenities",
        label: `${currentSearchParams.amenities.length} tiện nghi`,
        onRemove: () => removeFilter("amenities"),
      });
    }

    return tags;
  };

  const activeFilterTags = getActiveFilterTags();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <SearchBar
                  placeholder="Tìm kiếm phòng..."
                  onSearch={handleSearch}
                  showSuggestions={true}
                  showHistory={true}
                  showVoiceInput={true}
                  size="lg"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
            </div>

            {/* Search Info */}
            {hasQuery && (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Kết quả tìm kiếm "{currentSearchParams.q}"
                  </h1>
                  {searchInfo?.total_results && (
                    <p className="text-gray-600 mt-1">
                      Tìm thấy {searchInfo.total_results} phòng
                      {searchInfo.search_time_ms && (
                        <span className="text-gray-500">
                          {" "}
                          trong {searchInfo.search_time_ms}ms
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <button
                  onClick={clearSearch}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Active Filters */}
            {activeFilterTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Đang lọc:</span>
                {activeFilterTags.map((tag) => (
                  <span
                    key={tag.key}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag.label}
                    <button
                      onClick={tag.onRemove}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleFiltersReset}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* No Search Query - Show Suggestions */}
        {!hasQuery && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bạn đang tìm kiếm gì?
              </h2>
              <p className="text-gray-600">
                Hãy nhập từ khóa để tìm kiếm phòng phù hợp
              </p>
            </div>

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Tìm kiếm phổ biến
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularSearches.slice(0, 8).map((popularSearch, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularSearchClick(popularSearch)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
                    >
                      {popularSearch.search_query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Tìm kiếm gần đây
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {searchHistory.slice(0, 6).map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(historyItem)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {historyItem}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {hasQuery && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters - Desktop */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-6">
                <RoomFilter
                  onFiltersChange={handleFiltersChange}
                  onFiltersReset={handleFiltersReset}
                  initialFilters={currentSearchParams}
                  showMobileToggle={false}
                />
              </div>
            </div>

            {/* Results Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden mb-6">
                  <RoomFilter
                    onFiltersChange={handleFiltersChange}
                    onFiltersReset={handleFiltersReset}
                    initialFilters={currentSearchParams}
                    showMobileToggle={false}
                  />
                </div>
              )}

              {/* Toolbar */}
              {hasResults && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    {/* Results count */}
                    <div>
                      <p className="text-sm text-gray-600">
                        {isSearching
                          ? "Đang tìm kiếm..."
                          : `Hiển thị ${
                              (pagination.page - 1) * pagination.limit + 1
                            }-${Math.min(
                              pagination.page * pagination.limit,
                              pagination.total
                            )} trong ${pagination.total} phòng`}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-4">
                      {/* Sort */}
                      <select
                        value={`${currentSearchParams.sort_by}_${currentSearchParams.sort_order}`}
                        onChange={(e) => {
                          const option = sortOptions.find(
                            (opt) => opt.value === e.target.value
                          );
                          if (option) {
                            handleSortChange(option.sort_by, option.sort_order);
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {/* Layout toggle */}
                      <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setLayout("grid")}
                          className={`p-2 transition-colors ${
                            layout === "grid"
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                          title="Xem dạng lưới"
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setLayout("list")}
                          className={`p-2 transition-colors ${
                            layout === "list"
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                          title="Xem dạng danh sách"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" text="Đang tìm kiếm phòng..." />
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Search className="w-16 h-16 text-red-300 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Lỗi tìm kiếm
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {error?.message || "Đã xảy ra lỗi khi tìm kiếm"}
                  </p>
                  <Button onClick={() => search(currentSearchParams)}>
                    Thử lại
                  </Button>
                </div>
              ) : hasResults ? (
                <>
                  <RoomGrid
                    rooms={rooms}
                    layout={layout}
                    onRoomSelect={(room) =>
                      handleRoomSelect(room, rooms.indexOf(room) + 1)
                    }
                    className="mb-8"
                  />

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                        <div className="text-sm text-gray-600">
                          Trang {pagination.page} / {pagination.totalPages}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(pagination.page - 1)
                            }
                            disabled={!pagination.hasPrev || isSearching}
                          >
                            Trước
                          </Button>

                          <div className="flex items-center space-x-1">
                            {Array.from(
                              { length: Math.min(pagination.totalPages, 5) },
                              (_, i) => {
                                const page = i + 1;
                                const isCurrentPage = page === pagination.page;

                                return (
                                  <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={isSearching}
                                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                                      isCurrentPage
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(pagination.page + 1)
                            }
                            disabled={!pagination.hasNext || isSearching}
                          >
                            Sau
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : hasQuery ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Search className="w-16 h-16 text-gray-300 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không tìm thấy phòng nào
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Không có phòng nào phù hợp với từ khóa "
                    {currentSearchParams.q}". Hãy thử tìm kiếm khác hoặc điều
                    chỉnh bộ lọc.
                  </p>

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Có thể bạn đang tìm:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {suggestions.slice(0, 4).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              handleSuggestionClick(suggestion.suggestion)
                            }
                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                          >
                            {suggestion.suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
