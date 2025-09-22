# 📅 CỤM 3: BOOKING SYSTEM - FRONTEND GUIDE

## 📋 **TỔNG QUAN**

Cụm 3 bao gồm toàn bộ hệ thống đặt phòng từ frontend: tạo booking mới, quản lý booking history, tính toán giá, hủy booking, và tích hợp với payment system.

## 🗂️ **CẤU TRÚC FILES**

```
frontend/src/
├── components/
│   ├── Booking/
│   │   ├── BookingForm.js           # Form đặt phòng chính
│   │   ├── BookingSummary.js        # Tóm tắt thông tin booking
│   │   ├── BookingCard.js           # Card hiển thị booking info
│   │   ├── BookingList.js           # Danh sách booking
│   │   ├── BookingStatus.js         # Hiển thị trạng thái booking
│   │   ├── BookingActions.js        # Các action (cancel, modify)
│   │   ├── GuestDetails.js          # Form thông tin khách
│   │   ├── SpecialRequests.js       # Form yêu cầu đặc biệt
│   │   ├── ServiceSelector.js       # Chọn dịch vụ thêm
│   │   └── BookingTimeline.js       # Timeline trạng thái booking
│   ├── Pricing/
│   │   ├── PriceBreakdown.js        # Chi tiết giá
│   │   ├── PriceCalculator.js       # Tính toán giá real-time
│   │   ├── DiscountApplier.js       # Áp dụng mã giảm giá
│   │   └── TotalSummary.js          # Tổng kết giá cuối
│   ├── Calendar/
│   │   ├── AvailabilityCalendar.js  # Calendar hiển thị tình trạng
│   │   ├── DateRangeSelector.js     # Chọn ngày check-in/out
│   │   └── BlockedDatesIndicator.js # Hiển thị ngày đã book
│   └── Confirmation/
│       ├── BookingConfirmation.js   # Trang xác nhận
│       ├── SuccessMessage.js        # Thông báo thành công
│       └── BookingReceipt.js        # Hóa đơn booking
├── pages/
│   ├── CreateBooking.js             # Trang tạo booking mới
│   ├── BookingHistory.js            # Trang lịch sử booking
│   ├── BookingDetail.js             # Trang chi tiết booking
│   ├── BookingConfirmation.js       # Trang xác nhận booking
│   └── BookingManagement.js         # Trang quản lý booking
├── hooks/
│   ├── useBooking.js                # Hook quản lý booking data
│   ├── useBookingForm.js            # Hook cho booking form
│   ├── usePriceCalculation.js       # Hook tính toán giá
│   ├── useBookingValidation.js      # Hook validation
│   └── useBookingStatus.js          # Hook theo dõi trạng thái
├── services/
│   └── bookingService.js            # Booking API calls
└── utils/
    ├── bookingHelpers.js            # Booking utility functions
    ├── dateValidation.js            # Date validation utilities
    └── priceCalculation.js          # Price calculation utilities
```

## 🔑 **API ENDPOINTS SUMMARY**

### **Booking Management APIs:**
```javascript
// Base URL: http://localhost:5000/api

const BOOKING_ENDPOINTS = {
  createBooking: 'POST /bookings',
  getBookings: 'GET /bookings',
  getBookingById: 'GET /bookings/{id}',
  cancelBooking: 'PUT /bookings/{id}/cancel',
  calculateCost: 'POST /bookings/calculate-cost'
};
```

## 📝 **COMPONENT SPECIFICATIONS**

### **1. Booking Form Components**

#### **BookingForm.js**
```javascript
// Props:
{
  room: {
    room_id: number,
    room_name: string,
    type_name: string,
    price_per_night: number,
    weekend_price: number,
    holiday_price: number,
    max_occupancy: number,
    amenities: string[],
    images: string[]
  },
  initialDates: { checkIn: Date, checkOut: Date },
  onSubmit: function,
  onCancel: function,
  loading: boolean,
  mode: 'create' | 'edit'
}

// Form Fields:
- Date range picker (check-in, check-out)
- Guest details (adults, children)
- Special requests (textarea)
- Additional services (multi-select)
- Contact information
- Payment method selection
- Terms and conditions acceptance

// Features:
- Real-time price calculation
- Date validation with availability checking
- Guest count validation against room capacity
- Service cost calculation
- Form persistence (localStorage)
- Progressive disclosure
- Mobile-optimized layout
```

