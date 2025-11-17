import { useEffect, useState } from 'react';
import { Layout, Typography, Spin, Alert, message, Result, Button } from 'antd';
import { Html5QrcodeScanner } from 'html5-qrcode'; // Import thư viện quét
import MyNavbar from '../components/MyNavbar';
import { checkInTicket } from '../services/registrationService'; // (hoặc ../services/registrationService)

const { Content } = Layout;
const { Title } = Typography;

// ID của div mà camera sẽ gắn vào
const qrcodeRegionId = "html5qr-code-full-region";

const CheckInPage = () => {
    const [scanResult, setScanResult] = useState(null); // Lưu kết quả quét
    const [scanner, setScanner] = useState(null); // Lưu đối tượng scanner
    const [loading, setLoading] = useState(false); // Trạng thái đang gọi API
    const [apiError, setApiError] = useState(null); // Lỗi từ API
    const [apiSuccess, setApiSuccess] = useState(null); // Thông báo thành công từ API

    // Hàm callback khi quét thành công
    const onScanSuccess = async (decodedText, decodedResult) => {
        // Chỉ xử lý lần quét đầu tiên
        if (loading || apiSuccess || apiError) {
            return;
        }

        setLoading(true);
        setApiError(null);
        setApiSuccess(null);
        setScanResult(decodedText); // Hiển thị mã đã quét
        
        try {
            // Gọi API điểm danh
            const response = await checkInTicket(decodedText); 
            
            // Lấy thông tin từ response (ví dụ: tên sinh viên)
            const studentName = response.data?.tenSinhVien || 'Sinh viên';
            setApiSuccess(`Điểm danh thành công cho: ${studentName}`);
            message.success("Điểm danh thành công!");

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Lỗi không xác định";
            if (errorMessage.includes("đã được điểm danh")) {
                 setApiError("Vé này đã được điểm danh TRƯỚC ĐÓ!");
            } else if (errorMessage.includes("không hợp lệ")) {
                 setApiError("Mã vé không hợp lệ hoặc không tồn tại.");
            } else {
                 setApiError(errorMessage);
            }
            message.error("Điểm danh thất bại!");
        } finally {
            setLoading(false);
            // Dừng scanner sau khi quét
            if (scanner) {
                scanner.clear();
            }
        }
    };

    // Hàm callback khi quét lỗi (không phải lỗi API)
    const onScanError = (errorMessage) => {
        // Bỏ qua lỗi "QR code not found" (vì nó hiện liên tục)
    };

    // Khởi động scanner khi component được mount
    useEffect(() => {
        // Chỉ khởi động nếu chưa có scanner và chưa quét xong
        if (!scanner && !apiSuccess && !apiError) {
            const html5QrcodeScanner = new Html5QrcodeScanner(
                qrcodeRegionId, 
                { fps: 10, qrbox: { width: 250, height: 250 } }, // Cấu hình
                false // verbose
            );
            
            html5QrcodeScanner.render(onScanSuccess, onScanError);
            setScanner(html5QrcodeScanner);
        }

        // Cleanup: Dọn dẹp khi component unmount
        return () => {
            if (scanner) {
                scanner.clear().catch(error => {
                    console.error("Failed to clear scanner on unmount", error);
                });
            }
        };
    }, [scanner, apiSuccess, apiError]); // Dependencies

    // Hàm quét lại
    const handleScanAgain = () => {
        setScanResult(null);
        setApiError(null);
        setApiSuccess(null);
        setLoading(false);
        setScanner(null); // Khởi tạo lại scanner
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <MyNavbar />
            <Content style={{ padding: '0 50px', marginTop: 30 }}>
                <div style={{ background: '#fff', padding: 24, minHeight: 380, maxWidth: 600, margin: 'auto' }}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>Quét mã QR Điểm danh</Title>

                    {/* Vùng hiển thị kết quả */}
                    {loading && <div style={{ textAlign: 'center' }}><Spin size="large" /></div>}
                    
                    {apiSuccess && (
                        <Result
                            status="success"
                            title="Điểm danh thành công!"
                            subTitle={apiSuccess}
                            extra={<Button type="primary" onClick={handleScanAgain}>Quét vé tiếp theo</Button>}
                        />
                    )}

                    {apiError && (
                         <Result
                            status="error"
                            title="Điểm danh thất bại!"
                            subTitle={apiError}
                            extra={<Button type="primary" danger onClick={handleScanAgain}>Thử quét lại</Button>}
                        />
                    )}

                    {/* Vùng hiển thị Camera (chỉ hiện khi chưa quét) */}
                    {!apiSuccess && !apiError && (
                        <div id={qrcodeRegionId} style={{ width: '100%', border: '1px solid #ddd' }} />
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default CheckInPage;