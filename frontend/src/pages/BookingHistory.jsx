import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Hooks
import { useBookings } from "@hooks/useBookings";

// Components
import LoadingSpinner from "@components/Common/LoadingSpinner";

// Utils
import {
  getBookingStatusInfo,
  filterBookings,
  sortBookings,
} from "@utils/bookingHelpers";

const BookingHistory = () => {
  // ==========================================
  // STATE & HOOKS
  // ==========================================
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    bookings,
    isLoading,
    error,
    pagination,
    cancelBooking,
    modifyBooking,
  } = useBookings({
    page: currentPage,
    limit: pageSize,
    ...filters,
  });

  // ==========================================
  // DERIVED DATA
  // ==========================================
  const filteredBookings = React.useMemo(() => {
    let result = bookings || [];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (booking) =>
          booking.room_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.confirmation_code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.guest_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.homestay_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply additional filters
    result = filterBookings(result, filters);

    // Apply sorting
    result = sortBookings(result, filters.sortBy, filters.sortOrder);

    return result;
  }, [bookings, searchTerm, filters]);

  // ==========================================
  // EFFECTS
  // ==========================================
  useEffect(() => {
    if (error) {
      toast.error("Có lỗi xảy ra khi tải lịch sử đặt phòng");
    }
  }, [error]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  const handleViewBooking = (booking) => {
    navigate(`/booking/confirmation?bookingId=${booking.booking_id}`);
  };

  const handleCancelBooking = async (booking) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đặt phòng này?")) {
      try {
        await cancelBooking(booking.booking_id, "Khách hàng yêu cầu hủy");
        toast.success("Hủy đặt phòng thành công");
      } catch (error) {
        toast.error("Có lỗi xảy ra khi hủy đặt phòng");
      }
    }
  };

  const handleModifyBooking = (booking) => {
    navigate(`/booking/${booking.room_id}`, {
      state: {
        bookingData: {
          bookingId: booking.booking_id,
          checkInDate: new Date(booking.check_in_date),
          checkOutDate: new Date(booking.check_out_date),
          adults: booking.adults,
          children: booking.children,
          infants: booking.infants,
        },
        isModifying: true,
      },
    });
  };

  const handleReviewBooking = (booking) => {
    // Navigate to review page or open review modal
    navigate(`/review/${booking.booking_id}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // ==========================================
  // RENDER COMPONENTS
  // ==========================================
  const renderFilters = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo mã đặt phòng, số phòng, tên khách..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="cancelled">Đã hủy</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange("dateRange", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="this_month">Tháng này</option>
            <option value="last_month">Tháng trước</option>
            <option value="last_3_months">3 tháng qua</option>
            <option value="this_year">Năm nay</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="created_at">Ngày đặt</option>
            <option value="check_in_date">Ngày nhận phòng</option>
            <option value="total_price">Giá tiền</option>
            <option value="status">Trạng thái</option>
          </select>

          <button
            onClick={() =>
              handleFilterChange(
                "sortOrder",
                filters.sortOrder === "asc" ? "desc" : "asc"
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={
              filters.sortOrder === "asc"
                ? "Sắp xếp giảm dần"
                : "Sắp xếp tăng dần"
            }
          >
            {filters.sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.status !== "all" ||
        filters.dateRange !== "all" ||
        searchTerm) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.status !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Trạng thái: {filters.status}
              <button
                onClick={() => handleFilterChange("status", "all")}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}

          {filters.dateRange !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Thời gian: {filters.dateRange}
              <button
                onClick={() => handleFilterChange("dateRange", "all")}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}

          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Tìm kiếm: "{searchTerm}"
              <button
                onClick={() => setSearchTerm("")}
                className="ml-2 text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );

  const renderBookingList = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredBookings.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ||
            filters.status !== "all" ||
            filters.dateRange !== "all"
              ? "Không tìm thấy đặt phòng nào"
              : "Chưa có lịch sử đặt phòng"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ||
            filters.status !== "all" ||
            filters.dateRange !== "all"
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Bạn chưa có đặt phòng nào. Hãy khám phá các phòng của chúng tôi!"}
          </p>
          <div className="space-x-4">
            {(searchTerm ||
              filters.status !== "all" ||
              filters.dateRange !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    status: "all",
                    dateRange: "all",
                    sortBy: "created_at",
                    sortOrder: "desc",
                  });
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
            <button
              onClick={() => navigate("/rooms")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá phòng
            </button>
          </div>
        </div>
      );
    }

    // Mock booking list - since we don't have real data yet
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center text-gray-600">
            <p>Trang lịch sử đặt phòng đang được phát triển...</p>
            <p className="mt-2">Vui lòng quay lại sau!</p>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Lịch sử đặt phòng
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi các đặt phòng của bạn
              </p>
            </div>

            <button
              onClick={() => navigate("/rooms")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đặt phòng mới
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Tổng đặt phòng</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Đã xác nhận</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Hoàn thành</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-sm text-gray-600">Đã hủy</div>
          </div>
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Booking List */}
        {renderBookingList()}
      </div>
    </div>
  );
};

export default BookingHistory;


