import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Table,
  TablePagination,
  Select,
  Input,
  Badge,
  StatusBadge,
  Modal,
  ConfirmModal,
} from '@/components';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
  CalendarDaysIcon,
  StarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { apiService } from '@/services/api';
import { toast } from 'react-hot-toast';

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

// StarRating Component
const StarRating = ({ rating = 0, onRatingChange, readOnly = false, size = 'sm' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            className={`${sizeClass} ${
              isActive ? 'text-yellow-400' : 'text-gray-300'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-all duration-150`}
            onClick={() => !readOnly && onRatingChange && onRatingChange(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly}
          >
            {isActive ? (
              <StarSolidIcon className="w-full h-full" />
            ) : (
              <StarIcon className="w-full h-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ReviewForm Component
const ReviewForm = ({ booking, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit({ rating, comment, booking_id: booking.id });
      setRating(5);
      setComment('');
      onClose();
      toast.success('Đánh giá của bạn đã được gửi!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi đánh giá');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đánh giá phòng">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Phòng {booking?.room_number} - {translateRoomType(booking?.room_type)}
            </h3>
            <p className="text-sm text-gray-500">
              {booking?.check_in_date && new Date(booking.check_in_date).toLocaleDateString('vi-VN')} - {booking?.check_out_date && new Date(booking.check_out_date).toLocaleDateString('vi-VN')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Đánh giá của bạn
            </label>
            <div className="flex justify-center">
              <StarRating rating={rating} onRatingChange={setRating} size="md" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
              required
            />
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" loading={loading}>
              Gửi đánh giá
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

/**
 * MyBookings page - Customer's booking management
 * 
 * Features:
 * - Real-time booking data from database
 * - Filtering by status and date ranges
 * - Booking cancellation with confirmation
 * - Pagination support
 * - Review & Rating system for completed bookings
 */
const MyBookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  
  // Payment states
  const [pendingPayments, setPendingPayments] = useState({});
  const [paymentLoading, setPaymentLoading] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);

  // Build filters for API call
  const filters = React.useMemo(() => {
    const filterObj = {};
    
    if (statusFilter) filterObj.status = statusFilter;
    if (dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'upcoming':
          filterObj.check_in_from = today.toISOString().split('T')[0];
          break;
        case 'past':
          filterObj.check_in_to = today.toISOString().split('T')[0];
          break;
        case 'this_month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          filterObj.created_from = startOfMonth.toISOString().split('T')[0];
          filterObj.created_to = endOfMonth.toISOString().split('T')[0];
          break;
        case 'last_month':
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          filterObj.created_from = lastMonthStart.toISOString().split('T')[0];
          filterObj.created_to = lastMonthEnd.toISOString().split('T')[0];
          break;
        default:
          break;
      }
    }
    
    return filterObj;
  }, [statusFilter, dateFilter]);

  // Use real API to fetch user bookings
  const {
    data: bookings = [],
    loading,
    error,
    pagination,
    setPage,
    refetch,
  } = useBookings(filters, {
    page: parseInt(searchParams.get('page')) || 1,
    limit: 10,
  });

  // DEBUG: Check booking data

  // Use cancel booking mutation
  const cancelBookingMutation = useCancelBooking({
    onSuccess: () => {
      toast.success('Đặt phòng đã được hủy thành công');
      refetch(); // Refresh the bookings list
      setShowCancelModal(false);
      setSelectedBooking(null);
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
      console.error('Error response:', error.response?.data);
      
      // Get error message from backend response
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Không thể hủy đặt phòng. Vui lòng thử lại.';
      toast.error(errorMessage, { duration: 5000 });
      
      // Refetch để cập nhật trạng thái mới nhất (phòng trường hợp backend đã cancel nhưng trả về error)
      setTimeout(() => {
        refetch();
      }, 1000);
      
      setShowCancelModal(false);
      setSelectedBooking(null);
    }
  });

  // Check for pending payments for all bookings
  const checkPendingPayments = async () => {
    if (!bookings || bookings.length === 0) return;
    
    try {
      // Get user's payments and filter for pending additional services
      const response = await apiService.payments.getUserPayments({ 
        payment_status: 'pending',
        payment_method: 'additional_services'
      });
      
      if (response.data?.data?.payments?.length > 0) {
        const paymentsMap = {};
        response.data.data.payments.forEach(payment => {
          // Only include payments for bookings that are in our current list
          const bookingExists = bookings.some(booking => booking.id === payment.booking_id);
          if (bookingExists) {
            paymentsMap[payment.booking_id] = {
              id: payment.id,
              amount: payment.amount,
              message: `Cần thanh toán thêm ${Number(payment.amount).toLocaleString('vi-VN')} VND cho dịch vụ bổ sung.`
            };
          }
        });
        setPendingPayments(paymentsMap);
      } else {
        setPendingPayments({});
      }
    } catch (error) {
      console.error('Error checking pending payments:', error);
    }
  };

  // Handle MoMo payment
  const handleMoMoPayment = async (bookingId) => {
    const pendingPayment = pendingPayments[bookingId];
    if (!pendingPayment) return;

    try {
      setPaymentLoading(prev => ({ ...prev, [bookingId]: true }));
      const response = await apiService.payments.createMomoPayment({
        booking_id: bookingId,
        amount: pendingPayment.amount,
        payment_method: 'momo',
        notes: 'Thanh toán dịch vụ bổ sung'
      });

      if (response.data?.success && response.data?.data?.payment_url) {
        // Redirect to MoMo payment page
        window.open(response.data.data.payment_url, '_blank');
        toast.success('Đang chuyển hướng đến trang thanh toán MoMo...', {
          duration: 5000,
          style: {
            background: '#f0f9ff',
            color: '#0369a1',
            border: '1px solid #0ea5e9'
          }
        });
        
        // Start polling for payment completion
        const paymentCheckInterval = setInterval(async () => {
          try {
            const checkResponse = await apiService.payments.getUserPayments({ 
              payment_status: 'completed',
              payment_method: 'additional_services'
            });
            
            if (checkResponse.data?.data?.payments?.length > 0) {
              // Check if any completed payment matches our booking
              const completedPayment = checkResponse.data.data.payments.find(
                payment => payment.booking_id === bookingId
              );
              
              if (completedPayment) {
                clearInterval(paymentCheckInterval);
                setPendingPayments(prev => {
                  const updated = { ...prev };
                  delete updated[bookingId];
                  return updated;
                });
                await refetch(); // Refresh bookings data
                toast.success('Thanh toán thành công! Dữ liệu đã được cập nhật.', {
                  duration: 6000,
                  style: {
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #22c55e'
                  }
                });
              }
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }, 10000); // Check every 10 seconds
        
        // Clear interval after 5 minutes
        setTimeout(() => {
          clearInterval(paymentCheckInterval);
        }, 300000);
        
      } else {
        toast.error('Không thể tạo thanh toán MoMo');
      }
    } catch (error) {
      console.error('MoMo payment error:', error);
      toast.error('Lỗi khi tạo thanh toán MoMo');
    } finally {
      setPaymentLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Status options for filter (matching database enum)
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'checked_in', label: 'Đã nhận phòng' },
    { value: 'checked_out', label: 'Đã trả phòng' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  // Date filter options
  const dateFilterOptions = [
    { value: '', label: 'Tất cả thời gian' },
    { value: 'upcoming', label: 'Sắp tới' },
    { value: 'past', label: 'Đã qua' },
    { value: 'this_month', label: 'Tháng này' },
    { value: 'last_month', label: 'Tháng trước' },
  ];

  // Apply client-side filters
  const filteredBookings = React.useMemo(() => {
    if (!bookings) return [];
    
    // Filter out any null/undefined bookings first
    let filtered = bookings.filter(booking => booking != null);
    
    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        translateRoomType(booking.room_type)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(booking => booking?.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(booking => {
        if (!booking?.check_in_date || !booking?.created_at) return false;
        const checkInDate = new Date(booking.check_in_date);
        const bookingDate = new Date(booking.created_at);
        
        switch (dateFilter) {
          case 'upcoming':
            return checkInDate >= today;
          case 'past':
            return checkInDate < today;
          case 'this_month':
            return bookingDate.getMonth() === now.getMonth() && 
                   bookingDate.getFullYear() === now.getFullYear();
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return bookingDate.getMonth() === lastMonth.getMonth() && 
                   bookingDate.getFullYear() === lastMonth.getFullYear();
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  // Translate status to Vietnamese
  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'checked_in': 'Đã nhận phòng',
      'checked_out': 'Đã trả phòng',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Review handlers
  const handleShowReview = (booking) => {
    setReviewBooking(booking);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      // Call API to submit review using apiService
      const response = await apiService.reviews.create(reviewData);
      
      if (response.data && response.data.success) {
        toast.success('Đánh giá của bạn đã được gửi thành công!');
        // Reload bookings after review to update has_review status
        refetch();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Có lỗi xảy ra khi gửi đánh giá');
      throw error;
    }
  };

  // Payment handlers
  const handleShowPayment = (booking) => {
    setPaymentBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePayment = async (method, paymentType = 'captureWallet') => {
    if (!paymentBooking) return;
    
    setPaymentLoading({ ...paymentLoading, [paymentBooking.id]: true });

    try {
      if (method === 'MoMo') {
        const paymentData = {
          bookingId: paymentBooking.id,
          amount: paymentBooking.total_amount,
          orderInfo: `Thanh toán đặt phòng #${paymentBooking.id} - Phòng ${paymentBooking.room_number}`,
          requestType: paymentType
        };

        const response = await apiService.payments.createMomoPayment(paymentData);
        
        if (response.data.success && response.data.data.payUrl) {
          const paymentMethod = paymentType === 'payWithATM' ? 'thẻ ATM/Visa/Master' : 'MoMo';
          toast.success(`Đang chuyển đến trang thanh toán ${paymentMethod}...`);
          window.location.href = response.data.data.payUrl;
        } else {
          toast.error('Không thể tạo link thanh toán MoMo');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          const message = err.msg || err.message || 'Lỗi validation';
          toast.error(message);
        });
      } else {
        toast.error(error.response?.data?.message || error.message || 'Lỗi khi tạo thanh toán');
      }
    } finally {
      setPaymentLoading({ ...paymentLoading, [paymentBooking.id]: false });
    }
  };

  // Update URL params when filters change
  const updateURLParams = React.useCallback((newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Update or remove filter params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    updateURLParams({ search: '', status: '', date: '' });
  };

  // Initialize filters from URL params
  React.useEffect(() => {
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const date = searchParams.get('date') || '';
    
    setSearchTerm(search);
    setStatusFilter(status);
    setDateFilter(date);
  }, [searchParams]);

  // Debounce search term updates
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get('search') || '')) {
        updateURLParams({ search: searchTerm, status: statusFilter, date: dateFilter });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]); // Only depend on searchTerm for debouncing

  // Check for pending payments when bookings change
  React.useEffect(() => {
    if (bookings && bookings.length > 0) {
      checkPendingPayments();
    }
  }, [bookings]);

  // Table columns
  const columns = [
    {
      key: 'room_type',
      header: 'Phòng',
      render: (row) => {
        // Get room type for placeholder image
        const roomType = row?.room_type || 'single';
        const typeSpecificImages = {
          single: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
          double: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
          suite: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
          family: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
        };
        
        const imageUrl = row?.room_images && row.room_images.length > 0 
          ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${row.room_images[0]}`
          : typeSpecificImages[roomType];

        return (
          <div className="flex items-center gap-3">
            <img
              src={imageUrl}
              alt={`${roomType} room`}
              className="w-12 h-12 object-cover rounded-lg shadow-sm"
              onError={(e) => {
                e.target.src = typeSpecificImages[roomType];
              }}
            />
            <div>
              <div className="font-medium text-gray-900">
                {translateRoomType(row?.room_type) || 'N/A'} - {row?.room_number || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                {row?.price_per_night ? formatCurrency(row.price_per_night) : 'N/A'}/đêm
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'dates',
      header: 'Ngày',
      render: (row) => (
        <div>
          <div className="text-sm">
            <div>Nhận: {row?.check_in_date ? formatDate(row.check_in_date) : 'N/A'}</div>
            <div>Trả: {row?.check_out_date ? formatDate(row.check_out_date) : 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'guests_count',
      header: 'Khách',
      render: (row) => (
        <div className="text-center">
          <span className="text-sm font-medium">{row?.guests_count || 0} khách</span>
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Tổng tiền',
      render: (row) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            {row?.total_amount ? formatCurrency(row.total_amount) : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => <StatusBadge status={row?.status || 'unknown'} label={translateStatus(row?.status)} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="ghost"
            leftIcon={<EyeIcon className="h-3 w-3" />}
            onClick={() => {
              setSelectedBooking(row);
              setShowViewModal(true);
            }}
          >
            Xem
          </Button>

          {/* Payment button for pending bookings without payment */}
          {row?.status === 'pending' && !row?.payment_status && (
            <Button
              size="xs"
              variant="primary"
              leftIcon={<CurrencyDollarIcon className="h-3 w-3" />}
              onClick={() => handleShowPayment(row)}
              className="bg-green-600 hover:bg-green-700"
            >
              Thanh toán
            </Button>
          )}

          {/* Review button for checked out bookings */}
          {row?.status === 'checked_out' && !row?.has_review && (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<StarIcon className="h-3 w-3" />}
              onClick={() => handleShowReview(row)}
              className="text-yellow-600 hover:text-yellow-700"
            >
              Đánh giá
            </Button>
          )}
          
          {/* Show review status if already reviewed */}
          {row?.status === 'checked_out' && row?.has_review && (
            <Badge variant="success" className="text-xs">
              Đã đánh giá
            </Badge>
          )}
          
          {(row?.status === 'pending' || row?.status === 'confirmed') && (
            <Button
              size="xs"
              variant="error"
              leftIcon={<XMarkIcon className="h-3 w-3" />}
              onClick={() => {
                setSelectedBooking(row);
                setShowCancelModal(true);
              }}
            >
              Hủy
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Use the filtered bookings directly since we're using server-side pagination
  const paginatedData = filteredBookings;
  
  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter || dateFilter;
  const totalBookings = bookings?.length || 0;
  const filteredCount = filteredBookings?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Lịch sử đặt phòng</h1>
        <Button
          variant="primary"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          to="/rooms"
        >
          Đặt phòng mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm kiếm phòng..."
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              options={statusOptions}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                updateURLParams({ search: searchTerm, status: value, date: dateFilter });
              }}
            />
            <Select
              placeholder="Lọc theo ngày"
              options={dateFilterOptions}
              value={dateFilter}
              onChange={(value) => {
                setDateFilter(value);
                updateURLParams({ search: searchTerm, status: statusFilter, date: value });
              }}
            />
            <Button
              variant="secondary"
              onClick={clearFilters}
              disabled={!searchTerm && !statusFilter && !dateFilter}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {hasActiveFilters ? (
                <>Hiển thị {filteredCount} / {totalBookings} đặt phòng</>
              ) : (
                <>Tìm thấy {totalBookings} đặt phòng</>
              )}
            </CardTitle>
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Badge variant="primary">
                  Đã lọc
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={columns}
            data={paginatedData}
            loading={loading}
            hoverable
            emptyMessage={
              <div className="text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy đặt phòng nào
                </h3>
                <p className="text-gray-500 mb-4">
                  Thử thay đổi bộ lọc hoặc tạo đặt phòng mới.
                </p>
                <Button
                  variant="primary"
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                  to="/rooms"
                >
                  Đặt phòng ngay
                </Button>
              </div>
            }
          />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit || 10}
              onPageChange={setPage}
              onItemsPerPageChange={(newLimit) => {
                // This would require updating the hook to support changing limit
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* View Booking Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedBooking(null);
        }}
        title="Chi tiết đặt phòng"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Room Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Hình ảnh phòng</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(() => {
                  // Use actual room images if available
                  if (selectedBooking.room_images && selectedBooking.room_images.length > 0) {
                    return selectedBooking.room_images.slice(0, 6).map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${image}`}
                          alt={`Room ${selectedBooking.room_number} - ${index + 1}`}
                          className="w-full h-24 md:h-32 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                          onError={(e) => {
                            // Fallback to placeholder based on room type
                            const roomType = selectedBooking.room_type || 'single';
                            e.target.src = `https://images.unsplash.com/photo-151402773${4000 + index}-${roomType === 'suite' ? '2000x1333' : roomType === 'family' ? '1800x1200' : '1600x1067'}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg"></div>
                      </div>
                    ));
                  }

                  // Generate placeholder images based on room type
                  const roomType = selectedBooking.room_type || 'single';
                  const placeholderImages = [
                    `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`, // Hotel room
                    `https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`, // Bedroom
                    `https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`, // Hotel interior
                  ];

                  // Room type specific images
                  const typeSpecificImages = {
                    single: [
                      `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                      `https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                      `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`
                    ],
                    double: [
                      `https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                      `https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                      `https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`
                    ],
                    suite: [
                      `https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                      `https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                      `https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`
                    ],
                    family: [
                      `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                      `https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                      `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`
                    ]
                  };

                  const imagesToShow = typeSpecificImages[roomType] || placeholderImages;

                  return imagesToShow.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`${roomType} room - ${index + 1}`}
                        className="w-full h-24 md:h-32 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg"></div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Booking Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin phòng</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đặt phòng:</span>
                    <span className="font-medium">#{selectedBooking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại phòng:</span>
                    <span className="font-medium">{translateRoomType(selectedBooking.room_type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số phòng:</span>
                    <span className="font-medium">{selectedBooking.room_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá phòng/đêm:</span>
                    <span className="font-medium">{formatCurrency(selectedBooking.price_per_night)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đặt phòng</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày nhận phòng:</span>
                    <span className="font-medium">
                      {new Date(selectedBooking.check_in_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày trả phòng:</span>
                    <span className="font-medium">
                      {new Date(selectedBooking.check_out_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số khách:</span>
                    <span className="font-medium">{selectedBooking.guests_count} khách</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <StatusBadge status={selectedBooking.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {selectedBooking.special_requests && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Yêu cầu đặc biệt</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{selectedBooking.special_requests}</p>
                </div>
              </div>
            )}

            {/* Total Amount */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Tổng tiền:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(selectedBooking.total_amount)}
                </span>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="text-sm text-gray-500 border-t pt-4">
              <div className="flex justify-between">
                <span>Ngày đặt: {new Date(selectedBooking.created_at).toLocaleString('vi-VN')}</span>
                <span>Cập nhật: {new Date(selectedBooking.updated_at).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Booking Modal */}
      {/* Review Modal */}
      <ReviewForm
        booking={reviewBooking}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
      />

      {/* Payment Modal */}
      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentBooking(null);
        }}
        title="Thanh toán đặt phòng"
      >
        <div className="p-6">
          {paymentBooking && (
            <div className="space-y-6">
              {/* Booking Info */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin đặt phòng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đặt phòng:</span>
                    <span className="font-semibold">#{paymentBooking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-semibold">{paymentBooking.room_number} - {translateRoomType(paymentBooking.room_type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-semibold text-green-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentBooking.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Chọn phương thức thanh toán</h3>
                
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border-2 border-pink-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">Ví MoMo</h4>
                      <p className="text-sm text-gray-600">Chọn phương thức thanh toán MoMo</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* QR Code */}
                    <button
                      onClick={() => handlePayment('MoMo', 'captureWallet')}
                      disabled={paymentLoading[paymentBooking.id]}
                      className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-lg transition-all ${
                        paymentLoading[paymentBooking.id]
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
                      disabled={paymentLoading[paymentBooking.id]}
                      className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-lg transition-all ${
                        paymentLoading[paymentBooking.id]
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
                    
                    {/* ATM/Visa/Mastercard */}
                    <button
                      onClick={() => handlePayment('MoMo', 'payWithATM')}
                      disabled={paymentLoading[paymentBooking.id]}
                      className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-lg transition-all ${
                        paymentLoading[paymentBooking.id]
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

                  {paymentLoading[paymentBooking.id] && (
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
          )}
        </div>
      </Modal>

      {/* Cancel Booking Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => {
          if (!cancelBookingMutation.isLoading) {
            setShowCancelModal(false);
            setSelectedBooking(null);
          }
        }}
        onConfirm={() => {
          if (selectedBooking) {
            cancelBookingMutation.mutate({ 
              id: selectedBooking.id, 
              reason: 'Cancelled by customer' 
            });
          }
        }}
        title="Xác nhận hủy đặt phòng"
        message={`Bạn có chắc chắn muốn hủy đặt phòng ${translateRoomType(selectedBooking?.room_type)} (${selectedBooking?.room_number})? Hành động này không thể hoàn tác.`}
        confirmText="Hủy đặt phòng"
        cancelText="Trở lại"
        confirmVariant="error"
        isLoading={cancelBookingMutation.isLoading}
      />
    </div>
  );
};

export default MyBookings;
