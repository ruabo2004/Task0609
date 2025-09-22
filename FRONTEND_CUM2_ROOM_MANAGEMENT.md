# 🏨 CỤM 2: ROOM MANAGEMENT - FRONTEND GUIDE

## 📋 **TỔNG QUAN**

Cụm 2 bao gồm toàn bộ hệ thống quản lý phòng từ frontend: hiển thị danh sách phòng, tìm kiếm, lọc, xem chi tiết phòng, và kiểm tra tình trạng phòng trống.

## 🗂️ **CẤU TRÚC FILES**

```
frontend/src/
├── components/
│   ├── Room/
│   │   ├── RoomCard.js              # Card hiển thị thông tin phòng
│   │   ├── RoomGrid.js              # Grid layout cho danh sách phòng
│   │   ├── RoomList.js              # List layout cho danh sách phòng
│   │   ├── RoomFilter.js            # Component filter/search
│   │   ├── RoomSort.js              # Component sắp xếp
│   │   ├── RoomTypeSelector.js      # Chọn loại phòng
│   │   ├── RoomImageGallery.js      # Gallery hiển thị ảnh phòng
│   │   ├── RoomAmenities.js         # Hiển thị tiện ích phòng
│   │   ├── RoomAvailability.js      # Kiểm tra tình trạng phòng
│   │   └── PriceDisplay.js          # Hiển thị giá phòng
│   ├── Search/
│   │   ├── SearchForm.js            # Form tìm kiếm phòng
│   │   ├── DateRangePicker.js       # Chọn ngày check-in/out
│   │   ├── GuestSelector.js         # Chọn số lượng khách
│   │   └── QuickFilters.js          # Quick filter buttons
│   ├── Layout/
│   │   ├── PageHeader.js            # Header với breadcrumb
│   │   ├── FilterSidebar.js         # Sidebar filter
│   │   └── ViewToggle.js            # Toggle grid/list view
│   └── Common/
│       ├── Pagination.js            # Component phân trang
│       ├── EmptyState.js            # Empty state cho không có kết quả
│       └── SkeletonLoader.js        # Loading skeleton
├── pages/
│   ├── Rooms.js                     # Trang danh sách phòng
│   ├── RoomDetail.js                # Trang chi tiết phòng
│   └── SearchResults.js             # Trang kết quả tìm kiếm
├── hooks/
│   ├── useRooms.js                  # Hook quản lý rooms data
│   ├── useRoomTypes.js              # Hook quản lý room types
│   ├── useRoomSearch.js             # Hook tìm kiếm phòng
│   ├── useRoomFilters.js            # Hook quản lý filters
│   └── usePagination.js             # Hook phân trang
├── services/
│   └── roomService.js               # Room API calls
└── utils/
    ├── roomHelpers.js               # Room utility functions
    ├── priceCalculator.js           # Tính toán giá phòng
    └── dateHelpers.js               # Date utility functions
```

## 🔑 **API ENDPOINTS SUMMARY**

### **Room Management APIs:**
```javascript
// Base URL: http://localhost:5000/api

const ROOM_ENDPOINTS = {
  getAllRooms: 'GET /rooms',
  getRoomById: 'GET /rooms/{id}',
  getRoomTypes: 'GET /rooms/types',
  getAvailableRooms: 'GET /rooms/available',
  searchRooms: 'GET /rooms/search',
  getRoomsByType: 'GET /rooms/type/{typeId}',
  checkAvailability: 'GET /rooms/{id}/availability'
};
```

## 📝 **COMPONENT SPECIFICATIONS**

### **1. Room Display Components**

#### **RoomCard.js**
```javascript
// Props:
{
  room: {
    room_id: number,
    room_number: string,
    room_name: string,
    type_name: string,
    price_per_night: number,
    weekend_price: number,
    holiday_price: number,
    images: string[],
    amenities: string[],
    view_type: string,
    bed_type: string,
    room_size: number,
    status: string,
    max_occupancy: number
  },
  layout: 'grid' | 'list',
  showPrice: boolean,
  showAvailability: boolean,
  onSelect: function,
  selectedDates: { checkIn: Date, checkOut: Date },
  className: string
}

// Features:
- Responsive design cho grid/list layout
- Image carousel với lazy loading
- Price display với weekend/holiday rates
- Amenities tags
- Availability indicator
- Quick book button
- Favorite functionality
- Hover effects và animations
```

