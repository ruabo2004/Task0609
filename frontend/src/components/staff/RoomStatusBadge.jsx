import { Badge } from '@/components/ui/badge';

const RoomStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'out_of_order':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Sẵn sàng';
      case 'occupied':
        return 'Đang sử dụng';
      case 'cleaning':
        return 'Đang dọn dẹp';
      case 'maintenance':
        return 'Bảo trì';
      case 'out_of_order':
        return 'Ngừng hoạt động';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return '';
      case 'occupied':
        return '';
      case 'cleaning':
        return '';
      case 'maintenance':
        return '';
      case 'out_of_order':
        return '';
      default:
        return '';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1`}>
      <span>{getStatusIcon(status)}</span>
      {getStatusText(status)}
    </Badge>
  );
};

export default RoomStatusBadge;
