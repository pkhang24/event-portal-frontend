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
import { createEvent, updateEvent } from '../services/eventService';
import { getCategories } from '../services/eventService'; // Import hàm lấy danh mục
import { getCurrentUser } from '../services/authService';
import { uploadFile } from '../services/uploadService';
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
    const { formData, isEdit } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    // const [fileList, setFileList] = useState([]); // Ảnh bìa
    // const [contentFileList, setContentFileList] = useState([]); // Ảnh chi tiết (nếu cần)

    // === 1. STATE CHO 2 ẢNH ===
    const [thumbnailFileList, setThumbnailFileList] = useState([]); // Ảnh nhỏ (Card)
    const [coverFileList, setCoverFileList] = useState([]);         // Ảnh to (Chi tiết)

    // State để hiển thị ảnh preview và trạng thái loading
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [loadingUpload, setLoadingUpload] = useState(false);

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);

        // === LOGIC KHÔI PHỤC DỮ LIỆU KHI QUAY LẠI TỪ PREVIEW ===
        if (isEdit && formData) {
            const data = location.state.formData;
            
            // 1. Điền lại Form (Lưu ý: DatePicker cần object dayjs)
            form.setFieldsValue({
                ...data,
                thoiGianBatDau: data.thoiGianBatDau ? dayjs(data.thoiGianBatDau) : null,
                thoiGianKetThuc: data.thoiGianKetThuc ? dayjs(data.thoiGianKetThuc) : null,
                categoryId: data.categoryId // Đảm bảo ID danh mục được set lại
            });

            // Tạo giả file object cho Antd hiển thị ảnh cũ
            if (formData.anhThumbnail) {
                setThumbnailFileList([{
                    uid: '-1',
                    name: 'thumbnail.png',
                    status: 'done',
                    url: formData.anhThumbnail,
                }]);
            }
            if (formData.anhBia) {
                setCoverFileList([{
                    uid: '-2',
                    name: 'cover.png',
                    status: 'done',
                    url: formData.anhBia,
                }]);
            }
            
            // Set value cho form (bao gồm cả input ẩn chứa link ảnh)
            form.setFieldsValue({
                ...formData,
                anhThumbnail: formData.anhThumbnail,
                anhBia: formData.anhBia,
                // ... convert date ...
            });
        }
    }, [isEdit, formData, form]);

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
                // Nếu đang sửa thì giữ nguyên ảnh cũ nếu không up mới
                anhThumbnail: thumbnailFileList.length > 0 ? "url_anh_moi..." : (formData?.anhThumbnail || null),
                anhBia: coverFileList.length > 0 ? "url_anh_moi..." : (formData?.anhBia || null),
                
                // Cập nhật trạng thái
                trangThai: statusType // 'DRAFT' hoặc 'PENDING'
            };

            if (isEdit) {
                // === LOGIC CẬP NHẬT ===
                await updateEvent(formData.id, eventData);
                message.success('Đã lưu thay đổi!');
            } else {
                // === LOGIC TẠO MỚI ===
                await createEvent(eventData);
                message.success(statusType === 'PENDING' ? 'Đã gửi duyệt!' : 'Đã lưu nháp!');
            }
            
            navigate('/manage-events');
        } catch (error) {
            console.error(error);
            message.error('Có lỗi xảy ra.');
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
            tenDanhMuc: selectedCategory ? selectedCategory.tenDanhMuc : 'Chưa chọn danh mục',
                
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

    // 3. HÀM XỬ LÝ UPLOAD CHUNG (Dùng cho customRequest)
    const handleCustomUpload = async ({ file, onSuccess, onError }, type) => {
        try {
            // Gọi API upload file lên Backend
            const url = await uploadFile(file);
            
            // Upload thành công -> Báo cho Ant Design biết
            onSuccess(url); 
            message.success(`Tải ảnh ${type === 'THUMB' ? 'Thumbnail' : 'Bìa'} thành công!`);

            // Cập nhật giá trị URL vào Form ẩn để gửi đi sau này
            if (type === 'THUMB') {
                form.setFieldsValue({ anhThumbnail: url });
            } else {
                form.setFieldsValue({ anhBia: url });
            }
        } catch (error) {
            onError(error);
            message.error('Upload thất bại, vui lòng thử lại.');
        }
    };

    // 4. HÀM KIỂM TRA FILE TRƯỚC KHI UPLOAD
    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
        if (!isJpgOrPng) {
            message.error('Chỉ hỗ trợ file JPG/PNG/GIF!');
        }
        const isLt2M = file.size / 1024 / 1024 < 5; // Cho phép dưới 5MB
        if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    // 5. HÀM XỬ LÝ THAY ĐỔI LIST (Xóa ảnh, Cập nhật trạng thái)
    const handleChange = (info, type) => {
        let newFileList = [...info.fileList];

        // Giới hạn chỉ giữ 1 file mới nhất
        newFileList = newFileList.slice(-1);

        // Nếu upload xong, gán URL thật vào file object để hiển thị preview
        newFileList = newFileList.map(file => {
            if (file.response) {
                file.url = file.response; // response chính là cái URL trả về từ onSuccess
            }
            return file;
        });

        if (type === 'THUMB') {
            setThumbnailFileList(newFileList);
            // Nếu xóa hết ảnh -> Xóa value trong form
            if (newFileList.length === 0) form.setFieldsValue({ anhThumbnail: null });
        } else {
            setCoverFileList(newFileList);
            if (newFileList.length === 0) form.setFieldsValue({ anhBia: null });
        }
    };

    // --- CẤU HÌNH PROPS CHO DRAGGER ---
    // Tạo cấu hình riêng cho từng loại để tái sử dụng code UI
    const getUploadProps = (type) => ({
        name: 'file',
        multiple: false,
        maxCount: 1,
        listType: "picture", // Hiển thị dạng danh sách có ảnh nhỏ
        beforeUpload: beforeUpload,
        customRequest: (options) => handleCustomUpload(options, type), // Logic upload tùy chỉnh
        onChange: (info) => handleChange(info, type),
        fileList: type === 'THUMB' ? thumbnailFileList : coverFileList,
        onPreview: async (file) => {
            // Cho phép xem ảnh lớn khi click vào mắt
            let src = file.url || file.preview;
            if (!src) {
                src = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file.originFileObj);
                    reader.onload = () => resolve(reader.result);
                });
            }
            const image = new Image();
            image.src = src;
            const imgWindow = window.open(src);
            imgWindow?.document.write(image.outerHTML);
        },
    });

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

                                {/* Input ẩn để giữ Link ảnh gửi xuống DB */}
                                <Form.Item name="anhThumbnail" style={{ display: 'none' }}><Input /></Form.Item>
                                <Form.Item name="anhBia" style={{ display: 'none' }}><Input /></Form.Item>

                                {/* === 1. DRAGGER CHO THUMBNAIL === */}
                                <Form.Item 
                                    label="Ảnh bìa ngoài (Card sự kiện)" 
                                    tooltip="Ảnh hiển thị thu nhỏ ở danh sách sự kiện"
                                >
                                    <Dragger 
                                        {...getUploadProps('THUMB')} // Gọi hàm tạo props
                                        style={{ background: '#fafafa', borderColor: '#d9d9d9' }}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <CloudUploadOutlined style={{ color: '#4096ff' }} />
                                        </p>
                                        <p className="ant-upload-text">Nhấn để tải lên hoặc kéo thả</p>
                                        <p className="ant-upload-hint">Hỗ trợ PNG, JPG, GIF (Max 5MB)</p>
                                    </Dragger>
                                </Form.Item>

                                {/* === 2. DRAGGER CHO COVER === */}
                                <Form.Item 
                                    label="Ảnh bìa chi tiết (Trong trang sự kiện)"
                                    tooltip="Ảnh lớn hiển thị ở đầu trang chi tiết"
                                >
                                    <Dragger 
                                        {...getUploadProps('COVER')} // Gọi hàm tạo props
                                        style={{ background: '#fafafa', borderColor: '#d9d9d9' }}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <CloudUploadOutlined style={{ color: '#52c41a' }} />
                                        </p>
                                        <p className="ant-upload-text">Nhấn để tải lên hoặc kéo thả</p>
                                        <p className="ant-upload-hint">Hỗ trợ PNG, JPG, GIF (Max 5MB)</p>
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
                                {isEdit ? (
                                    // ===========================================
                                    // 🟢 GIAO DIỆN CHỈNH SỬA (EDIT MODE)
                                    // ===========================================
                                    <>
                                        {/* 1. Gửi duyệt (Chuyển sang PENDING) */}
                                        <Button 
                                            type="primary" 
                                            block 
                                            icon={<SendOutlined />} 
                                            loading={loading}
                                            onClick={() => handleSubmit('PENDING')}
                                        >
                                            Gửi duyệt lại
                                        </Button>

                                        {/* 2. Lưu thay đổi (Giữ nguyên trạng thái cũ hoặc mặc định DRAFT) */}
                                        <Button 
                                            block 
                                            icon={<SaveOutlined />} 
                                            loading={loading}
                                            onClick={() => handleSubmit(formData?.trangThai || 'DRAFT')}
                                        >
                                            Lưu thay đổi (Nháp)
                                        </Button>

                                        {/* 3. Xem trước */}
                                        <Button block icon={<EyeOutlined />} onClick={handlePreview}>
                                            Xem trước
                                        </Button>

                                        {/* 4. Huỷ chỉnh sửa */}
                                        <Button type="text" block danger onClick={() => navigate(-1)}>
                                            Huỷ chỉnh sửa
                                        </Button>
                                    </>
                                ) : (
                                    // ===========================================
                                    // 🔵 GIAO DIỆN TẠO MỚI (CREATE MODE)
                                    // ===========================================
                                    <>
                                        <Button 
                                            type="primary" 
                                            block 
                                            icon={<SendOutlined />} 
                                            loading={loading}
                                            onClick={() => handleSubmit('PENDING')}
                                        >
                                            Gửi duyệt
                                        </Button>

                                        <Button 
                                            block 
                                            icon={<SaveOutlined />} 
                                            loading={loading}
                                            onClick={() => handleSubmit('DRAFT')}
                                        >
                                            Lưu nháp
                                        </Button>

                                        <Button block icon={<EyeOutlined />} onClick={handlePreview}>
                                            Xem trước
                                        </Button>

                                        <Button type="text" block danger onClick={() => navigate(-1)}>
                                            Hủy & Thoát
                                        </Button>
                                    </>
                                )}
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