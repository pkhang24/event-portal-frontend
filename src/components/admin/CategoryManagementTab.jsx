import { Table, Button, Space, Popconfirm, Modal, Form, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

const CategoryManagementTab = ({ categories, loading, onSave, onDelete }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const showModal = (category = null) => {
        setEditingCategory(category);
        form.setFieldsValue(category ? { tenDanhMuc: category.tenDanhMuc } : { tenDanhMuc: '' });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingCategory(null);
    };

    const handleFinish = (values) => {
        // Gọi hàm onSave của cha (truyền cả ID (nếu sửa) và data)
        onSave(editingCategory ? editingCategory.id : null, values);
        handleCancel();
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Tên Danh mục', dataIndex: 'tenDanhMuc', key: 'tenDanhMuc' },
        {
            title: 'Hành động', key: 'action', render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Xóa danh mục?"
                        description="Bạn có chắc muốn xóa? (Cần đảm bảo không có sự kiện nào dùng)"
                        onConfirm={() => onDelete(record.id)}
                    >
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
                Thêm Danh mục mới
            </Button>
            <Table
                dataSource={categories}
                columns={columns}
                rowKey="id"
                loading={loading}
            />
            
            {/* Modal Thêm/Sửa */}
            <Modal
                title={editingCategory ? "Sửa Danh mục" : "Thêm Danh mục mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()} // Tự động trigger onFinish
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item
                        name="tenDanhMuc"
                        label="Tên Danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CategoryManagementTab;