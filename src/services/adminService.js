import api from './api';
import axios from 'axios';

// Lấy thống kê Dashboard
export const getDashboardStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

// Lấy danh sách hoạt động gần đây
export const getRecentActivities = async () => {
    const response = await api.get('/admin/dashboard/activities');
    return response.data;
};

// Lấy danh sách tất cả User
export const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

// Cập nhật role cho User
export const updateUserRole = async (userId, newRole) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
    return response.data;
};

// Tạo User mới
export const createUser = (userData) => {
    return api.post('/admin/users', userData);
};

// Sửa thông tin User
export const updateUser = (userId, userData) => {
    return api.put(`/admin/users/${userId}`, userData);
};

// Xóa mềm User 
export const softDeleteUser = (userId) => {
    return api.delete(`/admin/users/${userId}`); 
};

// Mở khóa/Khoá User
export const toggleUserLock = async (userId) => {
    await api.put(`/admin/users/${userId}/lock`);
};

// Duyệt sự kiện
export const approveEvent = async (eventId) => {
    await api.put(`/admin/events/${eventId}/approve`);
};

// Từ chối sự kiện (PENDING > DRAFT)
export const rejectEvent = async (id, reason = "") => {
    await api.put(`/admin/events/${id}/reject`, { reason });
};

// Hủy sự kiện (PUBLISHED > CANCELLED)
export const cancelEvent = async (id, reason = "") => {
    await api.put(`/admin/events/${id}/cancel`, { reason });
};

// Lấy thống kê sự kiện
export const getEventStats = async () => {
    const response = await api.get('/admin/event-stats');
    return response.data;
};

// Lấy thống kê sự kiện theo top
export const getTopEventStats = async (year, month) => {
    const params = new URLSearchParams();
    params.append('year', year);
    if (month > 0) { // Chỉ thêm 'month' nếu nó khác 0
        params.append('month', month);
    }

    const response = await api.get(`/admin/stats/top-events?${params.toString()}`);
    return response.data;
};

// Lấy thống kê sự kiện theo tháng
export const getMonthlyEventStats = async (year) => {
    const response = await api.get(`/admin/stats/monthly-events?year=${year}`);
    return response.data;
};

// Lấy thống kê theo danh mục
export const getTopCategoryStats = async (year, month) => {
    const params = new URLSearchParams();
    params.append('year', year);
    if (month > 0) params.append('month', month);
    
    const response = await api.get(`/admin/stats/top-categories?${params.toString()}`);
    return response.data;
};

// Lấy tất cả sự kiện (cả draft/published) cho Admin
export const getAllEventsForAdmin = async () => {
    const response = await api.get('/admin/events');
    return response.data;
};

// Tải báo cáo sự kiện dưới dạng file Excel
export const downloadReport = async (year) => {
    return api.get(`/admin/report/events-excel?year=${year}`, {
        responseType: 'blob'
    });
};

// === API CHO CATEGORY ===
export const getAllCategories = async () => {
    const response= await api.get('/admin/categories');
    return response.data;
};
export const createCategory = (categoryData) => {
    return api.post('/admin/categories', categoryData);
};
export const updateCategory = (id, categoryData) => {
    return api.put(`/admin/categories/${id}`, categoryData);
};
export const softDeleteCategory = (id) => {
    return api.delete(`/admin/categories/${id}`);
};

/// API Banner
export const getAllBanners = async () => {
    const response = await api.get('/banners'); 
    return response.data;
};

export const createBanner = (formData) => {
    return api.post('/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const updateBanner = (id, formData) => {
    return api.put(`/banners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const softDeleteBanner = (id) => {
    return api.delete(`/banners/${id}`);
};

// --- User Trash ---
export const getDeletedUsers = async () => {
    const response = await api.get('/admin/users/trash');
    return response.data;
};
export const restoreUser = (id) => api.post(`/admin/users/trash/${id}/restore`);
export const permanentDeleteUser = (id) => api.delete(`/admin/users/trash/${id}/permanent`);

// --- Event Trash ---
export const getDeletedEvents = async () => {
    const response = await api.get('/admin/events/trash');
    return response.data;
};
export const restoreEvent = (id) => api.post(`/admin/events/trash/${id}/restore`);
export const permanentDeleteEvent = (id) => api.delete(`/admin/events/trash/${id}/permanent`);

// --- Category Trash ---
export const getDeletedCategories = async () => {
    const response = await api.get('/admin/categories/trash');
    return response.data;
};
export const restoreCategory = (id) => api.put(`/admin/categories/trash/restore/${id}`);
export const permanentDeleteCategory = (id) => api.delete(`/admin/categories/trash/hard-delete/${id}`);

// --- Banner Trash ---
export const getDeletedBanners = async () => {
    const response = await api.get('/banners/trash');
    return response.data;
};
export const restoreBanner = (id) => api.put(`/banners/trash/restore/${id}`);
export const permanentDeleteBanner = async (id) => api.delete(`/banners/trash/hard-delete/${id}`);