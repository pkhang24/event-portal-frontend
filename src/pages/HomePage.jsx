import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicEvents, getCategories, } from '../services/eventService';
import { getActiveBanners } from '../services/api';
import { useBanner } from '../context/BannerContext';
import MyNavbar from '../components/MyNavbar';
import MyFooter from '../components/MyFooter';
import { Layout, Row, Col, Card, Button, Spin, Alert, Typography, Carousel, Select, Segmented } from 'antd';
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
    const startTime = new Date(event.thoiGianBatDau);
    const endTime = new Date(event.thoiGianKetThuc);

    // 1. Logic xác định trạng thái
    const isEnded = endTime < now; // Đã kết thúc
    const isOngoing = startTime <= now && endTime >= now; // Đang diễn ra

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
                cursor: 'pointer',
                // 2. Style cho sự kiện đã kết thúc (Làm mờ và nền xám)
                opacity: isEnded ? 0.7 : 1,
                backgroundColor: isEnded ? '#f5f5f5' : '#fff',
            }}
            cover={
                <div style={{ position: 'relative' }}>
                    <img 
                        alt={event.tieuDe} 
                        src={event.anhThumbnail || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"}
                        style={{ height: 200, width: '100%', objectFit: 'cover', display: 'block' }} 
                    />
                    {/* 3. Nhãn dán đè lên ảnh nếu đã kết thúc */}
                    {isEnded && (
                        <div style={{
                            position: 'absolute', top: 10, right: 10, 
                            background: 'rgba(0,0,0,0.6)', color: 'white', 
                            padding: '4px 8px', borderRadius: 4, fontWeight: 'bold', fontSize: '12px'
                        }}>
                            ĐÃ KẾT THÚC
                        </div>
                    )}
                </div>
            }
        >
            <Meta
                title={
                    <Text strong style={{ fontSize: 16, color: isEnded ? '#888' : 'inherit' }} ellipsis={{ tooltip: event.tieuDe }}>
                        {event.tieuDe}
                    </Text>
                }
                description={
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Text type="secondary"><CalendarOutlined /> {new Date(event.thoiGianBatDau).toLocaleString('vi-VN')}</Text>
                        <Text type="secondary"><EnvironmentOutlined /> {event.diaDiem}</Text>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 10, flex: 1 }}>
                            {event.moTaNgan}
                        </Paragraph>
                        
                        <div style={{ marginTop: 'auto' }}>
                            {/* 4. Logic hiển thị nút bấm (Đã bỏ thẻ Link thừa) */}
                            {isEnded ? (
                                <Button disabled style={{ background: '#d9d9d9', color: '#888', borderColor: '#d9d9d9' }} block>
                                    Đã kết thúc
                                </Button>
                            ) : isOngoing ? (
                                <Button type="primary" ghost block>
                                    Đang diễn ra
                                </Button>
                            ) : (
                                <Button type="primary" block>
                                    Xem chi tiết
                                </Button>
                            )}
                        </div>
                    </div>
                }
            />
        </Card>
    );
};

// --- Component con: Chế độ xem Danh sách ---
const EventListView = ({ events }) => {
    const now = new Date();
    
    // Phân loại sự kiện
    const ongoingEvents = events.filter(e => new Date(e.thoiGianBatDau) <= now && new Date(e.thoiGianKetThuc) >= now);
    const upcomingEvents = events.filter(e => new Date(e.thoiGianBatDau) > now);
    const endedEvents = events.filter(e => new Date(e.thoiGianKetThuc) < now);

    if (events.length === 0) return <Alert message="Không tìm thấy sự kiện nào." type="info" showIcon />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* 1. Đang diễn ra */}
            {ongoingEvents.length > 0 && (
                <section>
                    <Title level={3} style={{ marginBottom: 20, color: '#333' }}>Sự kiện đang diễn ra</Title>
                    <Row gutter={[24, 24]}>
                        {ongoingEvents.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}><CardComponent event={event} /></Col>
                        ))}
                    </Row>
                </section>
            )}

            {/* 2. Sắp diễn ra */}
            {upcomingEvents.length > 0 && (
                <section>
                    <Title level={3} style={{ marginBottom: 20, color: '#333' }}>Sự kiện sắp diễn ra</Title>
                    <Row gutter={[24, 24]}>
                        {upcomingEvents.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}><CardComponent event={event} /></Col>
                        ))}
                    </Row>
                </section>
            )}

            {/* 3. Đã kết thúc */}
            {endedEvents.length > 0 && (
                <section>
                    <Title level={3} style={{ marginBottom: 20, color: '#888' }}>Sự kiện đã kết thúc</Title>
                    <Row gutter={[24, 24]}>
                        {endedEvents.map(event => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}><CardComponent event={event} /></Col>
                        ))}
                    </Row>
                </section>
            )}
        </div>
    );
};

