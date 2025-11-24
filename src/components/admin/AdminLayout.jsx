import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { 
    UserOutlined, CalendarOutlined, AppstoreOutlined, 
    PictureOutlined, BarChartOutlined, LogoutOutlined,
    MenuUnfoldOutlined, MenuFoldOutlined, DownOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = getCurrentUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Menu bên trái
    const menuItems = [
        {
            key: '/admin',
            icon: <BarChartOutlined />,
            label: <Link to="/admin">Dashboard</Link>,
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: <Link to="/admin/users">Quản lý Người dùng</Link>,
        },
        {
            key: '/admin/events',
            icon: <CalendarOutlined />,
            label: <Link to="/admin/events">Quản lý Sự kiện</Link>,
        },
        {
            key: '/admin/categories',
            icon: <AppstoreOutlined />,
            label: <Link to="/admin/categories">Quản lý Danh mục</Link>,
        },
        {
            key: '/admin/banners',
            icon: <PictureOutlined />,
            label: <Link to="/admin/banners">Quản lý Banner</Link>,
        },
        {
            key: '/admin/stats',
            icon: <LineChartOutlined />,
            label: <Link to="/admin/stats">Báo cáo & Thống kê</Link>,
        },
    ];

    // Dropdown menu cho Avatar
    const userMenu = (
        <Menu items={[
            { key: '1', label: <Link to="/">Về trang chủ</Link> },
            { key: '2', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout, danger: true }
        ]} />
    );

    return (
        <Layout style={{ height: '97vh', overflow: 'hidden' }}>
            
            {/* SIDER: Giữ nguyên */}
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed} 
                theme="light" 
                width={250} 
                style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.1)', zIndex: 10 }} 
            >
                <div className="logo" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold', color: '#1677ff' }}>
                    {collapsed ? 'AD' : 'Admin Dashboard'}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ borderRight: 0 }}
                />
            </Sider>

            {/* LAYOUT PHẢI: Chứa Header + Content */}
            <Layout style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f2f5' }}> 
                {/* ^^^ SỬA 1: Bỏ 'overflowY: auto' ở đây đi. Layout này giờ đứng yên. */}
                
                {/* HEADER: Đứng yên theo Layout cha */}
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexShrink: 0, zIndex: 1 }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    <Dropdown overlay={userMenu} trigger={['click']}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                                <span style={{ color: '#333', fontWeight: 500 }}>{user?.hoTen || 'Admin'}</span>
                                <DownOutlined style={{ fontSize: 12, color: '#999' }} />
                            </Space>
                        </a>
                    </Dropdown>
                </Header>

                {/* CONTENT: Chỉ mình nó được cuộn */}
                <Content style={{ 
                    margin: '24px 16px', 
                    padding: 24, 
                    minHeight: 280, 
                    background: 'none',
                    overflowY: 'auto' // <<< SỬA 2: Thêm dòng này để bật thanh cuộn cho nội dung
                }}>
                    <Outlet />
                </Content>

            </Layout>
        </Layout>
    );
};

export default AdminLayout;