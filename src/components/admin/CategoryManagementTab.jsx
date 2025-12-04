import { Table, Button, Space, Popconfirm, Modal, Form, Input, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UndoOutlined, DeleteFilled } from '@ant-design/icons';
import { useState } from 'react';

const CategoryManagementTab = ({ categories, loading, viewMode = 'list', onSave, onDelete, onRestore }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const showModal = (category = null) => {
        setEditingCategory(category);
        form.setFieldsValue(category ? { tenDanhMuc: category.tenDanhMuc } : { tenDanhMuc: '' });
        setIsModalVisible(true);
    };

    const handleFinish = (values) => {
        onSave(editingCategory ? editingCategory.id : null, values);
        setIsModalVisible(false);
    };

    // Columns cho List
    const listColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Tên Danh mục', dataIndex: 'tenDanhMuc', key: 'tenDanhMuc' },
        { title: 'Số lượng Sự kiện', dataIndex: 'soLuongSuKien', key: 'soLuongSuKien', align: 'center',
            render: (count) => <Tag color="blue">{count}</Tag>
        },
        {
            title: 'Hành động', 
            key: 'action', 
            width: 180,       // Đặt chiều rộng cố định đủ cho các nút
            fixed: 'right',   // <<< QUAN TRỌNG: Gim cột sang phải
            align: 'center',
            render: (_, record) => (
                <Space size="large">
                    <Button size="medium" icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa danh mục?" onConfirm={() => onDelete(record.id)}>
                        <Button size="medium" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Columns cho Trash
    const trashColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Tên Danh mục', dataIndex: 'tenDanhMuc', key: 'tenDanhMuc' },
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
                    Thêm Danh mục
                </Button>
            )}
            
            <Table 
                dataSource={Array.isArray(categories) ? categories : []} 
                columns={viewMode === 'list' ? listColumns : trashColumns} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 8 }}
            />
            
            <Modal title={editingCategory ? "Sửa Danh mục" : "Thêm Danh mục"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="tenDanhMuc" label="Tên Danh mục" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CategoryManagementTab;