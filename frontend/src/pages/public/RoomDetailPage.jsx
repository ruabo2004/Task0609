import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { getRoomSizeDisplay, calculateRoomSize } from '@/utils/roomUtils';
import { useReviews, useReviewStats } from '@/hooks/useReviews';

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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Input,
  Modal,
} from '@/components';
import {
  ArrowLeftIcon,
  UsersIcon,
  MapPinIcon,
  StarIcon,
  WifiIcon,
  TvIcon,
  BeakerIcon,
  HomeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ShareIcon,
  PhotoIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Get reviews and stats for this room
  const { reviews, loading: reviewsLoading } = useReviews(id, { 
    immediate: true, 
    limit: 50, // Increase limit to get more reviews
    showErrorToast: false 
  });
  const { stats: reviewStats } = useReviewStats(id);

  useEffect(() => {
    const fetchRoom = async () => {
      // Check if ID exists
      if (!id) {
        console.error('No room ID provided');
        toast.error('Không tìm thấy ID phòng');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching room with ID:', id); // Debug log
        const response = await apiService.rooms.getById(id);
        console.log('Full response:', response); // Debug full response
        console.log('API Response:', response.data); // Debug log
        console.log('Response.data.data:', response.data.data); // Debug nested data
        console.log('Room data:', response.data.data?.room); // Debug room data
        console.log('Response data keys:', Object.keys(response.data || {})); // Debug keys
        
        // Try different response structures
        let roomData;
        
        // Handle different possible response structures
        if (response.data && response.data.room) {
          roomData = response.data.room;
        } else if (response.data && response.data.data && response.data.data.room) {
          roomData = response.data.data.room;
        } else if (response.data && response.data.id) {
          roomData = response.data;
        } else {
          console.error('Unexpected response structure:', response);
          throw new Error('Invalid API response structure');
        }
        
        // Check if roomData exists and has id
        if (!roomData || !roomData.id) {
          console.error('Room data structure:', roomData);
          console.error('Full response:', response);
          throw new Error('Room data not found or invalid');
        }
        
        // Transform the API data to match the expected format
        const transformedRoom = {
          id: roomData.id,
          room_number: roomData.room_number,
          room_type: roomData.room_type,
          name: roomData.name || `${translateRoomType(roomData.room_type)} ${roomData.room_number}`,
          description: roomData.description || 'Phòng thoải mái và được trang bị đầy đủ với các tiện nghi hiện đại.',
          price_per_night: roomData.price_per_night,
          capacity: roomData.capacity,
          size: roomData.size || calculateRoomSize(roomData.capacity),
          rating: reviewStats.averageRating || roomData.average_rating || 0,
          review_count: reviewStats.totalReviews || roomData.review_count || 0,
          status: roomData.status,
          images: Array.isArray(roomData.images) && roomData.images.length > 0 ? roomData.images : [
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
          ],
          amenities: Array.isArray(roomData.amenities) && roomData.amenities.length > 0 ? roomData.amenities.map(amenity => ({
            id: amenity.toLowerCase().replace(/\s+/g, '_'),
            label: amenity,
            icon: getAmenityIcon(amenity),
            description: getAmenityDescription(amenity)
          })) : [
            { id: 'wifi', label: 'WiFi miễn phí', icon: WifiIcon, description: 'Truy cập internet tốc độ cao' },
            { id: 'tv', label: 'TV thông minh', icon: TvIcon, description: 'TV thông minh với ứng dụng streaming' },
            { id: 'minibar', label: 'Mini Bar', icon: BeakerIcon, description: 'Đồ uống có sẵn' },
            { id: 'balcony', label: 'Ban công riêng', icon: HomeIcon, description: 'Không gian ngoài trời riêng tư' },
          ],
          features: roomData.features || [
            'Giường ngủ thoải mái', 'Phòng tắm riêng', 'Điều hòa nhiệt độ', 'Dịch vụ dọn phòng hàng ngày', 'Dịch vụ phòng có sẵn', 'Nội thất hiện đại'
          ],
          highlights: [
            { title: 'Thoải mái', description: 'Thiết kế tốt cho sự thoải mái của bạn' },
            { title: 'Tiện nghi hiện đại', description: 'Tất cả tiện nghi hiện đại' },
            { title: 'Vị trí tuyệt vời', description: 'Vị trí thuận tiện' },
          ]
        };
        
        setRoom(transformedRoom);
      } catch (error) {
        console.error('Failed to fetch room:', error);
        toast.error('Không thể tải thông tin phòng');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoom();
    }
  }, [id]);

  // Helper functions for amenities
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return WifiIcon;
    if (amenityLower.includes('tv') || amenityLower.includes('television')) return TvIcon;
    if (amenityLower.includes('bar') || amenityLower.includes('drink')) return BeakerIcon;
    if (amenityLower.includes('balcony') || amenityLower.includes('terrace')) return HomeIcon;
    return HomeIcon; // default icon
  };

  const getAmenityDescription = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return 'Truy cập internet tốc độ cao';
    if (amenityLower.includes('tv')) return 'Hệ thống giải trí';
    if (amenityLower.includes('bar')) return 'Đồ uống có sẵn';
    if (amenityLower.includes('balcony')) return 'Không gian ngoài trời riêng tư';
    return 'Tiện nghi có sẵn';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button Loading */}
          <div className="animate-pulse mb-8">
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Loading */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Image Loading */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-96 bg-gray-200"></div>
                </div>
              </div>

              {/* Room Info Loading */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="animate-pulse space-y-6">
                  {/* Title and Badge */}
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded-lg"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded-lg"></div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>

                  {/* Amenities Loading */}
                  <div className="space-y-4">
                    <div className="h-6 w-24 bg-blue-200 rounded-xl"></div>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-200 rounded"></div>
                          <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Loading */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-8 w-40 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded-lg"></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </div>

                  <div className="h-12 bg-gray-200 rounded-lg"></div>

                  <div className="h-4 w-full bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy phòng</h1>
          <Button onClick={() => navigate('/rooms')}>Quay lại danh sách phòng</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <div className="mb-8">
      <Button
        variant="ghost"
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
        onClick={() => navigate('/rooms')}
            className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
      >
            Quay lại danh sách phòng
      </Button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image Gallery */}
            <div className="relative group">
              <Card className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-0 relative">
                  <div className="relative overflow-hidden">
                    <img
                      src={room.images[currentImageIndex]}
                alt={room.name}
                      className="w-full h-[500px] object-cover transition-all duration-700 transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    
                    {/* Image Navigation */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="flex space-x-2 bg-black/30 backdrop-blur-md rounded-full px-4 py-2">
                        {room.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              index === currentImageIndex
                                ? 'bg-white shadow-lg'
                                : 'bg-white/50 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Room Type Badge */}
                    <div className="absolute top-6 left-6">
                      <Badge variant="secondary" className="backdrop-blur-md bg-white/20 border border-white/30 text-white font-bold px-4 py-2 rounded-full capitalize">
                        <SparklesIcon className="h-4 w-4 mr-2" />
                  {translateRoomType(room.room_type)}
                </Badge>
              </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Room Information */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <CardHeader className="px-8 py-6">
                  <CardTitle className="text-3xl font-bold text-gray-900 flex items-center justify-between">
                    <span>{room.name}</span>
                    <div className="flex items-center gap-2 text-yellow-500">
                      <StarIcon className="h-6 w-6 fill-current" />
                      <span className="text-xl font-bold">{reviewStats.averageRating || room.rating || 0}</span>
                      <span className="text-sm text-gray-600">({reviewStats.totalReviews || room.review_count || 0} đánh giá)</span>
                    </div>
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Description */}
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">{room.description}</p>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {room.highlights.map((highlight, index) => (
                      <div key={index} className="group relative p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200">
                        <h4 className="font-bold text-gray-900 text-lg mb-2">{highlight.title}</h4>
                        <p className="text-gray-600 text-sm">{highlight.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Room Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <MapPinIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-bold text-gray-900">Phòng {room.room_number}</div>
                      <div className="text-sm text-gray-600">Số phòng</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <UsersIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="font-bold text-gray-900">{room.capacity} khách</div>
                      <div className="text-sm text-gray-600">Sức chứa</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <HomeIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="font-bold text-gray-900">{room.size}m²</div>
                      <div className="text-sm text-gray-600">Diện tích</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="font-bold text-green-600">Có sẵn</div>
                      <div className="text-sm text-gray-600">Trạng thái</div>
                  </div>
                </div>

                  {/* Enhanced Amenities */}
                <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <SparklesIcon className="h-6 w-6 text-blue-600 mr-2" />
                      Tiện Nghi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {room.amenities.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                          <div key={amenity.id} className="group p-4 bg-gradient-to-r from-white/60 to-blue-50/60 rounded-2xl border border-blue-200/30 hover:shadow-lg hover:scale-105 transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900">{amenity.label}</h5>
                                <p className="text-sm text-gray-600">{amenity.description}</p>
                              </div>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

          {/* Enhanced Booking Sidebar */}
        <div className="lg:col-span-1">
            <Card className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <CardHeader className="px-8 py-6">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <CurrencyDollarIcon className="h-6 w-6 mr-3 text-green-600" />
                    Giá & Đặt Phòng
              </CardTitle>
                  <div className="mt-2">
                    <span className="text-gray-600 text-sm">Đặt ngay để có giá tốt nhất</span>
                  </div>
            </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                {/* Enhanced Pricing */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600">
                {formatCurrency(room.price_per_night)}
                      </div>
                      <div className="text-lg font-semibold text-gray-600 mt-1">/ đêm</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Giá đã bao gồm thuế và phí dịch vụ
                      </div>
                    </div>
                  </div>

                {/* Availability Status */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-gray-700">Tình trạng</span>
                  </div>
                  <Badge variant="success" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 px-4 py-2 rounded-full font-bold shadow-sm animate-pulse">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Có sẵn
                  </Badge>
              </div>

                {/* Special Offers */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 relative overflow-hidden">
                  <h5 className="font-bold text-blue-800 mb-2">Ưu đãi đặc biệt!</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                      Miễn phí hủy phòng trong 24h
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                      Bữa sáng miễn phí
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                      WiFi tốc độ cao
                    </li>
                  </ul>
              </div>

                {/* Enhanced Book Now Button */}
              <Button
                variant="primary"
                fullWidth
                    leftIcon={<CalendarDaysIcon className="h-6 w-6" />}
                to={`/booking/new?roomId=${room.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-lg"
                  >
                    <div className="flex items-center justify-center">
                      <span>Đặt Phòng Ngay</span>
                      <div className="ml-3 transform group-hover:translate-x-1 transition-transform duration-200">
                        <span className="text-2xl">→</span>
                      </div>
                    </div>
              </Button>

                {/* Additional Info */}
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                    <div className="text-center">
                      <h6 className="font-semibold text-gray-800 mb-2">Cần hỗ trợ?</h6>
                      <p className="text-sm text-gray-600 mb-2">Gọi cho chúng tôi 24/7</p>
                      <a href="tel:0886520846" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                        0886520846
                      </a>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <div>
                        <h6 className="font-semibold text-green-800 text-sm">Đặt phòng an toàn</h6>
                        <p className="text-xs text-green-700 mt-1">
                          Thông tin của bạn được bảo mật với mã hóa SSL 256-bit
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Section - Preview (3 reviews) */}
                  {reviews && reviews.length > 0 && (
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <StarIcon className="h-6 w-6 text-yellow-500 mr-2" />
                        Đánh giá từ khách hàng ({reviews.length})
                      </h4>
                      <div className="space-y-4">
                        {reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {review.customer_name ? review.customer_name.charAt(0).toUpperCase() : 'G'}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {review.customer_name || 'Khách hàng'}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon 
                                        key={i} 
                                        className={`h-4 w-4 ${
                                          i < review.rating 
                                            ? 'text-yellow-400 fill-current' 
                                            : 'text-gray-300'
                                        }`} 
                                      />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">
                                      {review.rating}/5
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* View All Reviews Button */}
                      {reviews.length > 3 && (
                        <button
                          onClick={() => setShowAllReviews(true)}
                          className="w-full mt-4 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                        >
                          Xem tất cả {reviews.length} đánh giá
                        </button>
                      )}
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="text-lg font-bold text-purple-600">
                        {reviewStats.averageRating || room.rating || 0}⭐
                      </div>
                      <div className="text-xs text-purple-600">Đánh giá trung bình</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                      <div className="text-lg font-bold text-orange-600">
                        {reviewStats.totalReviews || room.review_count || 0}
                      </div>
                      <div className="text-xs text-orange-600">Tổng đánh giá</div>
                    </div>
                  </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
      
      {/* All Reviews Modal */}
      <Modal 
        isOpen={showAllReviews} 
        onClose={() => setShowAllReviews(false)}
        title={`Tất cả đánh giá (${reviews?.length || 0})`}
      >
        <div className="max-h-[600px] overflow-y-auto p-6">
          <div className="space-y-4">
            {reviews && reviews.map((review) => (
              <div key={review.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {review.customer_name ? review.customer_name.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {review.customer_name || 'Khách hàng'}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`h-5 w-5 ${
                              i < review.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 text-sm leading-relaxed mt-2">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomDetailPage;
