import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Typography, Row, Col, Spin, Alert } from 'antd';
import { getPublicEvents } from '../services/eventService';
import MyNavbar from '../components/MyNavbar';
import { CardComponent } from './HomePage';

const { Content } = Layout;
const { Title } = Typography;

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            setEvents([]);
            return;
        }

        const fetchSearch = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getPublicEvents(query, null);
                setEvents(data);
            } catch (err) {
                setError("Lỗi khi tìm kiếm sự kiện.");
            } finally {
                setLoading(false);
            }
        };

        fetchSearch();
    }, [query]);

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <MyNavbar />
            <Content style={{ padding: '0 50px', marginTop: 30 }}>
                <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
                    <Title level={2}>
                        Kết quả tìm kiếm cho: "<span style={{ color: '#1677ff' }}>{query}</span>"
                    </Title>

                    {loading && <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>}
                    {error && <Alert message={error} type="error" showIcon />}

                    {!loading && !error && events.length === 0 && (
                        <Alert message="Thông báo" description="Không tìm thấy sự kiện nào phù hợp." type="info" showIcon />
                    )}

                    <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                        {events.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                                <CardComponent event={event} isOngoing={false} />
                            </Col>
                        ))}
                    </Row>

                </div>
            </Content>
        </Layout>
    );
};

export default SearchPage;