#### **RoomImageGallery.js**
```javascript
// Props:
{
  images: string[],
  roomName: string,
  size: 'small' | 'medium' | 'large',
  showThumbnails: boolean,
  showFullscreen: boolean,
  autoPlay: boolean,
  onImageClick: function
}

// Features:
- Image carousel với navigation
- Thumbnail preview
- Fullscreen modal
- Zoom functionality
- Touch/swipe support for mobile
- Lazy loading
- Image optimization
- Loading placeholder
```

#### **RoomAmenities.js**
```javascript
// Props:
{
  amenities: string[],
  layout: 'grid' | 'list' | 'inline',
  showIcons: boolean,
  maxVisible: number,
  expandable: boolean,
  groupByCategory: boolean
}

// Features:
- Icon mapping cho từng amenity
- Grouping theo categories (basic, comfort, technology)
- Show more/less functionality
- Responsive layout
- Tooltip descriptions
```

### **2. Search & Filter Components**

#### **SearchForm.js**
```javascript
// Props:
{
  onSearch: function,
  initialValues: object,
  loading: boolean,
  showAdvanced: boolean,
  layout: 'horizontal' | 'vertical'
}

// Fields:
- Date range picker (check-in, check-out)
- Guest selector (adults, children)
- Room type selector
- Price range slider
- Amenities filter
- View type filter
- Advanced filters toggle

// Features:
- Real-time validation
- Smart defaults
- URL synchronization
- Quick date presets
- Guest count validation
- Form persistence
```

#### **RoomFilter.js**
```javascript
// Props:
{
  filters: object,
  onFilterChange: function,
  roomTypes: array,
  priceRange: { min: number, max: number },
  availableAmenities: string[],
  resetFilters: function,
  layout: 'sidebar' | 'horizontal'
}

// Filter Options:
- Room type (multiple select)
- Price range (slider)
- Bed type (checkboxes)
- View type (radio)
- Floor preference (select)
- Amenities (checkboxes with search)
- Room size range
- Availability status

// Features:
- Active filter indicators
- Filter count badges
- Reset functionality
- Collapsible sections
- Mobile responsive
```

### **3. Layout & Navigation Components**

#### **Pagination.js**
```javascript
// Props:
{
  currentPage: number,
  totalPages: number,
  totalItems: number,
  itemsPerPage: number,
  onPageChange: function,
  onItemsPerPageChange: function,
  showItemsPerPage: boolean,
  showInfo: boolean,
  size: 'small' | 'medium' | 'large'
}

// Features:
- Page number navigation
- Previous/Next buttons
- Jump to first/last
- Items per page selector
- Total items info
- Mobile responsive
- Keyboard navigation
```

#### **ViewToggle.js**
```javascript
// Props:
{
  currentView: 'grid' | 'list',
  onViewChange: function,
  showLabels: boolean,
  size: 'small' | 'medium'
}

// Features:
- Grid/List view toggle
- Icon-based buttons
- Active state styling
- Responsive behavior
```

## 🔧 **SERVICES & API CALLS**

