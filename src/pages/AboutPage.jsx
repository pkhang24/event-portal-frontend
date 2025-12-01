import { Layout, Typography, Row, Col, Card, Avatar, Timeline, Divider } from 'antd';
import { RocketOutlined, SafetyCertificateOutlined, TeamOutlined, BulbOutlined } from '@ant-design/icons';
import MyNavbar from '../components/MyNavbar';
import MyFooter from '../components/MyFooter';
import logoImage from '../assets/logo-cnkt_white.png'; 

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
    return (
        <Layout style={{ minHeight: '100vh', background: '#fff' }}>
            <MyNavbar />
            
            {/* Hero Banner Giới thiệu */}
            <div style={{ background: '#001529', padding: '80px 20px', textAlign: 'center', color: '#fff' }}>
                <img src={logoImage} alt="Logo" style={{ height: 100, marginBottom: 20 }} />
                <Title level={1} style={{ color: '#fff', margin: 0 }}>Về Event Portal</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, maxWidth: 700, margin: '20px auto' }}>
                    Cổng thông tin sự kiện chính thức của Khoa Công nghệ & Kỹ thuật - Nơi kết nối sinh viên với những hoạt động bổ ích và cơ hội phát triển.
                </Paragraph>
            </div>

            <Content style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
                
                {/* Phần 1: Sứ mệnh */}
                <div style={{ marginBottom: 80 }}>
                    <Row gutter={[40, 40]} align="middle">
                        <Col xs={24} md={12}>
                            <Title level={2}>Sứ mệnh của chúng tôi</Title>
                            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                                Chúng tôi xây dựng nền tảng này nhằm mục đích số hóa quy trình quản lý và đăng ký tham gia sự kiện, giúp sinh viên dễ dàng tiếp cận thông tin và giúp nhà trường quản lý hoạt động hiệu quả hơn.
                            </Paragraph>
                            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                                Hệ thống hướng tới sự minh bạch, nhanh chóng và tiện lợi, loại bỏ hoàn toàn các thủ tục giấy tờ rườm rà.
                            </Paragraph>
                        </Col>
                        <Col xs={24} md={12}>
                            <img 
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop" 
                                alt="Teamwork" 
                                style={{ width: '100%', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            />
                        </Col>
                    </Row>
                </div>

                {/* Phần 2: Tính năng nổi bật */}
                <div style={{ marginBottom: 80 }}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Tại sao chọn Event Portal?</Title>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} md={6}>
                            <Card bordered={false} style={{ textAlign: 'center', height: '100%', background: '#f9f9f9' }}>
                                <RocketOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 20 }} />
                                <Title level={4}>Nhanh chóng</Title>
                                <Text type="secondary">Đăng ký tham gia chỉ với 1 cú click chuột.</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card bordered={false} style={{ textAlign: 'center', height: '100%', background: '#f9f9f9' }}>
                                <SafetyCertificateOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 20 }} />
                                <Title level={4}>Minh bạch</Title>
                                <Text type="secondary">Thông tin sự kiện rõ ràng, điểm danh bằng QR Code.</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card bordered={false} style={{ textAlign: 'center', height: '100%', background: '#f9f9f9' }}>
                                <TeamOutlined style={{ fontSize: 40, color: '#fa8c16', marginBottom: 20 }} />
                                <Title level={4}>Kết nối</Title>
                                <Text type="secondary">Kết nối cộng đồng sinh viên và giảng viên.</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card bordered={false} style={{ textAlign: 'center', height: '100%', background: '#f9f9f9' }}>
                                <BulbOutlined style={{ fontSize: 40, color: '#eb2f96', marginBottom: 20 }} />
                                <Title level={4}>Sáng tạo</Title>
                                <Text type="secondary">Luôn cập nhật các sự kiện công nghệ mới nhất.</Text>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Phần 3: Lộ trình phát triển */}
                <div>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Lộ trình phát triển</Title>
                    <Row justify="center">
                        <Col>
                            <Timeline mode="alternate">
                                <Timeline.Item color="green">Khởi động dự án (10/2025)</Timeline.Item>
                                <Timeline.Item color="green">Ra mắt phiên bản Beta (11/2025)</Timeline.Item>
                                <Timeline.Item color="blue" dot={<RocketOutlined style={{ fontSize: '16px' }} />}>
                                    Chính thức vận hành (12/2025)
                                </Timeline.Item>
                                <Timeline.Item color="gray">Tích hợp ứng dụng Mobile (2026)</Timeline.Item>
                            </Timeline>
                        </Col>
                    </Row>
                </div>

            </Content>
            <MyFooter />
        </Layout>
    );
};

export default AboutPage;