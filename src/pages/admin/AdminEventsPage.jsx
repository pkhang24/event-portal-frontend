import { useState, useEffect } from 'react';
import { Card, Tabs, Input, Badge, Space, message, Modal, Row, Col, Typography, Divider, Tag, Button } from 'antd';
import { 
    ClockCircleOutlined, CheckCircleOutlined, StopOutlined, 
    AppstoreOutlined, ExclamationCircleOutlined,
    CalendarOutlined, EnvironmentOutlined, UserOutlined, TeamOutlined, CheckOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs'; // Import dayjs để format ngày
import EventManagementTab from '../../components/admin/EventManagementTab';
import { 
    getAllEventsForAdmin, approveEvent, rejectEvent, cancelEvent, 
    getDeletedEvents, 
} from '../../services/adminService';

const { Search } = Input;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const AdminEventsPage = () => {
    // State dữ liệu
    const [activeEvents, setActiveEvents] = useState([]);
    const [trashEvents, setTrashEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    // State UI
    const [activeTab, setActiveTab] = useState('PENDING');
    const [searchText, setSearchText] = useState('');

    // State Modal Action (Từ chối/Hủy)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [reason, setReason] = useState('');
    const [actionType, setActionType] = useState(null); 
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // --- 1. STATE CHO PREVIEW MODAL (MỚI) ---
    const [previewEvent, setPreviewEvent] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
    // URL Backend để load ảnh
    const BE_URL = "http://localhost:8080/uploads"; 

    // --- FETCH DATA ---
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const [activeData, trashData] = await Promise.all([
                getAllEventsForAdmin(),
                getDeletedEvents()
            ]);
            setActiveEvents(activeData);
            setTrashEvents(trashData);
        } catch (err) {
            message.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // --- HÀM XỬ LÝ ẢNH ---
    const getImageUrl = (imgName) => {
        if (!imgName) return "https://placehold.co/1200x400/e2e8f0/1e293b?text=No+Image";
        if (imgName.startsWith('http')) return imgName;
        return `${BE_URL}/${imgName}`;
    };

    // --- CÁC HÀNH ĐỘNG ---
    const handleApprove = async (id) => {
        try { 
            await approveEvent(id); 
            message.success("Đã duyệt!"); 
            setIsPreviewOpen(false); // Đóng preview nếu đang mở
            fetchEvents(); 
        } 
        catch (e) { message.error("Lỗi duyệt bài"); }
    };

    // Hàm mở Modal Action (Từ chối/Hủy)
    const openActionModal = (id, type) => {
        setSelectedEventId(id);
        setActionType(type);
        setReason('');
        setIsModalVisible(true);
        setIsPreviewOpen(false); // Đóng preview nếu đang mở
    };

    const handleModalOk = async () => {
        if (!reason.trim()) {
            message.warning("Vui lòng nhập lý do!");
            return;
        }
        setModalLoading(true);
        try {
            if (actionType === 'REJECT') {
                await rejectEvent(selectedEventId, reason);
                message.success("Đã từ chối!");
            } else if (actionType === 'CANCEL') {
                await cancelEvent(selectedEventId, reason);
                message.success("Đã hủy!");
            }
            setIsModalVisible(false);
            fetchEvents();
        } catch (error) {
            message.error("Có lỗi xảy ra.");
        } finally {
            setModalLoading(false);
        }
    };

    // --- 2. HÀM MỞ PREVIEW (MỚI) ---
    const handlePreview = (event) => {
        setPreviewEvent(event);
        setIsPreviewOpen(true);
    };

    // --- LỌC DỮ LIỆU ---
    const getDataSource = () => {
        let source = [];
        if (activeTab === 'TRASH') source = trashEvents;
        else if (activeTab === 'ALL') source = activeEvents;
        else source = activeEvents.filter(e => e.trangThai === activeTab);

        if (searchText) {
            source = source.filter(item => 
                item.tieuDe.toLowerCase().includes(searchText.toLowerCase()) ||
                (item.tenNguoiDang && item.tenNguoiDang.toLowerCase().includes(searchText.toLowerCase()))
            );
        }
        return source;
    };

    const countStatus = (status) => activeEvents.filter(e => e.trangThai === status).length;

    const items = [
        { key: 'ALL', label: (<Space>Tất cả<Badge count={activeEvents.length} showZero color="#1890ff" /></Space>), icon: <AppstoreOutlined /> },
        { key: 'PENDING', label: (<Space>Chờ duyệt<Badge count={countStatus('PENDING')} showZero color="#faad14" /></Space>), icon: <ClockCircleOutlined /> },
        { key: 'PUBLISHED', label: (<Space>Đã công khai<Badge count={countStatus('PUBLISHED')} showZero color="#52c41a" /></Space>), icon: <CheckCircleOutlined /> },
        { key: 'CANCELLED', label: (<Space>Đã hủy<Badge count={countStatus('CANCELLED')} showZero color="#ff4d4f" /></Space>), icon: <StopOutlined /> },
    ];

    // CSS định dạng nội dung cho Admin Preview
    const adminContentStyle = `
        .admin-content-view {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            font-size: 15px; /* Admin có thể để chữ nhỏ hơn chút cho gọn */
            line-height: 1.6;
            color: #333;
            overflow-wrap: break-word;
        }

        /* 1. Fix lỗi Enter bị xa */
        .admin-content-view p {
            margin-bottom: 0px !important;
            margin-top: 0px !important;
            padding: 0 !important;
            line-height: 1.5 !important;
        }

        /* 2. Fix lỗi danh sách */
        .admin-content-view ul, .admin-content-view ol {
            margin: 0 !important;
            padding-left: 1.5em !important;
        }

        /* 3. Fix lỗi ẢNH BỊ TRÀN (Quan trọng nhất) */
        .admin-content-view img {
            max-width: 100% !important; 
            height: auto !important;    
            display: block;
            margin: 10px auto;          
            border-radius: 4px;
            border: 1px solid #f0f0f0; /* Thêm viền nhẹ để Admin dễ nhìn */
        }
    `;

    return (
        <Card 
            title="Quản lý Sự kiện" 
            extra={
                <Search
                    placeholder="Tìm theo tên sự kiện hoặc người đăng..."
                    allowClear
                    onSearch={setSearchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
            }
        >
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} type="card" style={{ marginBottom: 16 }} />

            <EventManagementTab 
                events={getDataSource()} 
                loading={loading} 
                viewMode={activeTab === 'TRASH' ? 'trash' : 'list'} 
                onApprove={handleApprove} 
                onReject={(id) => openActionModal(id, 'REJECT')}
                onCancelEvent={(id) => openActionModal(id, 'CANCEL')}
                
                // === TRUYỀN HÀM PREVIEW XUỐNG ===
                onPreview={handlePreview}
            />

            {/* MODAL NHẬP LÝ DO (REJECT/CANCEL) */}
            <Modal
                title={actionType === 'REJECT' ? "Từ chối duyệt sự kiện" : "Hủy sự kiện"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={modalLoading}
                okText="Xác nhận"
                cancelText="Quay lại"
                okButtonProps={{ danger: true }}
            >
                <div style={{ marginBottom: 12 }}>
                    <Space>
                        <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
                        <span>{actionType === 'REJECT' ? "Sự kiện sẽ bị chuyển về trạng thái NHÁP." : "Sự kiện sẽ bị GỠ KHỎI trang chủ."}</span>
                    </Space>
                </div>
                <p>Vui lòng nhập lý do:</p>
                <TextArea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nhập lý do..." />
            </Modal>

            {/* === 3. MODAL PREVIEW (XEM TRƯỚC SỰ KIỆN) === */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>Xem chi tiết sự kiện</span>
                        {previewEvent?.trangThai === 'PENDING' && <Tag color="orange">Đang chờ duyệt</Tag>}
                    </div>
                }
                open={isPreviewOpen}
                onCancel={() => setIsPreviewOpen(false)}
                width={1000}
                style={{ top: 20 }}
                footer={[
                    <Button key="close" onClick={() => setIsPreviewOpen(false)}>Đóng</Button>,
                    // Nếu đang PENDING thì hiện nút Duyệt ngay trong Modal cho tiện
                    previewEvent?.trangThai === 'PENDING' && (
                        <Button 
                            key="approve" 
                            type="primary" 
                            icon={<CheckOutlined />} 
                            onClick={() => handleApprove(previewEvent.id)}
                        >
                            Duyệt bài này
                        </Button>
                    ),
                    previewEvent?.trangThai === 'PENDING' && (
                        <Button 
                            key="reject" 
                            danger 
                            onClick={() => openActionModal(previewEvent.id, 'REJECT')}
                        >
                            Từ chối
                        </Button>
                    )
                ]}
                bodyStyle={{ padding: 0, background: '#f5f7fa' }}
            >
                <style>{adminContentStyle}</style>
                {previewEvent && (
                    <div style={{ padding: '24px' }}>
                        {/* BANNER */}
                        <div style={{ 
                            width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', background: '#fff'
                        }}>
                             <img
                                alt={previewEvent.tieuDe}
                                // Ưu tiên ảnh bìa, nếu không có lấy thumbnail
                                src={getImageUrl(previewEvent.anhBia || previewEvent.anhThumbnail)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        <Row gutter={[32, 24]}>
                            {/* CỘT TRÁI: NỘI DUNG */}
                            <Col xs={24} lg={16}>
                                <Card bordered={false} style={{ borderRadius: '12px' }}>
                                    <Title level={2} style={{ marginTop: 0 }}>{previewEvent.tieuDe}</Title>
                                    <Paragraph style={{ fontSize: '16px', color: '#666' }}>{previewEvent.moTaNgan}</Paragraph>
                                    <Divider />
                                    <div 
                                        className="admin-content-view"
                                        style={{ fontSize: '15px', lineHeight: '1.6', overflowWrap: 'break-word' }}
                                        dangerouslySetInnerHTML={{ __html: previewEvent.noiDung }} 
                                    />
                                </Card>
                            </Col>

                            {/* CỘT PHẢI: THÔNG TIN */}
                            <Col xs={24} lg={8}>
                                <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <CalendarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                                            <div>
                                                <div style={{ fontSize: 12, color: '#888' }}>Thời gian</div>
                                                <div style={{ fontWeight: 500 }}>
                                                    {dayjs(previewEvent.thoiGianBatDau).format('HH:mm DD/MM/YYYY')}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <EnvironmentOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
                                            <div>
                                                <div style={{ fontSize: 12, color: '#888' }}>Địa điểm</div>
                                                <div style={{ fontWeight: 500 }}>{previewEvent.diaDiem}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <UserOutlined style={{ fontSize: 20, color: '#13c2c2' }} />
                                            <div>
                                                <div style={{ fontSize: 12, color: '#888' }}>Người đăng</div>
                                                <div style={{ fontWeight: 500 }}>{previewEvent.tenNguoiDang}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <AppstoreOutlined style={{ fontSize: 20, color: '#722ed1' }} />
                                            <div>
                                                <div style={{ fontSize: 12, color: '#888' }}>Chủ đề</div>
                                                <Tag color="blue" style={{ margin: 0, fontWeight: 500 }}>
                                                    {/* Xử lý hiển thị tên danh mục an toàn */}
                                                    {previewEvent.tenDanhMuc || previewEvent.category?.tenDanhMuc || 'Chưa phân loại'}
                                                </Tag>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <TeamOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                                            <div>
                                                <div style={{ fontSize: 12, color: '#888' }}>Số lượng</div>
                                                <div style={{ fontWeight: 500 }}>
                                                    {previewEvent.soLuongGioiHan ? `${previewEvent.soLuongGioiHan} người` : 'Không giới hạn'}
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
        </Card>
    );
};

export default AdminEventsPage;