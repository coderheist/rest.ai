import { useState, useEffect } from 'prop-types';
import PropTypes from 'prop-types';
import { Star, Send, AlertCircle } from 'lucide-react';

const ReviewForm = ({ matchId, jobId, resumeId, existingReview = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    feedback: '',
    stage: 'screening',
    recommendation: 'maybe',
    strengths: [''],
    weaknesses: [''],
    technicalSkills: { rating: 0, notes: '' },
    communication: { rating: 0, notes: '' },
    cultureFit: { rating: 0, notes: '' },
    problemSolving: { rating: 0, notes: '' }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating || 0,
        feedback: existingReview.feedback || '',
        stage: existingReview.stage || 'screening',
        recommendation: existingReview.recommendation || 'maybe',
        strengths: existingReview.strengths?.length > 0 ? existingReview.strengths : [''],
        weaknesses: existingReview.weaknesses?.length > 0 ? existingReview.weaknesses : [''],
        technicalSkills: existingReview.technicalSkills || { rating: 0, notes: '' },
        communication: existingReview.communication || { rating: 0, notes: '' },
        cultureFit: existingReview.cultureFit || { rating: 0, notes: '' },
        problemSolving: existingReview.problemSolving || { rating: 0, notes: '' }
      });
    }
  }, [existingReview]);

  const validate = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please provide an overall rating';
    }

    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
    } else if (formData.feedback.length > 2000) {
      newErrors.feedback = 'Feedback must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const reviewData = {
        matchId,
        jobId,
        resumeId,
        ...formData,
        strengths: formData.strengths.filter(s => s.trim()),
        weaknesses: formData.weaknesses.filter(w => w.trim())
      };

      await onSubmit(reviewData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [''] });
  };

  const handleSkillRatingChange = (skill, field, value) => {
    setFormData({
      ...formData,
      [skill]: { ...formData[skill], [field]: value }
    });
  };

  const renderStarRating = (currentRating, onChange, label) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-700">
          {currentRating > 0 ? `${currentRating}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900">
        {existingReview ? 'Edit Review' : 'Submit Review'}
      </h3>

      {/* Overall Rating */}
      <div>
        {renderStarRating(
          formData.rating,
          (rating) => setFormData({ ...formData, rating }),
          'Overall Rating *'
        )}
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.rating}
          </p>
        )}
      </div>

      {/* Stage and Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Interview Stage *</label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="screening">Screening</option>
            <option value="phone_screen">Phone Screen</option>
            <option value="technical">Technical Interview</option>
            <option value="behavioral">Behavioral Interview</option>
            <option value="final">Final Interview</option>
            <option value="offer">Offer Stage</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recommendation *</label>
          <select
            value={formData.recommendation}
            onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="strong_hire">Strong Hire</option>
            <option value="hire">Hire</option>
            <option value="maybe">Maybe</option>
            <option value="no_hire">No Hire</option>
            <option value="strong_no_hire">Strong No Hire</option>
          </select>
        </div>
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Feedback * ({formData.feedback.length}/2000)
        </label>
        <textarea
          value={formData.feedback}
          onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your detailed assessment of the candidate..."
        />
        {errors.feedback && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.feedback}
          </p>
        )}
      </div>

      {/* Detailed Skill Ratings */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900">Detailed Skill Assessment</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {renderStarRating(
              formData.technicalSkills.rating,
              (rating) => handleSkillRatingChange('technicalSkills', 'rating', rating),
              'Technical Skills'
            )}
          </div>
          <div>
            {renderStarRating(
              formData.communication.rating,
              (rating) => handleSkillRatingChange('communication', 'rating', rating),
              'Communication'
            )}
          </div>
          <div>
            {renderStarRating(
              formData.cultureFit.rating,
              (rating) => handleSkillRatingChange('cultureFit', 'rating', rating),
              'Culture Fit'
            )}
          </div>
          <div>
            {renderStarRating(
              formData.problemSolving.rating,
              (rating) => handleSkillRatingChange('problemSolving', 'rating', rating),
              'Problem Solving'
            )}
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
        <div className="space-y-2">
          {formData.strengths.map((strength, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={strength}
                onChange={(e) => handleArrayChange('strengths', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Strength ${index + 1}`}
              />
              {formData.strengths.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('strengths', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('strengths')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Strength
          </button>
        </div>
      </div>

      {/* Weaknesses */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Areas for Improvement</label>
        <div className="space-y-2">
          {formData.weaknesses.map((weakness, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={weakness}
                onChange={(e) => handleArrayChange('weaknesses', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Area ${index + 1}`}
              />
              {formData.weaknesses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('weaknesses', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('weaknesses')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Area
          </button>
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors.submit}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}</span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

ReviewForm.propTypes = {
  matchId: PropTypes.string.isRequired,
  jobId: PropTypes.string.isRequired,
  resumeId: PropTypes.string.isRequired,
  existingReview: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func
};

export default ReviewForm;
