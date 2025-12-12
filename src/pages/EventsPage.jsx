import { useEffect, useState } from 'react';
import { Layout, Row, Col, Spin, Alert, Typography, Select, Input, Empty, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import MyNavbar from '../components/MyNavbar';
import MyFooter from '../components/MyFooter';
import { getPublicEvents, getCategories } from '../services/eventService';
import { CardComponent } from './HomePage'; // Tái sử dụng Card từ HomePage

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const EventsPage = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // State bộ lọc
    const [searchText, setSearchText] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, ongoing, ended

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12; // Số sự kiện mỗi trang

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [catRes, eventsRes] = await Promise.all([
                    getCategories(),
                    getPublicEvents()
                ]);
                setCategories(catRes);
                setAllEvents(eventsRes);
                setFilteredEvents(eventsRes);
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Logic Lọc và Sắp xếp dữ liệu
    useEffect(() => {
        let result = [...allEvents];
        const now = new Date();

        // 1. Các bộ lọc (Giữ nguyên logic cũ của bạn)
        if (searchText) {
            result = result.filter(e => e.tieuDe.toLowerCase().includes(searchText.toLowerCase()));
        }

        // SỬA ĐOẠN NÀY
        if (filterCategory !== 'all') {
            result = result.filter(e => {
                // Lấy ID từ categoryId (phẳng) hoặc category.id (lồng nhau) để an toàn
                const eventCatId = e.categoryId || (e.category ? e.category.id : null);
                
                // So sánh chuỗi để tránh lệch kiểu number/string
                return String(eventCatId) === String(filterCategory);
            });
        }
        
        if (filterStatus === 'ongoing') {
            result = result.filter(e => new Date(e.thoiGianBatDau) <= now && new Date(e.thoiGianKetThuc) >= now);
        } else if (filterStatus === 'upcoming') {
            result = result.filter(e => new Date(e.thoiGianBatDau) > now);
        } else if (filterStatus === 'ended') {
            result = result.filter(e => new Date(e.thoiGianKetThuc) < now);
        }

        // 2. === SẮP XẾP (SORTING) - LOGIC MỚI ===
        // Thứ tự ưu tiên: Đang diễn ra (1) -> Sắp diễn ra (2) -> Đã kết thúc (3)
        result.sort((a, b) => {
            const getPriority = (event) => {
                const start = new Date(event.thoiGianBatDau);
                const end = new Date(event.thoiGianKetThuc);
                
                if (end < now) return 3; // Đã kết thúc (Ưu tiên thấp nhất)
                if (start <= now && end >= now) return 1; // Đang diễn ra (Ưu tiên cao nhất)
                return 2; // Sắp diễn ra (Ưu tiên nhì)
            };

            const priorityA = getPriority(a);
            const priorityB = getPriority(b);

            // Nếu khác độ ưu tiên, sắp xếp theo độ ưu tiên (1 -> 2 -> 3)
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // Nếu cùng độ ưu tiên, sắp xếp theo thời gian bắt đầu (Cái nào gần nhất/mới nhất lên đầu)
            // Với "Sắp diễn ra": Ngày gần nhất lên đầu (ASC)
            // Với "Đã kết thúc" hoặc "Đang diễn ra": Có thể muốn cái mới nhất lên đầu
            return new Date(a.thoiGianBatDau) - new Date(b.thoiGianBatDau);
        });
        // ========================================

        setFilteredEvents(result);
        setCurrentPage(1); 
    }, [searchText, filterCategory, filterStatus, allEvents]);
    
    // Logic Phân trang
    const startIndex = (currentPage - 1) * pageSize;
    const currentEvents = filteredEvents.slice(startIndex, startIndex + pageSize);

    return (
        <Layout style={{ minHeight: '100vh', background: '#ffffffff' }}>
            <MyNavbar />
            
            <Content style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', width: '100%' }}>
                
                {/* Header của trang */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Title level={1}>Khám phá Sự kiện</Title>
                    <p style={{ color: '#666' }}>Tìm kiếm và tham gia các hoạt động bổ ích từ Khoa</p>
                </div>

                {/* Thanh Bộ Lọc (Filter Bar) */}
                <div style={{ 
                    background: '#ffffffff', padding: '20px', borderRadius: '12px', 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.10)', marginBottom: 30,
                    display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'
                }}>
                    {/* Tìm kiếm */}
                    <Input 
                        placeholder="Nhập tên sự kiện..." 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                        style={{ width: 300 }}
                        size="large"
                        allowClear
                        onChange={e => setSearchText(e.target.value)}
                    />

                    {/* Lọc Danh mục */}
                    <Select 
                        defaultValue="all" 
                        size="large" 
                        style={{ width: 200 }}
                        onChange={setFilterCategory}
                    >
                        <Option value="all">Tất cả danh mục</Option>
                        {categories.map(cat => (
                            <Option key={cat.id} value={cat.id}>{cat.tenDanhMuc}</Option>
                        ))}
                    </Select>

                    {/* Lọc Trạng thái */}
                    <Select 
                        defaultValue="all" 
                        size="large" 
                        style={{ width: 200 }} 
                        onChange={setFilterStatus}
                        suffixIcon={<FilterOutlined />}
                    >
                        <Option value="all">Tất cả thời gian</Option>
                        <Option value="upcoming">Sắp diễn ra</Option>
                        <Option value="ongoing">Đang diễn ra</Option>
                        <Option value="ended">Đã kết thúc</Option>
                    </Select>
                </div>

                {/* Danh sách kết quả */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
                ) : (
                    <>
                        {filteredEvents.length === 0 ? (
                            <Empty description="Không tìm thấy sự kiện nào phù hợp" />
                        ) : (
                            <>
                                <Row gutter={[24, 24]}>
                                    {currentEvents.map(event => (
                                        <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                                            <CardComponent event={event} />
                                        </Col>
                                    ))}
                                </Row>
                                
                                {/* Phân trang */}
                                <div style={{ marginTop: 40, textAlign: 'center' }}>
                                    <Pagination 
                                        current={currentPage} 
                                        total={filteredEvents.length} 
                                        pageSize={pageSize}
                                        onChange={setCurrentPage}
                                        showSizeChanger={false}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </Content>

            <MyFooter />
        </Layout>
    );
};

export default EventsPage;