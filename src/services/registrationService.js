import api from './api';

// Hủy đăng ký vé
export const cancelRegistration = async (registrationId) => {
    await api.delete(`/registrations/${registrationId}`);
};

// API để điểm danh
export const checkInTicket = (ticketCode) => {
    return api.post('/registrations/check-in', { ticketCode });
};

// Lấy lịch sử tham gia
export const getMyHistory = async () => {
    const response = await api.get('/registrations/history');
    return response.data;
};