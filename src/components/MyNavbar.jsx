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

import moment from 'moment';
import 'moment/locale/vi';

import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import { getCurrentUser, logout } from '../services/authService';

// Import Logo của bạn
import logoImage from '../assets/logo-cnkt_white.png'; 

const { Header } = Layout;
const { Text } = Typography;

const MyNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

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

    // Hàm tải thông báo
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const data = await getNotifications();
            setNotifications(data);
            // Đếm số chưa đọc
            const count = data.filter(n => !n.read).length; // Chú ý: Backend trả về 'read' hay 'isRead' tùy thuộc JSON map, thường là 'read' nếu dùng Lombok @Data mặc định cho boolean
            setUnreadCount(count);
        } catch (err) {
            console.error("Lỗi tải thông báo");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Có thể dùng setInterval để tự động check thông báo mới mỗi 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]); // Chạy lại khi user thay đổi

    const handleRead = async (item) => {
        if (!item.read) {
            await markNotificationAsRead(item.id);
            fetchNotifications(); // Tải lại để cập nhật UI
        }
    };

    const handleReadAll = async () => {
        await markAllNotificationsAsRead();
        fetchNotifications();
    };

    // Nội dung Popover
    const notificationContent = (
        <div style={{ width: 400, maxHeight: 400, borderRadius: '8px' ,overflowY: 'auto' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                <strong>Thông báo</strong>
                {unreadCount > 0 && (
                    <a onClick={handleReadAll} style={{ fontSize: 12 }}>Đánh dấu đã đọc hết</a>
                )}
            </div>
            <List
                dataSource={notifications}
                renderItem={item => (
                    <List.Item 
                        onClick={() => handleRead(item)}
                        style={{ 
                            padding: '18px 16px', 
                            cursor: 'pointer',
                            background: item.read ? '#fff' : '#e6f7ff', // Nền xanh nhạt nếu chưa đọc
                            transition: 'background 0.3s'
                        }}
                        className="notification-item"
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar 
                                    icon={item.type === 'SUCCESS' ? <CheckCircleOutlined /> : <InfoCircleOutlined />} 
                                    style={{ backgroundColor: item.type === 'SUCCESS' ? '#52c41a' : '#1890ff' }} 
                                />
                            }
                            title={<span style={{ fontSize: 14, fontWeight: item.read ? 400 : 600 }}>{item.title}</span>}
                            description={
                                <div>
                                    <div style={{ fontSize: 12, color: '#666' }}>{item.message}</div>
                                    <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{moment(item.createdAt).fromNow()}</div>
                                </div>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            />
        </div>
    );

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
                        <Popover 
                            content={notificationContent} 
                            trigger="click" 
                            placement="bottomRight"
                            overlayInnerStyle={{ padding: 0 }}
                        >
                            <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: '20px' }} />} />
                            </Badge>
                        </Popover>

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