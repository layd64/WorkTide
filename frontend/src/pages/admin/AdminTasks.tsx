import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, AlertTriangle, X } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
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
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
            case 'completed':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Task Management</h2>

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Search tasks or clients..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTasks.map((task) => (
                            <tr key={task.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{task.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-white">{task.client.fullName}</span>
                                        <span className="text-xs text-gray-500">{task.client.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(task.status)}`}>
                                        {task.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setTaskToDelete(task)}
                                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setTaskToDelete(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="flex items-center mb-4 text-red-600">
                            <AlertTriangle className="w-8 h-8 mr-3" />
                            <h3 className="text-xl font-semibold">Delete Task</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete the task <strong>"{taskToDelete.title}"</strong>? This action cannot be undone and will remove all related applications and requests.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setTaskToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
