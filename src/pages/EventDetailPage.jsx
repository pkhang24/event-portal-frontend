import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Layout, Typography, Button, Spin, Alert, message, Card, Row, Col, Avatar, Breadcrumb, Divider, Space, Tag } from 'antd';
import { 
    CalendarOutlined, 
    EnvironmentOutlined, 
    TeamOutlined, 
    FacebookFilled, 
    GlobalOutlined, 
    LinkOutlined,
    UserOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import MyNavbar from '../components/MyNavbar';
import { getEventDetail } from '../services/eventService';
import { getCurrentUser } from '../services/authService';
import api from '../services/api';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const source = location.state?.source;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState(null);
    const user = getCurrentUser();
    const BE_URL = "http://localhost:8080/uploads";
    const isPreviewMode = id === 'preview' || location.state?.previewData;

    useEffect(() => {
        const fetchEvent = async () => {
            // 1. NẾU LÀ CHẾ ĐỘ XEM TRƯỚC
            if (isPreviewMode && location.state?.previewData) {
                setEvent(location.state.previewData);
                setLoading(false);
                return; // Dừng, không gọi API
            }

            // 2. NẾU LÀ CHẾ ĐỘ THƯỜNG (Có ID thật)
            if (id && id !== 'preview') {
                try {
                    const data = await getEventDetail(id);
                    setEvent(data);
                } catch (err) {
                    setError("Không tìm thấy sự kiện.");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchEvent();
    }, [id, location.state]);

    const handleRegister = async () => {
        if (!user) {
            message.warning("Vui lòng đăng nhập để đăng ký!");
            navigate('/login');
            return;
        }
        setRegistering(true);
        try {
            await api.post('/registrations', { eventId: id });
            message.success("Đăng ký thành công!");
            const updatedEvent = await getEventDetail(id);
            setEvent(updatedEvent);
        } catch (err) {
            message.error(err.response?.data?.message || "Đăng ký thất bại!");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
    if (error) return <Layout><MyNavbar /><Content style={{ padding: '50px' }}><Alert message={error} type="error" showIcon /></Content></Layout>;
    if (!event) return null;

    const fallbackImage = "https://placehold.co/1200x400/1677ff/ffffff?text=Event+Banner";

    // === 1. THÊM LOGIC KIỂM TRA THỜI GIAN ===
    const now = new Date();
    const startTime = new Date(event.thoiGianBatDau);
    const endTime = new Date(event.thoiGianKetThuc);

    const isUpcoming = startTime > now; // Sắp diễn ra (Được đăng ký)
    const isEnded = endTime < now;      // Đã kết thúc
    const isOngoing = startTime <= now && endTime >= now; // Đang diễn ra

    // Định nghĩa CSS để fix lỗi khoảng cách và ảnh to
    const eventContentStyle = `
        /* Class bao quanh nội dung */
        .event-content-view {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            font-size: 16px;
            line-height: 1.6;
            color: #334155;
            overflow-wrap: break-word;
        }

        /* 1. Fix lỗi Enter bị xa (khoảng cách dòng) */
        .event-content-view p {
            margin-bottom: 0px !important;
            margin-top: 0px !important;
            padding: 0 !important;
            line-height: 1.5 !important;
        }

        /* 2. Fix lỗi danh sách */
        .event-content-view ul, .event-content-view ol {
            margin: 0 !important;
            padding-left: 1.5em !important;
        }
        .event-content-view li {
            margin-bottom: 0 !important;
        }

        /* 3. Fix lỗi ẢNH BỊ TRÀN (Quan trọng) */
        .event-content-view img {
            max-width: 100% !important; /* Ảnh không bao giờ to hơn khung */
            height: auto !important;    /* Giữ tỷ lệ ảnh */
            display: block;
            margin: 15px auto;          /* Căn giữa */
            border-radius: 8px;
        }
        
        /* Style cho tiêu đề trong bài viết (nếu có) */
        .event-content-view h1, .event-content-view h2, .event-content-view h3 {
            margin-top: 15px;
            margin-bottom: 8px;
            color: #1e293b;
        }
    `;

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}> 
            <style>{eventContentStyle}</style>
            <MyNavbar />

            {/* === THÊM THANH CẢNH BÁO NẾU ĐANG XEM TRƯỚC === */}
            {isPreviewMode && (
                <Alert 
                    message="Chế độ Xem trước" 
                    description="Đây là hình ảnh hiển thị của sự kiện." 
                    type="warning" 
                    showIcon 
                    
                    // === SỬA NÚT HÀNH ĐỘNG TẠI ĐÂY ===
                    action={
                        source === 'list' ? (
                            // TRƯỜNG HỢP 1: Đến từ Danh sách quản lý -> Quay về danh sách
                            <Button size="large" type="default" onClick={() => navigate('/manage-events')}>
                                Quay lại quản lý
                            </Button>
                        ) : (
                            // TRƯỜNG HỢP 2: Đến từ Form tạo -> Quay về sửa tiếp (Logic cũ)
                            <Button size="large" type="primary" onClick={() => {
                                navigate('/create-event', { state: { formData: event } });
                            }}>
                                Quay lại chỉnh sửa
                            </Button>
                        )
                    }
                    // =================================
                    
                    style={{ marginBottom: 20, borderRadius: 0 }}
                />
            )}
            
            <Content style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', width: '100%' }}>
                
                {/* Breadcrumb */}
                <div style={{ marginBottom: 20, color: '#94a3b8' }}>
                    <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => navigate('/')}>Trang chủ</span>
                    <span style={{ margin: '0 8px' }}>/</span>
                    <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => navigate('/events')}>Sự kiện</span>
                    <span style={{ margin: '0 8px' }}>/</span>
                    <span style={{ color: '#26292cff' }}>{event.tieuDe}</span>
                </div>

                {/* BANNER */}
                <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    marginBottom: '40px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}>
                     <img
                        alt={event.tieuDe}
                        // Logic: Nếu link bắt đầu bằng http (link mạng) thì giữ nguyên
                        // Nếu không thì ghép domain backend vào
                        src={
                            event.anhBia 
                            ? (event.anhBia.startsWith('http') ? event.anhBia : `${BE_URL}/${event.anhBia}`) 
                            : fallbackImage
                        }
                        onError={(e) => { e.target.src = fallbackImage; }} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                <Row gutter={[48, 24]}> 
                    
                    {/* === CỘT TRÁI: NỘI DUNG CHÍNH (ĐÃ BỌC TRONG CARD) === */}
                    <Col xs={24} lg={16}>
                        <Card 
                            bordered={false}
                            style={{ 
                                background: '#ffffffff', 
                                borderRadius: '16px', 
                                // border: '1px solid #334155' 
                            }}
                            bodyStyle={{ padding: '32px' }} // Tăng padding bên trong cho thoáng
                        >
                            <Typography>
                                <Title level={1} style={{ color: '#334155', fontSize: '32px', marginTop: 0, marginBottom: 16 }}>
                                    {event.tieuDe}
                                </Title>
                                
                                {/* Mô tả ngắn */}
                                <Paragraph style={{ color: '#334155', fontSize: '18px', lineHeight: '1.7', marginBottom: 40 }}>
                                    {event.moTaNgan}
                                </Paragraph>

                                <Divider style={{ borderColor: '#334155' }} />

                                {/* Nội dung chi tiết */}
                                <div style={{ marginBottom: 40 }}>
                                    <Title level={4} style={{ color: '#334155', marginBottom: 16 }}>Mô tả chi tiết</Title>
                                    
                                    {/* === FIX LỖI TRÀN CHỮ === */}
                                    <div 
                                    
                                        className="event-content-view event-content-dark"
                                        style={{ 
                                            color: '#334155', 
                                            fontSize: '16px', 
                                            lineHeight: '1.8',
                                            // Các thuộc tính CSS quan trọng để chống tràn:
                                            overflowWrap: 'break-word', 
                                            wordWrap: 'break-word',
                                            wordBreak: 'break-word',
                                            maxWidth: '100%'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: event.noiDung }} 
                                    />
                                </div>
                            </Typography>
                        </Card>
                    </Col>

                    {/* === CỘT PHẢI: THẺ ĐĂNG KÝ STICKY (Giữ nguyên style cũ) === */}
                    <Col xs={24} lg={8}>
                        <div style={{ top: 24 }}>
                            <div style={{ 
                                background: '#ffffffff', 
                                borderRadius: '16px', 
                                padding: '24px', 
                                border: '1px solid #ffffffff',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}>
                                {/* === 2. SỬA NÚT ĐĂNG KÝ TẠI ĐÂY === */}
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    block 
                                    style={{ 
                                        height: '48px', fontSize: '16px', fontWeight: 'bold', marginBottom: 24,
                                        background: isUpcoming ? '#2563eb' : '#475569', // Đổi màu nếu không phải sắp diễn ra
                                        borderColor: isUpcoming ? '#2563eb' : '#475569',
                                        color: '#fff'
                                    }}
                                    onClick={handleRegister}
                                    loading={registering}
                                    // Vô hiệu hóa nếu:
                                    // 1. Chưa đăng nhập
                                    // 2. Không phải STUDENT
                                    // 3. Đã đăng ký rồi
                                    // 4. Sự kiện KHÔNG PHẢI là "Sắp diễn ra" (tức là đang diễn ra hoặc đã kết thúc)
                                    disabled={!user || user.role !== 'STUDENT' || event.isRegistered || !isUpcoming || isPreviewMode} 
                                >
                                    {/* Logic hiển thị chữ trên nút */}
                                    {isPreviewMode ? 'Đây là bản xem trước' : 
                                    (!user ? 'Đăng nhập để tham gia' : 
                                      (user.role !== 'STUDENT' ? 'Chỉ dành cho sinh viên' : 
                                        (event.isRegistered ? 'Đăng ký thành công' : 
                                            (isEnded ? 'Sự kiện này đã kết thúc' : 
                                                (isOngoing ? 'Sự kiện này đang diễn ra' : 'Đăng ký tham gia ngay')
                                            )
                                        )
                                      )
                                    )}
                                </Button>

                                <div style={{ height: 1, background: '#e2e8f0', margin: '0 0 24px 0' }} />

                                <Space direction="vertical" size={24} style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ width: 40, height: 40, background: '#2781ffff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CalendarOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#334155', fontSize: '13px', marginBottom: 4 }}>Thời gian</div>
                                            <div style={{ color: '#334155', fontWeight: 500 }}>
                                                {new Date(event.thoiGianBatDau).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}, <br/>
                                                {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN', {weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'})}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ width: 40, height: 40, background: '#e68c25ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <EnvironmentOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#334155', fontSize: '13px', marginBottom: 4 }}>Địa điểm</div>
                                            <div style={{ color: '#334155', fontWeight: 500 }}>{event.diaDiem}</div>
                                        </div>
                                    </div>

                                    {/* 1. Người đăng (SỬA LẠI) */}
                                    {/* Kiểm tra event.tenNguoiDang thay vì event.nguoiDang */}
                                    {event.tenNguoiDang && (
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <div style={{ width: 40, height: 40, background: '#13c2c2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <UserOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                            </div>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '13px', marginBottom: 4 }}>Người đăng</div>
                                                {/* Hiển thị trực tiếp chuỗi String */}
                                                <div style={{ color: '#334155', fontWeight: 500 }}>{event.tenNguoiDang}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Chủ đề (SỬA LẠI) */}
                                    {/* Kiểm tra event.tenDanhMuc */}
                                    {event.tenDanhMuc && (
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <div style={{ width: 40, height: 40, background: '#722ed1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <AppstoreOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                            </div>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '13px', marginBottom: 4 }}>Chủ đề</div>
                                                <div>
                                                    <Tag color="blue" style={{ margin: 0, fontWeight: 500 }}>
                                                        {event.tenDanhMuc}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Số người tham gia (Đã fix ở bước trước) */}
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ width: 40, height: 40, background: '#20eb6eff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <TeamOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#334155', fontSize: '13px', marginBottom: 4 }}>Số người tham gia</div>
                                            <div style={{ color: '#fff', fontWeight: 500 }}>
                                                {event.soLuongGioiHan ? (
                                                    <>
                                                        <span style={{ color: '#334155' }}>
                                                            {event.soNguoiDaDangKy ?? 0}
                                                        </span>
                                                        <span style={{ color: '#334155' }}> / {event.soLuongGioiHan} người</span>
                                                        <div style={{ width: '200px', height: 6, background: '#b4b7beff', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                                                            <div style={{ 
                                                                width: `${Math.min(((event.soNguoiDaDangKy || 0) / event.soLuongGioiHan) * 100, 100)}%`, 
                                                                height: '100%', 
                                                                background: '#fa8c16', 
                                                                borderRadius: 3 
                                                            }}></div>
                                                        </div>
                                                    </>
                                                ) : <Tag color="green">Không giới hạn</Tag>}
                                            </div>
                                        </div>
                                    </div>
                                </Space>

                                <div style={{ height: 1, background: '#334155', margin: '24px 0' }} />

                                <div>
                                    <div style={{ color: '#334155', fontWeight: 600, marginBottom: 12 }}>Chia sẻ sự kiện</div>
                                    <Space size={12}>
                                        <Button shape="circle" icon={<FacebookFilled />} style={{ background: '#005ad8ff', border: 'none', color: '#fff' }} />
                                        <Button shape="circle" icon={<GlobalOutlined />} style={{ background: '#25bb00ff', border: 'none', color: '#fff' }} />
                                        <Button shape="circle" icon={<LinkOutlined />} style={{ background: '#5d636dff', border: 'none', color: '#fff' }} onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            message.success("Đã copy link!");
                                        }} />
                                    </Space>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default EventDetailPage;