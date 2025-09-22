import React from "react";
import { Grid, List } from "lucide-react";
import RoomCard from "./RoomCard";

/**
 * RoomGrid Component
 * Displays rooms in a responsive grid layout
 */
const RoomGrid = ({
  rooms = [],
  layout = "grid",
  showPrice = true,
  selectedDates = null,
  onRoomSelect = null,
  onFavoriteToggle = null,
  favoriteRooms = [],
  loading = false,
  className = "",
  itemsPerRow = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
}) => {
  // Show loading skeleton
  if (loading) {
    const skeletonCount = layout === "grid" ? 8 : 4;
    return (
      <div className={`space-y-4 ${className}`}>
        {layout === "grid" ? (
          <div
            className={`grid gap-6 grid-cols-1 md:grid-cols-${itemsPerRow.md} lg:grid-cols-${itemsPerRow.lg} xl:grid-cols-${itemsPerRow.xl}`}
          >
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: skeletonCount }).map((_, index) => (
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
        )}
      </div>
    );
  }

  // Show empty state
  if (!rooms || rooms.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            {layout === "grid" ? (
              <Grid className="w-16 h-16 text-gray-300 mx-auto" />
            ) : (
              <List className="w-16 h-16 text-gray-300 mx-auto" />
            )}
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

  // Grid layout
  if (layout === "grid") {
    return (
      <div
        className={`grid gap-6 grid-cols-1 md:grid-cols-${itemsPerRow.md} lg:grid-cols-${itemsPerRow.lg} xl:grid-cols-${itemsPerRow.xl} ${className}`}
      >
        {rooms.map((room) => (
          <RoomCard
            key={room.room_id}
            room={room}
            layout="grid"
            showPrice={showPrice}
            selectedDates={selectedDates}
            onSelect={onRoomSelect}
            onFavoriteToggle={onFavoriteToggle}
            isFavorite={isRoomFavorite(room.room_id)}
          />
        ))}
      </div>
    );
  }

  // List layout
  return (
    <div className={`space-y-4 ${className}`}>
      {rooms.map((room) => (
        <RoomCard
          key={room.room_id}
          room={room}
          layout="list"
          showPrice={showPrice}
          selectedDates={selectedDates}
          onSelect={onRoomSelect}
          onFavoriteToggle={onFavoriteToggle}
          isFavorite={isRoomFavorite(room.room_id)}
        />
      ))}
    </div>
  );
};

export default RoomGrid;
