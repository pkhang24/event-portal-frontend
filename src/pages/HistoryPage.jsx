import { useEffect, useState } from 'react';
import { Layout, Typography, List, Card, Tag, Empty, Spin, Alert } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import MyNavbar from '../components/MyNavbar';
import { getMyHistory } from '../services/registrationService'; // (hoặc service của bạn)

const { Content } = Layout;
const { Title } = Typography;

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getMyHistory();
                setHistory(data);
            } catch (err) {
                setError("Không thể tải lịch sử tham gia.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <MyNavbar />
            <Content style={{ padding: '0 50px', marginTop: 30 }}>
                <div style={{ background: '#fff', padding: 24, minHeight: 380, borderRadius: 8 }}>
                    <Title level={2} style={{ marginBottom: 30 }}>Lịch sử Sự kiện đã tham gia</Title>

                    {loading && <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>}
                    {error && <Alert message={error} type="error" showIcon />}

                    {!loading && !error && history.length === 0 && (
                        <Empty description="Bạn chưa tham gia sự kiện nào đã kết thúc." />
                    )}

                    <List
                        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }}
                        dataSource={history}
                        renderItem={ticket => (
                            <List.Item>
                                <Card
                                    title={ticket.tieuDeSuKien}
                                    style={{ opacity: 0.8 }} // Làm mờ đi cho biết đã cũ
                                >
                                    <p><CalendarOutlined /> {new Date(ticket.thoiGianBatDau).toLocaleString('vi-VN')}</p>
                                    <p><EnvironmentOutlined /> {ticket.diaDiem}</p>
                                    <Tag icon={<CheckCircleOutlined />} color="success">
                                        Đã tham gia
                                    </Tag>
                                    {/* (Không cần nút QR nữa vì đã qua) */}
                                </Card>
                            </List.Item>
                        )}
                    />
                </div>
            </Content>
        </Layout>
    );
};

export default HistoryPage;