### **roomService.js**
```javascript
import api from './api';
import { getStorageItem, setStorageItem } from '../utils';

export const roomService = {
  // Get all rooms with optional filters
  getRooms: async (params = {}) => {
    const response = await api.get('/rooms', { params });
    return {
      rooms: response.data.data.rooms,
      pagination: response.data.data.pagination
    };
  },

  // Get room by ID
  getRoomById: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data.data.room;
  },

  // Get all room types
  getRoomTypes: async () => {
    // Cache room types for 1 hour
    const cacheKey = 'room_types';
    const cached = getStorageItem(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }
    
    const response = await api.get('/rooms/types');
    const roomTypes = response.data.data.room_types;
    
    setStorageItem(cacheKey, {
      data: roomTypes,
      timestamp: Date.now()
    });
    
    return roomTypes;
  },

  // Search available rooms
  searchRooms: async (searchParams) => {
    const {
      checkInDate,
      checkOutDate,
      guests,
      roomType,
      minPrice,
      maxPrice,
      amenities,
      viewType,
      bedType,
      page = 1,
      limit = 12,
      sortBy = 'price',
      sortOrder = 'asc'
    } = searchParams;

    const params = {
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      num_adults: guests?.adults || 1,
      num_children: guests?.children || 0,
      type_id: roomType,
      min_price: minPrice,
      max_price: maxPrice,
      amenities: amenities?.join(','),
      view_type: viewType,
      bed_type: bedType,
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder
    };

    // Remove empty params
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    const response = await api.get('/rooms/search', { params });
    return {
      rooms: response.data.data.rooms,
      pagination: response.data.data.pagination,
      filters: response.data.data.applied_filters
    };
  },

  // Get available rooms for date range
  getAvailableRooms: async (checkInDate, checkOutDate) => {
    const response = await api.get('/rooms/available', {
      params: { checkInDate, checkOutDate }
    });
    return response.data.data.rooms;
  },

  // Get rooms by type
  getRoomsByType: async (roomTypeId, params = {}) => {
    const response = await api.get(`/rooms/type/${roomTypeId}`, { params });
    return {
      rooms: response.data.data.rooms,
      pagination: response.data.data.pagination
    };
  },

  // Check room availability
  checkRoomAvailability: async (roomId, checkInDate, checkOutDate) => {
    const response = await api.get(`/rooms/${roomId}/availability`, {
      params: { checkInDate, checkOutDate }
    });
    return response.data.data;
  },

  // Get room pricing for date range
  getRoomPricing: async (roomId, checkInDate, checkOutDate) => {
    const response = await api.get(`/rooms/${roomId}/pricing`, {
      params: { checkInDate, checkOutDate }
    });
    return response.data.data.pricing;
  }
};
```

## 🎯 **CUSTOM HOOKS**

### **useRooms.js**
```javascript
import { useQuery, useQueryClient } from 'react-query';
import { roomService } from '../services/roomService';

export const useRooms = (params = {}) => {
  const queryKey = ['rooms', params];
  
  return useQuery(
    queryKey,
    () => roomService.getRooms(params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2
    }
  );
};

export const useRoom = (roomId) => {
  return useQuery(
    ['room', roomId],
    () => roomService.getRoomById(roomId),
    {
      enabled: !!roomId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: 2
    }
  );
};

export const useRoomTypes = () => {
  return useQuery(
    'room-types',
    roomService.getRoomTypes,
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours
      refetchOnWindowFocus: false
    }
  );
};

export const useRoomSearch = () => {
  const queryClient = useQueryClient();
  
  const searchRooms = async (searchParams) => {
    const queryKey = ['room-search', searchParams];
    
    return queryClient.fetchQuery(
      queryKey,
      () => roomService.searchRooms(searchParams),
      {
        staleTime: 2 * 60 * 1000, // 2 minutes
        cacheTime: 5 * 60 * 1000 // 5 minutes
      }
    );
  };

  return { searchRooms };
};

export const useRoomAvailability = (roomId, dates) => {
  return useQuery(
    ['room-availability', roomId, dates],
    () => roomService.checkRoomAvailability(
      roomId, 
      dates.checkIn, 
      dates.checkOut
    ),
    {
      enabled: !!(roomId && dates.checkIn && dates.checkOut),
      staleTime: 1 * 60 * 1000, // 1 minute
      retry: 1
    }
  );
};
```

