import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { CheckOutlined, DeleteOutlined, UndoOutlined, DeleteFilled, CloseOutlined, StopOutlined } from '@ant-design/icons';

const EventManagementTab = ({ 
    events, 
    loading, 
    viewMode = 'list', // 'list' hoặc 'trash'
    onApprove,
    onReject,
    onCancelEvent,
    onDelete, // Xử lý xóa mềm hoặc xóa cứng tùy viewMode
    onRestore // Xử lý khôi phục
}) => {

    // Cột cho Danh sách chính
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
            width: 200, 
            align: 'center',
            render: (_, record) => (
                <Space>
                    {/* NÚT DUYỆT (Giữ nguyên) */}
                    {record.trangThai === 'PENDING' && (
                        <Tooltip title="Duyệt đăng">
                            <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => onApprove(record.id)}>
                                Duyệt
                            </Button>
                        </Tooltip>
                    )}

                    {/* NÚT TỪ CHỐI (Bỏ Popconfirm -> Gọi trực tiếp để mở Modal) */}
                    {record.trangThai === 'PENDING' && (
                        <Button 
                            size="small" 
                            danger 
                            icon={<CloseOutlined />} 
                            onClick={() => onReject(record.id)} // <--- Sửa dòng này
                        >
                            Từ chối
                        </Button>
                    )}

                    {/* NÚT HỦY (Bỏ Popconfirm -> Gọi trực tiếp để mở Modal) */}
                    {record.trangThai === 'PUBLISHED' && (
                        <Button 
                            type="primary" 
                            danger 
                            size="small" 
                            icon={<StopOutlined />} 
                            onClick={() => onCancelEvent(record.id)} // <--- Sửa dòng này
                        >
                            Hủy
                        </Button>
                    )}
                </Space>
            )
        },
    ];

    // Cột cho Thùng rác
    const trashColumns = [
        { title: 'Tiêu đề', dataIndex: 'tieuDe', key: 'tieuDe', width: '30%' },
        { title: 'Người tạo', dataIndex: 'tenNguoiDang', key: 'tenNguoiDang' },
        {
            title: 'Hành động', 
            key: 'action',
            width: 100,       // Đặt chiều rộng cố định đủ cho các nút
            fixed: 'right',   // <<< QUAN TRỌNG: Gim cột sang phải
            align: 'center',
            render: (_, record) => (
                <Space size="large">
                    <Button type="primary" ghost size="medium" icon={<UndoOutlined />} onClick={() => onRestore(record.id)}>
                        Khôi phục
                    </Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Không thể hoàn tác!"
                        onConfirm={() => onDelete(record.id)}
                        okText="Xóa vĩnh viễn" cancelText="Hủy"
                    >
                        <Button size="medium" danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
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
            // scroll={{ x: 1000 }}
        />
    );
};

export default EventManagementTab;