import api from './api';

// Lấy danh sách thông báo
export const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

// Đánh dấu đã đọc 1 cái
export const markNotificationAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
};

// Đánh dấu đã đọc tất cả
export const markAllNotificationsAsRead = async () => {
    await api.put(`/notifications/read-all`);
};