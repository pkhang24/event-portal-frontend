import { Table, Select, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, UndoOutlined, DeleteFilled } from '@ant-design/icons';

const { Option } = Select;

/**
 * Component bảng quản lý User đa năng.
 * Hỗ trợ 2 chế độ hiển thị dựa trên prop 'viewMode':
 * 1. 'list': Hiển thị danh sách chính (Có thể sửa role, edit, soft delete)
 * 2. 'trash': Hiển thị thùng rác (Chỉ xem role, restore, hard delete)
 */
const UserManagementTab = ({ 
    users, 
    loading, 
    viewMode = 'list', // Mặc định là list
    onRoleChange, 
    onEdit, 
    onDelete, // Hàm này ở cha sẽ tự xử lý soft hay hard delete dựa vào view
    onView,
    onRestore 
}) => {

    // --- CẤU HÌNH CỘT CHO CHẾ ĐỘ DANH SÁCH (LIST) ---
    const listColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 70, sorter: (a, b) => a.id - b.id },
        { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen', sorter: (a, b) => a.hoTen.localeCompare(b.hoTen) },
        // { title: 'Email', dataIndex: 'email', key: 'email' },
        // { title: 'MSSV', dataIndex: 'mssv', key: 'mssv' },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            filters: [
                { text: 'Student', value: 'STUDENT' },
                { text: 'Poster', value: 'POSTER' },
                { text: 'Admin', value: 'ADMIN' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role, record) => (
                <Select
                    defaultValue={role}
                    style={{ width: 120 }}
                    onChange={(newRole) => onRoleChange(record.id, newRole)}
                    disabled={role === 'ADMIN'} // Không sửa quyền của Admin khác
                >
                    <Option value="STUDENT">Student</Option>
                    <Option value="POSTER">Poster</Option>
                    <Option value="ADMIN">Admin</Option>
                </Select>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    <Button size="medium" icon={<EyeOutlined />} onClick={() => onView(record)} ghost type="primary">Xem</Button>
                    <Button size="medium" icon={<EditOutlined />} onClick={() => onEdit(record)}>Sửa</Button>
                    <Popconfirm
                        title="Chuyển vào thùng rác?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        disabled={record.role === 'ADMIN'}
                    >
                        <Button size="medium" danger icon={<DeleteOutlined />} disabled={record.role === 'ADMIN'}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- CẤU HÌNH CỘT CHO CHẾ ĐỘ THÙNG RÁC (TRASH) ---
    const trashColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
        { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
        // { title: 'Email', dataIndex: 'email', key: 'email' },
        // { title: 'MSSV', dataIndex: 'mssv', key: 'mssv' },
        { 
            title: 'Vai trò', 
            dataIndex: 'role', 
            key: 'role',
            // Trong thùng rác không cho sửa Role, chỉ hiện Tag
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'red' : role === 'POSTER' ? 'blue' : 'green'}>
                    {role}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    <Button 
                        size="medium" 
                        icon={<UndoOutlined />} 
                        onClick={() => onRestore(record.id)}
                        type="primary"
                        ghost
                    >
                        Khôi phục
                    </Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Hành động này không thể hoàn tác!"
                        onConfirm={() => onDelete(record.id)} // Gọi hàm delete (cha sẽ xử lý là hard delete)
                        okText="Xóa vĩnh viễn"
                        cancelText="Hủy"
                    >
                        <Button size="medium" danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- QUYẾT ĐỊNH DÙNG CỘT NÀO ---
    const columns = viewMode === 'list' ? listColumns : trashColumns;

    return (
        <Table
            dataSource={Array.isArray(users) ? users : []}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
        />
    );
};

export default UserManagementTab;