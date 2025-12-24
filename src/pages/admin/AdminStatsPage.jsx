import { useState } from 'react';
import { Button, Col, Row, Select, message, Spin, Card, Space } from 'antd';
import { DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { getTopEventStats, getMonthlyEventStats, getTopCategoryStats, downloadReport } from '../../services/adminService';
import api from '../../services/api';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend, ArcElement);

const { Option } = Select;

const AdminStatsPage = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(0); 
    const [loading, setLoading] = useState(false);
    
    const [eventData, setEventData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [categoryData, setCategoryData] = useState(null);

    const handleExport = async () => {
        try {
            // Gọi API với year hiện tại
            // Cách 1: Dùng Service (Khuyên dùng)
            // const response = await downloadReport(year);
            
            // Cách 2: Gọi trực tiếp như code cũ của bạn
            const response = await api.get(`/admin/report/events-excel?year=${year}`, { 
                responseType: 'blob' 
            });

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Bao_cao_thong_ke_${year}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            message.success("Xuất báo cáo thành công!");
        } catch (err) {
            message.error("Xuất báo cáo thất bại.");
        }
    };

    const handleViewStats = async () => {
        setLoading(true);
        try {
            const [topEvents, monthlyEvents, topCats] = await Promise.all([
                getTopEventStats(year, month),
                getMonthlyEventStats(year),
                getTopCategoryStats(year, month)
            ]);

            if (topEvents && Object.keys(topEvents).length > 0) {
                setEventData({
                    labels: Object.keys(topEvents),
                    datasets: [{
                        label: 'Lượt đăng ký',
                        data: Object.values(topEvents),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    }],
                });
            } else setEventData(null);

            if (monthlyEvents) {
                setMonthlyData({
                    labels: Object.keys(monthlyEvents).map(m => `Tháng ${m}`),
                    datasets: [{
                        label: 'Số sự kiện',
                        data: Object.values(monthlyEvents),
                        backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                    }],
                });
            }

            if (topCats && Object.keys(topCats).length > 0) {
                setCategoryData({
                    labels: Object.keys(topCats),
                    datasets: [{
                        label: 'Lượt tham gia',
                        data: Object.values(topCats),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)',
                        ],
                        borderWidth: 1,
                    }],
                });
            } else setCategoryData(null);
            message.success("Tải thống kê thành công!");
        } catch (err) { message.error("Lỗi khi tải thống kê."); } 
        finally { setLoading(false); }
    };

    const optionsCommon = { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>Báo cáo & Thống kê chi tiết</h2>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card title="Bộ lọc & Xuất báo cáo">
                        <Space wrap>
                            <Select value={year} onChange={setYear} style={{ width: 120 }}>
                                <Option value={2025}>Năm 2025</Option>
                                <Option value={2024}>Năm 2024</Option>
                            </Select>
                            <Select value={month} onChange={setMonth} style={{ width: 120 }}>
                                <Option value={0}>Cả năm</Option>
                                {[...Array(12).keys()].map(i => (<Option key={i+1} value={i+1}>Tháng {i+1}</Option>))}
                            </Select>
                            <Button type="primary" icon={<BarChartOutlined />} onClick={handleViewStats} loading={loading}>
                                Xem thống kê
                            </Button>
                            <Button icon={<DownloadOutlined />} onClick={handleExport}>
                                Xuất Excel
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title={`Top Sự kiện ${month === 0 ? `năm ${year}` : `tháng ${month}/${year}`}`}>
                         {loading ? <div style={{textAlign:'center'}}><Spin /></div> : 
                         eventData ? <Bar data={eventData} options={optionsCommon} /> : <p>Chưa có dữ liệu</p>}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col xs={24} md={16}>
                    <Card title={`Số lượng sự kiện theo tháng (Năm ${year})`}>
                        {loading ? <div style={{textAlign:'center'}}><Spin /></div> : 
                        monthlyData ? <Bar data={monthlyData} options={optionsCommon} /> : <p>Chưa có dữ liệu</p>}
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Tỉ lệ tham gia theo Chủ đề">
                        {loading ? <div style={{textAlign:'center'}}><Spin /></div> : 
                        categoryData ? <Pie data={categoryData} /> : <p>Chưa có dữ liệu</p>}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminStatsPage;