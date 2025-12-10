import { Table, Button, Space, Popconfirm, Modal, Form, Switch, Image, Upload, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UndoOutlined, DeleteFilled, UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const BannerManagementTab = ({ banners, loading, viewMode = 'list', onSave, onDelete, onRestore }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [fileList, setFileList] = useState([]); // State quản lý danh sách ảnh trong Modal

    // Hàm chuẩn hóa dữ liệu file cho Antd Upload
    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const showModal = (banner = null) => {
        setEditingBanner(banner);
        
        if (banner) {
            // Nếu là Sửa: Set giá trị form và hiển thị ảnh cũ
            form.setFieldsValue({
                active: banner.active,
                // Không set field 'image' trực tiếp vì Upload quản lý qua fileList
            });
            // Tạo mock file để hiển thị ảnh hiện tại
            setFileList([{
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: banner.imageUrl,
            }]);
        } else {
            // Nếu là Thêm mới
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
        // Xử lý file ảnh trước khi gửi ra ngoài
        let imageFile = null;
        
        // Kiểm tra xem có file mới được upload không
        if (values.upload && values.upload.length > 0) {
            const fileObj = values.upload[0];
            if (fileObj.originFileObj) {
                imageFile = fileObj.originFileObj; // Lấy file thực tế
            }
        }

        // Kiểm tra validation: Nếu thêm mới mà chưa chọn ảnh
        if (!editingBanner && !imageFile) {
            message.error("Vui lòng chọn hình ảnh!");
            return;
        }

        // Gửi dữ liệu ra component cha
        // Nếu imageFile là null (tức là không đổi ảnh khi sửa), bên cha sẽ tự xử lý giữ nguyên ảnh cũ
        onSave(editingBanner ? editingBanner.id : null, {
            active: values.active,
            imageFile: imageFile 
        });

        setIsModalVisible(false);
        setFileList([]);
        form.resetFields();
    };

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    // Columns List
    const listColumns = [
        { title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', render: (url) => <Image src={url} width={120} height={60} style={{objectFit: 'cover'}} /> },
        { title: 'Trạng thái', dataIndex: 'active', key: 'active', render: (active) => <Switch checked={active} disabled /> },
        {
            title: 'Hành động', 
            key: 'action', 
            width: 180,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button size="middle" icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa?" onConfirm={() => onDelete(record.id)}>
                        <Button size="middle" danger icon={<DeleteOutlined />}>Xóa</Button>
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
            width: 180,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button size="middle" type="primary" ghost icon={<UndoOutlined />} onClick={() => onRestore(record.id)}>Khôi phục</Button>
                    <Popconfirm title="Xóa VĨNH VIỄN?" onConfirm={() => onDelete(record.id)}>
                        <Button size="middle" danger icon={<DeleteFilled />}>Xóa</Button>
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
            
            <Modal 
                title={editingBanner ? "Sửa Banner" : "Thêm Banner"} 
                open={isModalVisible} 
                onCancel={handleCancel} 
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item 
                        name="upload" 
                        label="Hình ảnh" 
                        valuePropName="fileList" 
                        getValueFromEvent={normFile}
                    >
                        <Upload 
                            listType="picture-card" 
                            maxCount={1} 
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={() => false} // Quan trọng: Chặn upload tự động để xử lý thủ công
                            accept="image/*"
                        >
                            {fileList.length < 1 && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item name="active" label="Trạng thái hiển thị" valuePropName="checked">
                        <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
export default BannerManagementTab;