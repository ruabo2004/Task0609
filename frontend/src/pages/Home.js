import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { roomAPI } from '../services/api';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Home = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    checkInDate: null,
    checkOutDate: null,
    guests: 1
  });

  const { data: roomTypesData } = useQuery(
    'roomTypes',
    roomAPI.getRoomTypes,
    {
      select: (response) => response.data.data.roomTypes
    }
  );

  const { data: featuredRooms } = useQuery(
    'featuredRooms',
    roomAPI.getAllRooms,
    {
      select: (response) => response.data.data.rooms.slice(0, 3)
    }
  );

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (searchData.checkInDate) {
      searchParams.set('checkInDate', searchData.checkInDate.toISOString().split('T')[0]);
    }
    if (searchData.checkOutDate) {
      searchParams.set('checkOutDate', searchData.checkOutDate.toISOString().split('T')[0]);
    }
    if (searchData.guests > 1) {
      searchParams.set('maxOccupancy', searchData.guests);
    }

    navigate(`/rooms?${searchParams.toString()}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen">
      
      <section className="relative bg-gradient-to-r from-primary-color to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chào mừng đến với Homestay
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Trải nghiệm nghỉ dưỡng tuyệt vời trong không gian thiên nhiên yên bình
            </p>

            <div className="bg-white rounded-lg shadow-lg p-6 text-gray-800 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày nhận phòng</label>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Phòng nổi bật</h2>
            <p className="text-lg text-gray-600">Những phòng được khách hàng yêu thích nhất</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms?.map((room) => (
              <div key={room.room_id} className="card">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg">
                  
                  <div className="w-full h-48 bg-gradient-to-br from-primary-light to-primary-color rounded-t-lg flex items-center justify-center">
                    <span className="text-white font-semibold">{room.room_number}</span>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="text-xl font-semibold mb-2">{room.type_name}</h3>
                  <p className="text-gray-600 mb-2">Phòng số: {room.room_number}</p>
                  <p className="text-gray-600 mb-4">{room.description}</p>
                  
                  <div className="flex items-center mb-4">
                    <span className="text-2xl font-bold text-primary-color">
                      {formatPrice(room.base_price)}
                    </span>
                    <span className="text-gray-500 ml-1">/đêm</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      
                      <span className="text-sm">Tối đa {room.max_occupancy} khách</span>
                    </div>
                    <div className="flex items-center">
                      
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tại sao chọn chúng tôi?</h2>
            <p className="text-lg text-gray-600">Những tiện ích và dịch vụ tuyệt vời</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-color rounded-full flex items-center justify-center mx-auto mb-4">
                
              </div>
              <h3 className="text-xl font-semibold mb-2">WiFi miễn phí</h3>
              <p className="text-gray-600">Kết nối internet tốc độ cao miễn phí trong toàn bộ khu vực</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-color rounded-full flex items-center justify-center mx-auto mb-4">
                
              </div>
              <h3 className="text-xl font-semibold mb-2">Cho thuê xe</h3>
              <p className="text-gray-600">Dịch vụ cho thuê xe máy và ô tô với giá ưu đãi</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-color rounded-full flex items-center justify-center mx-auto mb-4">
                
              </div>
              <h3 className="text-xl font-semibold mb-2">Dịch vụ ăn uống</h3>
              <p className="text-gray-600">Thưởng thức các món ăn đặc sản địa phương tại nhà hàng</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-color rounded-full flex items-center justify-center mx-auto mb-4">
                
              </div>
              <h3 className="text-xl font-semibold mb-2">Tour du lịch</h3>
              <p className="text-gray-600">Khám phá các điểm tham quan nổi tiếng với hướng dẫn viên</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
