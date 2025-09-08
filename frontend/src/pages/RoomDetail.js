import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { roomAPI, bookingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import MoMoPayment from '../components/Payment/MoMoPayment';

const RoomDetail = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [bookingData, setBookingData] = useState({
    checkInDate: searchParams.get('checkInDate') ? new Date(searchParams.get('checkInDate')) : null,
    checkOutDate: searchParams.get('checkOutDate') ? new Date(searchParams.get('checkOutDate')) : null,
    numberOfGuests: 1,
    specialRequests: ''
  });
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [costCalculation, setCostCalculation] = useState(null);

  const { data: room, isLoading: roomLoading, error: roomError } = useQuery(
    ['room', roomId],
    () => roomAPI.getRoomById(roomId),
    {
      select: (response) => response.data.data.room
    }
  );

  const { data: costData, refetch: refetchCost } = useQuery(
    ['bookingCost', roomId, bookingData],
    () => bookingAPI.calculateBookingCost({
      room_id: parseInt(roomId),
      check_in_date: bookingData.checkInDate.toISOString().split('T')[0],
      check_out_date: bookingData.checkOutDate.toISOString().split('T')[0],
      number_of_guests: bookingData.numberOfGuests
    }),
    {
      enabled: !!(bookingData.checkInDate && bookingData.checkOutDate),
      select: (response) => response.data.data
    }
  );

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.info('Vui lòng đăng nhập để đặt phòng');
      navigate('/login', { 
        state: { from: location.pathname + location.search } 
      });
      return;
    }

    try {
      const response = await bookingAPI.createBooking({
        room_id: parseInt(roomId),
        check_in_date: bookingData.checkInDate.toISOString().split('T')[0],
        check_out_date: bookingData.checkOutDate.toISOString().split('T')[0],
        number_of_guests: bookingData.numberOfGuests,
        special_requests: bookingData.specialRequests,
        total_amount: costData?.cost_breakdown?.total_amount
      });

      if (response.data.success) {
        setCurrentBooking(response.data.data.booking);
        setShowBookingForm(false);
        setShowPayment(true);
        toast.success('Tạo đặt phòng thành công! Vui lòng thanh toán để xác nhận.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng';
      toast.error(message);
    }
  };

  const handlePaymentSuccess = (payment) => {
    toast.success('Thanh toán thành công! Đặt phòng đã được xác nhận.');
    navigate('/booking-history');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setCurrentBooking(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy phòng</h2>
          <button
            onClick={() => navigate('/rooms')}
            className="btn btn-primary"
          >
            Quay lại danh sách phòng
          </button>
        </div>
      </div>
    );
  }

  if (showPayment && currentBooking) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowPayment(false)}
              className="btn btn-outline mb-6 flex items-center gap-2"
            >
              
              Quay lại
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          <button
            onClick={() => navigate('/rooms')}
            className="btn btn-outline mb-6 flex items-center gap-2"
          >
            
            Quay lại danh sách phòng
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
              <div className="card">
                
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg">
                  <div className="w-full h-64 bg-gradient-to-br from-primary-light to-primary-color rounded-t-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{room.room_number}</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{room.type_name}</h1>
                      <p className="text-gray-600">Phòng số {room.room_number}</p>
                    </div>
                    <div className="flex items-center">
                      
                      <span>4.8 (24 đánh giá)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center">
                      
                      <span>Tối đa {room.max_occupancy} khách</span>
                    </div>
                    <div className="flex items-center">
                      
                      <span>Tầng {room.floor_number}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Mô tả</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {room.description || room.type_description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Tiện nghi</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {room.amenities?.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600">Giá mỗi đêm từ</p>
                        <p className="text-3xl font-bold text-primary-color">
                          {formatPrice(room.base_price)}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowBookingForm(true)}
                        className="btn btn-primary btn-lg flex items-center gap-2"
                      >
                        
                        Đặt phòng ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <div className="card-header">
                  <h3 className="text-xl font-semibold">Đặt phòng</h3>
                </div>
                <div className="card-body">
                  {!showBookingForm ? (
                    <div className="text-center py-8">
                      
                      <p className="text-gray-600 mb-4">
                        Chọn ngày để xem giá và đặt phòng
                      </p>
                      <button
                        onClick={() => setShowBookingForm(true)}
                        className="btn btn-primary w-full"
                      >
                        Bắt đầu đặt phòng
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="form-group">
                        <label className="form-label">Ngày nhận phòng *</label>
                        <DatePicker
                          selected={bookingData.checkInDate}
                          onChange={(date) => setBookingData({...bookingData, checkInDate: date})}
                          minDate={new Date()}
                          className="form-input w-full"
                          placeholderText="Chọn ngày"
                          dateFormat="dd/MM/yyyy"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Ngày trả phòng *</label>
                        <DatePicker
                          selected={bookingData.checkOutDate}
                          onChange={(date) => setBookingData({...bookingData, checkOutDate: date})}
                          minDate={bookingData.checkInDate || new Date()}
                          className="form-input w-full"
                          placeholderText="Chọn ngày"
                          dateFormat="dd/MM/yyyy"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Số khách *</label>
                        <select
                          value={bookingData.numberOfGuests}
                          onChange={(e) => setBookingData({...bookingData, numberOfGuests: parseInt(e.target.value)})}
                          className="form-input form-select w-full"
                          required
                        >
                          {Array.from({length: room.max_occupancy}, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num} khách</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Yêu cầu đặc biệt</label>
                        <textarea
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                          className="form-input form-textarea"
                          rows={3}
                          placeholder="Nhập yêu cầu đặc biệt (không bắt buộc)"
                        />
                      </div>

                      {costData && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Chi tiết giá</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>{formatPrice(room.base_price)} x {costData.dates?.number_of_nights} đêm</span>
                              <span>{formatPrice(costData.cost_breakdown?.base_amount)}</span>
                            </div>
                            {costData.cost_breakdown?.services_amount > 0 && (
                              <div className="flex justify-between">
                                <span>Dịch vụ bổ sung</span>
                                <span>{formatPrice(costData.cost_breakdown?.services_amount)}</span>
                              </div>
                            )}
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span>Tổng cộng</span>
                              <span className="text-primary-color">
                                {formatPrice(costData.cost_breakdown?.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBookingForm(false)}
                          className="btn btn-outline flex-1"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={!costData}
                          className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                          
                          Đặt & Thanh toán
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
