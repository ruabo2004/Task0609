import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    status: '',
    loyalty_level: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
        ...filters
      };

      // Use different API based on role filter
      console.log('🔍 Fetching users... Role:', filters.role, 'Page:', filters.page);
      
      let response;
      if (filters.role === 'customer') {
        response = await apiService.admin.customers.getAll(params);
      } else if (filters.role === 'staff') {
        response = await apiService.admin.staff.getAll(params);
      } else {
        response = await apiService.users.getAll(params);
      }

      const responseData = response.data;

      // Backend returns { success, message, data, pagination }
      const usersData = responseData.data || responseData.users || responseData.staff || responseData.customers || [];

      console.log('📊 Fetched users count:', usersData.length);
      if (usersData.length > 0) {
        console.log('👥 Sample user data:', usersData[0]);
      }
      
      setUsers(usersData);
      setPagination(prev => ({ ...prev, totalPages: responseData.pagination?.totalPages || 1 }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      // If already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Parse and format to YYYY-MM-DD
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setShowDetailDialog(true);
  };

  const handleEdit = (user) => {
    // Always get fresh user data from the users array
    const freshUser = users.find(u => u.id === user.id) || user;
    
    console.log('📂 Opening edit dialog for user:', user.id);
    console.log('👤 User from click:', user);
    console.log('🔄 Fresh user from state:', freshUser);
    console.log('📋 Current users array length:', users.length);
    
    setSelectedUser(freshUser);
    setFormData({
      full_name: freshUser.full_name,
      email: freshUser.email,
      phone: freshUser.phone,
      role: freshUser.role,
      is_active: freshUser.is_active,
      department: freshUser.department,
      date_of_birth: formatDateForInput(freshUser.date_of_birth),
      nationality: freshUser.nationality,
      id_number: freshUser.id_number,
      address: freshUser.address,
    });
    
    console.log('📝 Form data set:', {
      full_name: freshUser.full_name,
      email: freshUser.email,
      phone: freshUser.phone,
      department: freshUser.department,
    });
    
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      console.log('📝 Updating user:', selectedUser.id, formData);
      
      let updateResponse;
      if (selectedUser.role === 'customer') {
        updateResponse = await apiService.admin.customers.update(selectedUser.id, formData);
      } else if (selectedUser.role === 'staff') {
        updateResponse = await apiService.admin.staff.update(selectedUser.id, formData);
      } else {
        updateResponse = await apiService.users.update(selectedUser.id, formData);
      }
      
      console.log('✅ Update response:', updateResponse);
      
      toast.success('Cập nhật thành công');
      setShowEditDialog(false);
      
      // Clear selected user and form data
      setSelectedUser(null);
      setFormData({});
      
      // Reload users list to show updated data
      console.log('🔄 Fetching updated users list...');
      await fetchUsers();
      console.log('✅ Users list refreshed');
      
    } catch (error) {
      console.error('❌ Update error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Show each validation error
        error.response.data.errors.forEach(err => {
          const message = err.msg || err.message || 'Lỗi validation';
          toast.error(message);
        });
      } else {
        // Show general error message
        toast.error(error.response?.data?.message || 'Cập nhật thất bại');
      }
    }
  };

  const handleCreate = async () => {
    try {
      if (formData.role === 'staff') {
        await apiService.admin.staff.create(formData);
      } else {
        await apiService.users.create(formData);
      }
      toast.success('Tạo người dùng thành công');
      setShowCreateDialog(false);
      setFormData({});
      fetchUsers();
    } catch (error) {
      console.error('Create error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Show each validation error
        error.response.data.errors.forEach(err => {
          const message = err.msg || err.message || 'Lỗi validation';
          toast.error(message);
        });
      } else {
        // Show general error message
        toast.error(error.response?.data?.message || 'Tạo người dùng thất bại');
      }
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng ${user.full_name}?`)) return;

    try {
      if (user.role === 'staff') {
        await apiService.admin.staff.delete(user.id);
      } else {
        await apiService.users.delete(user.id);
      }
      toast.success('Xóa thành công');
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          const message = err.msg || err.message || 'Lỗi validation';
          toast.error(message);
        });
      } else {
        toast.error(error.response?.data?.message || 'Không thể xóa người dùng');
      }
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      staff: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getLoyaltyBadge = (level) => {
    const colors = {
      bronze: 'bg-orange-100 text-orange-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <Button onClick={() => { setFormData({ role: 'customer' }); setShowCreateDialog(true); }}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm Người Dùng
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Tìm kiếm..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full"
              />
            </div>
            <select
              value={filters.role || "all"}
              onChange={(e) => setFilters({ ...filters, role: e.target.value === "all" ? "" : e.target.value })}
              className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="staff">Nhân viên</option>
              <option value="customer">Khách hàng</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getRoleBadge(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{user.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(user)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            Trước
          </Button>
          <span className="flex items-center px-4">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Người Dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-900 border-b pb-2">Thông Tin Cơ Bản</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Họ tên <span className="text-red-500">*</span></label>
                  <Input
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={formData.email || ''}
                    disabled
                    className="bg-gray-100"
                    title="Email không thể thay đổi"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ngày sinh</label>
                  <Input
                    type="date"
                    value={formData.date_of_birth || ''}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quốc tịch</label>
                  <select
                    value={formData.nationality || 'Việt Nam'}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Việt Nam">Việt Nam</option>
                    <option value="Trung Quốc">Trung Quốc</option>
                    <option value="Hàn Quốc">Hàn Quốc</option>
                    <option value="Nhật Bản">Nhật Bản</option>
                    <option value="Thái Lan">Thái Lan</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Mỹ">Mỹ</option>
                    <option value="Anh">Anh</option>
                    <option value="Pháp">Pháp</option>
                    <option value="Đức">Đức</option>
                    <option value="Canada">Canada</option>
                    <option value="Úc">Úc</option>
                    <option value="Ấn Độ">Ấn Độ</option>
                    <option value="Nga">Nga</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">CCCD/CMND</label>
                  <Input
                    value={formData.id_number || ''}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    placeholder="001234567890"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>
              </div>
            </div>

            {/* Vai trò */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-900 border-b pb-2">Vai Trò</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium">Vai trò</label>
                  <select
                    value={formData.role || 'customer'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Hủy</Button>
            <Button onClick={handleUpdate}>Lưu Thay Đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Người Dùng Mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Vai trò <span className="text-red-500">*</span></label>
              <select
                value={formData.role || "customer"}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="customer">Khách hàng</option>
                <option value="staff">Nhân viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mật khẩu <span className="text-red-500">*</span></label>
              <Input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Họ tên <span className="text-red-500">*</span></label>
              <Input
                value={formData.full_name || ''}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0901234567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Người Dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 border-b pb-2">Thông Tin Cơ Bản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Họ tên</label>
                    <p className="text-base font-medium">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-base">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                    <p className="text-base">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày sinh</label>
                    <p className="text-base">{selectedUser.date_of_birth ? new Date(selectedUser.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Quốc tịch</label>
                    <p className="text-base">{selectedUser.nationality || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">CCCD/CMND</label>
                    <p className="text-base">{selectedUser.id_number || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Địa chỉ</label>
                    <p className="text-base">{selectedUser.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Vai trò</label>
                    <p className="text-base">
                      <Badge className={getRoleBadge(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                    </p>
                  </div>
                  {selectedUser.department && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phòng ban</label>
                      <p className="text-base">{selectedUser.department}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thống kê hoạt động */}
              {(selectedUser.total_bookings !== undefined || selectedUser.total_tasks !== undefined || selectedUser.loyalty_level) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 border-b pb-2">Thống Kê Hoạt Động</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.total_bookings !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tổng số đặt phòng</label>
                        <p className="text-base font-medium">{selectedUser.total_bookings}</p>
                      </div>
                    )}
                    {selectedUser.total_spent && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tổng chi tiêu</label>
                        <p className="text-base font-medium text-green-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedUser.total_spent)}
                        </p>
                      </div>
                    )}
                    {selectedUser.total_tasks !== undefined && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tổng số nhiệm vụ</label>
                          <p className="text-base font-medium">{selectedUser.total_tasks}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nhiệm vụ hoàn thành</label>
                          <p className="text-base font-medium text-green-600">{selectedUser.completed_tasks}</p>
                        </div>
                      </>
                    )}
                    {selectedUser.loyalty_level && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Hạng thành viên</label>
                        <p className="text-base">
                          <Badge className={getLoyaltyBadge(selectedUser.loyalty_level)}>
                            {selectedUser.loyalty_level}
                          </Badge>
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                      <p className="text-base">
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                    {selectedUser.last_login && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Đăng nhập lần cuối</label>
                        <p className="text-base">
                          {new Date(selectedUser.last_login).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
