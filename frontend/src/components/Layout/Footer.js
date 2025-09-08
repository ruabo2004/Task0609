import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Homestay Management</h3>
            <p className="text-gray-300 mb-4">
              Hệ thống quản lý homestay chuyên nghiệp, mang đến trải nghiệm nghỉ dưỡng 
              tuyệt vời trong không gian thiên nhiên yên bình.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                Twitter
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-primary-color transition-colors">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="/rooms" className="text-gray-300 hover:text-primary-color transition-colors">
                  Phòng nghỉ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                  Dịch vụ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                  Đặt phòng trực tuyến
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                  Tour du lịch
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                  Dịch vụ ăn uống
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                  Thuê xe máy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-color transition-colors">
                  Massage thư giãn
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="text-gray-300">
                📍 123 Đường ABC, Phường XYZ, Thành phố Hà Nội
              </div>
              <div className="text-gray-300">
                📞 +84 123 456 789
              </div>
              <div className="text-gray-300">
                ✉️ info@homestay.com
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 Homestay Management System. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-primary-color transition-colors text-sm">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-color transition-colors text-sm">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-color transition-colors text-sm">
                Hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;