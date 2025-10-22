import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

const StaffProfile = () => {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hồ Sơ Của Tôi</h1>
        <p className="text-gray-600">Xem thông tin tài khoản của bạn</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>Thông Tin Tài Khoản</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.full_name}</h2>
              <Badge className="mt-1 bg-blue-100 text-blue-800">
                {user.role === 'staff' ? 'Nhân Viên' : user.role === 'admin' ? 'Quản Trị Viên' : 'Khách Hàng'}
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="flex items-start space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-start space-x-3">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Số Điện Thoại</p>
                  <p className="text-sm text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}

            {user.id_number && (
              <div className="flex items-start space-x-3">
                <IdentificationIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Số CMND/CCCD</p>
                  <p className="text-sm text-gray-900 font-mono">{user.id_number}</p>
                </div>
              </div>
            )}

            {user.nationality && (
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Quốc Tịch</p>
                  <p className="text-sm text-gray-900">{user.nationality}</p>
                </div>
              </div>
            )}
          </div>

          {/* Account Details */}
          {(user.created_at || user.address) && (
            <div className="border-t pt-6 space-y-3">
              {user.address && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Địa Chỉ</p>
                  <p className="text-sm text-gray-900">{user.address}</p>
                </div>
              )}
              {user.created_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngày Tham Gia:</span>
                  <span className="text-gray-900">{formatDate(user.created_at)}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          📝 Để cập nhật thông tin hồ sơ của bạn, vui lòng liên hệ quản trị viên.
        </p>
      </div>
    </div>
  );
};

export default StaffProfile;