#### **BookingSummary.js**
```javascript
// Props:
{
  booking: {
    room: object,
    dates: { checkIn: Date, checkOut: Date },
    guests: { adults: number, children: number },
    services: array,
    pricing: object,
    specialRequests: string
  },
  editable: boolean,
  onEdit: function,
  showActions: boolean,
  compact: boolean
}

// Features:
- Room information display
- Date range with night count
- Guest information
- Services list with prices
- Price breakdown
- Editable sections
- Confirmation checkboxes
- Terms display
```

#### **GuestDetails.js**
```javascript
// Props:
{
  maxGuests: number,
  onChange: function,
  value: { adults: number, children: number },
  validation: object,
  disabled: boolean
}

// Features:
- Adult/children counters
- Age-based pricing (if applicable)
- Guest names collection (optional)
- Special needs input
- Validation against room capacity
- Accessibility requirements
```

### **2. Booking Display Components**

#### **BookingCard.js**
```javascript
// Props:
{
  booking: {
    booking_id: number,
    booking_code: string,
    room_name: string,
    check_in_date: string,
    check_out_date: string,
    total_nights: number,
    num_adults: number,
    num_children: number,
    total_amount: number,
    booking_status: string,
    payment_status: string,
    created_at: string
  },
  layout: 'card' | 'list' | 'compact',
  showActions: boolean,
  onSelect: function,
  onCancel: function,
  onViewDetails: function
}

// Features:
- Status indicators with colors
- Room image thumbnail
- Key booking information
- Action buttons (view, cancel, modify)
- Payment status
- Quick actions menu
- Responsive layout
```

#### **BookingStatus.js**
```javascript
// Props:
{
  status: string,
  paymentStatus: string,
  size: 'small' | 'medium' | 'large',
  showLabel: boolean,
  showIcon: boolean
}

// Status Types:
- pending: 'Chờ xác nhận' (orange)
- confirmed: 'Đã xác nhận' (blue)
- checked_in: 'Đã nhận phòng' (green)
- checked_out: 'Đã trả phòng' (gray)
- cancelled: 'Đã hủy' (red)
- no_show: 'Không xuất hiện' (red)

// Features:
- Color-coded status indicators
- Icon representation
- Tooltip explanations
- Animation transitions
```

### **3. Pricing Components**

#### **PriceBreakdown.js**
```javascript
// Props:
{
  pricing: {
    baseAmount: number,
    serviceAmount: number,
    taxAmount: number,
    discountAmount: number,
    totalAmount: number,
    nightCount: number,
    breakdown: array
  },
  currency: string,
  detailed: boolean,
  editable: boolean,
  onEdit: function
}

// Features:
- Line-by-line price breakdown
- Night-by-night pricing (weekday/weekend/holiday)
- Service charges
- Tax calculations
- Discount applications
- Total summary
- Currency formatting
- Expandable details
```

#### **PriceCalculator.js**
```javascript
// Props:
{
  room: object,
  dates: { checkIn: Date, checkOut: Date },
  guests: { adults: number, children: number },
  services: array,
  promocode: string,
  onPriceUpdate: function,
  realTime: boolean
}

// Features:
- Real-time price calculation
- Dynamic pricing based on dates
- Service cost calculation
- Promocode validation and application
- Tax calculation
- Price caching for performance
- Error handling for calculation failures
```

## 🔧 **SERVICES & API CALLS**

