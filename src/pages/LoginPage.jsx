import { useState } from 'react';
import { Form, Input, Button, Card, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService'; // Chúng ta sẽ tạo file này ngay sau đây

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hàm xử lý khi người dùng nhấn nút "Đăng nhập"
    const onFinish = async (values) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Gọi API đăng nhập
            const data = await login(values.email, values.password);
            
            // 2. Lưu token vào localStorage (QUAN TRỌNG NHẤT)
            localStorage.setItem('token', data.token);
            
            // 3. Thông báo thành công và chuyển hướng về trang chủ
            message.success("Đăng nhập thành công!");
            navigate('/'); 
            
            // (Tùy chọn: reload trang để Navbar cập nhật trạng thái mới)
            // window.location.reload(); 
        } catch (err) {
            // Xử lý lỗi (ví dụ: sai email/password)
            setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card title="Đăng nhập Event Portal" style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                
                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                    
                    {/* <div style={{ textAlign: 'center' }}>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </div> */}
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;