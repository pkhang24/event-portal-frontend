import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { 
    UserOutlined, CalendarOutlined, AppstoreOutlined, 
    PictureOutlined, BarChartOutlined, LogoutOutlined,
    MenuUnfoldOutlined, MenuFoldOutlined, DownOutlined,
    DashboardOutlined, ThunderboltFilled
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';
import NotificationBell from '../NotificationBell';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = getCurrentUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/admin',
            icon: <BarChartOutlined />,
            label: <Link to="/admin">Tổng quan</Link>,
        },
        {
            type: 'divider', // Đường kẻ phân cách
        },
        {
            key: 'quan-ly', 
            label: 'QUẢN LÝ', 
            type: 'group', // Nhóm tiêu đề nhỏ
            children: [
                {
                    key: '/admin/users',
                    icon: <UserOutlined />,
                    label: <Link to="/admin/users">Người dùng</Link>,
                },
                {
                    key: '/admin/events',
                    icon: <CalendarOutlined />,
                    label: <Link to="/admin/events">Sự kiện</Link>,
                },
                {
                    key: '/admin/categories',
                    icon: <AppstoreOutlined />,
                    label: <Link to="/admin/categories">Danh mục</Link>,
                },
                {
                    key: '/admin/banners',
                    icon: <PictureOutlined />,
                    label: <Link to="/admin/banners">Banner</Link>,
                },
            ]
        },
        {
            type: 'divider',
        },
        {
            key: '/admin/stats',
            icon: <DashboardOutlined />,
            label: <Link to="/admin/stats">Báo cáo & Thống kê</Link>,
        },
    ];

    const userMenu = (
        <Menu items={[
            { key: '1', label: <Link to="/">Về trang chủ</Link> },
            { key: '2', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout, danger: true }
        ]} />
    );

    return (
        <Layout style={{ height: '100vh' }}>
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed} 
                theme="light" // Hoặc 'dark' nếu bạn thích màu tối
                width={260} 
                style={{ 
                    boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)', // Tạo bóng đổ nhẹ sang phải
                    zIndex: 10,
                    borderRight: 'none' // Bỏ viền mặc định
                }} 
            >
                {/* === LOGO AREA === */}
                <div style={{ 
                    height: 64, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    marginBottom: 16
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1677ff' }}>
                        <ThunderboltFilled style={{ fontSize: 28 }} />
                        {!collapsed && (
                            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'sans-serif', letterSpacing: '-0.5px' }}>
                                Event Portal
                            </span>
                        )}
                    </div>
                </div>

                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={['quan-ly']} // Mặc định mở nhóm Quản lý
                    items={menuItems}
                    style={{ 
                        borderRight: 0,
                        padding: '0 8px' // Thêm padding 2 bên cho menu
                    }}
                    // Tùy chỉnh class CSS (cần thêm vào file CSS)
                    className="custom-admin-menu"
                />
            </Sider>

            <Layout style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* === SỬA HEADER TẠI ĐÂY === */}
                <Header style={{ 
                    padding: '0 24px', 
                    background: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', // Đẩy 2 phần tử con ra 2 đầu
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', 
                    flexShrink: 0, 
                    zIndex: 1 
                }}>
                    
                    {/* 1. Phần tử bên TRÁI: Nút menu */}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />

                    {/* 2. Phần tử bên PHẢI: Gom Chuông và Avatar vào chung 1 div */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        
                        {/* Cái Chuông */}
                        <NotificationBell />

                        {/* Avatar User */}
                        <Dropdown overlay={userMenu} trigger={['click']}>
                            <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                                <Space>
                                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                                    <span style={{ color: '#333', fontWeight: 500 }}>{user?.hoTen || 'Admin'}</span>
                                    <DownOutlined style={{ fontSize: 12, color: '#999' }} />
                                </Space>
                            </a>
                        </Dropdown>
                    </div>

                </Header>

                <Content style={{ 
                    margin: '24px', 
                    padding: 0, // Bỏ padding ở đây để nội dung con tự lo
                    minHeight: 280, 
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    background: 'transparent'
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;