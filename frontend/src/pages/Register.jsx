import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import RegisterForm from "@components/Auth/RegisterForm";
import { PublicRoute } from "@components/Auth/ProtectedRoute";
import { ROUTES } from "@utils/constants";

/**
 * Register Page
 * Beautiful registration page with modern design
 */
const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();

  const handleRegister = async (userData) => {
    const result = await register(userData);

    if (result.success) {
      // Redirect to dashboard or home after successful registration
      navigate(ROUTES.DASHBOARD || ROUTES.HOME, { replace: true });
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">
                  Homestay
                </h1>
              </div>
              <div className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Tham gia cộng đồng Homestay
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tạo tài khoản để trải nghiệm dịch vụ homestay tuyệt vời với hàng
                ngàn lựa chọn phù hợp cho chuyến du lịch của bạn.
              </p>
            </div>

            {/* Registration Form Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-8 py-12 sm:px-12">
                <RegisterForm
                  onSubmit={handleRegister}
                  loading={isLoading}
                  error={error}
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Tại sao chọn chúng tôi?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    An toàn & Bảo mật
                  </h3>
                  <p className="text-gray-600">
                    Thông tin cá nhân và thanh toán được bảo vệ với công nghệ mã
                    hóa tiên tiến.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-success-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Đặt phòng nhanh chóng
                  </h3>
                  <p className="text-gray-600">
                    Hệ thống đặt phòng thông minh giúp bạn tìm và book homestay
                    chỉ trong vài phút.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-warning-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hỗ trợ 24/7
                  </h3>
                  <p className="text-gray-600">
                    Đội ngũ chăm sóc khách hàng chuyên nghiệp sẵn sàng hỗ trợ
                    bạn mọi lúc, mọi nơi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-400">
                © 2025 Homestay Management System. Tất cả quyền được bảo lưu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default Register;
