import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useStore } from '../login/StoreContext';

/**
 * Star Rating Component
 */
const StarRating = ({ rating, size = "w-4 h-4", showNumber = true }) => {
    const numericRating = parseFloat(rating) || 0;

    return (
        <div className="flex items-center">
            {Array(5).fill(0).map((_, index) => (
                <svg
                    key={index}
                    className={`${size} ${index < numericRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            {showNumber && (
                <span className="ml-1 text-xs text-gray-600">({numericRating})</span>
            )}
        </div>
    );
};

/**
 * Review Detail Modal Component
 */
const ReviewModal = ({ review, isOpen, onClose }) => {
    if (!isOpen || !review) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Customer Review Details</h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Review Info */}
                    <div className="mb-6 border-b pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-800">Review ID: {review.id}</h4>
                            <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm">
                            <div className="mb-1">
                                <span className="text-gray-600">Name: </span>
                                <span className="font-medium">{review.name || '—'}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Referring ID: </span>
                                <span className="font-medium">{review.referringId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ratings */}
                    <div className="mb-6 border-b pb-4">
                        <h4 className="text-md font-medium text-gray-700 mb-3">Ratings</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-gray-600 mb-1 text-left">Staff Rating:</div>
                                <StarRating rating={review.ratings?.staff} size="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-gray-600 mb-1 text-left">Hospitality Rating:</div>
                                <StarRating rating={review.ratings?.hospitality} size="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-gray-600 mb-1 text-left">Service Rating:</div>
                                <StarRating rating={review.ratings?.service} size="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-gray-600 mb-1 text-left">Overall Rating:</div>
                                <StarRating rating={review.ratings?.average} size="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Review Comments</h4>
                        <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                            {review.review ? review.review : <em>No comments provided</em>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200 mr-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const Review = () => {
    const { currentStore } = useStore();
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Overview stats (old design format)
    const [ratingStats, setRatingStats] = useState({
        total: 0,
        average: 0,
        counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Fetch review statistics
    useEffect(() => {
        const fetchStatistics = async () => {
            if (!currentStore?.id) {
                setIsLoadingStats(false);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/api/v1/reviews/store/${currentStore.id}/statistics`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                if (result.success && result.data) {
                    const d = result.data;
                    setRatingStats({
                        total: d.total_reviews || 0,
                        average: parseFloat(d.overall_rating) || 0,
                        counts: {
                            1: d.one_stars || 0,
                            2: d.two_stars || 0,
                            3: d.three_stars || 0,
                            4: d.four_stars || 0,
                            5: d.five_stars || 0,
                        },
                    });
                }
            } catch (err) {
                // non-fatal for overview
                console.warn('Failed to load review statistics', err);
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStatistics();
    }, [currentStore?.id]);

    // Fetch reviews from API
    useEffect(() => {
        const fetchReviews = async () => {
            if (!currentStore?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/api/v1/reviews/store/${currentStore.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success && result.data?.reviews) {
                    setReviews(result.data.reviews);
                } else {
                    setError('Failed to load reviews');
                }
            } catch (err) {
                console.error('Failed to load reviews:', err);
                setError(`Failed to load reviews: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [currentStore?.id]);

    // Helpers
    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return "";
        }
    };

    const handleViewDetails = (review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedReview(null);
    };

    // Small UI boxes for the old overview design
    const OverallRatingBox = ({ total, rating }) => (
        <div className="flex items-center gap-3 rounded-lg border px-4 py-3 bg-white shadow-sm">
            <div className="text-3xl font-bold text-teal-600">{Number(rating).toFixed(1)}</div>
            <div className="flex flex-col">
                <StarRating rating={rating} size="w-5 h-5" showNumber={false} />
                <div className="text-xs text-gray-600">{total} reviews</div>
            </div>
        </div>
    );

    const StarRatingBox = ({ stars, count }) => (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-white">
            <div className="flex items-center">
                {Array(stars).fill(0).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-sm text-gray-700">{count}</span>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-2 text-gray-600">Loading reviews...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-8  mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <div className="text-3xl font-bold text-teal-700 text-left mb-4 p-0">Reviews</div>
                <Link
                    to="/submit-review"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Submit Review
                </Link>
            </div>

            {/* Overview - old design restored */}
            <div className="mb-6">
                {isLoadingStats ? (
                    <div className="flex items-center text-sm text-gray-500">Loading overview…</div>
                ) : (
                    <div className="flex flex-wrap gap-3 items-center ">
                        <OverallRatingBox total={ratingStats.total} rating={ratingStats.average} />
                        <div className="mx-2 h-8 border-l border-gray-300"></div>
                        <StarRatingBox stars={5} count={ratingStats.counts[5]} />
                        <StarRatingBox stars={4} count={ratingStats.counts[4]} />
                        <StarRatingBox stars={3} count={ratingStats.counts[3]} />
                        <StarRatingBox stars={2} count={ratingStats.counts[2]} />
                        <StarRatingBox stars={1} count={ratingStats.counts[1]} />
                    </div>
                )}
            </div>

            {/* Cards grid */}
            {(!reviews || reviews.length === 0) ? (
                <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-4">
                    No reviews yet.
                </div>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reviews.map((rev) => (
                        <div
                            key={rev.id}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                            onClick={() => handleViewDetails(rev)}
                        >
                            {/* Header: Name and Date */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                        {rev.name || "—"}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                    {formatDate(rev.createdAt)}
                                </div>
                            </div>

                            {/* Review text */}
                            {rev.review && (
                                <p className="text-sm text-gray-700 mb-3 line-clamp-4 text-left">{rev.review}</p>
                            )}

                            {/* Ratings: 2x2 grid */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div className="flex items-center justify-between border-r border-gray-300 pr-2">
                                    <span className="text-xs text-gray-600 mr-2">Overall</span>
                                    <StarRating rating={rev.ratings?.average} size="w-4 h-4" />
                                </div>
                                <div className="flex items-center justify-between pl-2">
                                    <span className="text-xs text-gray-600 mr-2">Service</span>
                                    <StarRating rating={rev.ratings?.service} size="w-4 h-4" />
                                </div>
                                <div className="flex items-center justify-between border-r border-gray-300 pr-2">
                                    <span className="text-xs text-gray-600 mr-2">Staff</span>
                                    <StarRating rating={rev.ratings?.staff} size="w-4 h-4" />
                                </div>
                                <div className="flex items-center justify-between pl-2">
                                    <span className="text-xs text-gray-600 mr-2">Hospitality</span>
                                    <StarRating rating={rev.ratings?.hospitality} size="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ReviewModal
                review={selectedReview}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default Review;
