import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// Hooks
import { useRooms } from "@hooks/useRooms";
import { useAvailability } from "@hooks/useAvailability";

// Components
import BookingForm from "@components/Booking/BookingForm";
import LoadingSpinner from "@components/Common/LoadingSpinner";

// Utils
import { formatPrice } from "@utils/bookingHelpers";
import { formatDate } from "@utils/dateUtils";

const BookingPage = () => {
  // ==========================================
  // HOOKS & STATE
  // ==========================================
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [initialBookingData, setInitialBookingData] = useState({});

  // Get room data
  const {
    room,
    isLoading: isLoadingRoom,
    error: roomError,
  } = useRooms({ roomId });

  // ==========================================
  // EFFECTS
  // ==========================================
  useEffect(() => {
    // Parse URL search params for initial booking data
    const searchParams = new URLSearchParams(location.search);
    const initialData = {};

    // Extract booking parameters from URL
    if (searchParams.get("checkIn")) {
      initialData.checkInDate = new Date(searchParams.get("checkIn"));
    }
    if (searchParams.get("checkOut")) {
      initialData.checkOutDate = new Date(searchParams.get("checkOut"));
    }
    if (searchParams.get("adults")) {
      initialData.adults = parseInt(searchParams.get("adults"));
    }
    if (searchParams.get("children")) {
      initialData.children = parseInt(searchParams.get("children"));
    }
    if (searchParams.get("infants")) {
      initialData.infants = parseInt(searchParams.get("infants"));
    }

    // Get data from location state (from room detail page)
    if (location.state?.bookingData) {
      Object.assign(initialData, location.state.bookingData);
    }

    setInitialBookingData(initialData);
  }, [location]);

  useEffect(() => {
    // Handle room loading error
    if (roomError) {
      toast.error("Không thể tải thông tin phòng");
      navigate("/rooms");
    }
  }, [roomError, navigate]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  const handleBookingSuccess = (bookingResult) => {
    toast.success("Đặt phòng thành công!");

    // Navigate to confirmation page with booking data
    navigate("/booking/confirmation", {
      state: {
        bookingData: bookingResult.booking,
        paymentData: bookingResult.payment,
      },
    });
  };

  const handleBookingCancel = () => {
    // Navigate back to room detail or rooms list
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/rooms/${roomId}`);
    }
  };

  const handleBookingError = (error) => {
    console.error("Booking error:", error);
    toast.error("Có lỗi xảy ra trong quá trình đặt phòng. Vui lòng thử lại.");
  };

  // ==========================================
  // RENDER COMPONENTS
  // ==========================================
  const renderRoomInfo = () => {
    if (!room) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start space-x-6">
          {/* Room Image */}
          <div className="flex-shrink-0">
            <img
              src={
                room.images?.[0] ||
                `http://localhost:5000/api/images/placeholder/200/150`
              }
              alt={`Phòng ${room.room_number}`}
              className="w-48 h-32 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = `http://localhost:5000/api/images/placeholder/200/150`;
              }}
            />
          </div>

          {/* Room Details */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Phòng {room.room_number}
                </h1>
                <p className="text-lg text-gray-600">{room.room_type_name}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(room.base_price)}
                </div>
                <div className="text-sm text-gray-500">mỗi đêm</div>
              </div>
            </div>

            {/* Room Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <span className="mr-2">👥</span>
                <span>Tối đa {room.max_occupancy} khách</span>
              </div>

              <div className="flex items-center">
                <span className="mr-2">📐</span>
                <span>{room.room_size}m²</span>
              </div>

              {room.bed_type && (
                <div className="flex items-center">
                  <span className="mr-2">🛏️</span>
                  <span>{room.bed_type}</span>
                </div>
              )}

              {room.view_type && (
                <div className="flex items-center">
                  <span className="mr-2">🌅</span>
                  <span>View {room.view_type}</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Tiện nghi:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 6).map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 6 && (
                    <span className="text-xs text-gray-500">
                      +{room.amenities.length - 6} tiện nghi khác
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Đang tải thông tin đặt phòng...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Không thể tải thông tin phòng
        </h2>
        <p className="text-gray-600 mb-6">
          Vui lòng thử lại sau hoặc chọn phòng khác
        </p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
          <button
            onClick={() => navigate("/rooms")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Xem phòng khác
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDER
  // ==========================================
  if (isLoadingRoom) {
    return renderLoadingState();
  }

  if (roomError || !room) {
    return renderErrorState();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <button
              onClick={() => navigate("/rooms")}
              className="hover:text-blue-600 transition-colors"
            >
              Danh sách phòng
            </button>
            <span>›</span>
            <button
              onClick={() => navigate(`/rooms/${roomId}`)}
              className="hover:text-blue-600 transition-colors"
            >
              Phòng {room.room_number}
            </button>
            <span>›</span>
            <span className="text-gray-900 font-medium">Đặt phòng</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Đặt phòng</h1>
              <p className="text-gray-600 mt-1">
                Hoàn tất thông tin để đặt phòng
              </p>
            </div>

            {/* Help Button */}
            <button
              onClick={() => {
                // Open help modal or chat
                toast.info("Cần hỗ trợ? Gọi hotline: 0123-456-789");
              }}
              className="flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Cần hỗ trợ?
            </button>
          </div>
        </div>

        {/* Room Information */}
        {renderRoomInfo()}

        {/* Booking Form */}
        <BookingForm
          roomId={roomId}
          roomData={room}
          initialData={initialBookingData}
          onSuccess={handleBookingSuccess}
          onCancel={handleBookingCancel}
          onError={handleBookingError}
          className="max-w-none"
        />

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Booking Policies */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              📋 Chính sách đặt phòng
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>• Check-in: 14:00 - 22:00</div>
              <div>• Check-out: 06:00 - 12:00</div>
              <div>• Hủy miễn phí trước 24h</div>
              <div>• Không hút thuốc trong phòng</div>
              <div>• Không cho phép thú cưng</div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              📞 Liên hệ hỗ trợ
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="mr-2">📱</span>
                <span>Hotline: 0123-456-789</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">✉️</span>
                <span>Email: support@homestay.com</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">💬</span>
                <span>Chat: 24/7 online</span>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              🔒 Bảo mật & An toàn
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>• Thông tin được mã hóa SSL</div>
              <div>• Thanh toán an toàn 100%</div>
              <div>• Không lưu trữ thông tin thẻ</div>
              <div>• Tuân thủ chuẩn PCI DSS</div>
              <div>• Bảo vệ dữ liệu cá nhân</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;


