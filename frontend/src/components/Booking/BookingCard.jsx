import React, { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Utils
import { 
  getBookingStatusInfo, 
  canCancelBooking, 
  canModifyBooking,
  formatBookingDates,
  getBookingDuration,
  formatGuestCount,
  formatPrice
} from '@utils/bookingHelpers';

// Components
import LoadingSpinner from '@components/Common/LoadingSpinner';

const BookingCard = ({
  booking,
  onView = () => {},
  onCancel = () => {},
  onModify = () => {},
  onReview = () => {},
  showActions = true,
  compact = false,
  className = ""
}) => {
  // ==========================================
  // STATE
  // ==========================================
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // ==========================================
  // DERIVED DATA
  // ==========================================
  const statusInfo = getBookingStatusInfo(booking.status);
  const canCancel = canCancelBooking(booking);
  const canModify = canModifyBooking(booking);
  const bookingDuration = getBookingDuration(booking.check_in_date, booking.check_out_date);
  const guestCount = formatGuestCount(booking.adults, booking.children, booking.infants);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  const handleAction = async (action, handler) => {
    setIsLoading(true);
    try {
      await handler(booking);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RENDER COMPONENTS
  // ==========================================
  const renderStatus = () => (
    <div className="flex items-center">
      <div 
        className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${statusInfo.bgColor} ${statusInfo.textColor}
        `}
      >
        <span className="mr-1">{statusInfo.icon}</span>
        {statusInfo.label}
      </div>
    </div>
  );

  const renderRoomInfo = () => (
    <div className="flex items-start space-x-4">
      {/* Room Image */}
      {booking.room_image && (
        <div className="flex-shrink-0">
          <img
            src={booking.room_image}
            alt={`Phòng ${booking.room_number}`}
            className="w-16 h-16 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = `http://localhost:5000/api/images/placeholder/64/64`;
            }}
          />
        </div>
      )}

      {/* Room Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            Phòng {booking.room_number}
          </h3>
          {renderStatus()}
        </div>
        
        <p className="text-sm text-gray-600 mt-1">
          {booking.room_type_name}
        </p>

        {booking.homestay_name && (
          <p className="text-sm text-gray-500">
            📍 {booking.homestay_name}
          </p>
        )}
      </div>
    </div>
  );

  const renderBookingDetails = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Dates */}
      <div>
        <div className="text-sm text-gray-600">Thời gian</div>
        <div className="font-medium">
          {formatBookingDates(booking.check_in_date, booking.check_out_date)}
        </div>
        <div className="text-sm text-gray-500">
          {bookingDuration} đêm
        </div>
      </div>

      {/* Guests */}
      <div>
        <div className="text-sm text-gray-600">Số khách</div>
        <div className="font-medium">{guestCount}</div>
      </div>

      {/* Price */}
      <div>
        <div className="text-sm text-gray-600">Tổng giá</div>
        <div className="text-lg font-semibold text-blue-600">
          {formatPrice(booking.total_price)}
        </div>
        {booking.discount_amount > 0 && (
          <div className="text-sm text-green-600">
            Tiết kiệm {formatPrice(booking.discount_amount)}
          </div>
        )}
      </div>

      {/* Booking Date */}
      <div>
        <div className="text-sm text-gray-600">Ngày đặt</div>
        <div className="font-medium">
          {format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
        </div>
        {booking.confirmation_code && (
          <div className="text-sm text-gray-500">
            Mã: {booking.confirmation_code}
          </div>
        )}
      </div>
    </div>
  );

  const renderExtraServices = () => {
    if (!booking.extra_services || booking.extra_services.length === 0) {
      return null;
    }

    return (
      <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">Dịch vụ bổ sung</div>
        <div className="space-y-1">
          {booking.extra_services.map((service, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{service.service_name}</span>
              <span className="font-medium">{formatPrice(service.price)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        {/* View Details */}
        <button
          onClick={() => onView(booking)}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Xem chi tiết
        </button>

        {/* Modify Booking */}
        {canModify && (
          <button
            onClick={() => handleAction('modify', onModify)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Thay đổi'}
          </button>
        )}

        {/* Cancel Booking */}
        {canCancel && (
          <button
            onClick={() => handleAction('cancel', onCancel)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Hủy đặt phòng'}
          </button>
        )}

        {/* Review */}
        {booking.status === 'completed' && !booking.has_review && (
          <button
            onClick={() => onReview(booking)}
            className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
          >
            Đánh giá
          </button>
        )}

        {/* Contact Support */}
        <button
          onClick={() => {
            // Implement contact support
            window.open(`tel:+84123456789`, '_self');
          }}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Liên hệ hỗ trợ
        </button>
      </div>
    );
  };

  const renderCompactView = () => (
    <div className="flex items-center space-x-4">
      {/* Room Image */}
      {booking.room_image && (
        <img
          src={booking.room_image}
          alt={`Phòng ${booking.room_number}`}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          onError={(e) => {
            e.target.src = `http://localhost:5000/api/images/placeholder/48/48`;
          }}
        />
      )}

      {/* Booking Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 truncate">
            Phòng {booking.room_number}
          </h4>
          {renderStatus()}
        </div>
        
        <div className="text-sm text-gray-600 mt-1">
          {formatBookingDates(booking.check_in_date, booking.check_out_date)}
        </div>
        
        <div className="text-sm font-medium text-blue-600">
          {formatPrice(booking.total_price)}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0">
        <button
          onClick={() => onView(booking)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  // ==========================================
  // RENDER
  // ==========================================
  if (compact) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
        {renderCompactView()}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        {renderRoomInfo()}

        {/* Booking Details */}
        {renderBookingDetails()}

        {/* Extra Services */}
        {renderExtraServices()}

        {/* Special Requests */}
        {booking.special_requests && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-1">Yêu cầu đặc biệt</div>
            <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
              {booking.special_requests}
            </div>
          </div>
        )}

        {/* Payment Info */}
        {booking.payment_status && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-1">Thanh toán</div>
            <div className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${booking.payment_status === 'paid' 
                ? 'bg-green-100 text-green-800' 
                : booking.payment_status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
              }
            `}>
              {booking.payment_status === 'paid' ? '✅ Đã thanh toán' 
                : booking.payment_status === 'pending' ? '⏳ Chờ thanh toán'
                : '❌ Chưa thanh toán'}
            </div>
          </div>
        )}

        {/* Toggle Details */}
        {!compact && (
          <div className="mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showDetails ? 'Ẩn chi tiết' : 'Xem thêm chi tiết'}
            </button>
          </div>
        )}

        {/* Extended Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {booking.check_in_time && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giờ nhận phòng:</span>
                <span className="font-medium">{booking.check_in_time}</span>
              </div>
            )}
            
            {booking.check_out_time && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giờ trả phòng:</span>
                <span className="font-medium">{booking.check_out_time}</span>
              </div>
            )}

            {booking.guest_name && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tên khách:</span>
                <span className="font-medium">{booking.guest_name}</span>
              </div>
            )}

            {booking.guest_phone && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Số điện thoại:</span>
                <span className="font-medium">{booking.guest_phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {renderActions()}
      </div>

      {/* Status Bar */}
      {booking.status === 'confirmed' && (
        <div className="bg-green-50 px-6 py-3 border-t">
          <div className="flex items-center text-sm text-green-800">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Đặt phòng đã được xác nhận. Chúng tôi sẽ liên hệ với bạn sớm nhất.
          </div>
        </div>
      )}

      {booking.status === 'cancelled' && booking.cancellation_reason && (
        <div className="bg-red-50 px-6 py-3 border-t">
          <div className="text-sm text-red-800">
            <div className="font-medium">Lý do hủy:</div>
            <div className="mt-1">{booking.cancellation_reason}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// BOOKING CARD SKELETON
// ==========================================
export const BookingCardSkeleton = ({ compact = false, className = "" }) => {
  if (compact) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
