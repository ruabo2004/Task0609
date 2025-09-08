import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { paymentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const MoMoPayment = ({ booking, onPaymentSuccess, onPaymentCancel }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(900); 

  const createPaymentMutation = useMutation(
    paymentAPI.createMoMoPayment,
    {
      onSuccess: (response) => {
        if (response.data.success) {
          setPaymentData(response.data.data);
          toast.success('Tạo thanh toán MoMo thành công!');
          startPaymentTimer();
        } else {
          toast.error(response.data.message || 'Tạo thanh toán thất bại');
        }
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán';
        toast.error(message);
      }
    }
  );

  const { data: paymentStatusData, refetch: refetchPaymentStatus } = useQuery(
    ['paymentStatus', paymentData?.payment_id],
    () => paymentAPI.getPaymentStatus(paymentData?.payment_id),
    {
      enabled: !!paymentData?.payment_id,
      refetchInterval: 5000, 
      onSuccess: (response) => {
        if (response.data.success) {
          const payment = response.data.data.payment;
          setPaymentStatus(payment.payment_status);
          
          if (payment.payment_status === 'completed') {
            toast.success('Thanh toán thành công!');
            onPaymentSuccess && onPaymentSuccess(payment);
          } else if (payment.payment_status === 'failed') {
            toast.error('Thanh toán thất bại!');
          }
        }
      }
    }
  );

  useEffect(() => {
    let timer;
    if (paymentData && paymentStatus === 'pending' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            toast.warning('Phiên thanh toán đã hết hạn');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentData, paymentStatus, timeLeft]);

  const startPaymentTimer = () => {
    setTimeLeft(900); 
  };

  const handleCreatePayment = () => {
    createPaymentMutation.mutate({
      booking_id: booking.booking_id
    });
  };

  const handleOpenMoMoApp = () => {
    if (paymentData?.momo_deeplink) {
      window.open(paymentData.momo_deeplink, '_blank');
    }
  };

  const handleOpenPaymentUrl = () => {
    if (paymentData?.momo_pay_url) {
      window.open(paymentData.momo_pay_url, '_blank');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!paymentData) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            
            Thanh toán MoMo
          </h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              
            </div>
            <h4 className="text-lg font-semibold mb-2">Thanh toán với MoMo</h4>
            <p className="text-gray-600 mb-6">
              Thanh toán nhanh chóng và an toàn với ví điện tử MoMo
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Phòng:</span>
                <span className="font-semibold">{booking.room_number} - {booking.type_name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Ngày nhận phòng:</span>
                <span className="font-semibold">{new Date(booking.check_in_date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Ngày trả phòng:</span>
                <span className="font-semibold">{new Date(booking.check_out_date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng tiền:</span>
                  <span className="text-xl font-bold text-primary-color">
                    {formatAmount(booking.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreatePayment}
              disabled={createPaymentMutation.isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {createPaymentMutation.isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner w-5 h-5"></div>
                  Đang tạo thanh toán...
                </div>
              ) : (
                <>Thanh toán với MoMo</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          
          Thanh toán MoMo
          {paymentStatus === 'completed' && (
            
          )}
          {paymentStatus === 'failed' && (
            
          )}
          {paymentStatus === 'pending' && (
            
          )}
        </h3>
      </div>
      <div className="card-body">
        {paymentStatus === 'pending' && (
          <>
            <div className="text-center mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-semibold">
                  Thời gian còn lại: {formatTime(timeLeft)}
                </p>
                <p className="text-yellow-600 text-sm">
                  Vui lòng hoàn tất thanh toán trong thời gian quy định
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-semibold mb-2">Số tiền cần thanh toán:</p>
                <p className="text-2xl font-bold text-pink-500">
                  {formatAmount(paymentData.amount)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              
              {paymentData.momo_qr_code && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border">
                    <img
                      src={paymentData.momo_qr_code}
                      alt="MoMo QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Quét mã QR bằng ứng dụng MoMo
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleOpenMoMoApp}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                  disabled={!paymentData.momo_deeplink}
                >
                  
                  Mở ứng dụng MoMo
                </button>

                <button
                  onClick={handleOpenPaymentUrl}
                  className="btn btn-outline w-full flex items-center justify-center gap-2"
                  disabled={!paymentData.momo_pay_url}
                >
                  
                  Thanh toán trên web
                </button>

                {paymentData.momo_qr_code && (
                  <button
                    onClick={() => window.open(paymentData.momo_qr_code, '_blank')}
                    className="btn btn-outline w-full flex items-center justify-center gap-2"
                  >
                    
                    Xem mã QR
                  </button>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 mb-2">Hướng dẫn thanh toán:</h5>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Mở ứng dụng MoMo trên điện thoại</li>
                <li>Quét mã QR hoặc nhấn nút "Mở ứng dụng MoMo"</li>
                <li>Xác nhận thông tin thanh toán</li>
                <li>Nhập mã PIN để hoàn tất giao dịch</li>
              </ol>
            </div>
          </>
        )}

        {paymentStatus === 'completed' && (
          <div className="text-center py-8">
            
            <h4 className="text-xl font-semibold text-green-700 mb-2">
              Thanh toán thành công!
            </h4>
            <p className="text-gray-600 mb-4">
              Đặt phòng của bạn đã được xác nhận
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                Mã giao dịch: <span className="font-mono">{paymentStatusData?.data?.data?.payment?.transaction_id}</span>
              </p>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center py-8">
            
            <h4 className="text-xl font-semibold text-red-700 mb-2">
              Thanh toán thất bại!
            </h4>
            <p className="text-gray-600 mb-4">
              Giao dịch không thành công, vui lòng thử lại
            </p>
            <button
              onClick={() => {
                setPaymentData(null);
                setPaymentStatus('pending');
              }}
              className="btn btn-primary"
            >
              Thử lại
            </button>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => refetchPaymentStatus()}
            disabled={paymentStatus !== 'pending'}
            className="btn btn-outline"
          >
            Kiểm tra trạng thái
          </button>
          <button
            onClick={onPaymentCancel}
            className="btn btn-outline"
          >
            Hủy thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoMoPayment;
