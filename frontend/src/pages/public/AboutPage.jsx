import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  HomeIcon,
  UsersIcon,
  StarIcon,
  MapPinIcon,
  HeartIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  FaceSmileIcon,
  HandRaisedIcon,
  LightBulbIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

/**
 * AboutPage component - Information about the homestay
 */
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Giới Thiệu Homestay Của Chúng Tôi
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Chào mừng đến với homestay ấm cúng của chúng tôi, nơi sự thoải mái kết hợp với tiện lợi
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Simplified Story Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu Chuyện Của Chúng Tôi</h2>

              <div className="space-y-4 text-gray-600">
                <p>
                  Được thành lập vào năm 2020, homestay của chúng tôi đã tận tâm cung cấp cho du khách 
                  chỗ ở chân thực, thoải mái và giá cả phải chăng. Chúng tôi tin rằng mọi 
                  chuyến đi đều nên đáng nhớ, bắt đầu từ nơi bạn lưu trú.
                </p>
                <p>
                  Sứ mệnh của chúng tôi là tạo ra một ngôi nhà thứ hai cho khách hàng, cung cấp 
                  dịch vụ cá nhân hóa và kiến thức địa phương để làm cho kỳ nghỉ của bạn thật đặc biệt.
                </p>
                <p>
                  Tọa lạc ở trung tâm thành phố, chúng tôi có vị trí hoàn hảo để mang lại cho bạn 
                  khả năng tiếp cận dễ dàng đến các điểm tham quan địa phương trong khi duy trì môi trường 
                  yên tĩnh để thư giãn.
                </p>
              </div>
            </div>
            
            <div>
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600"
                alt="Our Homestay"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Simplified Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Tại Sao Chọn Chúng Tôi</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Phòng Thoải Mái</h3>
              <p className="text-gray-600">
                Phòng sạch sẽ, thoải mái và được trang bị đầy đủ với các tiện nghi hiện đại.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dịch Vụ Xuất Sắc</h3>
              <p className="text-gray-600">
                Hỗ trợ 24/7 và sự chăm sóc cá nhân để làm cho kỳ nghỉ của bạn hoàn hảo.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vị Trí Đắc Địa</h3>
              <p className="text-gray-600">
                Tọa lạc thuận tiện gần các điểm tham quan chính và phương tiện giao thông.
              </p>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};

export default AboutPage;
