import React from 'react';
import { Badge } from '@/components/ui/badge';

const BookingStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Chờ xác nhận',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      confirmed: {
        label: 'Đã xác nhận',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      checked_in: {
        label: 'Đã check-in',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      checked_out: {
        label: 'Đã check-out',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      cancelled: {
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
};

export default BookingStatusBadge;
