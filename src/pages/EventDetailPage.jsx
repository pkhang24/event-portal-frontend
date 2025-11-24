import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout, Typography, Button, Spin, Alert, message, Card, Row, Col, Avatar, Breadcrumb, Divider, Space } from 'antd';
import { 
    CalendarOutlined, 
    EnvironmentOutlined, 
    TeamOutlined, 
    FacebookFilled, 
    GlobalOutlined, 
    LinkOutlined,
    UserOutlined
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
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState(null);
    const user = getCurrentUser();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await getEventDetail(id);
                setEvent(data);
            } catch (err) {
                setError("Không tìm thấy sự kiện hoặc có lỗi xảy ra.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleRegister = async () => {
        if (!user) {
            message.warning("Vui lòng đăng nhập để đăng ký!");
            navigate('/login');
            return;
        }
        setRegistering(true);
        try {
            await api.post('/registrations', { eventId: id });
            message.success("Đăng ký thành công! Vui lòng kiểm tra vé của bạn.");
            // Reload lại trang để cập nhật trạng thái nút (hoặc gọi lại API getEventDetail)
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

    return (
        <Layout className="layout" style={{ minHeight: '100vh', background: '#f5f7fa' }}> {/* Nền xám nhẹ hiện đại */}
            <MyNavbar />
            
            <Content style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px', width: '100%' }}>
                {/* Breadcrumb (Đường dẫn) */}
                <Breadcrumb style={{ marginBottom: 20 }}>
                    <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>{event.tieuDe}</Breadcrumb.Item>
                </Breadcrumb>

                {/* 1. BANNER LỚN Ở TRÊN CÙNG */}
                <div style={{ marginBottom: 30, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                     <img
                        alt={event.tieuDe}
                        src={event.anhThumbnail || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"}
                        style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                    />
                </div>

                <Row gutter={[40, 24]}>
                    {/* === CỘT TRÁI: NỘI DUNG CHÍNH === */}
                    <Col xs={24} md={16}>
                        {/* Tiêu đề & Mô tả ngắn */}
                        <div style={{ marginBottom: 30 }}>
                            <Title level={1} style={{ fontSize: '32px', marginBottom: 10 }}>{event.tieuDe}</Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>{event.moTaNgan}</Text>
                        </div>

                        {/* Mô tả chi tiết */}
                        <div style={{ marginBottom: 40 }}>
                            <Title level={4}>Mô tả chi tiết</Title>
                            <div 
                                dangerouslySetInnerHTML={{ __html: event.noiDung }} 
                                style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }} 
                            />
                        </div>
                    </Col>

                    {/* === CỘT PHẢI: THÔNG TIN ĐĂNG KÝ (STICKY) === */}
                    <Col xs={24} md={8}>
                        <div style={{ position: 'sticky', top: 20 }}>
                            <Card 
                                bordered={false} 
                                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderRadius: '12px' }}
                            >
                                {/* Nút Đăng ký */}
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    block 
                                    style={{ height: '50px', fontSize: '16px', fontWeight: '600', marginBottom: 24 }}
                                    onClick={handleRegister}
                                    loading={registering}
                                    disabled={!user || user.role !== 'STUDENT' || event.isRegistered} 
                                >
                                    {!user ? 'Đăng nhập để tham gia' : 
                                      (user.role !== 'STUDENT' ? 'Dành cho sinh viên' : 
                                        (event.isRegistered ? 'Đã đăng ký' : 'Đăng ký tham gia ngay')
                                      )
                                    }
                                </Button>

                                <Divider style={{ margin: '12px 0' }} />

                                {/* List thông tin */}
                                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                                    
                                    {/* Thời gian */}
                                    <div style={{ display: 'flex', gap: 15 }}>
                                        <div style={{ background: '#e6f7ff', padding: '8px', borderRadius: '8px', height: 'fit-content' }}>
                                            <CalendarOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#777' }}>Thời gian</div>
                                            <div style={{ fontWeight: 500 }}>
                                                {new Date(event.thoiGianBatDau).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}, {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Địa điểm */}
                                    <div style={{ display: 'flex', gap: 15 }}>
                                        <div style={{ background: '#f6ffed', padding: '8px', borderRadius: '8px', height: 'fit-content' }}>
                                            <EnvironmentOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#777' }}>Địa điểm</div>
                                            <div style={{ fontWeight: 500 }}>{event.diaDiem}</div>
                                        </div>
                                    </div>

                                    {/* Số người */}
                                    <div style={{ display: 'flex', gap: 15 }}>
                                        <div style={{ background: '#fff7e6', padding: '8px', borderRadius: '8px', height: 'fit-content' }}>
                                            <TeamOutlined style={{ fontSize: '20px', color: '#fa8c16' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#777' }}>Số người tham gia</div>
                                            <div style={{ fontWeight: 500 }}>
                                                {event.soLuongGioiHan ? `${event.soLuongGioiHan} người tối đa` : 'Không giới hạn'}
                                            </div>
                                        </div>
                                    </div>
                                </Space>

                                <Divider style={{ margin: '24px 0' }} />

                                {/* Chia sẻ */}
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: 10 }}>Chia sẻ sự kiện</div>
                                    <Space size="large">
                                        <Button shape="circle" icon={<FacebookFilled style={{ color: '#3b5998' }} />} />
                                        <Button shape="circle" icon={<GlobalOutlined style={{ color: '#1890ff' }} />} />
                                        <Button shape="circle" icon={<LinkOutlined />} onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            message.success("Đã copy link!");
                                        }} />
                                    </Space>
                                </div>

                            </Card>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default EventDetailPage;