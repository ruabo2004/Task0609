import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRooms, useAvailableRooms } from '@/hooks/useRooms';
import { getRoomSizeDisplay } from '@/utils/roomUtils';
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Modal,
} from '@/components';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  UsersIcon,
  StarIcon,
  WifiIcon,
  TvIcon,
  BeakerIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

// Function to translate room type to Vietnamese
const translateRoomType = (roomType) => {
  const translations = {
    'single': 'Phòng đơn',
    'double': 'Phòng đôi', 
    'suite': 'Cao cấp',
    'family': 'Phòng gia đình',
    'deluxe': 'Phòng deluxe',
    'standard': 'Phòng tiêu chuẩn',
    'presidential': 'Phòng tổng thống'
  };
  return translations[roomType] || roomType;
};

/**
 * RoomsPage - Browse and filter available rooms
 */
const RoomsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(''); // Từ khóa đã áp dụng
  const [priceRange, setPriceRange] = useState('');
  const [roomType, setRoomType] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('price_asc');
  const [showFilters, setShowFilters] = useState(false);

  // New states for date filtering from URL params
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);

  // Build filters for server-side filtering and pagination
  const filters = React.useMemo(() => {
    const filterObj = {};
    
    // Chỉ sử dụng appliedSearchTerm thay vì searchTerm để tránh tự động tìm kiếm
    if (appliedSearchTerm) filterObj.search = appliedSearchTerm;
    if (priceRange) {
      if (priceRange.includes('+')) {
        filterObj.min_price = parseInt(priceRange.replace('+', ''));
      } else {
        const [min, max] = priceRange.split('-').map(Number);
        filterObj.min_price = min;
        filterObj.max_price = max;
      }
    }
    if (roomType) filterObj.room_type = roomType;
    if (sortBy) filterObj.sort = sortBy;
    
    // Add date and guest filters from URL params (backend expects check_in, check_out)
    if (checkInDate) filterObj.check_in = checkInDate;
    if (checkOutDate) filterObj.check_out = checkOutDate;
    if (guestCount > 0) filterObj.guests = guestCount;
    
    return filterObj;
  }, [appliedSearchTerm, priceRange, roomType, sortBy, checkInDate, checkOutDate, guestCount]);

  // Use appropriate hook based on whether we have date filters
  const hasDateFilters = checkInDate && checkOutDate;
  
  // Use useRooms hook with filters
  const { 
    data: allRooms, 
    loading, 
    error, 
    pagination,
    setPage,
    refetch 
  } = useRooms(filters, {
    immediate: true, // Enable auto-fetching on mount
    showErrorToast: true,
    limit: 50 // Get more rooms to filter
  });
  
  // Client-side filtering for guest capacity when we have date filters
  const rooms = React.useMemo(() => {
    if (!allRooms) return [];
    
    if (hasDateFilters && guestCount > 0) {
      return allRooms.filter(room => room.capacity >= guestCount);
    }
    
    return allRooms;
  }, [allRooms, hasDateFilters, guestCount]);

  // Initialize filters from URL params on component mount
  useEffect(() => {
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const price = searchParams.get('price');
    
    if (checkIn) setCheckInDate(checkIn);
    if (checkOut) setCheckOutDate(checkOut);
    if (guests) setGuestCount(parseInt(guests));
    if (search) {
      setSearchTerm(search);
      setAppliedSearchTerm(search); // Áp dụng luôn từ URL
    }
    if (type) setRoomType(type);
    if (price) setPriceRange(price);
    
    // Show filters if any URL params exist
    if (checkIn || checkOut || guests || search || type || price) {
      setShowFilters(true);
    }
  }, [searchParams]);

  // Update URL params when filters change
  const updateURLParams = React.useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    // Update filter params - sử dụng appliedSearchTerm thay vì searchTerm
    if (appliedSearchTerm) params.set('search', appliedSearchTerm);
    else params.delete('search');
    
    if (roomType) params.set('type', roomType);
    else params.delete('type');
    
    if (priceRange) params.set('price', priceRange);
    else params.delete('price');
    
    setSearchParams(params);
  }, [appliedSearchTerm, roomType, priceRange, searchParams, setSearchParams]);

  // URL updates only on manual search
  // Removed auto-update to prevent auto-filtering

  // Filter options
  const priceRangeOptions = [
    { value: '', label: 'Tất cả giá' },
    { value: '0-500000', label: 'Dưới 500,000 VNĐ' },
    { value: '500000-1000000', label: '500,000 - 1,000,000 VNĐ' },
    { value: '1000000-2000000', label: '1,000,000 - 2,000,000 VNĐ' },
    { value: '2000000+', label: 'Trên 2,000,000 VNĐ' },
  ];

  const roomTypeOptions = [
    { value: '', label: 'Tất cả loại phòng' },
    { value: 'single', label: 'Phòng đơn' },
    { value: 'double', label: 'Phòng đôi' },
    { value: 'suite', label: 'Cao cấp' },
    { value: 'family', label: 'Phòng gia đình' },
  ];

  const sortOptions = [
    { value: 'price_asc', label: 'Giá: Thấp đến cao' },
    { value: 'price_desc', label: 'Giá: Cao đến thấp' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'name', label: 'Tên A-Z' },
  ];

  const amenityOptions = [
    { id: 'wifi', label: 'WiFi miễn phí', icon: WifiIcon },
    { id: 'parking', label: 'Bãi đỗ xe', icon: MapPinIcon },
    { id: 'tv', label: 'TV', icon: TvIcon },
    { id: 'minibar', label: 'Mini Bar', icon: BeakerIcon },
  ];

  // Rooms are now filtered and paginated on the server-side
  // The 'rooms' data already contains the filtered results for the current page
  const displayRooms = rooms || [];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Skeleton */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-blue-200 rounded-lg w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-blue-200 rounded-lg w-2/3 mx-auto mb-8"></div>
              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
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
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Khám Phá Các Phòng Tuyệt Vời
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Tìm kiếm và đặt phòng phù hợp với nhu cầu của bạn từ bộ sưu tập đa dạng của chúng tôi
          </p>
          
        </div>
      </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Advanced Filters Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2 text-blue-600" />
                Bộ Lọc Tìm Kiếm
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {showFilters ? 'Thu gọn' : 'Mở rộng'}
              </Button>
            </div>
      </div>

          <div className="p-6 space-y-6">
            {/* Main Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Tìm kiếm theo tên phòng, loại phòng..."
                  leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setAppliedSearchTerm(searchTerm); // Áp dụng từ khóa tìm kiếm
                      updateURLParams();
                      refetch();
                    }
                  }}
                  className="text-lg py-4 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setAppliedSearchTerm(searchTerm); // Áp dụng từ khóa tìm kiếm
                  updateURLParams(); // Update URL first
                  refetch(); // Then fetch data
                }}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Tìm kiếm
              </Button>
            </div>
        
            {/* Active Date Filters */}
            {(checkInDate || checkOutDate || guestCount > 1) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-blue-800 flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Bộ lọc đang áp dụng:
                  </span>
                  {checkInDate && (
                    <Badge variant="primary" className="bg-blue-100 text-blue-800 border-blue-200">
                      Nhận: {new Date(checkInDate).toLocaleDateString('vi-VN')}
                    </Badge>
                  )}
                  {checkOutDate && (
                    <Badge variant="primary" className="bg-blue-100 text-blue-800 border-blue-200">
                      Trả: {new Date(checkOutDate).toLocaleDateString('vi-VN')}
                    </Badge>
                  )}
                  {guestCount > 1 && (
                    <Badge variant="primary" className="bg-blue-100 text-blue-800 border-blue-200">
                      {guestCount} khách
                    </Badge>
                  )}
                  <button
                    onClick={() => {
                      setCheckInDate('');
                      setCheckOutDate('');
                      setGuestCount(1);
                      setSearchParams({});
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-medium underline hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                  >
                    × Xóa bộ lọc ngày
                  </button>
                </div>
              </div>
            )}

            {/* Collapsible Filter Controls */}
            {showFilters && (
              <div className="space-y-6 border-t border-gray-100 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại phòng</label>
          <Select
                      placeholder="Chọn loại phòng"
            value={roomType}
                      onChange={(value) => setRoomType(value)}
            options={roomTypeOptions}
                      className="bg-gray-50 border-gray-200 focus:bg-white"
          />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá</label>
          <Select
                      placeholder="Chọn khoảng giá"
            value={priceRange}
                      onChange={(value) => setPriceRange(value)}
            options={priceRangeOptions}
                      className="bg-gray-50 border-gray-200 focus:bg-white"
          />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp theo</label>
          <Select
                      placeholder="Chọn cách sắp xếp"
            value={sortBy}
                      onChange={(value) => setSortBy(value)}
            options={sortOptions}
                      className="bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </div>
                </div>
          
                {/* Amenities Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tiện nghi</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {amenityOptions.map((amenity) => {
                      const isSelected = amenities.includes(amenity.id);
                      const Icon = amenity.icon;
                      return (
                        <button
                          key={amenity.id}
                          onClick={() => {
                            let newAmenities;
                            if (isSelected) {
                              newAmenities = amenities.filter(a => a !== amenity.id);
                            } else {
                              newAmenities = [...amenities, amenity.id];
                            }
                            setAmenities(newAmenities);
                          }}
                          className={`
                            flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2
                            ${isSelected 
                              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-md transform scale-105' 
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {amenity.label}
                          {isSelected && <span className="ml-auto text-blue-600">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search & Clear Buttons */}
                <div className="flex justify-center gap-4 pt-6 border-t border-gray-100">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setAppliedSearchTerm(searchTerm); // Áp dụng từ khóa tìm kiếm
                      updateURLParams();
                      refetch();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-semibold"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2 inline" />
                    Tìm kiếm
                  </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('');
              setAppliedSearchTerm(''); // Xóa cả từ khóa đã áp dụng
              setRoomType('');
              setPriceRange('');
                      setAmenities([]);
              setSortBy('price_asc');
                      setCheckInDate('');
                      setCheckOutDate('');
                      setGuestCount(1);
                      setSearchParams({});
            }}
                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 px-8 py-3 rounded-xl font-semibold"
          >
                    Xóa tất cả bộ lọc
          </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
                ) : (
                  `Tìm thấy ${rooms.length} phòng`
                )}
              </h2>
              
              {/* Active Filters Indicator */}
              {(appliedSearchTerm || roomType || priceRange || amenities.length > 0) && (
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="bg-blue-100 text-blue-700">
                    Đã lọc
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setAppliedSearchTerm(''); // Xóa cả từ khóa đã áp dụng
                      setRoomType('');
                      setPriceRange('');
                      setAmenities([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-xs"
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <span className="text-sm text-gray-500">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
            )}
          </div>
        
        {/* Active Filter Tags */}
        {(appliedSearchTerm || roomType || priceRange || amenities.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {appliedSearchTerm && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Tìm kiếm: "{appliedSearchTerm}"
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setAppliedSearchTerm(''); // Xóa cả từ khóa đã áp dụng
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
            {roomType && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Loại: {roomType}
                <button
                  onClick={() => {
                    setRoomType('');
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
            {priceRange && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Giá: {priceRange.replace('-', ' - ')}
                <button
                  onClick={() => {
                    setPriceRange('');
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
            {amenities.length > 0 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Tiện ích: {amenities.length} mục
                <button
                  onClick={() => {
                    setAmenities([]);
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Rooms Grid */}
      {displayRooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-400 mb-6">
            <HomeIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Không tìm thấy phòng nào</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Thử điều chỉnh tiêu chí tìm kiếm hoặc xóa bộ lọc để xem thêm lựa chọn phù hợp.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setSearchTerm('');
              setAppliedSearchTerm(''); // Xóa cả từ khóa đã áp dụng
              setRoomType('');
              setPriceRange('');
              setAmenities([]);
              setSortBy('price_asc');
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 rounded-xl font-semibold"
          >
            Xóa tất cả bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayRooms.map((room) => (
          <Card key={room.id} className="group overflow-hidden bg-white rounded-2xl shadow-lg border-0 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
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
              
              {/* Discount Badge */}
              {room.original_price && room.original_price > (room.price_per_night || room.price) && (
                <div className="absolute top-4 left-4">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    Giảm {Math.round((1 - (room.price_per_night || room.price) / room.original_price) * 100)}%
                  </div>
                </div>
              )}
              
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

            <CardContent className="p-6">
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
                      <UsersIcon className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{room.capacity} khách</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HomeIcon className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{getRoomSizeDisplay(room)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Phòng {room.room_number}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {room.rating && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(room.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 ml-1">
                        {room.rating}
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
                        {formatCurrency(room.original_price)}
                      </span>
                    )}
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {formatCurrency(parseFloat(room.price_per_night || room.price || 0))}
                      </div>
                      <span className="text-sm text-gray-600">/đêm</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Giá cuối cùng</div>
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(parseFloat(room.price_per_night || room.price || 0) * 1.1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Link
                    to={`/rooms/${room.id}`}
                    className="flex-1 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold py-3 rounded-xl transition-all duration-200 text-center inline-flex items-center justify-center"
                  >
                    Chi tiết
                  </Link>
                {room.status === 'available' ? (
                  <Button
                    variant="primary"
                    to={`/booking/new?roomId=${room.id}`}
                    className="flex-2 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Đặt ngay
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    disabled
                    className="flex-2 font-semibold py-3 px-6 rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed"
                  >
                    Không có sẵn
                  </Button>
                )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Enhanced Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> đến{' '}
              <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> trong tổng số{' '}
              <span className="font-semibold">{pagination.total}</span> phòng
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <Button
                variant="ghost"
                disabled={pagination.page === 1}
                onClick={() => setPage(pagination.page - 1)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  pagination.page === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                ← Trước
              </Button>

            {/* Page Numbers */}
            {[...Array(pagination.totalPages)].map((_, index) => {
              const pageNum = index + 1;
              const isCurrentPage = pageNum === pagination.page;
              
              // Show first page, last page, current page, and pages around current
              const shouldShow = 
                pageNum === 1 || 
                pageNum === pagination.totalPages || 
                Math.abs(pageNum - pagination.page) <= 1;

              if (!shouldShow) {
                // Show ellipsis for gaps
                if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                  return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                }
                return null;
              }

              return (
                <Button
                  key={pageNum}
                  variant="ghost"
                  onClick={() => setPage(pageNum)}
                  className={`min-w-[44px] h-11 rounded-xl font-semibold transition-all duration-200 ${
                    isCurrentPage 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-110' 
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}

              {/* Next Button */}
              <Button
                variant="ghost"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  pagination.page === pagination.totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                Tiếp →
              </Button>
            </div>
          </div>
        </div>
      )}
      
      </div>
    </div>
  );
};

export default RoomsPage;