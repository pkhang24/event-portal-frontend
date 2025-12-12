import { Table, Button, Space, Popconfirm, Modal, Form, Switch, Image, Upload, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UndoOutlined, DeleteFilled } from '@ant-design/icons'; // Thêm icon cho Trash
import { useState } from 'react';

const BannerManagementTab = ({ banners, loading, viewMode = 'list', onSave, onDelete, onRestore }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [fileList, setFileList] = useState([]); 

    const BE_URL = "http://localhost:8080/uploads"; 

    // ... (Giữ nguyên các hàm showModal, handleCancel, renderImage, handleFinish, handleUploadChange của bạn) ...
    // Code của bạn ở phần này đã chuẩn rồi, không cần sửa lại logic FormData nữa.
    
    // Hàm render ảnh (Copy lại từ code bạn để dùng chung)
    const renderImage = (imgName) => {
        if (!imgName) return "https://placehold.co/1200x400?text=No+Image";
        if (imgName.startsWith('http')) return imgName;
        return `${BE_URL}/${imgName}`;
    };

    const showModal = (banner = null) => {
        setEditingBanner(banner);
        if (banner) {
            form.setFieldsValue({ active: banner.active });
            setFileList([{
                uid: '-1',
                name: 'banner.png',
                status: 'done',
                url: renderImage(banner.imageUrl),
            }]);
        } else {
            form.setFieldsValue({ active: true });
            setFileList([]);
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setFileList([]);
        form.resetFields();
    };

    const handleFinish = (values) => {
        const formData = new FormData();
        formData.append('active', values.active);
        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('image', fileList[0].originFileObj);
        } else if (!editingBanner) {
            message.error("Vui lòng chọn hình ảnh!");
            return;
        }
        onSave(editingBanner ? editingBanner.id : null, formData);
        setIsModalVisible(false);
        setFileList([]);
        form.resetFields();
    };

    const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList.slice(-1));

    // --- 1. CỘT CHO DANH SÁCH (LIST) ---
    const listColumns = [
        { 
            title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', 
            render: (url) => <Image src={renderImage(url)} width={120} height={60} style={{objectFit: 'cover'}} /> 
        },
        { title: 'Trạng thái', dataIndex: 'active', key: 'active', render: (active) => <Switch checked={active} disabled /> },
        {
            title: 'Hành động', key: 'action', width: 150, align: 'center',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Popconfirm title="Xoá ảnh này?" description="Ảnh sẽ được chuyển vào thùng rác!" onConfirm={() => onDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- 2. CỘT CHO THÙNG RÁC (TRASH) - BẠN ĐANG THIẾU PHẦN NÀY ---
    const trashColumns = [
        { 
            title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', 
            render: (url) => <Image src={renderImage(url)} width={120} height={60} style={{objectFit: 'cover', opacity: 0.5}} /> 
        },
        {
            title: 'Hành động', key: 'action', width: 180, align: 'center',
            render: (_, record) => (
                <Space>
                    <Button type="primary" ghost icon={<UndoOutlined />} onClick={() => onRestore(record.id)}>Khôi phục</Button>
                    <Popconfirm title="Xóa vĩnh viễn?" description="Không thể hoàn tác!" onConfirm={() => onDelete(record.id)}>
                        <Button danger icon={<DeleteFilled />} />
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
            
            {/* --- 3. SỬA LẠI CHỖ NÀY ĐỂ CHUYỂN CỘT KHI ĐỔI TAB --- */}
            <Table 
                dataSource={banners} 
                columns={viewMode === 'list' ? listColumns : trashColumns} 
                rowKey="id" 
                loading={loading} 
                pagination={{ pageSize: 5 }} 
            />
            
            <Modal title={editingBanner ? "Sửa Banner" : "Thêm Banner"} open={isModalVisible} onCancel={handleCancel} onOk={() => form.submit()} destroyOnClose>
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item label="Hình ảnh" required={!editingBanner}>
                        <Upload listType="picture-card" maxCount={1} fileList={fileList} onChange={handleUploadChange} beforeUpload={() => false} accept="image/*">
                            {fileList.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                        </Upload>
                    </Form.Item>
                    <Form.Item name="active" label="Hiển thị" valuePropName="checked"><Switch /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};
export default BannerManagementTab;