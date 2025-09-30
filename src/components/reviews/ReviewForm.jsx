import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../login/StoreContext"; // Import useStore
import { useNotification } from "../../contexts/NotificationContext"; // Import notification hook

/**
 * Star Rating component for use within the form
 */
const StarRating = ({ label, rating, setRating }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="mb-6">
      <div className="text-lg font-medium text-gray-700 mb-2">{label}</div>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            type="button"
            key={star}
            className={`text-3xl focus:outline-none ${
              star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating ? (
            rating === 1 ? "Poor" :
            rating === 2 ? "Fair" :
            rating === 3 ? "Good" :
            rating === 4 ? "Very Good" :
            "Excellent"
          ) : "Not rated"}
        </span>
      </div>
    </div>
  );
};

/**
 * ReviewForm component
 * Allows customers to submit reviews with star ratings
 * Can receive an ID parameter via URL to load existing review data
 */
const ReviewForm = ({ onSubmit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentStore } = useStore(); // Get current store from context
  const { showNotification } = useNotification(); // Get notification function
  const [loading, setLoading] = useState(id ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
  name: "",
    serviceRating: 0,
    staffRating: 0,
    hospitalityRating: 0,
    review: ""
  });

  // Effect to load review data when ID is provided (remains for future use)
  useEffect(() => {
    if (id) {
      setLoading(true);
      setTimeout(() => {
        const mockReviewData = {
          serviceRating: 4,
          staffRating: 5,
          hospitalityRating: 3,
          review: "This is a sample review loaded based on the ID parameter."
        };
        setFormData(mockReviewData);
        setLoading(false);
      }, 500);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentStore?.id) {
        setError("No store selected. Cannot submit review.");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
        storeId: currentStore.id,
        referringId: crypto.randomUUID(), // Add a random UUID
  name: formData.name?.trim() || undefined,
        staffRating: formData.staffRating,
        hospitalityRating: formData.hospitalityRating,
        serviceRating: formData.serviceRating,
        review: formData.review,
    };

    try {
        const response = await fetch('http://localhost:3000/api/v1/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success) {
            showNotification("Review submitted successfully!", "success");
            navigate('/reviews'); // Navigate back to the reviews list
        } else {
            throw new Error(result.message || "Failed to submit review.");
        }
    } catch (err) {
        setError(err.message);
        console.error("Submission error:", err);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Customer Review</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Customer name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">Your Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          {/* Star rating for service */}
          <StarRating 
            label="Rate Our Service" 
            rating={formData.serviceRating}
            setRating={(value) => setFormData(prev => ({ ...prev, serviceRating: value }))}
          />
          
          {/* Star rating for staff */}
          <StarRating 
            label="Rate Our Staff" 
            rating={formData.staffRating}
            setRating={(value) => setFormData(prev => ({ ...prev, staffRating: value }))}
          />
          
          {/* Star rating for hospitality */}
          <StarRating 
            label="Our Hospitality" 
            rating={formData.hospitalityRating}
            setRating={(value) => setFormData(prev => ({ ...prev, hospitalityRating: value }))}
          />

          {/* Comments section */}
          <div className="mb-6">
            <div className="text-lg font-medium text-gray-700 mb-2 flex items-center">
              Write your review here <span className="ml-2 text-yellow-500">👇</span>
            </div>
            <textarea
              name="review"
              value={formData.review}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Your comments..."
              rows={5}
            />
          </div>

          {/* Error message display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Submit button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-md transition duration-200 w-full sm:w-auto disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}
      </div>
    </div>
  );
};

export default ReviewForm;
