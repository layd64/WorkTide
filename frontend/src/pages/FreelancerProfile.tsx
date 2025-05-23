import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../config/api';
import RatingComponent from '../components/RatingComponent';
import Avatar from '../components/Avatar';

interface Freelancer {
  id: string;
  name?: string;
  fullName: string;
  title?: string;
  skills?: string[];
  hourlyRate?: number;
  rating?: number;
  completedJobs?: number;
  location?: string;
  imageUrl?: string;
  bio?: string;
  languages?: string[];
  education?: {
    institution: string;
    degree: string;
    year: string;
  }[];
  experience?: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  userType?: string;
  createdAt: string;
}

const FreelancerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFreelancerData = async () => {
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.profile.getById(id));

      if (response.ok) {
        const data = await response.json();
        setFreelancer(data);
      } else {
        setError('Failed to load freelancer profile');
      }
    } catch (err) {
      setError('An error occurred while loading the profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancerData();
  }, [id]);

  // Handle successful rating update
  const handleRatingSuccess = () => {
    // Refresh freelancer data to update the displayed rating
    fetchFreelancerData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Freelancer not found</h2>
            <p className="mt-2 text-gray-600">The freelancer you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/find-freelancers')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to all freelancers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For backward compatibility with the component that expects name property
  const displayName = freelancer.name || freelancer.fullName;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/find-freelancers')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to freelancers
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar
                fullName={displayName}
                className="w-24 h-24 sm:w-32 sm:h-32 text-xl"
              />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{displayName}</h1>
                <p className="text-xl text-gray-600 mt-1">{freelancer.title || 'Freelancer'}</p>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {freelancer.rating && (
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-gray-700">{freelancer.rating.toFixed(1)}</span>
                      <Link
                        to={`/freelancer-reviews/${freelancer.id}`}
                        className="ml-1 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        ({freelancer.completedJobs || 0} reviews)
                      </Link>
                    </div>
                  )}
                  {freelancer.location && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="text-gray-700">{freelancer.location}</div>
                    </>
                  )}
                  {freelancer.hourlyRate && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="text-green-600 font-medium">${freelancer.hourlyRate}/hr</div>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={() => navigate(`/chat/${freelancer.id}`)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Me
                </button>
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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About Me</h2>
                {freelancer.bio ? (
                  <p className="text-gray-700">{freelancer.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio provided</p>
                )}
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Work Experience</h2>
                {freelancer.experience && freelancer.experience.length > 0 ? (
                  <div className="space-y-4">
                    {freelancer.experience.map((exp, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-gray-900">{exp.role}</h3>
                        <div className="text-gray-600 text-sm mt-1">{exp.company} • {exp.period}</div>
                        <p className="text-gray-700 mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No experience information provided</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
                {freelancer.education && freelancer.education.length > 0 ? (
                  <div className="space-y-4">
                    {freelancer.education.map((edu, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                        <div className="text-gray-600 text-sm mt-1">{edu.institution} • {edu.year}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No education information provided</p>
                )}
              </div>
            </div>

            {/* Ratings & Reviews Section with View All link */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Ratings & Reviews</h2>
                  <Link
                    to={`/freelancer-reviews/${freelancer.id}`}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    View all reviews
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                {/* RatingComponent will display a preview of reviews */}
                {freelancer.id && (
                  <RatingComponent
                    freelancerId={freelancer.id}
                    onRatingSuccess={handleRatingSuccess}
                    previewMode={true}
                    maxReviews={3}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                {freelancer.skills && freelancer.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills listed</p>
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
                {freelancer.languages && freelancer.languages.length > 0 ? (
                  <ul className="space-y-2">
                    {freelancer.languages.map((language, index) => (
                      <li key={index} className="text-gray-700">{language}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No languages listed</p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/chat/${freelancer.id}`)}
                    className="flex items-center text-gray-700 hover:text-blue-600 w-full text-left"
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    <span>Send a message</span>
                  </button>
                  <a href="#" className="flex items-center text-gray-700 hover:text-blue-600">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    <span>Schedule a call</span>
                  </a>
                  <a href="#" className="flex items-center text-gray-700 hover:text-blue-600">
                    <GlobeAltIcon className="h-5 w-5 mr-2" />
                    <span>View portfolio</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;