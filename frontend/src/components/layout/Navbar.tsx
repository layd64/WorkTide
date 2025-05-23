import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDropdown } from '../../contexts/DropdownContext';
import Avatar from '../../components/Avatar';
import { Bars3Icon, SunIcon, MoonIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { isDropdownOpen, setDropdownOpen, toggleDropdown } = useDropdown();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Apply white background style conditionally based on the theme
  const navbarStyle = theme === 'light' ? { backgroundColor: 'white' } : {};
  const dropdownStyle = theme === 'light' ? { backgroundColor: 'white' } : {};

  return (
    <nav
      className="bg-white dark:bg-gray-800 shadow fixed top-0 w-full z-10"
      style={navbarStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                WorkTide
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                {t('home')}
              </Link>
              <Link
                to="/find-work"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                {t('findWork')}
              </Link>
              <Link
                to="/find-freelancers"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                {t('findFreelancers')}
              </Link>
              <Link
                to="/chat"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                {t('nav.chat', 'Chat')}
              </Link>
            </div>
          </div>

          {/* Mobile menu button with smooth animation */}
          <div className="flex items-center sm:hidden relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isMobileMenuOpen) {
                  setIsMobileMenuOpen(false);
                  setDropdownOpen(false);
                } else {
                  setIsMobileMenuOpen(true);
                  setDropdownOpen(true);
                }
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <div className="w-6 h-6 relative flex justify-center items-center">
                <span
                  className={`absolute block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                    }`}
                />
                <span
                  className={`absolute block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                />
                <span
                  className={`absolute block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                    }`}
                />
              </div>
            </button>

            {/* Mobile menu */}
            <div
              className={`${isMobileMenuOpen ? 'block' : 'hidden'} absolute right-0 mt-8 w-60 top-10 origin-top-right rounded-md shadow-xl bg-white dark:bg-gray-800 z-50`}
              ref={mobileMenuRef}
              style={theme === 'light' ? { backgroundColor: 'white' } : {}}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-2 pb-3 space-y-1">
                <Link
                  to="/"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setDropdownOpen(false);
                  }}
                >
                  {t('home')}
                </Link>
                <Link
                  to="/find-work"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setDropdownOpen(false);
                  }}
                >
                  {t('findWork')}
                </Link>
                <Link
                  to="/find-freelancers"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setDropdownOpen(false);
                  }}
                >
                  {t('findFreelancers')}
                </Link>
                <Link
                  to="/chat"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setDropdownOpen(false);
                  }}
                >
                  {t('nav.chat', 'Chat')}
                </Link>

                {user ? (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <div className="px-3 py-2 text-sm font-medium text-black dark:text-gray-400">
                        {user.fullName}
                      </div>
                      <Link
                        to="/profile"
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setDropdownOpen(false);
                        }}
                      >
                        {t('yourProfile')}
                      </Link>
                      {user.userType === 'client' && (
                        <Link
                          to="/my-tasks"
                          className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setDropdownOpen(false);
                          }}
                        >
                          Manage Tasks
                        </Link>
                      )}
                      {user.userType === 'freelancer' && (
                        <Link
                          to="/my-applications"
                          className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setDropdownOpen(false);
                          }}
                        >
                          My Applications
                        </Link>
                      )}
                      <Link
                        to="/settings"
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setDropdownOpen(false);
                        }}
                      >
                        {t('settings')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white"
                      >
                        {t('signOut')}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center px-4 space-x-3">
                      <Link
                        to="/login"
                        className="block px-3 py-2 rounded-md text-base font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setDropdownOpen(false);
                        }}
                      >
                        {t('signIn')}
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setDropdownOpen(false);
                        }}
                      >
                        {t('signUp')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown();
                  }}
                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none"
                >
                  <Avatar
                    fullName={user.fullName}
                    className="h-8 w-8"
                    textSize="text-xs"
                  />
                  <span className="text-sm font-medium">{user.fullName}</span>
                </button>
                {isDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-8 w-60 rounded-md shadow-xl py-1 bg-white dark:bg-gray-800 z-50"
                    style={dropdownStyle}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t('yourProfile')}
                    </Link>
                    {user.userType === 'client' && (
                      <Link
                        to="/my-tasks"
                        className="block px-4 py-2 text-sm text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Manage Tasks</span>
                        </div>
                      </Link>
                    )}
                    {user.userType === 'freelancer' && (
                      <Link
                        to="/my-applications"
                        className="block px-4 py-2 text-sm text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <span>My Applications</span>
                        </div>
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Cog6ToothIcon className="h-5 w-5" />
                        <span>{t('settings')}</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;