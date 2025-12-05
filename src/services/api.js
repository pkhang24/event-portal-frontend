import axios from 'axios';

const api = axios.create({
    baseURL: /*'http://localhost:8080/api'*/ 'http://192.168.2.8:8080/api', // Địa chỉ backend của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động thêm token vào header nếu có
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Chúng ta sẽ lưu token vào localStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm hàm này vào service của bạn
export const getActiveBanners = async () => {
    const response = await api.get('/banners/active', {
        // Thêm các header này để yêu cầu KHÔNG CACHE
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
    return response.data;
};

export default api;

// Lấy thông tin profile
export const getMyProfile = async () => {
    const response = await api.get('/profile/me');
    return response.data;
};

// Cập nhật profile
export const updateMyProfile = async (profileData) => {
    const response = await api.put('/profile/me', profileData);
    return response.data;
};

// Hàm đổi mật khẩu
export const changePassword = async (passwordData) => {
    // passwordData là object: { oldPassword, newPassword }
    const response = await api.post('/profile/change-password', passwordData);
    return response.data;
};