import { Table, Button, Space, Popconfirm, Tabs, Image, Tag } from 'antd';
import { DeleteFilled, UndoOutlined } from '@ant-design/icons';

const RecycleBinTab = ({ 
    loading,
    deletedUsers, onRestoreUser, onPermanentDeleteUser,
    deletedEvents, onRestoreEvent, onPermanentDeleteEvent,
    deletedCategories, onRestoreCategory, onPermanentDeleteCategory,
    deletedBanners, onRestoreBanner, onPermanentDeleteBanner
}) => {

    // --- Cột cho USER ---
    const userTrashColumns = [
        { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Hành động', key: 'action', render: (_, record) => (
                <Space>
                    <Button icon={<UndoOutlined />} onClick={() => onRestoreUser(record.id)}>Khôi phục</Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Không thể hoàn tác. Bạn có chắc?"
                        onConfirm={() => onPermanentDeleteUser(record.id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- Cột cho EVENT ---
    const eventTrashColumns = [
        { title: 'Tiêu đề', dataIndex: 'tieuDe', key: 'tieuDe' },
        {
            title: 'Hành động', key: 'action', render: (_, record) => (
                <Space>
                    <Button icon={<UndoOutlined />} onClick={() => onRestoreEvent(record.id)}>Khôi phục</Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Không thể hoàn tác. Bạn có chắc?"
                        onConfirm={() => onPermanentDeleteEvent(record.id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- Cột cho CATEGORY ---
    const categoryTrashColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Tên Danh mục', dataIndex: 'tenDanhMuc', key: 'tenDanhMuc' },
        {
            title: 'Hành động', key: 'action', render: (_, record) => (
                <Space>
                    <Button icon={<UndoOutlined />} onClick={() => onRestoreCategory(record.id)}>Khôi phục</Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Không thể hoàn tác!"
                        onConfirm={() => onPermanentDeleteCategory(record.id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- Cột cho BANNER ---
    const bannerTrashColumns = [
        { 
            title: 'Ảnh', 
            dataIndex: 'imageUrl', 
            key: 'imageUrl', 
            render: (url) => <Image src={url} width={100} height={50} style={{objectFit: 'cover'}} /> 
        },
        { title: 'Link', dataIndex: 'linkUrl', key: 'linkUrl' },
        { 
            title: 'Trạng thái cũ', 
            dataIndex: 'active', 
            key: 'active',
            render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? 'Hoạt động' : 'Tắt'}</Tag>
        },
        {
            title: 'Hành động', key: 'action', render: (_, record) => (
                <Space>
                    <Button icon={<UndoOutlined />} onClick={() => onRestoreBanner(record.id)}>Khôi phục</Button>
                    <Popconfirm
                        title="Xóa VĨNH VIỄN?"
                        description="Không thể hoàn tác!"
                        onConfirm={() => onPermanentDeleteBanner(record.id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Tabs defaultActiveKey="trash_users" type="card" items={[
            {
                key: 'trash_users',
                label: `Người dùng (${deletedUsers?.length || 0})`,
                children: <Table dataSource={deletedUsers} columns={userTrashColumns} rowKey="id" loading={loading} />
            },
            {
                key: 'trash_events',
                label: `Sự kiện (${deletedEvents?.length || 0})`,
                children: <Table dataSource={deletedEvents} columns={eventTrashColumns} rowKey="id" loading={loading} />
            },
            {
                key: 'trash_categories',
                label: `Danh mục (${deletedCategories?.length || 0})`,
                children: <Table dataSource={deletedCategories} columns={categoryTrashColumns} rowKey="id" loading={loading} />
            },
            {
                key: 'trash_banners',
                label: `Banner (${deletedBanners?.length || 0})`,
                children: <Table dataSource={deletedBanners} columns={bannerTrashColumns} rowKey="id" loading={loading} />
            }
        ]} />
    );
};

export default RecycleBinTab;