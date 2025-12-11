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

export const createEvent = async (formData) => {
    // Lưu ý: formData phải là instance của FormData, không phải object {}
    const response = await api.post('/events', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Làm tương tự cho hàm updateEvent nếu có
export const updateEvent = async (id, formData) => {
    const response = await api.put(`/events/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Xóa mềm (Gọi API DELETE thường -> Backend @SQLDelete tự xử lý)
export const softDeleteEvent = async (eventId) => {
    const response = await api.delete(`/events/${eventId}`); 
    return response.data;
};

// Lấy thùng rác của tôi
export const getMyDeletedEvents = async () => {
    const response = await api.get('/events/my-trash');
    return response.data;
};

// Khôi phục
export const restoreEvent = async (id) => {
    await api.post(`/events/${id}/restore`);
};

// Xóa cứng
export const permanentDeleteEvent = async (id) => {
    await api.delete(`/events/${id}/permanent`);
};

// Lấy danh sách SV tham gia
export const getParticipants = async (eventId) => {
    const response = await api.get(`/events/${eventId}/participants`);
    return response.data;
};