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
  ShieldCheckIcon
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

      setUsers(usersData);
      setPagination(prev => ({ ...prev, totalPages: responseData.pagination?.totalPages || 1 }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      department: user.department,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      if (selectedUser.role === 'customer') {
        await apiService.admin.customers.update(selectedUser.id, formData);
      } else if (selectedUser.role === 'staff') {
        await apiService.admin.staff.update(selectedUser.id, formData);
      } else {
        await apiService.users.update(selectedUser.id, formData);
      }
      toast.success('Cập nhật thành công');
      setShowEditDialog(false);
      fetchUsers();
    } catch (error) {
      toast.error('Cập nhật thất bại');
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
      toast.error(error.response?.data?.message || 'Tạo người dùng thất bại');
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
      const errorMessage = error.response?.data?.message || 'Không thể xóa người dùng';
      toast.error(errorMessage);
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
            <select
              value={filters.status || "all"}
              onChange={(e) => setFilters({ ...filters, status: e.target.value === "all" ? "" : e.target.value })}
              className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thông tin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
                          {user.department && (
                            <p className="text-xs text-gray-500">{user.department}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.total_bookings !== undefined && (
                            <p className="text-sm text-gray-900">
                              {user.total_bookings} bookings
                            </p>
                          )}
                          {user.total_tasks !== undefined && (
                            <p className="text-sm text-gray-900">
                              {user.completed_tasks}/{user.total_tasks} tasks
                            </p>
                          )}
                          {user.total_spent && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.total_spent)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Người Dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            {formData.role === 'staff' && (
              <div>
                <label className="text-sm font-medium">Phòng ban</label>
                <Input
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
