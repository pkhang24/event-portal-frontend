import { useState, useEffect } from 'react';
import { Card, Radio, message } from 'antd';
import { UnorderedListOutlined, DeleteOutlined } from '@ant-design/icons';
import CategoryManagementTab from '../../components/admin/CategoryManagementTab';
import { 
    getAllCategories, createCategory, updateCategory, softDeleteCategory, // List
    getDeletedCategories, restoreCategory, permanentDeleteCategory // Trash
} from '../../services/adminService';

const AdminCategoriesPage = () => {
    const [view, setView] = useState('list');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = view === 'list' ? await getAllCategories() : await getDeletedCategories();
            console.log("Dữ liệu tải về:", data);
            setCategories(data);
        } catch (err) { message.error("Lỗi tải danh mục"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, [view]);

    const handleSave = async (id, values) => {
        try {
            if (id) await updateCategory(id, values);
            else await createCategory(values);
            message.success(id ? "Cập nhật thành công" : "Tạo mới thành công");
            fetchCategories();
        } catch (err) { 
            message.error(err.response?.data?.message || "Thao tác thất bại");
        }
    };

    const handleDelete = async (id) => {
        try {
            if (view === 'list') {
                await softDeleteCategory(id);
                message.success("Đã chuyển vào thùng rác");
            } else {
                await permanentDeleteCategory(id);
                message.success("Đã xóa vĩnh viễn");
            }
            fetchCategories();
        } catch (err) { message.error("Xóa thất bại"); }
    };

    const handleRestore = async (id) => {
        try { await restoreCategory(id); message.success("Đã khôi phục"); fetchCategories(); }
        catch (e) { message.error("Lỗi khôi phục"); }
    };

    return (
        <Card 
            title={view === 'list' ? "Quản lý Danh mục" : "Thùng rác Danh mục"}
            extra={
                <Radio.Group value={view} onChange={e => setView(e.target.value)} buttonStyle="solid">
                    <Radio.Button value="list"><UnorderedListOutlined /> Danh sách</Radio.Button>
                    <Radio.Button value="trash"><DeleteOutlined /> Thùng rác</Radio.Button>
                </Radio.Group>
            }
        >
            <CategoryManagementTab 
                categories={categories} loading={loading} viewMode={view}
                onSave={handleSave} onDelete={handleDelete} onRestore={handleRestore}
            />
        </Card>
    );
};
export default AdminCategoriesPage;