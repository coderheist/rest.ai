import PropTypes from 'prop-types';
import { Star, User, Calendar, ThumbsUp, ThumbsDown, Award } from 'lucide-react';

const ReviewCard = ({ review, onEdit, onDelete, canEdit = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecommendationBadge = (recommendation) => {
    const badges = {
      strong_hire: { text: 'Strong Hire', color: 'bg-green-100 text-green-800', icon: <Award className="w-3 h-3" /> },
      hire: { text: 'Hire', color: 'bg-blue-100 text-blue-800', icon: <ThumbsUp className="w-3 h-3" /> },
      maybe: { text: 'Maybe', color: 'bg-yellow-100 text-yellow-800', icon: null },
      no_hire: { text: 'No Hire', color: 'bg-orange-100 text-orange-800', icon: <ThumbsDown className="w-3 h-3" /> },
      strong_no_hire: { text: 'Strong No Hire', color: 'bg-red-100 text-red-800', icon: <ThumbsDown className="w-3 h-3" /> }
    };

    const badge = badges[recommendation] || badges.maybe;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        <span>{badge.text}</span>
      </span>
    );
  };

  const getStageColor = (stage) => {
    const colors = {
      screening: 'bg-gray-100 text-gray-700',
      phone_screen: 'bg-blue-100 text-blue-700',
      technical: 'bg-purple-100 text-purple-700',
      behavioral: 'bg-green-100 text-green-700',
      final: 'bg-orange-100 text-orange-700',
      offer: 'bg-pink-100 text-pink-700'
    };
    return colors[stage] || colors.screening;
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-900">
                {review.reviewerId?.name || 'Unknown Reviewer'}
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(review.stage)}`}>
              {review.stage.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(review.createdAt)}</span>
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <span className="text-xs">(edited)</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getRecommendationBadge(review.recommendation)}
          {canEdit && (
            <div className="flex space-x-1">
              <button
                onClick={() => onEdit(review)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(review._id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overall Rating */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
          {renderStars(review.rating)}
          <span className="text-lg font-bold text-gray-900">{review.rating}/5</span>
        </div>
      </div>

      {/* Detailed Ratings */}
      {(review.technicalSkills?.rating || review.communication?.rating || review.cultureFit?.rating || review.problemSolving?.rating) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          {review.technicalSkills?.rating && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Technical Skills</div>
              <div className="flex items-center space-x-1">
                {renderStars(review.technicalSkills.rating)}
              </div>
            </div>
          )}
          {review.communication?.rating && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Communication</div>
              <div className="flex items-center space-x-1">
                {renderStars(review.communication.rating)}
              </div>
            </div>
          )}
          {review.cultureFit?.rating && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Culture Fit</div>
              <div className="flex items-center space-x-1">
                {renderStars(review.cultureFit.rating)}
              </div>
            </div>
          )}
          {review.problemSolving?.rating && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Problem Solving</div>
              <div className="flex items-center space-x-1">
                {renderStars(review.problemSolving.rating)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Feedback</h4>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {review.feedback}
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {review.strengths && review.strengths.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {review.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}
        {review.weaknesses && review.weaknesses.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center">
              <ThumbsDown className="w-4 h-4 mr-1" />
              Areas for Improvement
            </h4>
            <ul className="space-y-1">
              {review.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

ReviewCard.propTypes = {
  review: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    reviewerId: PropTypes.shape({
      name: PropTypes.string
    }),
    rating: PropTypes.number.isRequired,
    feedback: PropTypes.string.isRequired,
    stage: PropTypes.string.isRequired,
    recommendation: PropTypes.string.isRequired,
    strengths: PropTypes.array,
    weaknesses: PropTypes.array,
    technicalSkills: PropTypes.object,
    communication: PropTypes.object,
    cultureFit: PropTypes.object,
    problemSolving: PropTypes.object,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canEdit: PropTypes.bool
};

export default ReviewCard;
