import { useEffect, useState } from 'react';
import { Layout, Menu, Dropdown, Space, Input, Button, Typography } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    UserOutlined, 
    LogoutOutlined, 
    QrcodeOutlined,
    DownOutlined,
    SearchOutlined,
    BellOutlined
} from '@ant-design/icons';
import { getCurrentUser, logout } from '../services/authService';

// Import Logo của bạn
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

    // Menu Dropdown của User
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

    // Style cho Link điều hướng (Nav Links)
    const navLinkStyle = {
        color: '#333',
        fontWeight: 500,
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'color 0.3s',
        textDecoration: 'none' // Bỏ gạch chân mặc định
    };

    // Hàm render Link với logic active (tô màu khi đang ở trang đó)
    const NavItem = ({ to, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                style={{ 
                    ...navLinkStyle, 
                    color: isActive ? '#1677ff' : '#333', // Màu xanh nếu đang active
                    fontWeight: isActive ? 700 : 500
                }}
                className="nav-hover-effect" // Class để CSS hover (xem bên dưới)
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
            background: '#fff', // Nền trắng
            borderBottom: '1px solid #f0f0f0',
            padding: '0 40px', // Padding rộng hơn chút
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between', // Đẩy 2 khối ra 2 đầu
            height: '72px' // Tăng chiều cao Header một chút cho thoáng
        }}>
            
            {/* === KHỐI BÊN TRÁI: LOGO + TÌM KIẾM === */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                {/* 1. Logo */}
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

                {/* 2. Thanh tìm kiếm (Nằm gần logo & Nổi bật) */}
                <Input 
                    placeholder="Tìm kiếm sự kiện..." 
                    prefix={<SearchOutlined style={{ color: '#9ca3af', fontSize: '18px' }} />}
                    onPressEnter={(e) => navigate(`/search?q=${e.target.value}`)}
                    style={{ 
                        width: '400px', 
                        borderRadius: '8px',
                        background: '#f3f4f6', // Nền xám nhạt để nổi bật trên nền trắng
                        border: '1px solid transparent', // Bỏ viền đen
                        padding: '8px 12px',
                        fontSize: '14px'
                    }}
                    // Thêm hiệu ứng focus
                    // onFocus={(e) => e.target.style.background = '#fff'}
                    // onBlur={(e) => e.target.style.background = '#f3f4f6'}
                />
            </div>

            {/* === KHỐI BÊN PHẢI: NAV LINKS + USER INFO === */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                
                {/* 3. Các mục điều hướng (Trang chủ, Sự kiện, Giới thiệu) */}
                <div style={{ display: 'flex', gap: '40px' }}> {/* Dùng Flexbox thay vì Space để dễ chỉnh */}
                    <NavItem to="/">Trang chủ</NavItem>
                    <NavItem to="/events">Sự kiện</NavItem>
                    <NavItem to="/about">Giới thiệu</NavItem>
                </div>

                {/* Vách ngăn nhỏ */}
                <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>

                {/* 4. Thông tin User / Nút Đăng nhập */}
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Icon thông báo (trang trí thêm cho đẹp) */}
                        <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: '18px' }} />} />

                        <Dropdown 
                            menu={{ items: userMenuItems }} 
                            trigger={['hover']}
                            arrow={true} // Mũi tên
                            placement="bottomRight"
                        >
                            <a onClick={(e) => e.preventDefault()} style={{ color: '#333', cursor: 'pointer' }}>
                                <Space align="center">
                                    <div style={{ 
                                        width: '32px', height: '32px', background: '#1677ff', color: '#fff', 
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600
                                    }}>
                                        {/* Lấy chữ cái đầu của tên làm Avatar */}
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