import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import Button from "@components/Form/Button";
import { ArrowRight, Star, Shield, Zap } from "lucide-react";
import { ROUTES } from "@utils/constants";

/**
 * Home Page
 * Landing page with hero section and features
 */
const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-primary-800/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Trải nghiệm <span className="gradient-text">Homestay</span>
              <br />
              tuyệt vời nhất
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Hệ thống quản lý homestay hiện đại, giúp bạn dễ dàng tìm kiếm, đặt
              phòng và quản lý chuyến du lịch một cách thuận tiện nhất.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <>
                  <Link to={ROUTES.DASHBOARD}>
                    <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                      Vào Dashboard
                    </Button>
                  </Link>
                  <p className="text-gray-600">
                    Xin chào,{" "}
                    <span className="font-medium">{user?.full_name}</span>!
                  </p>
                </>
              ) : (
                <>
                  <Link to={ROUTES.REGISTER}>
                    <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                      Bắt đầu ngay
                    </Button>
                  </Link>
                  <Link to={ROUTES.LOGIN}>
                    <Button variant="outline" size="lg">
                      Đăng nhập
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">1000+</div>
              <div className="text-gray-600">Homestay chất lượng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">50K+</div>
              <div className="text-gray-600">Khách hàng hài lòng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">24/7</div>
              <div className="text-gray-600">Hỗ trợ khách hàng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm booking homestay tốt nhất với những
              tính năng vượt trội
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <Star className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Chất lượng đảm bảo
              </h3>
              <p className="text-gray-600">
                Tất cả homestay được kiểm duyệt kỹ lưỡng để đảm bảo chất lượng
                và sự hài lòng của khách hàng.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-success-200 transition-colors">
                <Shield className="w-10 h-10 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                An toàn tuyệt đối
              </h3>
              <p className="text-gray-600">
                Hệ thống bảo mật cao cấp bảo vệ thông tin cá nhân và giao dịch
                của bạn một cách an toàn.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-warning-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-warning-200 transition-colors">
                <Zap className="w-10 h-10 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Đặt phòng nhanh chóng
              </h3>
              <p className="text-gray-600">
                Giao diện thân thiện và quy trình đặt phòng tối ưu giúp bạn hoàn
                tất booking chỉ trong vài phút.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Sẵn sàng bắt đầu chuyến hành trình?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Tham gia cộng đồng của chúng tôi và khám phá những homestay tuyệt
              vời nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={ROUTES.REGISTER}>
                <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                  Đăng ký miễn phí
                </Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-400 text-gray-300 hover:bg-gray-800"
                >
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
