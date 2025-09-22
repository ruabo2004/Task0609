import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Users,
  Maximize2,
  MapPin,
  Star,
  Calendar,
  Clock,
  Wifi,
  Wind,
  Tv,
  Car,
  Coffee,
  Bath,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import {
  useRoom,
  useRoomAvailability,
  useRoomPricing,
  useSimilarRooms,
} from "@hooks/useRooms";
import { useAuth } from "@contexts/AuthContext";
import {
  formatPrice,
  getRoomImageUrls,
  getBedTypeDisplay,
  getViewTypeDisplay,
  calculateNights,
  formatRoomDescription,
} from "@utils/roomHelpers";
import RoomGrid from "@components/Room/RoomGrid";
import LoadingSpinner from "@components/Common/LoadingSpinner";
import Button from "@components/Form/Button";
import { toast } from "react-toastify";

/**
 * RoomDetail Page
 * Detailed view of a specific room with booking capabilities
 */
const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Fetch room data
  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError,
  } = useRoom(roomId);

  // Fetch room availability
  const { availability, isLoading: isLoadingAvailability } =
    useRoomAvailability(roomId, checkInDate, checkOutDate);

  // Fetch room pricing
  const { pricing, isLoading: isLoadingPricing } = useRoomPricing(
    roomId,
    checkInDate,
    checkOutDate,
    { num_adults: numAdults, num_children: numChildren }
  );

  // Fetch similar rooms
  const { similarRooms, isLoading: isLoadingSimilar } = useSimilarRooms(
    roomId,
    4
  );

  // Set default dates (today + 1 for check-in, today + 2 for check-out)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    setCheckInDate(tomorrow.toISOString().split("T")[0]);
    setCheckOutDate(dayAfter.toISOString().split("T")[0]);
  }, []);

  // Handle back navigation
  const handleGoBack = () => {
    navigate(-1);
  };

  // Handle image selection
  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để sử dụng chức năng yêu thích");
      return;
    }

    setIsFavorite(!isFavorite);
    toast.success(
      isFavorite ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích"
    );
  };

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: room.room_name,
          text: `Xem phòng ${room.room_name} - ${formatPrice(
            room.price_per_night
          )}/đêm`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép liên kết");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Handle booking
  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đặt phòng");
      navigate("/login");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Vui lòng chọn ngày nhận phòng và trả phòng");
      return;
    }

    if (checkInDate && checkOutDate && !availability?.is_available) {
      toast.error("Phòng không khả dụng cho ngày đã chọn");
      return;
    }

    // Navigate to booking page with pre-filled data
    const bookingParams = new URLSearchParams({
      room_id: roomId,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      num_adults: numAdults.toString(),
      num_children: numChildren.toString(),
    });

    navigate(`/create-booking?${bookingParams}`);
  };

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const amenityIcons = {
      "WiFi miễn phí": <Wifi className="w-5 h-5" />,
      "Điều hòa": <Wind className="w-5 h-5" />,
      "TV LCD": <Tv className="w-5 h-5" />,
      "Bãi đỗ xe": <Car className="w-5 h-5" />,
      "Máy pha cà phê": <Coffee className="w-5 h-5" />,
      "Phòng tắm riêng": <Bath className="w-5 h-5" />,
    };

    return amenityIcons[amenity] || <CheckCircle className="w-5 h-5" />;
  };

  // Loading state
  if (isLoadingRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải thông tin phòng..." />
      </div>
    );
  }

  // Error state
  if (isRoomError || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <XCircle className="w-16 h-16 text-red-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy phòng
          </h2>
          <p className="text-gray-600 mb-4">
            {roomError?.message ||
              "Phòng bạn tìm kiếm không tồn tại hoặc đã bị xóa"}
          </p>
          <Button onClick={handleGoBack}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const roomImages = getRoomImageUrls(room);
  const nights = calculateNights(checkInDate, checkOutDate);
  // If no dates selected, assume available. Otherwise use API result.
  const isAvailable =
    !checkInDate || !checkOutDate ? true : availability?.is_available ?? true;
  const totalPrice = pricing?.final_amount || room.price_per_night * nights;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Chia sẻ"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite
                    ? "text-red-600 hover:text-red-700 bg-red-50"
                    : "text-gray-600 hover:text-red-600 hover:bg-gray-100"
                }`}
                title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-96 rounded-lg overflow-hidden">
                <img
                  src={roomImages[selectedImageIndex]}
                  alt={room.room_name}
                  className="w-full h-full object-cover"
                />

                {/* Image navigation */}
                {roomImages.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {roomImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageSelect(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === selectedImageIndex
                              ? "border-white"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${room.room_name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Room Info */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                {room.type_name && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-2">
                    {room.type_name}
                  </span>
                )}

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {room.room_name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  {room.room_size && (
                    <div className="flex items-center space-x-1">
                      <Maximize2 className="w-4 h-4" />
                      <span>{room.room_size}m²</span>
                    </div>
                  )}

                  {room.max_occupancy && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Tối đa {room.max_occupancy} khách</span>
                    </div>
                  )}

                  {room.view_type && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{getViewTypeDisplay(room.view_type)}</span>
                    </div>
                  )}

                  {room.bed_type && (
                    <div className="flex items-center space-x-1">
                      <span>{getBedTypeDisplay(room.bed_type)}</span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                {room.average_rating && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-current text-yellow-400" />
                      <span className="font-semibold">
                        {room.average_rating.toFixed(1)}
                      </span>
                    </div>
                    {room.total_reviews && (
                      <span className="text-gray-600">
                        ({room.total_reviews} đánh giá)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {room.description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Mô tả
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {room.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Tiện nghi
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(showAllAmenities
                      ? room.amenities
                      : room.amenities.slice(0, 9)
                    ).map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="text-blue-600">
                          {getAmenityIcon(amenity)}
                        </div>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>

                  {room.amenities.length > 9 && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="mt-4 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {showAllAmenities
                        ? "Thu gọn"
                        : `Xem thêm ${room.amenities.length - 9} tiện nghi`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(room.price_per_night)}
                    </span>
                    <span className="text-gray-600">/đêm</span>
                  </div>

                  {room.weekend_price &&
                    room.weekend_price !== room.price_per_night && (
                      <p className="text-sm text-gray-600 mt-1">
                        Cuối tuần: {formatPrice(room.weekend_price)}
                      </p>
                    )}
                </div>

                {/* Date Selection */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày nhận phòng
                      </label>
                      <input
                        type="date"
                        value={checkInDate || ""}
                        onChange={(e) => setCheckInDate(e.target.value || null)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày trả phòng
                      </label>
                      <input
                        type="date"
                        value={checkOutDate || ""}
                        onChange={(e) =>
                          setCheckOutDate(e.target.value || null)
                        }
                        min={
                          checkInDate || new Date().toISOString().split("T")[0]
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Guest Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Người lớn
                      </label>
                      <select
                        value={numAdults}
                        onChange={(e) => setNumAdults(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from(
                          { length: room.max_occupancy || 4 },
                          (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trẻ em
                      </label>
                      <select
                        value={numChildren}
                        onChange={(e) =>
                          setNumChildren(parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from({ length: 4 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Availability Status */}
                {isLoadingAvailability ? (
                  <div className="flex items-center justify-center py-3">
                    <LoadingSpinner size="sm" text="Kiểm tra tình trạng..." />
                  </div>
                ) : (
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg mb-4 ${
                      isAvailable
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {isAvailable ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {isAvailable ? "Phòng có sẵn" : "Phòng không khả dụng"}
                    </span>
                  </div>
                )}

                {/* Price Breakdown */}
                {pricing && nights > 0 && (
                  <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>
                        {formatPrice(room.price_per_night)} × {nights} đêm
                      </span>
                      <span>{formatPrice(pricing.base_amount)}</span>
                    </div>

                    {pricing.tax_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Thuế và phí</span>
                        <span>{formatPrice(pricing.tax_amount)}</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                      <span>Tổng cộng</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}

                {/* Booking Button */}
                <Button
                  onClick={handleBooking}
                  disabled={
                    !checkInDate ||
                    !checkOutDate ||
                    !isAvailable ||
                    nights <= 0 ||
                    isLoadingAvailability
                  }
                  className="w-full"
                  size="lg"
                >
                  {!isAuthenticated
                    ? "Đăng nhập để đặt phòng"
                    : !checkInDate || !checkOutDate
                    ? "Chọn ngày để đặt phòng"
                    : "Đặt phòng ngay"}
                </Button>

                {/* Additional Info */}
                <div className="mt-4 text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-1">
                    <Info className="w-4 h-4" />
                    <span>Không tính phí khi đặt phòng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Rooms */}
        {similarRooms.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Phòng tương tự
            </h2>
            <RoomGrid
              rooms={similarRooms}
              layout="grid"
              loading={isLoadingSimilar}
              itemsPerRow={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetail;
