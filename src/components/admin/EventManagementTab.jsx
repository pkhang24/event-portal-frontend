import { Table, Tag, Button, Space, Popconfirm } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
// Xóa hết các import: useEffect, useState, adminService, eventService

/**
 * Đây là component "con" (dumb component).
 * Nó nhận 'events', 'loading' và các hàm xử lý từ component cha (AdminDashboardPage).
 */
const EventManagementTab = ({ events, loading, onApprove, onDelete }) => {

    // Xóa toàn bộ: useState, useEffect, fetchEvents, handleApprove, handleDelete
    // Vì component cha (AdminDashboardPage) sẽ làm hết việc này.

    // Cấu hình cột (Giữ nguyên, nhưng sửa lại hàm onClick)
    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'tieuDe',
            key: 'tieuDe',
            width: '30%',
        },
        {
            title: 'Người tạo',
            dataIndex: 'tenNguoiDang',
            key: 'tenNguoiDang',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            render: (status) => (
                <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
                    {status === 'PUBLISHED' ? 'Đã duyệt' : 'Chờ duyệt (Draft)'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {/* Chỉ hiển thị nút Duyệt nếu đang là DRAFT */}
                    {record.trangThai === 'DRAFT' && (
                        <Button 
                            type="primary" 
                            icon={<CheckOutlined />} 
                            // Sửa lại: Gọi hàm onApprove từ props (do cha truyền xuống)
                            onClick={() => onApprove(record.id)}
                        >
                            Duyệt
                        </Button>
                    )}
                    <Popconfirm
                        title="Chuyển vào thùng rác?"
                        description="Bạn có chắc muốn xóa (mềm) sự kiện này?"
                        // Sửa lại: Gọi hàm onDelete từ props (do cha truyền xuống)
                        onConfirm={() => onDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    return (
        <Table 
            dataSource={events} // Dùng 'events' từ props
            columns={columns} 
            rowKey="id" 
            loading={loading} // Dùng 'loading' từ props
        />
    );
};

export default EventManagementTab;