### **bookingService.js**
```javascript
import api from './api';
import { getStorageItem, setStorageItem, formatDate } from '../utils';

export const bookingService = {
  // Create new booking
  createBooking: async (bookingData) => {
    const payload = {
      room_id: bookingData.room_id,
      check_in_date: formatDate(bookingData.checkInDate, 'YYYY-MM-DD'),
      check_out_date: formatDate(bookingData.checkOutDate, 'YYYY-MM-DD'),
      num_adults: bookingData.guests.adults,
      num_children: bookingData.guests.children || 0,
      special_requests: bookingData.specialRequests || '',
      additional_services: bookingData.services || []
    };

    const response = await api.post('/bookings', payload);
    
    // Store booking for confirmation page
    setStorageItem('latest_booking', {
      booking: response.data.data.booking,
      timestamp: Date.now()
    });

    return response.data.data.booking;
  },

  // Get customer bookings with filters
  getBookings: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params;

    const queryParams = {
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder
    };

    if (status !== 'all') {
      queryParams.status = status;
    }

    if (dateFrom) {
      queryParams.date_from = formatDate(dateFrom, 'YYYY-MM-DD');
    }

    if (dateTo) {
      queryParams.date_to = formatDate(dateTo, 'YYYY-MM-DD');
    }

    const response = await api.get('/bookings', { params: queryParams });
    return {
      bookings: response.data.data.bookings,
      pagination: response.data.data.pagination
    };
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data.data.booking;
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`, {
      cancellation_reason: reason
    });
    return response.data.data.booking;
  },

  // Calculate booking cost
  calculateBookingCost: async (costData) => {
    const payload = {
      room_id: costData.room_id,
      check_in_date: formatDate(costData.checkInDate, 'YYYY-MM-DD'),
      check_out_date: formatDate(costData.checkOutDate, 'YYYY-MM-DD'),
      num_adults: costData.guests?.adults || 1,
      num_children: costData.guests?.children || 0,
      additional_services: costData.services || [],
      promo_code: costData.promocode || ''
    };

    const response = await api.post('/bookings/calculate-cost', payload);
    return response.data.data.pricing;
  },

  // Get booking statistics
  getBookingStats: async (period = '30d') => {
    const response = await api.get(`/bookings/stats?period=${period}`);
    return response.data.data.stats;
  },

  // Modify booking (if supported)
  modifyBooking: async (bookingId, modifications) => {
    const response = await api.put(`/bookings/${bookingId}`, modifications);
    return response.data.data.booking;
  },

  // Get latest booking from storage
  getLatestBooking: () => {
    const stored = getStorageItem('latest_booking');
    if (stored && Date.now() - stored.timestamp < 3600000) { // 1 hour
      return stored.booking;
    }
    return null;
  },

  // Clear latest booking from storage
  clearLatestBooking: () => {
    localStorage.removeItem('homestay_latest_booking');
  }
};
```

## 🎯 **CUSTOM HOOKS**

### **useBooking.js**
```javascript
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { bookingService } from '../services/bookingService';
import { toast } from 'react-toastify';

export const useBookings = (params = {}) => {
  return useQuery(
    ['bookings', params],
    () => bookingService.getBookings(params),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2
    }
  );
};

export const useBooking = (bookingId) => {
  return useQuery(
    ['booking', bookingId],
    () => bookingService.getBookingById(bookingId),
    {
      enabled: !!bookingId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2
    }
  );
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation(
    bookingService.createBooking,
    {
      onSuccess: (booking) => {
        toast.success('Đặt phòng thành công!');
        
        // Invalidate and refetch bookings
        queryClient.invalidateQueries('bookings');
        
        // Update room availability cache
        queryClient.invalidateQueries(['room-availability', booking.room_id]);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Đặt phòng thất bại';
        toast.error(message);
      }
    }
  );
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ bookingId, reason }) => bookingService.cancelBooking(bookingId, reason),
    {
      onSuccess: (booking) => {
        toast.success('Hủy đặt phòng thành công!');
        
        // Update specific booking in cache
        queryClient.setQueryData(['booking', booking.booking_id], booking);
        
        // Invalidate bookings list
        queryClient.invalidateQueries('bookings');
        
        // Update room availability
        queryClient.invalidateQueries(['room-availability', booking.room_id]);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Hủy đặt phòng thất bại';
        toast.error(message);
      }
    }
  );
};

