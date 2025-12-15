import { useEffect, useState } from 'react';
import { 
    Layout, Table, Button, Space, Typography, Tag, Popconfirm,
    Modal, message, Tooltip, Tabs, Badge, Input, Card 
} from 'antd';
import { 
    PlusOutlined, EditOutlined, DeleteOutlined, 
    EyeOutlined, SearchOutlined, TeamOutlined, 
    DownloadOutlined, UndoOutlined, DeleteFilled,
    CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MyNavbar from '../components/MyNavbar';
// Đảm bảo import đủ các service
import { 
    getMyEvents, softDeleteEvent, 
    getMyDeletedEvents, restoreEvent, permanentDeleteEvent, // Import mới
    getParticipants 
} from '../services/eventService';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

const PosterEventsPage = () => {
    const navigate = useNavigate();
    // const [modal, contextHolder] = Modal.useModal();
    
    // 1. STATE QUẢN LÝ DỮ LIỆU
    const [events, setEvents] = useState([]);      // Sự kiện active (chưa xóa)
    const [trashEvents, setTrashEvents] = useState([]); // Sự kiện trong thùng rác
    const [loading, setLoading] = useState(true);
    
    // 2. STATE UI
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchText, setSearchText] = useState('');

    // 3. STATE MODAL DANH SÁCH THAM GIA
    const [isParticipantModalVisible, setIsParticipantModalVisible] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);

    // --- LOAD DỮ LIỆU ---
    const fetchEvents = async () => {
        setLoading(true);
        try {
            // 1. Luôn lấy danh sách ACTIVE (cho các tab All, Draft, Pending, Published)
            // Vì Backend dùng @Where nên getMyEvents chỉ trả về cái chưa xóa -> OK
            const activeData = await getMyEvents();
            
            // 2. Luôn lấy danh sách TRASH (cho tab Thùng rác)
            // Gọi API mới chuyên lấy rác
            const trashData = await getMyDeletedEvents();

            // 3. Set State
            // Sort theo ngày tạo mới nhất
            const sortFn = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
            
            setEvents(activeData.sort(sortFn));
            setTrashEvents(trashData.sort(sortFn));

        } catch (error) {
            console.error(error);
            message.error("Lỗi tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []); // Chỉ chạy 1 lần khi mount, sau này gọi lại khi thao tác xong

    // --- CÁC HÀNH ĐỘNG ---

    // 1. Chuyển hướng sang trang Tạo Mới (Thay vì mở Modal popup cũ)
    const handleCreateNew = () => {
        navigate('/create-event');
    };

    // 2. Chuyển hướng sang trang Sửa (Gửi kèm dữ liệu)
    const handleEdit = (record) => {
        navigate('/create-event', { state: { formData: record, isEdit: true } });
    };

    // 3. Xem trước
    const handlePreview = (record) => {
    const previewData = {
        ...record,
        // Backend trả về thẳng 'tenNguoiDang' và 'tenDanhMuc', không cần chọc sâu vào object
        tenNguoiDang: record.tenNguoiDang || record.nguoiDang?.hoTen || 'Bạn',
        
        // Ưu tiên lấy record.tenDanhMuc (từ API), nếu không có mới tìm trong object (dự phòng)
        tenDanhMuc: record.tenDanhMuc || record.category?.tenDanhMuc || 'Chưa phân loại',
        
        isPreview: true 
    };
    navigate('/events/preview', { state: { previewData, source: 'list' } });
};

    // --- SỬA HÀM XÓA MỀM ---
    const handleDeleteEvent = async (id) => {
        try {
            await softDeleteEvent(id);
            message.success('Đã chuyển vào thùng rác');
            fetchEvents();
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };

    // --- SỬA HÀM KHÔI PHỤC ---
    const handleRestore = async (id) => {
        try {
            await restoreEvent(id);
            message.success('Đã khôi phục sự kiện');
            fetchEvents();
        } catch (error) {
            message.error('Khôi phục thất bại');
        }
    };

    // --- SỬA HÀM XÓA CỨNG ---
    const handlePermanentDelete = async (id) => {
        try {
            await permanentDeleteEvent(id);
            message.success('Đã xóa vĩnh viễn');
            fetchEvents();
        } catch (error) {
            message.error('Lỗi khi xóa vĩnh viễn');
        }
    };

    // 6. Xem danh sách tham gia
    const showParticipantModal = async (eventId) => {
        setSelectedEventId(eventId);
        setIsParticipantModalVisible(true);
        setLoadingParticipants(true);
        try {
            const data = await getParticipants(eventId);
            setParticipants(data);
        } catch (err) {
            message.error("Không thể tải danh sách tham gia.");
        } finally {
            setLoadingParticipants(false);
        }
    };

    // 7. Xuất Excel
    const handleExportExcel = () => {
        if (!selectedEventId) return;
        const token = localStorage.getItem('token');
        // URL API xuất Excel của bạn
        const url = `http://192.168.2.8:8080/api/events/${selectedEventId}/participants/export`;
        
        message.loading("Đang xuất file...", 1);
        
        fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Lỗi network");
            return res.blob();
        })
        .then(blob => {
            const href = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.setAttribute('download', `danh-sach-tham-gia-${selectedEventId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success("Xuất file thành công!");
        })
        .catch(err => message.error("Xuất file thất bại!"));
    };

    // --- CẤU HÌNH CỘT BẢNG ---
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
        { 
            title: 'Tên sự kiện', dataIndex: 'tieuDe', 
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
            // Filter tìm kiếm local
            onFilter: (value, record) => record.tieuDe.toLowerCase().includes(value.toLowerCase())
        },
        { 
            title: 'Trạng thái', dataIndex: 'trangThai', width: 140,
            render: (status) => {
                let config = { color: 'default', text: 'Nháp', icon: <FileTextOutlined /> };
                if (status === 'PUBLISHED') config = { color: 'success', text: 'Công khai', icon: <CheckCircleOutlined /> };
                if (status === 'PENDING') config = { color: 'processing', text: 'Chờ duyệt', icon: <ClockCircleOutlined /> };
                if (status === 'CANCELLED') config = { color: 'error', text: 'Đã hủy', icon: <CloseCircleOutlined /> };
                return <Tag icon={config.icon} color={config.color}>{config.text}</Tag>;
            }
        },
        { 
            title: 'Bắt đầu', dataIndex: 'thoiGianBatDau', width: 160,
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        { 
            title: 'Người tham gia', key: 'participants', width: 150, align: 'center',
            render: (_, record) => (
                <Button 
                    size="medium" 
                    icon={<TeamOutlined />} 
                    onClick={() => showParticipantModal(record.id)}
                    disabled={activeTab === 'TRASH' || record.trangThai === 'DRAFT'}
                >
                    {/* Hiển thị số lượng nếu có, hoặc chỉ icon */}
                    Chi tiết
                </Button>
            )
        },
        {
            title: 'Hành động', key: 'action', width: 180, align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    {activeTab === 'TRASH' ? (
                        // ... (Phần nút bấm cho thùng rác giữ nguyên) ...
                        <>
                           <Tooltip title="Khôi phục">
                                <Button type="primary" ghost size="medium" icon={<UndoOutlined />} onClick={() => handleRestore(record.id)} />
                            </Tooltip>
                            <Popconfirm
                                title="Xóa vĩnh viễn?"
                                description="Hành động này không thể hoàn tác!"
                                onConfirm={() => handlePermanentDelete(record.id)}
                                okText="Xóa luôn"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button danger size="medium" icon={<DeleteFilled />} />
                            </Popconfirm>
                        </>
                    ) : (
                        <>
                            <Tooltip title="Xem trước"><Button size="medium" icon={<EyeOutlined />} onClick={() => handlePreview(record)} /></Tooltip>
                            
                            {/* Nút Sửa: Ẩn hoặc Disable nếu đã bị Hủy */}
                            <Tooltip title={record.trangThai === 'CANCELLED' ? "Sự kiện đã bị hủy (Không thể sửa)" : "Sửa"}>
                                <Button 
                                    size="medium" icon={<EditOutlined />} 
                                    onClick={() => handleEdit(record)} 
                                    // Disable nút sửa nếu đã bị Hủy
                                    disabled={record.trangThai === 'CANCELLED' || record.trangThai === 'PUBLISHED'} 
                                />
                            </Tooltip>
                            
                            {/* Nút Xóa Mềm: Luôn hiện để Poster có thể dọn dẹp vào thùng rác */}
                            <Tooltip title="Chuyển vào thùng rác">
                                <Popconfirm
                                    title="Chuyển vào thùng rác?"
                                    description="Bạn có thể khôi phục lại sau."
                                    onConfirm={() => handleDeleteEvent(record.id)}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button size="medium" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    // --- LỌC DỮ LIỆU ---
    const getDataSource = () => {
        if (activeTab === 'TRASH') return trashEvents;
        
        let filtered = events;
        if (activeTab !== 'ALL') {
            filtered = events.filter(e => e.trangThai === activeTab);
        }
        
        if (searchText) {
            filtered = filtered.filter(item => item.tieuDe.toLowerCase().includes(searchText.toLowerCase()));
        }
        return filtered;
    };

    // Hàm phụ trợ đếm số lượng
    const getCount = (status) => events.filter(e => e.trangThai === status).length;

    const tabItems = [
        { 
            key: 'ALL', 
            label: (
                <Space>
                    Tất cả
                    <Badge count={events.length} showZero={false} style={{ backgroundColor: '#f0f0f0', color: '#999' }} />
                </Space>
            )
        },
        { 
            key: 'DRAFT', 
            label: (
                <Space>
                    Bản nháp
                    <Badge count={getCount('DRAFT')} showZero color="#d9d9d9" style={{ color: '#525252ff' }} />
                </Space>
            )
        },
        { 
            key: 'PENDING', 
            label: (
                <Space>
                    Chờ duyệt
                    <Badge count={getCount('PENDING')} showZero color="#1890ff" />
                </Space>
            )
        },
        { 
            key: 'PUBLISHED', 
            label: (
                <Space>
                    Đã công khai
                    <Badge count={getCount('PUBLISHED')} showZero color="#52c41a" />
                </Space>
            ) 
        },
        { 
            key: 'CANCELLED', 
            label: (
                <Space>
                    Đã hủy
                    <Badge count={getCount('CANCELLED')} showZero color="#ff4d4f" />
                </Space>
            ) 
        },
        { 
            key: 'TRASH', 
            label: (
                <Space>
                    Thùng rác
                    <Badge count={trashEvents.length} showZero color="#ff4d4f" />
                </Space>
            ) 
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {/* {contextHolder} */}
            <MyNavbar />
            <Content style={{ maxWidth: 1200, margin: '24px auto', padding: '0 24px', width: '100%' }}>
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>Quản lý Sự kiện</Title>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreateNew}>
                        Tạo sự kiện mới
                    </Button>
                </div>

                <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {/* TOOLBAR */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Tabs 
                            activeKey={activeTab} 
                            onChange={setActiveTab} 
                            items={tabItems} 
                            type="card"
                            style={{ flex: 1 }}
                        />
                        <Search 
                            placeholder="Tìm kiếm..." 
                            allowClear 
                            onSearch={setSearchText} 
                            style={{ width: 250, marginLeft: 16 }} 
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    <Table 
                        columns={columns} 
                        dataSource={getDataSource()} 
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 8 }}
                    />
                </div>

                {/* MODAL DANH SÁCH THAM GIA */}
                <Modal
                    title="Danh sách tham gia"
                    open={isParticipantModalVisible}
                    onCancel={() => setIsParticipantModalVisible(false)}
                    width={900}
                    footer={[
                        <Button key="download" icon={<DownloadOutlined />} type="primary" onClick={handleExportExcel}>
                            Xuất Excel
                        </Button>,
                        <Button key="close" onClick={() => setIsParticipantModalVisible(false)}>Đóng</Button>
                    ]}
                >
                    <Table
                        dataSource={participants}
                        loading={loadingParticipants}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        columns={[
                            { title: 'MSSV', dataIndex: 'mssv' },
                            { title: 'Họ tên', dataIndex: 'hoTen' },
                            { title: 'Email', dataIndex: 'email' },
                            { title: 'Thời gian ĐK', dataIndex: 'createdAt', render: (d) => dayjs(d).format('DD/MM/YYYY HH:mm') }
                        ]}
                    />
                </Modal>
            </Content>
        </Layout>
    );
};

export default PosterEventsPage;