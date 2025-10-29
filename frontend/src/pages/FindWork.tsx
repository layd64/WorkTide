import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MotionWrapper from '../components/common/MotionWrapper';

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  status: string;
  imageUrl?: string;
  createdAt: string;
  client: {
    id: string;
    fullName: string;
    imageUrl?: string;
  };
}

interface TaskApplication {
  id: string;
  taskId: string;
  status: string;
  createdAt: string;
}

const FindWork: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [myApplications, setMyApplications] = useState<TaskApplication[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API_ENDPOINTS.tasks.getAll(
          searchQuery || undefined,
          selectedSkills.length > 0 ? selectedSkills : undefined,
          'open'
        )
      );

      if (response.ok) {
        const data = await response.json();
        setTasks(data);

        // Extract unique skills from tasks for filtering
        const skills = new Set<string>();
        data.forEach((task: Task) => {
          task.skills.forEach((skill) => skills.add(skill));
        });
        setAvailableSkills(Array.from(skills));
      } else {
        setError('Failed to fetch tasks. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (!user) return;

    try {
      const response = await fetch(API_ENDPOINTS.taskApplications.getByFreelancer, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyApplications(data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (user) {
      fetchMyApplications();
    }
  }, [searchQuery, selectedSkills, user?.id]);

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleApply = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsApplying(true);
    setCoverLetter('');
  };

  const closeApplyModal = () => {
    setIsApplying(false);
    setSelectedTaskId(null);
    setCoverLetter('');
  };

  const submitApplication = async () => {
    if (!selectedTaskId) return;

    try {
      const response = await fetch(API_ENDPOINTS.taskApplications.apply(selectedTaskId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coverLetter: coverLetter.trim() || undefined,
        }),
      });

      if (response.ok) {
        setSuccessMessage(t('applicationSubmittedSuccess'));
        closeApplyModal();
        fetchMyApplications();

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  const hasApplied = (taskId: string) => {
    return myApplications.some(app => app.taskId === taskId);
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
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('findYourNextProject')}</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('browseAvailableProjects')}</p>
        </div>

        {/* Search and Filter Section */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-8`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} absolute left-3 top-1/2 transform -translate-y-1/2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t('searchTasks') || 'Search tasks...'}
                  className={`w-full pl-10 pr-4 py-2 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('filterBySkillsLabel')}</span>
            </div>
          </div>

          {/* Skills Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            {availableSkills.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkillFilter(skill)}
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

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 px-6 py-4 rounded-lg shadow-lg bg-green-500 text-white">
            {successMessage}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${isDark ? 'border-blue-400' : 'border-blue-600'} border-r-transparent`} role="status">
              <span className="sr-only">{t('loading')}</span>
            </div>
            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('loadingTasks')}</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className={`${isDark ? 'bg-red-900/20 border-red-500 text-red-300' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded`}>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && tasks.length === 0 && (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('noTasksFound')}</p>
          </div>
        )}

        {/* Tasks Grid */}
        {!isLoading && !error && tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task, index) => (
              <MotionWrapper
                key={task.id}
                type="fadeIn"
                delay={index * 0.1}
                className="h-full"
              >
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full`}>
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

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex-1`}>{task.title}</h3>
                      <span className={`ml-2 text-lg font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        ${task.budget}
                      </span>
                    </div>

                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 line-clamp-3`}>{task.description}</p>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {task.skills.map((skill) => (
                          <span
                            key={skill}
                            className={`px-2 py-1 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} rounded-full text-sm`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Client Info */}
                    <div
                      className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80"
                      onClick={() => navigate(`/profile/${task.client.id}`)}
                    >
                      <div className="flex-shrink-0">
                        {task.client.imageUrl ? (
                          <img
                            src={task.client.imageUrl}
                            alt={task.client.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                            {task.client.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'}`}>
                          {task.client.fullName}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('jobPosted')} {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Apply Button */}
                    {user && task.client.id !== user.id && (
                      <div className="mt-4">
                        {hasApplied(task.id) ? (
                          <div className={`w-full px-4 py-2 ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'} rounded-lg text-center font-medium`}>
                            {t('applied')}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(task.id)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            {t('applyNow')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        )}

        {/* Application Modal */}
        {isApplying && selectedTaskId && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" role="dialog">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full mx-4`}>
              <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('applyForThisTask')}</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="coverLetter" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('coverLetter')}</label>
                  <textarea
                    id="coverLetter"
                    rows={4}
                    className={`w-full ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder={t('tellClientWhyYoureGoodFit')}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className={`px-6 py-4 border-t ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} flex justify-end space-x-3`}>
                <button
                  type="button"
                  onClick={closeApplyModal}
                  className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={submitApplication}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {t('submit')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindWork; 