import { useState, useEffect } from 'react';
import { Card, Tabs, Input, Badge, Space, message, Modal } from 'antd';
import { 
    ClockCircleOutlined, CheckCircleOutlined, StopOutlined, DeleteOutlined, 
    SearchOutlined, AppstoreOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import EventManagementTab from '../../components/admin/EventManagementTab';
import { 
    getAllEventsForAdmin, approveEvent, rejectEvent, cancelEvent, // Các hàm xử lý List
    getDeletedEvents, //restoreEvent, permanentDeleteEvent // Các hàm xử lý Trash
} from '../../services/adminService';

const { Search } = Input;
const { TextArea } = Input;

const AdminEventsPage = () => {
    // State dữ liệu
    const [activeEvents, setActiveEvents] = useState([]); // Chứa: Pending, Published, Cancelled
    const [trashEvents, setTrashEvents] = useState([]);   // Chứa: Trash
    const [loading, setLoading] = useState(false);

    // State UI
    const [activeTab, setActiveTab] = useState('PENDING'); // Mặc định vào tab Chờ duyệt
    const [searchText, setSearchText] = useState('');

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [reason, setReason] = useState('');
    const [actionType, setActionType] = useState(null); // 'REJECT' hoặc 'CANCEL'
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // --- 1. FETCH DATA ---
    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Gọi song song 2 API để lấy đủ dữ liệu
            const [activeData, trashData] = await Promise.all([
                getAllEventsForAdmin(), // Lấy tất cả sự kiện chưa xóa (trừ Draft)
                getDeletedEvents()      // Lấy thùng rác (Native Query)
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

    // --- 2. CÁC HÀNH ĐỘNG ---
    const handleApprove = async (id) => {
        try { await approveEvent(id); message.success("Đã duyệt!"); fetchEvents(); } 
        catch (e) { message.error("Lỗi duyệt bài"); }
    };

    // const handleReject = async (id) => {
    //     try { await rejectEvent(id, "Admin từ chối"); message.success("Đã từ chối!"); fetchEvents(); } 
    //     catch (e) { message.error("Lỗi từ chối"); }
    // };

    // const handleCancelEvent = async (id) => {
    //     try { await cancelEvent(id, "Vi phạm"); message.success("Đã hủy!"); fetchEvents(); } 
    //     catch (e) { message.error("Lỗi hủy bài"); }
    // };

    // === 2. HÀM MỞ MODAL (Được gọi từ bảng con) ===
    const openActionModal = (id, type) => {
        setSelectedEventId(id);
        setActionType(type);
        setReason(''); // Reset lý do
        setIsModalVisible(true);
    };

    // === 3. HÀM XỬ LÝ KHI BẤM OK TRONG MODAL ===
    const handleModalOk = async () => {
        if (!reason.trim()) {
            message.warning("Vui lòng nhập lý do!");
            return;
        }

        setModalLoading(true);
        try {
            if (actionType === 'REJECT') {
                await rejectEvent(selectedEventId, reason);
                message.success("Đã từ chối và gửi thông báo cho Poster!");
            } else if (actionType === 'CANCEL') {
                await cancelEvent(selectedEventId, reason);
                message.success("Đã hủy và gửi thông báo cho Poster!");
            }
            setIsModalVisible(false); // Đóng modal
            fetchEvents(); // Load lại dữ liệu
        } catch (error) {
            message.error("Có lỗi xảy ra.");
        } finally {
            setModalLoading(false);
        }
    };

    // const handleRestore = async (id) => {
    //     try { await restoreEvent(id); message.success("Đã khôi phục!"); fetchEvents(); } 
    //     catch (e) { message.error("Lỗi khôi phục"); }
    // };

    // const handlePermanentDelete = async (id) => {
    //     try { await permanentDeleteEvent(id); message.success("Đã xóa vĩnh viễn!"); fetchEvents(); } 
    //     catch (e) { message.error("Lỗi xóa"); }
    // };

    // --- 3. LỌC DỮ LIỆU THEO TAB & TÌM KIẾM ---
    const getDataSource = () => {
        let source = [];

        // Chọn nguồn dữ liệu
        if (activeTab === 'TRASH') {
            source = trashEvents;
        } else if (activeTab === 'ALL') {
            // === THÊM TRƯỜNG HỢP NÀY ===
            // Tab Tất cả: Lấy toàn bộ danh sách Active (Trừ rác và nháp)
            source = activeEvents;
        } else {
            // Lọc theo trạng thái cho các tab Active
            source = activeEvents.filter(e => e.trangThai === activeTab);
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchText) {
            source = source.filter(item => 
                item.tieuDe.toLowerCase().includes(searchText.toLowerCase()) ||
                (item.tenNguoiDang && item.tenNguoiDang.toLowerCase().includes(searchText.toLowerCase()))
            );
        }

        return source;
    };

    // Hàm đếm số lượng cho Badge
    const countStatus = (status) => activeEvents.filter(e => e.trangThai === status).length;

    // Cấu hình các Tab
    const items = [
        {
            key: 'ALL',
            label: (
                <Space>
                    Tất cả
                    {/* Đếm tổng số sự kiện Active */}
                    <Badge count={activeEvents.length} showZero color="#1890ff" />
                </Space>
            ),
            icon: <AppstoreOutlined />,
        },
        {
            key: 'PENDING',
            label: (
                <Space>
                    Chờ duyệt
                    <Badge count={countStatus('PENDING')} showZero color="#faad14" />
                </Space>
            ),
            icon: <ClockCircleOutlined />,
        },
        {
            key: 'PUBLISHED',
            label: (
                <Space>
                    Đã công khai
                    <Badge count={countStatus('PUBLISHED')} showZero color="#52c41a" />
                </Space>
            ),
            icon: <CheckCircleOutlined />,
        },
        {
            key: 'CANCELLED',
            label: (
                <Space>
                    Đã hủy
                    <Badge count={countStatus('CANCELLED')} showZero color="#ff4d4f" />
                </Space>
            ),
            icon: <StopOutlined />,
        },
        // {
        //     key: 'TRASH',
        //     label: (
        //         <Space>
        //             Thùng rác
        //             <Badge count={trashEvents.length} showZero color="#8c8c8c" />
        //         </Space>
        //     ),
        //     icon: <DeleteOutlined />,
        // },
    ];

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
            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab} 
                items={items} 
                type="card" 
                style={{ marginBottom: 16 }}
            />

            <EventManagementTab 
                events={getDataSource()} 
                loading={loading} 
                viewMode={activeTab === 'TRASH' ? 'trash' : 'list'} // Truyền mode để component con biết render nút nào
                
                // Truyền các hàm xử lý
                onApprove={handleApprove} 
                onReject={(id) => openActionModal(id, 'REJECT')}
                onCancelEvent={(id) => openActionModal(id, 'CANCEL')}
                // onRestore={handleRestore}
                // onDelete={handlePermanentDelete} // Ở tab Trash, nút xóa là xóa vĩnh viễn
            />

            {/* === 4. THÊM MODAL NHẬP LÝ DO VÀO ĐÂY === */}
            <Modal
                title={actionType === 'REJECT' ? "Từ chối duyệt sự kiện" : "Hủy sự kiện"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={modalLoading}
                okText="Xác nhận"
                cancelText="Quay lại"
                okButtonProps={{ danger: true }} // Nút màu đỏ cho nguy hiểm
            >
                <div style={{ marginBottom: 12 }}>
                    <Space>
                        <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
                        <span>
                            {actionType === 'REJECT' 
                                ? "Sự kiện sẽ bị chuyển về trạng thái NHÁP." 
                                : "Sự kiện sẽ bị GỠ KHỎI trang chủ."}
                        </span>
                    </Space>
                </div>
                <p>Vui lòng nhập lý do (sẽ gửi thông báo cho Poster):</p>
                <TextArea 
                    rows={4} 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    placeholder="Ví dụ: Nội dung chưa phù hợp, sai quy định..." 
                />
            </Modal>
        </Card>
    );
};

export default AdminEventsPage;