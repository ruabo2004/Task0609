import React from "react";
import { Link } from "react-router-dom";
import Button from "@components/Form/Button";
import { Home, ArrowLeft } from "lucide-react";
import { ROUTES } from "@utils/constants";

/**
 * 404 Not Found Page
 */
const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trang không tồn tại
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di
            chuyển.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to={ROUTES.HOME}>
            <Button variant="primary" size="lg" icon={Home}>
              Về trang chủ
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang trước
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Home className="w-64 h-64 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
