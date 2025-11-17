import { Table, Button, Space, Popconfirm, Typography, Row, Col } from 'antd';
import { DeleteFilled, UndoOutlined } from '@ant-design/icons';
// Xóa: useEffect, useState, message, và tất cả import từ adminService

const { Title } = Typography;

/**
 * Đây là component "con" (dumb component).
 * Nó nhận 'deletedUsers', 'deletedEvents', 'loading' và các hàm xử lý từ component cha (AdminDashboardPage).
 */
const RecycleBinTab = ({ 
    deletedUsers, 
    deletedEvents, 
    loading, 
    onRestoreUser, 
    onPermanentDeleteUser,
    onRestoreEvent,
    onPermanentDeleteEvent 
}) => {

    // Xóa toàn bộ: useState, useEffect, loadData, và tất cả các hàm handle...
    // Vì component cha (AdminDashboardPage) sẽ làm hết việc này.

    // --- Columns ---
    const userTrashColumns = [
        { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Hành động', key: 'action', render: (_, record) => (
                <Space>
                    {/* Sửa lại: Gọi hàm onRestoreUser từ props (do cha truyền xuống) */}
                    <Button icon={<UndoOutlined />} onClick={() => onRestoreUser(record.id)}>Khôi phục</Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Không thể hoàn tác. Bạn có chắc?"
                        // Sửa lại: Gọi hàm onPermanentDeleteUser từ props
                        onConfirm={() => onPermanentDeleteUser(record.id)}
                    >
                        <Button danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const eventTrashColumns = [
        { title: 'Tiêu đề', dataIndex: 'tieuDe', key: 'tieuDe' },
        {
            title: 'Hành động', key: 'action', render: (_, record) => (
                <Space>
                    {/* Sửa lại: Gọi hàm onRestoreEvent từ props */}
                    <Button icon={<UndoOutlined />} onClick={() => onRestoreEvent(record.id)}>Khôi phục</Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Không thể hoàn tác. Bạn có chắc?"
                        // Sửa lại: Gọi hàm onPermanentDeleteEvent từ props
                        onConfirm={() => onPermanentDeleteEvent(record.id)}
                    >
                        <Button danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Row gutter={[24, 24]}>
            <Col span={24}>
                <Title level={4}>Thùng rác Người dùng</Title>
                <Table 
                    dataSource={deletedUsers} // Dùng props
                    columns={userTrashColumns} 
                    rowKey="id" 
                    loading={loading} // Dùng props
                />
            </Col>
            <Col span={24}>
                <Title level={4}>Thùng rác Sự kiện</Title>
                <Table 
                    dataSource={deletedEvents} // Dùng props
                    columns={eventTrashColumns} 
                    rowKey="id" 
                    loading={loading} // Dùng props
                />
            </Col>
        </Row>
    );
};
export default RecycleBinTab;