import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Users,
  Maximize2,
  MapPin,
  Star,
  Wifi,
  Wind,
  Tv,
  Car,
  Coffee,
  Bath,
} from "lucide-react";
import {
  formatPrice,
  getRoomImageUrl,
  getBedTypeDisplay,
  getViewTypeDisplay,
} from "@utils/roomHelpers";
import { ROUTES } from "@utils/constants";

/**
 * RoomCard Component
 * Displays room information in card format
 */
const RoomCard = ({
  room,
  layout = "grid", // 'grid' or 'list'
  showPrice = true,
  selectedDates = null,
  onSelect = null,
  onFavoriteToggle = null,
  isFavorite = false,
  className = "",
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!room) return null;

  const roomImage = getRoomImageUrl(room, 0);
  const roomLink = `${ROUTES.ROOMS}/${room.room_id}`;

  // Handle image load events
  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Handle card click
  const handleCardClick = (e) => {
    if (e.target.closest(".favorite-btn") || e.target.closest(".select-btn")) {
      e.preventDefault();
      return;
    }

    if (onSelect) {
      onSelect(room);
    }
  };

  // Handle favorite toggle
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(room.room_id, !isFavorite);
    }
  };

  // Get amenity icons
  const getAmenityIcon = (amenity) => {
    const amenityIcons = {
      "WiFi miễn phí": <Wifi className="w-4 h-4" />,
      "Điều hòa": <Wind className="w-4 h-4" />,
      "TV LCD": <Tv className="w-4 h-4" />,
      "Bãi đỗ xe": <Car className="w-4 h-4" />,
      "Máy pha cà phê": <Coffee className="w-4 h-4" />,
      "Phòng tắm riêng": <Bath className="w-4 h-4" />,
    };

    return amenityIcons[amenity] || null;
  };

  // Render grid layout
  const renderGridLayout = () => (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <Link to={roomLink} className="block h-full">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}

          <img
            src={roomImage}
            alt={room.room_name}
            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {imageError && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <Maximize2 className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Không thể tải ảnh</p>
              </div>
            </div>
          )}
        </Link>

        {/* Favorite Button */}
        {onFavoriteToggle && (
          <button
            className={`favorite-btn absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 ${
              isFavorite
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/80 text-gray-700 hover:bg-white hover:text-red-500"
            }`}
            onClick={handleFavoriteClick}
            title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        )}

        {/* Room Status Badge */}
        {room.status && room.status !== "available" && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
            {room.status === "occupied" ? "Đã đặt" : "Không khả dụng"}
          </div>
        )}

        {/* Rating Badge */}
        {room.average_rating && (
          <div className="absolute bottom-3 left-3 flex items-center px-2 py-1 bg-black/70 text-white text-xs rounded">
            <Star className="w-3 h-3 fill-current text-yellow-400 mr-1" />
            <span>{room.average_rating.toFixed(1)}</span>
            {room.total_reviews && (
              <span className="ml-1 text-gray-300">({room.total_reviews})</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Room Type */}
        {room.type_name && (
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
            {room.type_name}
          </span>
        )}

        {/* Room Name */}
        <Link to={roomLink}>
          <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2">
            {room.room_name}
          </h3>
        </Link>

        {/* Room Details */}
        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
          {room.room_size && (
            <div className="flex items-center">
              <Maximize2 className="w-4 h-4 mr-1" />
              <span>{room.room_size}m²</span>
            </div>
          )}

          {room.max_occupancy && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{room.max_occupancy} khách</span>
            </div>
          )}

          {room.view_type && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{getViewTypeDisplay(room.view_type)}</span>
            </div>
          )}
        </div>

        {/* Bed Type */}
        {room.bed_type && (
          <p className="text-sm text-gray-600 mb-3">
            {getBedTypeDisplay(room.bed_type)}
          </p>
        )}

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {room.amenities.slice(0, 4).map((amenity, index) => {
              const icon = getAmenityIcon(amenity);
              return (
                <div
                  key={index}
                  className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                  title={amenity}
                >
                  {icon && <span className="mr-1">{icon}</span>}
                  <span className="truncate max-w-20">{amenity}</span>
                </div>
              );
            })}
            {room.amenities.length > 4 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                +{room.amenities.length - 4} khác
              </span>
            )}
          </div>
        )}

        {/* Price */}
        {showPrice && (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(room.price_per_night)}
              </span>
              <span className="text-sm text-gray-600 ml-1">/đêm</span>

              {room.weekend_price &&
                room.weekend_price !== room.price_per_night && (
                  <div className="text-xs text-gray-500">
                    Cuối tuần: {formatPrice(room.weekend_price)}
                  </div>
                )}
            </div>

            {onSelect && (
              <button
                className="select-btn px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(room);
                }}
              >
                Chọn phòng
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render list layout
  const renderListLayout = () => (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="flex">
        {/* Image Container */}
        <div className="relative w-64 h-40 flex-shrink-0 overflow-hidden">
          <Link to={roomLink} className="block h-full">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}

            <img
              src={roomImage}
              alt={room.room_name}
              className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {imageError && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Maximize2 className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">Không thể tải ảnh</p>
                </div>
              </div>
            )}
          </Link>

          {/* Favorite Button */}
          {onFavoriteToggle && (
            <button
              className={`favorite-btn absolute top-2 right-2 p-1.5 rounded-full transition-colors duration-200 ${
                isFavorite
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white/80 text-gray-700 hover:bg-white hover:text-red-500"
              }`}
              onClick={handleFavoriteClick}
              title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <Heart
                className={`w-3 h-3 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
          )}

          {/* Rating Badge */}
          {room.average_rating && (
            <div className="absolute bottom-2 left-2 flex items-center px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
              <Star className="w-3 h-3 fill-current text-yellow-400 mr-1" />
              <span>{room.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* Room Type & Name */}
            <div className="mb-2">
              {room.type_name && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-1">
                  {room.type_name}
                </span>
              )}

              <Link to={roomLink}>
                <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                  {room.room_name}
                </h3>
              </Link>
            </div>

            {/* Room Details */}
            <div className="flex items-center text-sm text-gray-600 mb-2 space-x-3">
              {room.room_size && (
                <div className="flex items-center">
                  <Maximize2 className="w-4 h-4 mr-1" />
                  <span>{room.room_size}m²</span>
                </div>
              )}

              {room.max_occupancy && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{room.max_occupancy} khách</span>
                </div>
              )}

              {room.view_type && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{getViewTypeDisplay(room.view_type)}</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {room.amenities.slice(0, 6).map((amenity, index) => {
                  const icon = getAmenityIcon(amenity);
                  return (
                    <div
                      key={index}
                      className="flex items-center text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
                      title={amenity}
                    >
                      {icon && <span className="mr-1">{icon}</span>}
                      <span className="truncate max-w-16">{amenity}</span>
                    </div>
                  );
                })}
                {room.amenities.length > 6 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    +{room.amenities.length - 6}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price & Action */}
          {showPrice && (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(room.price_per_night)}
                </span>
                <span className="text-sm text-gray-600 ml-1">/đêm</span>
              </div>

              {onSelect && (
                <button
                  className="select-btn px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(room);
                  }}
                >
                  Chọn
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return layout === "list" ? renderListLayout() : renderGridLayout();
};

export default RoomCard;
