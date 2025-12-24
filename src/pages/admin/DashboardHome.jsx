import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, message, List, Avatar, Tag, Typography } from 'antd';
import { 
    UserOutlined, CalendarOutlined, CheckCircleOutlined, 
    ArrowUpOutlined, ArrowDownOutlined, BellOutlined, FormOutlined, 
    ClockCircleOutlined, EnvironmentOutlined, PieChartOutlined,
    BarChartOutlined, HistoryOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/vi';

import { 
    getDashboardStats, 
    getTopEventStats, 
    getTopCategoryStats, 
    getRecentActivities 
} from '../../services/adminService';
import { getPublicEvents } from '../../services/eventService';

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
moment.locale('vi');

const { Text } = Typography;

const DashboardHome = () => {
    const [loading, setLoading] = useState(true);
    
    const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0, totalRegistrations: 0 });
    const [barData, setBarData] = useState(null);
    const [doughnutData, setDoughnutData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [ongoingEvents, setOngoingEvents] = useState([]);

    // --- Tải Thống kê Tổng quan ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsRes = await getDashboardStats();
                setStats(statsRes);
            } catch (err) {
                console.error("Lỗi tải Stats:", err);
            } finally {
                setLoading(false); 
            }
        };
        fetchStats();
    }, []);

    // --- Tải Biểu đồ ---
    useEffect(() => {
        const fetchCharts = async () => {
            try {
                const currentYear = new Date().getFullYear();
                const [topEventsRes, categoryRes] = await Promise.all([
                    getTopEventStats(currentYear, 0),
                    getTopCategoryStats(currentYear, 0)
                ]);

                // Xử lý Biểu đồ Cột
                if (topEventsRes && Object.keys(topEventsRes).length > 0) {
                    setBarData({
                        labels: Object.keys(topEventsRes),
                        datasets: [{
                            label: 'Lượt đăng ký',
                            data: Object.values(topEventsRes),
                            backgroundColor: '#3b82f6',
                            borderRadius: 6,
                            barThickness: 30,
                        }],
                    });
                }

                // Xử lý Biểu đồ Tròn
                if (categoryRes && Object.keys(categoryRes).length > 0) {
                    setDoughnutData({
                        labels: Object.keys(categoryRes),
                        datasets: [{
                            data: Object.values(categoryRes),
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                            borderWidth: 0,
                        }],
                    });
                }
            } catch (err) {
                console.error("Lỗi tải Biểu đồ:", err);
            }
        };
        fetchCharts();
    }, []);

    // --- Tải Hoạt động gần đây ---
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const activitiesRes = await getRecentActivities();
                setActivities(activitiesRes);
            } catch (err) {
                console.error("Lỗi tải Hoạt động:", err);
            }
        };
        fetchActivities();
    }, []);

    // --- Tải Sự kiện đang diễn ra ---
    useEffect(() => {
        const fetchOngoing = async () => {
            try {
                const allEventsRes = await getPublicEvents();
                const now = new Date();
                const activeEvents = allEventsRes.filter(e => 
                    new Date(e.thoiGianBatDau) <= now && new Date(e.thoiGianKetThuc) >= now
                );
                setOngoingEvents(activeEvents);
            } catch (err) {
                console.error("Lỗi tải Sự kiện đang diễn ra:", err);
            }
        };
        fetchOngoing();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '20%', height: '100vh' }}><Spin size="large" /></div>;

    // Config biểu đồ
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
            y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { borderDash: [2, 4] } },
            x: { grid: { display: false } }
        }
    };

    const StatCard = ({ title, value, icon, color }) => (
        <Card bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic 
                title={<span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>{title}</span>}
                value={value}
                valueStyle={{ color: '#1e293b', fontWeight: '700', fontSize: 28, marginTop: 4 }}
                prefix={
                    <div style={{ background: color, color: '#fff', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                        {icon}
                    </div>
                }
            />
        </Card>
    );

    return (
        <div>
            <h2 style={{ marginBottom: 5, fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Tổng quan Dashboard</h2>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Chào mừng quản trị viên quay trở lại.</p>

            {/* THỐNG KÊ */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={8}>
                    <StatCard title="Tổng Người dùng" value={stats.totalUsers} icon={<UserOutlined style={{fontSize: 20}}/>} color="#3b82f6" />
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <StatCard title="Tổng Sự kiện" value={stats.totalEvents} icon={<CalendarOutlined style={{fontSize: 20}}/>} color="#f59e0b" />
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <StatCard title="Lượt đăng ký" value={stats.totalRegistrations} icon={<CheckCircleOutlined style={{fontSize: 20}}/>} color="#10b981" />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* === Biểu đồ & Hoạt động gần đây === */}
                <Col xs={24} lg={16}>
                    {/* Biểu đồ Top Sự kiện */}
                    <Card title={<span><BarChartOutlined style={{color: '#0cdd17ff', marginRight: 8}}/> Sự kiện hàng đầu trong năm</span>} bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
                        <div style={{ height: 300 }}>
                            {barData ? <Bar data={barData} options={chartOptions} /> : 
                            <div style={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', color: '#999'}}>Chưa có dữ liệu</div>}
                        </div>
                    </Card>

                    {/* Hoạt động gần đây */}
                    <Card title={<span><HistoryOutlined style={{color: '#efa544ff', marginRight: 8}}/> Hoạt động gần đây</span>} bordered={false} style={{ borderRadius: 12 }}>
        
                    <div style={{ 
                        height: '200px',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={activities}
                            // pagination={{ pageSize: 5, ... }} 
                            renderItem={item => (
                                <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar 
                                                icon={item.type === 'register' ? <FormOutlined /> : item.type === 'create_event' ? <CalendarOutlined /> : <UserOutlined />} 
                                                style={{ 
                                                    backgroundColor: item.type === 'register' ? '#e0f2fe' : item.type === 'create_event' ? '#fef3c7' : '#dcfce7',
                                                    color: item.type === 'register' ? '#0284c7' : item.type === 'create_event' ? '#d97706' : '#16a34a'
                                                }} 
                                            />
                                        }
                                        title={<span style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</span>}
                                        description={<span style={{ fontSize: 11, color: '#94a3b8' }}>{moment(item.time).fromNow()}</span>}
                                    />
                                </List.Item>
                            )}
                        />
                        {activities.length === 0 && <div style={{color: '#999', textAlign: 'center', padding: 20}}>Chưa có hoạt động nào</div>}
                    </div>
                </Card>
                </Col>

                {/* === Biểu đồ tròn & Sự kiện đang diễn ra === */}
                <Col xs={24} lg={8}>
                    {/* 1. Biểu đồ Tròn */}
                    <Card title={<span><PieChartOutlined style={{color: '#ef44efff', marginRight: 8}}/> Tỷ lệ tham gia theo chủ đề</span>} bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
                        <div style={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                            {doughnutData ? <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }} /> : 
                            <div style={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', color: '#999'}}>Chưa có dữ liệu</div>}
                        </div>
                    </Card>

                    {/* 2. Sự kiện đang diễn ra */}
                    <Card 
                        title={<span><BellOutlined style={{color: '#ef4444', marginRight: 8}}/> Sự kiện đang diễn ra</span>} 
                        bordered={false} 
                        style={{ borderRadius: 12 }}
                    >
                        <div style={{ 
                            height: '300px',
                            overflowY: 'auto',
                            overflowX: 'hidden' 
                        }}>
                            <List
                                itemLayout="vertical"
                                dataSource={ongoingEvents}
                                renderItem={item => (
                                    <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                            <div>
                                                <Link to={`/events/${item.id}`} style={{fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: 4}}>
                                                    {item.tieuDe}
                                                </Link>
                                                <div style={{fontSize: 12, color: '#64748b'}}>
                                                    <EnvironmentOutlined /> {item.diaDiem}
                                                </div>
                                            </div>
                                            <Tag color="processing">Đang mở</Tag>
                                        </div>
                                    </List.Item>
                                )}
                            />
                            {ongoingEvents.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
                                    Không có sự kiện nào
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardHome;