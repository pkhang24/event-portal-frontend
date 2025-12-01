
import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicEvents, getCategories } from '../services/eventService';
// import { getActiveBanners } from '../services/api';
import { useBanner } from '../context/BannerContext';
import MyNavbar from '../components/MyNavbar';
import MyFooter from '../components/MyFooter';
import { Layout, Row, Col, Card, Button, Spin, Alert, Typography, Carousel, Select, Segmented, Tag, Empty, Image} from 'antd';
// Thêm các Icon mới cho tiêu đề
import { CalendarOutlined, BarsOutlined, EnvironmentOutlined, FireFilled, CalendarFilled, FlagFilled } from '@ant-design/icons';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('vi');
const localizer = momentLocalizer(moment);
const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

// --- 1. COMPONENT TIÊU ĐỀ MỚI (STYLE HIỆN ĐẠI) ---
const SectionTitle = ({ title, icon, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, marginTop: 10 }}>
        <div style={{ 
            width: 40, height: 40, borderRadius: 12, 
            background: color, color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, marginRight: 12,
            boxShadow: `0 4px 10px ${color}66` // Bóng đổ màu
        }}>
            {icon}
        </div>
        <Title level={3} style={{ margin: 0, color: '#333' }}>{title}</Title>
    </div>
);

// --- Component con: Chế độ xem Lịch (GIỮ NGUYÊN) ---
const EventCalendarView = ({ events }) => {
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState(Views.MONTH);
    const onNavigate = useCallback((newDate) => setDate(newDate), []);
    const onView = useCallback((newView) => setView(newView), []);

    const messages = { allDay: 'Cả ngày', previous: 'Trước', next: 'Sau', today: 'Hôm nay', month: 'Tháng', week: 'Tuần', day: 'Ngày', agenda: 'Danh sách', date: 'Ngày', time: 'Thời gian', event: 'Sự kiện', noEventsInRange: 'Không có sự kiện nào.', showMore: total => `+ Xem thêm (${total})` };

    const calendarEvents = events.map(event => ({
        title: event.tieuDe,
        start: new Date(event.thoiGianBatDau),
        end: new Date(event.thoiGianKetThuc),
        resource: event,
    }));

    const eventStyleGetter = (event, start, end, isSelected) => {
        const now = new Date();
        if (end < now) return { style: { backgroundColor: '#d9d9d9', color: '#666', opacity: 0.6, border: 'none' } };
        return { style: { backgroundColor: '#1677ff' } };
    };

    return (
        <div style={{ height: 600, marginTop: 20 }}>
            <Calendar
                localizer={localizer} events={calendarEvents} startAccessor="start" endAccessor="end" style={{ height: 500 }}
                culture='vi' messages={messages} date={date} view={view} onNavigate={onNavigate} onView={onView}
                eventPropGetter={eventStyleGetter}
            />
        </div>
    );
};

// --- Component con: Card Sự kiện (GIỮ NGUYÊN BẢN ĐÃ CLICK ĐƯỢC) ---
export const CardComponent = ({ event }) => {
    const navigate = useNavigate();
    const now = new Date();
    const startTime = new Date(event.thoiGianBatDau);
    const endTime = new Date(event.thoiGianKetThuc);

    const isEnded = endTime < now;
    const isOngoing = startTime <= now && endTime >= now;
    const isUpcoming = startTime > now;

    const handleCardClick = () => {
        navigate(`/events/${event.id}`);
    };

    const renderStatusBadge = () => {
        if (isEnded) {
            return (
                <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(0,0,0,0.7)', color: '#fff',
                    padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold'
                }}>
                    ĐÃ KẾT THÚC
                </div>
            );
        }
        if (isOngoing) {
            return (
                <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: '#ff4d4f', color: '#fff', // Màu đỏ nổi bật
                    padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(255, 77, 79, 0.4)'
                }}>
                    ĐANG DIỄN RA
                </div>
            );
        }
        if (isUpcoming) {
            return (
                <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: '#1677ff', color: '#fff', // Màu xanh dương
                    padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(22, 119, 255, 0.4)'
                }}>
                    SẮP DIỄN RA
                </div>
            );
        }
        return null;
    };

    return (
        <Card
            hoverable
            className="event-card"
            onClick={handleCardClick}
            style={{ 
                height: '100%', 
                display: 'flex', flexDirection: 'column', cursor: 'pointer',
                // Làm mờ nhẹ nếu đã kết thúc
                opacity: isEnded ? 0.7 : 1,
                background: isEnded ? '#f5f5f5' : '#fff',
                borderRadius: '12px', overflow: 'hidden', border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
            bodyStyle={{ padding: '16px' }}
            cover={
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                        alt={event.tieuDe} 
                        src={event.anhThumbnail || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"}
                        className="event-card-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                    {/* === GỌI HÀM RENDER BADGE === */}
                    {renderStatusBadge()}
                </div>
            }
        >
            <Meta
                title={<Text strong style={{ fontSize: 16, color: isEnded ? '#888' : 'inherit' }} ellipsis={{ tooltip: event.tieuDe }}>{event.tieuDe}</Text>}
                description={
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Text type="secondary"><CalendarOutlined /> {new Date(event.thoiGianBatDau).toLocaleString('vi-VN')}</Text>
                        <Text type="secondary"><EnvironmentOutlined /> {event.diaDiem}</Text>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 10, flex: 1 }}>{event.moTaNgan}</Paragraph>
                        <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                             {isEnded ? <Button disabled block>Đã kết thúc</Button> : isOngoing ? <Button type="primary" ghost block>Đang diễn ra</Button> : <Button type="primary" block>Xem chi tiết</Button>}
                        </div>
                    </div>
                }
            />
        </Card>
    );
};

