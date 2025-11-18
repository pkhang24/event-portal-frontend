import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicEvents, getCategories, } from '../services/eventService';
import { getActiveBanners } from '../services/api';
import MyNavbar from '../components/MyNavbar';
import MyFooter from '../components/MyFooter';
import { Layout, Row, Col, Card, Button, Spin, Alert, Typography, Carousel, Tabs, Segmented } from 'antd';
import { CalendarOutlined, BarsOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('vi');
const localizer = momentLocalizer(moment);
const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

// --- Component con: Chế độ xem Lịch ---
const EventCalendarView = ({ events }) => {
    // 1. Tạo state để quản lý ngày tháng và chế độ xem
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState(Views.MONTH);

    // 2. Hàm xử lý khi bấm nút Back/Next/Today
    const onNavigate = useCallback((newDate) => {
        setDate(newDate);
    }, []);

    // 3. Hàm xử lý khi bấm nút Month/Week/Day
    const onView = useCallback((newView) => {
        setView(newView);
    }, []);

    const messages = {
        allDay: 'Cả ngày',
        previous: 'Trước',
        next: 'Sau',
        today: 'Hôm nay',
        month: 'Tháng',
        week: 'Tuần',
        day: 'Ngày',
        agenda: 'Danh sách',
        date: 'Ngày',
        time: 'Thời gian',
        event: 'Sự kiện',
        noEventsInRange: 'Không có sự kiện nào trong khoảng thời gian này.',
        showMore: total => `+ Xem thêm (${total})`
    };

    const calendarEvents = events.map(event => ({
        title: event.tieuDe,
        start: new Date(event.thoiGianBatDau),
        end: new Date(event.thoiGianKetThuc),
        resource: event,
    }));

    // Hàm tùy chỉnh màu sắc sự kiện
    const eventStyleGetter = (event, start, end, isSelected) => {
        const now = new Date();
        // Nếu sự kiện đã kết thúc -> Màu xám
        if (end < now) {
            return {
                style: {
                    backgroundColor: '#d9d9d9', // Màu xám
                    color: '#666',
                    opacity: 0.6,
                    border: 'none'
                }
            };
        }
        // Mặc định -> Màu xanh
        return {
            style: {
                backgroundColor: '#1677ff'
            }
        };
    };

    return (
        <div style={{ height: 600, marginTop: 20 }}>
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                culture='vi'        // Báo cho lịch biết dùng văn hóa Việt Nam (để định dạng ngày)
                messages={messages}
                date={date}         // Nói cho lịch biết đang xem ngày nào
                view={view}         // Nói cho lịch biết đang xem chế độ nào
                onNavigate={onNavigate} // Xử lý khi bấm nút điều hướng
                onView={onView}     // Xử lý khi bấm nút đổi view
                eventPropGetter={eventStyleGetter} // <-- Thêm dòng này
            />
        </div>
    );
};

// --- Component con: Card Sự kiện (Tái sử dụng) ---
export const CardComponent = ({ event }) => {
    const navigate = useNavigate();
    const now = new Date();
    // Logic xác định 'Đang diễn ra': Bắt đầu <= Hiện tại <= Kết thúc
    const isOngoing = new Date(event.thoiGianBatDau) <= now && new Date(event.thoiGianKetThuc) >= now;
    const handleCardClick = () => {
        navigate(`/events/${event.id}`);
    };
    
    return (
        <Card
            hoverable
            onClick={handleCardClick}
            style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                cursor: 'pointer' // Biến con trỏ chuột thành hình bàn tay
            }}
            cover={
                <img alt={event.tieuDe} src={event.anhThumbnail || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"}
                     style={{ height: 200, objectFit: 'cover' }} />
            }
        >
            <Meta
                title={<Text strong style={{ fontSize: 16 }} ellipsis={{ tooltip: event.tieuDe }}>{event.tieuDe}</Text>}
                description={
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Text type="secondary"><CalendarOutlined /> {new Date(event.thoiGianBatDau).toLocaleString('vi-VN')}</Text>
                        <Text type="secondary"><EnvironmentOutlined /> {event.diaDiem}</Text>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 10, flex: 1 }}>
                            {event.moTaNgan}
                        </Paragraph>
                        <Link to={`/events/${event.id}`} style={{ marginTop: 'auto' }}>
                            <Button type="primary" block disabled={isOngoing}>
                                {isOngoing ? "Đang diễn ra" : "Xem chi tiết"}
                            </Button>
                        </Link>
                    </div>
                }
            />
        </Card>
    );
};

// --- Component con: Chế độ xem Danh sách ---
const EventListView = ({ events }) => {
    const now = new Date();
    
    // Chia làm 2 nhóm từ danh sách đã lọc
    const ongoingEvents = events.filter(e => new Date(e.thoiGianBatDau) <= now && new Date(e.thoiGianKetThuc) >= now);
    const upcomingEvents = events.filter(e => new Date(e.thoiGianBatDau) > now);

    // Nếu danh sách rỗng hoàn toàn
    if (events.length === 0) {
        return <Alert message="Không tìm thấy sự kiện nào phù hợp." type="info" showIcon />;
    }

    return (
        <>
            {/* Phần Đang diễn ra */}
            {ongoingEvents.length > 0 && (
                <>
                    <Title level={3} style={{ marginTop: 30 }}>Đang diễn ra</Title>
                    <Row gutter={[24, 24]}>
                        {ongoingEvents.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                                <CardComponent event={event} />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* Phần Sắp diễn ra */}
            {upcomingEvents.length > 0 && (
                <>
                    <Title level={3} style={{ marginTop: 30 }}>Sắp diễn ra</Title>
                    <Row gutter={[24, 24]}>
                        {upcomingEvents.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                                <CardComponent event={event} />
                            </Col>
                        ))}
                    </Row>
                </>
            )}
            
            {/* Trường hợp có event nhưng không thuộc 2 nhóm trên (đã kết thúc) */}
            {ongoingEvents.length === 0 && upcomingEvents.length === 0 && events.length > 0 && (
                 <Alert message="Chỉ có các sự kiện đã kết thúc." type="info" showIcon style={{marginTop: 20}}/>
            )}
        </>
    );
};

