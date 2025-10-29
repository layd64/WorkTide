import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';
import { Users, Briefcase, CheckCircle, TrendingUp, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

interface DashboardStats {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    userBreakdown: {
        freelancers: number;
        clients: number;
    };
    taskStatusData: { name: string; value: number }[];
    userGrowthData: { name: string; users: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(API_ENDPOINTS.admin.analytics, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!stats) return <div>Error loading stats</div>;

    const userDistributionData = [
        { name: 'Freelancers', value: stats.userBreakdown.freelancers },
        { name: 'Clients', value: stats.userBreakdown.clients },
    ];

    return (
        <div className="space-y-8">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow flex items-center`}>
                    <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} mr-4`}>
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.totalUsers}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                            {stats.userBreakdown.freelancers} Freelancers, {stats.userBreakdown.clients} Clients
                        </p>
                    </div>
                </div>

                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow flex items-center`}>
                    <div className={`p-3 rounded-full ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'} mr-4`}>
                        <Briefcase className="h-8 w-8" />
                    </div>
                    <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Projects</p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.totalProjects}</p>
                    </div>
                </div>

                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow flex items-center`}>
                    <div className={`p-3 rounded-full ${isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'} mr-4`}>
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Tasks</p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.totalTasks}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
                        <TrendingUp className="mr-2 h-5 w-5" />
                        User Growth (Last 6 Months)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Status Distribution */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
                        <PieChartIcon className="mr-2 h-5 w-5" />
                        Task Status Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.taskStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats.taskStatusData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Distribution Bar Chart */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow lg:col-span-2`}>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
                        <BarChartIcon className="mr-2 h-5 w-5" />
                        User Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend />
                                <Bar dataKey="value" name="Users" fill="#8884d8">
                                    {userDistributionData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#10B981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
