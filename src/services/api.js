import axios from 'axios';

const api = axios.create({
    baseURL: /*'http://localhost:8080/api'*/ 'http://192.168.2.8:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getActiveBanners = async () => {
    const response = await api.get('/banners/active', {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
    return response.data;
};

export default api;

export const getMyProfile = async () => {
    const response = await api.get('/profile/me');
    return response.data;
};

export const updateMyProfile = async (profileData) => {
    const response = await api.put('/profile/me', profileData);
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await api.post('/profile/change-password', passwordData);
    return response.data;
};