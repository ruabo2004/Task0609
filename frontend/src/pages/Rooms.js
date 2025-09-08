import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { roomAPI } from '../services/api';

import DatePicker from 'react-datepicker';

const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    checkInDate: searchParams.get('checkInDate') ? new Date(searchParams.get('checkInDate')) : null,
    checkOutDate: searchParams.get('checkOutDate') ? new Date(searchParams.get('checkOutDate')) : null,
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    roomType: searchParams.get('roomType') || '',
    maxOccupancy: searchParams.get('maxOccupancy') || ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: roomTypesData } = useQuery(
    'roomTypes',
    roomAPI.getRoomTypes,
    {
      select: (response) => response.data.data.roomTypes
    }
  );

  const { data: roomsData, isLoading, error } = useQuery(
    ['rooms', filters],
    () => {
      if (filters.checkInDate && filters.checkOutDate) {
        return roomAPI.getAvailableRooms(
          filters.checkInDate.toISOString().split('T')[0],
          filters.checkOutDate.toISOString().split('T')[0]
        );
      } else {
        return roomAPI.searchRooms(filters);
      }
    },
    {
      select: (response) => response.data.data.rooms,
      keepPreviousData: true
    }
  );

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    const newSearchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (value instanceof Date) {
          newSearchParams.set(key, value.toISOString().split('T')[0]);
        } else if (value.toString().trim()) {
          newSearchParams.set(key, value.toString());
        }
      }
    });

    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      checkInDate: null,
      checkOutDate: null,
      minPrice: '',
      maxPrice: '',
      roomType: '',
      maxOccupancy: ''
    });
    setSearchParams(new URLSearchParams());
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Phòng nghỉ</h1>
          <p className="text-lg text-gray-600">Tìm phòng phù hợp với nhu cầu của bạn</p>
        </div>

        <div className="card mb-8">
          <div className="card-body">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ngày nhận phòng</label>
                
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              
            </div>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy phòng</h3>
            <p className="text-gray-600 mb-4">
              Thử thay đổi tiêu chí tìm kiếm hoặc chọn ngày khác
            </p>
            <button
              onClick={clearFilters}
              className="btn btn-primary"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
