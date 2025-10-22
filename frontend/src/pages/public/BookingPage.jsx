import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking } from '@/hooks/useBookings';
import { useRoomBookedDates } from '@/hooks/useRooms';
import { apiService } from '@/services/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Badge,
  Calendar,
} from '@/components';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

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

// Helper function để format ngày tránh lỗi timezone
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * BookingPage - Create new booking
 */
const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Booking Details, 2: Payment
  const [selectedDates, setSelectedDates] = useState({ startDate: null, endDate: null });
  const [datesConfirmed, setDatesConfirmed] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(null); // 'checkIn' | 'checkOut' | null
  // Bỏ showCalendar state, chỉ dùng calendar
  
  const roomId = searchParams.get('roomId');

  // Fetch booked dates for the room
  const { data: bookedDatesData, loading: bookedDatesLoading } = useRoomBookedDates(roomId, {
    startDate: formatDateLocal(new Date()),
    endDate: formatDateLocal(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)), // Next 3 months
  });

  // Create booking mutation
  const { mutate: createBooking, loading: bookingLoading } = useCreateBooking({
    showSuccessToast: false, // Tắt auto toast để tránh duplicate
    onSuccess: (booking) => {

      // Extract booking ID from response - try multiple paths
      const bookingId = booking?.data?.id || booking?.id || booking?.booking?.id || booking?.data?.booking?.id;

      setCreatedBookingId(bookingId);
      
      if (!bookingCreated) {
        toast.success('Đặt phòng thành công!');
        setBookingCreated(true);
      }
      // Move to payment step
      setStep(2);
    },
    onError: (error) => {
      console.error('Booking creation failed:', error);
      console.error('Error response:', error.response?.data);
      
      // Show specific validation errors if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.message || err.msg).join(', ');
        toast.error(`Xác thực thất bại: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || error.message || 'Không thể đặt phòng');
      }
    },
  });

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      checkIn: '',
      checkOut: '',
      guests: 1,
      specialRequests: '',
    },
  });

  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');
  const watchGuests = watch('guests');

  // Set default dates on component mount (only if not already set)
  useEffect(() => {
    if (!watchCheckIn && !watchCheckOut) {
      const today = new Date();
      let tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find next available date
      while (bookedDatesData?.booked_dates?.includes(formatDateLocal(tomorrow))) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      
      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Check if next day is also available
      while (bookedDatesData?.booked_dates?.includes(formatDateLocal(nextDay))) {
        nextDay.setDate(nextDay.getDate() + 1);
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      
      setValue('checkIn', formatDateLocal(tomorrow));
      setValue('checkOut', formatDateLocal(nextDay));
    }
  }, [setValue, watchCheckIn, watchCheckOut, bookedDatesData]);

  // Handle date selection from date picker
  const handleDateSelect = (date, type) => {

    // Check if date is booked
    if (bookedDatesData?.booked_dates?.includes(date)) {
      toast.error('Ngày này đã có người đặt, vui lòng chọn ngày khác');
      return;
    }

    if (type === 'checkIn') {
      setSelectedDates(prev => ({ ...prev, startDate: date }));
    } else if (type === 'checkOut') {
      setSelectedDates(prev => ({ ...prev, endDate: date }));
    }
    
    // Close date picker
    setShowDatePicker(null);
    
    // Reset confirmation when dates change
    setDatesConfirmed(false);
  };

  // Confirm selected dates
  const handleConfirmDates = () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      toast.error('Vui lòng chọn đầy đủ ngày nhận và trả phòng');
      return;
    }

    // Validate dates
    const startDate = new Date(selectedDates.startDate);
    const endDate = new Date(selectedDates.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error('Ngày nhận phòng không thể là ngày quá khứ');
      return;
    }

    if (startDate >= endDate) {
      toast.error('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    // Set form values
    setValue('checkIn', selectedDates.startDate);
    setValue('checkOut', selectedDates.endDate);
    setDatesConfirmed(true);
    
    toast.success('Đã xác nhận ngày nhận và trả phòng!');
  };

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {

        toast.error('Chưa chọn phòng');
        navigate('/rooms');
        return;
      }

      setLoading(true);
      try {
        const response = await apiService.rooms.getById(roomId);

        // API returns { success: true, data: { room: {...} } }
        const roomData = response.data.data;

        // Extract the actual room object
        const actualRoom = roomData.room;

        // Kiểm tra trạng thái phòng - nếu không available thì chặn
        if (actualRoom.status !== 'available') {
          toast.error('Phòng này hiện không có sẵn để đặt');
          navigate('/rooms');
          return;
        }

        setRoom(actualRoom);
      } catch (error) {
        console.error('❌ Failed to fetch room:', error);
        toast.error('Không thể tải thông tin phòng');
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, navigate]);

  // Check if user is logged in
  useEffect(() => {
    if (user === null) { // Only redirect if explicitly null (not loading)
      toast.error('Vui lòng đăng nhập để đặt phòng');
      navigate('/login');
    }
  }, [user, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateNights = () => {
    if (!watchCheckIn || !watchCheckOut) return 0;
    const checkIn = new Date(watchCheckIn);
    const checkOut = new Date(watchCheckOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!room) return 0;
    const nights = calculateNights();
    return (room.price_per_night || 0) * nights;
  };

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt phòng');
      navigate('/login');
      return;
    }

    if (!room || !room.id) {
      toast.error('Thông tin phòng không hợp lệ');
      return;
    }

    if (!datesConfirmed) {
      toast.error('Vui lòng chốt ngày nhận và trả phòng trước khi đặt phòng');
      return;
    }

    const nights = calculateNights();
    if (nights <= 0) {
      toast.error('Vui lòng chọn ngày nhận và trả phòng hợp lệ');
      return;
    }

    // Validate dates are in future
    const checkInDate = new Date(data.checkIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      toast.error('Ngày nhận phòng không thể là ngày quá khứ');
      return;
    }

    // Check room availability before creating booking
    try {
      const roomId = parseInt(room.id);
      if (isNaN(roomId)) {
        toast.error('ID phòng không hợp lệ');
        return;
      }

      const availabilityData = {
        room_id: parseInt(roomId),
        check_in_date: data.checkIn,
        check_out_date: data.checkOut,
      };

      const availabilityResponse = await apiService.bookings.checkAvailability(availabilityData);

      // Try different response structures
      let availabilityResult = availabilityResponse.data.data;
      
      // If data.data doesn't exist, try direct data
      if (!availabilityResult || availabilityResult.available === undefined) {
        availabilityResult = availabilityResponse.data;
      }

      // Check if request was successful but room not available (message indicates unavailable)
      const isUnavailable = availabilityResponse.data.message?.includes('not available') || 
                           availabilityResult.available === false;

      if (isUnavailable) {
        // Backend returns conflictingBookings, check multiple locations
        // Since availabilityResult is the full response, check data property
        const dataObj = availabilityResult.data || availabilityResponse.data.data;
        const conflictingBookings = 
          dataObj?.conflicting_bookings || 
          dataObj?.conflictingBookings ||
          availabilityResult.conflicting_bookings ||
          availabilityResult.conflicting_bookings;
          
        const conflictDates = conflictingBookings?.map(booking => 
          `${new Date(booking.check_in_date).toLocaleDateString('vi-VN')} - ${new Date(booking.check_out_date).toLocaleDateString('vi-VN')}`
        ).join(', ');

        toast.error(`Phòng không khả dụng trong khoảng thời gian này. Các đặt phòng xung đột: ${conflictDates || 'Không xác định'}`);
        return;
      }

      // If available, proceed with booking
    const bookingData = {
      room_id: parseInt(room.id),
      check_in_date: data.checkIn, // Already in YYYY-MM-DD format from date input
      check_out_date: data.checkOut, // Already in YYYY-MM-DD format from date input
      guests_count: parseInt(data.guests),
      special_requests: data.specialRequests || '',
    };

    createBooking(bookingData);
    } catch (error) {
      console.error('Availability check failed:', error);
      toast.error('Không thể kiểm tra tình trạng phòng. Vui lòng thử lại.');
    }
  };

  const handlePayment = async (method, paymentType = 'captureWallet') => {
    // Prevent multiple clicks
    if (paymentProcessing) return;
    
    setPaymentProcessing(true);

    if (method === 'PayLater') {
      // Xử lý thanh toán sau
      try {
        if (!createdBookingId) {
          toast.error('Vui lòng tạo đặt phòng trước');
          setPaymentProcessing(false);
          return;
        }

        // Tạo payment với trạng thái "pay_later"
        const paymentData = {
          booking_id: createdBookingId,
          amount: calculateTotal() * 1.1, // Bao gồm thuế
          payment_method: 'pay_later',
          payment_status: 'pending',
          notes: 'Thanh toán khi nhận phòng - Tự động hủy sau 5 phút'
        };

        const response = await apiService.payments.create(paymentData);
        
        if (response.data.success) {
          toast.success('Đặt phòng thành công! Vui lòng thanh toán trong 5 phút để giữ phòng.');
          
          // Delay navigation
          setTimeout(() => {
            navigate('/customer/bookings');
          }, 1500);
        } else {
          toast.error('Không thể tạo thanh toán');
          setPaymentProcessing(false);
        }
      } catch (error) {
        console.error('Pay later error:', error);
        
        // Handle validation errors
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(err => {
            const message = err.msg || err.message || 'Lỗi validation';
            toast.error(message);
          });
        } else {
          toast.error(error.response?.data?.message || error.message || 'Lỗi khi tạo thanh toán');
        }
        setPaymentProcessing(false);
      }
    } else if (method === 'MoMo') {
      try {
        // Get the created booking ID from the last booking

        if (!createdBookingId) {
          toast.error('Vui lòng tạo đặt phòng trước khi thanh toán');
          console.error('❌ No booking ID found. Please create booking first.');
          setPaymentProcessing(false);
          return;
        }

        const totalWithVAT = calculateTotal() * 1.1; // Bao gồm VAT 10%
        
        const paymentData = {
          bookingId: createdBookingId,
          amount: totalWithVAT,
          orderInfo: `Thanh toán đặt phòng #${createdBookingId} - ${room.name || `Phòng ${room.room_number}`}`,
          requestType: paymentType // 'captureWallet' for QR/App, 'payWithATM' for ATM/Card
        };

        const response = await apiService.payments.createMomoPayment(paymentData);
        
        if (response.data.success && response.data.data.payUrl) {
          const paymentMethod = paymentType === 'payWithATM' ? 'thẻ ATM/Visa/Master' : 'MoMo';
          toast.success(`Đang chuyển đến trang thanh toán ${paymentMethod}...`);
          // Redirect to MoMo payment page
          window.location.href = response.data.data.payUrl;
        } else {
          toast.error('Không thể tạo link thanh toán MoMo');
          setPaymentProcessing(false);
        }
      } catch (error) {
        console.error('MoMo payment error:', error);
        
        // Handle validation errors
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(err => {
            const message = err.msg || err.message || 'Lỗi validation';
            toast.error(message);
          });
        } else {
          toast.error(error.response?.data?.message || error.message || 'Lỗi khi tạo thanh toán MoMo');
        }
        setPaymentProcessing(false);
      }
    } else {
    toast.success(`Thanh toán bằng ${method} thành công!`);
    
    // Delay navigation to prevent duplicate toasts
    setTimeout(() => {
      navigate('/customer/bookings');
    }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        {/* Loading Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-48 bg-gray-200 rounded-lg"></div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="space-y-2">
                  <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading Progress Steps */}
          <div className="mb-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="animate-pulse flex items-center justify-between max-w-lg mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-2xl"></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-24 bg-blue-200 rounded-lg"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
                <div className="flex-1 mx-8">
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-3 w-28 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Loading */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="animate-pulse space-y-8">
                  {/* Header Loading */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl"></div>
                    <div className="h-8 w-48 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl"></div>
                  </div>

                  {/* Room Info Loading */}
                  <div className="p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                      <div className="flex-1 space-y-4">
                        <div className="h-8 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                        <div className="h-4 w-full bg-gray-200 rounded-lg"></div>
                        <div className="flex gap-4">
                          <div className="h-8 w-24 bg-blue-200 rounded-full"></div>
                          <div className="h-8 w-20 bg-green-200 rounded-full"></div>
                          <div className="h-8 w-28 bg-orange-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Loading */}
                  <div className="space-y-6">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="p-6 bg-gradient-to-r from-blue-50/30 to-purple-50/30 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl"></div>
                          <div className="h-6 w-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="h-14 bg-white/60 rounded-2xl"></div>
                          <div className="h-14 bg-white/60 rounded-2xl"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button Loading */}
                  <div className="pt-8">
                    <div className="h-16 bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 rounded-3xl"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Loading */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
                  <div className="animate-pulse flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-xl mr-3"></div>
                    <div className="h-6 w-32 bg-white/20 rounded-xl"></div>
                  </div>
                </div>
                <div className="p-8 animate-pulse space-y-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-200 rounded-xl"></div>
                        <div className="h-5 w-24 bg-blue-200 rounded-xl"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded-lg"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loading Animation with Text */}
          <div className="fixed bottom-8 right-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animate-reverse delay-150"></div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                <div className="animate-pulse">Đang tải thông tin phòng...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!room || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                onClick={() => navigate('/rooms')}
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Quay lại danh sách phòng
              </Button>
              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Đặt Phòng
                </h1>
                <p className="text-sm text-gray-600 font-medium">Hoàn tất thông tin để đặt phòng</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 self-end sm:self-auto">
              <div className="px-4 py-2 bg-blue-100 rounded-full border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">Bước {step}/2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            
            <div className="relative flex items-center justify-between max-w-lg mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center group">
                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 ${
                  step >= 1 
                    ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/30' 
                    : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 shadow-lg'
                }`}>
                  {step > 1 ? (
                    <CheckCircleIcon className="h-8 w-8 animate-bounce" />
                  ) : (
                    <span className="text-xl font-bold">1</span>
                  )}
                  {step >= 1 && (
                    <>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse opacity-20"></div>
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 opacity-20 blur-lg"></div>
                    </>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <div className={`text-sm font-bold transition-colors duration-300 ${
                    step >= 1 ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    Thông tin đặt phòng
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">Điền thông tin chi tiết 📝</div>
                </div>
              </div>

              {/* Enhanced Progress Line */}
              <div className="flex-1 mx-8">
                <div className="relative">
                  <div className="h-2 bg-gray-200 rounded-full shadow-inner"></div>
                  <div className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ease-out ${
                    step >= 2 ? 'w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 shadow-lg shadow-blue-500/30' : 'w-0'
                  }`}>
                    {step >= 2 && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg animate-pulse border-2 border-indigo-600"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center group">
                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 ${
                  step >= 2 
                    ? 'bg-gradient-to-br from-green-500 via-emerald-600 to-green-600 text-white shadow-2xl shadow-green-500/30' 
                    : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 shadow-lg'
                }`}>
                  <span className="text-xl font-bold">2</span>
                  {step >= 2 && (
                    <>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse opacity-20"></div>
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 opacity-20 blur-lg"></div>
                    </>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <div className={`text-sm font-bold transition-colors duration-300 ${
                    step >= 2 ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    Thanh toán
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">Chọn phương thức</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Room Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Thông Tin Đặt Phòng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Room Info */}
                  <div className="bg-gray-50 p-6 rounded-lg border mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={room.images?.[0] || room.image_url || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400'}
                          alt={room.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400';
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {room.name}
                          </h3>
                          <p className="text-gray-600 text-sm">{room.description}</p>
                          </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center bg-white px-3 py-1 rounded border">
                            <UsersIcon className="h-4 w-4 mr-1 text-blue-600" />
                            <span className="text-gray-700">{room.capacity} khách</span>
                        </div>
                          <div className="flex items-center bg-white px-3 py-1 rounded border">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            <span className="text-gray-700">Phòng {room.room_number}</span>
                          </div>
                          <div className="flex items-center bg-white px-3 py-1 rounded border">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1 text-blue-600" />
                            <span className="font-semibold text-gray-700">{formatCurrency(room.price_per_night || 0)}/đêm</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="primary">
                            <span className="capitalize">{translateRoomType(room.room_type)}</span>
                          </Badge>
                          <Badge variant="success">
                            Có sẵn
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Date Selection */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                          <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Thời Gian Lưu Trú
                      </h3>

                        {/* Date Selection Buttons */}
                        <div className="space-y-4">
                          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                            <strong>Ngày đã chọn:</strong> 
                            {selectedDates.startDate && selectedDates.endDate 
                              ? ` ${new Date(selectedDates.startDate).toLocaleDateString('vi-VN')} - ${new Date(selectedDates.endDate).toLocaleDateString('vi-VN')} (${calculateNights()} đêm)`
                              : selectedDates.startDate 
                                ? ` Từ ${new Date(selectedDates.startDate).toLocaleDateString('vi-VN')} (chọn ngày trả phòng)`
                                : ' Chọn ngày nhận phòng'
                            }
                            {datesConfirmed && (
                              <span className="ml-2 text-green-600 font-semibold">✓ Đã xác nhận</span>
                            )}
                          </div>
                          
                          {/* Date Selection Buttons */}
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              onClick={() => setShowDatePicker('checkIn')}
                              variant={selectedDates.startDate ? "primary" : "outline"}
                              className="h-16 text-left justify-start p-4"
                            >
                              <CalendarDaysIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                              <div className="flex flex-col items-start min-w-0">
                                <div className="font-medium text-sm leading-tight">Ngày nhận phòng</div>
                                <div className="text-xs text-gray-500 mt-1 truncate w-full">
                                  {selectedDates.startDate 
                                    ? new Date(selectedDates.startDate).toLocaleDateString('vi-VN')
                                    : 'Chọn ngày'
                                  }
                                </div>
                              </div>
                            </Button>
                            
                            <Button
                              onClick={() => setShowDatePicker('checkOut')}
                              variant={selectedDates.endDate ? "primary" : "outline"}
                              className="h-16 text-left justify-start p-4"
                            >
                              <CalendarDaysIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                              <div className="flex flex-col items-start min-w-0">
                                <div className="font-medium text-sm leading-tight">Ngày trả phòng</div>
                                <div className="text-xs text-gray-500 mt-1 truncate w-full">
                                  {selectedDates.endDate 
                                    ? new Date(selectedDates.endDate).toLocaleDateString('vi-VN')
                                    : 'Chọn ngày'
                                  }
                                </div>
                              </div>
                            </Button>
                          </div>
                          
                          {/* Date Picker Modal */}
                          {showDatePicker && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-semibold">
                                    Chọn {showDatePicker === 'checkIn' ? 'ngày nhận phòng' : 'ngày trả phòng'}
                                  </h3>
                                  <Button
                                    onClick={() => setShowDatePicker(null)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    ✕
                                  </Button>
                                </div>
                                
                                <Calendar
                                  selectedStartDate={showDatePicker === 'checkIn' ? selectedDates.startDate : null}
                                  selectedEndDate={showDatePicker === 'checkOut' ? selectedDates.endDate : null}
                                  onDateSelect={(dateObj) => {
                                    const date = dateObj.startDate || dateObj.endDate;
                                    if (date) {
                                      handleDateSelect(date, showDatePicker);
                                    }
                                  }}
                                  disabledDates={bookedDatesData?.booked_dates || []}
                                  bookedRanges={bookedDatesData?.booked_ranges || []}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Confirm Dates Button */}
                          {selectedDates.startDate && selectedDates.endDate && !datesConfirmed && (
                            <div className="flex justify-center">
                              <Button
                                onClick={handleConfirmDates}
                                variant="primary"
                                className="px-6 py-2"
                              >
                                ✓ Chốt ngày nhận và trả phòng
                              </Button>
                        </div>
                          )}
                          
                          {bookedDatesLoading && (
                            <div className="text-sm text-gray-500 text-center">
                              Đang tải lịch đặt phòng...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                        {/* Date Range Summary */}
                        {watchCheckIn && watchCheckOut && calculateNights() > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border">
                        <div className="text-center text-sm text-gray-600">
                          <span className="font-semibold text-blue-600">
                            {new Date(watchCheckIn).toLocaleDateString('vi-VN')}
                                </span>
                          <span className="mx-2">→</span>
                                <span className="font-semibold text-blue-600">
                            {new Date(watchCheckOut).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="ml-2 text-gray-500">
                            ({calculateNights()} đêm)
                                </span>
                            </div>
                          </div>
                        )}

                    {/* Number of Guests */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                          <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Số Lượng Khách
                      </h3>
                        <Input
                          label={`Số khách (tối đa ${room.capacity} khách)`}
                          type="number"
                          min="1"
                          max={room.capacity}
                          {...register('guests', {
                            required: 'Số lượng khách là bắt buộc',
                            min: { value: 1, message: 'Ít nhất 1 khách' },
                            max: { value: room.capacity, message: `Tối đa ${room.capacity} khách` },
                          })}
                          error={errors.guests?.message}
                        />

                              </div>
                          </div>

                    {/* Special Requests */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                          <span className="text-blue-600 mr-2">💬</span>
                            Yêu Cầu Đặc Biệt
                          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">Tùy chọn</span>
                      </h3>
                        <textarea
                          {...register('specialRequests')}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="Ví dụ: Tầng cao, gần thang máy, giường đôi, không hút thuốc..."
                        />
                      </div>
                    </div>

                    {/* Enhanced Submit Button */}
                    <div className="pt-8">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={bookingLoading}
                        disabled={bookingLoading || !watchCheckIn || !watchCheckOut}
                          className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-3xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 text-lg"
                      >
                        {bookingLoading ? (
                          <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                              <span className="animate-pulse">Đang xử lý đặt phòng...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                              <div className="p-2 bg-white/20 rounded-xl mr-3 backdrop-blur-sm">
                                <CurrencyDollarIcon className="h-6 w-6" />
                              </div>
                              <span className="text-xl">Tiếp tục thanh toán</span>
                              <div className="ml-3 transform group-hover:translate-x-1 transition-transform duration-200">
                                <span className="text-2xl">→</span>
                              </div>
                          </div>
                        )}
                      </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Payment Method Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Phương Thức Thanh Toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Success Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <h3 className="text-green-800 font-semibold">Thông tin đặt phòng đã được xác nhận!</h3>
                          <p className="text-green-700 text-sm">Vui lòng chọn phương thức thanh toán để hoàn tất</p>
                        </div>
                      </div>
                    </div>

                    {/* Thanh toán sau option */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">Thanh toán sau</h3>
                          <p className="text-sm text-gray-600">Thanh toán khi nhận phòng (tự động hủy sau 5 phút nếu không thanh toán)</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePayment('PayLater')}
                        disabled={paymentProcessing}
                        className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-lg transition-all ${
                          paymentProcessing 
                            ? 'opacity-50 cursor-not-allowed border-gray-200' 
                            : 'border-yellow-300 hover:border-yellow-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <span className="font-semibold text-gray-900">💳 Thanh toán khi nhận phòng</span>
                            <p className="text-xs text-red-600 font-medium">⚠️ Đơn sẽ tự động hủy sau 5 phút nếu chưa thanh toán</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">Tiện lợi</span>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border-2 border-pink-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">Ví MoMo</h3>
                            <p className="text-sm text-gray-600">Chọn phương thức thanh toán MoMo</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {/* QR Code */}
                      <button
                            onClick={() => handlePayment('MoMo', 'captureWallet')}
                        disabled={paymentProcessing}
                            className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-lg transition-all ${
                          paymentProcessing 
                                ? 'opacity-50 cursor-not-allowed border-gray-200' 
                                : 'border-pink-200 hover:border-pink-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                                <span className="font-semibold text-gray-900">Quét mã QR</span>
                                <p className="text-xs text-gray-600">Mở app MoMo và quét mã</p>
                          </div>
                        </div>
                            <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">Nhanh nhất</span>
                      </button>
                      
                          {/* MoMo App */}
                      <button
                            onClick={() => handlePayment('MoMo', 'captureWallet')}
                            disabled={paymentProcessing}
                            className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-lg transition-all ${
                              paymentProcessing 
                                ? 'opacity-50 cursor-not-allowed border-gray-200' 
                                : 'border-pink-200 hover:border-pink-400 hover:shadow-md'
                            }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                                <span className="font-semibold text-gray-900">Ứng dụng MoMo</span>
                                <p className="text-xs text-gray-600">Chuyển sang app MoMo</p>
                          </div>
                        </div>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Tiện lợi</span>
                      </button>
                      
                          {/* ATM/Visa/Mastercard via MoMo */}
                      <button
                            onClick={() => handlePayment('MoMo', 'payWithATM')}
                            disabled={paymentProcessing}
                            className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-lg transition-all ${
                              paymentProcessing 
                                ? 'opacity-50 cursor-not-allowed border-gray-200' 
                                : 'border-pink-200 hover:border-pink-400 hover:shadow-md'
                            }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                                <span className="font-semibold text-gray-900">Thẻ ATM/Visa/Master</span>
                                <p className="text-xs text-gray-600">Liên kết qua MoMo</p>
                          </div>
                        </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Đa dạng</span>
                      </button>
                        </div>

                        {paymentProcessing && (
                          <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600 animate-pulse">⏳ Đang tạo thanh toán...</p>
                          </div>
                        )}
                          </div>
                      
                      <div className="text-center text-sm text-gray-500 py-2 bg-gray-50 rounded-lg">
                        <p className="flex items-center justify-center gap-2">
                          <span>🔒</span>
                          <span>Thanh toán được mã hóa và bảo mật bởi MoMo</span>
                        </p>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
                Tóm Tắt Đặt Phòng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Guest Info */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-3">
                    Thông tin khách hàng
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 font-medium">{user.full_name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">{user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              {watchCheckIn && watchCheckOut && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-3">
                      Chi tiết lưu trú
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-green-200/30">
                      <span className="text-gray-600 text-sm font-medium">Nhận phòng:</span>
                      <span className="font-bold text-gray-900">{new Date(watchCheckIn).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-green-200/30">
                      <span className="text-gray-600 text-sm font-medium">Trả phòng:</span>
                      <span className="font-bold text-gray-900">{new Date(watchCheckOut).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl border border-emerald-300 shadow-sm">
                      <span className="text-emerald-700 text-sm font-bold">Số đêm:</span>
                      <span className="font-bold text-xl text-emerald-600 animate-pulse">{calculateNights()} đêm</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-green-200/30">
                      <span className="text-gray-600 text-sm font-medium">Số khách:</span>
                      <span className="font-bold text-gray-900">{watchGuests} khách</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing */}
              {room && watchCheckIn && watchCheckOut && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-3">
                      Chi tiết giá
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-yellow-200/30">
                      <span className="text-gray-600 text-sm font-medium">
                        {formatCurrency(room.price_per_night || 0)} × {calculateNights()} đêm
                      </span>
                      <span className="font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-yellow-200/30">
                      <span className="text-gray-600 text-sm font-medium">Phí dịch vụ</span>
                      <span className="text-green-600 text-sm font-bold bg-green-100 px-2 py-1 rounded-full">Miễn phí</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-yellow-200/30">
                      <span className="text-gray-600 text-sm font-medium">Thuế VAT (10%)</span>
                      <span className="font-bold text-gray-900">{formatCurrency(calculateTotal() * 0.1)}</span>
                    </div>
                    <div className="border-t-2 border-gradient-to-r from-yellow-300 to-orange-300 pt-4">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border border-green-300 shadow-lg">
                        <div className="flex items-center">
                          <span className="font-bold text-lg text-green-800">Tổng cộng:</span>
                      </div>
                        <div className="text-right">
                          <span className="font-bold text-2xl text-green-600 animate-pulse">{formatCurrency(calculateTotal() * 1.1)}</span>
                          <p className="text-xs text-green-600 mt-1 font-medium">Đã bao gồm thuế và phí</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-3">
                    Chính sách hủy phòng
                </h4>
                <div className="space-y-2">
                    <div className="flex items-start">
                      <div>
                      <p className="text-sm text-green-700 font-medium">Miễn phí hủy phòng</p>
                      <p className="text-xs text-green-600">Trước 24 giờ nhận phòng</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div>
                      <p className="text-sm text-orange-700 font-medium">Phí hủy phòng 50%</p>
                      <p className="text-xs text-orange-600">Trong vòng 24 giờ trước nhận phòng</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default BookingPage;

