import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRooms } from '../../hooks/useRooms';
import { getRoomSizeDisplay } from '../../utils/roomUtils';

// Helper function to parse amenities (handle JSON array, comma-separated strings, or arrays)
const parseAmenities = (amenities) => {
  if (!amenities) return [];
  
  // If it's already an array, return it
  if (Array.isArray(amenities)) {
    return amenities;
  }
  
  // If it's not a string, return empty array
  if (typeof amenities !== 'string') {
    return [];
  }
  
  try {
    // Try to parse as JSON first
    return JSON.parse(amenities);
  } catch {
    // If not JSON, split by comma
    return amenities.split(',').map(a => a.trim());
  }
};

// Function to translate room type to Vietnamese
const translateRoomType = (roomType) => {
  const translations = {
    'single': 'Phòng đơn',
    'double': 'Phòng đôi', 
    'suite': 'Phòng suite',
    'family': 'Phòng gia đình',
    'deluxe': 'Phòng deluxe',
    'standard': 'Phòng tiêu chuẩn',
    'presidential': 'Phòng tổng thống'
  };
  return translations[roomType] || roomType;
};

/**
 * HomePage component - Landing page for the homestay website
 */
const HomePage = () => {
  const [searchData, setSearchData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  const { data: roomsData, loading: roomsLoading, error: roomsError } = useRooms({
    featured: true,
    with_rating: true,
  }, {
    immediate: true,
  });

  // Featured rooms already sorted by rating from backend - take top 6
  const featuredRooms = (roomsData || []).slice(0, 6);

  // Testimonials data (static for now)
  const testimonialsData = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      rating: 5,
      comment: "Phòng rất đẹp và thoải mái, dịch vụ tốt!",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Trần Thị B",
      rating: 5,
      comment: "Homestay tuyệt vời, sẽ quay lại lần sau!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Lê Văn C",
      rating: 4,
      comment: "Giá cả hợp lý, phòng sạch sẽ và tiện nghi.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    }
  ];
  const testimonialsLoading = false;

  // Helper function để format ngày tránh lỗi timezone
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setSearchData({
      checkIn: formatDateLocal(today),
      checkOut: formatDateLocal(tomorrow),
      guests: 1
    });
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams({
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      guests: searchData.guests.toString()
    });
    window.location.href = `/rooms?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
            <div className="text-center">
              {/* Simplified Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Khám Phá Homestay Tuyệt Vời
                </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Trải nghiệm kỳ nghỉ đáng nhớ với những căn phòng thoải mái và dịch vụ tận tâm
              </p>

              {/* Simplified Search Widget */}
              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nhận phòng</label>
                    <input
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trả phòng</label>
                    <input
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số khách</label>
                    <select
                      value={searchData.guests}
                      onChange={(e) => setSearchData({...searchData, guests: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} khách</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSearch}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Tìm Phòng
                    </button>
                  </div>
                </div>

                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Simplified Featured Rooms Section */}
      <section className="py-20 bg-gray-50">
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Phòng Nổi Bật</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá những phòng được yêu thích nhất với thiết kế hiện đại và tiện nghi đầy đủ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.length > 0 ? featuredRooms.map((room, index) => (
              <div key={room.id} className="group overflow-hidden bg-white rounded-2xl shadow-lg border-0 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Room Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={room.images?.[0] || room.image_url || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
              {/* Availability Badge - Only show if available_rooms data exists */}
              {typeof room.available_rooms === 'number' && (
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                    room.available_rooms > 5 
                      ? 'bg-green-100 text-green-800' 
                      : room.available_rooms > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {room.available_rooms > 0 ? `Còn ${room.available_rooms} phòng` : 'Hết phòng'}
                  </div>
                </div>
              )}
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Room Info */}
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                          {room.name || `${translateRoomType(room.room_type || room.type)} ${room.room_number}`}
                        </h3>
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {translateRoomType(room.room_type || room.type)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{room.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{room.capacity} khách</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{getRoomSizeDisplay(room)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Phòng {room.room_number}</span>
                        </div>
                      </div>
                  </div>

                    {/* Rating */}
                    {room.rating && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-semibold text-gray-900">
                            ⭐ {room.rating}/5
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {room.review_count || room.reviewCount || 0} đánh giá
                        </span>
                      </div>
                    )}

                    {/* Amenities Preview */}
                  {room.amenities && (
                      <div className="flex flex-wrap gap-2">
                        {(typeof room.amenities === 'string' 
                          ? room.amenities.split(',').slice(0, 3)
                          : room.amenities.slice(0, 3)
                        ).map((amenity, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {amenity.trim()}
                        </span>
                      ))}
                        {((typeof room.amenities === 'string' ? room.amenities.split(',') : room.amenities) || []).length > 3 && (
                          <span className="text-xs text-blue-600 font-medium">+{((typeof room.amenities === 'string' ? room.amenities.split(',') : room.amenities) || []).length - 3} khác</span>
                        )}
                    </div>
                  )}
                  
                    {/* Price */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-end justify-between">
                    <div>
                          {room.original_price && room.original_price > (room.price_per_night || room.price) && (
                            <span className="text-sm text-gray-500 line-through block">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.original_price)}
                      </span>
                          )}
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(room.price_per_night || room.price || 0))}
                          </div>
                          <span className="text-sm text-gray-600">/đêm</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Giá cuối cùng</div>
                          <div className="text-sm font-semibold text-green-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(room.price_per_night || room.price || 0) * 1.1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                    <Link
                      to={`/rooms/${room.id}`}
                        className="flex-1 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold py-3 rounded-xl transition-all duration-200 text-center"
                      >
                        Chi tiết
                      </Link>
                      <Link
                        to={room.status === 'available' ? `/booking/new?roomId=${room.id}` : '#'}
                        className={`flex-2 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-center ${
                          room.status === 'available' 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {room.status === 'available' ? 'Đặt ngay' : 'Không có sẵn'}
                    </Link>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              // Simple loading skeleton
              [1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="flex gap-3">
                      <div className="h-12 bg-gray-300 rounded-xl flex-1"></div>
                      <div className="h-12 bg-gray-300 rounded-xl flex-1"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Simple CTA */}
          <div className="text-center mt-16">
            <Link
              to="/rooms"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Xem Tất Cả Phòng →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Tại Sao Chọn Chúng Tôi
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Dịch Vụ Đẳng Cấp 5 Sao
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm tuyệt vời nhất cho mỗi kỳ nghỉ của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: 'Phòng Cao Cấp',
                  description: 'Thiết kế hiện đại với đầy đủ tiện nghi và tầm nhìn tuyệt đẹp',
                  color: 'bg-blue-500',
                },
                {
                  title: 'Đặt Phòng Nhanh',
                  description: 'Hệ thống đặt phòng trực tuyến an toàn với xác nhận tức thì',
                  color: 'bg-green-500',
                },
                {
                  title: 'Hỗ Trợ 24/7',
                  description: 'Đội ngũ chăm sóc khách hàng chuyên nghiệp luôn sẵn sàng hỗ trợ',
                  color: 'bg-purple-500',
                },
                {
                  title: 'Vị Trí Đắc Địa',
                  description: 'Gần trung tâm thành phố và các điểm du lịch nổi tiếng',
                  color: 'bg-red-500',
                },
              ].map((feature, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl text-white text-2xl font-bold mb-4 group-hover:shadow-lg`}>
                        {index + 1}
                      </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Khách Hàng Nói Gì
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trải Nghiệm Tuyệt Vời
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Hàng nghìn khách hàng đã tin tưởng và lựa chọn dịch vụ của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonialsLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-gray-200 rounded mr-1"></div>
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              testimonialsData.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-500 font-bold text-lg">
                    {'⭐'.repeat(testimonial.rating)}
                  </span>
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">Khách hàng</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '1000+', label: 'Khách Hàng Hài Lòng' },
              { number: '50+', label: 'Phòng Cao Cấp' },
              { number: '24/7', label: 'Hỗ Trợ Khách Hàng' },
              { number: '4.9', label: 'Đánh Giá Trung Bình' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-200 font-medium">
                  {stat.label}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Sẵn Sàng Cho Chuyến Đi Tuyệt Vời?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Đặt phòng ngay hôm nay và trải nghiệm dịch vụ homestay đẳng cấp 5 sao với giá cả hợp lý
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rooms"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-primary-600 bg-white hover:bg-primary-50 transition-all duration-200 hover:transform hover:scale-105 shadow-lg"
            >
              Khám Phá Phòng
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-medium rounded-xl text-white hover:bg-white hover:text-primary-600 transition-all duration-200 hover:transform hover:scale-105"
            >
              Liên Hệ Ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
