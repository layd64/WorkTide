import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { UserCircleIcon, PencilIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Avatar from '../components/Avatar';
import RatingComponent from '../components/RatingComponent';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">{t('profileNotFound')}</h2>
            <p className="mt-2 text-gray-600">{t('pleaseLogin')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header with Edit Button */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar
                fullName={user.fullName}
                className="w-24 h-24 sm:w-32 sm:h-32 text-xl"
              />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.fullName}</h1>
                <p className="text-xl text-gray-600 mt-1">{user.title || t('noTitle')}</p>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {user.rating && (
                    <>
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1 text-gray-700">{user.rating}</span>
                        {user.userType === 'freelancer' && (
                          <Link
                            to={`/freelancer-reviews/${user.id}`}
                            className="ml-1 text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            ({user.completedJobs || 0} {t('reviews')})
                          </Link>
                        )}
                        {user.userType !== 'freelancer' && (
                          <span className="ml-1">({user.completedJobs || 0} {t('jobs')})</span>
                        )}
                      </div>
                      <span className="text-gray-300">•</span>
                    </>
                  )}
                  <div className="text-gray-700">{user.location || t('locationNotSet')}</div>
                  {user.hourlyRate && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="text-green-600 font-medium">${user.hourlyRate}/hr</div>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link to="/settings" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  {t('editProfile')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('aboutMe')}</h2>
                {user.bio ? (
                  <p className="text-gray-700">{user.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">{t('noBioProvided')}</p>
                )}
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('workExperience')}</h2>
                {user.experience && user.experience.length > 0 ? (
                  <div className="space-y-4">
                    {user.experience.map((exp, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-gray-900">{exp.role}</h3>
                        <div className="text-gray-600 text-sm mt-1">{exp.company} • {exp.period}</div>
                        <p className="text-gray-700 mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t('noExperienceProvided')}</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('education')}</h2>
                {user.education && user.education.length > 0 ? (
                  <div className="space-y-4">
                    {user.education.map((edu, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                        <div className="text-gray-600 text-sm mt-1">{edu.institution} • {edu.year}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t('noEducationProvided')}</p>
                )}
              </div>
            </div>

            {/* Reviews section for freelancers */}
            {user.userType === 'freelancer' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{t('ratingsReviews')}</h2>
                    <Link
                      to={`/freelancer-reviews/${user.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      {t('viewAllReviews')}
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                  </div>

                  {/* Show a preview of reviews */}
                  <RatingComponent
                    freelancerId={user.id}
                    previewMode={true}
                    maxReviews={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('skills')}</h2>
                {user.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t('noSkillsProvided')}</p>
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('languages')}</h2>
                {user.languages && user.languages.length > 0 ? (
                  <ul className="space-y-2">
                    {user.languages.map((language, index) => (
                      <li key={index} className="text-gray-700">{language}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">{t('noLanguagesProvided')}</p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('contact')}</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    <span>{t('accountType')}: {user.userType}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <GlobeAltIcon className="h-5 w-5 mr-2" />
                    <span>{t('memberSince')}: {new Date(user.createdAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 