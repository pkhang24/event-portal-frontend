import api from './api';
import { jwtDecode } from "jwt-decode";

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

// Lấy thông tin user hiện tại từ token (đã lưu trong localStorage)
export const getCurrentUser = () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            return null;
        }

        return decoded;
    } catch (error) {
        return null;
    }
};

// Đăng xuất
export const logout = () => {
    localStorage.removeItem('token');
};