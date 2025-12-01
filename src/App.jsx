import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FloatButton, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getCurrentUser } from './services/authService';
import { BannerProvider } from './context/BannerContext';

// Import các trang Public / Student / Poster
import MyNavbar from './components/MyNavbar';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import EventDetailPage from './pages/EventDetailPage';
import MyTicketsPage from './pages/MyTicketsPage';
import PosterEventsPage from './pages/PosterEventsPage';
import CheckInPage from './pages/CheckInPage';
import HistoryPage from './pages/HistoryPage';

// Import các trang Admin
import AdminLayout from './components/admin/AdminLayout';
import DashboardHome from './pages/admin/DashboardHome';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage'; 
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  // Kiểm tra xem có đang ở trang Admin không
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleFabClick = () => {
      navigate('/manage-events');
  };

  // Chỉ hiện FAB nếu là Poster và không ở trang quản lý
  const showFab = (user?.role === 'POSTER') 
                  && location.pathname !== '/manage-events'
                  && !isAdminRoute; // Không hiện FAB trong trang Admin

  return (
    <>
      {/* Chỉ hiện MyNavbar ở các trang KHÔNG PHẢI Admin */}
      {/* {!isAdminRoute && <MyNavbar />} */}

      <Routes>
        {/* === CÁC ROUTE PUBLIC / STUDENT / POSTER === */}
        <Route path="/" element={<HomePage />} />

        <Route path="/events" element={<EventsPage />} />

        <Route path="/about" element={<AboutPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/search" element={<SearchPage />} />

        <Route path="/events/:id" element={<EventDetailPage />} />

        <Route path="/my-tickets" element={<MyTicketsPage />} />

        <Route path="/manage-events" element={<PosterEventsPage />} />

        <Route path="/check-in" element={<CheckInPage />} />

        <Route path="/history" element={<HistoryPage />} />

        {/* === CÁC ROUTE ADMIN === */}
        <Route path="/admin" element={<AdminLayout />}>
        
            <Route index element={<DashboardHome />} />
            
            <Route path="users" element={<AdminUsersPage />} />

            <Route path="events" element={<AdminEventsPage />} />
            
            <Route path="categories" element={<AdminCategoriesPage />} />
            
            <Route path="banners" element={<AdminBannersPage />} />

            <Route path="stats" element={<AdminStatsPage />} />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<div>Trang không tồn tại!</div>} />
      </Routes>

      {/* Nút FAB (Floating Action Button) */}
      {showFab && (
          <Tooltip 
            title="Tạo sự kiện mới" 
            placement="left"
            styles={{ body: { padding: '8px 12px', fontSize: '14px' } }}
          >
            <FloatButton
                icon={<PlusOutlined />} 
                type="primary" 
                style={{ 
                    right: 24, 
                    bottom: 85,
                    width: 50,   
                    height: 50,  
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', 
                    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)'
                }}
                className="custom-fab-hover"
                onClick={handleFabClick}
            />
          </Tooltip>
      )}
    </>
  );
}

function App() {
  return (
    <BannerProvider> 
      <Router>
        <AppContent />
      </Router>
    </BannerProvider>
  );
}

export default App;