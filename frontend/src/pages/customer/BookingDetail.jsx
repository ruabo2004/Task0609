import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  StatusBadge,
  Modal,
  ConfirmModal,
} from '@/components';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  UsersIcon,
  CreditCardIcon,
  HomeIcon,
  XMarkIcon,
  PencilIcon,
  PrinterIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * BookingDetail page - Detailed view of a specific booking
 */
const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch booking data from API
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const response = await apiService.bookings.getById(id);
        const bookingData = response.data.booking;
        
        // Calculate nights
        const checkInDate = new Date(bookingData.check_in_date);
        const checkOutDate = new Date(bookingData.check_out_date);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        // Transform the API data to match the expected format
        const transformedBooking = {
          id: bookingData.id,
          roomName: bookingData.room_name || `${bookingData.room_type} Room`,
          roomNumber: bookingData.room_number,
          roomType: bookingData.room_type,
          roomImages: Array.isArray(bookingData.room_images) && bookingData.room_images.length > 0 ? bookingData.room_images : [
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          ],
          checkIn: bookingData.check_in_date,
          checkOut: bookingData.check_out_date,
          status: bookingData.status,
          bookingDate: bookingData.created_at,
          bookingCode: `HST-${bookingData.id.toString().padStart(6, '0')}`,
          
          // Guest information
          guests: bookingData.guests_count,
          nights: nights,
          adults: bookingData.guests_count, // Assuming all guests are adults for now
          children: 0,
          
          // Pricing
          roomRate: bookingData.room_price || bookingData.price_per_night,
          serviceFees: bookingData.service_fees || 0,
          taxes: bookingData.taxes || 0,
          discount: bookingData.discount || 0,
          totalAmount: bookingData.total_amount,
          
          // Services
          additionalServices: Array.isArray(bookingData.services) ? bookingData.services : [],
          
          // Guest details
          guestInfo: {
            name: bookingData.customer_name || bookingData.user_name,
            email: bookingData.customer_email || bookingData.user_email,
            phone: bookingData.customer_phone || bookingData.user_phone || 'N/A',
            address: bookingData.customer_address || 'N/A',
          },
          
          // Special requests
          specialRequests: bookingData.special_requests || '',
          
          // Check-in/out times
          checkInTime: '14:00',
          checkOutTime: '12:00',
          
          // Policy
          cancellationPolicy: 'Miễn phí hủy phòng trong 24 giờ trước khi nhận phòng',
          
          // Payment
          paymentStatus: bookingData.payment_status || 'pending',
          paymentMethod: bookingData.payment_method || 'N/A',
          paymentDate: bookingData.payment_date || bookingData.created_at,
          
          // Review
          canReview: bookingData.status === 'completed' || bookingData.status === 'checked_out',
          hasReviewed: bookingData.has_reviewed || false,
        };
        
        setBooking(transformedBooking);
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        toast.error('Không thể tải thông tin đặt phòng');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Check for pending payments when booking is loaded
  useEffect(() => {
    if (booking) {
      checkPendingPayments();
    }
  }, [booking]);

  // Poll for payment status updates every 30 seconds if there's a pending payment
  useEffect(() => {
    let interval;
    if (pendingPayment) {
      interval = setInterval(() => {
        checkPendingPayments();
      }, 30000); // Check every 30 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [pendingPayment]);

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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date short
  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    try {
      await apiService.bookings.cancel(booking.id, 'Cancelled by customer');
      
      // Update local state
      setBooking(prev => ({ ...prev, status: 'cancelled' }));
      setShowCancelModal(false);
      toast.success('Đặt phòng đã được hủy thành công');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Không thể hủy đặt phòng. Vui lòng thử lại.');
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Check for pending payments
  const checkPendingPayments = async () => {
    try {
      const response = await apiService.payments.getAll({ 
        booking_id: booking.id,
        payment_status: 'pending',
        payment_method: 'additional_services'
      });
      
      if (response.data?.data?.payments?.length > 0) {
        const pendingPaymentData = response.data.data.payments[0];
        setPendingPayment({
          id: pendingPaymentData.id,
          amount: pendingPaymentData.amount,
          message: `Cần thanh toán thêm ${Number(pendingPaymentData.amount).toLocaleString('vi-VN')} VND cho dịch vụ bổ sung.`
        });
      } else {
        setPendingPayment(null);
      }
    } catch (error) {
      console.error('Error checking pending payments:', error);
    }
  };

  // Refresh booking data
  const refreshBooking = async () => {
    try {
      const response = await apiService.bookings.getById(id);
      const bookingData = response.data.booking;
      
      // Calculate nights
      const checkInDate = new Date(bookingData.check_in_date);
      const checkOutDate = new Date(bookingData.check_out_date);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      // Transform the API data to match the expected format
      const transformedBooking = {
        id: bookingData.id,
        roomName: bookingData.room_name || `${bookingData.room_type} Room`,
        roomNumber: bookingData.room_number,
        roomType: bookingData.room_type,
        roomImages: Array.isArray(bookingData.room_images) && bookingData.room_images.length > 0 ? bookingData.room_images : [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        ],
        checkIn: bookingData.check_in_date,
        checkOut: bookingData.check_out_date,
        status: bookingData.status,
        bookingDate: bookingData.created_at,
        bookingCode: `HST-${bookingData.id.toString().padStart(6, '0')}`,
        
        // Guest information
        guests: bookingData.guests_count,
        nights: nights,
        adults: bookingData.guests_count,
        children: 0,
        
        // Pricing
        roomRate: bookingData.room_price || bookingData.price_per_night,
        serviceFees: bookingData.service_fees || 0,
        taxes: bookingData.taxes || 0,
        discount: bookingData.discount || 0,
        totalAmount: bookingData.total_amount,
        
        // Services
        additionalServices: Array.isArray(bookingData.services) ? bookingData.services : [],
        
        // Guest details
        guestInfo: {
          name: bookingData.customer_name || bookingData.user_name,
          email: bookingData.customer_email || bookingData.user_email,
          phone: bookingData.customer_phone || bookingData.user_phone || 'N/A',
          address: bookingData.customer_address || 'N/A',
        },
        
        // Special requests
        specialRequests: bookingData.special_requests || '',
        
        // Check-in/out times
        checkInTime: '14:00',
        checkOutTime: '12:00',
        
        // Policy
        cancellationPolicy: 'Miễn phí hủy phòng trong 24 giờ trước khi nhận phòng',
        
        // Payment
        paymentStatus: bookingData.payment_status || 'pending',
        paymentMethod: bookingData.payment_method || 'N/A',
        paymentDate: bookingData.payment_date || bookingData.created_at,
        
        // Review
        canReview: bookingData.status === 'completed' || bookingData.status === 'checked_out',
        hasReviewed: bookingData.has_reviewed || false,
      };
      
      setBooking(transformedBooking);
    } catch (error) {
      console.error('Failed to refresh booking:', error);
    }
  };

  // Handle MoMo payment
  const handleMoMoPayment = async () => {
    if (!pendingPayment) return;

    try {
      setPaymentLoading(true);
      const response = await apiService.payments.createMomoPayment({
        booking_id: booking.id,
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
            const checkResponse = await apiService.payments.getAll({ 
              booking_id: booking.id,
              payment_status: 'completed',
              payment_method: 'additional_services'
            });
            
            if (checkResponse.data?.data?.payments?.length > 0) {
              clearInterval(paymentCheckInterval);
              setPendingPayment(null);
              await refreshBooking();
              toast.success('Thanh toán thành công! Dữ liệu đã được cập nhật.', {
                duration: 6000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #22c55e'
                }
              });
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
      setPaymentLoading(false);
    }
  };

  // Can cancel booking
  const canCancel = booking && ['pending', 'confirmed'].includes(booking.status);
  
  // Can modify booking
  const canModify = booking && ['pending'].includes(booking.status);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow h-64"></div>
              <div className="bg-white p-6 rounded-lg shadow h-48"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đặt phòng</h2>
        <p className="text-gray-600 mb-6">Đặt phòng bạn đang tìm kiếm không tồn tại.</p>
        <Button variant="primary" onClick={() => navigate('/customer/bookings')}>
          Quay lại danh sách đặt phòng
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={() => navigate('/customer/bookings')}
          >
            Quay lại danh sách
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đặt phòng #{booking.bookingCode}
            </h1>
            <p className="text-sm text-gray-600">
              Đặt vào ngày {formatDateShort(booking.bookingDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={booking.status} />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<PrinterIcon className="h-4 w-4" />}
            onClick={handlePrint}
          >
            In
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin phòng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={booking.roomImages[0]}
                    alt={booking.roomName}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {booking.roomName}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Số phòng:</span>
                      <span className="ml-2 font-medium">{booking.roomNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Loại phòng:</span>
                      <span className="ml-2 font-medium">{booking.roomType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Giờ nhận phòng:</span>
                      <span className="ml-2 font-medium">{booking.checkInTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Giờ trả phòng:</span>
                      <span className="ml-2 font-medium">{booking.checkOutTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết lưu trú</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Nhận phòng</p>
                      <p className="text-sm text-gray-600">{formatDate(booking.checkIn)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Trả phòng</p>
                      <p className="text-sm text-gray-600">{formatDate(booking.checkOut)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Khách</p>
                      <p className="text-sm text-gray-600">
                        {booking.adults} người lớn
                        {booking.children > 0 && `, ${booking.children} trẻ em`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <HomeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Thời gian lưu trú</p>
                      <p className="text-sm text-gray-600">
                        {booking.nights} đêm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {booking.specialRequests && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Yêu cầu đặc biệt</h4>
                  <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Họ tên:</span>
                  <span className="ml-2 font-medium">{booking.guestInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">{booking.guestInfo.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Điện thoại:</span>
                  <span className="ml-2 font-medium">{booking.guestInfo.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Địa chỉ:</span>
                  <span className="ml-2 font-medium">{booking.guestInfo.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          {booking.additionalServices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dịch vụ bổ sung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.additionalServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <span className="font-medium text-gray-900">{service.name}</span>
                        <span className="ml-2 text-sm text-gray-500">x{service.quantity}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(service.price * service.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {canModify && (
                  <Button
                    variant="secondary"
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                  >
                    Modify Booking
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="error"
                    leftIcon={<XMarkIcon className="h-4 w-4" />}
                    onClick={() => setShowCancelModal(true)}
                  >
                    Hủy đặt phòng
                  </Button>
                )}
                {booking.status === 'completed' && !booking.hasReviewed && (
                  <Button
                    variant="primary"
                    leftIcon={<StarIcon className="h-4 w-4" />}
                    onClick={() => setShowReviewModal(true)}
                  >
                    Viết đánh giá
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room rate ({booking.nights} nights)</span>
                  <span className="font-medium">{formatCurrency(booking.roomRate * booking.nights)}</span>
                </div>
                {booking.additionalServices.map((service, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{service.name}</span>
                    <span className="font-medium">{formatCurrency(service.price * service.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fees</span>
                  <span className="font-medium">{formatCurrency(booking.serviceFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium">{formatCurrency(booking.taxes)}</span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between text-success-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(booking.discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Trạng thái:</span>
                  <Badge variant={booking.paymentStatus === 'paid' ? 'success' : 'warning'}>
                    {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="font-medium">{booking.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày:</span>
                  <span className="font-medium">{formatDateShort(booking.paymentDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Chính sách hủy phòng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{booking.cancellationPolicy}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelBooking}
        title="Hủy đặt phòng"
        message={`Bạn có chắc chắn muốn hủy đặt phòng ${booking.roomName}? Hành động này không thể hoàn tác.`}
        confirmText="Hủy đặt phòng"
        confirmVariant="error"
      />
    </div>
  );
};

export default BookingDetail;
