import { useState, useEffect } from 'react';
import { Card, Button, Radio, message, Modal, Form, Input, Select, Descriptions } from 'antd';
import { PlusOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import UserManagementTab from '../../components/admin/UserManagementTab';
import { toggleUserLock } from '../../services/adminService';
import { 
    getAllUsers, createUser, updateUser, softDeleteUser, updateUserRole, // CRUD
    getDeletedUsers, restoreUser, permanentDeleteUser // Trash
} from '../../services/adminService';

const { Option } = Select;

const AdminUsersPage = () => {
    const [view, setView] = useState('list'); // 'list' hoặc 'trash'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State cho Modal Tạo/Sửa
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage(); // Dùng hook message

    // State cho Modal Xem
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // Nếu view='list' lấy tất cả, nếu view='trash' lấy thùng rác
            const data = view === 'list' ? await getAllUsers() : await getDeletedUsers();
            console.log("Dữ liệu tải về:", data);
            setUsers(data); // Service đã trả về data rồi, không cần .data
        } catch (err) { messageApi.error("Lỗi tải dữ liệu"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [view]);

    // --- HANDLERS (Xử lý hành động) ---

    const handleRoleChange = async (id, role) => {
        try { await updateUserRole(id, role); messageApi.success("Đổi quyền thành công!"); fetchData(); }
        catch (e) { messageApi.error("Lỗi đổi quyền"); }
    };

    const handleToggleLock = async (userId) => {
        try {
            // Phải có 'await' ở đây để đợi Backend trả lời xong
            await toggleUserLock(userId);
            
            // Nếu dòng trên thành công (không lỗi), dòng này mới chạy
            messageApi.success("Đã thay đổi trạng thái khóa tài khoản!");
            
            fetchData(); // Tải lại danh sách để cập nhật icon
        } catch (err) {
            // Nếu dòng 'await' ở trên bị lỗi, nó nhảy thẳng xuống đây (bỏ qua message success)
            console.error("Lỗi khóa user:", err);
            messageApi.error("Thao tác thất bại.");
        }
    };

    // Xử lý Xóa (Soft hoặc Hard tùy vào view)
    const handleDelete = async (id) => {
        try {
            if (view === 'list') {
                await softDeleteUser(id);
                messageApi.success("Đã chuyển vào thùng rác!");
            } else {
                await permanentDeleteUser(id);
                messageApi.success("Đã xóa vĩnh viễn!");
            }
            fetchData();
        } catch (e) { messageApi.error("Xóa thất bại"); }
    };

    const handleRestore = async (id) => {
        try { await restoreUser(id); messageApi.success("Khôi phục thành công!"); fetchData(); }
        catch (e) { messageApi.error("Lỗi khôi phục"); }
    };

    // Xử lý Modal Tạo/Sửa
    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        if (user) form.setFieldsValue(user);
        else { form.resetFields(); form.setFieldsValue({ role: 'STUDENT' }); }
        setIsModalVisible(true);
    };

    const handleSave = async (values) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, values);
                messageApi.success("Cập nhật thành công!");
            } else {
                await createUser(values);
                messageApi.success("Tạo mới thành công!");
            }
            setIsModalVisible(false);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || "Thao tác thất bại";
            messageApi.error(msg);
        }
    };

    // Xử lý Modal Xem
    const handleOpenView = (user) => { setViewingUser(user); setIsViewModalVisible(true); };

    return (
        <div style={{ padding: '20px' }}> {/* Thêm padding */}
            {contextHolder}
            <Card 
                title={view === 'list' ? "Quản lý Người dùng" : "Thùng rác Người dùng"} 
                extra={
                    <Radio.Group value={view} onChange={e => setView(e.target.value)} buttonStyle="solid">
                        <Radio.Button value="list"><UnorderedListOutlined /> Danh sách</Radio.Button>
                        <Radio.Button value="trash"><DeleteOutlined /> Thùng rác</Radio.Button>
                    </Radio.Group>
                }
            >
                {/* Chỉ hiện nút Thêm mới ở view List */}
                {view === 'list' && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)} style={{ marginBottom: 16 }}>
                        Thêm tài khoản mới
                    </Button>
                )}

                {/* Tái sử dụng UserManagementTab nhưng truyền props linh hoạt hơn */}
                {/* Lưu ý: Bạn cần sửa UserManagementTab một chút để nó hỗ trợ hiển thị nút Restore/Delete vĩnh viễn khi ở chế độ trash */}
                {/* Hoặc đơn giản là dùng lại code Table ở đây */}
                
                <UserManagementTab 
                    users={users} 
                    loading={loading}
                    // Truyền view xuống để component con biết đang ở chế độ nào mà render nút bấm
                    viewMode={view} 
                    onRoleChange={handleRoleChange}
                    onLock={handleToggleLock}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete} // Hàm này tự lo liệu soft/hard delete
                    onView={handleOpenView}
                    onRestore={handleRestore} // Thêm hàm này
                />
            </Card>

            {/* Modal Tạo/Sửa (Code form y hệt cũ) */}
            <Modal title={editingUser ? "Sửa User" : "Tạo User"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} destroyOnHidden>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input disabled={!!editingUser}/></Form.Item>
                    {!editingUser && <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}><Input.Password /></Form.Item>}
                    <Form.Item name="mssv" label="MSSV"><Input /></Form.Item>
                    <Form.Item name="soDienThoai" label="SĐT"><Input /></Form.Item>
                    <Form.Item name="khoa" label="Khoa"><Input /></Form.Item>
                    <Form.Item name="lopHoc" label="Lớp"><Input /></Form.Item>
                    <Form.Item name="nganhHoc" label="Ngành"><Input /></Form.Item>
                    {!editingUser && <Form.Item name="role" label="Vai trò"><Select><Option value="STUDENT">Student</Option><Option value="POSTER">Poster</Option></Select></Form.Item>}
                    <Button type="primary" htmlType="submit" block>Lưu</Button>
                </Form>
            </Modal>

            {/* Modal Xem (Code description y hệt cũ) */}
            <Modal title="Chi tiết" open={isViewModalVisible} onCancel={() => setIsViewModalVisible(false)} footer={null}>
                {viewingUser && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="ID">{viewingUser.id}</Descriptions.Item>
                        <Descriptions.Item label="Họ tên">{viewingUser.hoTen}</Descriptions.Item>
                        <Descriptions.Item label="Email">{viewingUser.email}</Descriptions.Item>
                        <Descriptions.Item label="MSSV">{viewingUser.mssv}</Descriptions.Item>
                        <Descriptions.Item label="Vai trò">{viewingUser.role}</Descriptions.Item>
                        <Descriptions.Item label="SĐT">{viewingUser.soDienThoai || "(Chưa có)"}</Descriptions.Item>
                        <Descriptions.Item label="Khoa">{viewingUser.khoa || "(Chưa có)"}</Descriptions.Item>
                        <Descriptions.Item label="Lớp">{viewingUser.lopHoc || "(Chưa có)"}</Descriptions.Item>
                        <Descriptions.Item label="Ngành học">{viewingUser.nganhHoc || "(Chưa có)"}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{new Date(viewingUser.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default AdminUsersPage;