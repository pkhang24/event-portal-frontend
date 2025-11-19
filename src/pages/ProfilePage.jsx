import { useEffect, useState } from 'react';
import { Layout, Typography, Card, Descriptions, Form, Input, Button, message, Spin, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, BookOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MyNavbar from '../components/MyNavbar';
import { getMyProfile, updateMyProfile, changePassword } from '../services/api'; // (hoặc profileService)
import { logout } from '../services/authService';

const { Content } = Layout;
const { Title } = Typography;

const ProfilePage = () => {
    const [form] = Form.useForm();
    const [passForm] = Form.useForm();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

// === 1. KHỞI TẠO HOOK MESSAGE (QUAN TRỌNG) ===
    const [messageApi, contextHolder] = message.useMessage();
    // Load thông tin user khi vào trang
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getMyProfile();
                setUser(data);
                // Điền thông tin vào form
                form.setFieldsValue({
                    email: data.email,
                    soDienThoai: data.soDienThoai
                });
            } catch (err) {
                messageApi.error("Lỗi khi tải thông tin cá nhân.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [form]);

    // === 1. XỬ LÝ CẬP NHẬT THÔNG TIN (Email & SĐT) ===
    const onFinishInfo = async (values) => {
        try {
            const updatedUser = await updateMyProfile(values);

            if (user.email !== updatedUser.email) {
                // === DÙNG messageApi ĐỂ HIỆN THÔNG BÁO ===
                messageApi.open({
                    type: 'success',
                    content: 'Email đã được đổi. Vui lòng đăng nhập lại!',
                    duration: 2, // Hiện trong 2 giây
                });
                
                // Đợi 2 giây cho user đọc thông báo rồi mới đẩy ra
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 3000);
            } else {
                // TRƯỜNG HỢP 2: Chỉ đổi SĐT -> Cập nhật ngay tại chỗ
                messageApi.success("Cập nhật thông tin thành công");
                setUser(updatedUser); // Cập nhật lại giao diện với data mới
            }
        } catch (err) {
            messageApi.error(err.response?.data?.message || "Cập nhật thất bại.");
        }
    };

    // === 2. XỬ LÝ ĐỔI MẬT KHẨU ===
    const onFinishPassword = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            messageApi.error("Mật khẩu xác nhận không khớp!");
            return;
        }
        
        try {
            await changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            });
            // TRƯỜNG HỢP 3: Đổi mật khẩu thành công
            messageApi.success("Đổi mật khẩu thành công");
            passForm.resetFields(); // Xóa trắng form mật khẩu
        } catch (err) {
            messageApi.error(err.response?.data?.message || "Đổi mật khẩu thất bại. Mật khẩu cũ sai?");
        }
    };

    if (loading) {
        return (
            <Layout className="layout" style={{ minHeight: '100vh' }}>
                <MyNavbar />
                <Content style={{ padding: '0 50px', marginTop: 30 }}>
                    <div style={{ background: '#fff', padding: 24, minHeight: 380, textAlign: 'center' }}>
                        <Spin size="large" />
                    </div>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            {contextHolder}
            <MyNavbar />
            <Content style={{ padding: '0 50px', marginTop: 30 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
                    Quay lại
                </Button>
                <div style={{ background: '#fff', padding: 24, minHeight: 380, maxWidth: 1200, margin: 'auto' }}>
                    <Title level={2}>Thông tin tài khoản</Title>
                    
                    {user && (
                        <Row gutter={[24, 24]}>
                            {/* Cột thông tin cố định */}
                            <Col xs={24} md={8}>
                                <Card title="Thông tin cá nhân" style={{ height: '100%' }}>
                                    <Descriptions column={1} bordered>
                                        <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>
                                            {user.hoTen}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><IdcardOutlined /> MSSV</>}>
                                            {user.mssv}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><BookOutlined /> Khoa</>}>
                                            {user.khoa || "(Chưa cập nhật)"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><BookOutlined /> Lớp</>}>
                                            {user.lopHoc || "(Chưa cập nhật)"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><BookOutlined /> Ngành học</>}>
                                            {user.nganhHoc || "(Chưa cập nhật)"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                                            {user.soDienThoai || "(Chưa cập nhật)"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            {/* Cột thông tin chỉnh sửa */}
                            <Col xs={24} md={8}>
                                <Card title="Thông tin liên hệ" style={{ height: '100%' }}> 
                                    <Form form={form} layout="vertical" onFinish={onFinishInfo}>
                                        <Form.Item
                                            name="email"
                                            label="Email"
                                            rules={[{ required: true, type: 'email' }]}
                                        >
                                            <Input prefix={<MailOutlined />} />
                                        </Form.Item>
                                        <Form.Item
                                            name="soDienThoai"
                                            label="Số điện thoại"
                                        >
                                            <Input prefix={<PhoneOutlined />} />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit">
                                                Cập nhật thông tin
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Card>
                            </Col>

                            <Col xs={24} md={8}>
                                {/* --- THÊM CARD ĐỔI MẬT KHẨU --- */}
                                <Card title="Đổi mật khẩu" style={{ height: '100%' }}>
                                    <Form form={passForm} layout="vertical" onFinish={onFinishPassword}>
                                        <Form.Item
                                            name="oldPassword"
                                            label="Mật khẩu cũ"
                                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                                        >
                                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu cũ" />
                                        </Form.Item>
                                        <Form.Item
                                            name="newPassword"
                                            label="Mật khẩu mới"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                            ]}
                                            hasFeedback
                                        >
                                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới (ít nhất 6 ký tự)" />
                                        </Form.Item>
                                        <Form.Item
                                            name="confirmPassword"
                                            label="Xác nhận mật khẩu mới"
                                            dependencies={['newPassword']}
                                            hasFeedback
                                            rules={[
                                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('newPassword') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" danger>
                                                Đổi mật khẩu
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </div>
            </Content>
        </Layout>
    );
};

const SpaceIcon = ({ icon, text }) => (
    <span>{icon} <span style={{ marginLeft: 8 }}>{text}</span></span>
);

export default ProfilePage;