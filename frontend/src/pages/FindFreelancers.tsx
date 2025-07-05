import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../config/api';
import Avatar from '../components/Avatar';
import { useTranslation } from 'react-i18next';

interface Freelancer {
  id: string;
  fullName: string;
  title?: string;
  skills: string[];
  hourlyRate?: number;
  rating?: number;
  completedJobs?: number;
  location?: string;
  imageUrl?: string;
}

const FindFreelancers: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    navigate(`/freelancer-profile/${freelancerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('findFreelancersTitle')}</h1>
          <p className="mt-2 text-gray-600">{t('connectWithTalentedProfessionals')}</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('searchByNameOrSkills')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">{t('filterBySkillsLabel')}</span>
            </div>
          </div>

          {/* Skills Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            {allSkills.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedSkills.includes(skill)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
              <span className="sr-only">{t('loading')}</span>
            </div>
            <p className="mt-4 text-gray-600">{t('loadingFreelancers')}</p>
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
        {!loading && !error && freelancers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('noFreelancersFound')}</p>
          </div>
        )}

        {/* Freelancers Grid */}
        {!loading && !error && freelancers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map(freelancer => (
              <div
                key={freelancer.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewProfile(freelancer.id)}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar
                      fullName={freelancer.fullName}
                      imageUrl={freelancer.imageUrl}
                      className="w-16 h-16"
                      textSize="text-base"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{freelancer.fullName}</h3>
                      <p className="text-gray-600">{freelancer.title || t('freelancer')}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>⭐ {freelancer.rating || 'N/A'}</span>
                      <span>•</span>
                      <span>{freelancer.completedJobs || 0} {t('jobsCompleted')}</span>
                      <span>•</span>
                      <span>{freelancer.location || t('remote')}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills && freelancer.skills.map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      ${freelancer.hourlyRate || 0}/{t('perHour')}
                    </span>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(freelancer.id);
                      }}
                    >
                      {t('viewProfile')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindFreelancers; 