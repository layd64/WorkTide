import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../config/api';
import Avatar from '../components/Avatar';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MotionWrapper from '../components/common/MotionWrapper';


interface Freelancer {
  id: string;
  fullName: string;
  title?: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  rating?: number;
  completedJobs?: number;
  location?: string;
  imageUrl?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  skills: string[];
}

const FindFreelancers: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assignment modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


  // Fetch freelancers when component mounts or filters change
  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = API_ENDPOINTS.profile.getAllFreelancers(
          searchQuery || undefined,
          selectedSkills.length > 0 ? selectedSkills : undefined
        );

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch freelancers');
        }

        const data = await response.json();
        setFreelancers(data);
      } catch (err) {
        console.error('Error fetching freelancers:', err);
        setError('Failed to load freelancers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call when typing in search
    const timeoutId = setTimeout(() => {
      fetchFreelancers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedSkills]);

  const allSkills = Array.from(new Set(freelancers.flatMap(f => f.skills).filter(Boolean)));

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleViewProfile = (freelancerId: string) => {
    navigate(`/profile/${freelancerId}`);
  };

  const handleOpenAssignModal = async (freelancer: Freelancer) => {
    // Check auth first before opening modal
    if (!user || !token) {
      setNotification({ type: 'error', message: 'Please log in to assign tasks' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setSelectedFreelancer(freelancer);
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
      // Only show open (non-pending) tasks
      setClientTasks(tasks.filter((task: Task) => task.status === 'open'));
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setNotification({ type: 'error', message: 'Failed to load your tasks' });
      setIsAssignModalOpen(false);
      setSelectedFreelancer(null);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleAssignTask = async (taskId: string) => {
    if (!selectedFreelancer || !token) return;

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
          freelancerId: selectedFreelancer.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send assignment request');
      }

      setNotification({
        type: 'success',
        message: `Assignment request sent to ${selectedFreelancer.fullName}!`,
      });
      setIsAssignModalOpen(false);
      setSelectedFreelancer(null);

      // Auto-hide notification after 3 seconds
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


  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('findFreelancersTitle')}</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('connectWithTalentedProfessionals')}</p>
        </div>

        {/* Search and Filter Section */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-8`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} absolute left-3 top-1/2 transform -translate-y-1/2`} />
                <input
                  type="text"
                  placeholder={t('searchByNameOrSkills')}
                  className={`w-full pl-10 pr-4 py-2 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('filterBySkillsLabel')}</span>
            </div>
          </div>

          {/* Skills Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            {allSkills.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedSkills.includes(skill)
                  ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${isDark ? 'border-blue-400' : 'border-blue-600'} border-r-transparent`} role="status">
              <span className="sr-only">{t('loading')}</span>
            </div>
            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('loadingFreelancers')}</p>
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
        {!loading && !error && freelancers.length === 0 && (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('noFreelancersFound')}</p>
          </div>
        )}

        {/* Freelancers Grid */}
        {!loading && !error && freelancers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((freelancer, index) => (
              <MotionWrapper
                key={freelancer.id}
                type="fadeIn"
                delay={index * 0.1} // Stagger effect
                className="h-full"
              >
                <div
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full`}
                >
                  <div className="p-6 flex flex-col h-full">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleViewProfile(freelancer.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar
                          fullName={freelancer.fullName}
                          imageUrl={freelancer.imageUrl}
                          className="w-16 h-16"
                          textSize="text-base"
                        />
                        <div>
                          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{freelancer.fullName}</h3>
                          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{freelancer.title || t('freelancer')}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span>⭐ {freelancer.rating || 'N/A'}</span>
                          <span>•</span>
                          <span>{freelancer.completedJobs || 0} {t('jobsCompleted')}</span>
                          <span>•</span>
                          <span>{freelancer.location || t('remote')}</span>
                        </div>
                      </div>

                      {/* Profile Visibility for all users */}
                      <div className="mb-6">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} line-clamp-3`}>
                          {freelancer.bio}
                        </p>
                      </div>

                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills && freelancer.skills.map(skill => (
                            <span
                              key={skill}
                              className={`px-2 py-1 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} rounded-full text-sm`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${freelancer.hourlyRate || 0}/{t('perHour')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-4 flex gap-2">
                      <button
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(freelancer.id);
                        }}
                      >
                        {t('viewProfile')}
                      </button>
                      {user && user.id !== freelancer.id && (
                        <button
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAssignModal(freelancer);
                          }}
                        >
                          Send A Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        )}

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
        {isAssignModalOpen && selectedFreelancer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Assign Task to {selectedFreelancer.fullName}
                  </h2>
                  <button
                    onClick={() => {
                      setIsAssignModalOpen(false);
                      setSelectedFreelancer(null);
                    }}
                    className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                  Select one of your available tasks to assign to this freelancer:
                </p>

                {loadingTasks ? (
                  <div className="text-center py-12">
                    <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${isDark ? 'border-blue-400' : 'border-blue-600'} border-r-transparent`} role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading your tasks...</p>
                  </div>
                ) : clientTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>You don't have any available tasks to assign.</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Create a new task in the "My Tasks" section.</p>
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
                            {assigningTask ? 'Assigning...' : 'Assign'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindFreelancers;