import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, message, List, Avatar, Tag } from 'antd';
import { 
    UserOutlined, CalendarOutlined, CheckCircleOutlined, 
    ArrowUpOutlined, ArrowDownOutlined, BellOutlined, PlusCircleOutlined
} from '@ant-design/icons';
import { getDashboardStats, getTopEventStats } from '../../services/adminService';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardHome = () => {
    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Dữ liệu Mock cho các phần chưa có API
    const recentActivities = [
        { title: 'Nguyễn Văn A đã đăng ký tham gia sự kiện', time: 'Vừa xong', type: 'register' },
        { title: 'Admin đã tạo sự kiện mới', time: '1 giờ trước', type: 'create_event' },
        { title: 'Trần Thị B đăng ký tài khoản', time: '2 giờ trước', type: 'new_user' },
    ];

    const doughnutData = {
        labels: ['Hội thảo', 'Workshop', 'Cuộc thi', 'Khác'],
        datasets: [{
            data: [40, 30, 20, 10],
            backgroundColor: ['#1677ff', '#faad14', '#ff4d4f', '#52c41a'],
            borderWidth: 0,
        }],
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentYear = new Date().getFullYear();

                // === GỌI API VỚI THAM SỐ ĐẦY ĐỦ ===
                const [statsRes, chartRes] = await Promise.all([
                    getDashboardStats(),
                    getTopEventStats(currentYear, 0) // year: nay, month: 0 (cả năm)
                ]);

                setStats(statsRes);
                
                // Xử lý dữ liệu biểu đồ
                // Kiểm tra kỹ cả trường hợp chartRes là mảng hoặc object
                const dataObj = chartRes || {};
                
                if (dataObj && Object.keys(dataObj).length > 0) {
                    setChartData({
                        labels: Object.keys(dataObj),
                        datasets: [{
                            label: 'Lượt đăng ký',
                            data: Object.values(dataObj),
                            backgroundColor: '#1677ff',
                            borderRadius: 4,
                            barThickness: 40,
                        }],
                    });
                }
            } catch (err) { 
                console.error(err);
                message.error("Lỗi tải Dashboard"); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

    const StatCard = ({ title, value, icon, percent }) => (
        <Card bordered={false} style={{ height: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic 
                title={<span style={{ color: '#8c8c8c', fontSize: 14 }}>{title}</span>}
                value={value}
                valueStyle={{ color: '#000', fontWeight: 'bold', fontSize: 24 }}
                prefix={icon}
                suffix={
                    percent !== undefined && (
                        <span style={{ fontSize: 12, color: percent > 0 ? '#52c41a' : '#ff4d4f', marginLeft: 10 }}>
                            {percent > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(percent)}%
                        </span>
                    )
                }
            />
        </Card>
    );

    return (
        <div>
            <h1 style={{ marginBottom: 5, fontSize: 32, fontWeight: 600 }}>Tổng quan hệ thống</h1>
            <p style={{ color: '#8c8c8c', marginBottom: 24 }}>Chào mừng trở lại, Admin!</p>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard title="Tổng người dùng" value={stats.totalUsers} icon={<UserOutlined style={{ color: '#1677ff', background: '#e6f7ff', padding: 8, borderRadius: '50%' }} />} percent={12.5} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard title="Tổng sự kiện" value={stats.totalEvents} icon={<CalendarOutlined style={{ color: '#faad14', background: '#fff7e6', padding: 8, borderRadius: '50%' }} />} percent={5.2} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard title="Lượt đăng ký" value={stats.totalRegistrations} icon={<CheckCircleOutlined style={{ color: '#52c41a', background: '#f6ffed', padding: 8, borderRadius: '50%' }} />} percent={-2.1} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard title="Sự kiện đang mở" value={12} icon={<BellOutlined style={{ color: '#ff4d4f', background: '#fff1f0', padding: 8, borderRadius: '50%' }} />} percent={0} />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Top Sự kiện Hot nhất (Năm nay)" bordered={false} style={{ borderRadius: 8, marginBottom: 16 }}>
                        <div style={{ height: 300 }}>
                            {chartData ? (
                                <Bar 
                                    data={chartData} 
                                    options={{ 
                                        maintainAspectRatio: false, 
                                        plugins: { legend: { display: false } },
                                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                    }} 
                                />
                            ) : (
                                <div style={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', color: '#999'}}>
                                    Chưa có dữ liệu đăng ký nào
                                </div>
                            )}
                        </div>
                    </Card>
                    {/* Bảng sự kiện sắp diễn ra (Giả lập) */}
                    <Card title="Các sự kiện sắp diễn ra" bordered={false} style={{ borderRadius: 8 }}>
                         <List
                            itemLayout="horizontal"
                            dataSource={[
                                { title: 'Workshop AI & Machine Learning', date: '30/07/2024', count: '45/50' },
                                { title: 'Cuộc thi Code Challenge 2024', date: '15/08/2024', count: '112/200' },
                                { title: 'Talkshow: Khởi nghiệp ngành IT', date: '25/08/2024', count: '88/100' },
                            ]}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<a href="#">{item.title}</a>}
                                        description={`Ngày tổ chức: ${item.date}`}
                                    />
                                    <div><Tag color="blue">{item.count} đăng ký</Tag></div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Tỷ lệ các loại sự kiện (Demo)" bordered={false} style={{ borderRadius: 8, marginBottom: 16 }}>
                        <div style={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
                        </div>
                    </Card>
                    <Card title="Hoạt động gần đây (Demo)" bordered={false} style={{ borderRadius: 8 }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={recentActivities}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />}
                                        title={<span style={{ fontSize: 13 }}>{item.title}</span>}
                                        description={<span style={{ fontSize: 12 }}>{item.time}</span>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardHome;