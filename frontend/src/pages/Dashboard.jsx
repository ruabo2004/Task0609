import React from "react";
import { useAuth } from "@contexts/AuthContext";
import { Calendar, CreditCard, Home, User } from "lucide-react";

/**
 * Dashboard Page
 * User dashboard with overview and quick actions
 */
const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: "Booking hiện tại",
      value: "3",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Thanh toán",
      value: "12",
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Homestay yêu thích",
      value: "8",
      icon: Home,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "Điểm thành viên",
      value: "1,250",
      icon: User,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Xin chào, {user?.full_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Chào mừng bạn trở lại. Đây là tổng quan về tài khoản của bạn.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Booking gần đây
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có booking nào</p>
                <button className="mt-4 text-primary-600 hover:text-primary-800 font-medium">
                  Tìm homestay ngay
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Thao tác nhanh
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Tìm homestay</p>
                    <p className="text-sm text-gray-500">
                      Khám phá những nơi ở tuyệt vời
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Lịch sử booking</p>
                    <p className="text-sm text-gray-500">
                      Xem các chuyến đi đã qua
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Quản lý thanh toán
                    </p>
                    <p className="text-sm text-gray-500">
                      Xem lịch sử giao dịch
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Cài đặt tài khoản
                    </p>
                    <p className="text-sm text-gray-500">
                      Cập nhật thông tin cá nhân
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
