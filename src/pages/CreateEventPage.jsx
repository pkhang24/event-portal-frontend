import { useState, useEffect } from 'react';
import { 
    Layout, Form, Input, Button, Select, DatePicker, 
    Upload, message, Card, Row, Col, Typography, Space, Modal, Divider, Tag
} from 'antd';
import { 
    CloudUploadOutlined, SaveOutlined, SendOutlined, EyeOutlined,
    CalendarOutlined, EnvironmentOutlined, UserOutlined, AppstoreOutlined, TeamOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import MyNavbar from '../components/MyNavbar';
import { createEvent, updateEvent, getCategories } from '../services/eventService';
import { getCurrentUser } from '../services/authService';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreateEventPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const BE_URL = "http://localhost:8080/uploads"; // Đổi port nếu cần
    
    // Lấy dữ liệu khi sửa
    const { formData, isEdit } = location.state || {};
    
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // State quản lý file
    const [thumbnailFileList, setThumbnailFileList] = useState([]); 
    const [coverFileList, setCoverFileList] = useState([]);         

    // State Modal Xem trước
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    // Load danh mục
    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    // === 1. LOGIC ĐIỀN DỮ LIỆU KHI SỬA (FIX LỖI MẤT DỮ LIỆU) ===
    useEffect(() => {
        if (formData) {
            // Fill dữ liệu vào form (Map thủ công để đảm bảo chính xác)
            form.setFieldsValue({
                tieuDe: formData.tieuDe,
                moTaNgan: formData.moTaNgan,
                noiDung: formData.noiDung,
                diaDiem: formData.diaDiem,
                soLuongGioiHan: formData.soLuongGioiHan,
                // Lấy ID danh mục (nếu backend trả về object category thì lấy .id)
                categoryId: formData.categoryId || (formData.category ? formData.category.id : null),
                
                // Chuyển đổi ngày tháng (Antd cần undefined nếu null)
                thoiGianBatDau: formData.thoiGianBatDau ? dayjs(formData.thoiGianBatDau) : undefined,
                thoiGianKetThuc: formData.thoiGianKetThuc ? dayjs(formData.thoiGianKetThuc) : undefined,
            });

            // Khôi phục ảnh Thumbnail
            if (formData.anhThumbnail && typeof formData.anhThumbnail === 'string') {
                const url = formData.anhThumbnail.startsWith('http') ? formData.anhThumbnail : `${BE_URL}/${formData.anhThumbnail}`;
                setThumbnailFileList([{
                    uid: '-1',
                    name: 'thumbnail.png',
                    status: 'done',
                    url: url,
                }]);
            }

            // Khôi phục ảnh Bìa
            if (formData.anhBia && typeof formData.anhBia === 'string') {
                const url = formData.anhBia.startsWith('http') ? formData.anhBia : `${BE_URL}/${formData.anhBia}`;
                setCoverFileList([{
                    uid: '-2',
                    name: 'cover.png',
                    status: 'done',
                    url: url,
                }]);
            }
        }
    }, [formData, form]);

    // === 2. XỬ LÝ SUBMIT (FIX LỖI NGÀY THÁNG & VALIDATION) ===
    const handleSubmit = async (statusType) => {
        setLoading(true);
        try {
            // Validate form
            const values = await form.validateFields();
            
            const formDataSubmit = new FormData();

            // Append Text
            formDataSubmit.append('tieuDe', values.tieuDe);
            formDataSubmit.append('moTaNgan', values.moTaNgan);
            formDataSubmit.append('noiDung', values.noiDung);
            formDataSubmit.append('diaDiem', values.diaDiem);
            
            // Format ngày tháng chuẩn Java LocalTime
            if (values.thoiGianBatDau) formDataSubmit.append('thoiGianBatDau', values.thoiGianBatDau.format('YYYY-MM-DDTHH:mm:ss'));
            if (values.thoiGianKetThuc) formDataSubmit.append('thoiGianKetThuc', values.thoiGianKetThuc.format('YYYY-MM-DDTHH:mm:ss'));
            
            if (values.soLuongGioiHan) formDataSubmit.append('soLuongGioiHan', values.soLuongGioiHan);
            if (values.categoryId) formDataSubmit.append('categoryId', values.categoryId);
            formDataSubmit.append('trangThai', statusType);

            // Gửi file (Chỉ gửi nếu là file mới upload từ máy tính - có originFileObj)
            if (thumbnailFileList.length > 0 && thumbnailFileList[0].originFileObj) {
                formDataSubmit.append('image', thumbnailFileList[0].originFileObj); 
            }

            if (coverFileList.length > 0 && coverFileList[0].originFileObj) {
                formDataSubmit.append('coverImage', coverFileList[0].originFileObj); 
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
            // Nếu lỗi validate fields, Antd tự hiện đỏ, không cần message error
            if (!error.errorFields) {
                message.error('Có lỗi hệ thống xảy ra.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper: Chặn auto upload
    const beforeUpload = (file) => {
        const isJpgOrPng = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
        if (!isJpgOrPng) message.error('Chỉ hỗ trợ file ảnh!');
        const isLt20M = file.size / 1024 / 1024 < 20;
        if (!isLt20M) message.error('Ảnh phải nhỏ hơn 20MB!');
        return false; 
    };

    const handleFileChange = ({ fileList }, type) => {
        const newFileList = fileList.slice(-1);
        if (type === 'THUMB') setThumbnailFileList(newFileList);
        else setCoverFileList(newFileList);
    };

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

    const customUploadStyle = `
        .custom-upload-dragger .ant-upload-list-picture-card-container { width: 180px !important; height: 180px !important; }
        .custom-upload-dragger .ant-upload-list-item-list-type-picture-card { width: 100% !important; height: 100% !important; }
    `;

    // === 3. CHUẨN BỊ DỮ LIỆU XEM TRƯỚC (DÙNG MODAL) ===
    const handleOpenPreview = async () => {
        try {
            const values = await form.validateFields();
            
            // Xử lý link ảnh để hiển thị (Ưu tiên Blob URL của file mới)
            let thumbUrl = null;
            if (thumbnailFileList.length > 0) {
                const file = thumbnailFileList[0];
                thumbUrl = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
            }

            let coverUrl = null;
            if (coverFileList.length > 0) {
                const file = coverFileList[0];
                coverUrl = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
            }
            
            // Ảnh bìa ưu tiên: Cover -> Thumbnail -> Placeholder
            const displayBanner = coverUrl || thumbUrl || "https://placehold.co/1200x400/1677ff/ffffff?text=Event+Banner";

            const selectedCategory = categories.find(c => c.id === values.categoryId);
            const currentUser = getCurrentUser();

            setPreviewData({
                ...values,
                displayBanner: displayBanner, 
                tenNguoiDang: currentUser?.hoTen || 'Tôi',
                tenDanhMuc: selectedCategory?.tenDanhMuc || 'Danh mục',
                // Giữ nguyên object Dayjs để format trong UI
                thoiGianBatDau: values.thoiGianBatDau,
                thoiGianKetThuc: values.thoiGianKetThuc,
            });
            
            setIsPreviewOpen(true);
        } catch (error) {
            message.error("Vui lòng điền các thông tin bắt buộc trước khi xem trước!");
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <style>{customUploadStyle}</style>
            <MyNavbar />
            
            <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', width: '100%' }}>
                <div style={{ marginBottom: 24 }}>
                    <Title level={2} style={{ marginTop: 0 }}>{isEdit ? "Chỉnh Sửa Sự Kiện" : "Tạo Sự Kiện Mới"}</Title>
                </div>

                {/* SỬA LỖI VALIDATION: Bỏ onFinish ở Form, xử lý thủ công ở Button */}
                <Form form={form} layout="vertical" size="large" autoComplete="off">
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <Card title="Thông tin chung" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
                                
                                {/* TÁCH BIỆT INPUT RA KHỎI DÒNG ĐỂ TRÁNH LỖI HTML */}
                                <Form.Item name="tieuDe" label="Tên sự kiện" rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}>
                                    <Input placeholder="Ví dụ: Hội thảo AI" />
                                </Form.Item>

                                <Form.Item name="moTaNgan" label="Mô tả ngắn" rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn!' }]}>
                                    <TextArea rows={3} placeholder="Mô tả ngắn gọn..." />
                                </Form.Item>

                                <Form.Item name="noiDung" label="Mô tả chi tiết" rules={[{ required: true, message: 'Vui lòng nhập nội dung chi tiết!' }]}>
                                    <TextArea rows={8} placeholder="Nội dung chi tiết..." />
                                </Form.Item>

                                <Form.Item label="Ảnh Thumbnail (Danh sách)" required tooltip="Ảnh nhỏ hiển thị ở danh sách">
                                    <Dragger 
                                        className="custom-upload-dragger"
                                        fileList={thumbnailFileList}
                                        beforeUpload={beforeUpload}
                                        onChange={(info) => handleFileChange(info, 'THUMB')}
                                        onPreview={onPreview}
                                        maxCount={1}
                                        listType="picture-card"
                                        showUploadList={{ showRemoveIcon: true, showPreviewIcon: true }}
                                        style={{ border: thumbnailFileList.length > 0 ? 'none' : '1px dashed #d9d9d9', background: thumbnailFileList.length > 0 ? 'transparent' : '#fafafa', padding: thumbnailFileList.length > 0 ? 0 : 16 }}
                                        height={thumbnailFileList.length > 0 ? 'auto' : 200}
                                    >
                                        {thumbnailFileList.length < 1 && (<><p className="ant-upload-drag-icon"><CloudUploadOutlined /></p><p className="ant-upload-text">Chọn Thumbnail</p></>)}
                                    </Dragger>
                                </Form.Item>

                                <Form.Item label="Ảnh Bìa (Chi tiết)" tooltip="Ảnh lớn hiển thị trong trang chi tiết">
                                    <Dragger 
                                        className="custom-upload-dragger"
                                        fileList={coverFileList}
                                        beforeUpload={beforeUpload}
                                        onChange={(info) => handleFileChange(info, 'COVER')}
                                        onPreview={onPreview}
                                        maxCount={1}
                                        listType="picture-card"
                                        showUploadList={{ showRemoveIcon: true, showPreviewIcon: true }}
                                        style={{ border: coverFileList.length > 0 ? 'none' : '1px dashed #d9d9d9', background: coverFileList.length > 0 ? 'transparent' : '#fafafa', padding: coverFileList.length > 0 ? 0 : 16 }}
                                        height={coverFileList.length > 0 ? 'auto' : 200}
                                    >
                                        {coverFileList.length < 1 && (<><p className="ant-upload-drag-icon"><CloudUploadOutlined style={{ color: 'green' }}/></p><p className="ant-upload-text">Chọn ảnh Bìa lớn</p></>)}
                                    </Dragger>
                                </Form.Item>

                                <Form.Item name="categoryId" label="Thể loại" rules={[{ required: true, message: 'Vui lòng chọn thể loại!' }]}>
                                    <Select placeholder="Chọn thể loại">
                                        {categories.map(cat => (<Select.Option key={cat.id} value={cat.id}>{cat.tenDanhMuc}</Select.Option>))}
                                    </Select>
                                </Form.Item>
                            </Card>

                            <Card title="Thời gian & Địa điểm" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="thoiGianBatDau" label="Bắt đầu" rules={[{ required: true, message: 'Chọn thời gian bắt đầu!' }]}>
                                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="thoiGianKetThuc" label="Kết thúc" rules={[{ required: true, message: 'Chọn thời gian kết thúc!' }]}>
                                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item name="diaDiem" label="Địa điểm" rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}>
                                    <Input placeholder="Ví dụ: Hội trường A" />
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Card title="Hành động" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
                                <Form.Item name="soLuongGioiHan" label="Giới hạn người">
                                    <Input type="number" placeholder="Để trống nếu không giới hạn" />
                                </Form.Item>

                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button type="primary" block icon={<SendOutlined />} loading={loading} onClick={() => handleSubmit('PENDING')}>Gửi duyệt</Button>
                                    <Button block icon={<SaveOutlined />} loading={loading} onClick={() => handleSubmit('DRAFT')}>Lưu nháp</Button>
                                    <Button block icon={<EyeOutlined />} onClick={handleOpenPreview}>Xem trước</Button>
                                    <Button type="text" block danger onClick={() => navigate('/manage-events')}>Hủy & Thoát</Button>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Content>

            {/* === 4. MODAL XEM TRƯỚC (LAYOUT CHUẨN GIỐNG EVENT PAGE DETAIL) === */}
            <Modal
                title="Xem trước sự kiện (Giao diện người dùng)"
                open={isPreviewOpen}
                onCancel={() => setIsPreviewOpen(false)}
                footer={null}
                width={1200}
                style={{ top: 20 }}
                bodyStyle={{ padding: 0, background: '#f5f7fa' }}
            >
                {previewData && (
                    <div style={{ padding: '24px' }}>
                        {/* BANNER: Dùng ảnh bìa, nếu không có thì dùng thumbnail */}
                        <div style={{ 
                            width: '100%', height: '350px', 
                            borderRadius: '16px', overflow: 'hidden', marginBottom: '40px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', background: '#fff'
                        }}>
                             <img
                                alt={previewData.tieuDe}
                                src={previewData.displayBanner}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        <Row gutter={[48, 24]}>
                            {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
                            <Col xs={24} lg={16}>
                                <Card bordered={false} style={{ borderRadius: '16px', background: '#fff' }} bodyStyle={{ padding: '32px' }}>
                                    <Typography>
                                        <Title level={1} style={{ color: '#334155', fontSize: '32px', marginTop: 0, marginBottom: 16 }}>
                                            {previewData.tieuDe}
                                        </Title>
                                        
                                        <Paragraph style={{ color: '#334155', fontSize: '18px', lineHeight: '1.7', marginBottom: 40 }}>
                                            {previewData.moTaNgan}
                                        </Paragraph>

                                        <Divider style={{ borderColor: '#e2e8f0' }} />

                                        <div style={{ marginBottom: 40 }}>
                                            <Title level={4} style={{ color: '#334155', marginBottom: 16 }}>Mô tả chi tiết</Title>
                                            <div 
                                                className="event-content-preview"
                                                style={{ color: '#334155', fontSize: '16px', lineHeight: '1.8', overflowWrap: 'break-word' }}
                                                dangerouslySetInnerHTML={{ __html: previewData.noiDung ? previewData.noiDung.replace(/\n/g, '<br/>') : '' }} 
                                            />
                                        </div>
                                    </Typography>
                                </Card>
                            </Col>

                            {/* CỘT PHẢI: STICKY INFO */}
                            <Col xs={24} lg={8}>
                                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                                    <Button type="primary" size="large" block style={{ height: '48px', fontSize: '16px', fontWeight: 'bold', marginBottom: 24, background: '#2563eb' }} disabled>
                                        Đăng ký tham gia ngay
                                    </Button>

                                    <Divider style={{ margin: '0 0 24px 0' }} />

                                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                                        {/* Thời gian */}
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <div style={{ width: 40, height: 40, background: '#2781ffff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CalendarOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                            </div>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '13px' }}>Thời gian</div>
                                                <div style={{ color: '#334155', fontWeight: 500 }}>
                                                    {previewData.thoiGianBatDau?.format('HH:mm, DD/MM/YYYY')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Địa điểm */}
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <div style={{ width: 40, height: 40, background: '#e68c25ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <EnvironmentOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                            </div>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '13px' }}>Địa điểm</div>
                                                <div style={{ color: '#334155', fontWeight: 500 }}>{previewData.diaDiem}</div>
                                            </div>
                                        </div>

                                        {/* Người đăng */}
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <div style={{ width: 40, height: 40, background: '#13c2c2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UserOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                            </div>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '13px' }}>Người đăng</div>
                                                <div style={{ color: '#334155', fontWeight: 500 }}>{previewData.tenNguoiDang}</div>
                                            </div>
                                        </div>

                                        {/* Chủ đề */}
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <div style={{ width: 40, height: 40, background: '#722ed1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AppstoreOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                            </div>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '13px' }}>Chủ đề</div>
                                                <Tag color="blue" style={{ margin: 0, fontWeight: 500 }}>{previewData.tenDanhMuc}</Tag>
                                            </div>
                                        </div>

                                        {/* Số lượng */}
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <div style={{ width: 40, height: 40, background: '#20eb6eff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <TeamOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                            </div>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '13px' }}>Số người tham gia</div>
                                                <div style={{ color: '#334155', fontWeight: 500 }}>
                                                    {previewData.soLuongGioiHan ? `${previewData.soLuongGioiHan} người` : 'Không giới hạn'}
                                                </div>
                                            </div>
                                        </div>
                                    </Space>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default CreateEventPage;