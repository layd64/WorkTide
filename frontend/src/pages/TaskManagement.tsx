import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import RatingComponent from '../components/RatingComponent';
import CreateTaskForm from '../components/CreateTaskForm';
import MotionWrapper from '../components/common/MotionWrapper';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Freelancer {
  id: string;
  fullName: string;
  imageUrl?: string;
  title?: string;
  hourlyRate?: number;
  rating?: number;
}

interface TaskRequest {
  id: string;
  createdAt: string;
  freelancer: Freelancer;
}

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  status: string;
  imageUrl?: string;
  createdAt: string;
  applications?: TaskApplication[];
  pendingRequests?: TaskRequest[];
}

interface Freelancer {
  id: string;
  fullName: string;
  imageUrl?: string;
  skills?: string[];
  hourlyRate?: number;
  rating?: number;
  title?: string;
  location?: string;
}

interface RecommendedFreelancer {
  id: string;
  fullName: string;
  imageUrl?: string | null;
  title?: string | null;
  hourlyRate?: number | null;
  rating?: number | null;
  completedJobs?: number | null;
  location?: string | null;
  skills: string[];
  score: number;
}

interface TaskApplication {
  id: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
  freelancer: Freelancer;
}

const TaskManagement: React.FC = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [isViewingApplications, setIsViewingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<TaskApplication | null>(null);
  const [isViewingApplicationDetails, setIsViewingApplicationDetails] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [freelancerToReview, setFreelancerToReview] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [openDropdownTaskId, setOpenDropdownTaskId] = useState<string | null>(null);
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);
  const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] = useState(false);
  const [recommendedFreelancers, setRecommendedFreelancers] = useState<RecommendedFreelancer[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const [sendingRequestFor, setSendingRequestFor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleTaskCreated = () => {
    setIsCreateTaskModalOpen(false);
    setIsCreateTaskModalOpen(false);
    setSuccessMessage(t('taskCreatedSuccess'));
    fetchClientTasks();
    fetchClientTasks();

    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  // Redirect non-authenticated users
  if (!user) {
    return <Navigate to="/login" />;
  }

  const fetchClientTasks = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        API_ENDPOINTS.tasks.getByClient(user.id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        setCurrentPage(1); // Reset to first page when tasks are fetched
      } else {
        setError('Failed to fetch your tasks. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

  useEffect(() => {
    fetchClientTasks();
  }, [user.id, token]);

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm(t('areYouSureDelete'))) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.tasks.delete(taskId), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccessMessage(t('taskDeleted'));
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        // Auto-clear success message
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to delete task. Please try again.');
        // Auto-clear error message
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      // Auto-clear error message
      setTimeout(() => setError(null), 5000);
    }
  };

  const fetchApplications = async (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.taskApplications.getByTask(taskId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
        setIsViewingApplications(true);
      } else {
        setError('Failed to fetch applications. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApplicationDetails = (application: TaskApplication) => {
    setSelectedApplication(application);
    setIsViewingApplicationDetails(true);
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(API_ENDPOINTS.taskApplications.updateStatus(applicationId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setSuccessMessage(`Application ${status} successfully`);
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app.id === applicationId ? { ...app, status } : app
          )
        );
      } else {
        setError('Failed to update application status. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  const handleAssignFreelancer = async (applicationId: string) => {
    // This function both assigns a freelancer to the task (changing task status to 'in_progress')
    // and accepts their application (changing application status to 'accepted') in a single action
    try {
      const response = await fetch(API_ENDPOINTS.taskApplications.assignFreelancer(applicationId), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();

        // Update the task status in the task list
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === result.task.id ? { ...task, status: 'in_progress' } : task
          )
        );

        // Update the application status
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app.id === applicationId ? { ...app, status: 'accepted' } : app
          )
        );

        // If this is the currently selected application, update it
        if (selectedApplication && selectedApplication.id === applicationId) {
          setSelectedApplication(prev => prev ? { ...prev, status: 'accepted' } : null);
        }

        setSuccessMessage('Freelancer assigned to task and chat opened');
        closeApplicationDetailsModal();

        // Navigate to chat with the freelancer
        if (result.freelancerId) {
          navigate(`/chat/${result.freelancerId}`);
        }
      } else {
        setError('Failed to assign freelancer. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  const closeApplicationsModal = () => {
    setIsViewingApplications(false);
    setSelectedTaskId(null);
  };

  const closeApplicationDetailsModal = () => {
    setIsViewingApplicationDetails(false);
    setSelectedApplication(null);
  };

  const closeRecommendationsModal = () => {
    setIsRecommendationsModalOpen(false);
    setRecommendedFreelancers([]);
    setSelectedTaskId(null);
    setRecommendationsPage(1);
    setRecommendationsError(null);
    setSendingRequestFor(null);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-indigo-100 text-indigo-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSelectedTask = () => {
    if (!selectedTaskId) return null;
    return tasks.find(task => task.id === selectedTaskId);
  };

  const fetchRecommendations = async (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsRecommendationsModalOpen(true);
    setRecommendationsPage(1);
    setLoadingRecommendations(true);
    setRecommendationsError(null);

    try {
      const response = await fetch(API_ENDPOINTS.tasks.getRecommendations(taskId, 10), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load recommendations');
      }

      const data = await response.json();
      setRecommendedFreelancers(data);
    } catch (err: any) {
      console.error('Error fetching recommendations', err);
      setRecommendationsError(err.message || 'Failed to load recommendations');
      setRecommendedFreelancers([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      // First, find the assigned freelancer for this task
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (task.status !== 'in_progress') {
        setError('Only tasks that are in progress can be marked as completed');
        return;
      }

      // Update task status to completed
      const response = await fetch(API_ENDPOINTS.tasks.update(taskId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        setSuccessMessage(t('taskCompleted'));

        // Update task in state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: 'completed' } : task
          )
        );

        // Try to find the assigned freelancer via accepted applications first
        const applicationsResponse = await fetch(API_ENDPOINTS.taskApplications.getByTask(taskId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let freelancerIdForReview: string | null = null;

        if (applicationsResponse.ok) {
          const applications = await applicationsResponse.json();
          const acceptedApplication = applications.find((app: TaskApplication) => app.status === 'accepted');

          if (acceptedApplication) {
            freelancerIdForReview = acceptedApplication.freelancer.id;
          }
        } else {
          console.error('Failed to fetch applications for the completed task');
        }

        // If no accepted application, fall back to accepted task requests (direct assignments)
        if (!freelancerIdForReview) {
          try {
            const taskDetailsResponse = await fetch(API_ENDPOINTS.tasks.getById(taskId), {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (taskDetailsResponse.ok) {
              const taskDetails = await taskDetailsResponse.json();
              if (taskDetails.taskRequests && Array.isArray(taskDetails.taskRequests)) {
                const acceptedRequest = taskDetails.taskRequests.find((req: any) => req.status === 'accepted');
                if (acceptedRequest && acceptedRequest.freelancer && acceptedRequest.freelancer.id) {
                  freelancerIdForReview = acceptedRequest.freelancer.id;
                }
              }
            } else {
              console.error('Failed to fetch task details for review flow');
            }
          } catch (innerErr) {
            console.error('Error while fetching task details for review flow', innerErr);
          }
        }

        if (freelancerIdForReview) {
          setFreelancerToReview(freelancerIdForReview);
          setIsReviewModalOpen(true);
        } else {
          console.warn('No assigned freelancer found for this task to review.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to complete task. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setFreelancerToReview(null);
  };

  const handleReviewSuccess = () => {
    closeReviewModal();
    setSuccessMessage('Thank you for your review!');
  };

  /*
  const fetchPendingRequests = async (taskId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.tasks.getById(taskId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const taskData = await response.json();
        // Update the task with its pending requests
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, pendingRequests: taskData.pendingRequests || [] } : task
          )
        );
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };
  */

  const handleCancelRequest = async (requestId: string) => {
    setCancellingRequestId(requestId);
    try {
      const response = await fetch(API_ENDPOINTS.taskRequests.cancel(requestId), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccessMessage('Request cancelled successfully');
        // Refresh the task list to update status
        fetchClientTasks();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to cancel request');
      }
    } catch (err) {
      setError('An error occurred while cancelling the request');
      console.error(err);
    } finally {
      setCancellingRequestId(null);
    }
  };


  // Ensure modals are properly cleaned up when unmounted
  // Close dropdown when errors or success messages appear
  useEffect(() => {
    if (error || successMessage) {
      setOpenDropdownTaskId(null);
    }
  }, [error, successMessage]);

  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts
      const modalOverlays = document.querySelectorAll('.fixed.inset-0[role="dialog"]');
      modalOverlays.forEach(overlay => overlay.remove());
      // Also clean up any backdrop overlays that might be stuck
      const backdrops = document.querySelectorAll('.fixed.inset-0');
      backdrops.forEach(backdrop => {
        if (!backdrop.hasAttribute('role')) {
          backdrop.remove();
        }
      });
    };
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('myTasks')}
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('myTasksDesc')}
            </p>
          </div>
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('createNewTask')}
          </button>
        </div>

        {/* Create Task Modal */}
        {
          isCreateTaskModalOpen && (
            <div className="fixed inset-0 overflow-y-auto z-50" style={{ pointerEvents: 'auto' }} role="dialog">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsCreateTaskModalOpen(false)}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

                <div className={`inline-block align-bottom ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative`}>
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => setIsCreateTaskModalOpen(false)}
                      className="bg-white rounded-full p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <ErrorBoundary>
                    <CreateTaskForm onTaskCreated={handleTaskCreated} />
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          )
        }

        {
          error && (
            <div className={`mb-6 ${isDark ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-400'} border-l-4 p-4 rounded-r-md`}>
              <div className="flex">
                <svg className={`h-5 w-5 ${isDark ? 'text-red-500' : 'text-red-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
                </div>
              </div>
            </div>
          )
        }

        {
          successMessage && (
            <div className={`mb-6 ${isDark ? 'bg-green-900/20 border-green-500' : 'bg-green-50 border-green-400'} border-l-4 p-4 rounded-r-md`}>
              <div className="flex">
                <svg className={`h-5 w-5 ${isDark ? 'text-green-500' : 'text-green-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>{successMessage}</p>
                </div>
              </div>
            </div>
          )
        }

        <div className="mt-8">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('loadingTasks')}</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className={`text-center py-20 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
              <svg className={`mx-auto h-16 w-16 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className={`mt-4 text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('noTasksYet')}</h3>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('getStartedTask')}</p>
              <button
                onClick={() => window.location.href = '/find-work'}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {t('createFirstTask')}
              </button>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedTasks.map((task, index) => (
                <MotionWrapper
                  key={task.id}
                  type="fadeIn"
                  delay={index * 0.1}
                  className="h-full"
                >
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-100'} h-full`}>
                    {/* Task Image */}
                    {task.imageUrl && (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={task.imageUrl}
                          alt={task.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-2 flex-1 mr-2`}>
                          {task.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeClass(
                            task.status
                          )}`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} line-clamp-2 mb-4`}>
                        {task.description}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {task.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                          >
                            {skill}
                          </span>
                        ))}
                        {task.skills.length > 4 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            +{task.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Info Row */}
                      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                        <div className="flex items-center text-indigo-600 font-semibold">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ${task.budget}
                        </div>
                        <div className="flex items-center text-gray-500 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-6 py-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => fetchApplications(task.id)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {t('applications')}
                        </button>

                        {task.status === 'open' && (
                          <button
                            onClick={() => fetchRecommendations(task.id)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7H7m6 4H7m6 4H7m8-8h2m-2 4h2m-2 4h2M5 6h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                            </svg>
                            {t('recommendations')}
                          </button>
                        )}

                        {task.status === 'in_progress' && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('complete')}
                          </button>
                        )}

                        {task.status === 'pending' && (
                          <button
                            onClick={() => {
                              // For pending status, we need to find and cancel the request
                              // Since we canceled based on task status, we'll just show the option
                              if (window.confirm('Cancel this task request? The task will return to open status.')) {
                                // We'll need to fetch the request ID from the backend
                                // For now, just refresh - a better approach would be to store request ID with task
                                fetch(`${API_ENDPOINTS.tasks.getById(task.id)}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                })
                                  .then(res => res.json())
                                  .then(taskData => {
                                    if (taskData.taskRequests && taskData.taskRequests.length > 0) {
                                      handleCancelRequest(taskData.taskRequests[0].id);
                                    }
                                  })
                                  .catch(err => console.error(err));
                              }
                            }}
                            disabled={cancellingRequestId !== null}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors disabled:bg-gray-400"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {cancellingRequestId ? t('cancelling') : t('cancelRequest')}
                          </button>
                        )}


                        {/* Only show 3-dot menu for tasks with "open" status */}
                        {task.status === 'open' && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownTaskId(openDropdownTaskId === task.id ? null : task.id);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 01 0 4z" />
                              </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {openDropdownTaskId === task.id && (
                              <div
                                className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Close dropdown immediately before showing confirmation
                                      setOpenDropdownTaskId(null);
                                      // Use setTimeout to ensure state update completes before showing dialog
                                      setTimeout(() => {
                                        handleDeleteTask(task.id);
                                      }, 0);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    Delete Task
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </MotionWrapper>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} border ${isDark ? 'border-gray-700' : 'border-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className={`px-4 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} border ${isDark ? 'border-gray-700' : 'border-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
            </>
          )}
        </div>

        {/* Applications Modal */}
        {
          isViewingApplications && selectedTaskId && (
            <div className="fixed inset-0 overflow-y-auto z-50" style={{ pointerEvents: 'auto' }} role="dialog">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                <div className={`inline-block align-bottom ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full`}>
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                          Applications for: {getSelectedTask()?.title}
                        </h3>

                        {applications.length === 0 ? (
                          <div className="mt-4 text-center py-8">
                            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No applications yet for this task.</p>
                          </div>
                        ) : (
                          <div className="mt-6">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                              {applications.map((application) => (
                                <li key={application.id} className="py-4">
                                  <div className="flex items-center justify-between">
                                    <div
                                      className="flex items-center cursor-pointer hover:opacity-80"
                                      onClick={() => navigate(`/profile/${application.freelancer.id}`)}
                                    >
                                      {application.freelancer.imageUrl ? (
                                        <img
                                          src={application.freelancer.imageUrl}
                                          alt={application.freelancer.fullName}
                                          className="h-10 w-10 rounded-full mr-3"
                                        />
                                      ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                                          <span className="text-sm font-medium text-gray-600">
                                            {application.freelancer.fullName.charAt(0)}
                                          </span>
                                        </div>
                                      )}
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                                          {application.freelancer.fullName}
                                        </h4>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {application.freelancer.title || 'Freelancer'}
                                          {application.freelancer.location && ` • ${application.freelancer.location}`}
                                        </p>
                                        <div className="mt-1">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getApplicationStatusBadgeClass(application.status)}`}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Link
                                        to={`/profile/${application.freelancer.id}`}
                                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      >
                                        View Profile
                                      </Link>
                                      <button
                                        onClick={() => handleViewApplicationDetails(application)}
                                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      >
                                        View Application
                                      </button>
                                      {application.status === 'pending' && (
                                        <button
                                          onClick={() => handleAssignFreelancer(application.id)}
                                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                          Assign to Task
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={closeApplicationsModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Recommendations Modal */}
        {
          isRecommendationsModalOpen && selectedTaskId && (
            <div className="fixed inset-0 overflow-y-auto z-50" style={{ pointerEvents: 'auto' }} role="dialog">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeRecommendationsModal}></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                <div className={`inline-block align-bottom ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative`}>
                  {/* Close button at top-right */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={closeRecommendationsModal}
                      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-full p-2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className={`text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2 pr-10`}>
                          Recommended freelancers for: {getSelectedTask()?.title}
                        </h3>

                        {loadingRecommendations ? (
                          <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading recommendations...</p>
                          </div>
                        ) : recommendationsError ? (
                          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-md">
                            <p className="text-sm text-red-700 dark:text-red-300">{recommendationsError}</p>
                          </div>
                        ) : recommendedFreelancers.length === 0 ? (
                          <div className="mt-4 text-center py-8">
                            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                              No recommendations available yet. Try again after more freelancers interact with similar tasks.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4">
                            {(() => {
                              const pageSize = 5;
                              const total = recommendedFreelancers.length;
                              const totalPages = Math.ceil(total / pageSize) || 1;
                              const currentPage = Math.min(recommendationsPage, totalPages);
                              const startIndex = (currentPage - 1) * pageSize;
                              const pageItems = recommendedFreelancers.slice(startIndex, startIndex + pageSize);

                              return (
                                <>
                                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {pageItems.map((freelancer) => (
                                      <li key={freelancer.id} className="py-4">
                                        <div className="flex items-center justify-between">
                                          <div
                                            className="flex items-center cursor-pointer hover:opacity-80"
                                            onClick={() => navigate(`/profile/${freelancer.id}`)}
                                          >
                                            {freelancer.imageUrl ? (
                                              <img
                                                src={freelancer.imageUrl}
                                                alt={freelancer.fullName}
                                                className="h-10 w-10 rounded-full mr-3"
                                              />
                                            ) : (
                                              <div className="h-10 w-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                  {freelancer.fullName.charAt(0)}
                                                </span>
                                              </div>
                                            )}
                                            <div>
                                              <h4 className={`text-sm font-medium ${isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'}`}>
                                                {freelancer.fullName}
                                              </h4>
                                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {freelancer.title || 'Freelancer'}
                                                {freelancer.location && ` • ${freelancer.location}`}
                                              </p>
                                              <div className="mt-1 flex flex-wrap gap-1">
                                                {freelancer.skills.slice(0, 4).map((skill) => (
                                                  <span
                                                    key={skill}
                                                    className={`px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded text-xs`}
                                                  >
                                                    {skill}
                                                  </span>
                                                ))}
                                                {freelancer.skills.length > 4 && (
                                                  <span className={`px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded text-xs`}>
                                                    +{freelancer.skills.length - 4} more
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end space-y-1">
                                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                              {freelancer.rating ? `⭐ ${freelancer.rating.toFixed(1)}` : 'No rating'}
                                            </span>
                                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {(freelancer.completedJobs ?? 0)} completed jobs
                                            </span>
                                            <div className="flex gap-2 mt-1">
                                              <button
                                                onClick={() => navigate(`/profile/${freelancer.id}`)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-indigo-600 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50"
                                              >
                                                View Profile
                                              </button>
                                              <button
                                                onClick={async () => {
                                                  if (!selectedTaskId || !token) return;
                                                  setSendingRequestFor(freelancer.id);
                                                  try {
                                                    const response = await fetch(API_ENDPOINTS.taskRequests.create, {
                                                      method: 'POST',
                                                      headers: {
                                                        Authorization: `Bearer ${token}`,
                                                        'Content-Type': 'application/json',
                                                      },
                                                      body: JSON.stringify({
                                                        taskId: selectedTaskId,
                                                        freelancerId: freelancer.id,
                                                      }),
                                                    });

                                                    if (!response.ok) {
                                                      const errorData = await response.json().catch(() => ({}));
                                                      throw new Error(errorData.message || 'Failed to send request');
                                                    }

                                                    setSuccessMessage(`Request sent to ${freelancer.fullName}`);
                                                  } catch (err: any) {
                                                    console.error('Error sending task request from recommendations:', err);
                                                    setError(err.message || 'Failed to send request');
                                                  } finally {
                                                    setSendingRequestFor(null);
                                                  }
                                                }}
                                                disabled={sendingRequestFor === freelancer.id}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                              >
                                                {sendingRequestFor === freelancer.id ? 'Sending...' : 'Send Request'}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>

                                  {/* Pagination controls */}
                                  {totalPages > 1 && (
                                    <div className={`mt-4 flex items-center justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      <span>
                                        Page {currentPage} of {totalPages}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          disabled={currentPage === 1}
                                          onClick={() => setRecommendationsPage((p) => Math.max(p - 1, 1))}
                                          className={`px-2 py-1 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700'} rounded disabled:opacity-50`}
                                        >
                                          Previous
                                        </button>
                                        <button
                                          disabled={currentPage === totalPages}
                                          onClick={() => setRecommendationsPage((p) => Math.min(p + 1, totalPages))}
                                          className={`px-2 py-1 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700'} rounded disabled:opacity-50`}
                                        >
                                          Next
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Application Details Modal */}
        {
          isViewingApplicationDetails && selectedApplication && (
            <div className="fixed inset-0 overflow-y-auto z-50" style={{ pointerEvents: 'auto' }} role="dialog">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                          Application Details
                        </h3>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Applicant:</h4>
                          <div
                            className="flex items-center cursor-pointer hover:opacity-80"
                            onClick={() => navigate(`/profile/${selectedApplication.freelancer.id}`)}
                          >
                            {selectedApplication.freelancer.imageUrl ? (
                              <img
                                src={selectedApplication.freelancer.imageUrl}
                                alt={selectedApplication.freelancer.fullName}
                                className="h-10 w-10 rounded-full mr-3"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {selectedApplication.freelancer.fullName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                                {selectedApplication.freelancer.fullName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedApplication.freelancer.title || 'Freelancer'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedApplication.coverLetter && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Letter:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-gray-700 p-3 rounded">
                              {selectedApplication.coverLetter}
                            </p>
                          </div>
                        )}

                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Applied on:</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {selectedApplication.status === 'pending' && (
                        <div className="mt-6 flex justify-between">
                          <button
                            onClick={() => handleAssignFreelancer(selectedApplication.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Assign to Task
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'rejected')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={closeApplicationDetailsModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Review Modal */}
        {
          isReviewModalOpen && freelancerToReview && (
            <div className="fixed inset-0 overflow-y-auto z-50" style={{ pointerEvents: 'auto' }} role="dialog">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">


                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                          Task Completed! Rate your Freelancer
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Thank you for completing this task. Please take a moment to rate the freelancer and provide feedback.
                          </p>
                        </div>

                        <div className="mt-4">
                          <RatingComponent
                            freelancerId={freelancerToReview}
                            onRatingSuccess={handleReviewSuccess}
                            forceShowRatingForm={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={closeReviewModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};

export default TaskManagement; 