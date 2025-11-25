import { Table, Select, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, UndoOutlined, DeleteFilled, LockOutlined, UnlockOutlined } from '@ant-design/icons';

const { Option } = Select;

const UserManagementTab = ({ 
    users, 
    loading, 
    viewMode = 'list', 
    onRoleChange, 
    onEdit, 
    onDelete, 
    onView,
    onRestore,
    onLock // Thêm prop cho hành động khóa (cần truyền từ cha xuống sau này)
}) => {

    const listColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60, sorter: (a, b) => a.id - b.id },
        { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen', sorter: (a, b) => a.hoTen.localeCompare(b.hoTen) },
        // { title: 'Email', dataIndex: 'email', key: 'email' },
        // { title: 'MSSV', dataIndex: 'mssv', key: 'mssv' },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 130,
            filters: [
                { text: 'Student', value: 'STUDENT' },
                { text: 'Poster', value: 'POSTER' },
                { text: 'Admin', value: 'ADMIN' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role, record) => (
                <Select
                    defaultValue={role}
                    style={{ width: '100%' }}
                    onChange={(newRole) => onRoleChange(record.id, newRole)}
                    disabled={role === 'ADMIN'}
                    size="medium" // Dropdown nhỏ gọn
                >
                    <Option value="STUDENT">Student</Option>
                    <Option value="POSTER">Poster</Option>
                    {/* <Option value="ADMIN">Admin</Option> */}
                </Select>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200, // Cố định chiều rộng cột hành động
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            size="medium" 
                            icon={<EyeOutlined />} 
                            onClick={() => onView(record)} 
                            style={{ color: '#1677ff', borderColor: '#1677ff' }} 
                        />
                    </Tooltip>
                    
                    <Tooltip title="Sửa thông tin">
                        <Button 
                            size="medium" 
                            icon={<EditOutlined />} 
                            onClick={() => onEdit(record)} 
                        />
                    </Tooltip>

                    {/* Nút Khóa Tài khoản (Mới) */}
                    <Tooltip title={record.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}>
                        <Popconfirm
                            title={record.isLocked ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?"}
                            description={record.isLocked ? "Người dùng sẽ có thể đăng nhập lại." : "Người dùng sẽ không thể đăng nhập."}
                            onConfirm={() => onLock && onLock(record.id)}
                            okText={record.isLocked ? "Mở khóa" : "Khóa"}
                            cancelText="Hủy"
                            disabled={record.role === 'ADMIN'}
                        >
                            <Button 
                                size="medium" 
                                // Nếu đang khóa -> Icon Mở khóa (Xanh), Ngược lại -> Icon Khóa (Cam)
                                icon={record.isLocked ? <LockOutlined /> : <UnlockOutlined />} 
                                style={{ 
                                    color: record.isLocked ? '#faad14' : '#52c41a', 
                                    borderColor: record.isLocked ? '#faad14' : '#52c41a' 
                                }}
                                disabled={record.role === 'ADMIN'}
                            />
                        </Popconfirm>
                    </Tooltip>

                    <Tooltip title="Xóa (Thùng rác)">
                        <Popconfirm
                            title="Chuyển vào thùng rác?"
                            onConfirm={() => onDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            disabled={record.role === 'ADMIN'}
                        >
                            <Button 
                                size="medium" 
                                danger 
                                icon={<DeleteOutlined />} 
                                disabled={record.role === 'ADMIN'} 
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    const trashColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
        // { title: 'Email', dataIndex: 'email', key: 'email' },
        { 
            title: 'Vai trò', 
            dataIndex: 'role', 
            key: 'role',
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
                <Space size="small">
                    <Button 
                        size="medium" 
                        type="primary" 
                        ghost 
                        icon={<UndoOutlined />} 
                        onClick={() => onRestore(record.id)}
                    >
                        Khôi phục
                    </Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Hành động này không thể hoàn tác!"
                        onConfirm={() => onDelete(record.id)}
                        okText="Xóa vĩnh viễn"
                        cancelText="Hủy"
                    >
                        <Button size="medium" danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const columns = viewMode === 'list' ? listColumns : trashColumns;

    return (
        <Table
            dataSource={Array.isArray(users) ? users : []}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 6 }}
            size="large" // Bảng kích thước trung bình, gọn hơn default
        />
    );
};

export default UserManagementTab;