### **useRoomFilters.js**
```javascript
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { debounce } from '../utils';

export const useRoomFilters = (initialFilters = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    // Initialize from URL params or defaults
    return {
      roomType: searchParams.get('type') || initialFilters.roomType || '',
      priceRange: {
        min: parseInt(searchParams.get('minPrice')) || initialFilters.priceRange?.min || 0,
        max: parseInt(searchParams.get('maxPrice')) || initialFilters.priceRange?.max || 10000000
      },
      amenities: searchParams.get('amenities')?.split(',') || initialFilters.amenities || [],
      viewType: searchParams.get('view') || initialFilters.viewType || '',
      bedType: searchParams.get('bed') || initialFilters.bedType || '',
      sortBy: searchParams.get('sort') || initialFilters.sortBy || 'price',
      sortOrder: searchParams.get('order') || initialFilters.sortOrder || 'asc',
      ...initialFilters
    };
  });

  // Debounced URL update
  const debouncedUpdateURL = useMemo(
    () => debounce((newFilters) => {
      const params = new URLSearchParams();
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 0) {
          if (key === 'priceRange') {
            if (value.min > 0) params.set('minPrice', value.min);
            if (value.max < 10000000) params.set('maxPrice', value.max);
          } else if (key === 'amenities' && Array.isArray(value) && value.length > 0) {
            params.set('amenities', value.join(','));
          } else if (typeof value === 'string' || typeof value === 'number') {
            params.set(key, value);
          }
        }
      });
      
      setSearchParams(params);
    }, 500),
    [setSearchParams]
  );

  // Update URL when filters change
  useEffect(() => {
    debouncedUpdateURL(filters);
  }, [filters, debouncedUpdateURL]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updatePriceRange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  };

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchParams({});
  };

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'priceRange') {
        return value.min > 0 || value.max < 10000000;
      }
      if (key === 'amenities') {
        return Array.isArray(value) && value.length > 0;
      }
      return value && value !== '' && value !== initialFilters[key];
    });
  }, [filters, initialFilters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'priceRange') {
        if (value.min > 0) count++;
        if (value.max < 10000000) count++;
      } else if (key === 'amenities') {
        count += Array.isArray(value) ? value.length : 0;
      } else if (value && value !== '' && value !== initialFilters[key]) {
        count++;
      }
    });
    return count;
  }, [filters, initialFilters]);

  return {
    filters,
    updateFilter,
    updatePriceRange,
    toggleAmenity,
    resetFilters,
    hasActiveFilters,
    activeFilterCount
  };
};
```

## 📋 **VALIDATION & UTILITIES**

