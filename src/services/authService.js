import api from './api';
import { jwtDecode } from "jwt-decode"; // Thư viện để đọc thông tin từ token

// API Đăng nhập
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

// API Đăng ký
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
}

// Hàm tiện ích: Lấy thông tin user hiện tại từ token (đã lưu trong localStorage)
export const getCurrentUser = () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        // Giải mã token để lấy thông tin (email, role, exp...)
        const decoded = jwtDecode(token);
        
        // Kiểm tra xem token còn hạn không
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem('token'); // Xóa token hết hạn
            return null;
        }

        return decoded; // Trả về object chứa thông tin user
    } catch (error) {
        return null;
    }
};

// Hàm tiện ích: Đăng xuất
export const logout = () => {
    localStorage.removeItem('token');
};