const HomePage = () => {
    // 1. State chứa dữ liệu GỐC (tất cả sự kiện từ API)
    const [sourceEvents, setSourceEvents] = useState([]); 
    
    // 2. State chứa dữ liệu ĐÃ LỌC (để hiển thị ra màn hình)
    const [displayedEvents, setDisplayedEvents] = useState([]); 

    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State cho bộ lọc UI
    const [viewMode, setViewMode] = useState('List');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'ongoing', 'upcoming'
    const [filterCategory, setFilterCategory] = useState('all_cat');

    // --- FETCH DỮ LIỆU 1 LẦN DUY NHẤT KHI LOAD TRANG ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Gọi song song 3 API: Danh mục, Banner, và TẤT CẢ Sự kiện
                const [catData, bannerData, allEventsData] = await Promise.all([
                    getCategories(),
                    getActiveBanners(),
                    getPublicEvents() // Gọi không tham số để lấy tất cả
                ]);
                
                setCategories(catData);
                setBanners(bannerData);
                setSourceEvents(allEventsData); // Lưu vào nguồn
                setDisplayedEvents(allEventsData); // Ban đầu hiển thị tất cả
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                setError("Không thể tải dữ liệu trang chủ.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // --- HÀM LỌC DỮ LIỆU (Client-side Filtering) ---
    // Chạy mỗi khi user đổi tab status hoặc category
    useEffect(() => {
        let result = [...sourceEvents]; // Copy mảng gốc
        const now = new Date();

        // 1. Lọc theo Trạng thái (Status Tab)
        if (filterStatus === 'ongoing') {
            result = result.filter(e => new Date(e.thoiGianBatDau) <= now && new Date(e.thoiGianKetThuc) >= now);
        } else if (filterStatus === 'upcoming') {
            result = result.filter(e => new Date(e.thoiGianBatDau) > now);
        }

        // 2. Lọc theo Danh mục (Category Tab)
        if (filterCategory !== 'all_cat') {
            // Kiểm tra xem event có thuộc category này không
            // (Backend cần trả về object 'category' hoặc trường 'categoryId' trong EventResponse)
            result = result.filter(e => e.category && e.category.id === filterCategory); 
        }

        setDisplayedEvents(result); // Cập nhật danh sách hiển thị
    }, [filterStatus, filterCategory, sourceEvents]); 


    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <MyNavbar />

            {/* === PHẦN BANNER (Đã sửa style đẹp) === */}
            {!loading && !error && banners.length > 0 && ( // Không hiện spinner riêng cho banner để tránh giật
                <div style={{ 
                    maxWidth: '1300px', 
                    margin: '24px auto', 
                    padding: '0 24px',
                }}>
                    <Carousel 
                        autoplay 
                        draggable={true}
                        className="home-banner-carousel"
                        style={{ 
                            lineHeight: '400px',
                            background: '#364d79',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                    >
                        {banners.map((banner) => (
                            <div key={banner.id} className="home-banner-item">
                                <img 
                                    src={banner.imageUrl} 
                                    alt="Event Banner" 
                                    className="home-banner-img"
                                    style={{ 
                                        width: '100%', 
                                        height: '400px', 
                                        objectFit: 'cover',
                                        cursor: 'grab',
                                        borderRadius: '20px'
                                    }} 
                                />
                            </div>
                        ))}
                    </Carousel>
                </div>
            )}

            <Content style={{ padding: '0 20px' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto', background: '#fff', padding: 24, minHeight: 380, borderRadius: 8 }}>
                    
                    {/* Hàng điều khiển Lọc và View */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: 20 }} gutter={[16, 16]}>
                        <Col xs={24} md={18}>
                            {/* Tab Trạng thái */}
                            <Tabs defaultActiveKey="all" onChange={setFilterStatus} style={{ marginBottom: 10 }}>
                                <Tabs.TabPane tab="Tất cả" key="all" />
                                <Tabs.TabPane tab="Đang diễn ra" key="ongoing" />
                                <Tabs.TabPane tab="Sắp diễn ra" key="upcoming" />
                            </Tabs>
                            
                            {/* Tab Danh mục */}
                            <Tabs defaultActiveKey="all_cat" onChange={setFilterCategory} type="card" size="small">
                                <Tabs.TabPane tab="Tất cả Danh mục" key="all_cat" />
                                {categories.map(cat => (
                                    <Tabs.TabPane tab={cat.tenDanhMuc} key={cat.id} />
                                ))}
                            </Tabs>
                        </Col>
                        
                        {/* Nút chuyển View */}
                        <Col xs={24} md={6} style={{ textAlign: 'right' }}>
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

                    {/* Kết quả hiển thị */}
                    {loading ? (
                         <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
                    ) : error ? (
                        <Alert message={error} type="error" showIcon />
                    ) : (
                        viewMode === 'List' ? 
                        <EventListView events={displayedEvents} /> : 
                        <EventCalendarView events={displayedEvents} />
                    )}
                </div>
            </Content>
            
            <MyFooter />
        </Layout>
    );
};

export default HomePage;