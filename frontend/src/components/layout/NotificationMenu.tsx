import React, { useRef, useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const NotificationMenu: React.FC = () => {
    const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (id: string, isRead: boolean) => {
        if (!isRead) {
            await markAsRead(id);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1 rounded-full focus:outline-none relative ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Notifications"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className={`absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ${isDark ? 'ring-gray-800' : 'ring-white'} bg-red-500 transform translate-x-1/2 -translate-y-1/2`}></span>
                )}
            </button>

            {isOpen && (
                <div className={`origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg ${isDark ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden`}>
                    <div className={`py-2 px-4 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className={`py-4 px-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative group px-4 py-3 border-b last:border-0 ${isDark ? 'hover:bg-gray-600 border-gray-600' : 'hover:bg-gray-50 border-gray-100'} ${!notification.isRead ? isDark ? 'bg-blue-900/20' : 'bg-blue-50' : ''}`}
                                >
                                    <div
                                        className="cursor-pointer pr-6"
                                        onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm ${!notification.isRead ? isDark ? 'font-semibold text-white' : 'font-semibold text-gray-900' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </p>
                                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap ml-2`}>
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1 line-clamp-2`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Delete button clicked for:', notification.id);
                                            deleteNotification(notification.id);
                                        }}
                                        className="absolute top-3 right-2 p-1 text-gray-400 hover:text-red-500 z-10"
                                        title="Delete notification"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationMenu;
