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
        // Không set loading=true ở đây để tránh flash giao diện khi refresh ngầm
        try {
            const data = await getActiveBanners();
            setBanners(data);
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