import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';

interface Log {
    id: string;
    action: string;
    details: string;
    createdAt: string;
    user: {
        fullName: string;
        email: string;
        userType: string;
    };
}

const AdminLogs: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(API_ENDPOINTS.admin.logs, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLogs(response.data);
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center`}>
                    <Clock className="mr-2 h-5 w-5" />
                    System Logs
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Action
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                User
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Details
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Timestamp
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.user.fullName}</div>
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{log.user.email}</div>
                                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} capitalize`}>{log.user.userType}</div>
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {log.details}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLogs;
