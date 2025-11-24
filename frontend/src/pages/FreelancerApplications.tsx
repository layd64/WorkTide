import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';

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
  status: string;
  createdAt: string;
  coverLetter?: string;
  taskId: string;
  freelancerId: string;
  task: Task;
}

const FreelancerApplications: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation();
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchApplications();

    // Set up periodic refresh every 60 seconds to check for task status changes
    const refreshInterval = setInterval(() => {
      fetchApplications(false); // Pass false to avoid showing loading state during refresh
    }, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [user, token]);

  const fetchApplications = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.taskApplications.getByFreelancer, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError('Failed to fetch applications. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while loading your applications.');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return app.status === 'pending';
    if (activeTab === 'accepted') return app.status === 'accepted' && app.task.status === 'in_progress';
    if (activeTab === 'completed') return app.task.status === 'completed';
    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'pending':
          return 'bg-indigo-900 text-indigo-200';
        case 'accepted':
          return 'bg-green-900 text-green-200';
        case 'rejected':
          return 'bg-red-900 text-red-200';
        default:
          return 'bg-gray-700 text-gray-200';
      }
    } else {
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
    }
  };

  const getTaskStatusBadgeClass = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'open':
          return 'bg-green-900 text-green-200';
        case 'in_progress':
          return 'bg-indigo-900 text-indigo-200';
        case 'completed':
          return 'bg-indigo-900 text-indigo-200';
        default:
          return 'bg-gray-700 text-gray-200';
      }
    } else {
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
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
            {t('myApplications')}
          </h2>
          <p className={`mt-3 max-w-2xl mx-auto text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'} sm:mt-4`}>
            {t('myApplicationsDesc')}
          </p>
        </div>

        {/* Tabs */}
        <div className={`mt-8 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 text-sm font-medium ${activeTab === 'all'
                ? `border-indigo-500 ${isDark ? 'text-indigo-400' : 'text-indigo-600'} border-b-2`
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
            >
              {t('allApplications')}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 text-sm font-medium ${activeTab === 'pending'
                ? `border-indigo-500 ${isDark ? 'text-indigo-400' : 'text-indigo-600'} border-b-2`
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
            >
              {t('pending')}
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`py-4 px-1 text-sm font-medium ${activeTab === 'accepted'
                ? `border-indigo-500 ${isDark ? 'text-indigo-400' : 'text-indigo-600'} border-b-2`
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
            >
              {t('inProgress')}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 text-sm font-medium ${activeTab === 'completed'
                ? `border-indigo-500 ${isDark ? 'text-indigo-400' : 'text-indigo-600'} border-b-2`
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
            >
              {t('completed')}
            </button>
          </div>
        </div>

        {/* Refresh button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => fetchApplications()}
            className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isDark 
                ? 'border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            {t('refresh')}
          </button>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('loadingApplications')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-red-400' : 'text-red-500'}>{error}</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('noApplicationsFound')}</p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/find-work')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {t('findWorkToApply')}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg`}
              >
                <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {application.task.title}
                    </h3>
                    <p className={`mt-1 max-w-2xl text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('appliedOn')} {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>

                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusBadgeClass(application.task.status)}`}>
                      Task: {application.task.status.charAt(0).toUpperCase() + application.task.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <dl>
                    <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                      <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('client')}</dt>
                      <dd
                        className={`mt-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'} sm:mt-0 sm:col-span-2 flex items-center cursor-pointer hover:opacity-80`}
                        onClick={() => navigate(`/profile/${application.task.client.id}`)}
                      >
                        <div className="flex items-center -space-x-2 mr-3">
                          {application.task.imageUrl && (
                            <img
                              src={application.task.imageUrl}
                              alt={application.task.title}
                              className="h-10 w-10 rounded-md object-cover ring-2 ring-white z-10"
                            />
                          )}
                          {application.task.client.imageUrl ? (
                            <img
                              src={application.task.client.imageUrl}
                              alt={application.task.client.fullName}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-white z-20"
                            />
                          ) : (
                            <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center ring-2 ring-white z-20`}>
                              <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                                {application.task.client.fullName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-medium ${isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>{application.task.client.fullName}</span>
                        </div>
                      </dd>
                    </div>
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                      <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('budget')}</dt>
                      <dd className={`mt-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'} sm:mt-0 sm:col-span-2`}>
                        ${application.task.budget}
                      </dd>
                    </div>
                    <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                      <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('projectStatus')}</dt>
                      <dd className={`mt-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'} sm:mt-0 sm:col-span-2`}>
                        {application.task.status === 'completed' ? (
                          <span className={`font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{t('completed')}</span>
                        ) : (
                          application.task.status.charAt(0).toUpperCase() + application.task.status.slice(1).replace('_', ' ')
                        )}
                      </dd>
                    </div>
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                      <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('skillsRequired')}</dt>
                      <dd className={`mt-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'} sm:mt-0 sm:col-span-2`}>
                        <div className="flex flex-wrap gap-2">
                          {application.task.skills.map((skill) => (
                            <span
                              key={skill}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                    <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                      <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('description')}</dt>
                      <dd className={`mt-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'} sm:mt-0 sm:col-span-2`}>
                        {application.task.description}
                      </dd>
                    </div>
                    {application.coverLetter && (
                      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                        <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('yourCoverLetter')}</dt>
                        <dd className={`mt-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'} sm:mt-0 sm:col-span-2`}>
                          {application.coverLetter}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-4 sm:px-6`}>
                  <button
                    onClick={() => navigate(`/find-work`)}
                    className={`text-sm font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                  >
                    {t('findMoreProjects')}
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

export default FreelancerApplications; 