import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showSkillsFilter, setShowSkillsFilter] = useState(false);
  const [allAvailableSkills, setAllAvailableSkills] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 15;

  // Assignment modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


  // Fetch all skills on mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.auth.me.replace('/auth/me', '/skills')}`);
        if (response.ok) {
          const data = await response.json();
          setAllAvailableSkills(data.map((s: { name: string }) => s.name));
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };
    fetchSkills();
  }, []);

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
        // Filter out the current user if they have isHidden set to true (backend should handle this, but adding client-side check as safeguard)
        let filteredData = user && user.isHidden
          ? data.filter((f: Freelancer) => f.id !== user.id)
          : data;

        // Apply rating filter
        if (minRating !== null) {
          filteredData = filteredData.filter((f: Freelancer) => (f.rating || 0) >= minRating);
        }

        // Sort by rating
        filteredData.sort((a: Freelancer, b: Freelancer) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
        });

        setFreelancers(filteredData);
        setCurrentPage(1); // Reset to first page when filters change
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
  }, [searchQuery, selectedSkills, minRating, sortOrder]);



  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  // Pagination calculations
  const totalPages = Math.ceil(freelancers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFreelancers = freelancers.slice(startIndex, endIndex);

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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSkillsFilter(!showSkillsFilter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <FunnelIcon className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('filterBySkillsLabel')}</span>
              </button>

              {/* Rating Filter */}
              <div className="flex items-center gap-2">
                <label className={isDark ? 'text-gray-300' : 'text-gray-600'}>Min Rating:</label>
                <select
                  value={minRating || ''}
                  onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : null)}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">All</option>
                  <option value="3">3.0+</option>
                  <option value="3.5">3.5+</option>
                  <option value="4">4.0+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2">
                <label className={isDark ? 'text-gray-300' : 'text-gray-600'}>Sort by Rating:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="desc">Highest First</option>
                  <option value="asc">Lowest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills Filter Dropdown */}
          {showSkillsFilter && (
            <div className="mt-4">
              <div className="mb-3">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Add Skill Filter:
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addSkill(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select a skill to filter...</option>
                  {allAvailableSkills
                    .filter(skill => !selectedSkills.includes(skill))
                    .map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                </select>
              </div>

              {/* Selected Skills */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => removeSkill(skill)}
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}
                    >
                      {skill}
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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

        {/* Empty State for Pagination */}
        {!loading && !error && freelancers.length > 0 && paginatedFreelancers.length === 0 && (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>No freelancers on this page.</p>
          </div>
        )}

        {/* Freelancers Grid */}
        {!loading && !error && paginatedFreelancers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedFreelancers.map((freelancer, index) => (
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
                            {t('sendARequest')}
                          </button>
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
          <div className="fixed inset-0 overflow-y-auto z-50" role="dialog">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedFreelancer(null);
                }}></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
              <div className={`inline-block align-bottom ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative max-h-[80vh] overflow-y-auto`}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default FindFreelancers;