import { Table, Tag, Button, Space, Popconfirm } from 'antd';
import { CheckOutlined, DeleteOutlined, UndoOutlined, DeleteFilled } from '@ant-design/icons';

const EventManagementTab = ({ 
    events, 
    loading, 
    viewMode = 'list', // 'list' hoặc 'trash'
    onApprove, 
    onDelete, // Xử lý xóa mềm hoặc xóa cứng tùy viewMode
    onRestore // Xử lý khôi phục
}) => {

    // Cột cho Danh sách chính
    const listColumns = [
        { title: 'Tiêu đề', dataIndex: 'tieuDe', key: 'tieuDe', width: '30%' },
        { title: 'Người tạo', dataIndex: 'tenNguoiDang', key: 'tenNguoiDang' },
        {
            title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
            render: (status) => (
                <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
                    {status === 'PUBLISHED' ? 'Đã duyệt' : 'Chờ duyệt'}
                </Tag>
            )
        },
        {
            title: 'Hành động', 
            key: 'action',
            width: 180,       // Đặt chiều rộng cố định đủ cho các nút
            fixed: 'right',   // <<< QUAN TRỌNG: Gim cột sang phải
            align: 'center',
            render: (_, record) => (
                <Space size="large">
                    {record.trangThai === 'DRAFT' && (
                        <Button type="primary" size="medium" icon={<CheckOutlined />} onClick={() => onApprove(record.id)}>
                            Duyệt
                        </Button>
                    )}
                    <Popconfirm
                        title="Chuyển vào thùng rác?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button size="medium" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
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
        />
    );
};

export default EventManagementTab;