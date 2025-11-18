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
import logoImage from '../assets/logo-cnkt_white.png';

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
        (user?.role === 'POSTER') && {
            key: 'manage-events',
            icon: <AppstoreAddOutlined />,
            label: <Link to="/manage-events">Sự kiện của tôi</Link>,
        },
        (user?.role === 'POSTER') && {
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
    // const mainNavItems = [
    //     {
    //         key: '/',
    //         icon: <HomeOutlined />,
    //         label: <Link to="/">Trang chủ</Link>,
    //     },
    // ];

    // --- 3. RENDER RA HEADER VỚI FLEXBOX ---
    return (
        <Header style={{ 
            display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 40px', // Tăng padding ngang cho Navbar
                    backgroundColor: '#fff', 
                    borderBottom: '1px solid #f0f0f0',
                    height: '65px'
        }}>
            
            {/* --- PHẦN BÊN TRÁI: Logo & Nav Chính --- */}
            <Space size="large">
                <div 
                    className="logo" 
                    style={{ 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center',
                        marginRight: '24px'
                    }}
                    onClick={() => navigate('/')}
                >
                    <img 
                        src={logoImage} 
                        alt="Logo Khoa Công nghệ & Kỹ thuật" 
                        style={{ 
                            height: '50px', 
                            verticalAlign: 'middle' 
                        }} 
                    />
                </div>
                <Menu
                    theme="light"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    // items={mainNavItems}
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