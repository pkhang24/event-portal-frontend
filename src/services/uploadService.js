import axios from 'axios';

// Hàm upload file lên server của mình
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token'); // Lấy token nếu cần

    const response = await axios.post('http://192.168.2.8:8080/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data.url; // Trả về link ảnh (http://.../uploads/abc.jpg)
};