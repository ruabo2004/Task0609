import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ClockIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    caHomNay: [],
    nhiemVuDuocGiao: [],
    datPhongGanDay: [],
    chiSoHieuSuat: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user has staff role
      if (user?.role !== 'staff' && user?.role !== 'admin') {
        toast.error(`Bạn cần có quyền nhân viên để truy cập trang này. Role hiện tại: ${user?.role || 'không xác định'}`);
        setLoading(false);
        return;
      }
      
      // Fetch data from simplified endpoints (per yêu cầu.txt)
      const [bookingsRes, roomStatsRes, bookingStatsRes] = await Promise.allSettled([
        apiService.bookings.getAll({ limit: 5, sort: 'created_at:desc' }),
        apiService.rooms.getStats(),
        apiService.bookings.getStats()
      ]);

      // Handle API results with proper error handling
      const handleResult = (result, fallback = [], dataPath = 'data') => {
        if (result.status === 'fulfilled') {
          const response = result.value;
          if (response.data && response.data.success) {
            const data = dataPath === 'data' ? response.data.data : response.data[dataPath];
            return Array.isArray(data) ? data : (data ? [data] : fallback);
          } else {
            return fallback;
          }
        } else if (result.reason?.response?.status === 403) {
          return fallback;
        } else {
          console.error('API error:', result.reason);
          return fallback;
        }
      };

      // Sample data for demonstration when API returns empty
      const sampleTasks = [
        {
          id: 1,
          title: 'Dọn dẹp phòng 101',
          description: 'Dọn dẹp sâu phòng 101 sau khi khách trả phòng',
          priority: 'cao',
          status: 'cho_xu_ly',
          due_date: '2025-10-07'
        },
        {
          id: 2,
          title: 'Kiểm tra kho',
          description: 'Kiểm tra và cập nhật kho tiện nghi phòng',
          priority: 'trung_binh',
          status: 'dang_xu_ly',
          due_date: '2025-10-08'
        },
        {
          id: 3,
          title: 'Chào đón khách VIP',
          description: 'Chuẩn bị gói chào đón cho khách VIP',
          priority: 'cao',
          status: 'cho_xu_ly',
          due_date: '2025-10-06'
        }
      ];

      const sampleShifts = [
        {
          id: 1,
          shift_date: '2025-10-06',
          start_time: '08:00:00',
          end_time: '16:00:00',
          shift_type: 'sáng',
          status: 'đã_lên_lịch'
        },
        {
          id: 2,
          shift_date: '2025-10-07',
          start_time: '14:00:00',
          end_time: '22:00:00',
          shift_type: 'chiều',
          status: 'đã_lên_lịch'
        }
      ];

      const sampleBookings = [
        {
          id: 1,
          customer_name: 'Nguyễn Văn A',
          room_number: '101',
          check_in_date: '2025-10-05',
          check_out_date: '2025-10-07',
          total_amount: 150.00,
          status: 'đã_xác_nhận'
        },
        {
          id: 2,
          customer_name: 'Trần Thị B',
          room_number: '102',
          check_in_date: '2025-10-06',
          check_out_date: '2025-10-08',
          total_amount: 200.00,
          status: 'đã_xác_nhận'
        }
      ];

      // Process API results
      const bookingsData = handleResult(bookingsRes, []);
      const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.bookings || []);
      
      // Extract room stats from API response
      let roomStats = {};
      if (roomStatsRes.status === 'fulfilled' && roomStatsRes.value?.data?.success) {
        const stats = roomStatsRes.value.data.data.statistics || {};
        roomStats = {
          total: stats.total_rooms || 0,
          available: stats.available_rooms || 0,
          occupied: stats.occupied_rooms || 0,
          maintenance: stats.maintenance_rooms || 0,
          occupancy_rate: stats.total_rooms > 0 
            ? Math.round((stats.occupied_rooms / stats.total_rooms) * 100) 
            : 0
        };
      }
      
      // Extract booking stats from API response
      let bookingStats = {};
      if (bookingStatsRes.status === 'fulfilled' && bookingStatsRes.value?.data?.success) {
        const stats = bookingStatsRes.value.data.data.statistics || {};
        bookingStats = {
          total: stats.total_bookings || 0,
          pending: stats.pending_bookings || 0,
          confirmed: stats.confirmed_bookings || 0,
          checked_in: stats.checked_in_bookings || 0,
          completed: stats.completed_bookings || 0,
          cancelled: stats.cancelled_bookings || 0,
          total_revenue: stats.total_revenue || 0,
          average_booking_value: stats.average_booking_value || 0
        };
      }
      
      // Simplified metrics (per yêu cầu.txt - only booking management)
      const combinedMetrics = {
        roomStats: roomStats,
        bookingStats: bookingStats,
      };

      setDashboardData({
        caHomNay: [], // Removed - not in requirements
        nhiemVuDuocGiao: [], // Removed - not in requirements
        datPhongGanDay: bookings, // Always use DB data, even if empty
        chiSoHieuSuat: combinedMetrics
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getShiftStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTaskPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
      thap: 'bg-gray-100 text-gray-800',
      trung_binh: 'bg-blue-100 text-blue-800',
      cao: 'bg-orange-100 text-orange-800',
      khan_cap: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      cho_xu_ly: 'bg-yellow-100 text-yellow-800',
      dang_xu_ly: 'bg-blue-100 text-blue-800',
      hoan_thanh: 'bg-green-100 text-green-800',
      da_huy: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Check if user has staff role
  if (user?.role !== 'staff' && user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần có quyền nhân viên để truy cập trang Staff Dashboard.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Để truy cập trang này:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Đăng nhập với tài khoản nhân viên</li>
              <li>• Hoặc liên hệ admin để cấp quyền staff</li>
            </ul>
          </div>
          <div className="space-x-4">
            <Button 
              onClick={() => window.location.href = '/auth/login'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Đăng nhập lại
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Chào mừng, {user?.full_name}! 👋
        </h1>
        <p className="text-blue-100">
          Hôm nay là {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Quick Stats - Simplified for booking management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đặt phòng gần đây</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.datPhongGanDay.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <HomeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Phòng trống</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.chiSoHieuSuat?.roomStats?.available || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tỷ lệ lấp đầy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.chiSoHieuSuat?.roomStats?.occupancy_rate || 
                   dashboardData.chiSoHieuSuat?.bookingStats?.occupancy_rate || '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats from API */}
      {(dashboardData.chiSoHieuSuat?.roomStats || dashboardData.chiSoHieuSuat?.bookingStats) && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {dashboardData.chiSoHieuSuat?.roomStats && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tổng phòng</p>
                    <p className="text-xl font-bold text-gray-900">
                      {dashboardData.chiSoHieuSuat.roomStats.total || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Đang sử dụng</p>
                    <p className="text-xl font-bold text-blue-600">
                      {dashboardData.chiSoHieuSuat.roomStats.occupied || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Bảo trì</p>
                    <p className="text-xl font-bold text-orange-600">
                      {dashboardData.chiSoHieuSuat.roomStats.maintenance || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {dashboardData.chiSoHieuSuat?.bookingStats && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Chờ xác nhận</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {dashboardData.chiSoHieuSuat.bookingStats.pending || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HomeIcon className="h-5 w-5 mr-2 text-green-600" />
              Đặt Phòng Gần Đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.datPhongGanDay.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.datPhongGanDay.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Phòng {booking.room_number} - {booking.customer_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.check_in_date).toLocaleDateString('vi-VN')} - 
                        {new Date(booking.check_out_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Badge className={`${
                      booking.status === 'confirmed' || booking.status === 'đã_xác_nhận' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' || booking.status === 'chờ_xác_nhận' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Đã xác nhận' : 
                       booking.status === 'pending' ? 'Chờ xác nhận' :
                       booking.status === 'checked_in' ? 'Đã check-in' :
                       booking.status === 'checked_out' ? 'Đã check-out' :
                       booking.status === 'cancelled' ? 'Đã hủy' :
                       booking.status === 'đã_xác_nhận' ? 'Đã xác nhận' : 
                       booking.status === 'chờ_xác_nhận' ? 'Chờ xác nhận' : 
                       booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không có đặt phòng mới</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
              Thống Kê Đặt Phòng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Tổng đặt phòng</span>
                <span className="text-sm font-bold text-gray-900">
                  {dashboardData.chiSoHieuSuat?.bookingStats?.total || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Chờ xác nhận</span>
                <span className="text-sm font-bold text-yellow-600">
                  {dashboardData.chiSoHieuSuat?.bookingStats?.pending || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Đã xác nhận</span>
                <span className="text-sm font-bold text-green-600">
                  {dashboardData.chiSoHieuSuat?.bookingStats?.confirmed || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;