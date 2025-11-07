import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon, StarIcon, ArrowRightIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../config/api';
import RatingComponent from '../components/RatingComponent';
import Avatar from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MotionWrapper from '../components/common/MotionWrapper';

interface UserProfile {
    id: string;
    name?: string;
    fullName: string;
    title?: string;
    skills?: string[];
    hourlyRate?: number;
    rating?: number;
    completedJobs?: number;
    location?: string;
    imageUrl?: string;
    bio?: string;
    languages?: string[];
    education?: {
        institution: string;
        degree: string;
        year: string;
    }[];
    experience?: {
        company: string;
        role: string;
        period: string;
        description: string;
    }[];
    userType?: string;
    createdAt: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
    skills: string[];
}

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Assignment modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [clientTasks, setClientTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [assigningTask, setAssigningTask] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Determine if viewing own profile
    // If id is present in params, check against user.id. If no id in params, it's own profile (handled by route wrapper usually, but good to be safe)
    // Actually, the route is /profile/:id. If /profile is accessed, it might redirect or handle it.
    // Let's assume id is always passed or we use user.id if id is missing/undefined (though route usually requires it).
    // Wait, App.tsx has <Route path="/profile" ... /> which renders <Profile /> without id.
    const targetId = id || user?.id;
    const isOwnProfile = user && targetId === user.id;

    const fetchProfileData = async () => {
        if (!targetId) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_ENDPOINTS.profile.getById(targetId));

            if (response.ok) {
                const data = await response.json();
                setProfileUser(data);
            } else {
                setError('Failed to load profile');
            }
        } catch (err) {
            setError('An error occurred while loading the profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [targetId]);

    // Handle successful rating update
    const handleRatingSuccess = () => {
        fetchProfileData();
    };

    const handleOpenAssignModal = async () => {
        if (!user || !token) {
            navigate('/signup');
            return;
        }

        setIsAssignModalOpen(true);
        setLoadingTasks(true);

        try {
            const response = await fetch(API_ENDPOINTS.tasks.getByClient(user.id), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const tasks = await response.json();
            setClientTasks(tasks.filter((task: Task) => task.status === 'open'));
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setNotification({ type: 'error', message: 'Failed to load your tasks' });
            setIsAssignModalOpen(false);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleAssignTask = async (taskId: string) => {
        if (!profileUser || !token) return;

        setAssigningTask(true);
        try {
            const response = await fetch(API_ENDPOINTS.taskRequests.create, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskId,
                    freelancerId: profileUser.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send assignment request');
            }

            setNotification({
                type: 'success',
                message: `Assignment request sent to ${profileUser.fullName}!`,
            });
            setIsAssignModalOpen(false);

            setTimeout(() => setNotification(null), 3000);
        } catch (err: any) {
            console.error('Error assigning task:', err);
            setNotification({
                type: 'error',
                message: err.message || 'Failed to send assignment request',
            });
        } finally {
            setAssigningTask(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('userNotFound')}</h2>
                        <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('userNotFoundDesc')}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            {t('goBack')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const displayName = profileUser.name || profileUser.fullName || 'User';
    const hasSkills = profileUser.skills && profileUser.skills.length > 0;
    const hasLanguages = profileUser.languages && profileUser.languages.length > 0;
    const hasEducation = profileUser.education && profileUser.education.length > 0;
    const hasExperience = profileUser.experience && profileUser.experience.length > 0;
    const hasBio = !!profileUser.bio;

    // Helper to decide if we should show a section
    // Show if it has data OR if it's own profile (so they can see it's empty and maybe go edit)
    // Actually, for own profile, we might want to show "No info provided" to prompt them.
    // For others, if empty, hide it to keep it clean.
    const shouldShowSection = (hasData: boolean) => hasData || isOwnProfile;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className={`flex items-center ${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} mb-6`}
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    {t('back')}
                </button>

                {/* Profile Header */}
                <MotionWrapper type="fadeIn" duration={0.5}>
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden mb-6`}>
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <Avatar
                                    fullName={displayName}
                                    imageUrl={profileUser.imageUrl}
                                    className="w-24 h-24 sm:w-32 sm:h-32 text-xl"
                                />
                                <div className="flex-1 text-center sm:text-left">
                                    <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{displayName}</h1>
                                    <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{profileUser.title || (isOwnProfile ? 'Add a title' : '')}</p>

                                    <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                        {profileUser.rating != null && (
                                            <div className="flex items-center">
                                                <StarIcon className="h-5 w-5 text-yellow-400" />
                                                <span className={`ml-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{Number(profileUser.rating).toFixed(1)}</span>
                                                <Link
                                                    to={`/freelancer-reviews/${profileUser.id}`}
                                                    className={`ml-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline`}
                                                >
                                                    ({profileUser.completedJobs || 0} reviews)
                                                </Link>
                                            </div>
                                        )}
                                        {profileUser.location && (
                                            <>
                                                <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>•</span>
                                                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>{profileUser.location}</div>
                                            </>
                                        )}
                                        {profileUser.hourlyRate && (
                                            <>
                                                <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>•</span>
                                                <div className="text-green-600 dark:text-green-400 font-medium">${profileUser.hourlyRate}/hr</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    {isOwnProfile ? (
                                        <button
                                            onClick={() => navigate('/settings')}
                                            className={`px-6 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-lg transition-colors flex items-center`}
                                        >
                                            <PencilSquareIcon className="h-5 w-5 mr-2" />
                                            {t('editProfile')}
                                        </button>
                                    ) : (
                                        <div className="flex gap-3">
                                            {/* Only show Assign button if current user is a client (or not specified) and profile user is not me */}
                                            {/* And maybe check if profile user is a freelancer? Or just allow assigning to anyone? */}
                                            {/* Assuming we can only assign to freelancers for now, or anyone who has a 'freelancer' type or just anyone. */}
                                            {/* The original code didn't strictly check userType for the button, just user.id !== freelancer.id */}
                                            <button
                                                onClick={handleOpenAssignModal}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                {t('sendRequest')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!user) {
                                                        navigate('/signup');
                                                    } else {
                                                        navigate(`/chat/${profileUser.id}`);
                                                    }
                                                }}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                {t('contactMe')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </MotionWrapper>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About */}
                        {shouldShowSection(!!hasBio) && (
                            <MotionWrapper type="slideUp" delay={0.1}>
                                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
                                    <div className="p-6">
                                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('aboutMe')}</h2>
                                        {profileUser.bio ? (
                                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{profileUser.bio}</p>
                                        ) : (
                                            <p className={isDark ? 'text-gray-400' : 'text-gray-500'} style={{ fontStyle: 'italic' }}>{t('noBioProvided')}</p>
                                        )}
                                    </div>
                                </div>
                            </MotionWrapper>
                        )}

                        {/* Work Experience */}
                        {shouldShowSection(!!hasExperience) && (
                            <MotionWrapper type="slideUp" delay={0.2}>
                                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
                                    <div className="p-6">
                                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('workExperience')}</h2>
                                        {hasExperience ? (
                                            <div className="space-y-4">
                                                {profileUser.experience?.map((exp, index) => (
                                                    <div key={index} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} pb-4 last:border-0 last:pb-0`}>
                                                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{exp.role}</h3>
                                                        <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>{exp.company} • {exp.period}</div>
                                                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mt-2`}>{exp.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className={isDark ? 'text-gray-400' : 'text-gray-500'} style={{ fontStyle: 'italic' }}>{t('noExperienceProvided')}</p>
                                        )}
                                    </div>
                                </div>
                            </MotionWrapper>
                        )}

                        {/* Education */}
                        {shouldShowSection(!!hasEducation) && (
                            <MotionWrapper type="slideUp" delay={0.3}>
                                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
                                    <div className="p-6">
                                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('education')}</h2>
                                        {hasEducation ? (
                                            <div className="space-y-4">
                                                {profileUser.education?.map((edu, index) => (
                                                    <div key={index} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} pb-4 last:border-0 last:pb-0`}>
                                                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{edu.degree}</h3>
                                                        <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>{edu.institution} • {edu.year}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className={isDark ? 'text-gray-400' : 'text-gray-500'} style={{ fontStyle: 'italic' }}>{t('noEducationProvided')}</p>
                                        )}
                                    </div>
                                </div>
                            </MotionWrapper>
                        )}

                        {/* Ratings & Reviews Section */}
                        <MotionWrapper type="slideUp" delay={0.4}>
                            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('ratingsReviews')}</h2>
                                        <Link
                                            to={`/freelancer-reviews/${profileUser.id}`}
                                            className={`flex items-center ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                                        >
                                            {t('viewAllReviews')}
                                            <ArrowRightIcon className="h-4 w-4 ml-1" />
                                        </Link>
                                    </div>

                                    {profileUser.id && (
                                        <RatingComponent
                                            freelancerId={profileUser.id}
                                            onRatingSuccess={handleRatingSuccess}
                                            previewMode={true}
                                            maxReviews={3}
                                            readOnly={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </MotionWrapper>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Skills */}
                        {shouldShowSection(!!hasSkills) && (
                            <MotionWrapper type="slideUp" delay={0.1}>
                                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
                                    <div className="p-6">
                                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('skills')}</h2>
                                        {hasSkills ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profileUser.skills?.map(skill => (
                                                    <span
                                                        key={skill}
                                                        className={`px-3 py-1 ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'} rounded-full text-sm`}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className={isDark ? 'text-gray-400' : 'text-gray-500'} style={{ fontStyle: 'italic' }}>{t('noSkillsProvided')}</p>
                                        )}
                                    </div>
                                </div>
                            </MotionWrapper>
                        )}

                        {/* Languages */}
                        {shouldShowSection(!!hasLanguages) && (
                            <MotionWrapper type="slideUp" delay={0.2}>
                                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
                                    <div className="p-6">
                                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('languages')}</h2>
                                        {hasLanguages ? (
                                            <ul className="space-y-2">
                                                {profileUser.languages?.map((language, index) => (
                                                    <li key={index} className={isDark ? 'text-gray-300' : 'text-gray-700'}>{language}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className={isDark ? 'text-gray-400' : 'text-gray-500'} style={{ fontStyle: 'italic' }}>{t('noLanguagesProvided')}</p>
                                        )}
                                    </div>
                                </div>
                            </MotionWrapper>
                        )}

                        {/* Contact Info */}
                        <MotionWrapper type="slideUp" delay={0.3}>
                            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
                                <div className="p-6">
                                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('contact')}</h2>
                                    <div className="space-y-3">
                                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                                            Account preference: <span className="font-medium capitalize">{profileUser.userType || 'N/A'}</span>
                                        </p>
                                        <button
                                            onClick={() => {
                                                if (!user) {
                                                    navigate('/signup');
                                                } else {
                                                    navigate(`/chat/${profileUser.id}`);
                                                }
                                            }}
                                            disabled={isOwnProfile}
                                            className={`flex items-center justify-center w-full px-4 py-2 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <EnvelopeIcon className="h-5 w-5 mr-2" />
                                            <span>{t('sendMessage')}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </MotionWrapper>
                    </div>
                </div>

                {/* Notification Banner */}
                {notification && (
                    <div
                        className={`fixed top-20 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            } text-white`}
                    >
                        {notification.message}
                    </div>
                )}

                {/* Assignment Modal */}
                {isAssignModalOpen && profileUser && (
                    <div className="fixed inset-0 overflow-y-auto z-50" role="dialog">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsAssignModalOpen(false)}></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                            <div className={`inline-block align-bottom ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative max-h-[80vh] overflow-y-auto`}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {t('assignTaskTo')} {profileUser.fullName}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setIsAssignModalOpen(false);
                                        }}
                                        className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                                    {t('selectTaskToAssign')}
                                </p>

                                {loadingTasks ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-4 text-gray-600">{t('loadingTasks')}</p>
                                    </div>
                                ) : clientTasks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('noAvailableTasks')}</p>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>{t('createTaskInMyTasks')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {clientTasks.map(task => (
                                            <div
                                                key={task.id}
                                                className={`border ${isDark ? 'border-gray-700 hover:border-blue-500' : 'border-gray-200 hover:border-blue-500'} rounded-lg p-4 transition-colors`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                                                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1 line-clamp-2`}>{task.description}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                                ${task.budget}
                                                            </span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {task.skills.slice(0, 3).map(skill => (
                                                                    <span
                                                                        key={skill}
                                                                        className={`px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded text-xs`}
                                                                    >
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                                {task.skills.length > 3 && (
                                                                    <span className={`px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded text-xs`}>
                                                                        +{task.skills.length - 3} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAssignTask(task.id)}
                                                        disabled={assigningTask}
                                                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        {assigningTask ? t('assigning') : t('assign')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
