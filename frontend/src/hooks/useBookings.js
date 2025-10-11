import { useState, useCallback, useEffect } from 'react';

import { apiService } from '@/services/api';

import toast from 'react-hot-toast';

export const useBookings = (filters = {}, options = {}) => {
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(options.page || 1);

  // Sample data for demonstration

  const sampleBookings = [

    {

      id: 1,

      booking_code: 'BK001',

      user_name: 'Nguyễn Văn A',

      user_email: 'nguyenvana@email.com',

      user_phone: '0123456789',

      room_number: '101',

      room_name: 'Deluxe Room',

      check_in_date: '2025-10-07',

      check_out_date: '2025-10-09',

      total_amount: 300.00,

      status: 'confirmed',

      created_at: '2025-10-05T10:00:00Z',

      services: [

        { id: 1, name: 'Breakfast', price: 15.00, quantity: 2 },

        { id: 2, name: 'Airport Transfer', price: 25.00, quantity: 1 }

      ],

      special_requests: 'Late check-in, extra towels'

    },

    {

      id: 2,

      booking_code: 'BK002',

      user_name: 'Trần Thị B',

      user_email: 'tranthib@email.com',

      user_phone: '0987654321',

      room_number: '102',

      room_name: 'Standard Room',

      check_in_date: '2025-10-08',

      check_out_date: '2025-10-10',

      total_amount: 200.00,

      status: 'pending',

      created_at: '2025-10-06T14:30:00Z',

      services: [],

      special_requests: 'Ground floor room preferred'

    },

    {

      id: 3,

      booking_code: 'BK003',

      user_name: 'Lê Văn C',

      user_email: 'levanc@email.com',

      user_phone: '0369852147',

      room_number: '201',

      room_name: 'Suite Room',

      check_in_date: '2025-10-06',

      check_out_date: '2025-10-08',

      total_amount: 450.00,

      status: 'checked_in',

      created_at: '2025-10-04T09:15:00Z',

      services: [

        { id: 3, name: 'Spa Service', price: 80.00, quantity: 1 },

        { id: 4, name: 'Room Service', price: 35.00, quantity: 1 }

      ],

      special_requests: 'Anniversary celebration'

    },

    {

      id: 4,

      booking_code: 'BK004',

      user_name: 'Phạm Thị D',

      user_email: 'phamthid@email.com',

      user_phone: '0147258369',

      room_number: '103',

      room_name: 'Standard Room',

      check_in_date: '2025-10-09',

      check_out_date: '2025-10-11',

      total_amount: 180.00,

      status: 'pending',

      created_at: '2025-10-06T16:45:00Z',

      services: [

        { id: 5, name: 'Breakfast', price: 15.00, quantity: 1 }

      ],

      special_requests: ''

    },

    {

      id: 5,

      booking_code: 'BK005',

      user_name: 'Hoàng Văn E',

      user_email: 'hoangvane@email.com',

      user_phone: '0258147369',

      room_number: '202',

      room_name: 'Deluxe Room',

      check_in_date: '2025-10-05',

      check_out_date: '2025-10-07',

      total_amount: 320.00,

      status: 'checked_out',

      created_at: '2025-10-03T11:20:00Z',

      services: [

        { id: 6, name: 'Laundry Service', price: 20.00, quantity: 1 },

        { id: 7, name: 'Mini Bar', price: 45.00, quantity: 1 }

      ],

      special_requests: 'Early check-out'

    }

  ];

  const fetchBookings = useCallback(async (customFilters = {}) => {
    try {

      setLoading(true);

      setError(null);

      const mergedFilters = { ...filters, ...customFilters };
      const params = {
        ...mergedFilters,
        page: currentPage,
        limit: options.limit || 10
      };

      // Determine which API to call based on context
      // If forStaff option is true, use getAll API, otherwise use getUserBookings
      const isStaffView = options.forStaff === true;

      // Call appropriate API
      const response = isStaffView 
        ? await apiService.bookings.getAll(params)
        : await apiService.bookings.getUserBookings(params);

      if (response.data && response.data.success) {

        const bookingsData = response.data.data;

        // Set pagination if available
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
        
        // Ensure we always set an array

        setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      } else {

        // Fallback to sample data if API fails

        let filteredBookings = [...sampleBookings];

        if (filters.status && filters.status !== 'all') {

          filteredBookings = filteredBookings.filter(b => b.status === filters.status);

        }

        if (filters.search) {

          const searchLower = filters.search.toLowerCase();

          filteredBookings = filteredBookings.filter(b => 

            b.user_name.toLowerCase().includes(searchLower) ||

            b.booking_code.toLowerCase().includes(searchLower) ||

            b.room_number.includes(filters.search) ||

            b.user_email.toLowerCase().includes(searchLower)

          );

        }

        if (filters.date_from) {

          filteredBookings = filteredBookings.filter(b => 

            b.check_in_date >= filters.date_from

          );

        }

        if (filters.date_to) {

          filteredBookings = filteredBookings.filter(b => 

            b.check_out_date <= filters.date_to

          );

        }

        setBookings(filteredBookings);

      }

    } catch (err) {

      console.error('API Error:', err);

      setError(err.message);

      // Fallback to sample data on error

      let filteredBookings = [...sampleBookings];

      if (filters.status && filters.status !== 'all') {

        filteredBookings = filteredBookings.filter(b => b.status === filters.status);

      }

      if (filters.search) {

        const searchLower = filters.search.toLowerCase();

        filteredBookings = filteredBookings.filter(b => 

          b.user_name.toLowerCase().includes(searchLower) ||

          b.booking_code.toLowerCase().includes(searchLower) ||

          b.room_number.includes(filters.search) ||

          b.user_email.toLowerCase().includes(searchLower)

        );

      }

      if (filters.date_from) {

        filteredBookings = filteredBookings.filter(b => 

          b.check_in_date >= filters.date_from

        );

      }

      if (filters.date_to) {

        filteredBookings = filteredBookings.filter(b => 

          b.check_out_date <= filters.date_to

        );

      }

      setBookings(filteredBookings);

      toast.error('Không thể tải dữ liệu từ server, đang sử dụng dữ liệu mẫu');

    } finally {

      setLoading(false);

    }

  }, []);

  const updateBookingStatus = useCallback(async (bookingId, newStatus) => {

    try {

      // Call real API based on status

      let response;

      switch (newStatus) {

        case 'confirmed':

          response = await apiService.bookings.confirm(bookingId);

          break;

        case 'checked_in':

          response = await apiService.bookings.checkIn(bookingId);

          break;

        case 'checked_out':

          response = await apiService.bookings.checkOut(bookingId, { verify_payment: false });

          break;

        case 'cancelled':

          response = await apiService.bookings.cancel(bookingId, 'Cancelled by staff');

          break;

        default:

          response = await apiService.bookings.update(bookingId, { status: newStatus });

      }

      if (response.data && response.data.success) {
        // Check if checkout requires payment (QR code)
        if (newStatus === 'checked_out' && response.data.data?.requires_payment) {
          // Don't allow checkout if there are unpaid services
          toast.error('Chưa thanh toán dịch vụ bổ sung. Vui lòng thanh toán trước khi checkout.', {
            duration: 5000,
            style: {
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #f87171'
            }
          });
          
          return { requiresPayment: true, error: 'Chưa thanh toán dịch vụ bổ sung' };
        }

        setBookings(prev => prev.map(booking => 

          booking.id === bookingId 

            ? { ...booking, status: newStatus }

            : booking

        ));

        const statusTexts = {

          pending: 'Chờ xác nhận',

          confirmed: 'Đã xác nhận',

          checked_in: 'Đã check-in',

          checked_out: 'Đã check-out',

          cancelled: 'Đã hủy'

        };

        toast.success(`Đã cập nhật trạng thái thành ${statusTexts[newStatus]}`);

        return true;

      } else {

        throw new Error(response.data?.message || 'Cập nhật thất bại');

      }

    } catch (err) {

      console.error('Update booking status error:', err);

      // Handle checkout with pending payment error
      if (err.response?.status === 400 && err.response?.data?.pending_payment) {
        const pendingPayment = err.response.data.pending_payment;
        toast.error(pendingPayment.message, {
          duration: 6000,
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fca5a5'
          }
        });
      } else {
        toast.error('Không thể cập nhật trạng thái đặt phòng: ' + (err.response?.data?.message || err.message));
      }

      return false;

    }

  }, []);

  const addServiceToBooking = useCallback(async (bookingId, serviceData) => {

    try {

      // Call real API

      const response = await apiService.bookings.addService(bookingId, serviceData);

      if (response.data && response.data.success) {

        const newService = {

          id: response.data.data.id || Date.now(),

          ...serviceData

        };

        // Check if additional payment is required
        const paymentInfo = response.data.data.payment_info;
        if (paymentInfo && paymentInfo.requires_payment) {
          toast.success('Đã thêm dịch vụ thành công. ' + paymentInfo.message, {
            duration: 5000,
            style: {
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #f59e0b'
            }
          });
          // Store payment info for UI display
          window.pendingPaymentInfo = paymentInfo;
        } else {
          toast.success('Đã thêm dịch vụ thành công');
        }

        // Refresh booking data from backend to get updated total_amount
        await fetchBookings();

        return true;

      } else {

        throw new Error(response.data?.message || 'Thêm dịch vụ thất bại');

      }

    } catch (err) {

      console.error('Add service error:', err);

      toast.error('Không thể thêm dịch vụ: ' + (err.response?.data?.message || err.message));

      return false;

    }

  }, []);

  const removeServiceFromBooking = useCallback(async (bookingId, serviceId) => {

    try {

      // Call dedicated API to remove booking service by its id
      let response;
      try {
        response = await apiService.bookings.removeService(bookingId, serviceId);
      } catch (e) {
        // Fallback for servers without DELETE endpoint
        response = await apiService.bookings.update(bookingId, {
          action: 'remove_service',
          service_id: serviceId
        });
      }

      if (response.data && response.data.success) {
        setBookings(prev => prev.map(booking => {
          if (booking.id === bookingId) {
            const servicesArray = Array.isArray(booking.services) ? booking.services : [];
            const serviceToRemove = servicesArray.find(s => s.id === serviceId);
            const updatedServices = servicesArray.filter(s => s.id !== serviceId);
            const removedAmount = serviceToRemove
              ? (parseFloat(serviceToRemove.total_price) || (parseFloat(serviceToRemove.unit_price) || 0) * (serviceToRemove.quantity || 1))
              : 0;
            const updatedAmount = (parseFloat(booking.total_amount) || 0) - removedAmount;

            return {
              ...booking,
              services: updatedServices,
              total_amount: updatedAmount
            };
          }
          return booking;
        }));

        toast.success('Đã xóa dịch vụ thành công');

        return true;

      } else {

        throw new Error(response.data?.message || 'Xóa dịch vụ thất bại');

      }

    } catch (err) {

      console.error('Remove service error:', err);

      toast.error('Không thể xóa dịch vụ: ' + (err.response?.data?.message || err.message));

      return false;

    }

  }, []);

  const getBookingStats = useCallback(() => {

    // Ensure bookings is an array

    const bookingsArray = Array.isArray(bookings) ? bookings : [];

    return {

      total: bookingsArray.length,

      pending: bookingsArray.filter(b => b.status === 'pending').length,

      confirmed: bookingsArray.filter(b => b.status === 'confirmed').length,

      checked_in: bookingsArray.filter(b => b.status === 'checked_in').length,

      checked_out: bookingsArray.filter(b => b.status === 'checked_out').length,

      cancelled: bookingsArray.filter(b => b.status === 'cancelled').length,

      total_revenue: bookingsArray.reduce((sum, b) => {
        const amount = parseFloat(b.total_amount) || 0;
        return sum + amount;
      }, 0)
    };

  }, [bookings]);

  // Auto-fetch on mount if immediate option is true (default)
  useEffect(() => {
    if (options.immediate !== false) {
      fetchBookings();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchBookings();
    }
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  return {

    data: bookings,
    bookings,

    loading,

    error,

    pagination,
    setPage: setCurrentPage,
    refetch: fetchBookings,
    fetchBookings,

    updateBookingStatus,

    addServiceToBooking,

    removeServiceFromBooking,

    getBookingStats

  };

};

// Hook for creating new bookings

export const useCreateBooking = (options = {}) => {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const { showSuccessToast = true, onSuccess, onError } = options;

  const mutate = useCallback(async (bookingData) => {
    try {

      setLoading(true);

      setError(null);

      // Call the API
      const response = await apiService.bookings.create(bookingData);

      // Handle different response structures
      const bookingResult = response.data?.data || response.data;
      
      if (response.data?.success !== false) {
        if (showSuccessToast) {
        toast.success('Đặt phòng thành công!');

        }
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(bookingResult);
        }
        
        return { success: true, data: bookingResult };
      } else {

        throw new Error(response.data?.message || 'Đặt phòng thất bại');
      }

    } catch (err) {

      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đặt phòng';
      setError(errorMessage);

      // Call onError callback if provided
      if (onError) {
        onError(err);
      } else {
      toast.error(errorMessage);

      }
      
      return { success: false, error: errorMessage };

    } finally {

      setLoading(false);

    }

  }, [showSuccessToast, onSuccess, onError]);

  return {

    mutate,
    createBooking: mutate, // Alias for backward compatibility
    loading,

    error

  };

};

