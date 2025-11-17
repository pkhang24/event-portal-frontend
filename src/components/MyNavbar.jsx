import { useEffect, useState } from 'react';
import { Layout, Menu, Dropdown, Space, Input, Button } from 'antd'; // Import thêm Button
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    HomeOutlined, 
    UserOutlined, 
    LoginOutlined, 
    LogoutOutlined, 
    CalendarOutlined,
    SettingOutlined,
    QrcodeOutlined,
    DownOutlined,
    TagsOutlined,
    HistoryOutlined,
    AppstoreAddOutlined
} from '@ant-design/icons';
import { getCurrentUser, logout } from '../services/authService';

const { Header } = Layout;

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
        navigate('/'); 
    };

    // --- 1. SỬA LẠI ĐÂY: userMenuItems là MỘT MẢNG, không phải <Menu> ---
    const userMenuItems = [ 
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link to="/profile">Thông tin tài khoản</Link>,
        },
        user?.role === 'STUDENT' && {
            key: 'my-tickets',
            icon: <TagsOutlined />,
            label: <Link to="/my-tickets">Vé của tôi</Link>,
        },
        user?.role === 'STUDENT' && {
            key: 'history',
            icon: <HistoryOutlined />,
            label: <Link to="/history">Lịch sử tham gia</Link>,
        },
        (user?.role === 'POSTER' || user?.role === 'ADMIN') && {
            key: 'manage-events',
            icon: <AppstoreAddOutlined />,
            label: <Link to="/manage-events">Sự kiện của tôi</Link>,
        },
        (user?.role === 'POSTER' || user?.role === 'ADMIN') && {
            key: 'check-in',
            icon: <QrcodeOutlined />,
            label: <Link to="/check-in">Điểm danh (QR)</Link>,
        },
        user?.role === 'ADMIN' && {
            key: 'admin',
            icon: <SettingOutlined />,
            label: <Link to="/admin">Admin Dashboard</Link>,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        }
    ].filter(Boolean); // Lọc ra các item 'false' (do role không khớp)
    // ---------------- HẾT SỬA 1 -------------------

    // --- 2. TẠO MENU CHÍNH (Bên cạnh Logo) ---
    const mainNavItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: <Link to="/">Trang chủ</Link>,
        },
    ];

    // --- 3. RENDER RA HEADER VỚI FLEXBOX ---
    return (
        <Header style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 1, 
            width: '100%', 
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center'
        }}>
            
            {/* --- PHẦN BÊN TRÁI: Logo & Nav Chính --- */}
            <Space size="large">
                <div 
                    className="logo" 
                    style={{ color: '#000', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    EVENT PORTAL
                </div>
                <Menu
                    theme="light"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={mainNavItems}
                    style={{ borderBottom: 'none', background: 'none' }}
                />
            </Space>

            {/* --- PHẦN GIỮA: Thanh Tìm kiếm --- */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
                <Input.Search 
                    placeholder="Tìm kiếm sự kiện..." 
                    onSearch={(val) => navigate(`/search?q=${val}`)} 
                    style={{ width: '100%', maxWidth: 450 }}
                />
            </div>

            {/* --- PHẦN BÊN PHẢI: Đăng nhập/Thông tin User --- */}
            <Space size="middle">
                {user ? (
                    // Nếu đã đăng nhập
                    <Dropdown 
                        menu={{ 
                            items: userMenuItems, // Dùng trực tiếp mảng
                            styles: { // Style cho item BÊN TRONG
                                item: {
                                    padding: '10px 16px',
                                    fontSize: '15px'
                                }
                            }
                        }} 
                        
                        // === THÊM DÒNG NÀY ĐỂ TẠO KHOẢNG CÁCH ===
                        arrow={true} 

                        overlayStyle={{ marginTop: '10px' }}
                        // =======================================

                        trigger={['hover']}
                    >
                        <a onClick={(e) => e.preventDefault()} style={{ color: 'rgba(0, 0, 0, 0.88)' }}>
                            <Space>
                                Hi, {user.hoTen}
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                ) : (
                    // Nếu chưa đăng nhập
                    <Button type="primary" onClick={() => navigate('/login')}>
                        Đăng nhập
                    </Button>
                )}
            </Space>
        </Header>
    );
};

export default MyNavbar;