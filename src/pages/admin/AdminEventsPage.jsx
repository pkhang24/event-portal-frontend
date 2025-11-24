import { useState, useEffect } from 'react';
import { Card, Radio, message } from 'antd';
import { UnorderedListOutlined, DeleteOutlined } from '@ant-design/icons';
import EventManagementTab from '../../components/admin/EventManagementTab';
import { 
    getAllEventsForAdmin, approveEvent, // List
    getDeletedEvents, restoreEvent, permanentDeleteEvent // Trash
} from '../../services/adminService';
import { softDeleteEvent } from '../../services/eventService';

const AdminEventsPage = () => {
    const [view, setView] = useState('list');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = view === 'list' ? await getAllEventsForAdmin() : await getDeletedEvents();
            console.log("Dữ liệu tải về:", data);
            setEvents(data);
        } catch (err) { message.error("Lỗi tải dữ liệu sự kiện"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEvents(); }, [view]);

    const handleApprove = async (id) => {
        try { await approveEvent(id); message.success("Đã duyệt!"); fetchEvents(); }
        catch (e) { message.error("Lỗi duyệt bài"); }
    };

    const handleDelete = async (id) => {
        try {
            if (view === 'list') {
                await softDeleteEvent(id);
                message.success("Đã chuyển vào thùng rác!");
            } else {
                await permanentDeleteEvent(id);
                message.success("Đã xóa vĩnh viễn!");
            }
            fetchEvents();
        } catch (e) { message.error("Xóa thất bại"); }
    };

    const handleRestore = async (id) => {
        try { await restoreEvent(id); message.success("Đã khôi phục!"); fetchEvents(); }
        catch (e) { message.error("Khôi phục thất bại"); }
    };

    return (
        <Card 
            title={view === 'list' ? "Quản lý Sự kiện" : "Thùng rác Sự kiện"}
            extra={
                <Radio.Group value={view} onChange={e => setView(e.target.value)} buttonStyle="solid">
                    <Radio.Button value="list"><UnorderedListOutlined /> Danh sách</Radio.Button>
                    <Radio.Button value="trash"><DeleteOutlined /> Thùng rác</Radio.Button>
                </Radio.Group>
            }
        >
            <EventManagementTab 
                events={events} loading={loading} viewMode={view}
                onApprove={handleApprove} onDelete={handleDelete} onRestore={handleRestore}
            />
        </Card>
    );
};

export default AdminEventsPage;