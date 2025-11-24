import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { validateNumberRange, validateTextLength } from '../utils/validation';

interface RatingProps {
  freelancerId: string;
  onRatingSuccess?: () => void;
  previewMode?: boolean;
  maxReviews?: number;
  forceShowRatingForm?: boolean; // Force show the rating input form, useful for modal contexts
  readOnly?: boolean; // If true, never show the rating form
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

const RatingComponent: React.FC<RatingProps> = ({
  freelancerId,
  onRatingSuccess,
  previewMode = false,
  maxReviews = 3,
  forceShowRatingForm = false,
  readOnly = false
}) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchRatings();
    if (token) {
      checkExistingRating();
    }
  }, [freelancerId, token]);

  const fetchRatings = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ratings.getByFreelancer(freelancerId));
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  };

  const checkExistingRating = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ratings.checkRating(freelancerId), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists && data.rating) {
          setUserRating(data.rating.score);
          setComment(data.rating.comment || '');
          setHasRated(true);
        }
      }
    } catch (err) {
      console.error('Error checking existing rating:', err);
    }
  };

  const handleSubmitRating = async () => {
    if (!userRating) {
      setError('Please select a rating');
      return;
    }

    // Validate input
    const scoreError = validateNumberRange(userRating, 'Rating', 1, 5);
    if (scoreError) {
      setError(scoreError);
      return;
    }

    if (comment) {
      const commentError = validateTextLength(comment, 'Comment', 0, 1000);
      if (commentError) {
        setError(commentError);
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(API_ENDPOINTS.ratings.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          freelancerId,
          score: userRating,
          comment,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setHasRated(true);
        fetchRatings(); // Refresh ratings
        if (onRatingSuccess) {
          onRatingSuccess();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit rating');
      }
    } catch (err) {
      setError('An error occurred while submitting your rating');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render stars for rating input
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const isFilled = (hoverRating !== null ? hoverRating >= star : userRating !== null && userRating >= star);

      return (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onClick={() => setUserRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(null)}
        >
          {isFilled ? (
            <StarIconSolid className="h-8 w-8 text-yellow-400" />
          ) : (
            <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
          )}
        </button>
      );
    });
  };

  // Render rating item
  const renderRatingItem = (rating: Rating) => {
    return (
      <div key={rating.id} className="border-b border-gray-100 last:border-0 py-4">
        <div className="flex items-start">
          <Avatar
            fullName={rating.client.fullName}
            imageUrl={rating.client.imageUrl}
            className="h-10 w-10 mr-4"
            textSize="text-xs"
            onClick={() => navigate(`/profile/${rating.client.id}`)}
          />
          <div className="flex-1">
            <p
              className="font-medium cursor-pointer hover:text-blue-600"
              onClick={() => navigate(`/profile/${rating.client.id}`)}
            >{rating.client.fullName}</p>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, index) => (
                <StarIconSolid
                  key={index}
                  className={`h-4 w-4 ${index < rating.score ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {new Date(rating.createdAt).toLocaleDateString()}
              </span>
            </div>
            {rating.comment && (
              <p className="mt-2 text-gray-700">{rating.comment}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Get the reviews to display (all or limited based on previewMode)
  const displayedRatings = previewMode ? ratings.slice(0, maxReviews) : ratings;

  return (
    <div className={previewMode ? "" : "bg-white rounded-lg shadow-sm overflow-hidden"}>
      <div className={previewMode ? "" : "p-6"}>
        {!previewMode && (
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ratings & Reviews</h2>
        )}

        {/* Client rating form - show when forceShowRatingForm is true OR when a user is viewing another user's profile */}
        {/* AND readOnly is false */}
        {!readOnly && (forceShowRatingForm || (user && user.id !== freelancerId)) && (
          <div className="mb-8 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {hasRated ? 'Your Rating' : 'Rate This Freelancer'}
            </h3>

            <div className="flex mb-4">
              {renderStars()}
            </div>

            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Your Review (Optional)
              </label>
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                placeholder="Share your experience working with this freelancer..."
              />
            </div>

            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}

            {success && (
              <div className="mb-4 text-green-600 text-sm">
                Your rating has been submitted successfully!
              </div>
            )}

            <button
              onClick={handleSubmitRating}
              disabled={loading || !userRating}
              className={`px-4 py-2 rounded-md ${loading || !userRating
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {loading ? 'Submitting...' : hasRated ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        )}

        {/* Ratings list - always show ratings regardless of user type */}
        <div>
          {!previewMode && (
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Client Reviews ({ratings.length})
            </h3>
          )}

          {ratings.length === 0 ? (
            <p className="text-gray-500 italic">No reviews yet</p>
          ) : (
            <div className="space-y-2">
              {displayedRatings.map(renderRatingItem)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingComponent; 