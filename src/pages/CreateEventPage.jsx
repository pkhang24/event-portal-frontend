import { useState, useEffect } from 'react';
import { 
    Layout, Form, Input, Button, Select, DatePicker, 
    Upload, message, Card, Row, Col, Typography, Space 
} from 'antd';
import { 
    CloudUploadOutlined, SaveOutlined, SendOutlined, EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import MyNavbar from '../components/MyNavbar';
import { createEvent, updateEvent } from '../services/eventService';
import { getCategories } from '../services/eventService'; 
import { getCurrentUser } from '../services/authService';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreateEventPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const BE_URL = "http://localhost:8080/uploads";
    
    // Lấy dữ liệu được truyền qua navigation (từ nút Sửa hoặc nút Quay lại từ Preview)
    const { formData, isEdit } = location.state || {};
    
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // === STATE QUẢN LÝ FILE ===
    const [thumbnailFileList, setThumbnailFileList] = useState([]); 
    const [coverFileList, setCoverFileList] = useState([]);         

    // === 1. SỬA LẠI USEEFFECT: KHÔI PHỤC DỮ LIỆU ===
    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);

        // Chỉ cần kiểm tra formData có tồn tại hay không
        if (formData) {
            console.log("Khôi phục dữ liệu:", formData); // Debug

            // Fill dữ liệu vào form
            form.setFieldsValue({
                ...formData,
                // Chuyển đổi chuỗi ngày tháng (String) thành đối tượng Dayjs cho DatePicker
                thoiGianBatDau: formData.thoiGianBatDau ? dayjs(formData.thoiGianBatDau) : null,
                thoiGianKetThuc: formData.thoiGianKetThuc ? dayjs(formData.thoiGianKetThuc) : null,
                categoryId: formData.categoryId
            });

            // Khôi phục hiển thị ảnh Thumbnail (nếu có)
            if (formData.anhThumbnail && typeof formData.anhThumbnail === 'string') {
                setThumbnailFileList([{
                    uid: '-1',
                    name: 'thumbnail.png',
                    status: 'done',
                    url: `${BE_URL}/${formData.anhThumbnail}`,
                }]);
            }

            // Khôi phục hiển thị ảnh Bìa (nếu có)
            if (formData.anhBia && typeof formData.anhBia === 'string') {
                setCoverFileList([{
                    uid: '-2',
                    name: 'cover.png',
                    status: 'done',
                    url: `${BE_URL}/${formData.anhBia}`,
                }]);
            }
        }
    }, [formData, form]); // Bỏ dependency isEdit để logic lỏng hơn

    // === 2. HÀM SUBMIT (ĐÃ CẬP NHẬT .format() ĐỂ SỬA LỖI NGÀY THÁNG) ===
    const handleSubmit = async (statusType) => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const formDataSubmit = new FormData();

            // Append Text Data
            formDataSubmit.append('tieuDe', values.tieuDe);
            formDataSubmit.append('moTaNgan', values.moTaNgan);
            formDataSubmit.append('noiDung', values.noiDung);
            formDataSubmit.append('diaDiem', values.diaDiem);
            
            // Format ngày tháng chuẩn YYYY-MM-DDTHH:mm:ss (Không có Z)
            if (values.thoiGianBatDau) formDataSubmit.append('thoiGianBatDau', values.thoiGianBatDau.format('YYYY-MM-DDTHH:mm:ss'));
            if (values.thoiGianKetThuc) formDataSubmit.append('thoiGianKetThuc', values.thoiGianKetThuc.format('YYYY-MM-DDTHH:mm:ss'));
            
            if (values.soLuongGioiHan) formDataSubmit.append('soLuongGioiHan', values.soLuongGioiHan);
            if (values.categoryId) formDataSubmit.append('categoryId', values.categoryId);
            formDataSubmit.append('trangThai', statusType);

            // Append File Ảnh Thumbnail
            if (thumbnailFileList.length > 0) {
                const file = thumbnailFileList[0].originFileObj;
                if (file) formDataSubmit.append('image', file); 
            }

            // Append File Ảnh Bìa (Nếu backend hỗ trợ)
            if (coverFileList.length > 0) {
                const file = coverFileList[0].originFileObj;
                if (file) formDataSubmit.append('coverImage', file); 
            }

            // Gọi API
            if (isEdit) {
                await updateEvent(formData.id, formDataSubmit);
                message.success('Cập nhật thành công!');
            } else {
                await createEvent(formDataSubmit);
                message.success(statusType === 'PENDING' ? 'Đã gửi duyệt!' : 'Đã lưu nháp!');
            }
            
            navigate('/manage-events');

        } catch (error) {
            console.error("Lỗi submit:", error);
            message.error('Có lỗi xảy ra, vui lòng kiểm tra lại.');
        } finally {
            setLoading(false);
        }
    };

    // Cấu hình chặn auto upload
    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
        if (!isJpgOrPng) message.error('Chỉ hỗ trợ file ảnh!');
        const isLt5M = file.size / 1024 / 1024 < 20;
        if (!isLt5M) message.error('Ảnh phải nhỏ hơn 20MB!');
        return false; 
    };

    const handleFileChange = ({ fileList }, type) => {
        const newFileList = fileList.slice(-1); // Chỉ giữ 1 ảnh mới nhất
        if (type === 'THUMB') setThumbnailFileList(newFileList);
        else setCoverFileList(newFileList);
    };

    // === 3. HÀM XEM TRƯỚC (ĐẢM BẢO TRUYỀN DỮ LIỆU ĐÚNG ĐỂ QUAY LẠI ĐƯỢC) ===
    const handlePreview = async () => {
        try {
            const values = await form.validateFields();
            
            // Xử lý link ảnh preview (Blob URL)
            let previewThumbnail = null;
            if (thumbnailFileList.length > 0) {
                const file = thumbnailFileList[0];
                previewThumbnail = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
            }

            let previewCover = null;
            if (coverFileList.length > 0) {
                const file = coverFileList[0];
                previewCover = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
            }

            const selectedCategory = categories.find(c => c.id === values.categoryId);
            const currentUser = getCurrentUser();

            // Dữ liệu hiển thị trên trang Preview
            const previewEventData = {
                ...values,
                id: formData?.id || 'preview',
                // Chuyển sang chuỗi để trang Preview hiển thị được (dùng .format hoặc .toISOString đều được cho việc hiển thị)
                thoiGianBatDau: values.thoiGianBatDau.toISOString(),
                thoiGianKetThuc: values.thoiGianKetThuc.toISOString(),
                anhThumbnail: previewThumbnail,
                anhBia: previewCover,
                tenNguoiDang: currentUser?.hoTen || 'Tôi',
                tenDanhMuc: selectedCategory?.tenDanhMuc || 'Danh mục',
                categoryId: values.categoryId,
                isPreview: true
            };

            // Dữ liệu để KHÔI PHỤC khi nhấn nút Quay lại
            // Quan trọng: Phải giữ nguyên cấu trúc để useEffect ở trên đọc được
            const restoreData = {
                ...values, 
                id: formData?.id,
                trangThai: formData?.trangThai,
                anhThumbnail: previewThumbnail, // Truyền lại link blob để hiển thị lại ảnh đã chọn
                anhBia: previewCover,
                // Lưu chuỗi ISO để useEffect convert lại thành Dayjs
                thoiGianBatDau: values.thoiGianBatDau.toISOString(), 
                thoiGianKetThuc: values.thoiGianKetThuc.toISOString(),
            };

            navigate('/events/preview', { 
                state: { 
                    previewData: previewEventData, 
                    // Truyền object này để khi ở trang Preview nhấn "Quay lại", nó sẽ gửi object này về
                    // (Lưu ý: Logic nút "Quay lại" ở trang Preview phải navigate về với state: { formData: restoreData })
                    formData: restoreData,
                    isEdit: isEdit // Giữ nguyên trạng thái sửa hay thêm mới
                } 
            });

        } catch (error) {
            message.error("Vui lòng nhập đủ thông tin bắt buộc!");
        }
    };

    // Hàm hỗ trợ xem trước ảnh khi bấm vào biểu tượng "con mắt"
    const onPreview = async (file) => {
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
    };

    // CSS tùy chỉnh để tăng kích thước ảnh preview
    const customUploadStyle = `
        .custom-upload-dragger .ant-upload-list-picture-card-container {
            width: 180px !important;  /* Tăng chiều rộng (mặc định là 104px) */
            height: 180px !important; /* Tăng chiều cao (mặc định là 104px) */
        }
        .custom-upload-dragger .ant-upload-list-item-list-type-picture-card {
             width: 100% !important;
             height: 100% !important;
        }
    `;

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <style>{customUploadStyle}</style>
            <MyNavbar />
            
            <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', width: '100%' }}>
                <div style={{ marginBottom: 24 }}>
                    <Title level={2} style={{ marginTop: 0 }}>{isEdit ? "Chỉnh Sửa Sự Kiện" : "Tạo Sự Kiện Mới"}</Title>
                </div>

                <Form form={form} layout="vertical" size="large">
                    <Row gutter={24}>
                        {/* CỘT TRÁI */}
                        <Col xs={24} lg={16}>
                            <Card title="Thông tin chung" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
                                <Form.Item name="tieuDe" label="Tên sự kiện" rules={[{ required: true, message: 'Nhập tên sự kiện' }]}>
                                    <Input placeholder="Ví dụ: Hội thảo AI" />
                                </Form.Item>

                                <Form.Item name="moTaNgan" label="Mô tả ngắn" rules={[{ required: true }]}>
                                    <TextArea rows={3} placeholder="Mô tả ngắn gọn..." />
                                </Form.Item>

                                <Form.Item name="noiDung" label="Mô tả chi tiết" rules={[{ required: true }]}>
                                    <TextArea rows={8} placeholder="Nội dung chi tiết..." />
                                </Form.Item>

                                {/* UPLOAD THUMBNAIL */}
                                <Form.Item label="Ảnh Thumbnail (Danh sách)" required>
                                    <Dragger 
                                        className="custom-upload-dragger"
                                        fileList={thumbnailFileList} // Hiển thị list ảnh (có ảnh cũ từ useEffect)
                                        beforeUpload={beforeUpload}  // Chặn upload tự động
                                        onChange={(info) => handleFileChange(info, 'THUMB')} // Xử lý thêm/xóa ảnh
                                        onPreview={onPreview}        // <--- THÊM DÒNG NÀY (Xem ảnh to)
                                        maxCount={1}
                                        listType="picture-card"      // <--- ĐỔI THÀNH 'picture-card' ĐỂ HIỆN ẢNH ĐẸP HƠN
                                        showUploadList={{            // Cấu hình nút xóa/xem
                                            showRemoveIcon: true,
                                            showPreviewIcon: true
                                        }}
                                        style={{ 
                                            // Nếu đã có ảnh: Ẩn viền, nền trong suốt, padding = 0 để ảnh hiển thị đẹp
                                            // Nếu chưa có ảnh: Hiện viền nét đứt và nền xám như cũ
                                            border: thumbnailFileList.length > 0 ? 'none' : '1px dashed #d9d9d9',
                                            background: thumbnailFileList.length > 0 ? 'transparent' : '#fafafa',
                                            padding: thumbnailFileList.length > 0 ? 0 : 16,
                                        }}
                                        // Chiều cao tự động co giãn theo nội dung
                                        height={thumbnailFileList.length > 0 ? 'auto' : 200} 
                                    >
                                        {/* Chỉ hiện nút upload khi chưa có ảnh */}
                                        {thumbnailFileList.length < 1 && (
                                            <>
                                                <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
                                                <p className="ant-upload-text">Nhấn để tải lên hoặc kéo thả</p>
                                                <p className="ant-upload-hint">Hỗ trợ PNG, JPG, GIF (Max 20MB)</p>
                                            </>
                                        )}
                                    </Dragger>
                                </Form.Item>

                                {/* UPLOAD COVER */}
                                <Form.Item label="Ảnh Bìa (Chi tiết)">
                                    <Dragger 
                                        className="custom-upload-dragger"
                                        fileList={coverFileList}
                                        beforeUpload={beforeUpload}
                                        onChange={(info) => handleFileChange(info, 'COVER')}
                                        onPreview={onPreview}       // <--- THÊM DÒNG NÀY
                                        maxCount={1}
                                        listType="picture-card"     // <--- ĐỔI THÀNH 'picture-card'
                                        showUploadList={{
                                            showRemoveIcon: true,
                                            showPreviewIcon: true
                                        }}
                                        style={{ 
                                            // Nếu đã có ảnh: Ẩn viền, nền trong suốt, padding = 0 để ảnh hiển thị đẹp
                                            // Nếu chưa có ảnh: Hiện viền nét đứt và nền xám như cũ
                                            border: coverFileList.length > 0 ? 'none' : '1px dashed #d9d9d9',
                                            background: coverFileList.length > 0 ? 'transparent' : '#fafafa',
                                            padding: coverFileList.length > 0 ? 0 : 16,
                                        }}
                                        // Chiều cao tự động co giãn theo nội dung
                                        height={coverFileList.length > 0 ? 'auto' : 200} 
                                    >
                                        {coverFileList.length < 1 && (
                                            <>
                                                <p className="ant-upload-drag-icon"><CloudUploadOutlined style={{ color: 'green' }}/></p>
                                                <p className="ant-upload-text">Nhấn để tải lên hoặc kéo thả</p>
                                                <p className="ant-upload-hint">Hỗ trợ PNG, JPG, GIF (Max 20MB)</p>
                                            </>
                                        )}
                                    </Dragger>
                                </Form.Item>

                                <Form.Item name="categoryId" label="Thể loại" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn thể loại">
                                        {categories.map(cat => (
                                            <Select.Option key={cat.id} value={cat.id}>{cat.tenDanhMuc}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Card>

                            <Card title="Thời gian & Địa điểm" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="thoiGianBatDau" label="Bắt đầu" rules={[{ required: true }]}>
                                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="thoiGianKetThuc" label="Kết thúc" rules={[{ required: true }]}>
                                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item name="diaDiem" label="Địa điểm" rules={[{ required: true }]}>
                                    <Input placeholder="Ví dụ: Hội trường A" />
                                </Form.Item>
                            </Card>
                        </Col>

                        {/* CỘT PHẢI */}
                        <Col xs={24} lg={8}>
                            <Card title="Hành động" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
                                <Form.Item name="soLuongGioiHan" label="Giới hạn người">
                                    <Input type="number" placeholder="Để trống nếu không giới hạn" />
                                </Form.Item>

                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button type="primary" block icon={<SendOutlined />} loading={loading} onClick={() => handleSubmit('PENDING')}>
                                        Gửi duyệt
                                    </Button>
                                    <Button block icon={<SaveOutlined />} loading={loading} onClick={() => handleSubmit('DRAFT')}>
                                        Lưu nháp
                                    </Button>
                                    <Button block icon={<EyeOutlined />} onClick={handlePreview}>
                                        Xem trước
                                    </Button>
                                    <Button type="text" block danger onClick={() => navigate('/manage-events')}>
                                        Hủy & Thoát
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