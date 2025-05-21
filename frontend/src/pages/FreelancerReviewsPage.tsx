import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AllReviewsComponent from '../components/AllReviewsComponent';
import { API_ENDPOINTS } from '../config/api';

interface Freelancer {
  id: string;
  fullName: string;
}

const FreelancerReviewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchFreelancerData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading reviews...</p>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AllReviewsComponent
          freelancerId={freelancer.id}
          freelancerName={freelancer.fullName}
          backToProfile={true}
        />
      </div>
    </div>
  );
};

export default FreelancerReviewsPage; 