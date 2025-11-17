import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Descriptions, Spin, Alert, message, Tag, Card } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import MyNavbar from '../components/MyNavbar';
import { getEventDetail } from '../services/eventService';
import { getCurrentUser } from '../services/authService';
import api from '../services/api'; // Import api để gọi đăng ký

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const EventDetailPage = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState(null);
    const user = getCurrentUser(); // Lấy thông tin user hiện tại
    

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

    // Hàm xử lý Đăng ký
    const handleRegister = async () => {
        if (!user) {
            message.warning("Vui lòng đăng nhập để đăng ký!");
            navigate('/login');
            return;
        }

        setRegistering(true);
        try {
            // Gọi API đăng ký
            await api.post('/registrations', { eventId: id });
            message.success("Đăng ký thành công! Vui lòng kiểm tra vé của bạn.");
            navigate('/my-tickets'); // Chuyển hướng đến trang vé
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
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <MyNavbar />
            <Content style={{ padding: '0 50px', marginTop: 30 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
                    Quay lại
                </Button>
                <div style={{ background: '#fff', padding: 30, minHeight: 380, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    
                    <Row gutter={[32, 32]}>
                        {/* Cột bên trái: Ảnh và Thông tin cơ bản */}
                        <Col xs={24} md={10}>
                            <img
                                alt={event.tieuDe}
                                src={event.anhThumbnail || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"}
                                style={{ width: '100%', borderRadius: 8, marginBottom: 20 }}
                            />
                            <Card title="Thông tin sự kiện" bordered={false} style={{ background: '#fafafa' }}>
                                <Descriptions column={1} layout="vertical">
                                    <Descriptions.Item label={<><CalendarOutlined /> Thời gian</>}>
                                        <div>Bắt đầu: <b>{new Date(event.thoiGianBatDau).toLocaleString('vi-VN')}</b></div>
                                        <div>Kết thúc: <b>{new Date(event.thoiGianKetThuc).toLocaleString('vi-VN')}</b></div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><EnvironmentOutlined /> Địa điểm</>}>
                                        <b>{event.diaDiem}</b>
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><TeamOutlined /> Số lượng chỗ</>}>
                                        {event.soLuongGioiHan ? `${event.soLuongGioiHan} người` : <Tag color="green">Không giới hạn</Tag>}
                                    </Descriptions.Item>
                                     <Descriptions.Item label="Người tổ chức">
                                        {event.tenNguoiDang}
                                    </Descriptions.Item>
                                </Descriptions>
                                
                                {/* Nút Đăng ký */}
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    block 
                                    style={{ marginTop: 20, height: 50, fontSize: 18 }}
                                    onClick={handleRegister}
                                    loading={registering}
                                    // Disable nếu: (chưa đăng nhập) HOẶC (không phải STUDENT) HOẶC (ĐÃ ĐĂNG KÝ RỒI)
                                    disabled={!user || user.role !== 'STUDENT' || event.isRegistered} 
                                >
                                    {/* Logic hiển thị chữ trên nút */}
                                    {!user ? 'Đăng nhập để đăng ký' : 
                                    (user.role !== 'STUDENT' ? 'Chỉ sinh viên mới được đăng ký' : 
                                        (event.isRegistered ? 'Bạn đã đăng ký tham gia' : 'Đăng ký tham gia ngay') // <-- Thêm điều kiện này
                                    )
                                    }
                                </Button>
                            </Card>
                        </Col>

                        {/* Cột bên phải: Nội dung chi tiết */}
                        <Col xs={24} md={14}>
                            <Typography>
                                <Title level={2}>{event.tieuDe}</Title>
                                <Paragraph type="secondary" style={{ fontSize: 16 }}>{event.moTaNgan}</Paragraph>
                                <div style={{ marginTop: 30 }}>
                                    <Title level={4}>Nội dung chi tiết</Title>
                                    {/* Hiển thị nội dung HTML nếu có */}
                                    <div dangerouslySetInnerHTML={{ __html: event.noiDung }} style={{ fontSize: 16, lineHeight: 1.6 }} />
                                </div>
                            </Typography>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    );
};

// Cần import thêm Row, Col từ antd ở đầu file
import { Row, Col } from 'antd';

export default EventDetailPage;