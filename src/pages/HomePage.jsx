import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicEvents, getCategories } from '../services/eventService';
// import { getActiveBanners } from '../services/api';
import { useBanner } from '../context/BannerContext';
import MyNavbar from '../components/MyNavbar';
import MyFooter from '../components/MyFooter';
import { Layout, Row, Col, Card, Button, Spin, Alert, Typography, Carousel, Select, Segmented, Tag, Empty, Image, Input} from 'antd';
// Thêm các Icon mới cho tiêu đề
import { CalendarOutlined, BarsOutlined, EnvironmentOutlined, FireFilled, CalendarFilled, FlagFilled, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('vi');
const localizer = momentLocalizer(moment);
const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;
const BE_URL = "http://localhost:8080/uploads";

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

    // Format ngày tháng đẹp: "Thứ Hai, 30/10/2023"
    const dateStr = new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN', {
        weekday: 'long', 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
    });

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
            className="event-card" // Giữ class này để có hiệu ứng bay lên khi hover
            onClick={handleCardClick}
            style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: '16px', 
                border: '1px solid #f0f0f0',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)' // Bóng mờ rất nhẹ
            }}
            bodyStyle={{ 
                padding: '15px', 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column' 
            }}
            cover={
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                        alt={event.tieuDe} 
                        src={
                            event.anhThumbnail 
                            ? (event.anhThumbnail.startsWith('http') ? event.anhThumbnail : `${BE_URL}/${event.anhThumbnail}`)
                            : "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                        }
                        className="event-card-img"
                        style={{ 
                            height: '100%', 
                            width: '100%', 
                            objectFit: 'cover', 
                            display: 'block'
                        }} 
                        onError={(e) => { e.target.src = "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" }}
                    />
                    {/* Nhãn trạng thái (Đè lên ảnh) */}
                    {isEnded && (
                        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
                            ĐÃ KẾT THÚC
                        </div>
                    )}
                    {isOngoing && (
                        <div style={{ position: 'absolute', top: 12, right: 12, background: '#ff4d4f', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 'bold', boxShadow: '0 2px 8px rgba(255,77,79,0.3)' }}>
                            ĐANG DIỄN RA
                        </div>
                    )}
                    {isUpcoming && (
                        <div style={{ position: 'absolute', top: 12, right: 12, background: '#1677ff', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 'bold', boxShadow: '0 2px 8px rgba(255,77,79,0.3)' }}>
                            SẮP DIỄN RA
                        </div>
                    )}
                </div>
            }
        >
            {/* 1. Tag Danh mục (Pill Style) */}
            <div style={{ marginBottom: '0px' }}>
                <span style={{ 
                    display: 'inline-block',
                    backgroundColor: '#e6f4ff', // Nền xanh rất nhạt
                    color: '#1677ff',           // Chữ xanh đậm
                    padding: '4px 12px', 
                    borderRadius: '100px',      // Bo tròn 2 đầu
                    fontSize: '12px',
                    fontWeight: 600 
                }}>
                    {event.tenDanhMuc || 'Sự kiện chung'}
                </span>
            </div>

            {/* 2. Tiêu đề */}
            <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 700, 
                color: '#1f1f1f', 
                marginBottom: '4px',
                lineHeight: 1.4,
                height: '50px', // Cố định chiều cao 2 dòng
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
            }}>
                {event.tieuDe}
            </h3>

            {/* 3. Thông tin chi tiết (Icon + Text) */}
            <div style={{ flex: 1, marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                    <CalendarOutlined style={{ marginRight: '8px', fontSize: '16px', color: '#8c8c8c' }} />
                    {dateStr}
                </div>
                <div style={{ display: 'flex', alignItems: 'start', color: '#666', fontSize: '14px' }}>
                    <EnvironmentOutlined style={{ marginRight: '8px', fontSize: '16px', color: '#8c8c8c', marginTop: '3px' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.diaDiem}
                    </span>
                </div>
            </div>

            {/* 4. Nút bấm (Light Button Style) */}
            <div style={{ marginTop: 'auto' }}>
                {isEnded ? (
                    <Button block disabled style={{ background: '#f5f5f5', borderColor: 'transparent', color: '#bfbfbf', fontWeight: 500 }}>
                        Đã kết thúc
                    </Button>
                ) : (
                    <Button 
                        block 
                        style={{ 
                            backgroundColor: '#e6f4ff', // Nền xanh nhạt
                            color: '#1677ff',           // Chữ xanh
                            border: 'none', 
                            height: '40px', 
                            fontWeight: 600,
                            borderRadius: '8px',
                            transition: 'all 0.3s'
                        }}
                        // Thêm hiệu ứng hover nhẹ cho nút
                        onMouseEnter={(e) => { e.target.style.backgroundColor = '#bae0ff'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = '#e6f4ff'; }}
                    >
                        Xem chi tiết
                    </Button>
                )}
            </div>
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
    const navigate = useNavigate();
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
        if (sourceEvents.length > 0) {
        console.log("Cấu trúc sự kiện:", sourceEvents[0]);
    }
        if (filterCategory === 'all_cat') {
            setDisplayedEvents(sourceEvents);
        } else {
            setDisplayedEvents(sourceEvents.filter(e => {
                // Lấy ID danh mục từ sự kiện (Kiểm tra cả 2 trường hợp: phẳng hoặc lồng nhau)
                // Backend của bạn trả về 'categoryId', nhưng đề phòng tương lai bạn sửa lại
                const eventCatId = e.categoryId || (e.category ? e.category.id : null);
                
                // So sánh (chuyển về chuỗi để tránh lệch kiểu number/string)
                return String(eventCatId) === String(filterCategory);
            }));
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

    // Hàm helper để tạo URL và Log kiểm tra
    // const getBannerUrl = (imageUrl) => {
    //     if (!imageUrl) return null;
        
    //     // Nếu là link online (http/https) -> Giữ nguyên
    //     if (imageUrl.startsWith('http')) return imageUrl;
        
    //     // Nếu là tên file -> Nối chuỗi
    //     // Loại bỏ dấu / ở đầu tên file nếu có để tránh thành .../uploads//file.png
    //     const cleanImageName = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    //     const finalUrl = `${BE_URL}/${cleanImageName}`;
        
    //     // Mở F12 -> Console để xem dòng này có đúng link bạn test không
    //     // console.log("Banner URL:", finalUrl); 
    //     return finalUrl;
    // };

    return (
        <Layout style={{ minHeight: '100vh', background: '#ffffffff' }}>
            <MyNavbar />

            {/* === 1. HERO SECTION MỚI (SPLIT LAYOUT) === */}
            <div style={{ 
                maxWidth: '1300px', 
                margin: '0 auto', 
                padding: '20px 24px', 
                width: '100%',
                marginBlock: '40px'
            }}>
                <Row gutter={[48, 24]} align="middle">
                    
                    {/* --- CỘT TRÁI: BANNER ĐỘNG --- */}
                    <Col xs={24} lg={14}>
                        {!loading && banners.length > 0 ? (
                            <div style={{ 
                                borderRadius: '24px', 
                                overflow: 'hidden', 
                                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                height: '400px', // Chiều cao cố định cho banner
                                position: 'relative'
                            }}>
                                {/* Tìm đoạn <Carousel ...> cũ và thay thế bằng đoạn này */}
                                <Carousel 
                                    autoplay 
                                    draggable={true}
                                    className="home-banner-carousel"
                                    style={{ height: '100%', background: '#1e293b' }}
                                >
                                    {banners.map((banner) => {
                                        // --- LOGIC XỬ LÝ URL ẢNH (QUAN TRỌNG NHẤT) ---
                                        let imageUrl = banner.imageUrl;
                                        
                                        // Nếu không phải link online, gọi qua API Backend
                                        if (imageUrl && !imageUrl.startsWith('http')) {
                                            // API MỚI: /api/banners/images/{ten_file}
                                            // Lưu ý: port 8080
                                            const cleanName = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
                                            imageUrl = `http://localhost:8080/api/banners/images/${cleanName}`;
                                        }
                                        // ---------------------------------------------

                                        return (
                                            <div key={banner.id} className="home-banner-item" style={{ height: '100%' }}>
                                                <img 
                                                    src={imageUrl} 
                                                    alt="Banner" 
                                                    className="home-banner-img"
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover', 
                                                        display: 'block'
                                                    }}
                                                    onError={(e) => {
                                                        // Nếu lỗi, hiển thị ảnh placeholder
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png";
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </Carousel>
                            </div>
                        ) : (
                            // Placeholder khi chưa có banner
                            <div style={{ height: '450px', background: '#1e293b', borderRadius: '24px' }} />
                        )}
                    </Col>

                    {/* --- CỘT PHẢI: THÔNG TIN & NÚT BẤM --- */}
                    <Col xs={24} lg={10}>
                        <div style={{ paddingLeft: '10px' }}>
                            {/* Tag nhỏ (Optional - có thể bỏ nếu muốn) */}
                            {/* <Tag color="cyan" style={{ marginBottom: 16, padding: '5px 10px', fontSize: '14px', border: 'none', background: 'rgba(56, 189, 248, 0.1)' }}>
                                🎓 Cổng thông tin chính thức
                            </Tag> */}
                            
                            {/* HÀNG 1: Tiêu đề chính */}
                            <Title style={{ 
                                color: '#3b82f6', 
                                fontSize: '28px', 
                                lineHeight: '1', 
                                marginBottom: '8px', // Khoảng cách với hàng 2
                                fontWeight: 700,
                                fontStyle: 'italic'
                            }}>
                                Cổng thông tin sự kiện - chuyên đề
                            </Title>
                            
                            {/* HÀNG 2: Tên Khoa (Màu xanh nổi bật) */}
                            <Title level={2} style={{ 
                                color: '#3b82f6', // Màu xanh dương
                                fontSize: '54px', 
                                marginTop: 0, 
                                marginBottom: '24px', // Khoảng cách với mô tả
                                fontWeight: 800 
                            }}>
                                Khoa Công nghệ & Kỹ thuật
                            </Title>
                            
                            {/* HÀNG 3: Mô tả */}
                            <Typography.Paragraph style={{ 
                                color: '#94a3b8', 
                                fontSize: '18px', 
                                marginBottom: '40px', 
                                lineHeight: '1.6' 
                            }}>
                                Khám phá những cơ hội học tập, kết nối và phát triển bản thân thông qua hàng loạt workshop, hội thảo chuyên sâu và các cuộc thi hấp dẫn dành riêng cho sinh viên.
                            </Typography.Paragraph>

                            {/* Nút hành động & Tìm kiếm */}
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <Button 
                                    type="default" // Đổi thành default để dễ custom style nền trắng
                                    size="large" 
                                    icon={<ArrowRightOutlined />} 
                                    onClick={() => navigate('/events')}
                                    className="btn-outline-custom" // <<< THÊM CLASS NÀY
                                >
                                    Xem tất cả sự kiện
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            

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