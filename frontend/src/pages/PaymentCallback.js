import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { paymentAPI } from '../services/api';

const PaymentCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [callbackData, setCallbackData] = useState(null);

  useEffect(() => {
    
    const urlParams = new URLSearchParams(location.search);
    const data = {
      partnerCode: urlParams.get('partnerCode'),
      orderId: urlParams.get('orderId'),
      requestId: urlParams.get('requestId'),
      amount: urlParams.get('amount'),
      orderInfo: urlParams.get('orderInfo'),
      orderType: urlParams.get('orderType'),
      transId: urlParams.get('transId'),
      resultCode: urlParams.get('resultCode'),
      message: urlParams.get('message'),
      payType: urlParams.get('payType'),
      responseTime: urlParams.get('responseTime'),
      extraData: urlParams.get('extraData'),
      signature: urlParams.get('signature')
    };

    setCallbackData(data);
  }, [location]);

  const { data: paymentStatus, isLoading } = useQuery(
    ['paymentCallback', callbackData?.orderId],
    async () => {

      return {
        success: true,
        data: {
          resultCode: parseInt(callbackData?.resultCode || '0'),
          isSuccess: parseInt(callbackData?.resultCode || '0') === 0,
          transactionId: callbackData?.transId,
          amount: parseInt(callbackData?.amount || '0'),
          message: callbackData?.message || '',
          orderId: callbackData?.orderId
        }
      };
    },
    {
      enabled: !!callbackData?.orderId,
      retry: false
    }
  );

  const getStatusInfo = () => {
    if (!paymentStatus?.data) {
      return {
        icon: Clock,
        title: 'Đang xử lý...',
        message: 'Vui lòng chờ trong giây lát',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }

    if (paymentStatus.data.isSuccess) {
      return {
        icon: CheckCircle,
        title: 'Thanh toán thành công!',
        message: 'Đặt phòng của bạn đã được xác nhận',
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        icon: XCircle,
        title: 'Thanh toán thất bại!',
        message: paymentStatus.data.message || 'Giao dịch không thành công',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleGoToBookings = () => {
    navigate('/booking-history');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const statusInfo = getStatusInfo();

  if (isLoading || !callbackData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-lg">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="card-body text-center">
              
              <div className={`w-20 h-20 ${statusInfo.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                
              </div>

              <h1 className={`text-2xl font-bold mb-4 ${statusInfo.color}`}>
                {statusInfo.title}
              </h1>

              <p className="text-gray-600 mb-8">
                {statusInfo.message}
              </p>

              {paymentStatus?.data && (
                <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-6 mb-8`}>
                  <h3 className="font-semibold mb-4">Chi tiết giao dịch</h3>
                  <div className="space-y-3 text-sm">
                    {paymentStatus.data.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã giao dịch:</span>
                        <span className="font-mono">{paymentStatus.data.transactionId}</span>
                      </div>
                    )}
                    {callbackData.orderId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã đơn hàng:</span>
                        <span className="font-mono">{callbackData.orderId}</span>
                      </div>
                    )}
                    {paymentStatus.data.amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-semibold">{formatAmount(paymentStatus.data.amount)}</span>
                      </div>
                    )}
                    {callbackData.responseTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span>{new Date(parseInt(callbackData.responseTime)).toLocaleString('vi-VN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`font-semibold ${paymentStatus.data.isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {paymentStatus.data.isSuccess ? 'Thành công' : 'Thất bại'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {paymentStatus?.data?.isSuccess ? (
                  <>
                    <button
                      onClick={handleGoToBookings}
                      className="btn btn-primary flex items-center justify-center gap-2"
                    >
                      Xem lịch sử đặt phòng
                      
                    </button>
                    <button
                      onClick={handleGoHome}
                      className="btn btn-outline"
                    >
                      Về trang chủ
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/rooms')}
                      className="btn btn-primary"
                    >
                      Thử đặt phòng lại
                    </button>
                    <button
                      onClick={handleGoHome}
                      className="btn btn-outline"
                    >
                      Về trang chủ
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8 text-sm text-gray-500">
                {paymentStatus?.data?.isSuccess ? (
                  <p>
                    Bạn sẽ nhận được email xác nhận đặt phòng trong thời gian sớm nhất.
                    Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.
                  </p>
                ) : (
                  <p>
                    Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ bộ phận hỗ trợ khách hàng
                    hoặc thử lại với phương thức thanh toán khác.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