const HomePage = () => {
    // 1. State chứa dữ liệu GỐC (tất cả sự kiện từ API)
    const [sourceEvents, setSourceEvents] = useState([]); 
    
    // 2. State chứa dữ liệu ĐÃ LỌC (để hiển thị ra màn hình)
    const [displayedEvents, setDisplayedEvents] = useState([]); 

    const [categories, setCategories] = useState([]);
    // const [banners, setBanners] = useState([]);
    const { banners, loading: bannerLoading } = useBanner();
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
                const [catData, allEventsData] = await Promise.all([
                    getCategories(),
                    getPublicEvents() // Gọi không tham số để lấy tất cả
                ]);
                
                setCategories(catData);
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
        // 2. Lọc theo Danh mục (Category Tab)
        if (filterCategory !== 'all_cat') {
            // Kiểm tra xem event có thuộc category này không
            // (Backend cần trả về object 'category' hoặc trường 'categoryId' trong EventResponse)
            result = result.filter(e => e.category && e.category.id === filterCategory); 
        }

        setDisplayedEvents(result); // Cập nhật danh sách hiển thị
    }, [filterCategory, sourceEvents]); 


    return (
        <Layout className="layout" style={{ minHeight: '100vh', background: '#fff' }}>
            <MyNavbar />

            {/* === PHẦN BANNER (Đã sửa style đẹp) === */}
            {!loading && !error && banners.length > 0 && ( // Không hiện spinner riêng cho banner để tránh giật
                <div style={{ 
                    maxWidth: '1300px', 
                    margin: '50px', 
                    padding: '0 20px',
                }}>
                    <Carousel 
                        autoplay 
                        draggable={true}
                        className="home-banner-carousel"
                        style={{ 
                            LineHeight: '400px',
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

            <Content style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Hàng điều khiển: Lọc bên trái, View bên phải */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                    
                    {/* Dropdown Lọc danh mục (Giống ảnh mẫu) */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 10, fontWeight: 600, fontSize: '16px' }}>Lọc sự kiện:</span>
                        <Select
                            defaultValue="all_cat"
                            style={{ width: 220 }}
                            size="large"
                            onChange={setFilterCategory}
                            options={[
                                { value: 'all_cat', label: 'Tất cả danh mục' },
                                ...categories.map(cat => ({ value: cat.id, label: cat.tenDanhMuc }))
                            ]}
                        />
                    </div>

                    {/* Chuyển đổi chế độ xem */}
                    <Segmented
                        options={[
                            { value: 'List', icon: <BarsOutlined /> },
                            { value: 'Calendar', icon: <CalendarOutlined /> },
                        ]}
                        value={viewMode}
                        onChange={setViewMode}
                        size="large"
                    />
                </div>

                {/* Nội dung chính */}
                <div style={{ minHeight: 380 }}>
                    {loading ? (
                         <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>
                    ) : (
                        viewMode === 'List' ? 
                        <EventListView events={displayedEvents} /> : 
                        <EventCalendarView events={displayedEvents} /> // Nhớ uncomment hàm này nếu dùng
                    )}
                </div>
            </Content>
            
            <MyFooter />
        </Layout>
    );
};

export default HomePage;