import { Table, Button, Space, Popconfirm, Modal, Form, Input, Switch, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UndoOutlined, DeleteFilled } from '@ant-design/icons';
import { useState } from 'react';

const BannerManagementTab = ({ banners, loading, viewMode = 'list', onSave, onDelete, onRestore }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const showModal = (banner = null) => {
        setEditingBanner(banner);
        // Set active mặc định là true nếu tạo mới
        form.setFieldsValue(banner ? banner : { imageUrl: '', active: true });
        setIsModalVisible(true);
    };

    const handleFinish = (values) => {
        onSave(editingBanner ? editingBanner.id : null, values);
        setIsModalVisible(false);
    };

    // Columns List
    const listColumns = [
        { title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', render: (url) => <Image src={url} width={120} /> },
        { title: 'Trạng thái', dataIndex: 'active', key: 'active', render: (active) => active ? "Hiện" : "Ẩn" },
        {
            title: 'Hành động', 
            key: 'action', 
            width: 180,       // Đặt chiều rộng cố định đủ cho các nút
            fixed: 'right',   // <<< QUAN TRỌNG: Gim cột sang phải
            align: 'center',
            render: (_, record) => (
                <Space size="large">
                    <Button size="medium" icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa?" onConfirm={() => onDelete(record.id)}>
                        <Button size="medium" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Columns Trash
    const trashColumns = [
        { title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', render: (url) => <Image src={url} width={120} /> },
        {
            title: 'Hành động', 
            key: 'action', 
            width: 180,       // Đặt chiều rộng cố định đủ cho các nút
            fixed: 'right',   // <<< QUAN TRỌNG: Gim cột sang phải
            align: 'center',
            render: (_, record) => (
                <Space size="large">
                    <Button size="medium" type="primary" ghost icon={<UndoOutlined />} onClick={() => onRestore(record.id)}>Khôi phục</Button>
                    <Popconfirm title="Xóa VĨNH VIỄN?" onConfirm={() => onDelete(record.id)}>
                        <Button size="medium" danger icon={<DeleteFilled />}>Xóa vĩnh viễn</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <>
            {viewMode === 'list' && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} style={{ marginBottom: 16 }}>
                    Thêm Banner
                </Button>
            )}
            <Table 
                dataSource={Array.isArray(banners) ? banners : []} 
                columns={viewMode === 'list' ? listColumns : trashColumns} 
                rowKey="id" loading={loading} pagination={{ pageSize: 5 }}
            />
            <Modal title={editingBanner ? "Sửa Banner" : "Thêm Banner"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="imageUrl" label="URL Ảnh" rules={[{ required: true, type: 'url' }]}><Input /></Form.Item>
                    <Form.Item name="active" label="Trạng thái" valuePropName="checked"><Switch /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};
export default BannerManagementTab;