### **roomHelpers.js**
```javascript
import { formatCurrency, formatDate } from './index';
import config from '../config/config';

export const roomHelpers = {
  // Format room price based on date and type
  formatRoomPrice: (room, checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) {
      return formatCurrency(room.price_per_night);
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    let totalPrice = 0;
    let nightCount = 0;

    for (let date = new Date(checkIn); date < checkOut; date.setDate(date.getDate() + 1)) {
      nightCount++;
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = roomHelpers.isHoliday(date);

      if (isHoliday && room.holiday_price) {
        totalPrice += room.holiday_price;
      } else if (isWeekend && room.weekend_price) {
        totalPrice += room.weekend_price;
      } else {
        totalPrice += room.price_per_night;
      }
    }

    return {
      totalPrice: formatCurrency(totalPrice),
      averagePerNight: formatCurrency(totalPrice / nightCount),
      nightCount,
      breakdown: {
        baseNights: nightCount,
        basePrice: room.price_per_night,
        weekendPrice: room.weekend_price,
        holidayPrice: room.holiday_price
      }
    };
  },

  // Check if date is holiday
  isHoliday: (date) => {
    const holidays = [
      '01-01', // New Year
      '02-14', // Valentine
      '03-08', // Women's Day
      '04-30', // Liberation Day
      '05-01', // Labor Day
      '09-02', // National Day
      '12-25'  // Christmas
    ];

    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.includes(monthDay);
  },

  // Get room capacity info
  getRoomCapacity: (room) => {
    const capacity = room.max_occupancy || 2;
    return {
      adults: Math.min(capacity, 4),
      children: Math.max(0, capacity - 2),
      total: capacity
    };
  },

  // Get room status display
  getRoomStatusDisplay: (room) => {
    const statusMap = {
      available: { label: 'Có sẵn', color: 'green', icon: '✅' },
      occupied: { label: 'Đã được đặt', color: 'red', icon: '🚫' },
      maintenance: { label: 'Bảo trì', color: 'orange', icon: '🔧' },
      out_of_order: { label: 'Ngừng hoạt động', color: 'gray', icon: '⚠️' }
    };

    return statusMap[room.status] || statusMap.available;
  },

  // Get amenity categories
  categorizeAmenities: (amenities) => {
    const categories = {
      basic: ['WiFi miễn phí', 'Điều hòa', 'TV LCD', 'Máy sấy tóc'],
      comfort: ['Tủ lạnh', 'Ban công', 'Két an toàn', 'Minibar'],
      luxury: ['Bồn tắm jacuzzi', 'Dịch vụ butler', 'Máy pha cà phê cao cấp'],
      view: ['View biển', 'View núi', 'View thành phố', 'View vườn', 'View hồ bơi']
    };

    const categorized = {
      basic: [],
      comfort: [],
      luxury: [],
      view: [],
      other: []
    };

    amenities.forEach(amenity => {
      let found = false;
      Object.entries(categories).forEach(([category, items]) => {
        if (items.some(item => amenity.includes(item))) {
          categorized[category].push(amenity);
          found = true;
        }
      });
      if (!found) {
        categorized.other.push(amenity);
      }
    });

    return categorized;
  },

  // Generate room search URL
  generateSearchURL: (filters) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        if (key === 'priceRange') {
          if (value.min > 0) params.set('minPrice', value.min);
          if (value.max < 10000000) params.set('maxPrice', value.max);
        } else if (key === 'amenities' && Array.isArray(value) && value.length > 0) {
          params.set('amenities', value.join(','));
        } else if (key === 'checkInDate' || key === 'checkOutDate') {
          params.set(key, formatDate(value, 'YYYY-MM-DD'));
        } else {
          params.set(key, value);
        }
      }
    });

    return `/rooms/search?${params.toString()}`;
  },

  // Calculate booking price
  calculateBookingPrice: (room, checkInDate, checkOutDate, guests = {}, services = []) => {
    const pricing = roomHelpers.formatRoomPrice(room, checkInDate, checkOutDate);
    const baseAmount = pricing.totalPrice.replace(/[^\d]/g, '');
    
    // Calculate service costs
    const serviceAmount = services.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);

    // Calculate taxes (10%)
    const subtotal = parseInt(baseAmount) + serviceAmount;
    const taxAmount = subtotal * 0.1;
    const totalAmount = subtotal + taxAmount;

    return {
      baseAmount: parseInt(baseAmount),
      serviceAmount,
      taxAmount,
      totalAmount,
      nights: pricing.nightCount,
      breakdown: pricing.breakdown,
      formatted: {
        baseAmount: formatCurrency(baseAmount),
        serviceAmount: formatCurrency(serviceAmount),
        taxAmount: formatCurrency(taxAmount),
        totalAmount: formatCurrency(totalAmount)
      }
    };
  }
};
```

## 🎨 **STYLING GUIDELINES**

### **Room Card Styles**
```css
/* Room Card Component */
.room-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.room-card-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.room-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.room-card:hover .room-card-image img {
  transform: scale(1.05);
}

.room-card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.room-card-content {
  padding: 1.5rem;
}

.room-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.room-card-type {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.room-card-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.amenity-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.room-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.room-card-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
}

.room-card-price-unit {
  font-size: 0.875rem;
  font-weight: 400;
  color: #6b7280;
}

/* Grid Layout */
.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

/* List Layout */
.room-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.room-card-list {
  display: flex;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.room-card-list .room-card-image {
  width: 200px;
  flex-shrink: 0;
}

.room-card-list .room-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .room-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
  
  .room-card-list {
    flex-direction: column;
  }
  
  .room-card-list .room-card-image {
    width: 100%;
    aspect-ratio: 16/9;
  }
}
```

### **Filter Sidebar Styles**
```css
/* Filter Sidebar */
.filter-sidebar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.filter-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.filter-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  cursor: pointer;
}

.filter-checkbox input {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.price-range-slider {
  margin: 1rem 0;
}

.price-range-values {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

/* Mobile Filter Modal */
@media (max-width: 768px) {
  .filter-sidebar-mobile {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 50;
    padding: 1rem;
    overflow-y: auto;
  }
  
  .filter-header-mobile {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1rem;
  }
}
```

## 📱 **RESPONSIVE DESIGN**

