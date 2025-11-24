import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnvelopeIcon, LockClosedIcon, UserIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { validateEmail, validatePassword, validateFullName } from '../../utils/validation';

const SignUp: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        userType: 'freelancer', // Default to freelancer
        isHidden: false,
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Automatically hide profile if user selects client
            if (name === 'userType') {
                newData.isHidden = value === 'client';
            }

            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate input
        const emailError = validateEmail(formData.email);
        if (emailError) {
            setError(emailError);
            return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        const fullNameError = validateFullName(formData.fullName);
        if (fullNameError) {
            setError(fullNameError);
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.auth.signup, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                // If the API returns a token on signup, log the user in
                if (data.token) {
                    login(data.token);

                    // Determine welcome message based on user type
                    let welcomeMessage = '';
                    if (formData.userType === 'freelancer') {
                        welcomeMessage = t('welcomeFreelancer') || 'Please fill your profile information in settings to get more clients to find you!';
                    } else {
                        welcomeMessage = t('welcomeClient') || 'Let\'s get started: Create your first task!';
                    }

                    navigate('/', { state: { welcomeMessage } });
                } else {
                    // Otherwise redirect to login
                    navigate('/login');
                }
            } else {
                const data = await response.json();
                setError(data.message || t('failedToCreateAccount'));
            }
        } catch (err) {
            setError(t('errorOccurred'));
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Half - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                    alt="WorkTide Platform"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay with branding */}
                <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/60 to-transparent">
                    <h1 className="text-4xl font-bold text-white mb-4">Join WorkTide</h1>
                    <p className="text-lg text-white/90">Start your journey as a freelancer or find the perfect talent</p>
                </div>
            </div>

            {/* Right Half - Form */}
            <div className={`flex-1 lg:w-1/2 ${isDark ? 'bg-gray-800' : 'bg-white'} flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24`}>
                <div className="mx-auto w-full max-w-md">
                    <div>
                        <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t('createNewAccount')}
                        </h2>
                        <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('or') || 'Or'}{' '}
                            <Link to="/login" className={`font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'} transition-colors`}>
                                {t('signInToExisting')}
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className={`${isDark ? 'bg-red-900/20 border-red-500 text-red-300' : 'bg-red-50 border-red-200 text-red-600'} border px-4 py-3 rounded-md text-sm`}>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="fullName" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {t('fullName')}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {t('emailAddress')}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {t('password')}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="userType" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {t('myPrimaryRoleIs')}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <BriefcaseIcon className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    </div>
                                    <select
                                        id="userType"
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                    >
                                        <option value="freelancer">{t('freelancerOption')}</option>
                                        <option value="client">{t('clientOption')}</option>
                                    </select>
                                </div>
                                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('roleSelectionInfo')}
                                </p>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-lg"
                                >
                                    {t('signup')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
