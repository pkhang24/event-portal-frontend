import React, { useState, useEffect } from 'react';

const AdminBannerForm = ({ onSubmit, initialData = null }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || '');

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Hàm xử lý khi chọn ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Tạo URL ảo để xem trước ngay lập tức
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Hàm xóa ảnh đã chọn
    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl('');
    };

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();

        // Dùng FormData để gửi file
        const formData = new FormData();
        formData.append('title', title);
        
        if (selectedFile) {
            formData.append('image', selectedFile); 
        } else if (previewUrl && !selectedFile)

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
                {initialData ? 'Cập nhật Banner' : 'Thêm Banner Mới'}
            </h3>

            {/* Input Tiêu đề */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Banner</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nhập tiêu đề..."
                    required
                />
            </div>

            {/* --- UPLOAD ẢNH --- */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh Banner</label>
                
                {!previewUrl ? (
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer relative">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                    <span>Tải ảnh lên</span>
                                    <input 
                                        id="file-upload" 
                                        name="file-upload" 
                                        type="file" 
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                <p className="pl-1">hoặc kéo thả vào đây</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                        </div>
                        {/* Input phủ lên toàn bộ vùng để dễ click */}
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                    </div>
                ) : (
                    // Preview
                    <div className="relative group w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                            src={previewUrl} 
                            alt="Banner Preview" 
                            className="w-full h-full object-contain"
                        />
                        
                        {/* Nút xóa ảnh / Chọn lại */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 font-medium shadow-lg transform hover:scale-105 transition-transform"
                            >
                                Xóa ảnh
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    {initialData ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
            </div>
        </form>
    );
};

export default AdminBannerForm;