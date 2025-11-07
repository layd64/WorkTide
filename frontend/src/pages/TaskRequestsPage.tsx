
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { useTranslation } from 'react-i18next';

interface Client {
    id: string;
    fullName: string;
    imageUrl?: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    budget: number;
    skills: string[];
    imageUrl?: string;
}

interface TaskRequest {
    id: string;
    createdAt: string;
    task: Task;
    client: Client;
}

const TaskRequestsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [requests, setRequests] = useState<TaskRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingRequest, setProcessingRequest] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user || !token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(API_ENDPOINTS.taskRequests.getForFreelancer(user.id), {
                    headers: {
                        'Authorization': `Bearer ${token} `,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch task requests');
                }

                const data = await response.json();
                setRequests(data);
            } catch (err) {
                console.error('Error fetching requests:', err);
                setError('Failed to load task requests. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [user, token]);

    const handleAcceptRequest = async (requestId: string, clientId: string) => {
        if (!token) return;

        setProcessingRequest(requestId);
        try {
            const response = await fetch(API_ENDPOINTS.taskRequests.accept(requestId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token} `,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to accept request');
            }

            // Remove the request from the list
            setRequests(prev => prev.filter(req => req.id !== requestId));

            setNotification({
                type: 'success',
                message: t('requestAccepted'),
            });

            // Navigate to chat after a brief delay
            setTimeout(() => {
                navigate(`/chat/${clientId}`);
            }, 1500);
        } catch (err: any) {
            console.error('Error accepting request:', err);
            setNotification({
                type: 'error',
                message: err.message || t('failedToAcceptRequest'),
            });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setProcessingRequest(null);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        if (!token) return;

        setProcessingRequest(requestId);
        try {
            const response = await fetch(API_ENDPOINTS.taskRequests.reject(requestId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token} `,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to reject request');
            }

            // Remove the request from the list
            setRequests(prev => prev.filter(req => req.id !== requestId));

            setNotification({
                type: 'success',
                message: t('requestDeclined'),
            });

            setTimeout(() => setNotification(null), 3000);
        } catch (err: any) {
            console.error('Error rejecting request:', err);
            setNotification({
                type: 'error',
                message: err.message || t('failedToRejectRequest'),
            });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setProcessingRequest(null);
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('taskRequestsTitle')}</h1>
                    <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('taskRequestsDesc')}
                    </p>
                </div>

                {/* Notification Banner */}
                {notification && (
                    <div
                        className={`mb-6 px-6 py-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            } text-white`}
                    >
                        {notification.message}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${isDark ? 'border-indigo-400' : 'border-indigo-600'} border-r-transparent`} role="status">
                            <span className="sr-only">{t('loading')}</span>
                        </div>
                        <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('loadingRequests')}</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-12">
                        <div className={`${isDark ? 'bg-red-900/20 border-red-500 text-red-300' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded`}>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && requests.length === 0 && (
                    <div className={`text-center py-20 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
                        <svg
                            className={`mx-auto h-16 w-16 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <h3 className={`mt-4 text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('noPendingRequests')}</h3>
                        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('noPendingRequestsDesc')}
                        </p>
                    </div>
                )}

                {/* Requests List */}
                {!loading && !error && requests.length > 0 && (
                    <div className="space-y-4">
                        {requests.map(request => (
                            <div
                                key={request.id}
                                className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Client Info */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center -space-x-2">
                                                {request.task.imageUrl && (
                                                    <img
                                                        src={request.task.imageUrl}
                                                        alt={request.task.title}
                                                        className={`w-12 h-12 rounded-md object-cover ring-2 ${isDark ? 'ring-gray-800' : 'ring-white'} z-10`}
                                                    />
                                                )}
                                                {request.client.imageUrl ? (
                                                    <img
                                                        src={request.client.imageUrl}
                                                        alt={request.client.fullName}
                                                        className={`w-12 h-12 rounded-full object-cover ring-2 ${isDark ? 'ring-gray-800' : 'ring-white'} z-20`}
                                                    />
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center ring-2 ${isDark ? 'ring-gray-800' : 'ring-white'} z-20`}>
                                                        <span className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            {request.client.fullName.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('requestFrom')}</p>
                                                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{request.client.fullName}</p>
                                            </div>
                                        </div>

                                        {/* Task Info */}
                                        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                                                {request.task.title}
                                            </h3>
                                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>{request.task.description}</p>

                                            <div className="flex items-center gap-4 mb-3">
                                                <span className={`text-lg font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                                    ${request.task.budget}
                                                </span>
                                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {t('requestedOn')} {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-2">
                                                {request.task.skills.map(skill => (
                                                    <span
                                                        key={skill}
                                                        className={`px-3 py-1 ${isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-800'} rounded-full text-sm`}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => handleAcceptRequest(request.id, request.client.id)}
                                        disabled={processingRequest === request.id}
                                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                    >
                                        {processingRequest === request.id ? t('processing') : t('acceptAndChat')}
                                    </button>
                                    <button
                                        onClick={() => handleRejectRequest(request.id)}
                                        disabled={processingRequest === request.id}
                                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                    >
                                        {processingRequest === request.id ? t('processing') : t('decline')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskRequestsPage;
