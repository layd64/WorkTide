import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, FileText, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Admin Panel</h1>
                </div>
                <nav className="mt-6">
                    <Link
                        to="/admin"
                        className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 ${isActive('/admin') ? 'bg-blue-50 dark:bg-gray-700 border-r-4 border-blue-600' : ''
                            }`}
                    >
                        <BarChart2 className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/users"
                        className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 ${isActive('/admin/users') ? 'bg-blue-50 dark:bg-gray-700 border-r-4 border-blue-600' : ''
                            }`}
                    >
                        <Users className="w-5 h-5 mr-3" />
                        Users
                    </Link>
                    <Link
                        to="/admin/tasks"
                        className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 ${isActive('/admin/tasks') ? 'bg-blue-50 dark:bg-gray-700 border-r-4 border-blue-600' : ''
                            }`}
                    >
                        <FileText className="w-5 h-5 mr-3" />
                        Tasks
                    </Link>
                    <Link
                        to="/admin/logs"
                        className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 ${isActive('/admin/logs') ? 'bg-blue-50 dark:bg-gray-700 border-r-4 border-blue-600' : ''
                            }`}
                    >
                        <FileText className="w-5 h-5 mr-3" />
                        Logs
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mt-auto"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
