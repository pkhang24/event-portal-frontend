import { useState } from 'react';
import { Form, Input, Button, Card, Alert, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined, ThunderboltFilled } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);
        try {
            const data = await login(values.email, values.password);
            localStorage.setItem('token', data.token);
            message.success("Đăng nhập thành công!");
            navigate('/'); 
        } catch (err) {
            setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            // Hình nền sự kiện mờ (bạn có thể thay link ảnh khác)
            backgroundImage: 'linear-gradient(rgba(75, 249, 255, 0.5), rgba(36, 8, 196, 0.51))',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            
            <Card 
                style={{ 
                    width: 420, 
                    borderRadius: '16px', // Bo góc mềm mại
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)', // Đổ bóng
                    background: 'rgba(255, 255, 255, 0.95)', // Nền trắng hơi trong suốt
                    border: 'none',
                    padding: '20px'
                }}
            >
                {/* Nút quay lại trang chủ */}
                <div style={{ marginBottom: 20 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: '#666' }}>
                        <HomeOutlined style={{ marginRight: 5 }} /> Về trang chủ
                    </Link>
                </div>

                {/* Logo và Tiêu đề */}
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{ 
                        width: 60, height: 60, background: '#1677ff', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        margin: '0 auto 15px', color: 'white', fontSize: 32 
                    }}>
                        <ThunderboltFilled />
                    </div>
                    <Title level={2} style={{ margin: 10, color: '#1f1f1f' }}>Đăng nhập</Title>
                    <Text type="secondary">Chào mừng bạn quay trở lại!</Text>
                </div>

                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 10 }}>
                        <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 45, fontSize: 16, fontWeight: 600 }}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                    
                    <div style={{ textAlign: 'center', color: '#888', fontSize: '13px' }}>
                        Quên mật khẩu? Vui lòng liên hệ Admin Khoa.
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;