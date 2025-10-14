import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
                        'Authorization': `Bearer ${token}`,
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

    const handleAcceptRequest = async (requestId: string) => {
        if (!token) return;

        setProcessingRequest(requestId);
        try {
            const response = await fetch(API_ENDPOINTS.taskRequests.accept(requestId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to accept request');
            }

            // Remove the request from the list
            setRequests(prev => prev.filter(req => req.id !== requestId));

            setNotification({
                type: 'success',
                message: 'Request accepted! Redirecting to chat...',
            });

            // Navigate to chat after a brief delay
            setTimeout(() => {
                navigate('/chat');
            }, 1500);
        } catch (err: any) {
            console.error('Error accepting request:', err);
            setNotification({
                type: 'error',
                message: err.message || 'Failed to accept request',
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
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to reject request');
            }

            // Remove the request from the list
            setRequests(prev => prev.filter(req => req.id !== requestId));

            setNotification({
                type: 'success',
                message: 'Request declined successfully',
            });

            setTimeout(() => setNotification(null), 3000);
        } catch (err: any) {
            console.error('Error rejecting request:', err);
            setNotification({
                type: 'error',
                message: err.message || 'Failed to reject request',
            });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setProcessingRequest(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Task Requests</h1>
                    <p className="mt-2 text-gray-600">
                        Review and respond to direct task assignment requests from clients
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
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
                            <span className="sr-only">{t('loading')}</span>
                        </div>
                        <p className="mt-4 text-gray-600">Loading requests...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-12">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && requests.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            When clients assign you to their tasks, you'll see them here.
                        </p>
                    </div>
                )}

                {/* Requests List */}
                {!loading && !error && requests.length > 0 && (
                    <div className="space-y-4">
                        {requests.map(request => (
                            <div
                                key={request.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
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
                                                        className="w-12 h-12 rounded-md object-cover ring-2 ring-white z-10"
                                                    />
                                                )}
                                                {request.client.imageUrl ? (
                                                    <img
                                                        src={request.client.imageUrl}
                                                        alt={request.client.fullName}
                                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white z-20"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white z-20">
                                                        <span className="text-lg font-medium text-gray-600">
                                                            {request.client.fullName.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Request from</p>
                                                <p className="font-semibold text-gray-900">{request.client.fullName}</p>
                                            </div>
                                        </div>

                                        {/* Task Info */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {request.task.title}
                                            </h3>
                                            <p className="text-gray-700 mb-3">{request.task.description}</p>

                                            <div className="flex items-center gap-4 mb-3">
                                                <span className="text-lg font-semibold text-green-600">
                                                    ${request.task.budget}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Requested {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-2">
                                                {request.task.skills.map(skill => (
                                                    <span
                                                        key={skill}
                                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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
                                        onClick={() => handleAcceptRequest(request.id)}
                                        disabled={processingRequest === request.id}
                                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                    >
                                        {processingRequest === request.id ? 'Processing...' : 'Accept & Start Chat'}
                                    </button>
                                    <button
                                        onClick={() => handleRejectRequest(request.id)}
                                        disabled={processingRequest === request.id}
                                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                    >
                                        {processingRequest === request.id ? 'Processing...' : 'Decline'}
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
