import { useState, useEffect } from 'react';
import { 
    Layout, Form, Input, Button, Select, DatePicker, 
    Upload, message, Card, Row, Col, Typography, Space, Divider 
} from 'antd';
import { 
    CloudUploadOutlined, ArrowLeftOutlined, 
    SaveOutlined, SendOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MyNavbar from '../components/MyNavbar';
import { createEvent } from '../services/eventService';
import { getCategories } from '../services/eventService'; // Import hàm lấy danh mục
// Import component MyFooter nếu muốn

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreateEventPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    // const [fileList, setFileList] = useState([]); // Ảnh bìa
    // const [contentFileList, setContentFileList] = useState([]); // Ảnh chi tiết (nếu cần)

    // === 1. STATE CHO 2 ẢNH ===
    const [thumbnailFileList, setThumbnailFileList] = useState([]); // Ảnh nhỏ (Card)
    const [coverFileList, setCoverFileList] = useState([]);         // Ảnh to (Chi tiết)

    useEffect(() => {
        // Load danh mục khi vào trang
        getCategories().then(setCategories).catch(console.error);
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Xử lý upload ảnh (giả lập: lấy URL từ fileList hoặc upload lên server thật ở đây)
            // Ở đây mình giả sử bạn nhập URL vào input (hoặc xử lý logic upload riêng)
            // Để đơn giản cho demo, ta sẽ lấy value từ input text nếu có, hoặc xử lý file sau
            
            const eventData = {
                ...values,
                // Chuyển đổi thời gian sang ISO string
                thoiGianBatDau: values.thoiGianBatDau.toISOString(),
                thoiGianKetThuc: values.thoiGianKetThuc.toISOString(),
                // Giả lập URL ảnh (Bạn thay thế logic upload thật vào đây)
                anhThumbnail: thumbnailFileList.length > 0 ? "https://via.placeholder.com/300x200" : null,
                
                // Lưu ý: Backend của bạn cần có trường này (ví dụ: anhBia, coverImage...)
                // Nếu chưa có, bạn cần thêm vào Entity và DTO ở Backend
                anhBia: coverFileList.length > 0 ? "https://via.placeholder.com/1200x400" : null 
            };

            await createEvent(eventData);
            message.success('Tạo sự kiện thành công!');
            navigate('/manage-events'); // Quay về trang quản lý
        } catch (error) {
            message.error('Có lỗi xảy ra khi tạo sự kiện.');
        } finally {
            setLoading(false);
        }
    };

    // Props cho Dragger (Upload)
    const uploadProps = (fileList, setFileList) => ({
        onRemove: (file) => {
            setFileList((prev) => {
                const index = prev.indexOf(file);
                const newFileList = prev.slice();
                newFileList.splice(index, 1);
                return newFileList;
            });
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false; // Chặn auto upload, để xử lý thủ công khi submit
        },
        fileList,
        listType: 'picture-card', // Hiển thị dạng thẻ ảnh
        maxCount: 1, // Chỉ cho 1 ảnh bìa
    });

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <MyNavbar />
            
            <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', width: '100%' }}>
                {/* Header & Nút quay lại */}
                <div style={{ marginBottom: 24 }}>
                    <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0, color: '#666' }}>
                        Quay lại
                    </Button>
                    <Title level={2} style={{ marginTop: 0 }}>Tạo Sự Kiện Mới</Title>
                    <Text type="secondary">Điền các thông tin dưới đây để tạo sự kiện cho khoa Công nghệ và Kỹ thuật.</Text>
                </div>

                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={onFinish}
                    size="large"
                >
                    <Row gutter={24}>
                        {/* === CỘT TRÁI (NỘI DUNG CHÍNH) === */}
                        <Col xs={24} lg={16}>
                            
                            {/* 1. THÔNG TIN CHUNG */}
                            <Card title="Thông tin chung" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
                                <Form.Item 
                                    name="tieuDe" 
                                    label="Tên sự kiện" 
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}
                                >
                                    <Input placeholder="Ví dụ: Hội thảo AI trong tương lai" />
                                </Form.Item>

                                <Form.Item 
                                    name="moTaNgan" 
                                    label="Mô tả ngắn" 
                                    rules={[{ required: true }]}
                                >
                                    <TextArea rows={3} placeholder="Nhập mô tả ngắn gọn về sự kiện" />
                                </Form.Item>

                                <Form.Item 
                                    name="noiDung" 
                                    label="Mô tả chi tiết" 
                                    rules={[{ required: true }]}
                                >
                                    <TextArea rows={8} placeholder="Nội dung chi tiết sự kiện (Hỗ trợ HTML hoặc Markdown nếu cần)..." />
                                </Form.Item>

                                {/* Upload Ảnh bìa */}
                                <Form.Item label="Ảnh bìa ngoài (Card sự kiện)">
                                    <Dragger {...uploadProps} style={{ background: '#fafafa', borderColor: '#d9d9d9' }}>
                                        <p className="ant-upload-drag-icon">
                                            <CloudUploadOutlined style={{ color: '#4096ff' }} />
                                        </p>
                                        <p className="ant-upload-text">Nhấn để tải lên hoặc kéo thả</p>
                                        <p className="ant-upload-hint">PNG, JPG hoặc GIF</p>
                                    </Dragger>
                                </Form.Item>

                                {/* Upload 2: Ảnh bìa chi tiết (Cover) */}
                                <Form.Item label="Ảnh bìa chi tiết (Trong trang sự kiện)">
                                    <Dragger {...uploadProps} style={{ background: '#fafafa', borderColor: '#d9d9d9' }}>
                                        <p className="ant-upload-drag-icon"><CloudUploadOutlined style={{ color: '#52c41a' }} /></p>
                                        <p className="ant-upload-text">Nhấn để tải lên hoặc kéo thả</p>
                                        <p className="ant-upload-hint">PNG, JPG hoặc GIF</p>
                                    </Dragger>
                                </Form.Item>

                                <Form.Item name="categoryId" label="Thể loại sự kiện" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn thể loại">
                                        {categories.map(cat => (
                                            <Select.Option key={cat.id} value={cat.id}>{cat.tenDanhMuc}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Card>

                            {/* 2. THỜI GIAN & ĐỊA ĐIỂM */}
                            <Card title="Thời gian & Địa điểm" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="thoiGianBatDau" label="Thời gian bắt đầu" rules={[{ required: true }]}>
                                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="thoiGianKetThuc" label="Thời gian kết thúc" rules={[{ required: true }]}>
                                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="diaDiem" label="Địa điểm" rules={[{ required: true }]}>
                                    <Input placeholder="Ví dụ: Hội trường A, 273 An Dương Vương" />
                                </Form.Item>
                            </Card>
                        </Col>

                        {/* === CỘT PHẢI (HÀNH ĐỘNG & CẤU HÌNH) === */}
                        <Col xs={24} lg={8}>
                            <Card title="Hành động" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
                                <Form.Item name="soLuongGioiHan" label="Giới hạn người">
                                    <Input type="number" placeholder="Không giới hạn" />
                                </Form.Item>

                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button type="primary" htmlType="submit" block icon={<SendOutlined />} loading={loading}>
                                        Gửi duyệt
                                    </Button>
                                    <Button block icon={<SaveOutlined />}>
                                        Lưu nháp
                                    </Button>
                                    <Button type="text" block danger onClick={() => navigate(-1)}>
                                        Hủy
                                    </Button>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Content>
        </Layout>
    );
};

export default CreateEventPage;