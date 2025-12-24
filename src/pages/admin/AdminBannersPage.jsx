import { useState, useEffect } from 'react';
import { Card, Radio, message } from 'antd';
import { UnorderedListOutlined, DeleteOutlined } from '@ant-design/icons';
import BannerManagementTab from '../../components/admin/BannerManagementTab';
import { 
    getAllBanners, createBanner, updateBanner, softDeleteBanner, // List
    getDeletedBanners, restoreBanner, permanentDeleteBanner // Trash
} from '../../services/adminService';
import { useBanner } from '../../context/BannerContext';

const AdminBannersPage = () => {
    const [view, setView] = useState('list');
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const { refreshBanners } = useBanner();

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const data = view === 'list' ? await getAllBanners() : await getDeletedBanners();
            setBanners(data);
        } catch (err) { message.error("Lỗi tải banner"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBanners(); }, [view]);

    const handleSave = async (id, formData) => {
        try {
            if (id) {
                await updateBanner(id, formData);
            } else {
                await createBanner(formData);
            }

            message.success(id ? "Cập nhật thành công" : "Thêm mới thành công");
            fetchBanners();
            refreshBanners(); 
        } catch (err) { 
            console.error(err);
            message.error("Thất bại. Vui lòng kiểm tra lại server."); 
        }
    };

    const handleDelete = async (id) => {
        try {
            if (view === 'list') {
                await softDeleteBanner(id);
                message.success("Đã chuyển vào thùng rác");
            } else {
                await permanentDeleteBanner(id);
                message.success("Đã xóa vĩnh viễn");
            }
            fetchBanners();
            refreshBanners();
        } catch (err) { message.error("Thất bại"); }
    };

    const handleRestore = async (id) => {
        try { await restoreBanner(id); message.success("Đã khôi phục"); fetchBanners(); refreshBanners(); }
        catch (e) { message.error("Lỗi khôi phục"); }
    };

    return (
        <Card 
            title={view === 'list' ? "Quản lý Banner" : "Thùng rác Banner"}
            extra={
                <Radio.Group value={view} onChange={e => setView(e.target.value)} buttonStyle="solid">
                    <Radio.Button value="list"><UnorderedListOutlined /> Danh sách</Radio.Button>
                    <Radio.Button value="trash"><DeleteOutlined /> Thùng rác</Radio.Button>
                </Radio.Group>
            }
        >
            <BannerManagementTab 
                banners={banners} loading={loading} viewMode={view}
                onSave={handleSave} onDelete={handleDelete} onRestore={handleRestore}
            />
        </Card>
    );
};
export default AdminBannersPage;