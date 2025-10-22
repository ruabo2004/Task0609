import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  UserIcon,
  EyeIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/contacts');
      setContacts(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Không thể tải danh sách tin nhắn liên hệ');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await apiService.put(`/contacts/${id}`, { status: 'read' });
      toast.success('Đã đánh dấu là đã đọc');
      fetchContacts();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) return;
    
    try {
      await apiService.delete(`/contacts/${id}`);
      toast.success('Đã xóa liên hệ');
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Không thể xóa tin nhắn');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStats = () => {
    const unreadCount = contacts.filter(c => c.status === 'unread').length;
    const readCount = contacts.filter(c => c.status === 'read').length;
    return { unreadCount, readCount, total: contacts.length };
  };

  const columns = [
    {
      header: 'Họ tên',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: (row) => (
        <div className="flex items-center">
          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
          {row.email}
        </div>
      ),
    },
    {
      header: 'Số điện thoại',
      accessor: 'phone',
      cell: (row) => row.phone && (
        <div className="flex items-center">
          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
          {row.phone}
        </div>
      ),
    },
    {
      header: 'Tiêu đề',
      accessor: 'subject',
      cell: (row) => (
        <span className="text-sm">{row.subject}</span>
      ),
    },
    {
      header: 'Ngày gửi',
      accessor: 'created_at',
      cell: (row) => (
        <span className="text-sm text-gray-600">{formatDate(row.created_at)}</span>
      ),
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'read' ? 'success' : 'warning'}>
          {row.status === 'read' ? 'Đã đọc' : 'Chưa đọc'}
        </Badge>
      ),
    },
    {
      header: 'Hành động',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewDetail(row)}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          {row.status !== 'read' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMarkAsRead(row.id)}
            >
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(row.id)}
          >
            <TrashIcon className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Form Liên hệ</h1>
        <p className="text-gray-600 mt-1">Quản lý các tin nhắn từ khách hàng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số liên hệ</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <EnvelopeIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chưa đọc</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.unreadCount}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <EnvelopeIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã đọc</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.readCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách liên hệ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có liên hệ nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      {columns.map((col, idx) => (
                        <td key={idx} className="px-6 py-4">
                          {col.cell ? col.cell(contact) : contact[col.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedContact(null);
        }}
        title="Chi tiết liên hệ"
      >
        {selectedContact && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4 mb-6">
              {/* Header with Status */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedContact.created_at)}
                  </p>
                </div>
                <Badge variant={selectedContact.status === 'read' ? 'success' : 'warning'}>
                  {selectedContact.status === 'read' ? 'Đã đọc' : 'Chưa đọc'}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedContact.email}</p>
                  </div>
                </div>
                {selectedContact.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Số điện thoại</p>
                      <p className="text-sm font-medium text-gray-900">{selectedContact.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề:</label>
              <p className="text-base text-gray-900 bg-blue-50 p-3 rounded-lg">{selectedContact.subject}</p>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung:</label>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedContact.status !== 'read' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  onClick={() => {
                    handleMarkAsRead(selectedContact.id);
                    setShowDetailModal(false);
                  }}
                  className="w-full"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Đánh dấu đã đọc
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContactManagement;

