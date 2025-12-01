// import { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Input, Button, Space, Divider, FloatButton } from 'antd';
import { 
    FacebookOutlined, 
    InstagramOutlined, 
    GlobalOutlined, 
    LinkedinOutlined, 
    BehanceOutlined,
    MailOutlined,
    ArrowUpOutlined
} from '@ant-design/icons';
import logoImage from '../assets/logo-cnkt_white.png';

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const MyFooter = () => {
    return (
        <Footer style={{ background: '#ffffffff', padding: '60px 50px 20px' }}>
            {/* === PHẦN CHÍNH (4 CỘT) === */}
            <Row gutter={[40, 30]}>
                
                {/* CỘT 1: LOGO & GIỚI THIỆU */}
                <Col xs={24} sm={12} md={6}>
                    <div style={{ marginBottom: 20 }}>
                        {/* Thay src bằng logoImage của bạn */}
                        <img src={logoImage} alt="Logo" style={{ height: 80, marginBottom: 20 }} />
                        <Paragraph style={{ color: '#555', lineHeight: '1.8' }}>
                            Nơi đào tạo kỹ sư chất lượng cao, gắn kết thực tiễn, khơi dậy sáng tạo và ứng dụng công nghệ vì cộng đồng.
                        </Paragraph>
                        <Space size="middle">
                            <Button shape="circle" icon={<FacebookOutlined />} />
                            <Button shape="circle" icon={<InstagramOutlined />} />
                            <Button shape="circle" icon={<GlobalOutlined />} />
                            <Button shape="circle" icon={<BehanceOutlined />} />
                            <Button shape="circle" icon={<LinkedinOutlined />} />
                        </Space>
                    </div>
                </Col>

                {/* CỘT 2: NGÀNH ĐÀO TẠO */}
                <Col xs={24} sm={12} md={6}>
                    <Title level={4} style={{ marginBottom: 20 }}>Ngành đào tạo</Title>
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <Text style={{ color: '#555', cursor: 'pointer' }}>Công nghệ thông tin</Text>
                        <Text style={{ color: '#555', cursor: 'pointer' }}>Kỹ thuật xây dựng</Text>
                        <Text style={{ color: '#555', cursor: 'pointer' }}>Công nghệ sinh học</Text>
                        <Text style={{ color: '#555', cursor: 'pointer' }}>Công nghệ thực phẩm</Text>
                        <Text style={{ color: '#555', cursor: 'pointer' }}>Khoa học máy tính</Text>
                        <Text style={{ color: '#555', cursor: 'pointer' }}>Thạc sĩ Khoa học máy tính</Text>
                    </Space>
                </Col>

                {/* CỘT 3: LIÊN HỆ */}
                <Col xs={24} sm={12} md={6}>
                    <Title level={4} style={{ marginBottom: 20 }}>Liên hệ</Title>
                    <Space direction="vertical" size={12} style={{ width: '100%', color: '#555' }}>
                        <Text strong>Trường Đại học Đồng Tháp</Text>
                        <Text>Địa chỉ: Số 783 Phạm Hữu Lầu, Phường 6, TP. Cao Lãnh, Đồng Tháp</Text>
                        <Text>Email: dhdt@dthu.edu.vn</Text>
                        <Text>SĐT: 0277 3882 258</Text>
                    </Space>
                </Col>

                {/* CỘT 4: ĐĂNG KÝ NHẬN TIN */}
                <Col xs={24} sm={12} md={6}>
                    <Title level={4} style={{ marginBottom: 20 }}>Đăng ký nhận tin</Title>
                    <Paragraph style={{ color: '#555' }}>
                        Nhận bản tin mới nhất từ Khoa qua email của bạn:
                    </Paragraph>
                    <div style={{ display: 'flex', marginTop: 10 }}>
                        <Input 
                            placeholder="Địa chỉ mail" 
                            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                            style={{ 
                                borderTopRightRadius: 0, 
                                borderBottomRightRadius: 0,
                                backgroundColor: '#fff3e0', // Màu nền hơi vàng giống ảnh
                                border: 'none',
                                padding: '8px 12px'
                            }}
                        />
                        <Button 
                            type="primary" 
                            style={{ 
                                borderTopLeftRadius: 0, 
                                borderBottomLeftRadius: 0,
                                backgroundColor: '#0a90dfff', // Màu xanh đậm
                                height: 'auto'
                            }}
                        >
                            Gửi
                        </Button>
                    </div>
                </Col>
            </Row>

            <Divider style={{ margin: '40px 0 20px' }} />

            {/* === PHẦN BOTTOM: COPYRIGHT === */}
            <Row justify="space-between" align="middle">
                <Col xs={24} md={12} style={{ textAlign: 'left' }}>
                    <Text type="secondary">
                        Copyright © Khoa Công nghệ và Kỹ Thuật, all rights reserved.
                    </Text>
                </Col>
                <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                    <Space size="large" split={<Divider type="vertical" />}>
                        <Text type="secondary" style={{ cursor: 'pointer' }}>DThU</Text>
                        <Text type="secondary" style={{ cursor: 'pointer' }}>Hỏi đáp</Text>
                        <Text type="secondary" style={{ cursor: 'pointer' }}>Chính sách bảo mật</Text>
                        <Text type="secondary" style={{ cursor: 'pointer' }}>Sự kiện</Text>
                    </Space>
                </Col>
            </Row>

            {/* Nút Back to Top */}
            <FloatButton.BackTop 
                type="primary" 
                icon={<ArrowUpOutlined />} 
                style={{ 
                    right: 24, 
                    bottom: 24, 
                    width: 50, 
                    height: 50 }} 
            />
        </Footer>
    );
};

export default MyFooter;