export const usePriceCalculation = () => {
  return useMutation(
    bookingService.calculateBookingCost,
    {
      retry: 1,
      onError: (error) => {
        console.error('Price calculation error:', error);
      }
    }
  );
};
```

### **useBookingForm.js**
```javascript
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { addDays, differenceInDays, isBefore, isAfter } from 'date-fns';
import { debounce } from '../utils';

export const useBookingForm = (room, initialData = {}) => {
  const [step, setStep] = useState(1);
  const [pricing, setPricing] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm({
    defaultValues: {
      checkInDate: initialData.checkInDate || addDays(new Date(), 1),
      checkOutDate: initialData.checkOutDate || addDays(new Date(), 2),
      guests: {
        adults: initialData.guests?.adults || 1,
        children: initialData.guests?.children || 0
      },
      specialRequests: initialData.specialRequests || '',
      services: initialData.services || [],
      contactInfo: {
        fullName: initialData.contactInfo?.fullName || '',
        email: initialData.contactInfo?.email || '',
        phone: initialData.contactInfo?.phone || ''
      },
      termsAccepted: false
    }
  });

  const { watch, setValue, getValues, trigger } = form;
  const watchedValues = watch();

  // Validation rules
  const validationRules = useMemo(() => ({
    checkInDate: {
      required: 'Ngày check-in là bắt buộc',
      validate: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isBefore(value, today)) {
          return 'Ngày check-in không thể trong quá khứ';
        }
        return true;
      }
    },
    checkOutDate: {
      required: 'Ngày check-out là bắt buộc',
      validate: (value) => {
        const checkIn = getValues('checkInDate');
        if (!isAfter(value, checkIn)) {
          return 'Ngày check-out phải sau ngày check-in';
        }
        
        const maxStay = addDays(checkIn, 30); // Max 30 days
        if (isAfter(value, maxStay)) {
          return 'Thời gian lưu trú tối đa 30 ngày';
        }
        
        return true;
      }
    },
    'guests.adults': {
      required: 'Số người lớn là bắt buộc',
      min: { value: 1, message: 'Phải có ít nhất 1 người lớn' },
      max: { 
        value: room?.max_occupancy || 4, 
        message: `Phòng chỉ chứa tối đa ${room?.max_occupancy || 4} khách` 
      }
    },
    'guests.children': {
      min: { value: 0, message: 'Số trẻ em không thể âm' },
      validate: (value) => {
        const adults = getValues('guests.adults');
        const total = adults + value;
        if (total > (room?.max_occupancy || 4)) {
          return `Tổng số khách không được quá ${room?.max_occupancy || 4}`;
        }
        return true;
      }
    },
    termsAccepted: {
      required: 'Bạn phải đồng ý với điều khoản và điều kiện'
    }
  }), [room, getValues]);

  // Calculate nights
  const nightCount = useMemo(() => {
    const { checkInDate, checkOutDate } = watchedValues;
    if (checkInDate && checkOutDate) {
      return differenceInDays(checkOutDate, checkInDate);
    }
    return 0;
  }, [watchedValues.checkInDate, watchedValues.checkOutDate]);

  // Calculate total guests
  const totalGuests = useMemo(() => {
    return (watchedValues.guests?.adults || 0) + (watchedValues.guests?.children || 0);
  }, [watchedValues.guests]);

  // Debounced price calculation
  const calculatePrice = useCallback(
    debounce(async (formData) => {
      if (!room || !formData.checkInDate || !formData.checkOutDate) return;

      setIsCalculating(true);
      try {
        const pricing = await bookingService.calculateBookingCost({
          room_id: room.room_id,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          guests: formData.guests,
          services: formData.services
        });
        setPricing(pricing);
      } catch (error) {
        console.error('Price calculation failed:', error);
        setPricing(null);
      } finally {
        setIsCalculating(false);
      }
    }, 500),
    [room]
  );

  // Trigger price calculation when relevant data changes
  useEffect(() => {
    const { checkInDate, checkOutDate, guests, services } = watchedValues;
    if (checkInDate && checkOutDate && guests) {
      calculatePrice({ checkInDate, checkOutDate, guests, services });
    }
  }, [
    watchedValues.checkInDate,
    watchedValues.checkOutDate,
    watchedValues.guests,
    watchedValues.services,
    calculatePrice
  ]);

  // Form step navigation
  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= 3) {
      setStep(stepNumber);
    }
  };

  // Helper functions
  const isStepValid = useCallback(async (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return await trigger(['checkInDate', 'checkOutDate', 'guests']);
      case 2:
        return await trigger(['specialRequests', 'services']);
      case 3:
        return await trigger(['contactInfo', 'termsAccepted']);
      default:
        return false;
    }
  }, [trigger]);

  const getFormData = () => {
    return {
      ...getValues(),
      nightCount,
      totalGuests,
      pricing
    };
  };

  const resetForm = () => {
    form.reset();
    setStep(1);
    setPricing(null);
  };

  return {
    // Form methods
    ...form,
    
    // Form state
    step,
    pricing,
    isCalculating,
    nightCount,
    totalGuests,
    validationRules,
    
    // Form data
    formData: watchedValues,
    
    // Step navigation
    nextStep,
    prevStep,
    goToStep,
    isStepValid,
    
    // Utility methods
    getFormData,
    resetForm,
    calculatePrice: () => calculatePrice(watchedValues)
  };
};
```

## 📋 **VALIDATION & UTILITIES**

### **bookingHelpers.js**
```javascript
import { formatCurrency, formatDate, calculateDaysBetween } from './index';
import { isWeekend, isHoliday, addDays, format } from 'date-fns';

