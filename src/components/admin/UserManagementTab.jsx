import { Table, Select, message, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Option } = Select;

// Đây là component "ngốc" (dumb), chỉ nhận props
const UserManagementTab = ({ users, loading, onRoleChange, onEdit, onDelete, onView }) => {

    const userColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
        { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen', sorter: (a, b) => a.hoTen.localeCompare(b.hoTen) },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'MSSV', dataIndex: 'mssv', key: 'mssv' },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            filters: [ // Thêm bộ lọc
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
                    disabled={role === 'ADMIN'}
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
                <Space size="middle">
                    <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => onView(record)} // <<< GỌI HÀM CỦA CHA
                        style={{ color: 'blue', borderColor: 'blue' }}
                        ghost // Nút kiểu viền
                    >
                        Xem
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Chuyển vào thùng rác?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        disabled={record.role === 'ADMIN'}
                    >
                        <Button danger icon={<DeleteOutlined />} disabled={record.role === 'ADMIN'}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    return (
        <Table
            dataSource={users}
            columns={userColumns}
            rowKey="id"
            loading={loading}
        />
    );
};

export default UserManagementTab;