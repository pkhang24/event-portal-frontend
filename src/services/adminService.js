import api from './api';

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

// Tạo User mới (API này bạn đã tạo ở backend)
export const createUser = (userData) => {
    return api.post('/admin/users', userData);
};

// Sửa thông tin User (API vừa tạo)
export const updateUser = (userId, userData) => {
    return api.put(`/admin/users/${userId}`, userData);
};

// Xóa mềm User (API này đã có, gọi vào /api/admin/users/{id} là sai, phải gọi API chung)
// Hãy sửa lại API backend cho việc xóa mềm User nếu bạn chưa có
// Giả sử API xóa mềm user là: DELETE /api/admin/users/{id}
export const softDeleteUser = (userId) => {
    // API này chúng ta đã tạo ở Backend (Step 1.1)
    // Nó dùng annotation @SQLDelete nên chỉ cần gọi DELETE là tự động soft-delete
    return api.delete(`/admin/users/${userId}`); 
};

export const toggleUserLock = async (userId) => {
    await api.put(`/admin/users/${userId}/lock`);
};

// Duyệt sự kiện
export const approveEvent = async (eventId) => {
    await api.put(`/admin/events/${eventId}/approve`);
};

// Lấy thống kê sự kiện
export const getEventStats = async () => {
    const response = await api.get('/admin/event-stats');
    return response.data;
};

export const getTopEventStats = async (year, month) => {
    // Tạo query params
    const params = new URLSearchParams();
    params.append('year', year);
    if (month > 0) { // Chỉ thêm 'month' nếu nó khác 0 (Cả năm)
        params.append('month', month);
    }

    // Gọi API
    const response = await api.get(`/admin/stats/top-events?${params.toString()}`);
    return response.data;
};

export const getMonthlyEventStats = async (year) => {
    const response = await api.get(`/admin/stats/monthly-events?year=${year}`);
    return response.data;
};

export const getTopCategoryStats = async (year, month) => {
    const params = new URLSearchParams();
    params.append('year', year);
    if (month > 0) params.append('month', month);
    
    // Gọi API với params
    const response = await api.get(`/admin/stats/top-categories?${params.toString()}`);
    return response.data;
};

// Lấy tất cả sự kiện (cả draft/published) cho Admin
export const getAllEventsForAdmin = async () => {
    const response = await api.get('/admin/events');
    return response.data;
};

// adminService.js
// API này trả về BLOB (File)
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

// === API CHO BANNER ===
export const getAllBanners = async () => {
    const response = await api.get('/admin/banners');
    return response.data;
};
export const createBanner = (bannerData) => {
    return api.post('/admin/banners', bannerData);
};
export const updateBanner = (id, bannerData) => {
    return api.put(`/admin/banners/${id}`, bannerData);
};
export const softDeleteBanner = (id) => {
    return api.delete(`/admin/banners/${id}`);
};

// --- User Trash ---
export const getDeletedUsers = async () => {
    const response = await api.get('/admin/users/trash');
    return response.data; // <--- Phải chắc chắn có .data
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
    const response = await api.get('/admin/banners/trash');
    return response.data;
};
export const restoreBanner = (id) => api.put(`/admin/banners/trash/restore/${id}`);
export const permanentDeleteBanner = async (id) => api.delete(`/admin/banners/trash/hard-delete/${id}`);