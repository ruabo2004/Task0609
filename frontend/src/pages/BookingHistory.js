import React from 'react';
import { useQuery } from 'react-query';
import { customerAPI } from '../services/api';

const BookingHistory = () => {
  const { data: bookings, isLoading, error } = useQuery(
    'bookingHistory',
    customerAPI.getBookingHistory,
    {
      select: (response) => response.data.data.bookings
    }
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'checked_in': return 'Đã nhận phòng';
      case 'checked_out': return 'Đã trả phòng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Có lỗi xảy ra</h2>
          <p className="text-gray-600">Không thể tải lịch sử đặt phòng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Lịch sử đặt phòng</h1>
            <p className="text-gray-600">Xem lại các đơn đặt phòng của bạn</p>
          </div>

          {!bookings || bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có đặt phòng nào</h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa có lịch sử đặt phòng. Hãy khám phá các phòng của chúng tôi!
              </p>
              <a href="/rooms" className="btn btn-primary">
                Xem phòng
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.booking_id} className="card">
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {booking.type_name}
                        </h3>
                        <p className="text-gray-600">Phòng {booking.room_number}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.booking_status)}`}>
                          {getStatusText(booking.booking_status)}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Ngày nhận phòng</p>
                        <p className="font-semibold">{formatDate(booking.check_in_date)}</p>
                        <p className="text-sm text-gray-600 mt-2">Ngày trả phòng</p>
                        <p className="font-semibold">{formatDate(booking.check_out_date)}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Số khách</p>
                        <p className="font-semibold">{booking.number_of_guests} người</p>
                        <p className="text-sm text-gray-600 mt-2">Ngày đặt</p>
                        <p className="font-semibold">{formatDate(booking.booking_date)}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">Tổng tiền</p>
                        <p className="text-xl font-bold text-primary-color">
                          {formatPrice(booking.total_amount)}
                        </p>
                        <div className="mt-4 space-y-2">
                          <button className="btn btn-outline btn-sm w-full">
                            Xem chi tiết
                          </button>
                          {booking.booking_status === 'pending' && (
                            <button className="btn btn-outline btn-sm w-full text-red-600 border-red-300 hover:bg-red-50">
                              Hủy đặt phòng
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {booking.special_requests && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">Yêu cầu đặc biệt:</p>
                        <p className="text-gray-800">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
