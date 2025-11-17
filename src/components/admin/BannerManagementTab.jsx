import { Table, Button, Space, Popconfirm, Modal, Form, Input, message, Image, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

const BannerManagementTab = ({ banners, loading, onSave, onDelete }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const showModal = (banner = null) => {
        setEditingBanner(banner);
        form.setFieldsValue(banner ? banner : { imageUrl: '', linkUrl: '', isActive: true });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingBanner(null);
    };

    const handleFinish = (values) => {
        onSave(editingBanner ? editingBanner.id : null, values);
        handleCancel();
    };

    const columns = [
        { 
            title: 'Ảnh Banner', 
            dataIndex: 'imageUrl', 
            key: 'imageUrl',
            render: (url) => <Image src={url} width={150} />
        },
        { title: 'Đường dẫn (Link)', dataIndex: 'linkUrl', key: 'linkUrl' },
        { 
            title: 'Trạng thái', 
            dataIndex: 'isActive', 
            key: 'isActive',
            render: (isActive) => isActive ? "Đang hoạt động" : "Đã tắt"
        },
        {
            title: 'Hành động', key: 'action', render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa banner?" onConfirm={() => onDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <>
            <Button 
                icon={<PlusOutlined />} 
                type="primary" 
                onClick={() => showModal(null)} 
                style={{ marginBottom: 16 }}
            >
                Thêm Banner mới
            </Button>
            <Table
                dataSource={banners}
                columns={columns}
                rowKey="id"
                loading={loading}
            />
            
            <Modal
                title={editingBanner ? "Sửa Banner" : "Thêm Banner mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="imageUrl" label="Link Ảnh (URL)" rules={[{ required: true, type: 'url' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="linkUrl" label="Đường dẫn khi click (VD: /events/1)">
                        <Input />
                    </Form.Item>
                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Đã tắt" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default BannerManagementTab;