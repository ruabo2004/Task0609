import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Modal from '../../components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  UserIcon, 
  HomeIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon as SearchIcon,
  FunnelIcon as FilterIcon,
  ArrowPathIcon as RefreshCwIcon,
  CurrencyDollarIcon as DollarSignIcon,
  WrenchScrewdriverIcon as ServiceIcon,
  BuildingOfficeIcon as BedIcon,
  PhoneIcon,
  EnvelopeIcon as MailIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { useBookings } from '@/hooks/useBookings';
import BookingStatusBadge from '@/components/staff/BookingStatusBadge';
import toast from 'react-hot-toast';

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

const BookingManagement = () => {
  const {
    bookings,
    loading,
    fetchBookings,
    updateBookingStatus,
    addServiceToBooking,
    removeServiceFromBooking,
    getBookingStats
  } = useBookings({}, { forStaff: true, immediate: true });
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceModalTab, setServiceModalTab] = useState('current');
  const [newService, setNewService] = useState({ service_id: '', name: '', price: 0, quantity: 1 });
  const [availableServices, setAvailableServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);
  const [selectedBookingServices, setSelectedBookingServices] = useState({});
  const bookingsRef = useRef(bookings);
  
  // Update ref when bookings change
  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);
  
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    date_from: '',
    date_to: '',
    room_id: ''
  });

  useEffect(() => {
    fetchBookings(filters);
  }, [filters, fetchBookings]);

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiService.services.getAll({ is_active: true });
        if (response.data && response.data.success) {
          const servicesData = response.data.data?.services || response.data.data || [];
          setAvailableServices(servicesData);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Không thể tải danh sách dịch vụ');
      }
    };
    fetchServices();
  }, []);

  // Handle cash payment for additional services
  const handleCashPayment = async (bookingId) => {
    try {
      setPaymentLoading(true);

      // Calculate total amount from services
      const services = selectedBookingServices[bookingId] || [];
      const amount = services.reduce((total, service) => {
        return total + Number(service.total_amount || service.total_price || service.price || 0);
      }, 0);
      
      if (amount === 0) {
        toast.error('Không tìm thấy dịch vụ để thanh toán');
        return;
      }
      
      // Create new payment for services
      const response = await apiService.payments.create({
        booking_id: bookingId,
        amount: amount,
        payment_method: 'cash',
        payment_status: 'completed',
        notes: `Thanh toán tiền mặt cho dịch vụ bổ sung - Booking #${bookingId}`
      });

      if (response.data && response.data.success) {
        toast.success('Thanh toán dịch vụ bổ sung thành công!');
        
        // Don't remove services - they should stay in the booking record as paid services
        // The backend has already updated all pending payments to completed
        
        // Close modal
        setShowPaymentModal(false);
        setSelectedPaymentBooking(null);
        
        // Clear selected booking services from UI state
        setSelectedBookingServices(prev => {
          const newSelectedBookingServices = { ...prev };
          delete newSelectedBookingServices[bookingId];
          return newSelectedBookingServices;
        });
        
        // Perform checkout - this should now succeed since payments are marked as completed
        try {
          await handleStatusChange(bookingId, 'checked_out');
          toast.success('Checkout thành công!');
        } catch (error) {
          console.error('Checkout error:', error);
          toast.error('Thanh toán thành công nhưng checkout thất bại. Vui lòng thử lại.');
        }
        
        // Refresh bookings to update UI
        await fetchBookings();
      } else {
        console.error('Cash payment failed:', response);
        toast.error('Không thể cập nhật thanh toán: ' + (response.data?.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Cash payment error:', error);
      toast.error('Lỗi khi thanh toán tiền mặt');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // No need to check pending payments since we handle this in the checkout flow

      const result = await updateBookingStatus(bookingId, newStatus);
      if (newStatus === 'checked_out' && result?.requiresPayment) {
        // Checkout blocked due to unpaid services
        if (result.error) {
          // Error message already shown in useBookings hook

        } else {
          // Payment required - show error message
          toast.error('Cần thanh toán dịch vụ bổ sung trước khi checkout');
        }
      } else {
        toast.success('Cập nhật trạng thái thành công');
        fetchBookings();
      }
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  // Load services of a booking (used when opening the modal or switching tab)
  const loadBookingServices = async (bookingId) => {
    if (!bookingId) return;
    try {
      setServicesLoading(true);
      const res = await apiService.bookings.getServices(bookingId);
      if (res.data && res.data.success) {
        const services = res.data.data?.services || res.data.data || [];
        setSelectedBooking(prev => (prev ? { ...prev, services } : prev));
      }
    } catch (e) {
      console.error('Failed to load booking services:', e);
      toast.error('Không thể tải dịch vụ của đặt phòng');
    } finally {
      setServicesLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.service_id || !newService.name || newService.price <= 0) {
      toast.error('Vui lòng chọn dịch vụ và nhập giá hợp lệ');
      return;
    }

    const serviceData = {
      service_id: newService.service_id,
      quantity: newService.quantity
    };

    const success = await addServiceToBooking(selectedBooking.id, serviceData);
    if (success) {
      setNewService({ service_id: '', name: '', price: 0, quantity: 1 });
      // Refresh bookings only
      await fetchBookings();
    }
  };

  const handleServiceSelect = (serviceId) => {
    if (!serviceId || serviceId === '') {
      // Don't reset if already empty
      if (newService.service_id === '') {
        return;
      }
      setNewService({ service_id: '', name: '', price: 0, quantity: 1 });
      return;
    }
    
    const service = availableServices.find(s => s.id === parseInt(serviceId));
    
    if (service) {
      const parsedPrice = parseFloat(service.price);
      const serviceData = {
        service_id: service.id,
        name: service.name, 
        price: parsedPrice,
        quantity: newService.quantity || 1
      };
      setNewService(serviceData);
    }
  };

  const refreshSelectedBooking = () => {
    if (selectedBooking) {
      const updatedBooking = bookings.find(b => b.id === selectedBooking.id);
      if (updatedBooking) {
        setSelectedBooking(updatedBooking);
      }
    }
  };

  // Refresh selected booking when bookings change
  useEffect(() => {
    refreshSelectedBooking();
  }, [bookings]); // eslint-disable-line react-hooks/exhaustive-deps

  // Format date to Vietnamese format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const canCheckIn = (b) => {
    if (!b?.check_in_date) return false;
    const today = new Date();
    const checkIn = new Date(b.check_in_date);
    today.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);
    return checkIn <= today;
  };

  const BookingCard = ({ booking }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{booking.booking_code}</h3>
            <p className="text-gray-600">{booking.customer_name || booking.user_name || 'N/A'}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Phòng {booking.room_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSignIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{Number(booking.total_amount || 0).toLocaleString('vi-VN')} VND</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{formatDate(booking.check_in_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{formatDate(booking.check_out_date)}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedBooking(booking);
              setShowBookingDetail(true);
            }}
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            Chi tiết
          </Button>

          {booking.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => handleStatusChange(booking.id, 'confirmed')}
            >
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Xác nhận
            </Button>
          )}

          {booking.status === 'confirmed' && (
            <Button
              size="sm"
              variant="secondary"
              disabled={!canCheckIn(booking)}
              title={!canCheckIn(booking) ? 'Chỉ check-in vào ngày nhận phòng hoặc muộn hơn' : undefined}
              onClick={() => handleStatusChange(booking.id, 'checked_in')}
            >
              <BedIcon className="w-4 h-4 mr-1" />
              Check-in
            </Button>
          )}

          {booking.status === 'checked_in' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                // Check if booking has additional services
                try {
                  const servicesResponse = await apiService.bookings.getServices(booking.id);

                  // Extract services array from response
                  const servicesData = servicesResponse.data?.data?.services || servicesResponse.data?.data || [];

                  if (Array.isArray(servicesData) && servicesData.length > 0) {
                    // Has services - show payment modal

                    setSelectedBookingServices(prev => ({
                      ...prev,
                      [booking.id]: servicesData
                    }));
                    setSelectedPaymentBooking(booking);
                    setShowPaymentModal(true);
                  } else {
                    // No services - checkout directly

                    await handleStatusChange(booking.id, 'checked_out');
                  }
                } catch (error) {
                  console.error('Error checking services for checkout:', error);
                  // Fallback: try checkout directly
                  await handleStatusChange(booking.id, 'checked_out');
                }
              }}
            >
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Check-out
            </Button>
          )}

          {['pending', 'confirmed'].includes(booking.status) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusChange(booking.id, 'cancelled')}
            >
              <XCircleIcon className="w-4 h-4 mr-1" />
              Hủy
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedBooking(booking);
              setServiceModalTab('current'); // Reset to current tab
              setShowServiceModal(true);
              // Always fetch fresh services when opening
              loadBookingServices(booking.id);
            }}
          >
            <ServiceIcon className="w-4 h-4 mr-1" />
            Dịch vụ
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const BookingDetailModal = () => (
    <Dialog open={showBookingDetail} onOpenChange={setShowBookingDetail}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết đặt phòng {selectedBooking?.booking_code}</DialogTitle>
        </DialogHeader>

        {selectedBooking && (
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Họ tên</label>
                  <p className="font-medium">{selectedBooking.customer_name || selectedBooking.user_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4" />
                    {selectedBooking.customer_email || selectedBooking.user_email || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    {selectedBooking.customer_phone || selectedBooking.user_phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">
                    <BookingStatusBadge status={selectedBooking.status} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Thông tin đặt phòng
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phòng</label>
                  <p className="font-medium">{selectedBooking.room_number} - {translateRoomType(selectedBooking.room_type) || selectedBooking.room_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
                  <p className="font-medium text-green-600">{Number(selectedBooking.total_amount || 0).toLocaleString('vi-VN')} VND</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Check-in</label>
                  <p className="font-medium">{formatDate(selectedBooking.check_in_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Check-out</label>
                  <p className="font-medium">{formatDate(selectedBooking.check_out_date)}</p>
                </div>
                {selectedBooking.special_requests && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Yêu cầu đặc biệt</label>
                    <p className="font-medium">{selectedBooking.special_requests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ServiceIcon className="w-5 h-5" />
                  Dịch vụ bổ sung
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBooking.services && selectedBooking.services.length > 0 ? (
                  <div className="space-y-2">
                    {selectedBooking.services.map((service) => (
                      <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-500">Số lượng: {service.quantity}</p>
                        </div>
                        <p className="font-medium">${service.price * service.quantity}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có dịch vụ bổ sung</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const ServiceManagementModal = () => (
    <Dialog open={showServiceModal} onOpenChange={(open) => {
      setShowServiceModal(open);
      if (open && selectedBooking?.id) {
        loadBookingServices(selectedBooking.id);
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quản lý dịch vụ - {selectedBooking?.booking_code}</DialogTitle>
        </DialogHeader>

        <Tabs value={serviceModalTab} onValueChange={(val) => {
          setServiceModalTab(val);
          if (val === 'current' && selectedBooking?.id) {
            loadBookingServices(selectedBooking.id);
          }
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Dịch vụ hiện tại</TabsTrigger>
            <TabsTrigger value="add">Thêm dịch vụ</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {servicesLoading ? (
              <p className="text-center text-gray-500 py-8">Đang tải dịch vụ...</p>
            ) : selectedBooking?.services && selectedBooking.services.length > 0 ? (
              selectedBooking.services.map((service) => (
                <div key={service.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-500">
                      {Number(service.unit_price || service.price || 0).toLocaleString('vi-VN')} VND x {service.quantity} = {Number(service.total_price || (service.unit_price || service.price || 0) * service.quantity).toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={async () => {
                      const ok = await removeServiceFromBooking(selectedBooking.id, service.id);
                      if (ok && selectedBooking?.id) {
                        await loadBookingServices(selectedBooking.id);
                        // Refresh bookings
                        await fetchBookings();
                      }
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có dịch vụ nào</p>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Dịch vụ</label>
                <select 
                  value={newService.service_id || ''}
                  onChange={(e) => handleServiceSelect(e.target.value)}
                  className="h-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Chọn dịch vụ</option>
                  {availableServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {parseFloat(service.price).toLocaleString('vi-VN')} VND
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Số lượng</label>
                <Input 
                  type="number" 
                  min="1" 
                  value={newService.quantity}
                  onChange={(e) => setNewService(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            
            {newService.service_id && newService.name && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900">{newService.name}</p>
                <p className="text-sm text-blue-700 mt-1">
                  Đơn giá: {Number(newService.price || 0).toLocaleString('vi-VN')} VND
                </p>
                <p className="text-sm text-blue-700">
                  Số lượng: {newService.quantity || 1}
                </p>
                <p className="text-base font-semibold text-blue-900 mt-2">
                  Tổng: {(Number(newService.price || 0) * Number(newService.quantity || 1)).toLocaleString('vi-VN')} VND
                </p>
              </div>
            )}
            
            <Button 
              type="button"
              className="w-full" 
              onClick={handleAddService}
              disabled={!newService.name}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Thêm dịch vụ
            </Button>

          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đặt phòng</h1>
          <p className="text-gray-600">Quản lý tất cả đơn đặt phòng và dịch vụ</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchBookings} disabled={loading}>
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tìm kiếm</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tên khách, mã booking, phòng..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Trạng thái</label>
              <select 
                value={filters.status || "all"} 
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value === "all" ? "" : e.target.value }))}
                className="h-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="checked_in">Đã check-in</option>
                <option value="checked_out">Đã check-out</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Từ ngày</label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Đến ngày</label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getBookingStats().pending}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getBookingStats().confirmed}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang ở</p>
                <p className="text-2xl font-bold text-green-600">
                  {getBookingStats().checked_in}
                </p>
              </div>
              <BedIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-600">
                  ${getBookingStats().total_revenue.toFixed(2)}
                </p>
              </div>
              <DollarSignIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : bookings.length > 0 ? (
          bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đặt phòng nào</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc để xem thêm kết quả</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <BookingDetailModal />
      <ServiceManagementModal />
      
      {/* QR Code Payment Modal */}

      {/* Payment Modal */}
      {showPaymentModal && selectedPaymentBooking && (
        <Modal isOpen={showPaymentModal} onClose={() => {
          setShowPaymentModal(false);
          setSelectedPaymentBooking(null);
        }}>
          <div className="bg-white rounded-lg p-6 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Checkout - Thanh toán dịch vụ bổ sung
              </h3>
              <p className="text-gray-600 mb-4">
                Booking #{selectedPaymentBooking.id} - {selectedPaymentBooking.customer_name}
              </p>
            </div>

            {/* Room Information */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Thông tin phòng</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phòng:</span>
                  <span className="text-sm font-medium">{selectedPaymentBooking.room_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Loại phòng:</span>
                  <span className="text-sm font-medium">{selectedPaymentBooking.room_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Giá phòng:</span>
                  <span className="text-sm font-medium">
                    {Number(selectedPaymentBooking.total_amount).toLocaleString('vi-VN')} VND
                  </span>
                </div>
              </div>
            </div>

            {/* Services Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Dịch vụ bổ sung</h4>
              {selectedBookingServices[selectedPaymentBooking.id] && selectedBookingServices[selectedPaymentBooking.id].length > 0 ? (
                <div className="space-y-2">
                  {selectedBookingServices[selectedPaymentBooking.id].map((service, index) => {
                    const serviceName = service.service_name || service.name || 'Dịch vụ';
                    const serviceAmount = service.total_amount || service.total_price || (service.unit_price * service.quantity) || 0;
                    return (
                      <div key={index} className="flex justify-between items-center py-1">
                        <div className="text-sm text-gray-700">
                          <span>{serviceName}</span>
                          {service.quantity && <span className="text-gray-500"> x{service.quantity}</span>}
                        </div>
                        <span className="text-sm font-medium">
                          {Number(serviceAmount).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">Tổng dịch vụ:</span>
                      <span className="text-sm font-bold text-gray-900">
                        {(() => {
                          const total = selectedBookingServices[selectedPaymentBooking.id]?.reduce((sum, service) => 
                            sum + Number(service.total_amount), 0) || 0;
                          return Number(total).toLocaleString('vi-VN') + ' VND';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Không có dịch vụ bổ sung</p>
              )}
            </div>

            {/* Total Amount */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Tổng cần thanh toán:</span>
                <span className="text-xl font-bold text-green-600">
                  {(() => {
                    const services = selectedBookingServices[selectedPaymentBooking.id] || [];
                    const amount = services.reduce((total, service) => {
                      return total + Number(service.total_amount || service.total_price || service.price || 0);
                    }, 0);
                    return Number(amount).toLocaleString('vi-VN') + ' VND';
                  })()}
                </span>
              </div>
            </div>
            
            {/* Payment Button */}
            <div className="space-y-3">
              <Button
                onClick={() => handleCashPayment(selectedPaymentBooking.id)}
                disabled={paymentLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
              >
                {paymentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Xác nhận đã thanh toán & Checkout
                  </>
                )}
              </Button>
            </div>
            
            {/* Close Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentBooking(null);
                }}
                className="w-full"
              >
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BookingManagement;