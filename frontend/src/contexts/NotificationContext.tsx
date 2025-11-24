import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import axios from 'axios';
import { toast } from 'sonner';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, token } = useAuth();
    const { socket } = useChat();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setNotifications([]);
        }
    }, [user, token]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleNotification = (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            toast(notification.title, {
                description: notification.message,
            });
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, user]);

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(`${API_BASE_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        console.log('Deleting notification:', id);
        try {
            await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Notification deleted successfully');
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, deleteNotification, isLoading }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
