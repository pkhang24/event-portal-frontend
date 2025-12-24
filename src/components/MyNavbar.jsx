import { useEffect, useState } from 'react';
import { Layout, Menu, Dropdown, Space, Input, Button, Typography, Badge, Popover, List, Avatar, Empty } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    UserOutlined, 
    LogoutOutlined, 
    QrcodeOutlined,
    DownOutlined,
    SearchOutlined,
    BellOutlined, 
    CalendarOutlined, 
    CheckCircleOutlined, 
    InfoCircleOutlined
} from '@ant-design/icons';

import { getCurrentUser, logout } from '../services/authService';
import NotificationBell from './NotificationBell';

import logoImage from '../assets/logo-cnkt_white.png'; 

const { Header } = Layout;
const { Text } = Typography;

const MyNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
    }, [location]); 

    const handleLogout = () => {
        logout(); 
        setUser(null); 
        navigate('/login'); 
    };

    const userMenuItems = [ 
        { key: 'profile', label: <Link to="/profile">Thông tin tài khoản</Link> },
        user?.role === 'STUDENT' && { key: 'my-tickets', label: <Link to="/my-tickets">Vé của tôi</Link> },
        user?.role === 'STUDENT' && { key: 'history', label: <Link to="/history">Lịch sử tham gia</Link> },
        user?.role === 'POSTER' && { key: 'manage-events', label: <Link to="/manage-events">Quản lý Sự kiện</Link> },
        user?.role === 'ADMIN' && { key: 'admin', label: <Link to="/admin">Admin Dashboard</Link> },
        user?.role === 'POSTER' && { key: 'check-in', label: <Link to="/check-in">Điểm danh (QR)</Link> },
        { type: 'divider' },
        { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout }
    ].filter(Boolean);

    const navLinkStyle = {
        color: '#333',
        fontWeight: 500,
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'color 0.3s',
        textDecoration: 'none'
    };

    const NavItem = ({ to, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                style={{ 
                    ...navLinkStyle, 
                    color: isActive ? '#1677ff' : '#333',
                    fontWeight: isActive ? 700 : 500
                }}
                className="nav-hover-effect"
            >
                {children}
            </Link>
        );
    };

    return (
        <Header style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 1000, 
            width: '100%', 
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 40px',
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px'
        }}>
            
            {/* === LOGO + TÌM KIẾM === */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                {/* Logo */}
                <div 
                    className="logo" 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    onClick={() => navigate('/')}
                >
                    <img 
                        src={logoImage} 
                        alt="Logo" 
                        style={{ height: '45px' }} // Logo to hơn chút
                    />
                </div>

                {/* Thanh tìm kiếm */}
                <Input 
                    placeholder="Tìm kiếm sự kiện..." 
                    prefix={<SearchOutlined style={{ color: '#9ca3af', fontSize: '18px' }} />}
                    onPressEnter={(e) => navigate(`/search?q=${e.target.value}`)}
                    style={{ 
                        width: '400px', 
                        borderRadius: '8px',
                        background: '#f3f4f6',
                        border: '1px solid transparent',
                        padding: '8px 12px',
                        fontSize: '14px'
                    }}
                    // onFocus={(e) => e.target.style.background = '#fff'}
                    // onBlur={(e) => e.target.style.background = '#f3f4f6'}
                />
            </div>

            {/* === NAV LINKS + USER INFO === */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                
                <div style={{ display: 'flex', gap: '40px' }}>
                    <NavItem to="/">Trang chủ</NavItem>
                    <NavItem to="/events">Sự kiện</NavItem>
                    <NavItem to="/about">Giới thiệu</NavItem>
                </div>

                <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>

                {/* Thông tin User / Nút Đăng nhập */}
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                        <NotificationBell />

                        <Dropdown 
                            menu={{ items: userMenuItems }} 
                            trigger={['hover']}
                            arrow={true} 
                            placement="bottomRight"
                        >
                            <a onClick={(e) => e.preventDefault()} style={{ color: '#333', cursor: 'pointer' }}>
                                <Space align="center">
                                    <div style={{ 
                                        width: '32px', height: '32px', background: '#1677ff', color: '#fff', 
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600
                                    }}>
                                        {user.hoTen ? user.hoTen.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{user.hoTen}</span>
                                    <DownOutlined style={{ fontSize: '12px', color: '#999' }} />
                                </Space>
                            </a>
                        </Dropdown>
                    </div>
                ) : (
                    <Button type="primary" shape="round" size="large" onClick={() => navigate('/login')} style={{ fontWeight: 600, padding: '0 30px' }}>
                        Đăng nhập
                    </Button>
                )}
            </div>
        </Header>
    );
};

export default MyNavbar;