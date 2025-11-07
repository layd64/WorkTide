import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Ban, CheckCircle, Bell, X } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    fullName: string;
    userType: string;
    isBanned: boolean;
    createdAt: string;
}

const AdminUsers: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [sendingNotification, setSendingNotification] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_ENDPOINTS.admin.users, {
                headers: { Authorization: `Bearer ${token} ` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanToggle = async (userId: string, isBanned: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const url = isBanned
                ? API_ENDPOINTS.admin.unbanUser(userId)
                : API_ENDPOINTS.admin.banUser(userId);

            await axios.post(url, {}, {
                headers: { Authorization: `Bearer ${token} ` },
            });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error(`Error ${isBanned ? 'unbanning' : 'banning'} user: `, error);
        }
    };

    const handleOpenNotificationModal = (user: User) => {
        setSelectedUser(user);
        setShowNotificationModal(true);
        setNotificationTitle('');
        setNotificationMessage('');
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setSendingNotification(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(API_ENDPOINTS.admin.sendNotification, {
                userId: selectedUser.id,
                title: notificationTitle,
                message: notificationMessage,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(`Notification sent to ${selectedUser.fullName}`);
            setShowNotificationModal(false);
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Failed to send notification');
        } finally {
            setSendingNotification(false);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>User Management</h2>

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Name</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Role</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.fullName}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} capitalize`}>{user.userType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBanned
                                            ? isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-800'
                                            : isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-800'
                                            }`}
                                    >
                                        {user.isBanned ? 'Banned' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleBanToggle(user.id, user.isBanned)}
                                        disabled={user.userType === 'admin'}
                                        className={`flex items-center ${user.userType === 'admin'
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : user.isBanned
                                                ? isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'
                                                : isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                            }`}
                                    >
                                        {user.isBanned ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-1" /> Unban
                                            </>
                                        ) : (
                                            <>
                                                <Ban className="w-4 h-4 mr-1" /> Ban
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleOpenNotificationModal(user)}
                                        className={`flex items-center ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'} ml-4`}
                                    >
                                        <Bell className="w-4 h-4 mr-1" /> Notify
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Notification Modal */}
            {showNotificationModal && selectedUser && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowNotificationModal(false)}></div>
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md p-6 relative z-10`}>
                        <button
                            onClick={() => setShowNotificationModal(false)}
                            className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                            Send Notification to {selectedUser.fullName}
                        </h3>
                        <form onSubmit={handleSendNotification}>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                    Message
                                </label>
                                <textarea
                                    value={notificationMessage}
                                    onChange={(e) => setNotificationMessage(e.target.value)}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowNotificationModal(false)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingNotification}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                                >
                                    {sendingNotification ? 'Sending...' : 'Send Notification'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
