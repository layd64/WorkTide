import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Ban, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface User {
    id: string;
    email: string;
    fullName: string;
    userType: string;
    isBanned: boolean;
    createdAt: string;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredUsers = users.filter(
        (user) =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">User Management</h2>

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{user.userType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px - 2 inline - flex text - xs leading - 5 font - semibold rounded - full ${user.isBanned
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                            } `}
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
                                                    ? 'text-green-600 hover:text-green-900 dark:hover:text-green-400'
                                                    : 'text-red-600 hover:text-red-900 dark:hover:text-red-400'
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
