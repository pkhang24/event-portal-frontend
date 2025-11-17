import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicEvents, getCategories } from '../services/eventService';
import { getActiveBanners } from '../services/api';
import MyNavbar from '../components/MyNavbar';
// Import các component từ Ant Design
import { Layout, Row, Col, Card, Button, Spin, Alert, Typography, Space, Carousel, Tabs, Segmented } from 'antd';
import { CalendarOutlined, BarsOutlined,EnvironmentOutlined } from '@ant-design/icons';
// Import cho Calendar View
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

const localizer = momentLocalizer(moment); // Cấu hình localizer cho Calendar
const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

// --- Component con: Chế độ xem Lịch ---
const EventCalendarView = ({ events }) => {
    const calendarEvents = events.map(event => ({
        title: event.tieuDe,
        start: new Date(event.thoiGianBatDau),
        end: new Date(event.thoiGianKetThuc),
        resource: event, // Lưu data gốc
    }));

    return (
        <div style={{ height: 600, marginTop: 20 }}>
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
            />
        </div>
    );
};

// --- Component con: Chế độ xem Danh sách ---
const EventListView = ({ events }) => {
    const now = new Date();
    
    // Chia làm 2 nhóm
    const ongoingEvents = events.filter(e => new Date(e.thoiGianBatDau) <= now && new Date(e.thoiGianKetThuc) >= now);
    const upcomingEvents = events.filter(e => new Date(e.thoiGianBatDau) > now);

    return (
        <>
            {/* Phần Đang diễn ra */}
            {ongoingEvents.length > 0 && (
                <>
                    <Title level={3} style={{ marginTop: 30 }}>Đang diễn ra</Title>
                    <Row gutter={[24, 24]}>
                        {ongoingEvents.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                                <CardComponent event={event} isOngoing={true} />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* Phần Sắp diễn ra */}
            <Title level={3} style={{ marginTop: 30 }}>Sắp diễn ra</Title>
            {upcomingEvents.length === 0 && ongoingEvents.length === 0 && (
                 <Alert message="Thông báo" description="Không tìm thấy sự kiện nào phù hợp." type="info" showIcon />
            )}
            <Row gutter={[24, 24]}>
                {upcomingEvents.map(event => (
                    <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                        <CardComponent event={event} isOngoing={false} />
                    </Col>
                ))}
            </Row>
        </>
    );
};

// --- Component con: Card Sự kiện (Tái sử dụng) ---
 export const CardComponent = ({ event, isOngoing }) => (
    <Card
        hoverable
        style={{ height: '100%' }}
        cover={
            <img alt={event.tieuDe} src={event.anhThumbnail || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"}
                 style={{ height: 200, objectFit: 'cover' }} />
        }
    >
        <Meta
            title={<Text strong>{event.tieuDe}</Text>}
            description={
                <>
                    <Text type="secondary"><CalendarOutlined /> {new Date(event.thoiGianBatDau).toLocaleString('vi-VN')}</Text><br/>
                    <Text type="secondary"><EnvironmentOutlined /> {event.diaDiem}</Text>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 10 }}>
                        {event.moTaNgan}
                    </Paragraph>
                    <Link to={`/events/${event.id}`}>
                        <Button type="primary" block disabled={isOngoing}>
                            {isOngoing ? "Đang diễn ra" : "Xem chi tiết"}
                        </Button>
                    </Link>
                </>
            }
        />
    </Card>
);

const HomePage = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]); // State mới cho banners
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('List'); // 'List' hoặc 'Calendar'
    const [filterStatus, setFilterStatus] = useState(null); // null (all), 'ongoing', 'upcoming'
    const [filterCategory, setFilterCategory] = useState(null);
    // (search sẽ xử lý ở trang SearchPage.jsx riêng)

    useEffect(() => {
    // Fetch categories (chỉ 1 lần)
    const fetchCategories = async () => {
        try {
            const catData = await getCategories();
            setCategories(catData);
        } catch (err) { console.error("Lỗi tải danh mục"); }
    };
    fetchCategories();
    // (Fetch banner)
}, []);

useEffect(() => {
    // Fetch sự kiện (mỗi khi filter thay đổi)
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const eventsData = await getPublicEvents(null, filterStatus, filterCategory);
            setAllEvents(eventsData);
        } catch (err) { /* ... */ } 
        finally { setLoading(false); }
    };
    fetchEvents();
}, [filterStatus, filterCategory]); // Thêm filterCategory vào dependencies

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <MyNavbar />

            {/* === PHẦN BANNER MỚI === */}
            {loading ? <Spin /> : error ? null : (
                <Carousel autoplay style={{ lineHeight: '300px', background: '#364d79' }}>
                    {banners.map(banner => (
                        <div key={banner.id}>
                            <a href={banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer">
                                <img 
                                    src={banner.imageUrl} 
                                    alt="Event Banner" 
                                    style={{ width: '100%', height: '300px', objectFit: 'cover' }} 
                                />
                            </a>
                        </div>
                    ))}
                </Carousel>
            )}

            <Content style={{ padding: '0 50px', marginTop: 30 }}>
                <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>

                    {/* Hàng điều khiển Lọc và Chuyển view */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                        <Col>
                            <Tabs defaultActiveKey="all" onChange={(key) => setFilterStatus(key === 'all' ? null : key)}>
                                <Tabs.TabPane tab="Tất cả" key="all" />
                                <Tabs.TabPane tab="Đang diễn ra" key="ongoing" />
                                <Tabs.TabPane tab="Sắp diễn ra" key="upcoming" />
                            </Tabs>
                            <Tabs 
                                defaultActiveKey="all_cat"
                                onChange={(key) => setFilterCategory(key === 'all_cat' ? null : key)}
                            >
                                <Tabs.TabPane tab="Tất cả Danh mục" key="all_cat" />
                                {categories.map(cat => (
                                    <Tabs.TabPane tab={cat.tenDanhMuc} key={cat.id} />
                                ))}
                            </Tabs>
                        </Col>
                        <Col>
                            <Segmented
                                options={[
                                    { value: 'List', icon: <BarsOutlined /> },
                                    { value: 'Calendar', icon: <CalendarOutlined /> },
                                ]}
                                value={viewMode}
                                onChange={setViewMode}
                            />
                        </Col>
                    </Row>

                    {/* Vùng hiển thị nội dung */}
                    {loading && <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>}
                    {error && <Alert message={error} type="error" showIcon />}
                    
                    {!loading && !error && (
                        viewMode === 'List' ? 
                        <EventListView events={allEvents} /> : 
                        <EventCalendarView events={allEvents} />
                    )}

                </div>
            </Content>
            <Layout.Footer style={{ textAlign: 'center' }}>
                Event Portal ©2025 Created by You
            </Layout.Footer>
        </Layout>
    );
};

export default HomePage;