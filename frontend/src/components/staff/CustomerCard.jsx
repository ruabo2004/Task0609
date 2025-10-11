import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const CustomerCard = ({ customer, onViewDetails }) => {
  const getLoyaltyColor = (level) => {
    switch (level) {
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getLoyaltyText = (level) => {
    switch (level) {
      case 'platinum':
        return 'Bạch Kim';
      case 'gold':
        return 'Vàng';
      case 'silver':
        return 'Bạc';
      case 'bronze':
        return 'Đồng';
      default:
        return 'Thường';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {customer.full_name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(customer.status)}>
                  {getStatusText(customer.status)}
                </Badge>
                <Badge className={getLoyaltyColor(customer.loyalty_level)}>
                  {getLoyaltyText(customer.loyalty_level)}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(customer)}
            className="flex items-center space-x-1"
          >
            <EyeIcon className="w-4 h-4" />
            <span>Chi tiết</span>
          </Button>
        </div>

        <div className="space-y-3">
          {/* Contact Information */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <EnvelopeIcon className="w-4 h-4" />
            <span>{customer.email}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4" />
            <span>{customer.phone}</span>
          </div>

          {customer.address && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                <CalendarDaysIcon className="w-4 h-4" />
                <span>Đặt phòng</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {customer.total_bookings || 0}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span>Tổng chi</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(customer.total_spent || 0)}
              </p>
            </div>
          </div>

          {/* Last Booking */}
          {customer.last_booking_date && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Đặt phòng gần nhất: <span className="font-medium text-gray-900">
                  {formatDate(customer.last_booking_date)}
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;


