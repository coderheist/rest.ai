import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { matchAPI, interviewAPI, reviewAPI, exportAPI } from '../services/api';
import Layout from '../components/Layout';
import { Star, Users, MessageSquare, FileDown, FileText } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import MatchExplanation from '../components/MatchExplanation';

const MatchDetail = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [generatingKit, setGeneratingKit] = useState(false);
  const [interviewKit, setInterviewKit] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    fetchMatch();
    fetchReviews();
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const response = await matchAPI.getMatch(matchId);
      setMatch(response.data);

      // Check if interview kit exists
      if (response.data.resumeId?._id) {
        try {
          const kitResponse = await interviewAPI.getResumeKits(response.data.resumeId._id);
          const existingKit = kitResponse.data.find(k => k.jobId._id === response.data.jobId._id);
          if (existingKit) {
            setInterviewKit(existingKit);
          }
        } catch (err) {
          console.log('No existing interview kit');
        }
      }
    } catch (err) {
      console.error('Error fetching match:', err);
      setError(err.response?.data?.error || 'Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKit = async () => {
    try {
      setGeneratingKit(true);
      const response = await interviewAPI.generateKit(match.jobId._id, match.resumeId._id);
      setInterviewKit(response.data);
      
      // Navigate to kit after 2 seconds or if already completed
      setTimeout(() => {
        navigate(`/interviews/${response.data._id}`);
      }, response.data.generationStatus === 'completed' ? 0 : 2000);
    } catch (err) {
      console.error('Error generating interview kit:', err);
      alert(err.response?.data?.error || 'Failed to generate interview kit');
    } finally {
      setGeneratingKit(false);
    }
  };

  const handleStatusUpdate = async (newStatus, notes = null) => {
    try {
      setUpdating(true);
      await matchAPI.updateMatchStatus(matchId, newStatus, notes);
      await fetchMatch(); // Reload
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const [reviewsRes, avgRes] = await Promise.all([
        reviewAPI.getByMatch(matchId),
        reviewAPI.getAverageRating(matchId)
      ]);
      setReviews(reviewsRes.data.reviews || []);
      setAverageRating(avgRes.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (editingReview) {
        await reviewAPI.update(editingReview._id, reviewData);
      } else {
        await reviewAPI.create(reviewData);
      }
      setShowReviewForm(false);
      setEditingReview(null);
      await fetchReviews();
      await fetchMatch(); // Refresh match to update review stats
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const handleReviewEdit = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await reviewAPI.delete(reviewId);
      await fetchReviews();
      await fetchMatch(); // Refresh match to update review stats
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await exportAPI.exportCandidatePDF(matchId);
      const candidateName = match.resumeId.personalInfo?.fullName || 'candidate';
      exportAPI.downloadFile(response.data, `${candidateName}_report.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Match not found'}</p>
          <Link to="/jobs" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <Link to={`/jobs/${match.jobId._id}/candidates`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Candidates
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Match Analysis
            </h1>
            <p className="text-gray-600">
              Detailed breakdown of candidate match for this position
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Overall Score Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Overall Match Score</h2>
            <p className="text-blue-100">
              {match.jobId.title} · {match.resumeId.personalInfo?.fullName || 'Candidate'}
            </p>
          </div>
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(match.overallScore)}`}>
                {match.overallScore}
              </div>
              <div className="text-sm text-gray-600">out of 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate & Job Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Job Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Details</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Job Title</div>
              <div className="font-medium text-gray-900">{match.jobId.title}</div>
            </div>
            {match.jobId.company && (
              <div>
                <div className="text-sm text-gray-500">Company</div>
                <div className="font-medium text-gray-900">{match.jobId.company}</div>
              </div>
            )}
            {match.jobId.department && (
              <div>
                <div className="text-sm text-gray-500">Department</div>
                <div className="font-medium text-gray-900">{match.jobId.department}</div>
              </div>
            )}
            <Link
              to={`/jobs/${match.jobId._id}`}
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              View Full Job Description →
            </Link>
          </div>
        </div>

        {/* Candidate Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Details</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Full Name</div>
              <div className="font-medium text-gray-900">
                {match.resumeId.personalInfo?.fullName || 'N/A'}
              </div>
            </div>
            {match.resumeId.personalInfo?.email && (
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium text-gray-900">{match.resumeId.personalInfo.email}</div>
              </div>
            )}
            {match.resumeId.personalInfo?.phone && (
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium text-gray-900">{match.resumeId.personalInfo.phone}</div>
              </div>
            )}
            <Link
              to={`/resumes/${match.resumeId._id}`}
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              View Full Resume →
            </Link>
          </div>
        </div>
      </div>

      {/* AI Match Explanation */}
      <MatchExplanation match={match} />

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        {match.strengths && match.strengths.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Strengths</h3>
            <ul className="space-y-2">
              {match.strengths.map((strength, index) => (
                <li key={index} className="flex items-start text-green-800">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {match.concerns && match.concerns.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">Concerns</h3>
            <ul className="space-y-2">
              {match.concerns.map((concern, index) => (
                <li key={index} className="flex items-start text-orange-800">
                  <span className="text-orange-600 mr-2 font-bold">!</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Reasoning */}
      {match.aiReasoning && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis</h3>
          <p className="text-gray-700 leading-relaxed">{match.aiReasoning}</p>
        </div>
      )}

      {/* Interview Kit Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Preparation</h3>
        
        {interviewKit ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  interviewKit.generationStatus === 'completed' ? 'bg-green-100 text-green-800' :
                  interviewKit.generationStatus === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                  interviewKit.generationStatus === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {interviewKit.generationStatus === 'completed' ? '✓ Ready' :
                   interviewKit.generationStatus === 'generating' ? '⏳ Generating...' :
                   interviewKit.generationStatus === 'failed' ? '✗ Failed' :
                   'Pending'}
                </span>
                <span className="text-sm text-gray-600">
                  {interviewKit.totalQuestions || 0} questions • {interviewKit.estimatedDuration || 60} minutes
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Interview kit generated on {new Date(interviewKit.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link
              to={`/interviews/${interviewKit._id}`}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              View Interview Kit
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 mb-4">
              Generate a personalized interview kit with technical and behavioral questions tailored to this candidate's profile.
            </p>
            <button
              onClick={handleGenerateKit}
              disabled={generatingKit}
              className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium ${
                generatingKit ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {generatingKit ? '⏳ Generating Kit...' : '✨ Generate Interview Kit'}
            </button>
          </div>
        )}
      </div>

      {/* Team Reviews Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Reviews
              {reviews.length > 0 && (
                <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
              )}
            </h3>
            {averageRating && averageRating.reviewCount > 0 && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {averageRating.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({averageRating.reviewCount} {averageRating.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Write Review
            </button>
          )}
        </div>

        {/* Average Ratings Breakdown */}
        {averageRating && averageRating.reviewCount > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            {averageRating.averageTechnical > 0 && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Technical</div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{averageRating.averageTechnical.toFixed(1)}</span>
                </div>
              </div>
            )}
            {averageRating.averageCommunication > 0 && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Communication</div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{averageRating.averageCommunication.toFixed(1)}</span>
                </div>
              </div>
            )}
            {averageRating.averageCultureFit > 0 && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Culture Fit</div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{averageRating.averageCultureFit.toFixed(1)}</span>
                </div>
              </div>
            )}
            {averageRating.averageProblemSolving > 0 && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Problem Solving</div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{averageRating.averageProblemSolving.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-6">
            <ReviewForm
              matchId={matchId}
              jobId={match.jobId._id}
              resumeId={match.resumeId._id}
              existingReview={editingReview}
              onSubmit={handleReviewSubmit}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
            />
          </div>
        )}

        {/* Reviews List */}
        {loadingReviews ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onEdit={handleReviewEdit}
                onDelete={handleReviewDelete}
                canEdit={true} // You might want to check if current user is the reviewer
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet. Be the first to review this candidate!</p>
          </div>
        )}
      </div>

      {/* Status & Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Status</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleStatusUpdate('reviewed')}
            disabled={updating || match.status === 'reviewed'}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              match.status === 'reviewed'
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-green-600 text-white hover:bg-green-700'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {match.status === 'reviewed' ? '✓ Reviewed' : 'Mark as Reviewed'}
          </button>
          <button
            onClick={() => handleStatusUpdate('rejected', 'Not a suitable match')}
            disabled={updating || match.status === 'rejected'}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              match.status === 'rejected'
                ? 'bg-red-100 text-red-700 cursor-default'
                : 'bg-red-600 text-white hover:bg-red-700'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {match.status === 'rejected' ? '✗ Rejected' : 'Reject'}
          </button>
        </div>
        {match.reviewedAt && (
          <p className="text-sm text-gray-500 mt-3">
            Last reviewed on {new Date(match.reviewedAt).toLocaleString()}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default MatchDetail;
