import { useSearchParams, Link } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  const getReasonText = (reason) => {
    const reasons = {
      invalid_signature: 'Chữ ký không hợp lệ',
      server_error: 'Lỗi máy chủ',
      user_cancelled: 'Bạn đã hủy thanh toán',
      insufficient_funds: 'Số dư không đủ',
      timeout: 'Hết thời gian thanh toán'
    };
    return reasons[reason] || 'Có lỗi xảy ra trong quá trình thanh toán';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <XCircleIcon className="h-10 w-10 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh Toán Thất Bại
          </h1>
          
          <p className="text-gray-600 mb-6">
            {getReasonText(reason)}
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              Đặt phòng của bạn vẫn được giữ. Vui lòng thử thanh toán lại hoặc liên hệ với chúng tôi để được hỗ trợ.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Thử Lại Thanh Toán
            </Button>
            
            <Link to="/customer/bookings" className="block">
              <Button variant="outline" className="w-full">
                Xem Đặt Phòng Của Tôi
              </Button>
            </Link>
            
            <Link to="/" className="block">
              <Button variant="ghost" className="w-full">
                Về Trang Chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;

