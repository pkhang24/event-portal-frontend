import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FloatButton, Tooltip } from 'antd'; // Import thêm Tooltip
import { PlusOutlined } from '@ant-design/icons';
import { getCurrentUser } from './services/authService';

// Import các trang (pages) và components của bạn
import MyNavbar from './components/MyNavbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import EventDetailPage from './pages/EventDetailPage';
import MyTicketsPage from './pages/MyTicketsPage';
import PosterEventsPage from './pages/PosterEventsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CheckInPage from './pages/CheckInPage';
import HistoryPage from './pages/HistoryPage';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleFabClick = () => {
      navigate('/manage-events');
  };

  const showFab = (user?.role === 'POSTER') 
                  && location.pathname !== '/manage-events';

  return (
    <>
      {/* <MyNavbar />  */}

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/search" element={<SearchPage />} />

        <Route path="/events/:id" element={<EventDetailPage />} />

        <Route path="/my-tickets" element={<MyTicketsPage />} />

        <Route path="/manage-events" element={<PosterEventsPage />} />

        <Route path="/admin" element={<AdminDashboardPage />} />

        <Route path="/check-in" element={<CheckInPage />} />

        <Route path="/history" element={<HistoryPage />} />

        <Route path="*" element={<div>Trang không tồn tại!</div>} />
      </Routes>

      {/* Nút FAB (Floating Action Button) */}
      {showFab && (
          // === BỌC TRONG TOOLTIP RIÊNG ===
          <Tooltip 
            title="Tạo sự kiện mới" 
            placement="left" // Đặt tooltip sang trái để không bị che
            styles={{ 
                body: { 
                    padding: '8px 12px', 
                    fontSize: '14px' 
                } 
            }} // Style cho tooltip
          >
            <FloatButton 
                icon={<PlusOutlined style={{ fontSize: '20px' }} />} 
                type="primary" 
                
                style={{ 
                    right: 30, 
                    bottom: 50,
                    width: 60,   
                    height: 60,  
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Thêm box-shadow mặc định để nó trông nổi bật ngay cả khi không hover
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', 
                    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)' // Đảm bảo transition mượt mà
                }}
                className="custom-fab-hover" // Giữ lại class này
                onClick={handleFabClick}
            />
          </Tooltip>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;