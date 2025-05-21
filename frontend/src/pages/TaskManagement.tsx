import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { Navigate, Link } from 'react-router-dom';
import RatingComponent from '../components/RatingComponent';

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  status: string;
  createdAt: string;
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

interface TaskApplication {
  id: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
  freelancer: Freelancer;
}

const TaskManagement: React.FC = () => {
  const { user, token } = useAuth();
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

  // Redirect non-client users
  if (!user || user.userType !== 'client') {
    return <Navigate to="/" />;
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

  useEffect(() => {
    fetchClientTasks();
  }, [user.id, token]);

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
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
        setSuccessMessage('Task deleted successfully');
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } else {
        setError('Failed to delete task. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.tasks.update(taskId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setSuccessMessage(`Task status updated to ${newStatus}`);
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } else {
        setError('Failed to update task status. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
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

        setSuccessMessage('Freelancer assigned to task and application accepted');
        closeApplicationDetailsModal();
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
        setSuccessMessage('Task marked as completed successfully');

        // Update task in state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: 'completed' } : task
          )
        );

        // Fetch applications to find the assigned freelancer
        const applicationsResponse = await fetch(API_ENDPOINTS.taskApplications.getByTask(taskId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (applicationsResponse.ok) {
          const applications = await applicationsResponse.json();
          const acceptedApplication = applications.find((app: TaskApplication) => app.status === 'accepted');

          if (acceptedApplication) {
            // Open review modal
            setFreelancerToReview(acceptedApplication.freelancer.id);
            setIsReviewModalOpen(true);
          } else {
            console.warn('No accepted application found for this task.');
          }
        } else {
          console.error('Failed to fetch applications for the completed task');
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

  // Ensure modals are properly cleaned up when unmounted
  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts
      const modalOverlays = document.querySelectorAll('.fixed.inset-0[role="dialog"]');
      modalOverlays.forEach(overlay => overlay.remove());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Manage Your Tasks
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Create and manage the tasks you've posted for freelancers.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="flex justify-between items-center px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Tasks
            </h3>
            <button
              onClick={() => window.location.href = '/find-work'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Task
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't created any tasks yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {task.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {task.description}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          task.status
                        )}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        Budget: ${task.budget}
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {task.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between">
                      <div className="text-sm text-gray-500">
                        Posted {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => fetchApplications(task.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Applications
                        </button>

                        {task.status === 'in_progress' && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Set as Completed
                          </button>
                        )}

                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleUpdateStatus(task.id, e.target.value)
                          }
                          className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Applications Modal */}
        {isViewingApplications && selectedTaskId && (
          <div className="fixed inset-0 overflow-y-auto z-50" style={{ pointerEvents: 'auto' }} role="dialog">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Applications for: {getSelectedTask()?.title}
                      </h3>

                      {applications.length === 0 ? (
                        <div className="mt-4 text-center py-8">
                          <p className="text-gray-500">No applications yet for this task.</p>
                        </div>
                      ) : (
                        <div className="mt-6">
                          <ul className="divide-y divide-gray-200">
                            {applications.map((application) => (
                              <li key={application.id} className="py-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
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
                                      <h4 className="text-sm font-medium text-gray-900">
                                        {application.freelancer.fullName}
                                      </h4>
                                      <p className="text-xs text-gray-500">
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
                                      to={`/freelancer/${application.freelancer.id}`}
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
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={closeApplicationsModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Details Modal */}
        {isViewingApplicationDetails && selectedApplication && (
          <div className="fixed inset-0 overflow-y-auto z-50" style={{ pointerEvents: 'auto' }} role="dialog">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Application Details
                      </h3>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Applicant:</h4>
                        <div className="flex items-center">
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
                            <p className="text-sm font-medium text-gray-900">
                              {selectedApplication.freelancer.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedApplication.freelancer.title || 'Freelancer'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedApplication.coverLetter && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded">
                            {selectedApplication.coverLetter}
                          </p>
                        </div>
                      )}

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Applied on:</h4>
                        <p className="text-sm text-gray-600">
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
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={closeApplicationDetailsModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {isReviewModalOpen && freelancerToReview && (
          <div className="fixed inset-0 overflow-y-auto z-50" style={{ pointerEvents: 'auto' }} role="dialog">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">


              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Task Completed! Rate your Freelancer
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Thank you for completing this task. Please take a moment to rate the freelancer and provide feedback.
                        </p>
                      </div>

                      <div className="mt-4">
                        <RatingComponent
                          freelancerId={freelancerToReview}
                          onRatingSuccess={handleReviewSuccess}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement; 