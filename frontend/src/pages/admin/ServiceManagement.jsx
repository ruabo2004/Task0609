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
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_available: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.services.getAll();
      
      if (response.data && response.data.success) {
        // Backend returns { success, data: { services: [...], pagination: {...} } }
        const servicesData = response.data.data?.services || response.data.data || [];
        setServices(Array.isArray(servicesData) ? servicesData : []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      // Support both is_available and is_active from backend
      const isAvailable = service.is_available !== undefined 
        ? service.is_available 
        : (service.is_active !== undefined ? service.is_active : true);
      
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        category: service.category || '',
        is_available: isAvailable
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        is_available: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      is_available: true
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        // Nếu không chọn danh mục, mặc định 'other' để phù hợp ENUM DB
        category: formData.category || 'other',
        is_available: Boolean(formData.is_available)
      };

      if (editingService) {
        await apiService.admin.services.update(editingService.id, submitData);
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        await apiService.admin.services.create(submitData);
        toast.success('Thêm dịch vụ mới thành công');
      }
      
      handleCloseModal();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(editingService ? 'Không thể cập nhật dịch vụ' : 'Không thể thêm dịch vụ mới');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      return;
    }

    try {
      await apiService.admin.services.delete(serviceId);
      toast.success('Xóa dịch vụ thành công');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Không thể xóa dịch vụ');
    }
  };

  const getAvailabilityBadge = (isAvailable) => {
    return isAvailable ? (
      <Badge className="bg-green-100 text-green-800">Khả dụng</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Không khả dụng</Badge>
    );
  };

  const filteredServices = services.filter(service => {
    const searchLower = searchTerm.toLowerCase();
    return (
      service.name?.toLowerCase().includes(searchLower) ||
      service.category?.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Dịch Vụ</h1>
          <p className="text-gray-600">Quản lý các dịch vụ bổ sung trong hệ thống</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Thêm Dịch Vụ Mới
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên dịch vụ, danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Service List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WrenchScrewdriverIcon className="h-5 w-5" />
            Danh Sách Dịch Vụ ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy dịch vụ nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tên Dịch Vụ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Danh Mục</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Giá</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Trạng Thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Mô Tả</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{service.category || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {Number(service.price).toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getAvailabilityBadge(service.is_available !== undefined ? service.is_available : service.is_active)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {service.description || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(service)}
                            className="flex items-center gap-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(service.id)}
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
                {editingService ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Dịch Vụ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh Mục
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Không chọn</option>
                    <option value="food">Ẩm thực</option>
                    <option value="transport">Vận chuyển</option>
                    <option value="entertainment">Giải trí</option>
                    <option value="spa">Spa & Massage</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={formData.is_available ? 'true' : 'false'}
                    onChange={(e) => handleInputChange('is_available', e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Khả dụng</option>
                    <option value="false">Không khả dụng</option>
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
                  placeholder="Mô tả chi tiết về dịch vụ..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Hủy
                </Button>
                <Button type="submit">
                  {editingService ? 'Cập Nhật' : 'Thêm Mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ServiceManagement;
