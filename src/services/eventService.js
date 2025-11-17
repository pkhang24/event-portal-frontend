import api from './api';

// Gọi API lấy danh sách sự kiện public
export const getPublicEvents = async (search, status, categoryId) => {
    try {
        // Tạo query params
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (categoryId) params.append('categoryId', categoryId);

        const response = await api.get(`/events?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sự kiện:", error);
        throw error;
    }
};

// Gọi API lấy chi tiết 1 sự kiện
export const getEventDetail = async (id) => {
     try {
        const response = await api.get(`/events/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sự kiện:", error);
        throw error;
    }
}

// Lấy sự kiện của Poster
export const getMyEvents = async () => {
    const response = await api.get('/events/my-events');
    return response.data;
};

// Thêm hàm lấy categories
export const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

// Tạo sự kiện mới
export const createEvent = async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
};

// Cập nhật sự kiện
export const updateEvent = async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
};

// Xóa mềm sự kiện (cho Poster hoặc Admin)
export const softDeleteEvent = async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
};

// Lấy danh sách SV tham gia
export const getParticipants = async (eventId) => {
    const response = await api.get(`/events/${eventId}/participants`);
    return response.data;
};