import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, AlertTriangle, X } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';

interface Task {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    client: {
        id: string;
        fullName: string;
        email: string;
    };
}

const AdminTasks: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_ENDPOINTS.admin.getTasks, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(API_ENDPOINTS.admin.deleteTask(taskToDelete.id), {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Task deleted successfully');
            setTasks(tasks.filter(t => t.id !== taskToDelete.id));
            setTaskToDelete(null);
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredTasks = tasks.filter(
        (task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.client.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'open':
                return isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-800';
            case 'in_progress':
                return isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-100 text-blue-800';
            case 'completed':
                return isDark ? 'bg-purple-900/20 text-purple-300' : 'bg-purple-100 text-purple-800';
            case 'pending':
                return isDark ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
            default:
                return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>Task Management</h2>

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Search tasks or clients..."
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
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Title</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Client</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Created At</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                        {filteredTasks.map((task) => (
                            <tr key={task.id}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.client.fullName}</span>
                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{task.client.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(task.status)}`}>
                                        {task.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setTaskToDelete(task)}
                                        className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {taskToDelete && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md p-6 relative`}>
                        <button
                            onClick={() => setTaskToDelete(null)}
                            className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="flex items-center mb-4 text-red-600">
                            <AlertTriangle className="w-8 h-8 mr-3" />
                            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Task</h3>
                        </div>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                            Are you sure you want to delete the task <strong>"{taskToDelete.title}"</strong>? This action cannot be undone and will remove all related applications and requests.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setTaskToDelete(null)}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTask}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTasks;
