import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const transId = searchParams.get('transId');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {

      if (!bookingId) {
        toast.error('Không tìm thấy thông tin đặt phòng');
        setLoading(false);
        return;
      }

      try {
        // Fetch booking details to verify
        const response = await apiService.bookings.getById(bookingId);

        if (response.data?.success) {
          const booking = response.data.data;

          setBookingDetails(booking);
          toast.success('Thanh toán thành công! Đặt phòng đã được xác nhận.');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Không thể tải thông tin đặt phòng');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [bookingId, transId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xác nhận thanh toán...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh Toán Thành Công!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Đặt phòng của bạn đã được xác nhận. Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.
          </p>

          {bookingId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">Mã đặt phòng</div>
              <div className="text-lg font-bold text-gray-900">#{bookingId}</div>
              {bookingDetails && (
                <div className="mt-3 text-left space-y-1">
                  {(bookingDetails.room_number || bookingDetails.room_name) && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phòng:</span> {bookingDetails.room_number || bookingDetails.room_name}
                    </p>
                  )}
                  {bookingDetails.check_in_date && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Check-in:</span> {new Date(bookingDetails.check_in_date).toLocaleDateString('vi-VN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </p>
                  )}
                  {bookingDetails.check_out_date && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Check-out:</span> {new Date(bookingDetails.check_out_date).toLocaleDateString('vi-VN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </p>
                  )}
                  {bookingDetails.total_amount && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tổng tiền:</span> {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(bookingDetails.total_amount)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {transId && (
            <div className="text-sm text-gray-500 mb-6">
              Mã giao dịch MoMo: {transId}
            </div>
          )}

          <div className="space-y-3">
            <Link to={`/customer/bookings`} className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Xem Chi Tiết Đặt Phòng
              </Button>
            </Link>
            
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                Về Trang Chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

