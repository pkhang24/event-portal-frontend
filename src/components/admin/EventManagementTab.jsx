import { Table, Tag, Button, Space, Tooltip, Popconfirm } from 'antd'; // Nhớ import Popconfirm
import { CheckOutlined, DeleteFilled, CloseOutlined, StopOutlined, UndoOutlined, EyeOutlined } from '@ant-design/icons'; // Thêm EyeOutlined

const EventManagementTab = ({ 
    events, 
    loading, 
    viewMode = 'list', 
    onApprove,
    onReject,
    onCancelEvent,
    onDelete, 
    onRestore,
    onPreview // <--- 1. NHẬN THÊM HÀM NÀY
}) => {

    const listColumns = [
        { title: 'Tiêu đề', dataIndex: 'tieuDe', key: 'tieuDe', width: '30%' },
        { title: 'Người tạo', dataIndex: 'tenNguoiDang', key: 'tenNguoiDang' },
        {
            title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
            render: (status) => {
                if (status === 'PUBLISHED') return <Tag color="green">Đã duyệt</Tag>;
                if (status === 'PENDING') return <Tag color="orange">Chờ duyệt</Tag>;
                if (status === 'DRAFT') return <Tag color="default">Bản nháp</Tag>;
                if (status === 'CANCELLED') return <Tag color="red">Đã hủy</Tag>;
                return <Tag>{status}</Tag>;
            }
        },
        {
            title: 'Hành động', 
            key: 'action',
            width: 250, // Tăng chiều rộng chút để đủ chỗ
            align: 'center',
            render: (_, record) => (
                <Space>
                    {/* --- 2. THÊM NÚT XEM TRƯỚC --- */}
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => onPreview(record)} 
                        >
                            Xem
                        </Button>
                    </Tooltip>

                    {/* NÚT DUYỆT */}
                    {record.trangThai === 'PENDING' && (
                        <Tooltip title="Duyệt đăng">
                            <Button type="primary" icon={<CheckOutlined />} onClick={() => onApprove(record.id)}>
                                Duyệt
                            </Button>
                        </Tooltip>
                    )}

                    {/* NÚT TỪ CHỐI */}
                    {record.trangThai === 'PENDING' && (
                        <Button 
                            danger 
                            icon={<CloseOutlined />} 
                            onClick={() => onReject(record.id)}
                        >
                            Từ chối
                        </Button>
                    )}

                    {/* NÚT HỦY */}
                    {record.trangThai === 'PUBLISHED' && (
                        <Button 
                            type="primary" 
                            danger 
                            size="small" 
                            icon={<StopOutlined />} 
                            onClick={() => onCancelEvent(record.id)}
                        >
                            Hủy
                        </Button>
                    )}
                </Space>
            )
        },
    ];

    // Cột cho Thùng rác (Giữ nguyên, không cần nút xem)
    const trashColumns = [
        { title: 'Tiêu đề', dataIndex: 'tieuDe', key: 'tieuDe', width: '30%' },
        { title: 'Người tạo', dataIndex: 'tenNguoiDang', key: 'tenNguoiDang' },
        {
            title: 'Hành động', 
            key: 'action',
            width: 180, 
            fixed: 'right', 
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" ghost size="small" icon={<UndoOutlined />} onClick={() => onRestore(record.id)}>
                        Khôi phục
                    </Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Không thể hoàn tác!"
                        onConfirm={() => onDelete(record.id)}
                        okText="Xóa vĩnh viễn" cancelText="Hủy"
                    >
                        <Button size="small" danger icon={<DeleteFilled />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    return (
        <Table 
            dataSource={Array.isArray(events) ? events : []} 
            columns={viewMode === 'list' ? listColumns : trashColumns} 
            rowKey="id" 
            loading={loading} 
            pagination={{ pageSize: 8 }}
        />
    );
};

export default EventManagementTab;