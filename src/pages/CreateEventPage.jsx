import { useState, useEffect } from 'react';
import { 
    Layout, Form, Input, Button, Select, DatePicker, 
    Upload, message, Card, Row, Col, Typography, Space, Divider 
} from 'antd';
import { 
    CloudUploadOutlined, ArrowLeftOutlined, 
    SaveOutlined, SendOutlined, EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import MyNavbar from '../components/MyNavbar';
import { createEvent } from '../services/eventService';
import { getCategories } from '../services/eventService'; // Import hàm lấy danh mục
import { getCurrentUser } from '../services/authService';
import dayjs from 'dayjs';
// Import component MyFooter nếu muốn

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreateEventPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    // const [fileList, setFileList] = useState([]); // Ảnh bìa
    // const [contentFileList, setContentFileList] = useState([]); // Ảnh chi tiết (nếu cần)

    // === 1. STATE CHO 2 ẢNH ===
    const [thumbnailFileList, setThumbnailFileList] = useState([]); // Ảnh nhỏ (Card)
    const [coverFileList, setCoverFileList] = useState([]);         // Ảnh to (Chi tiết)

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);

        // === LOGIC KHÔI PHỤC DỮ LIỆU KHI QUAY LẠI TỪ PREVIEW ===
        if (location.state?.formData) {
            const data = location.state.formData;
            
            // 1. Điền lại Form (Lưu ý: DatePicker cần object dayjs)
            form.setFieldsValue({
                ...data,
                thoiGianBatDau: data.thoiGianBatDau ? dayjs(data.thoiGianBatDau) : null,
                thoiGianKetThuc: data.thoiGianKetThuc ? dayjs(data.thoiGianKetThuc) : null,
                categoryId: data.categoryId // Đảm bảo ID danh mục được set lại
            });

            // 2. Khôi phục ảnh Thumbnail (nếu có)
            if (data.anhThumbnail) {
                setThumbnailFileList([{
                    uid: '-1',
                    name: 'thumbnail.png',
                    status: 'done',
                    url: data.anhThumbnail
                }]);
            }

            // 3. Khôi phục ảnh Bìa (nếu có)
            if (data.anhBia) {
                setCoverFileList([{
                    uid: '-2',
                    name: 'cover.png',
                    status: 'done',
                    url: data.anhBia
                }]);
            }
        }
    }, [form, location.state]);

    const handleSubmit = async (statusType) => {
        setLoading(true);
        try {
            // Validate form trước
            const values = await form.validateFields();

            // ... (Logic xử lý upload ảnh cũ) ...
            
            const eventData = {
                ...values,
                thoiGianBatDau: values.thoiGianBatDau.toISOString(),
                thoiGianKetThuc: values.thoiGianKetThuc.toISOString(),
                anhThumbnail: thumbnailFileList.length > 0 ? "https://via.placeholder.com/300x200" : null,
                anhBia: coverFileList.length > 0 ? "https://via.placeholder.com/1200x400" : null,
                
                // === GỬI TRẠNG THÁI ===
                trangThai: statusType // 'DRAFT' hoặc 'PENDING'
            };

            await createEvent(eventData);
            
            const msg = statusType === 'PENDING' ? 'Đã gửi yêu cầu duyệt!' : 'Đã lưu bản nháp!';
            message.success(msg);
            
            navigate('/manage-events');
        } catch (error) {
            console.error(error);
            message.error('Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.');
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

    const handlePreview = async () => {
        try {
            const values = await form.validateFields();
            
            // Xử lý ảnh thumbnail
            let previewThumbnail = null;
            if (thumbnailFileList.length > 0) {
                const file = thumbnailFileList[0];
                previewThumbnail = file.url || URL.createObjectURL(file.originFileObj);
            }

            // Xử lý ảnh bìa
            let previewCover = null;
            if (coverFileList.length > 0) {
                const file = coverFileList[0];
                previewCover = file.url || URL.createObjectURL(file.originFileObj);
            }

            const selectedCategory = categories.find(c => c.id === values.categoryId);
            const currentUser = getCurrentUser();

        // 4. Tạo object giả lập dữ liệu giống hệt Backend trả về
        const previewEventData = {
            id: 'preview', // ID giả
            tieuDe: values.tieuDe,
            moTaNgan: values.moTaNgan,
            noiDung: values.noiDung,
            diaDiem: values.diaDiem,
            soLuongGioiHan: values.soLuongGioiHan || null,
            // Format lại ngày tháng sang String ISO để truyền đi
            thoiGianBatDau: values.thoiGianBatDau.toISOString(),
            thoiGianKetThuc: values.thoiGianKetThuc.toISOString(),
                
            anhThumbnail: previewThumbnail,
            anhBia: previewCover,
                
            // === SỬA LỖI HIỂN THỊ: Gửi đúng tên trường mà DetailPage mong đợi ===
            tenNguoiDang: currentUser?.hoTen || 'Admin', 
            tenDanhMuc: selectedCategory?.tenDanhMuc || 'Chưa chọn',
                
            // Giữ lại ID để logic quay lại hoạt động
            categoryId: values.categoryId, 

            isPreview: true
        };

        // === GỬI KÈM source: 'create' ===
        navigate('/events/preview', { 
            state: { 
                previewData: previewEventData, 
                source: 'create' // Đánh dấu là đến từ trang tạo
            } 
        });

    } catch (error) {
        message.error("Vui lòng điền đủ thông tin bắt buộc để xem trước!");
    }
};

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <MyNavbar />
            
            <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', width: '100%' }}>
                {/* Header & Nút quay lại */}
                <div style={{ marginBottom: 24 }}>
                    {/* <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0, color: '#666' }}>
                        Quay lại
                    </Button> */}
                    <Title level={2} style={{ marginTop: 0 }}>Tạo Sự Kiện Mới</Title>
                    <Text type="secondary">Điền các thông tin dưới đây để tạo sự kiện cho khoa Công nghệ và Kỹ thuật.</Text>
                </div>

                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleSubmit}
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
                                {/* Nút Gửi duyệt -> PENDING */}
                                <Button 
                                    type="primary" 
                                    block 
                                    icon={<SendOutlined />} 
                                    loading={loading}
                                    onClick={() => handleSubmit('PENDING')}
                                >
                                    Gửi duyệt
                                </Button>
                                
                                {/* Nút Xem trước -> (Logic cũ giữ nguyên) */}
                                <Button block icon={<EyeOutlined />} onClick={handlePreview}>
                                    Xem trước
                                </Button>

                                {/* Nút Lưu nháp -> DRAFT */}
                                <Button 
                                    block 
                                    icon={<SaveOutlined />}
                                    onClick={() => handleSubmit('DRAFT')}
                                    loading={loading}
                                >
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