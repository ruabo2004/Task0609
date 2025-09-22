import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Hooks
import { useBookings } from "@hooks/useBookings";

// Components
import LoadingSpinner from "@components/Common/LoadingSpinner";

// Utils
import {
  formatPrice,
  formatBookingDates,
  getBookingDuration,
  formatGuestCount,
  getBookingStatusInfo,
} from "@utils/bookingHelpers";

const BookingConfirmation = () => {
  // ==========================================
  // HOOKS & STATE
  // ==========================================
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookingData, setBookingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getBookingById } = useBookings();

  // ==========================================
  // EFFECTS
  // ==========================================
  useEffect(() => {
    const loadBookingData = async () => {
      try {
        // Get booking data from location state (from booking process)
        if (location.state?.bookingData) {
          setBookingData(location.state.bookingData);
          setPaymentData(location.state.paymentData);
          setIsLoading(false);
          return;
        }

        // Get booking ID from URL params (direct access)
        const bookingId = searchParams.get("bookingId");
        const confirmationCode = searchParams.get("confirmation");

        if (bookingId) {
          const booking = await getBookingById(bookingId);
          setBookingData(booking);
          setIsLoading(false);
        } else if (confirmationCode) {
          // Get booking by confirmation code
          // This would require a separate API endpoint
          toast.info("Đang tải thông tin đặt phòng...");
          setIsLoading(false);
        } else {
          // No booking data available
          toast.error("Không tìm thấy thông tin đặt phòng");
          navigate("/rooms");
        }
      } catch (error) {
        console.error("Error loading booking data:", error);
        toast.error("Có lỗi xảy ra khi tải thông tin đặt phòng");
        setIsLoading(false);
      }
    };

    loadBookingData();
  }, [location.state, searchParams, getBookingById, navigate]);

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  const getConfirmationStatus = () => {
    if (!bookingData) return null;

    const statusInfo = getBookingStatusInfo(bookingData.status);

    return {
      ...statusInfo,
      isSuccess: ["confirmed", "paid"].includes(bookingData.status),
      isPending: ["pending", "processing"].includes(bookingData.status),
      isFailed: ["cancelled", "failed"].includes(bookingData.status),
    };
  };

  const generateShareText = () => {
    if (!bookingData) return "";

    return `Tôi vừa đặt phòng tại ${bookingData.homestay_name || "Homestay"}! 
Phòng ${bookingData.room_number} 
Ngày: ${formatBookingDates(
      bookingData.check_in_date,
      bookingData.check_out_date
    )}
Mã đặt phòng: ${bookingData.confirmation_code}`;
  };

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  const handleDownloadReceipt = async () => {
    try {
      // This would call the API to generate and download receipt
      toast.info("Đang tạo hóa đơn...");

      // Mock implementation
      setTimeout(() => {
        toast.success("Hóa đơn đã được gửi về email của bạn");
      }, 2000);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo hóa đơn");
    }
  };

  const handleShareBooking = () => {
    const shareText = generateShareText();

    if (navigator.share) {
      navigator.share({
        title: "Đặt phòng thành công",
        text: shareText,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success("Đã sao chép thông tin đặt phòng");
      });
    }
  };

  const handleViewBookingHistory = () => {
    navigate("/booking/history");
  };

  const handleBackToRooms = () => {
    navigate("/rooms");
  };

  const handleContactSupport = () => {
    // Open support chat or call
    window.open("tel:+84123456789", "_self");
  };

  // ==========================================
  // RENDER COMPONENTS
  // ==========================================
  const renderSuccessHeader = () => {
    const status = getConfirmationStatus();

    return (
      <div className="text-center mb-8">
        {status?.isSuccess && (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {status?.isPending && (
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {status?.isFailed && (
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {status?.isSuccess && "Đặt phòng thành công! 🎉"}
          {status?.isPending && "Đang xử lý đặt phòng ⏳"}
          {status?.isFailed && "Đặt phòng không thành công ❌"}
        </h1>

        <p className="text-lg text-gray-600">
          {status?.isSuccess &&
            "Cảm ơn bạn đã đặt phòng. Chúng tôi sẽ liên hệ với bạn sớm nhất."}
          {status?.isPending &&
            "Chúng tôi đang xử lý yêu cầu đặt phòng của bạn."}
          {status?.isFailed &&
            "Vui lòng thử lại hoặc liên hệ hỗ trợ để được giúp đỡ."}
        </p>

        {bookingData?.confirmation_code && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-600 mr-2">Mã đặt phòng:</span>
            <span className="font-mono font-bold text-blue-800 text-lg">
              {bookingData.confirmation_code}
            </span>
          </div>
        )}
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

  // ==========================================
  // RENDER
  // ==========================================
  if (isLoading) {
    return renderLoadingState();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        {renderSuccessHeader()}

        {/* Mock Booking Details - Since we don't have real data yet */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Chi tiết đặt phòng
          </h2>
          <div className="text-center text-gray-600">
            <p>Trang xác nhận đặt phòng đang được phát triển...</p>
            <p className="mt-2">Vui lòng quay lại sau!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tải hóa đơn
            </button>

            <button
              onClick={handleShareBooking}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Chia sẻ
            </button>

            <button
              onClick={handleViewBookingHistory}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Lịch sử đặt phòng
            </button>

            <button
              onClick={handleContactSupport}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Liên hệ hỗ trợ
            </button>
          </div>

          <div className="mt-6 pt-6 border-t flex flex-col md:flex-row gap-4">
            <button
              onClick={handleBackToRooms}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Xem phòng khác
            </button>

            <button
              onClick={() => navigate("/rooms")}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Đặt phòng khác
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            📋 Các bước tiếp theo
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div>1. Chúng tôi sẽ gửi email xác nhận đến địa chỉ của bạn</div>
            <div>2. Homestay sẽ liên hệ với bạn trong vòng 2-4 giờ</div>
            <div>3. Mang theo giấy tờ tùy thân khi check-in</div>
            <div>4. Đến homestay đúng giờ để được hỗ trợ tốt nhất</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;


