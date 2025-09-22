import React, { useState, useEffect } from "react";
import { useAuth } from "@contexts/AuthContext";
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Bed,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import LoadingSpinner from "@components/Common/LoadingSpinner";

/**
 * Staff Dashboard Component
 * Main dashboard for staff users with daily tasks and quick actions
 */
const StaffDashboard = () => {
  const { user, getUserName } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API call - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setDashboardData({
          todayStats: {
            checkInsToday: 8,
            checkOutsToday: 5,
            totalGuests: 45,
            availableRooms: 7,
            pendingRequests: 3,
            completedTasks: 12,
          },
          todaySchedule: [
            {
              id: 1,
              time: "09:00",
              type: "checkin",
              guest: "Nguyễn Văn An",
              room: "301",
              status: "pending",
            },
            {
              id: 2,
              time: "11:00",
              type: "checkout",
              guest: "Trần Thị Bình",
              room: "205",
              status: "completed",
            },
            {
              id: 3,
              time: "14:30",
              type: "checkin",
              guest: "Lê Minh Cường",
              room: "402",
              status: "pending",
            },
            {
              id: 4,
              time: "16:00",
              type: "maintenance",
              guest: "Bảo trì phòng",
              room: "101",
              status: "pending",
            },
          ],
          quickTasks: [
            {
              id: 1,
              title: "Kiểm tra phòng 205 sau checkout",
              priority: "high",
              dueTime: "12:00",
            },
            {
              id: 2,
              title: "Chuẩn bị phòng 301 cho khách mới",
              priority: "medium",
              dueTime: "08:30",
            },
            {
              id: 3,
              title: "Cập nhật báo cáo ca làm việc",
              priority: "low",
              dueTime: "17:00",
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

  const { todayStats, todaySchedule, quickTasks } = dashboardData;

  const statCards = [
    {
      title: "Check-in hôm nay",
      value: todayStats.checkInsToday,
      icon: CheckCircle,
      color: "bg-green-500",
      description: "khách hàng",
    },
    {
      title: "Check-out hôm nay",
      value: todayStats.checkOutsToday,
      icon: Clock,
      color: "bg-blue-500",
      description: "khách hàng",
    },
    {
      title: "Tổng khách hiện tại",
      value: todayStats.totalGuests,
      icon: Users,
      color: "bg-purple-500",
      description: "người",
    },
    {
      title: "Phòng trống",
      value: todayStats.availableRooms,
      icon: Bed,
      color: "bg-orange-500",
      description: "phòng",
    },
  ];

  const quickActions = [
    {
      title: "Quản lý Booking",
      description: "Xem và xử lý các booking",
      href: "/staff/bookings",
      icon: ClipboardList,
      color: "bg-blue-500",
    },
    {
      title: "Check-in/Check-out",
      description: "Thực hiện check-in và check-out",
      href: "/staff/checkin",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "Báo cáo ca làm",
      description: "Tạo báo cáo ca làm việc",
      href: "/staff/reports",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      title: "Yêu cầu bảo trì",
      description: "Gửi yêu cầu bảo trì phòng",
      href: "/staff/maintenance",
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "checkin":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "checkout":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "maintenance":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Nhân Viên
              </h1>
              <p className="text-gray-600 mt-1">
                Chào mừng {getUserName()}, hãy bắt đầu ca làm việc mới!
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Ca làm việc: {new Date().toLocaleDateString("vi-VN")}
              </div>
              <div className="text-lg font-medium text-gray-900">
                {new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    <p className="text-sm text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Lịch trình hôm nay
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full border-2 border-gray-200">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.guest}
                        </p>
                        <p className="text-sm text-gray-600">
                          Phòng {item.room} • {item.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${getStatusColor(item.status)}
                    `}
                    >
                      {item.status === "pending"
                        ? "Chờ xử lý"
                        : item.status === "completed"
                        ? "Hoàn thành"
                        : item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Thao tác nhanh
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <a
                        key={index}
                        href={action.href}
                        className="group flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                      >
                        <div
                          className={`${action.color} p-2 rounded-lg mr-3 flex-shrink-0`}
                        >
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 group-hover:text-primary-600 text-sm">
                            {action.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Nhiệm vụ cần làm
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {quickTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`
                      border-l-4 p-3 rounded-r-lg
                      ${getPriorityColor(task.priority)}
                    `}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {task.title}
                        </p>
                        <span className="text-xs text-gray-500">
                          {task.dueTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <a
                    href="/staff/tasks"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Xem tất cả nhiệm vụ →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
