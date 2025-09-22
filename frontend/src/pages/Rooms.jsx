import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Grid, List, Filter, SlidersHorizontal, MapPin } from "lucide-react";
import { useRooms } from "@hooks/useRooms";
import { useRoomTypes } from "@hooks/useRoomTypes";
import { useRoomFilters } from "@hooks/useRoomFilters";
import RoomGrid from "@components/Room/RoomGrid";
import RoomFilter from "@components/Room/RoomFilter";
import SearchBar from "@components/Search/SearchBar";
import LoadingSpinner from "@components/Common/LoadingSpinner";
import Button from "@components/Form/Button";

/**
 * Rooms Page
 * Display and filter available rooms
 */
const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout, setLayout] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteRooms, setFavoriteRooms] = useState([]);

  // Get initial filters from URL parameters
  const getInitialFilters = () => {
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key === "page" || key === "limit") {
        filters[key] = parseInt(value);
      } else if (
        key === "min_price" ||
        key === "max_price" ||
        key === "type_id" ||
        key === "num_adults" ||
        key === "num_children"
      ) {
        filters[key] = parseInt(value);
      } else if (key === "amenities") {
        filters[key] = value.split(",");
      } else if (
        key === "wifi_required" ||
        key === "balcony_required" ||
        key === "available_only"
      ) {
        filters[key] = value === "true";
      } else {
        filters[key] = value;
      }
    }
    return filters;
  };

  const {
    rooms,
    pagination,
    filters,
    isLoading,
    isError,
    error,
    updateFilters,
    changePage,
    changeSort,
    resetFilters,
    addToFavorites,
    removeFromFavorites,
    isAddingToFavorites,
    isRemovingFromFavorites,
  } = useRooms(getInitialFilters());

  // Debug logs
  console.log("🏠 Current filters:", filters);
  console.log("📊 Rooms data:", {
    count: rooms?.length,
    loading: isLoading,
    error: isError,
  });
  console.log("📄 Pagination data:", pagination);

  const { roomTypes, isLoading: isLoadingRoomTypes } = useRoomTypes();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
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
  }, [filters, setSearchParams]);

  // Handle search
  const handleSearch = (query) => {
    updateFilters({ q: query, page: 1 });
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    console.log("🔧 Filter changed:", newFilters);
    updateFilters({ ...newFilters, page: 1 });
  };

  // Handle filter reset
  const handleFiltersReset = () => {
    resetFilters();
    setSearchParams({}, { replace: true });
  };

  // Handle sort change
  const handleSortChange = (sortBy, sortOrder) => {
    changeSort(sortBy, sortOrder);
  };

  // Handle layout change
  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  // Handle page change
  const handlePageChange = (page) => {
    changePage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (roomId, isFavorite) => {
    if (isFavorite) {
      addToFavorites(roomId);
      setFavoriteRooms((prev) => [...prev, roomId]);
    } else {
      removeFromFavorites(roomId);
      setFavoriteRooms((prev) => prev.filter((id) => id !== roomId));
    }
  };

  // Handle room selection
  const handleRoomSelect = (room) => {
    // Navigate to room detail or booking page
    window.location.href = `/rooms/${room.room_id}`;
  };

  // Sort options
  const sortOptions = [
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
      value: "size_desc",
      label: "Diện tích lớn nhất",
      sort_by: "size",
      sort_order: "desc",
    },
    { value: "name_asc", label: "Tên A-Z", sort_by: "name", sort_order: "asc" },
  ];

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không thể tải danh sách phòng
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "Đã xảy ra lỗi khi tải dữ liệu"}
          </p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tìm phòng</h1>
            </div>

            {/* Search Bar */}
            <div className="lg:w-96">
              <SearchBar
                placeholder="Tìm kiếm phòng..."
                onSearch={handleSearch}
                showSuggestions={true}
                showHistory={true}
                showVoiceInput={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <RoomFilter
                onFiltersChange={handleFiltersChange}
                onFiltersReset={handleFiltersReset}
                initialFilters={filters}
                showMobileToggle={false}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-6">
              <RoomFilter
                onFiltersChange={handleFiltersChange}
                onFiltersReset={handleFiltersReset}
                initialFilters={filters}
                showMobileToggle={true}
              />
            </div>

            {/* Toolbar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                {/* Results count */}
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-600">
                    {isLoading
                      ? "Đang tải..."
                      : `Hiển thị ${
                          (pagination.current_page - 1) *
                            pagination.items_per_page +
                          1
                        }-${Math.min(
                          pagination.current_page * pagination.items_per_page,
                          pagination.total_items
                        )} trong ${pagination.total_items} phòng`}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <select
                    value={`${filters.sort_by}_${filters.sort_order}`}
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
                      onClick={() => handleLayoutChange("grid")}
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
                      onClick={() => handleLayoutChange("list")}
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

            {/* Rooms Grid */}
            <RoomGrid
              rooms={rooms}
              layout={layout}
              loading={isLoading}
              onRoomSelect={handleRoomSelect}
              onFavoriteToggle={handleFavoriteToggle}
              favoriteRooms={favoriteRooms}
              className="mb-8"
            />

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    Trang {pagination.current_page} / {pagination.total_pages}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.current_page - 1)
                      }
                      disabled={!pagination.has_prev_page || isLoading}
                    >
                      Trước
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(pagination.total_pages, 5) },
                        (_, i) => {
                          const page = i + 1;
                          const isCurrentPage =
                            page === pagination.current_page;

                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              disabled={isLoading}
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
                        handlePageChange(pagination.current_page + 1)
                      }
                      disabled={!pagination.has_next_page || isLoading}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {(isAddingToFavorites || isRemovingFromFavorites) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <LoadingSpinner size="lg" text="Đang cập nhật yêu thích..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
