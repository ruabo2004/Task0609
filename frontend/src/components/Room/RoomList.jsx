import React from "react";
import { List } from "lucide-react";
import RoomCard from "./RoomCard";

/**
 * RoomList Component
 * Displays rooms in a list layout with additional list-specific features
 */
const RoomList = ({
  rooms = [],
  showPrice = true,
  selectedDates = null,
  onRoomSelect = null,
  onFavoriteToggle = null,
  favoriteRooms = [],
  loading = false,
  className = "",
  showIndex = false,
  showCompare = false,
  selectedRooms = [],
  onCompareToggle = null,
  maxCompare = 3,
}) => {
  // Show loading skeleton
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="flex">
              <div className="w-64 h-40 bg-gray-200"></div>
              <div className="flex-1 p-4">
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show empty state
  if (!rooms || rooms.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <List className="w-16 h-16 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy phòng nào
          </h3>
          <p className="text-gray-600">
            Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khác để xem thêm phòng.
          </p>
        </div>
      </div>
    );
  }

  // Check if room is favorite
  const isRoomFavorite = (roomId) => {
    return favoriteRooms.includes(roomId);
  };

  // Check if room is selected for comparison
  const isRoomSelected = (roomId) => {
    return selectedRooms.includes(roomId);
  };

  // Handle compare toggle
  const handleCompareToggle = (roomId) => {
    if (!onCompareToggle) return;

    const isSelected = isRoomSelected(roomId);

    if (isSelected) {
      // Remove from comparison
      onCompareToggle(roomId, false);
    } else {
      // Add to comparison if under limit
      if (selectedRooms.length < maxCompare) {
        onCompareToggle(roomId, true);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {rooms.map((room, index) => (
        <div key={room.room_id} className="relative">
          {/* Index number */}
          {showIndex && (
            <div className="absolute top-4 left-4 z-10 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
          )}

          {/* Room Card */}
          <div className="relative">
            <RoomCard
              room={room}
              layout="list"
              showPrice={showPrice}
              selectedDates={selectedDates}
              onSelect={onRoomSelect}
              onFavoriteToggle={onFavoriteToggle}
              isFavorite={isRoomFavorite(room.room_id)}
              className={
                showCompare && isRoomSelected(room.room_id)
                  ? "ring-2 ring-blue-500"
                  : ""
              }
            />

            {/* Compare checkbox */}
            {showCompare && (
              <div className="absolute top-4 right-16 z-10">
                <label className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={isRoomSelected(room.room_id)}
                    onChange={() => handleCompareToggle(room.room_id)}
                    disabled={
                      !isRoomSelected(room.room_id) &&
                      selectedRooms.length >= maxCompare
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">So sánh</span>
                </label>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Compare summary */}
      {showCompare && selectedRooms.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center space-x-3">
            <div>
              <p className="text-sm font-medium">
                Đã chọn {selectedRooms.length}/{maxCompare} phòng
              </p>
              <p className="text-xs text-blue-100">
                Để so sánh các phòng đã chọn
              </p>
            </div>

            {selectedRooms.length >= 2 && (
              <button
                className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                onClick={() => {
                  // Handle compare action
                  console.log("Compare rooms:", selectedRooms);
                }}
              >
                So sánh
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
