import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import { getRoomSizeDisplay } from '@/utils/roomUtils';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  
  const [filterRoomType, setFilterRoomType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('room_number');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: '',
    price_per_night: '',
    capacity: '',
    description: '',
    amenities: '',
    status: 'available'
  });

  // Function to translate room type to Vietnamese
  const translateRoomType = (roomType) => {
    const translations = {
      'single': 'Phòng đơn',
      'double': 'Phòng đôi', 
      'suite': 'Cao cấp',
      'family': 'Phòng gia đình',
      'deluxe': 'Phòng deluxe',
      'standard': 'Phòng tiêu chuẩn',
      'presidential': 'Phòng tổng thống'
    };
    return translations[roomType] || roomType;
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      // Fetch all rooms with a large limit to get all rooms
      const response = await apiService.admin.rooms.getAll({ limit: 1000 });
      if (response.data && response.data.success) {
        // Backend returns { success, data: { rooms: [...], pagination: {...} } }
        const roomsData = response.data.data?.rooms || response.data.data || [];
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        room_number: room.room_number || '',
        room_type: room.room_type || '',
        price_per_night: room.price_per_night || '',
        capacity: room.capacity || '',
        description: room.description || '',
        amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities || ''),
        status: room.status || 'available'
      });
    } else {
      setEditingRoom(null);
      setFormData({
        room_number: '',
        room_type: '',
        price_per_night: '',
        capacity: '',
        description: '',
        amenities: '',
        status: 'available'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setSelectedFiles([]);
    setImagePreviewUrls([]);
    setFormData({
      room_number: '',
      room_type: '',
      price_per_night: '',
      capacity: '',
      description: '',
      amenities: '',
      status: 'available'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file selection for image upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh');
      return;
    }

    if (!editingRoom) {
      toast.error('Vui lòng chọn phòng để upload ảnh');
      return;
    }

    try {
      setUploadingImages(true);
      const formData = new FormData();
      
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      await apiService.rooms.uploadImages(editingRoom.id, formData);
      toast.success('Upload ảnh thành công');
      fetchRooms(); // Refresh danh sách
      setSelectedFiles([]);
      setImagePreviewUrls([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể upload ảnh');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove selected file (preview)
  const removeSelectedFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setImagePreviewUrls(newPreviewUrls);
  };

  // Delete existing image from room
  const handleDeleteImage = async (imageUrl, imageIndex) => {
    if (!editingRoom) return;
    
    if (!confirm(`Bạn có chắc muốn xóa ảnh này?`)) {
      return;
    }

    try {
      // Remove image from array
      const updatedImages = editingRoom.images.filter((_, i) => i !== imageIndex);
      
      // Update room with new images array
      await apiService.rooms.update(editingRoom.id, { images: updatedImages });
      
      // Update local state
      setEditingRoom({
        ...editingRoom,
        images: updatedImages
      });
      
      // Refresh rooms list
      fetchRooms();
      
      toast.success('Xóa ảnh thành công');
    } catch (error) {
      console.error('Delete image error:', error);
      toast.error('Không thể xóa ảnh');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        room_number: formData.room_number,
        room_type: formData.room_type,
        price_per_night: parseFloat(formData.price_per_night),
        capacity: parseInt(formData.capacity),
        description: formData.description,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
        status: formData.status
      };

      if (editingRoom) {
        await apiService.admin.rooms.update(editingRoom.id, submitData);
        toast.success('Cập nhật phòng thành công');
      } else {
        await apiService.admin.rooms.create(submitData);
        toast.success('Thêm phòng mới thành công');
      }
      
      handleCloseModal();
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error(editingRoom ? 'Không thể cập nhật phòng' : 'Không thể thêm phòng mới');
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      return;
    }

    try {
      await apiService.admin.rooms.delete(roomId);
      toast.success('Xóa phòng thành công');
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Không thể xóa phòng');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-orange-100 text-orange-800',
      unavailable: 'bg-red-100 text-red-800'
    };
    const labels = {
      available: 'Trống',
      occupied: 'Đang sử dụng',
      maintenance: 'Bảo trì',
      unavailable: 'Không khả dụng'
    };
    return (
      <Badge className={badges[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const filteredAndSortedRooms = React.useMemo(() => {
    let filtered = rooms.filter(room => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || (
        room.room_number?.toLowerCase().includes(searchLower) ||
        room.room_type?.toLowerCase().includes(searchLower) ||
        translateRoomType(room.room_type)?.toLowerCase().includes(searchLower) ||
        room.status?.toLowerCase().includes(searchLower)
      );
      
      const matchesRoomType = filterRoomType === 'all' || room.room_type === filterRoomType;
      const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
      
      const price = parseFloat(room.price_per_night);
      const matchesMinPrice = !minPrice || price >= parseFloat(minPrice);
      const matchesMaxPrice = !maxPrice || price <= parseFloat(maxPrice);
      
      return matchesSearch && matchesRoomType && matchesStatus && matchesMinPrice && matchesMaxPrice;
    });
    
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'room_number':
          aValue = a.room_number || '';
          bValue = b.room_number || '';
          break;
        case 'price':
          aValue = parseFloat(a.price_per_night) || 0;
          bValue = parseFloat(b.price_per_night) || 0;
          break;
        case 'capacity':
          aValue = parseInt(a.capacity) || 0;
          bValue = parseInt(b.capacity) || 0;
          break;
        case 'room_type':
          aValue = translateRoomType(a.room_type) || '';
          bValue = translateRoomType(b.room_type) || '';
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
    
    return filtered;
  }, [rooms, searchTerm, filterRoomType, filterStatus, minPrice, maxPrice, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Phòng</h1>
          <p className="text-gray-600">Quản lý danh sách phòng trong hệ thống</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Thêm Phòng Mới
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="relative z-10">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo số phòng, loại phòng, trạng thái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Room Type Filter */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Loại phòng
                </label>
                <select
                  value={filterRoomType}
                  onChange={(e) => setFilterRoomType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Tất cả</option>
                  <option value="single" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Phòng đơn</option>
                  <option value="double" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Phòng đôi</option>
                  <option value="suite" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Cao cấp</option>
                  <option value="family" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Phòng gia đình</option>
                  <option value="deluxe" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Phòng deluxe</option>
                  <option value="standard" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Phòng tiêu chuẩn</option>
                  <option value="presidential" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Phòng tổng thống</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Tất cả</option>
                  <option value="available" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Trống</option>
                  <option value="occupied" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Đang sử dụng</option>
                  <option value="maintenance" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Bảo trì</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá tối thiểu
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá tối đa
                </label>
                <Input
                  type="number"
                  placeholder="10000000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Sắp xếp theo
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  >
                    <option value="room_number" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Số phòng</option>
                    <option value="price" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Giá</option>
                    <option value="capacity" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Sức chứa</option>
                    <option value="room_type" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Loại phòng</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-bold text-lg"
                    title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRoomType('all');
                  setFilterStatus('all');
                  setMinPrice('');
                  setMaxPrice('');
                  setSortBy('room_number');
                  setSortOrder('asc');
                }}
                className="text-sm"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5" />
            Danh Sách Phòng ({filteredAndSortedRooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : filteredAndSortedRooms.length === 0 ? (
            <div className="text-center py-8">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy phòng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Số Phòng</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Loại Phòng</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Giá/Đêm</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Sức Chứa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Diện Tích</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Trạng Thái</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {room.room_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{translateRoomType(room.room_type)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {Number(room.price_per_night).toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {room.capacity} người
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getRoomSizeDisplay(room)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(room.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(room)}
                            className="flex items-center gap-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(room.id)}
                            className="flex items-center gap-1"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <Dialog open={showModal} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số Phòng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => handleInputChange('room_number', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại Phòng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.room_type}
                    onChange={(e) => handleInputChange('room_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Chọn loại phòng</option>
                    <option value="single">Phòng đơn</option>
                    <option value="double">Phòng đôi</option>
                    <option value="suite">Cao cấp</option>
                    <option value="family">Phòng gia đình</option>
                    <option value="deluxe">Phòng deluxe</option>
                    <option value="standard">Phòng tiêu chuẩn</option>
                    <option value="presidential">Phòng tổng thống</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá/Đêm (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="1000"
                    value={formData.price_per_night}
                    onChange={(e) => handleInputChange('price_per_night', e.target.value)}
                    placeholder="VD: 500000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sức Chứa <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}

                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Trống</option>
                    <option value="occupied">Đang sử dụng</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết về phòng..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiện Nghi (ngăn cách bằng dấu phẩy)
                </label>
                <Input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => handleInputChange('amenities', e.target.value)}
                  placeholder="VD: WiFi, TV, Điều hòa"
                />
              </div>

              {/* Image Upload Section - Only show when editing existing room */}
              {editingRoom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <PhotoIcon className="w-4 h-4 inline mr-1" />
                    Thêm Ảnh Phòng
                  </label>
                  
                  {/* Current Images Display */}
                  {editingRoom.images && Array.isArray(editingRoom.images) && editingRoom.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại ({editingRoom.images.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {editingRoom.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                              alt={`Room ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(image, index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              title="Xóa ảnh"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Input */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Preview Selected Images */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Ảnh đã chọn:</p>
                      <div className="flex flex-wrap gap-2">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <Button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={uploadingImages}
                        className="w-full"
                      >
                        {uploadingImages ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang upload...
                          </>
                        ) : (
                          <>
                            <PhotoIcon className="w-4 h-4 mr-2" />
                            Upload {selectedFiles.length} ảnh
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Hủy
                </Button>
                <Button type="submit">
                  {editingRoom ? 'Cập Nhật' : 'Thêm Mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RoomManagement;
