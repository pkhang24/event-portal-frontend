import { useState } from 'react';
import { Button, Col, Row, Select, message, Spin, Card, Space } from 'antd'; // Thêm Space, Card
import { DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { getTopEventStats, getMonthlyEventStats, getTopCategoryStats } from '../../services/adminService';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);
// ---------------------------------------------------------

const { Option } = Select;

const StatisticsTab = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(0); // 0 = Cả năm
    const [loading, setLoading] = useState(false);
    // const [statsData, setStatsData] = useState(null);

    const [eventData, setEventData] = useState(null);      // Top sự kiện
    const [monthlyData, setMonthlyData] = useState(null);  // Thống kê tháng
    const [categoryData, setCategoryData] = useState(null); // Thống kê danh mục

    // Hàm tải báo cáo
    const handleExport = async () => {
        try {
            const response = await api.get('/admin/report/events-excel', {
                responseType: 'blob'
            });

            // Xử lý file tải về
            const blob = response.data
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "bao-cao-su-kien.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            message.success("Xuất báo cáo thành công!");

        } catch (err) {
            console.error("Lỗi khi xuất file:", err);
            message.error("Xuất báo cáo thất bại.");
        }
    };

    // Hàm xem thống kê
    const handleViewStats = async () => {
        setLoading(true);
        try {
            const [topEvents, monthlyEvents, topCats] = await Promise.all([
                getTopEventStats(year, month),
                getMonthlyEventStats(year),
                getTopCategoryStats()
            ]);

            // Dữ liệu Top Sự kiện
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

            // Dữ liệu Sự kiện theo Tháng
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

            // 3. Dữ liệu Top Danh mục
            if (topCats && Object.keys(topCats).length > 0) {
                setCategoryData({
                    labels: Object.keys(topCats),
                    datasets: [{
                        label: 'Lượt tham gia',
                        data: Object.values(topCats),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                        ],
                        borderWidth: 1,
                    }],
                });
            } else setCategoryData(null);

            message.success("Tải thống kê thành công!");
        } catch (err) {
            message.error("Lỗi khi tải thống kê.");
        } finally {
            setLoading(false);
        }
    };

    const optionsCommon = {
        responsive: true,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    };

    return (
        <div style={{ paddingBottom: 20 }}>
            {/* Bộ lọc */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card title="Tùy chọn Báo cáo & Thống kê">
                        <Space wrap>
                            <Select value={year} onChange={setYear} style={{ width: 120 }}>
                                <Option value={2025}>Năm 2025</Option>
                                <Option value={2024}>Năm 2024</Option>
                            </Select>
                            <Select value={month} onChange={setMonth} style={{ width: 120 }}>
                                <Option value={0}>Cả năm</Option>
                                {[...Array(12).keys()].map(i => (<Option key={i+1} value={i+1}>Tháng {i+1}</Option>))}
                            </Select>
                        <Button icon={<BarChartOutlined />} onClick={handleViewStats} loading={loading}>
                            Xem thống kê
                        </Button>
                        <Button icon={<DownloadOutlined />} type="primary" onClick={handleExport}>
                            Xuất Excel Danh sách Sự kiện
                        </Button>
                    </Space>
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ Top Sự Kiện */}
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title={`Top Sự kiện ${month === 0 ? `năm ${year}` : `tháng ${month}/${year}`}`}>
                         {loading ? <Spin /> : eventData ? <Bar data={eventData} options={optionsCommon} /> : <p>Chưa có dữ liệu</p>}
                    </Card>
                </Col>
            </Row>

            {/* Hai biểu đồ nhỏ nằm ngang nhau */}
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                {/* Biểu đồ Tháng */}
                <Col xs={24} md={16}>
                    <Card title={`Số lượng sự kiện theo tháng (Năm ${year})`}>
                        {loading ? <Spin /> : monthlyData ? <Bar data={monthlyData} options={optionsCommon} /> : <p>Chưa có dữ liệu</p>}
                    </Card>
                </Col>
                
                {/* Biểu đồ Tròn: Danh mục */}
                <Col xs={24} md={8}>
                    <Card title="Tỉ lệ tham gia theo Chủ đề">
                        {loading ? <Spin /> : categoryData ? <Pie data={categoryData} /> : <p>Chưa có dữ liệu</p>}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StatisticsTab;