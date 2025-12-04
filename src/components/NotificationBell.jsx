import { useEffect, useState } from 'react';
import { Badge, Popover, List, Avatar, Button, Tabs, Empty, Typography } from 'antd';
import { 
    BellOutlined, CalendarOutlined, CheckCircleOutlined, 
    InfoCircleOutlined, UserOutlined, WarningOutlined
} from '@ant-design/icons';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService'; // Đảm bảo bạn đã có service này
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');
const { Text } = Typography;

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications(); // Gọi API
            setNotifications(data);
            const count = data.filter(n => !n.read).length; // Giả sử backend trả về field 'read' hoặc 'isRead'
            setUnreadCount(count);
        } catch (err) {
            console.error("Lỗi tải thông báo", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Tự động refresh mỗi 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleRead = async (item) => {
        if (!item.read) {
            await markNotificationAsRead(item.id);
            fetchNotifications(); 
        }
    };

    const handleReadAll = async () => {
        await markAllNotificationsAsRead();
        fetchNotifications();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircleOutlined />;
            case 'WARNING': return <WarningOutlined />;
            case 'INFO': return <InfoCircleOutlined />;
            default: return <BellOutlined />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'SUCCESS': return '#52c41a';
            case 'WARNING': return '#faad14';
            case 'INFO': return '#1677ff';
            default: return '#1677ff';
        }
    };

    const notificationContent = (
        <div style={{ width: 400, maxHeight: 400, borderRadius: '16px', overflowY: 'auto' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Thông báo</Text>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={handleReadAll} style={{ padding: 0 }}>
                        Đánh dấu đã đọc hết
                    </Button>
                )}
            </div>
            <List
                loading={loading}
                dataSource={notifications}
                renderItem={item => (
                    <List.Item 
                        onClick={() => handleRead(item)}
                        style={{ 
                            padding: '12px 16px', 
                            cursor: 'pointer',
                            background: item.read ? '#fff' : '#e6f7ff',
                            transition: 'background 0.3s'
                        }}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar 
                                    icon={getIcon(item.type)} 
                                    style={{ backgroundColor: getColor(item.type) }} 
                                />
                            }
                            title={<span style={{ fontSize: 13, fontWeight: item.read ? 400 : 600 }}>{item.title}</span>}
                            description={
                                <div>
                                    <div style={{ fontSize: 12, color: '#666' }}>{item.message}</div>
                                    <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{moment(item.createdAt).fromNow()}</div>
                                </div>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: <Empty description="Không có thông báo mới" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            />
        </div>
    );

    return (
        <Popover 
            content={notificationContent} 
            trigger="click" 
            placement="bottomRight"
            overlayInnerStyle={{ padding: 0 }}
        >
            <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: '20px', color: '#555' }} />} />
            </Badge>
        </Popover>
    );
};

export default NotificationBell;