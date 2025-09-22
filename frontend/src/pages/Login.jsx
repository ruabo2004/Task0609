import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import LoginForm from "@components/Auth/LoginForm";
import { PublicRoute } from "@components/Auth/ProtectedRoute";
import { ROUTES } from "@utils/constants";

/**
 * Login Page
 * Beautiful login page with gradient background and modern design
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (credentials) => {
    const result = await login(credentials);

    if (result.success) {
      // Redirect to intended page or dashboard
      const from =
        location.state?.from?.pathname || ROUTES.DASHBOARD || ROUTES.HOME;
      navigate(from, { replace: true });
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <LoginForm
              onSubmit={handleLogin}
              loading={isLoading}
              error={error}
            />
          </div>
        </div>

        {/* Right Side - Hero Section */}
        <div className="hidden lg:flex lg:flex-1 lg:relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute top-0 left-0 w-full h-full bg-repeat bg-center"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "60px 60px",
                }}
              />
            </div>
          </div>

          <div className="relative flex flex-col justify-center items-center text-white p-12">
            <div className="max-w-md text-center">
              <h2 className="text-4xl font-bold mb-6">Chào mừng trở lại!</h2>
              <p className="text-xl text-blue-100 mb-8">
                Hệ thống quản lý homestay hiện đại và dễ sử dụng. Đăng nhập để
                tiếp tục trải nghiệm tuyệt vời.
              </p>

              {/* Feature List */}
              <div className="space-y-4 text-left">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span className="text-blue-100">Quản lý booking dễ dàng</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span className="text-blue-100">
                    Thanh toán an toàn và nhanh chóng
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span className="text-blue-100">Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 right-12 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse" />
          <div
            className="absolute bottom-1/4 left-12 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-8 h-8 bg-white bg-opacity-10 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>
    </PublicRoute>
  );
};

export default Login;
