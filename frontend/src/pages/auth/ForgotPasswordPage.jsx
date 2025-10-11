import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon, IdentificationIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

/**
 * ForgotPasswordPage - Tra cứu tài khoản bằng CMND/CCCD
 */
const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accountFound, setAccountFound] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Gọi API tra cứu tài khoản bằng CMND/CCCD
      const response = await apiService.post('/auth/lookup-account', {
        id_number: data.id_number,
      });

      if (response.data && response.data.success) {
        setAccountFound(response.data.data);
        toast.success(response.data.message || 'Tìm thấy tài khoản!');
      } else {
        toast.error('Không tìm thấy tài khoản với số CMND/CCCD này');
        setAccountFound(null);
      }
    } catch (error) {
      console.error('Lookup error:', error);
      toast.error(error.response?.data?.message || 'Không tìm thấy tài khoản với số CMND/CCCD này');
      setAccountFound(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAccountFound(null);
  };

  if (accountFound) {
    return (
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
          <IdentificationIcon className="h-6 w-6 text-success-600" />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          Thông tin tài khoản
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Đã tìm thấy tài khoản của bạn
        </p>

        {/* Account Information */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg text-left">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Họ và tên</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{accountFound.full_name}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{accountFound.email}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Số điện thoại</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{accountFound.phone}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Mật khẩu</label>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm font-mono font-medium text-gray-900">
                    {showPassword ? accountFound.password : '••••••••••••'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-600" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Vui lòng lưu lại thông tin đăng nhập của bạn. 
              Để bảo mật, bạn nên đổi mật khẩu sau khi đăng nhập.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            to="/auth/login"
            className="block w-full btn-primary"
          >
            Đăng nhập ngay
          </Link>

          <button
            onClick={handleReset}
            className="w-full btn-outline"
          >
            Tra cứu tài khoản khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Tra cứu tài khoản
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Nhập số CMND/CCCD để tra cứu thông tin tài khoản và mật khẩu của bạn
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* ID Number */}
        <div>
          <label htmlFor="id_number" className="form-label">
            Số CMND/CCCD
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IdentificationIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="id_number"
              type="text"
              className={`form-input pl-10 ${errors.id_number ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Nhập số CMND/CCCD (9 hoặc 12 số)"
              {...register('id_number', {
                required: 'Số CMND/CCCD là bắt buộc',
                pattern: {
                  value: /^[0-9]{9}$|^[0-9]{12}$/,
                  message: 'Số CMND/CCCD phải có 9 hoặc 12 chữ số',
                },
              })}
            />
          </div>
          {errors.id_number && (
            <p className="form-error">{errors.id_number.message}</p>
          )}
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner w-4 h-4 mr-2"></div>
                Đang tra cứu...
              </div>
            ) : (
              'Tra cứu tài khoản'
            )}
          </button>
        </div>
      </form>

      {/* Back to login */}
      <div className="mt-6 flex items-center justify-center">
        <Link
          to="/auth/login"
          className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Quay lại đăng nhập
        </Link>
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Hướng dẫn</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Nhập chính xác số CMND/CCCD bạn đã đăng ký</li>
          <li>• Số CMND có 9 chữ số, số CCCD có 12 chữ số</li>
          <li>• Liên hệ bộ phận hỗ trợ nếu không tìm thấy tài khoản</li>
        </ul>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
