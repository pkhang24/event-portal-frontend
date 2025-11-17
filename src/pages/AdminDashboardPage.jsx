// --- Thêm các import cần thiết cho Chart.js ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);
// --- Hết phần Chart.js ---

import { useEffect, useState } from 'react';

import { Layout, Typography, Card, Row, Col, Statistic, Tabs, Spin, 
    message, Button, Modal, Form, Input, Select, Popconfirm, Space, Descriptions } from 'antd';

import { UserOutlined, CalendarOutlined, CheckCircleOutlined, 
    EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';

import MyNavbar from '../components/MyNavbar';

// === IMPORT TẤT CẢ SERVICE CẦN THIẾT ===
import { 
    getDashboardStats, getAllUsers, updateUserRole, 
    getEventStats, getAllEventsForAdmin, approveEvent,
    getDeletedUsers, getDeletedEvents, restoreUser,
    permanentDeleteUser, restoreEvent, permanentDeleteEvent,
    createUser, updateUser, getAllCategories, createCategory, 
    updateCategory, deleteCategory, getAllBanners, createBanner, 
    updateBanner, deleteBanner, softDeleteUser
} from '../services/adminService';
import { softDeleteEvent } from '../services/eventService';

// === IMPORT CÁC COMPONENT TAB CON ===
import UserManagementTab from '../components/admin/UserManagementTab';
import EventManagementTab from '../components/admin/EventManagementTab';
import RecycleBinTab from '../components/admin/RecycleBinTab';
import CategoryManagementTab from '../components/admin/CategoryManagementTab';
import BannerManagementTab from '../components/admin/BannerManagementTab';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const AdminDashboardPage = () => {
    // === 1. TẤT CẢ STATE NẰM Ở CHA ===
    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState(null);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [deletedUsers, setDeletedUsers] = useState([]);
    const [deletedEvents, setDeletedEvents] = useState([]);
    
    // State loading riêng cho từng phần
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingTrash, setLoadingTrash] = useState(true);

    // --- State mới cho Modal User ---
    const [isUserModalVisible, setIsUserModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // null = tạo mới, object = sửa
    const [form] = Form.useForm(); // Hook để điều khiển Form

    // --- State mới ---
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingBanners, setLoadingBanners] = useState(true);

    // --- THÊM STATE CHO MODAL "XEM" ---
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [viewingUser, setViewingUser] = useState(null); // User đang được xem

    // === 2. CÁC HÀM FETCH DỮ LIỆU ===
    const fetchStatsAndChart = async () => {
        setLoadingStats(true);
        try {
            const [statsData, chartRes] = await Promise.all([
                getDashboardStats(),
                getEventStats()
            ]);
            setStats(statsData);
            
            // Xử lý dữ liệu biểu đồ
            const eventStatsData = chartRes.data;
            if (eventStatsData && Object.keys(eventStatsData).length > 0) {
                setChartData({
                    labels: Object.keys(eventStatsData),
                    datasets: [{
                        label: 'Số lượt đăng ký',
                        data: Object.values(eventStatsData),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    }],
                });
            } else {
                setChartData(null);
            }
        } catch (err) {
            message.error("Lỗi tải Thống kê & Biểu đồ");
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await getAllUsers();
            setUsers(res);
        } catch (err) { message.error("Lỗi tải danh sách User"); } 
        finally { setLoadingUsers(false); }
    };

    const fetchEvents = async () => {
        setLoadingEvents(true);
        try {
            const res = await getAllEventsForAdmin();
            setEvents(res);
        } catch (err) { message.error("Lỗi tải danh sách Sự kiện"); } 
        finally { setLoadingEvents(false); }
    };

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await getAllCategories();
            setCategories(res.data);
        } catch (err) { message.error("Lỗi tải Danh mục"); }
        finally { setLoadingCategories(false); }
    };

    const fetchBanners = async () => {
        setLoadingBanners(true);
        try {
            const res = await getAllBanners();
            setBanners(res.data);
        } catch (err) { message.error("Lỗi tải Banners"); }
        finally { setLoadingBanners(false); }
    };

    const fetchTrash = async () => {
        setLoadingTrash(true);
        try {
            const [usersRes, eventsRes] = await Promise.all([
                getDeletedUsers(),
                getDeletedEvents()
            ]);
            setDeletedUsers(usersRes.data);
            setDeletedEvents(eventsRes.data);
        } catch (err) { message.error("Lỗi tải Thùng rác"); }
        finally { setLoadingTrash(false); }
    };

    // Load tất cả khi vào trang
    useEffect(() => {
        fetchStatsAndChart();
        fetchUsers();
        fetchEvents();
        fetchCategories();
        fetchBanners();
        fetchTrash();
    }, []);

    // === 3. CÁC HÀM HÀNH ĐỘNG (Actions) ===

    // --- Tab 1 ---
    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            message.success("Cập nhật quyền thành công!");
            fetchUsers(); // Tải lại Tab 1
        } catch (err) { message.error("Cập nhật thất bại."); }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await softDeleteUser(userId);
            message.success("Đã chuyển User vào thùng rác!");
            fetchUsers(); // Tải lại Tab 1
            fetchTrash(); // Tải lại Tab 3
        } catch (err) { message.error("Xóa thất bại."); }
    };

    const handleOpenUserModal = (userRecord = null) => {
        setEditingUser(userRecord);
        if (userRecord) {
            // Sửa: Điền thông tin user vào form
            form.setFieldsValue(userRecord);
        } else {
            // Thêm: Reset form
            form.resetFields();
            form.setFieldsValue({ role: 'STUDENT' }); // Gán role mặc định
        }
        setIsUserModalVisible(true);
    };

    const handleCancelUserModal = () => {
        setIsUserModalVisible(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (values) => {
        try {
            if (editingUser) {
                // Sửa
                await updateUser(editingUser.id, values);
                message.success("Cập nhật user thành công!");
            } else {
                // Thêm
                await createUser(values);
                message.success("Tạo user mới thành công!");
            }
            fetchUsers(); // Tải lại danh sách user
            setIsUserModalVisible(false);
        } catch (err) {
            message.error(err.response?.data?.message || "Thao tác thất bại.");
        }
    };

    // --- THÊM HÀM MỞ/ĐÓNG MODAL "XEM" ---
    const handleOpenViewModal = (userRecord) => {
        setViewingUser(userRecord); // Lưu user đang xem
        setIsViewModalVisible(true); // Mở modal
    };

    const handleCloseViewModal = () => {
        setIsViewModalVisible(false);
        setViewingUser(null);
    };

    // --- Tab 2 ---
    const handleApproveEvent = async (id) => {
        try {
            await approveEvent(id);
            message.success("Duyệt sự kiện thành công!");
            fetchEvents(); // Tải lại Tab 2
        } catch (err) { message.error("Duyệt sự kiện thất bại."); }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await softDeleteEvent(id);
            message.success("Đã chuyển sự kiện vào thùng rác!");
            fetchEvents(); // Tải lại Tab 2
            fetchTrash(); // Tải lại Tab 3 (Fix lỗi của bạn)
        } catch (err) { message.error("Xóa sự kiện thất bại."); }
    };

    // --- Tab 3 ---
    const handleRestoreUser = async (id) => {
        try {
            await restoreUser(id);
            message.success("Khôi phục người dùng!");
            fetchUsers(); // Tải lại Tab 1
            fetchTrash(); // Tải lại Tab 3
        } catch (err) { message.error("Khôi phục thất bại."); }
    };

    const handlePermanentDeleteUser = async (id) => {
        try {
            await permanentDeleteUser(id);
            message.success("Đã xóa vĩnh viễn!");
            fetchTrash(); // Tải lại Tab 3
        } catch (err) { message.error(err.response?.data?.message || "Xóa thất bại."); }
    };

    const handleRestoreEvent = async (id) => {
        try {
            await restoreEvent(id);
            message.success("Khôi phục sự kiện!");
            fetchEvents(); // Tải lại Tab 2 (Sự kiện)
            fetchTrash(); // Tải lại Tab 3
        } catch (err) { message.error("Khôi phục thất bại."); }
    };
    
    const handlePermanentDeleteEvent = async (id) => {
        try {
            await permanentDeleteEvent(id);
            message.success("Đã xóa vĩnh viễn!");
            fetchTrash(); // Tải lại Tab 3
        } catch (err) { message.error(err.response?.data?.message || "Xóa thất bại."); }
    };

    // --- Tab 4: Category Actions ---
    const handleSaveCategory = async (id, values) => {
        try {
            if (id) { // Sửa
                await updateCategory(id, values);
                message.success("Cập nhật danh mục thành công!");
            } else { // Thêm
                await createCategory(values);
                message.success("Tạo danh mục thành công!");
            }
            fetchCategories(); // Tải lại
        } catch (err) { message.error("Thao tác thất bại."); }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await deleteCategory(id);
            message.success("Xóa danh mục thành công!");
            fetchCategories(); // Tải lại
        } catch (err) { message.error("Xóa thất bại. (Có thể danh mục đang được sử dụng?)"); }
    };

    // --- Tab 5: Banner Actions ---
    const handleSaveBanner = async (id, values) => {
        try {
            if (id) {
                await updateBanner(id, values);
                message.success("Cập nhật banner thành công!");
            } else {
                await createBanner(values);
                message.success("Tạo banner thành công!");
            }
            fetchBanners();
        } catch (err) { message.error("Thao tác thất bại."); }
    };

    const handleDeleteBanner = async (id) => {
        try {
            await deleteBanner(id);
            message.success("Xóa banner thành công!");
            fetchBanners();
        } catch (err) { message.error("Xóa thất bại."); }
    };


    // Cấu hình biểu đồ
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Top 5 Sự kiện được đăng ký nhiều nhất',
                font: { size: 18 }
            },
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
    };

    // === 4. RENDER GIAO DIỆN ===
    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <MyNavbar />
            <Content style={{ padding: '0 50px', marginTop: 30 }}>
                <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
                    <Title level={2}>Admin Dashboard</Title>
                    
                    {/* Phần 1: Thống kê */}
                    <Row gutter={16} style={{ marginBottom: 30 }}>
                        <Col span={8}><Card><Statistic title="Tổng User" value={stats.totalUsers} prefix={<UserOutlined />} loading={loadingStats} /></Card></Col>
                        <Col span={8}><Card><Statistic title="Tổng Sự kiện" value={stats.totalEvents} prefix={<CalendarOutlined />} loading={loadingStats} /></Card></Col>
                        <Col span={8}><Card><Statistic title="Lượt đăng ký" value={stats.totalRegistrations} prefix={<CheckCircleOutlined />} loading={loadingStats} /></Card></Col>
                    </Row>

                    {/* Phần 2: Biểu đồ */}
                    <Row gutter={16} style={{ marginBottom: 30 }}>
                        <Col span={24}>
                            <Card title="Thống kê Sự kiện">
                                {loadingStats ? <div style={{textAlign: 'center', padding: 50}}><Spin /></div> :
                                 (chartData ? <Bar options={chartOptions} data={chartData} /> : <p>Chưa có dữ liệu để vẽ biểu đồ.</p>)}
                            </Card>
                        </Col>
                    </Row>

                    {/* Phần 3: Tabs */}
                    <Tabs defaultActiveKey="1" 
                    // Thêm nút "Tạo User" vào thanh Tab
                        tabBarExtraContent={
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={() => handleOpenUserModal(null)}
                            >
                                Thêm tài khoản mới
                            </Button>
                        }
                    items={[
                        {
                            key: '1',
                            label: 'Quản lý Người dùng',
                            children: <UserManagementTab 
                                        users={users} 
                                        loading={loadingUsers} 
                                        onRoleChange={handleRoleChange} 
                                        onEdit={handleOpenUserModal}
                                        onDelete={handleDeleteUser} 
                                        onView={handleOpenViewModal}
                                      />
                        },
                        {
                            key: '2',
                            label: 'Quản lý Sự kiện',
                            children: <EventManagementTab 
                                        events={events} 
                                        loading={loadingEvents} 
                                        onApprove={handleApproveEvent} 
                                        onDelete={handleDeleteEvent} 
                                      />
                        },
                        { // <-- TAB MỚI 4
                            key: '3',
                            label: 'Quản lý Danh mục',
                            children: <CategoryManagementTab 
                                        categories={categories}
                                        loading={loadingCategories}
                                        onSave={handleSaveCategory}
                                        onDelete={handleDeleteCategory}
                                      />
                        },
                        { // <-- TAB MỚI 5
                            key: '4',
                            label: 'Quản lý Banner',
                            children: <BannerManagementTab 
                                        banners={banners}
                                        loading={loadingBanners}
                                        onSave={handleSaveBanner}
                                        onDelete={handleDeleteBanner}
                                      />
                        },
                        { 
                            key: '5',
                            label: 'Thùng rác',
                            children: <RecycleBinTab
                                        deletedUsers={deletedUsers}
                                        deletedEvents={deletedEvents}
                                        loading={loadingTrash}
                                        onRestoreUser={handleRestoreUser}
                                        onPermanentDeleteUser={handlePermanentDeleteUser}
                                        onRestoreEvent={handleRestoreEvent}
                                        onPermanentDeleteEvent={handlePermanentDeleteEvent}
                                      />
                        }
                    ]} />
                </div>
            </Content>

            {/* === MODAL (FORM) TẠO/SỬA USER === */}
            <Modal
                title={editingUser ? "Sửa thông tin người dùng" : "Tạo tài khoản mới"}
                open={isUserModalVisible}
                onCancel={handleCancelUserModal}
                footer={null}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onFinish={handleSaveUser} name="user_form">
                    <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input disabled={editingUser} />
                    </Form.Item>
                    {/* Chỉ yêu cầu mật khẩu khi TẠO MỚI */}
                    {!editingUser && (
                        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
                            <Input.Password placeholder="Mật khẩu ban đầu" />
                        </Form.Item>
                    )}
                    <Form.Item name="mssv" label="MSSV" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="soDienThoai" label="Số điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="khoa" label="Khoa">
                        <Input />
                    </Form.Item>
                    <Form.Item name="lopHoc" label="Lớp học">
                        <Input />
                    </Form.Item>
                    <Form.Item name="nganhHoc" label="Ngành học">
                        <Input />
                    </Form.Item>
                    {/* Chỉ cho phép set Role khi TẠO MỚI */}
                    {!editingUser && (
                         <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                            <Select placeholder="Chọn vai trò">
                                <Option value="STUDENT">Student</Option>
                                <Option value="POSTER">Poster</Option>
                            </Select>
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            {editingUser ? "Cập nhật" : "Lưu"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* === MODAL "XEM THÔNG TIN USER" MỚI === */}
            <Modal
                title="Thông tin chi tiết User"
                open={isViewModalVisible}
                onCancel={handleCloseViewModal}
                footer={[ // Chỉ cần nút Đóng
                    <Button key="close" type="primary" onClick={handleCloseViewModal}>
                        Đóng
                    </Button>
                ]}
            >
                {viewingUser && (
                    <Descriptions bordered column={1}>
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

        </Layout>
    );
};

export default AdminDashboardPage;