export const bookingHelpers = {
  // Generate booking summary
  generateBookingSummary: (booking) => {
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const nights = calculateDaysBetween(checkIn, checkOut);

    return {
      bookingCode: booking.booking_code,
      roomInfo: `${booking.room_name} - ${booking.type_name}`,
      dateRange: `${formatDate(checkIn)} - ${formatDate(checkOut)}`,
      duration: `${nights} đêm`,
      guests: `${booking.num_adults} người lớn${booking.num_children ? `, ${booking.num_children} trẻ em` : ''}`,
      totalAmount: formatCurrency(booking.total_amount),
      status: bookingHelpers.getStatusDisplay(booking.booking_status),
      paymentStatus: bookingHelpers.getPaymentStatusDisplay(booking.payment_status)
    };
  },

  // Get booking status display
  getStatusDisplay: (status) => {
    const statusMap = {
      pending: { label: 'Chờ xác nhận', color: 'orange', icon: '⏳' },
      confirmed: { label: 'Đã xác nhận', color: 'blue', icon: '✅' },
      checked_in: { label: 'Đã nhận phòng', color: 'green', icon: '🏠' },
      checked_out: { label: 'Đã trả phòng', color: 'gray', icon: '✈️' },
      cancelled: { label: 'Đã hủy', color: 'red', icon: '❌' },
      no_show: { label: 'Không xuất hiện', color: 'red', icon: '👻' }
    };

    return statusMap[status] || statusMap.pending;
  },

  // Get payment status display
  getPaymentStatusDisplay: (status) => {
    const statusMap = {
      pending: { label: 'Chờ thanh toán', color: 'orange', icon: '💳' },
      partial: { label: 'Thanh toán một phần', color: 'yellow', icon: '💰' },
      paid: { label: 'Đã thanh toán', color: 'green', icon: '✅' },
      refunded: { label: 'Đã hoàn tiền', color: 'blue', icon: '🔄' },
      failed: { label: 'Thanh toán thất bại', color: 'red', icon: '❌' }
    };

    return statusMap[status] || statusMap.pending;
  },

  // Check if booking can be cancelled
  canCancelBooking: (booking) => {
    const now = new Date();
    const checkIn = new Date(booking.check_in_date);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

    // Can cancel if:
    // 1. Status is pending or confirmed
    // 2. Check-in is more than 24 hours away
    // 3. Payment is not completed (for pending bookings)
    
    const validStatuses = ['pending', 'confirmed'];
    const hasTime = hoursUntilCheckIn > 24;
    const notCheckedIn = !['checked_in', 'checked_out'].includes(booking.booking_status);

    return validStatuses.includes(booking.booking_status) && hasTime && notCheckedIn;
  },

  // Check if booking can be modified
  canModifyBooking: (booking) => {
    const now = new Date();
    const checkIn = new Date(booking.check_in_date);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

    // Can modify if:
    // 1. Status is pending or confirmed
    // 2. Check-in is more than 48 hours away
    
    const validStatuses = ['pending', 'confirmed'];
    const hasTime = hoursUntilCheckIn > 48;

    return validStatuses.includes(booking.booking_status) && hasTime;
  },

  // Calculate cancellation fee
  calculateCancellationFee: (booking) => {
    const now = new Date();
    const checkIn = new Date(booking.check_in_date);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

    let feePercentage = 0;

    if (hoursUntilCheckIn <= 24) {
      feePercentage = 100; // 100% if cancelled within 24 hours
    } else if (hoursUntilCheckIn <= 48) {
      feePercentage = 50; // 50% if cancelled within 48 hours
    } else if (hoursUntilCheckIn <= 72) {
      feePercentage = 25; // 25% if cancelled within 72 hours
    } else {
      feePercentage = 0; // Free cancellation if more than 72 hours
    }

    const feeAmount = (booking.total_amount * feePercentage) / 100;
    const refundAmount = booking.total_amount - feeAmount;

    return {
      feePercentage,
      feeAmount,
      refundAmount,
      formattedFee: formatCurrency(feeAmount),
      formattedRefund: formatCurrency(refundAmount)
    };
  },

  // Generate booking timeline
  generateBookingTimeline: (booking) => {
    const timeline = [];
    
    // Created
    timeline.push({
      status: 'created',
      label: 'Booking được tạo',
      date: booking.created_at,
      completed: true,
      icon: '📝'
    });

    // Confirmed
    if (booking.confirmed_at) {
      timeline.push({
        status: 'confirmed',
        label: 'Booking được xác nhận',
        date: booking.confirmed_at,
        completed: true,
        icon: '✅'
      });
    }

    // Payment
    if (booking.payment_status === 'paid') {
      timeline.push({
        status: 'paid',
        label: 'Thanh toán hoàn tất',
        date: booking.payment_date,
        completed: true,
        icon: '💳'
      });
    }

    // Check-in
    const checkInDate = new Date(booking.check_in_date);
    timeline.push({
      status: 'check_in',
      label: 'Check-in',
      date: booking.checked_in_at || checkInDate,
      completed: booking.booking_status === 'checked_in' || booking.booking_status === 'checked_out',
      upcoming: new Date() < checkInDate && booking.booking_status === 'confirmed',
      icon: '🏠'
    });

    // Check-out
    const checkOutDate = new Date(booking.check_out_date);
    timeline.push({
      status: 'check_out',
      label: 'Check-out',
      date: booking.checked_out_at || checkOutDate,
      completed: booking.booking_status === 'checked_out',
      upcoming: new Date() < checkOutDate && booking.booking_status === 'checked_in',
      icon: '✈️'
    });

    // Cancelled (if applicable)
    if (booking.booking_status === 'cancelled') {
      timeline.push({
        status: 'cancelled',
        label: 'Booking bị hủy',
        date: booking.cancelled_at,
        completed: true,
        cancelled: true,
        icon: '❌'
      });
    }

    return timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  // Format booking for email/receipt
  formatBookingForReceipt: (booking) => {
    return {
      bookingCode: booking.booking_code,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      roomDetails: {
        name: booking.room_name,
        type: booking.type_name,
        amenities: booking.amenities
      },
      stayDetails: {
        checkIn: formatDate(booking.check_in_date, 'DD/MM/YYYY'),
        checkOut: formatDate(booking.check_out_date, 'DD/MM/YYYY'),
        nights: booking.total_nights,
        guests: {
          adults: booking.num_adults,
          children: booking.num_children
        }
      },
      pricing: {
        baseAmount: formatCurrency(booking.base_amount),
        serviceAmount: formatCurrency(booking.service_amount),
        taxAmount: formatCurrency(booking.tax_amount),
        totalAmount: formatCurrency(booking.total_amount)
      },
      specialRequests: booking.special_requests,
      bookingDate: formatDate(booking.created_at, 'DD/MM/YYYY HH:mm'),
      status: bookingHelpers.getStatusDisplay(booking.booking_status).label
    };
  }
};
```

## 🎨 **STYLING GUIDELINES**

### **Booking Form Styles**
```css
/* Booking Form Container */
.booking-form {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.booking-form-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.booking-form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.booking-form-subtitle {
  opacity: 0.9;
  font-size: 0.875rem;
}

/* Step Indicator */
.step-indicator {
  display: flex;
  justify-content: center;
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.step {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  margin: 0 0.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.step.active {
  background: #3b82f6;
  color: white;
}

.step.completed {
  background: #10b981;
  color: white;
}

.step:not(.active):not(.completed) {
  background: #e2e8f0;
  color: #64748b;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.5rem;
  background: rgba(255,255,255,0.2);
}

.step.active .step-number,
.step.completed .step-number {
  background: rgba(255,255,255,0.3);
}

/* Form Content */
.booking-form-content {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row-full {
  grid-column: 1 / -1;
}

/* Date Picker Styles */
.date-picker-container {
  position: relative;
}

.date-picker-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.date-picker-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-picker-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

/* Guest Selector */
.guest-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
}

.guest-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.guest-counter-label {
  font-weight: 500;
  color: #374151;
  min-width: 80px;
}

.guest-counter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.guest-counter-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.guest-counter-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.guest-counter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.guest-counter-value {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #1f2937;
}

/* Price Summary */
.price-summary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.price-summary-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.price-line:last-child {
  border-bottom: none;
  font-weight: 600;
  font-size: 1.125rem;
  color: #059669;
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid #059669;
}

.price-label {
  color: #6b7280;
}

.price-value {
  font-weight: 500;
  color: #1f2937;
}

/* Action Buttons */
.form-actions {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.btn-back {
  background: #6b7280;
  color: white;
}

.btn-next {
  background: #3b82f6;
  color: white;
}

.btn-submit {
  background: #059669;
  color: white;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .booking-form {
    margin: 0;
    border-radius: 0;
  }
  
  .booking-form-header {
    padding: 1.5rem 1rem;
  }
  
  .booking-form-content {
    padding: 1.5rem 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .step-indicator {
    padding: 1rem;
  }
  
  .step {
    padding: 0.5rem 1rem;
    margin: 0 0.25rem;
  }
  
  .step-text {
    display: none;
  }
  
  .form-actions {
    padding: 1rem;
  }
}
```

### **Booking Card Styles**
```css
/* Booking Card */
.booking-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.booking-card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.booking-code {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.booking-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.booking-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
}

.booking-status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.status-checked-in {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.booking-card-body {
  padding: 1.5rem;
}

.booking-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.booking-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.booking-detail-icon {
  color: #6b7280;
  font-size: 1.125rem;
}

.booking-detail-text {
  color: #374151;
  font-size: 0.875rem;
}

.booking-detail-value {
  font-weight: 600;
  color: #1f2937;
}

.booking-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.booking-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
}

.booking-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-view {
  background: #3b82f6;
  color: white;
}

.btn-cancel {
  background: white;
  color: #dc2626;
  border-color: #dc2626;
}

.btn-action:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .booking-details {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .booking-card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .booking-actions {
    justify-content: stretch;
  }
  
  .btn-action {
    flex: 1;
    text-align: center;
  }
}
```

## 📱 **RESPONSIVE DESIGN**

### **Mobile-First Approach**
```css
/* Mobile (default) */
.booking-container {
  padding: 1rem;
}

.booking-form {
  margin: 0;
  border-radius: 8px;
}

/* Tablet */
@media (min-width: 768px) {
  .booking-container {
    padding: 2rem;
  }
  
  .booking-form {
    margin: 1rem auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .booking-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .booking-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
}
```

## 🧪 **TESTING SPECIFICATIONS**

### **Component Tests**
```javascript
// BookingForm component test
describe('BookingForm Component', () => {
  const mockRoom = {
    room_id: 1,
    room_name: 'Deluxe Sea View',
    max_occupancy: 3,
    price_per_night: 800000
  };

  test('should render booking form with room information', () => {
    render(<BookingForm room={mockRoom} />);
    
    expect(screen.getByText('Deluxe Sea View')).toBeInTheDocument();
    expect(screen.getByLabelText(/ngày check-in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ngày check-out/i)).toBeInTheDocument();
  });

  test('should validate date range', async () => {
    render(<BookingForm room={mockRoom} />);
    
    const checkInInput = screen.getByLabelText(/ngày check-in/i);
    const checkOutInput = screen.getByLabelText(/ngày check-out/i);
    
    // Set invalid dates (check-out before check-in)
    fireEvent.change(checkInInput, { target: { value: '2025-01-20' } });
    fireEvent.change(checkOutInput, { target: { value: '2025-01-19' } });
    
    fireEvent.click(screen.getByRole('button', { name: /tiếp tục/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/ngày check-out phải sau ngày check-in/i)).toBeInTheDocument();
    });
  });

  test('should calculate price when dates change', async () => {
    const mockCalculatePrice = jest.fn();
    render(<BookingForm room={mockRoom} onPriceCalculate={mockCalculatePrice} />);
    
    const checkInInput = screen.getByLabelText(/ngày check-in/i);
    const checkOutInput = screen.getByLabelText(/ngày check-out/i);
    
    fireEvent.change(checkInInput, { target: { value: '2025-01-20' } });
    fireEvent.change(checkOutInput, { target: { value: '2025-01-23' } });
    
    await waitFor(() => {
      expect(mockCalculatePrice).toHaveBeenCalled();
    });
  });
});

// Booking status tests
describe('Booking Status', () => {
  test('should display correct status badge', () => {
    const booking = {
      booking_status: 'confirmed',
      payment_status: 'paid'
    };
    
    render(<BookingStatus status={booking.booking_status} />);
    
    expect(screen.getByText('Đã xác nhận')).toBeInTheDocument();
    expect(screen.getByText('Đã xác nhận')).toHaveClass('status-confirmed');
  });
});
```

---

## 🎯 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core Booking Components (Week 1)**
- [x] Backend APIs ready
- [ ] BookingForm component với multi-step
- [ ] PriceCalculator integration
- [ ] Date validation và availability
- [ ] Basic booking service

### **Phase 2: Booking Management (Week 2)**
- [ ] BookingCard và BookingList
- [ ] Booking history page
- [ ] Booking detail page
- [ ] Cancel booking functionality
- [ ] Status management

### **Phase 3: Advanced Features (Week 3)**
- [ ] Service selection
- [ ] Promocode integration
- [ ] Booking modification
- [ ] Confirmation workflow
- [ ] Receipt generation

### **Phase 4: Polish & Integration (Week 4)**
- [ ] Payment integration
- [ ] Email notifications
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Testing coverage

**CỤM 3 BOOKING SYSTEM GUIDE HOÀN THÀNH! 📅**