// Hook for getting user booking statistics

export const useUserBookingStats = () => {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {

    try {

      setLoading(true);

      setError(null);

      // Call real API

      const response = await apiService.bookings.getUserStats();

      if (response.data && response.data.success) {

        setData(response.data.data);

      } else {

        // Fallback to sample stats

        const sampleStats = {

          totalBookings: 12,

          upcomingBookings: 3,

          completedBookings: 8,

          cancelledBookings: 1,

          totalSpent: 2450.00,

          favoriteRoomType: 'Deluxe Room',

          memberSince: '2024-01-15',

          loyaltyPoints: 245

        };

        setData(sampleStats);

      }

    } catch (err) {

      console.error('Fetch user stats error:', err);

      setError(err.message);

      // Fallback to sample stats on error

      const sampleStats = {

        totalBookings: 12,

        upcomingBookings: 3,

        completedBookings: 8,

        cancelledBookings: 1,

        totalSpent: 2450.00,

        favoriteRoomType: 'Deluxe Room',

        memberSince: '2024-01-15',

        loyaltyPoints: 245

      };

      setData(sampleStats);

      toast.error('Không thể tải dữ liệu từ server, đang sử dụng dữ liệu mẫu');

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    fetchStats();

  }, [fetchStats]);

  return {

    data,

    loading,

    error,

    refetch: fetchStats

  };

};

// Hook for canceling bookings

export const useCancelBooking = (options = {}) => {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const { onSuccess, onError } = options;

  const mutate = useCallback(async ({ id, reason = '' }) => {
    try {

      setLoading(true);

      setError(null);

      // Call real API

      const response = await apiService.bookings.cancel(id, reason);

      if (response.data && response.data.success) {

        toast.success('Đã hủy đặt phòng thành công');

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        return { success: true, message: 'Booking cancelled successfully' };

      } else {

        throw new Error(response.data?.message || 'Hủy đặt phòng thất bại');

      }

    } catch (err) {

      console.error('Cancel booking error:', err);

      const errorMessage = err.response?.data?.message || err.message || 'Không thể hủy đặt phòng';

      setError(errorMessage);

      // Call onError callback if provided
      if (onError) {
        onError(err);
      } else {
      toast.error(errorMessage);

      }
      
      return { success: false, error: errorMessage };

    } finally {

      setLoading(false);

    }

  }, [onSuccess, onError]);

  return {

    mutate,
    cancelBooking: mutate, // Alias for backward compatibility
    loading,

    error

  };

};
