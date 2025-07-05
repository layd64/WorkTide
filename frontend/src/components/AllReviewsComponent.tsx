import React, { useState, useEffect } from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../config/api';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';

interface AllReviewsProps {
  freelancerId: string;
  freelancerName: string;
  backToProfile?: boolean;
}

interface Rating {
  id: string;
  score: number;
  comment?: string;
  createdAt: string;
  client: {
    id: string;
    fullName: string;
    imageUrl?: string;
  };
}

const AllReviewsComponent: React.FC<AllReviewsProps> = ({
  freelancerId,
  freelancerName,
  backToProfile = false
}) => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRatings, setTotalRatings] = useState(0);
  const ratingsPerPage = 10;

  useEffect(() => {
    fetchRatings();
  }, [freelancerId, currentPage]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ratings.getByFreelancer(freelancerId));
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
        setTotalRatings(data.length);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('An error occurred while loading reviews');
    } finally {
      setLoading(false);
    }
  };

  // Calculate ratings stats
  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return sum / ratings.length;
  };

  const getRatingDistribution = () => {
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratings.forEach(rating => {
      distribution[rating.score as keyof typeof distribution]++;
    });

    return distribution;
  };

  // Get paginated ratings
  const getPaginatedRatings = () => {
    const startIndex = (currentPage - 1) * ratingsPerPage;
    const endIndex = startIndex + ratingsPerPage;
    return ratings.slice(startIndex, endIndex);
  };

  const pageCount = Math.ceil(totalRatings / ratingsPerPage);
  const distribution = getRatingDistribution();
  const averageRating = calculateAverageRating();
  const paginatedRatings = getPaginatedRatings();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        {backToProfile && (
          <button
            onClick={() => navigate(`/freelancer-profile/${freelancerId}`)}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to profile
          </button>
        )}

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          All Reviews for {freelancerName}
        </h2>

        {error ? (
          <div className="text-red-600 py-4">{error}</div>
        ) : (
          <>
            {/* Rating Summary */}
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex flex-col items-center md:w-1/4">
                  <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                  <div className="flex mt-2">
                    {[...Array(5)].map((_, index) => (
                      <StarIconSolid
                        key={index}
                        className={`h-5 w-5 ${index < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="text-gray-600 mt-1">{totalRatings} reviews</div>
                </div>

                <div className="md:w-3/4 mt-6 md:mt-0">
                  {[5, 4, 3, 2, 1].map(score => {
                    const count = distribution[score as keyof typeof distribution];
                    const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                    return (
                      <div key={score} className="flex items-center mb-2">
                        <div className="flex items-center w-12">
                          <span className="text-sm font-medium text-gray-600">{score}</span>
                          <StarIconSolid className="h-4 w-4 ml-1 text-yellow-400" />
                        </div>
                        <div className="w-full h-2 mx-4 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-right text-sm text-gray-600">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {totalRatings === 0 ? (
              <p className="text-gray-500 italic text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-6">
                {paginatedRatings.map(rating => (
                  <div key={rating.id} className="border-b border-gray-100 last:border-0 pb-6">
                    <div className="flex items-start">
                      <Avatar
                        fullName={rating.client.fullName}
                        imageUrl={rating.client.imageUrl}
                        className="h-12 w-12 mr-4"
                        textSize="text-sm"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{rating.client.fullName}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, index) => (
                            <StarIconSolid
                              key={index}
                              className={`h-5 w-5 ${index < rating.score ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(rating.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {rating.comment ? (
                          <p className="mt-3 text-gray-700">{rating.comment}</p>
                        ) : (
                          <p className="mt-3 text-gray-500 italic">No written review</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {pageCount > 1 && (
                  <div className="flex items-center justify-center space-x-4 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-full ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>

                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {pageCount}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                      disabled={currentPage === pageCount}
                      className={`p-2 rounded-full ${currentPage === pageCount
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllReviewsComponent; 