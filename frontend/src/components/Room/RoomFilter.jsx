import React, { useState, useRef } from "react";
import {
  Filter,
  X,
  ChevronDown,
  Calendar,
  Users,
  DollarSign,
  Home,
  Eye,
  Bed,
  Wifi,
  Wind,
  RotateCcw,
} from "lucide-react";
import { useRoomFilters } from "@hooks/useRoomFilters";
import { formatPrice } from "@utils/roomHelpers";
import Button from "@components/Form/Button";

/**
 * RoomFilter Component
 * Advanced filtering interface for rooms
 */
const RoomFilter = ({
  onFiltersChange,
  onFiltersReset,
  initialFilters = {},
  showMobileToggle = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("price");

  const {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    resetFilterCategory,
    toggleAmenity,
    setPriceRange,
    setDateRange,
    setGuestCount,
    toggleBooleanFilter,
    filterOptions,
    hasActiveFilters,
    activeFiltersCount,
    filterSummary,
    dateValidation,
  } = useRoomFilters(initialFilters);

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Apply filters
  const applyFilters = () => {
    handleFiltersChange(filters);
    setIsOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    resetFilters();
    if (onFiltersReset) {
      onFiltersReset();
    }
    setIsOpen(false);
  };

  // Filter tabs - simplified
  const filterTabs = [
    { id: "price", label: "Giá", icon: <DollarSign className="w-4 h-4" /> },
    { id: "guests", label: "Số khách", icon: <Users className="w-4 h-4" /> },
    { id: "room", label: "Loại phòng", icon: <Home className="w-4 h-4" /> },
  ];

  // Price Range Filter
  const PriceRangeFilter = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Khoảng giá</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Giá thấp nhất
          </label>
          <input
            type="number"
            defaultValue={filters.min_price || ""}
            onBlur={(e) => {
              const value = e.target.value;
              if (value === "" || value === "0") {
                updateFilter("min_price", null);
              } else if (!isNaN(value) && parseInt(value) >= 0) {
                updateFilter("min_price", parseInt(value));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.target.blur();
              }
            }}
            placeholder="0"
            min="0"
            step="100000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Giá cao nhất
          </label>
          <input
            type="number"
            defaultValue={filters.max_price || ""}
            onBlur={(e) => {
              const value = e.target.value;
              if (value === "") {
                updateFilter("max_price", null);
              } else if (!isNaN(value) && parseInt(value) >= 0) {
                updateFilter("max_price", parseInt(value));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.target.blur();
              }
            }}
            placeholder="Không giới hạn"
            min="0"
            step="100000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Reset price button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            updateFilter("min_price", null);
            updateFilter("max_price", null);
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
        >
          Đặt lại giá
        </button>
      </div>

      {/* Quick price ranges */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Dưới 500k", min: 0, max: 500000 },
          { label: "500k - 1tr", min: 500000, max: 1000000 },
          { label: "1tr - 2tr", min: 1000000, max: 2000000 },
          { label: "Trên 2tr", min: 2000000, max: null },
        ].map((range, index) => (
          <button
            key={index}
            onClick={() => setPriceRange(range.min, range.max)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Date Range Filter
  const DateRangeFilter = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Ngày nhận & trả phòng</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Ngày nhận phòng
          </label>
          <input
            type="date"
            value={filters.check_in_date || ""}
            onChange={(e) => updateFilter("check_in_date", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Ngày trả phòng
          </label>
          <input
            type="date"
            value={filters.check_out_date || ""}
            onChange={(e) => updateFilter("check_out_date", e.target.value)}
            min={
              filters.check_in_date || new Date().toISOString().split("T")[0]
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {!dateValidation.isValid && (
        <p className="text-sm text-red-600">{dateValidation.error}</p>
      )}
    </div>
  );

  // Guest Count Filter
  const GuestCountFilter = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Số lượng khách</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Người lớn</label>
          <select
            value={filters.num_adults}
            onChange={(e) =>
              updateFilter("num_adults", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} người
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Trẻ em</label>
          <select
            value={filters.num_children}
            onChange={(e) =>
              updateFilter("num_children", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <option key={i} value={i}>
                {i} trẻ
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Room Type & Features Filter
  const RoomFeaturesFilter = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Loại phòng</h4>
        <select
          value={filters.type_id || ""}
          onChange={(e) =>
            updateFilter(
              "type_id",
              e.target.value ? parseInt(e.target.value) : null
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả loại phòng</option>
          {filterOptions.roomTypes.map((type) => (
            <option key={type.type_id} value={type.type_id}>
              {type.type_name} - {formatPrice(type.base_price)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">View</h4>
        <select
          value={filters.view_type || ""}
          onChange={(e) => updateFilter("view_type", e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả view</option>
          {filterOptions.viewTypes.map((view) => (
            <option key={view.value} value={view.value}>
              {view.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Loại giường</h4>
        <select
          value={filters.bed_type || ""}
          onChange={(e) => updateFilter("bed_type", e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả loại giường</option>
          {filterOptions.bedTypes.map((bed) => (
            <option key={bed.value} value={bed.value}>
              {bed.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Amenities Filter
  const AmenitiesFilter = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Tiện nghi</h4>

      <div className="grid grid-cols-2 gap-2">
        {filterOptions.amenities.map((amenity) => (
          <label
            key={amenity}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters.amenities.includes(amenity)}
              onChange={() => toggleAmenity(amenity)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{amenity}</span>
          </label>
        ))}
      </div>

      {filters.amenities.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">
            Đã chọn: {filters.amenities.length} tiện nghi
          </p>
          <div className="flex flex-wrap gap-1">
            {filters.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {amenity}
                <button
                  onClick={() => toggleAmenity(amenity)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render tab content - simplified
  const renderTabContent = () => {
    switch (activeTab) {
      case "price":
        return <PriceRangeFilter />;
      case "guests":
        return <GuestCountFilter />;
      case "room":
        return <RoomFeaturesFilter />;
      default:
        return <PriceRangeFilter />;
    }
  };

  return (
    <div className={className}>
      {/* Mobile filter toggle */}
      {showMobileToggle && (
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Bộ lọc</span>
              {hasActiveFilters && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transform transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}

      {/* Filter summary */}
      {hasActiveFilters && filterSummary.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Bộ lọc đang áp dụng:
              </p>
              <p className="text-xs text-blue-600">
                {filterSummary.join(" • ")}
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Xóa tất cả bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter panel */}
      <div
        className={`bg-white border border-gray-200 rounded-lg shadow-sm ${
          !showMobileToggle || isOpen ? "block" : "hidden lg:block"
        }`}
      >
        {/* Filter tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4">{renderTabContent()}</div>

        {/* Filter actions */}
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => resetFilterCategory(activeTab)}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Xóa bộ lọc này
          </button>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Xóa tất cả
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Áp dụng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomFilter;