// --- Component con: Danh sách sự kiện (ĐÃ CẢI TIẾN UX) ---
const EventListView = ({ events }) => {
    const now = new Date();
    
    // Phân loại sự kiện
    const ongoingEvents = events.filter(e => new Date(e.thoiGianBatDau) <= now && new Date(e.thoiGianKetThuc) >= now);
    const upcomingEvents = events.filter(e => new Date(e.thoiGianBatDau) > now);
    const endedEvents = events.filter(e => new Date(e.thoiGianKetThuc) < now);

    // Component hiển thị khi trống (Tái sử dụng)
    const EmptySection = () => (
        <div style={{ 
            background: '#fff', padding: '40px', borderRadius: '12px', 
            textAlign: 'center', border: '1px dashed #d9d9d9',
            color: '#8c8c8c'
        }}>
            <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Hiện tại chưa có sự kiện nào, hãy quay lại sau nhé!" 
            />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
            
            {/* 1. Đang diễn ra */}
            <section>
                <SectionTitle title="Sự kiện đang diễn ra" icon={<FireFilled />} color="#ff4d4f" />
                {ongoingEvents.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {ongoingEvents.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}><CardComponent event={event} /></Col>
                        ))}
                    </Row>
                ) : <EmptySection />}
            </section>

            {/* 2. Sắp diễn ra */}
            <section>
                <SectionTitle title="Sự kiện sắp diễn ra" icon={<CalendarFilled />} color="#1677ff" />
                {upcomingEvents.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {upcomingEvents.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}><CardComponent event={event} /></Col>
                        ))}
                    </Row>
                ) : <EmptySection />}
            </section>

            {/* 3. Đã kết thúc */}
            <section>
                <SectionTitle title="Sự kiện đã kết thúc" icon={<FlagFilled />} color="#8c8c8c" />
                {endedEvents.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {endedEvents.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}><CardComponent event={event} /></Col>
                        ))}
                    </Row>
                ) : <EmptySection />}
            </section>

        </div>
    );
};

const HomePage = () => {
    const [sourceEvents, setSourceEvents] = useState([]); 
    const [displayedEvents, setDisplayedEvents] = useState([]); 
    const [categories, setCategories] = useState([]);
    const {banners} = useBanner();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [viewMode, setViewMode] = useState('List');
    const [filterCategory, setFilterCategory] = useState('all_cat');

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [catData, allEventsData] = await Promise.all([
                    getCategories(),
                    getPublicEvents()
                ]);
                setCategories(catData);
                setSourceEvents(allEventsData);
                setDisplayedEvents(allEventsData);
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                setError("Không thể tải dữ liệu trang chủ.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (filterCategory === 'all_cat') {
            setDisplayedEvents(sourceEvents);
        } else {
            setDisplayedEvents(sourceEvents.filter(e => e.category && e.category.id === filterCategory));
        }
    }, [filterCategory, sourceEvents]); 

    useEffect(() => {
        if (banners.length > 0) {
            const timer = setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100); // Đợi 100ms để DOM ổn định
            return () => clearTimeout(timer);
        }
    }, [banners]);

    return (
        <Layout className="layout" style={{ minHeight: '100vh', background: '#ffffffff' }}>
            <MyNavbar />

            {/* === PHẦN BANNER (GIỮ NGUYÊN CODE CŨ) === */}
            {banners && banners.length > 0 ? (
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '30px auto', 
                    padding: '0 24px',
                    height: '400px' // Chiều cao cứng cho khung chứa
                }}>
                    <Carousel 
                        autoplay 
                        draggable={true}
                        className="home-banner-carousel" // Class này ăn CSS ở Bước 1
                        style={{ 
                            height: '400px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                        }}
                    >
                        {banners.map((banner) => (
                            <div key={banner.id} className="home-banner-item">
                                <Image
                                    src={banner.imageUrl}
                                    alt="Event Banner"
                                    preview={false} // Tắt tính năng bấm vào để xem ảnh to
                                    width="1200px"
                                    height="400px"
                                    style={{ objectFit: 'cover' }}
                                    
                                    // === KỸ THUẬT TỐI ƯU ===
                                    // Hiển thị một khung màu hoặc ảnh mờ trong khi đợi ảnh thật tải
                                    placeholder={
                                        <div style={{ 
                                            width: '1200px', 
                                            height: '400px', 
                                            background: 'linear-gradient(90deg, #f0f2f5 25%, #e6f7ff 37%, #f0f2f5 63%)', // Hiệu ứng Skeleton loader
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Spin /> {/* Hoặc hiện icon loading */}
                                        </div>
                                    }
                                />
                            </div>
                        ))}
                    </Carousel>
                </div>
            ) : null}

            

            <Content style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 10, fontWeight: 600, fontSize: '16px', color: '#333' }}>Lọc sự kiện:</span>
                        <Select defaultValue="all_cat" style={{ width: 220 }} size="large" onChange={setFilterCategory} options={[{ value: 'all_cat', label: 'Tất cả danh mục' }, ...categories.map(cat => ({ value: cat.id, label: cat.tenDanhMuc }))]} />
                    </div>
                    <Segmented options={[{ value: 'List', icon: <BarsOutlined /> }, { value: 'Calendar', icon: <CalendarOutlined /> }]} value={viewMode} onChange={setViewMode} size="large" />
                </div>

                <div style={{ minHeight: 380 }}>
                    {loading ? <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div> : error ? <Alert message={error} type="error" showIcon /> : (
                        viewMode === 'List' ? <EventListView events={displayedEvents} /> : <EventCalendarView events={displayedEvents} />
                    )}
                </div>
            </Content>
            <MyFooter />
        </Layout>
    );
};

export default HomePage;