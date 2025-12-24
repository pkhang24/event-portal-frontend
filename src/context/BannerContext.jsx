import React, { createContext, useState, useEffect, useContext } from 'react';
import { getActiveBanners } from '../services/api';

const BannerContext = createContext();

export const BannerProvider = ({ children }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBanners = async () => {
        try {
            const data = await getActiveBanners();

            const preloadPromises = data.map((banner) => {
                return new Promise((resolve, reject) => {
                    const img = new window.Image();
                    img.src = banner.imageUrl;
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            });

            await Promise.all(preloadPromises);
            
            setBanners(data);
        } catch (error) {
            console.error("Lỗi tải banner:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const refreshBanners = () => {
        fetchBanners();
    };

    return (
        <BannerContext.Provider value={{ banners, loading, refreshBanners }}>
            {children}
        </BannerContext.Provider>
    );
};

export const useBanner = () => useContext(BannerContext);