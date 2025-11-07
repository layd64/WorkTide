import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, FileText, BarChart2, LogOut, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const AdminLayout: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { logout } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={`flex min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Sidebar */}
            <div className={`w-64 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="p-6">
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{t('adminPanel') || 'Admin Panel'}</h1>
                </div>
                <nav className="mt-6">
                    <Link
                        to="/admin"
                        className={`flex items-center px-6 py-3 ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} ${isActive('/admin') ? isDark ? 'bg-gray-700 border-r-4 border-blue-600' : 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
                    >
                        <BarChart2 className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/users"
                        className={`flex items-center px-6 py-3 ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} ${isActive('/admin/users') ? isDark ? 'bg-gray-700 border-r-4 border-blue-600' : 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
                    >
                        <Users className="w-5 h-5 mr-3" />
                        Users
                    </Link>
                    <Link
                        to="/admin/tasks"
                        className={`flex items-center px-6 py-3 ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} ${isActive('/admin/tasks') ? isDark ? 'bg-gray-700 border-r-4 border-blue-600' : 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
                    >
                        <FileText className="w-5 h-5 mr-3" />
                        Tasks
                    </Link>
                    <Link
                        to="/admin/ratings"
                        className={`flex items-center px-6 py-3 ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} ${isActive('/admin/ratings') ? isDark ? 'bg-gray-700 border-r-4 border-blue-600' : 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
                    >
                        <Star className="w-5 h-5 mr-3" />
                        Ratings
                    </Link>
                    <Link
                        to="/admin/logs"
                        className={`flex items-center px-6 py-3 ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} ${isActive('/admin/logs') ? isDark ? 'bg-gray-700 border-r-4 border-blue-600' : 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
                    >
                        <FileText className="w-5 h-5 mr-3" />
                        Logs
                    </Link>
                    <button
                        onClick={logout}
                        className={`w-full flex items-center px-6 py-3 text-red-600 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} mt-auto`}
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
