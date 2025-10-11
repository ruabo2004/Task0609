import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  UsersIcon, 
  HomeIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [topRooms, setTopRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, revenueRes, topRoomsRes] = await Promise.all([
        apiService.admin.dashboard.getOverview(),
        apiService.admin.dashboard.getRevenue({ period: 'monthly' }),
        apiService.admin.dashboard.getTopRooms({ limit: 5 })
      ]);

      // Backend returns { success, message, data }
      setOverview(overviewRes.data?.data || overviewRes.data);
      setRevenue(revenueRes.data?.data || revenueRes.data);
      setTopRooms(topRoomsRes.data?.data || topRoomsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-lg font-bold mt-2 whitespace-nowrap overflow-hidden text-ellipsis">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                )}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 bg-${color}-100 rounded-lg flex-shrink-0`}>
            <Icon className={`w-8 h-8 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống quản lý</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(overview?.totalRevenue || 0)}
          icon={CurrencyDollarIcon}
          trend={overview?.revenueGrowth}
          color="green"
        />
        <StatCard
          title="Tổng Booking"
          value={overview?.totalBookings || 0}
          icon={ChartBarIcon}
          color="blue"
        />
        <StatCard
          title="Phòng Khả Dụng"
          value={`${overview?.availableRooms || 0}/${overview?.totalRooms || 0}`}
          icon={HomeIcon}
          color="purple"
        />
        <StatCard
          title="Khách Hàng"
          value={overview?.totalCustomers || 0}
          icon={UsersIcon}
          color="orange"
        />
      </div>

      {/* Revenue Chart & Top Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh Thu Theo Tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {revenue?.data && revenue.data.length > 0 && revenue?.labels ? (
              <div className="space-y-4">
                {revenue.labels.map((label, index) => (
                  <div key={`revenue-${index}-${label}`} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="font-semibold">{formatCurrency(revenue.data[index])}</span>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Tổng:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(revenue?.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
            )}
          </CardContent>
        </Card>

        {/* Top Rooms */}
        <Card>
          <CardHeader>
            <CardTitle>Top Phòng</CardTitle>
          </CardHeader>
          <CardContent>
            {topRooms && topRooms.length > 0 ? (
              <div className="space-y-4">
                {topRooms.map((room, index) => (
                  <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">Phòng {room.room_number}</p>
                        <p className="text-sm text-gray-600">{room.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(room.revenue)}
                      </p>
                      {room.rating && (
                        <p className="text-sm text-gray-600">★ {room.rating}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Thống Kê Nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{overview?.totalStaff || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Nhân viên</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{overview?.bookingsThisMonth || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Booking tháng này</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {overview?.occupancyRate || 0}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Tỷ lệ lấp đầy</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{overview?.totalRooms || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Tổng phòng</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
