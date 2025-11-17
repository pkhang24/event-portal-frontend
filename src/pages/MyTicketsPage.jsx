import { useEffect, useState } from 'react';
import { Layout, Typography, List, Card, Tag, Modal, Button, Empty, Spin, Alert, Popconfirm, message } from 'antd'; // <<< 1. Thêm 'message'
import { CalendarOutlined, EnvironmentOutlined, QrcodeOutlined, DeleteOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import MyNavbar from '../components/MyNavbar';
import api from '../services/api';
import { cancelRegistration } from '../services/registrationService'; 
const { Content } = Layout;
const { Title, Text } = Typography;

const MyTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // --- 3. Tách hàm fetchTickets ra ngoài để tái sử dụng ---
    const fetchTickets = async () => {
        setLoading(true); // Đặt loading mỗi lần fetch
        try {
            const response = await api.get('/registrations/my-tickets');
            setTickets(response.data);
        } catch (err) {
            setError("Không thể tải danh sách vé của bạn.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Hàm mở Modal hiển thị QR
    const showQRModal = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalVisible(true);
    };

    // Hàm đóng Modal
    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedTicket(null);
    };

    // --- 4. Thêm hàm xử lý Hủy vé ---
    const handleCancelTicket = async (registrationId) => {
        try {
            await cancelRegistration(registrationId);
            message.success("Hủy vé thành công!");
            fetchTickets(); // Tải lại danh sách vé
        } catch (err) {
            message.error(err.response?.data?.message || "Hủy vé thất bại.");
        }
    };

    // --- 5. Thêm hàm kiểm tra sự kiện đã bắt đầu chưa ---
    const hasEventStarted = (startTime) => {
        return new Date(startTime) < new Date(); // So sánh với thời gian hiện tại
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <MyNavbar />
            <Content style={{ padding: '0 50px', marginTop: 30 }}>
                <div style={{ background: '#fff', padding: 24, minHeight: 380, borderRadius: 8 }}>
                    <Title level={2} style={{ marginBottom: 30 }}>Vé tham gia sự kiện của tôi</Title>

                    {loading && <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>}
                    {error && <Alert message={error} type="error" showIcon />}

                    {!loading && !error && tickets.length === 0 && (
                        <Empty description="Bạn chưa đăng ký sự kiện nào." />
                    )}

                    <List
                        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
                        dataSource={tickets}
                        // --- 6. Cập nhật logic Render Item ---
                        renderItem={ticket => {
                            const eventStarted = hasEventStarted(ticket.thoiGianBatDau);
                            
                            // Tạo mảng actions
                            const cardActions = [
                                <Button 
                                    type="primary" 
                                    icon={<QrcodeOutlined />} 
                                    onClick={() => showQRModal(ticket)}
                                    key="qr"
                                >
                                    Xem mã QR
                                </Button>
                            ];

                            // Chỉ thêm nút Hủy nếu sự kiện CHƯA bắt đầu VÀ vé CHƯA điểm danh
                            if (!eventStarted && ticket.trangThai === 'REGISTERED') {
                                cardActions.push(
                                    <Popconfirm
                                        key="cancel"
                                        title="Bạn chắc chắn muốn hủy vé?"
                                        description="Hành động này không thể hoàn tác."
                                        onConfirm={() => handleCancelTicket(ticket.registrationId)}
                                        okText="Hủy"
                                        cancelText="Không"
                                    >
                                        <Button danger icon={<DeleteOutlined />}>
                                            Hủy tham gia
                                        </Button>
                                    </Popconfirm>
                                );
                            }

                            return (
                                <List.Item>
                                    <Card
                                        title={ticket.tieuDeSuKien}
                                        extra={
                                            // Cập nhật Tag cho rõ ràng
                                            ticket.trangThai === 'ATTENDED' ? 
                                            <Tag color="green">Đã tham gia</Tag> : 
                                            (eventStarted ? <Tag color="red">Đã diễn ra</Tag> : <Tag color="blue">Đã đăng ký</Tag>)
                                        }
                                        actions={cardActions} // Gán mảng actions vào
                                    >
                                        <p><CalendarOutlined /> {new Date(ticket.thoiGianBatDau).toLocaleString('vi-VN')}</p>
                                        <p><EnvironmentOutlined /> {ticket.diaDiem}</p>
                                        <p>Mã vé: <Text code>{ticket.ticketCode.substring(0, 8)}...</Text></p>
                                    </Card>
                                </List.Item>
                            );
                        }}
                    />
                </div>
            </Content>

            {/* Modal hiển thị mã QR (Giữ nguyên) */}
            <Modal 
                title="Mã QR điểm danh" 
                open={isModalVisible} 
                onCancel={handleCancel}
                footer={[ <Button key="close" type="primary" onClick={handleCancel}>Đóng</Button> ]}
                centered
            >
                {selectedTicket && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <Title level={4}>{selectedTicket.tieuDeSuKien}</Title>
                        <Text type="secondary">Đưa mã này cho người tổ chức để điểm danh</Text>
                        
                        <div style={{ margin: '30px auto', padding: 20, background: 'white', display: 'inline-block', borderRadius: 10, boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}>
                            <QRCodeSVG 
                                value={selectedTicket.ticketCode} 
                                size={250} 
                                level={"H"}
                                marginSize={true}
                            />
                        </div>
                        
                        <div>
                            <Tag color={selectedTicket.trangThai === 'ATTENDED' ? 'green' : 'blue'} style={{ fontSize: 16, padding: '5px 15px' }}>
                                {selectedTicket.trangThai === 'ATTENDED' ? 'ĐÃ ĐIỂM DANH' : 'CHƯA ĐIỂM DANH'}
                            </Tag>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default MyTicketsPage;