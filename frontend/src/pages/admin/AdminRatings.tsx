import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, AlertTriangle, X, Star } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';

interface Rating {
    id: string;
    score: number;
    comment?: string;
    createdAt: string;
    freelancer: {
        id: string;
        fullName: string;
        email: string;
    };
    client: {
        id: string;
        fullName: string;
        email: string;
    };
}

const AdminRatings: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingToDelete, setRatingToDelete] = useState<Rating | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchRatings();
    }, []);

    const fetchRatings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_ENDPOINTS.admin.getRatings, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRatings(response.data);
        } catch (error) {
            console.error('Error fetching ratings:', error);
            toast.error('Failed to fetch ratings');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRating = async () => {
        if (!ratingToDelete) return;

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(API_ENDPOINTS.admin.deleteRating(ratingToDelete.id), {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Rating deleted successfully');
            setRatings(ratings.filter(r => r.id !== ratingToDelete.id));
            setRatingToDelete(null);
        } catch (error) {
            console.error('Error deleting rating:', error);
            toast.error('Failed to delete rating');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredRatings = ratings.filter(
        (rating) =>
            rating.freelancer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rating.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rating.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (score: number) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= score
                            ? isDark ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-500 fill-yellow-500'
                            : isDark ? 'text-gray-600' : 'text-gray-300'
                            }`}
                    />
                ))}
                <span className={`ml-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {score.toFixed(1)}
                </span>
            </div>
        );
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>Ratings Management</h2>

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Search by freelancer, client, or comment..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Rating</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Freelancer</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Client</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Comment</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Created At</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                        {filteredRatings.map((rating) => (
                            <tr key={rating.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderStars(rating.score)}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{rating.freelancer.fullName}</span>
                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{rating.freelancer.email}</span>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{rating.client.fullName}</span>
                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{rating.client.email}</span>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} max-w-md`}>
                                    <p className="truncate" title={rating.comment || 'No comment'}>
                                        {rating.comment || <span className="italic text-gray-400">No comment</span>}
                                    </p>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {new Date(rating.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setRatingToDelete(rating)}
                                        className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {ratingToDelete && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setRatingToDelete(null)}></div>
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md p-6 relative z-10`}>
                        <button
                            onClick={() => setRatingToDelete(null)}
                            className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="flex items-center mb-4 text-red-600">
                            <AlertTriangle className="w-8 h-8 mr-3" />
                            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Rating</h3>
                        </div>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                            Are you sure you want to delete this rating from <strong>{ratingToDelete.client.fullName}</strong> to <strong>{ratingToDelete.freelancer.fullName}</strong>?
                        </p>
                        {ratingToDelete.comment && (
                            <div className={`mb-4 p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} italic`}>"{ratingToDelete.comment}"</p>
                            </div>
                        )}
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                            This action cannot be undone. The freelancer's average rating will be recalculated.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setRatingToDelete(null)}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRating}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Rating'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRatings;

