import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDropdown } from '../../contexts/DropdownContext';
import Avatar from '../Avatar';
import {
    Bars3Icon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    SunIcon,
    MoonIcon
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { isDropdownOpen, setDropdownOpen, toggleDropdown } = useDropdown();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setDropdownOpen]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setDropdownOpen(false);
    }, [location, setDropdownOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400';
    };

    console.log('Navbar render. isDropdownOpen:', isDropdownOpen, 'isMobileMenuOpen:', isMobileMenuOpen);

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm fixed w-full z-50 top-0 left-0 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">WorkTide</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/find-work" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/find-work')}`}>
                                {t('findWork') || 'Find Work'}
                            </Link>
                            <Link to="/find-freelancers" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/find-freelancers')}`}>
                                {t('findFreelancers') || 'Find Freelancers'}
                            </Link>
                            {user && (
                                <>
                                    <Link to="/my-tasks" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/my-tasks')}`}>
                                        {t('myTasks') || 'My Tasks'}
                                    </Link>
                                    <Link to="/my-applications" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/my-applications')}`}>
                                        {t('myApplications') || 'My Applications'}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                        </button>

                        {user ? (
                            <>
                                <Link to="/chat" className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none relative">
                                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                                    {/* Notification badge could go here */}
                                </Link>

                                <div className="ml-3 relative" ref={dropdownRef}>
                                    <div>
                                        <button
                                            onClick={() => {
                                                console.log('Toggling dropdown');
                                                toggleDropdown();
                                            }}
                                            className="bg-white dark:bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                                            id="user-menu-button"
                                            aria-expanded={isDropdownOpen}
                                            aria-haspopup="true"
                                        >
                                            <span className="sr-only">Open user menu</span>
                                            <Avatar
                                                fullName={user.fullName}
                                                imageUrl={user.imageUrl}
                                                className="h-8 w-8"
                                            />
                                        </button>
                                    </div>

                                    {isDropdownOpen && (
                                        <div
                                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                                            role="menu"
                                            aria-orientation="vertical"
                                            aria-labelledby="user-menu-button"
                                            tabIndex={-1}
                                        >
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
                                                <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{user.fullName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                            </div>
                                            {user.userType === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center font-semibold"
                                                    role="menuitem"
                                                    tabIndex={-1}
                                                    id="user-menu-item-admin"
                                                >
                                                    <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                                                    {t('adminPanel') || 'Admin Panel'}
                                                </Link>
                                            )}
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                                role="menuitem"
                                                tabIndex={-1}
                                                id="user-menu-item-0"
                                            >
                                                <UserCircleIcon className="mr-2 h-4 w-4" />
                                                {t('profile') || 'Profile'}
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                                role="menuitem"
                                                tabIndex={-1}
                                                id="user-menu-item-1"
                                            >
                                                <Cog6ToothIcon className="mr-2 h-4 w-4" />
                                                {t('settings') || 'Settings'}
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                                role="menuitem"
                                                tabIndex={-1}
                                                id="user-menu-item-2"
                                            >
                                                <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                                                {t('logout') || 'Sign out'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    {t('login') || 'Log in'}
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    {t('signup') || 'Sign up'}
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden" id="mobile-menu">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            to="/find-work"
                            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location.pathname === '/find-work'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                                : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white'
                                }`}
                        >
                            {t('findWork') || 'Find Work'}
                        </Link>
                        <Link
                            to="/find-freelancers"
                            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location.pathname === '/find-freelancers'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                                : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white'
                                }`}
                        >
                            {t('findFreelancers') || 'Find Freelancers'}
                        </Link>
                        {user && (
                            <>
                                <Link
                                    to="/my-tasks"
                                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location.pathname === '/my-tasks'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white'
                                        }`}
                                >
                                    {t('myTasks') || 'My Tasks'}
                                </Link>
                                <Link
                                    to="/my-applications"
                                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location.pathname === '/my-applications'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white'
                                        }`}
                                >
                                    {t('myApplications') || 'My Applications'}
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                        {user ? (
                            <>
                                <div className="flex items-center px-4">
                                    <div className="flex-shrink-0">
                                        <Avatar
                                            fullName={user.fullName}
                                            imageUrl={user.imageUrl}
                                            className="h-10 w-10"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800 dark:text-white">{user.fullName}</div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className="ml-auto flex-shrink-0 bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                                    </button>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        {t('profile') || 'Profile'}
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        {t('settings') || 'Settings'}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        {t('logout') || 'Sign out'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="mt-3 space-y-1 px-4">
                                <Link
                                    to="/login"
                                    className="block text-center w-full px-4 py-2 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                                >
                                    {t('login') || 'Log in'}
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block text-center w-full mt-2 px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    {t('signup') || 'Sign up'}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Debug Breakpoint Indicator */}
            <div className="fixed bottom-0 right-0 bg-red-500 text-white p-2 z-[9999] opacity-75 pointer-events-none">
                <span className="block sm:hidden">XS (Mobile)</span>
                <span className="hidden sm:block md:hidden">SM</span>
                <span className="hidden md:block lg:hidden">MD</span>
                <span className="hidden lg:block xl:hidden">LG</span>
                <span className="hidden xl:block">XL</span>
            </div>
        </nav>
    );
};

export default Navbar;
