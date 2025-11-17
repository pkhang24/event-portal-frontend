import api from './api';

// Lấy thống kê Dashboard
export const getDashboardStats = async () => {
    const response = await api.get('/admin/stats');
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

// Duyệt sự kiện
export const approveEvent = async (eventId) => {
    await api.put(`/admin/events/${eventId}/approve`);
};

// Lấy thống kê sự kiện
export const getEventStats = async () => {
    const response = await api.get('/admin/event-stats');
    return response.data;
};

// Lấy tất cả sự kiện (cả draft/published) cho Admin
export const getAllEventsForAdmin = async () => {
    const response = await api.get('/admin/events');
    return response.data;
};

// === API CHO CATEGORY ===
export const getAllCategories = () => {
    return api.get('/admin/categories');
};
export const createCategory = (categoryData) => {
    return api.post('/admin/categories', categoryData);
};
export const updateCategory = (id, categoryData) => {
    return api.put(`/admin/categories/${id}`, categoryData);
};
export const deleteCategory = (id) => {
    return api.delete(`/admin/categories/${id}`);
};

// === API CHO BANNER ===
export const getAllBanners = () => {
    return api.get('/admin/banners');
};
export const createBanner = (bannerData) => {
    return api.post('/admin/banners', bannerData);
};
export const updateBanner = (id, bannerData) => {
    return api.put(`/admin/banners/${id}`, bannerData);
};
export const deleteBanner = (id) => {
    return api.delete(`/admin/banners/${id}`);
};

// --- User Trash ---
export const getDeletedUsers = () => api.get('/admin/users/trash');
export const restoreUser = (id) => api.post(`/admin/users/trash/${id}/restore`);
export const permanentDeleteUser = (id) => api.delete(`/admin/users/trash/${id}/permanent`);

// --- Event Trash ---
export const getDeletedEvents = () => api.get('/admin/events/trash');
export const restoreEvent = (id) => api.post(`/admin/events/trash/${id}/restore`);
export const permanentDeleteEvent = (id) => api.delete(`/admin/events/trash/${id}/permanent`);