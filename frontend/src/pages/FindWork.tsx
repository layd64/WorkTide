import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import CreateTaskForm from '../components/CreateTaskForm';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  status: string;
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
    if (!user || user.userType !== 'freelancer') return;

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
    if (user && user.userType === 'freelancer') {
      fetchMyApplications();
    }
  }, [searchQuery, selectedSkills, user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('findYourNextProject')}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {t('browseAvailableProjects')}
          </p>

          {/* Link to My Applications for freelancer users */}
          {user?.userType === 'freelancer' && (
            <div className="mt-4">
              <Link
                to="/my-applications"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {t('viewMyApplications')}
              </Link>
            </div>
          )}
        </div>

        {/* Task creation form for clients only */}
        {user?.userType === 'client' && (
          <CreateTaskForm onTaskCreated={fetchTasks} />
        )}

        {/* Success message */}
        {successMessage && (
          <div className="text-center py-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Search and filter */}
        <div className="mt-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </form>

          {availableSkills.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by skills:</h3>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedSkills.includes(skill)
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Show loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">{t('loadingTasks')}</p>
          </div>
        )}

        {/* Show error message if any */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* No tasks state */}
        {!isLoading && !error && tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('noTasksFound')}</p>
          </div>
        )}

        {/* Task list */}
        {!isLoading && !error && tasks.length > 0 && (
          <div className="mt-8 grid gap-8">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white shadow overflow-hidden rounded-md"
              >
                <div className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{t('jobPosted')} {new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      ${task.budget}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-700">{task.description}</p>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {task.skills.map((skill) => (
                        <span key={skill} className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                          {task.client.fullName.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{task.client.fullName}</p>
                      </div>
                    </div>
                    {user?.userType === 'freelancer' && (
                      <div>
                        {hasApplied(task.id) ? (
                          <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-green-100 text-green-800">
                            {t('applied')}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(task.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            {t('applyNow')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Application Modal */}
        {isApplying && selectedTaskId && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" role="dialog">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">{t('applyForThisTask')}</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">{t('coverLetter')}</label>
                  <textarea
                    id="coverLetter"
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={t('tellClientWhyYoureGoodFit')}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeApplyModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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