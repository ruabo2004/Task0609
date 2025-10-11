import { Link } from 'react-router-dom';

/**
 * Footer component for main layout
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quản Lý Homestay</h3>
            <p className="text-gray-300 text-sm">
              Đối tác đáng tin cậy của bạn cho chỗ ở thoải mái và giá cả phải chăng.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-gray-300 hover:text-white transition-colors">
                  Phòng
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  Giới Thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-md font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-300">Trung Tâm Trợ Giúp</span>
              </li>
              <li>
                <span className="text-gray-300">Chính Sách Bảo Mật</span>
              </li>
              <li>
                <span className="text-gray-300">Điều Khoản Dịch Vụ</span>
              </li>
              <li>
                <span className="text-gray-300">FAQ</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-md font-semibold mb-4">Thông Tin Liên Hệ</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Địa chỉ: 123 Phú Diễn, Nam từ liêm, Hà Nội</p>
              <p>Điện thoại: 0886528046</p>
              <p>Email: iezreal.com@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Quản Lý Homestay. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
