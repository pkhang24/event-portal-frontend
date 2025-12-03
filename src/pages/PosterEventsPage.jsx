import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Table, Button, Modal, Form, Input, DatePicker, InputNumber, message, Tag, Space ,Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, DownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import MyNavbar from '../components/MyNavbar';
import { getMyEvents, createEvent, updateEvent, getParticipants } from '../services/eventService';
import { softDeleteEvent } from '../services/eventService';
import CategorySelect from '../components/CategorySelect'; // <-- THÊM DÒNG NÀY
import dayjs from 'dayjs'; // Cần cài: npm install dayjs

const { Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const PosterEventsPage = () => {
    const [form] = Form.useForm(); // Để điều khiển Form
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null); // Lưu event đang sửa

    const [isParticipantModalVisible, setIsParticipantModalVisible] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await getMyEvents();
            setEvents(data);
        } catch (err) {
            messageApi.error("Không thể tải sự kiện của bạn.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const showModal = (event = null) => {
        setEditingEvent(event);
        if (event) {
            // Nếu là sửa -> Điền form
            form.setFieldsValue({
                ...event,
                thoiGian: [dayjs(event.thoiGianBatDau), dayjs(event.thoiGianKetThuc)],
            });
        } else {
            // Nếu là tạo mới -> Reset form
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingEvent(null);
    };

    const onFinish = async (values) => {
        const eventData = {
            ...values,
            thoiGianBatDau: values.thoiGian[0].toISOString(),
            thoiGianKetThuc: values.thoiGian[1].toISOString(),
        };

        try {
            if (editingEvent) {
                // Cập nhật
                await updateEvent(editingEvent.id, eventData);
                messageApi.success("Cập nhật sự kiện thành công!");
            } else {
                // Tạo mới
                await createEvent(eventData);
                messageApi.success("Tạo sự kiện thành công! (Đang chờ Admin duyệt)");
            }
            setIsModalVisible(false);
            fetchEvents(); // Tải lại danh sách
        } catch (err) {
            messageApi.error("Thao tác thất bại.");
        }
    };

    // --- HÀM XÓA (NẾU CHƯA CÓ) ---
    const handleDeleteEvent = async (id) => {
        try {
            await softDeleteEvent(id);
            message.success("Đã chuyển sự kiện vào thùng rác!");
            fetchEvents();
        } catch (err) { message.error("Xóa thất bại."); }
    };

    // --- HÀM MỚI CHO MODAL DANH SÁCH THAM GIA ---
    const showParticipantModal = async (eventId) => {
        setSelectedEventId(eventId);
        setIsParticipantModalVisible(true);
        setLoadingParticipants(true);
        try {
            const data = await getParticipants(eventId);
            setParticipants(data);
        } catch (err) {
            message.error("Không thể tải danh sách tham gia.");
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleCancelParticipantModal = () => {
        setIsParticipantModalVisible(false);
        setParticipants([]);
    };

    // --- HÀM MỚI ĐỂ XUẤT EXCEL ---
    const handleExportExcel = (eventId) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');
        // Tạo URL và kích hoạt tải xuống
        const url = `http://192.168.2.5:8080/api/events/${eventId}/participants/export`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.blob())
        .then(blob => {
            const href = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.setAttribute('download', 'danh-sach-tham-gia.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(err => message.error("Xuất file thất bại!"));
    };

    const columns = [
        { title: 'Tiêu đề', dataIndex: 'tieuDe', key: 'tieuDe' },
        { 
            title: 'Trạng thái', 
            dataIndex: 'trangThai', 
            key: 'trangThai',
            render: (status) => (
                <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>{status}</Tag>
            )
        },
        { title: 'Địa điểm', dataIndex: 'diaDiem', key: 'diaDiem' },
        { 
            title: 'Hành động', 
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<TeamOutlined />} onClick={() => showParticipantModal(record.id)}>
                        DS Tham gia
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Chuyển vào thùng rác?"
                        onConfirm={() => handleDeleteEvent(record.id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        },
    ];

    // Cột cho Modal danh sách tham gia
    const participantColumns = [
        { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
        { title: 'MSSV', dataIndex: 'mssv', key: 'mssv' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Trạng thái', dataIndex: 'trangThaiVe', key: 'trangThaiVe',
          render: (status) => <Tag color={status === 'ATTENDED' ? 'green' : 'blue'}>{status}</Tag>
        }
    ];

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            {contextHolder}
            <MyNavbar />
            <Content style={{ padding: '0 50px', marginTop: 30 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
                     Quay lại
                </Button>
                <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
                    <Title level={2} style={{ float: 'left' }}>Quản lý Sự kiện</Title>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        style={{ float: 'right', marginBottom: 20 }}
                        onClick={() => showModal(null)}
                    >
                        Tạo sự kiện mới
                    </Button>
                    <Table dataSource={events} columns={columns} rowKey="id" loading={loading} />
                </div>
            </Content>

            {/* Modal Tạo/Sửa sự kiện */}
            <Modal
                title={editingEvent ? "Sửa sự kiện" : "Tạo sự kiện mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null} // Tắt footer mặc định
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onFinish={onFinish} name="event_form">
                    <Form.Item name="tieuDe" label="Tiêu đề" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="moTaNgan" label="Mô tả ngắn" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="noiDung" label="Nội dung chi tiết" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="thoiGian" label="Thời gian" rules={[{ required: true }]}>
                        <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="diaDiem" label="Địa điểm" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="soLuongGioiHan" label="Số lượng giới hạn (Bỏ trống nếu không giới hạn)">
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="categoryId" label="Danh mục sự kiện" rules={[{ required: true }]}>
                        <CategorySelect />
                    </Form.Item>
                    <Form.Item name="anhThumbnail" label="Link ảnh bìa (URL)">
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            {editingEvent ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* === MODAL MỚI: DANH SÁCH THAM GIA === */}
            <Modal
                title="Danh sách sinh viên tham gia"
                open={isParticipantModalVisible}
                onCancel={handleCancelParticipantModal}
                width={1000}
                footer={[
                    <Button key="download" icon={<DownloadOutlined />} type="primary" onClick={() => handleExportExcel(selectedEventId)}>
                        Xuất Excel
                    </Button>,
                    <Button key="close" onClick={handleCancelParticipantModal}>
                        Đóng
                    </Button>
                ]}
            >
                <Table
                    dataSource={participants}
                    columns={participantColumns}
                    rowKey="userId"
                    loading={loadingParticipants}
                />
            </Modal>
        </Layout>
    );
};

export default PosterEventsPage;