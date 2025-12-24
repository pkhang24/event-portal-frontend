import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, List, Card, Tag, Empty, Spin, Alert, Button } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import MyNavbar from '../components/MyNavbar';
import { getMyHistory } from '../services/registrationService';

const { Content } = Layout;
const { Title } = Typography;

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

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
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
                    Quay lại
                </Button>
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