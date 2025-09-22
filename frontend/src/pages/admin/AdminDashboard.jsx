import React, { useState, useEffect } from "react";
import { useAuth } from "@contexts/AuthContext";
import {
  Users,
  UserCheck,
  Building,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
} from "lucide-react";
import LoadingSpinner from "@components/Common/LoadingSpinner";

/**
 * Admin Dashboard Component
 * Main dashboard for admin users with overview stats and management links
 */
const AdminDashboard = () => {
  const { user, getUserName } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API call - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setDashboardData({
          stats: {
            totalCustomers: 156,
            totalEmployees: 12,
            totalRooms: 25,
            occupancyRate: 85,
            monthlyRevenue: 125000000,
            todayCheckIns: 8,
            todayCheckOuts: 5,
            pendingBookings: 23,
          },
          recentActivities: [
            {
              id: 1,
              type: "booking",
              description: "Khách hàng Nguyễn Văn An đặt phòng Deluxe",
              time: "10 phút trước",
              status: "success",
            },
            {
              id: 2,
              type: "payment",
              description: "Thanh toán booking #BK20250101000001 thành công",
              time: "25 phút trước",
              status: "success",
            },
            {
              id: 3,
              type: "checkin",
              description: "Check-in phòng 301 bởi lễ tân Mai",
              time: "1 giờ trước",
              status: "info",
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải dashboard..." />
      </div>
    );
  }

  const { stats, recentActivities } = dashboardData;

  const statCards = [
    {
      title: "Tổng khách hàng",
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      title: "Nhân viên",
      value: stats.totalEmployees,
      icon: UserCheck,
      color: "bg-green-500",
      trend: "+2",
    },
    {
      title: "Tổng phòng",
      value: stats.totalRooms,
      icon: Building,
      color: "bg-purple-500",
      trend: "100%",
    },
    {
      title: "Tỷ lệ lấp đầy",
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      color: "bg-orange-500",
      trend: "+5%",
    },
    {
      title: "Doanh thu tháng",
      value: `${(stats.monthlyRevenue / 1000000).toFixed(0)}M VND`,
      icon: DollarSign,
      color: "bg-green-600",
      trend: "+18%",
    },
    {
      title: "Check-in hôm nay",
      value: stats.todayCheckIns,
      icon: Calendar,
      color: "bg-indigo-500",
      trend: `${stats.todayCheckOuts} check-out`,
    },
  ];

  const quickActions = [
    {
      title: "Quản lý khách hàng",
      description: "Xem và quản lý thông tin khách hàng",
      href: "/admin/customers",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Quản lý nhân viên",
      description: "Thêm, sửa, xóa thông tin nhân viên",
      href: "/admin/employees",
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      title: "Quản lý phòng",
      description: "Cập nhật trạng thái và thông tin phòng",
      href: "/admin/rooms",
      icon: Building,
      color: "bg-purple-500",
    },
    {
      title: "Báo cáo",
      description: "Xem báo cáo doanh thu và thống kê",
      href: "/admin/reports",
      icon: BarChart3,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Admin
              </h1>
              <p className="text-gray-600 mt-1">
                Chào mừng {getUserName()}, chúc bạn một ngày làm việc hiệu quả!
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 mt-1">{stat.trend}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Thao tác nhanh
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className="group p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center mb-3">
                        <div className={`${action.color} p-2 rounded-lg mr-3`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                          {action.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Hoạt động gần đây
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div
                      className={`
                      w-2 h-2 rounded-full mt-2 flex-shrink-0
                      ${
                        activity.status === "success"
                          ? "bg-green-400"
                          : activity.status === "info"
                          ? "bg-blue-400"
                          : "bg-gray-400"
                      }
                    `}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <a
                  href="/admin/activities"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Xem tất cả hoạt động →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
