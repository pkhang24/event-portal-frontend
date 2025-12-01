import React, { createContext, useState, useEffect, useContext } from 'react';
import { getActiveBanners } from '../services/api';

// Tạo Context
const BannerContext = createContext();

// Tạo Provider
export const BannerProvider = ({ children }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hàm tải dữ liệu
    const fetchBanners = async () => {
        try {
            const data = await getActiveBanners();
            
            // === KỸ THUẬT PRELOAD ===
            // Tạo một Promise để tải trước tất cả ảnh
            const preloadPromises = data.map((banner) => {
                return new Promise((resolve, reject) => {
                    const img = new window.Image();
                    img.src = banner.imageUrl;
                    img.onload = resolve; // Ảnh tải xong thì báo OK
                    img.onerror = resolve; // Lỗi cũng báo OK để không chặn app
                });
            });

            // Đợi tất cả ảnh tải xong mới set state
            await Promise.all(preloadPromises);
            
            setBanners(data); // Lúc này ảnh đã nằm trong cache trình duyệt
        } catch (error) {
            console.error("Lỗi tải banner:", error);
        } finally {
            setLoading(false);
        }
    };

    // Tải 1 lần duy nhất khi ứng dụng khởi động
    useEffect(() => {
        fetchBanners();
    }, []);

    // Hàm này để Admin gọi khi cập nhật xong
    const refreshBanners = () => {
        fetchBanners();
    };

    return (
        <BannerContext.Provider value={{ banners, loading, refreshBanners }}>
            {children}
        </BannerContext.Provider>
    );
};

// Hook để các trang khác dễ dàng sử dụng
export const useBanner = () => useContext(BannerContext);