### **Breakpoint Strategy**
```css
/* Mobile First Approach */

/* Extra Small: 0px - 639px */
.room-container {
  padding: 0.5rem;
}

.room-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Small: 640px - 767px */
@media (min-width: 640px) {
  .room-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

/* Medium: 768px - 1023px */
@media (min-width: 768px) {
  .room-container {
    padding: 1rem;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  }
  
  .room-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Large: 1024px - 1279px */
@media (min-width: 1024px) {
  .room-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Extra Large: 1280px+ */
@media (min-width: 1280px) {
  .room-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## 🔒 **SEO & PERFORMANCE**

### **Page Optimization**
```javascript
// Room listing page meta tags
const roomsPageMeta = {
  title: 'Danh sách phòng - Homestay Management',
  description: 'Khám phá các phòng homestay đẹp với đầy đủ tiện nghi. Đặt phòng online với giá tốt nhất.',
  keywords: 'homestay, phòng nghỉ, đặt phòng, khách sạn, du lịch',
  ogImage: '/images/rooms-og.jpg'
};

// Room detail page meta tags (dynamic)
const generateRoomMeta = (room) => ({
  title: `${room.room_name} - ${room.type_name} | Homestay Management`,
  description: `${room.description || room.room_name} - Giá từ ${formatCurrency(room.price_per_night)}/đêm. Đặt ngay!`,
  keywords: `${room.room_name}, ${room.type_name}, ${room.amenities?.join(', ')}`,
  ogImage: room.images?.[0] || '/images/default-room.jpg'
});
```

### **Image Optimization**
```javascript
// Lazy loading with intersection observer
const LazyImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className}`} {...props}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
```

## 🧪 **TESTING SPECIFICATIONS**

### **Component Tests**
```javascript
// RoomCard component test
describe('RoomCard Component', () => {
  const mockRoom = {
    room_id: 1,
    room_name: 'Deluxe Sea View',
    type_name: 'Deluxe Room',
    price_per_night: 800000,
    images: ['room1.jpg'],
    amenities: ['WiFi', 'AC', 'TV'],
    status: 'available'
  };

  test('should render room information correctly', () => {
    render(<RoomCard room={mockRoom} />);
    
    expect(screen.getByText('Deluxe Sea View')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
    expect(screen.getByText(/800,000₫/)).toBeInTheDocument();
  });

  test('should display amenities', () => {
    render(<RoomCard room={mockRoom} />);
    
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('AC')).toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
  });

  test('should handle click events', () => {
    const mockOnSelect = jest.fn();
    render(<RoomCard room={mockRoom} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByRole('button', { name: /chọn phòng/i }));
    expect(mockOnSelect).toHaveBeenCalledWith(mockRoom);
  });
});

// Room search functionality test
describe('Room Search', () => {
  test('should filter rooms by price range', async () => {
    const mockSearchFn = jest.fn();
    render(<RoomFilter onSearch={mockSearchFn} />);
    
    // Set price range
    const minPriceInput = screen.getByLabelText(/giá tối thiểu/i);
    const maxPriceInput = screen.getByLabelText(/giá tối đa/i);
    
    fireEvent.change(minPriceInput, { target: { value: '500000' } });
    fireEvent.change(maxPriceInput, { target: { value: '1000000' } });
    
    fireEvent.click(screen.getByRole('button', { name: /tìm kiếm/i }));
    
    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith(
        expect.objectContaining({
          minPrice: 500000,
          maxPrice: 1000000
        })
      );
    });
  });
});
```

---

## 🎯 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core Components (Week 1)**
- [x] Backend APIs ready
- [ ] RoomCard component
- [ ] RoomGrid/List layouts
- [ ] Basic room service
- [ ] Room listing page

### **Phase 2: Search & Filter (Week 2)**
- [ ] Search form component
- [ ] Filter sidebar
- [ ] Date range picker
- [ ] Advanced filtering
- [ ] URL synchronization

### **Phase 3: Room Details (Week 3)**
- [ ] Room detail page
- [ ] Image gallery
- [ ] Availability checker
- [ ] Price calculator
- [ ] Booking integration

### **Phase 4: Optimization (Week 4)**
- [ ] Performance optimization
- [ ] SEO implementation
- [ ] Accessibility features
- [ ] Mobile optimization
- [ ] Testing coverage

**CỤM 2 ROOM MANAGEMENT GUIDE HOÀN THÀNH! 🏨**


