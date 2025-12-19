import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { matchAPI, interviewAPI } from '../services/api';

const MatchDetail = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [generatingKit, setGeneratingKit] = useState(false);
  const [interviewKit, setInterviewKit] = useState(null);

  useEffect(() => {
    fetchMatch();
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to={`/jobs/${match.jobId._id}/candidates`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Candidates
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Match Analysis
        </h1>
        <p className="text-gray-600">
          Detailed breakdown of candidate match for this position
        </p>
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

      {/* Component Scores */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
        
        {/* Skills Match */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Skills Match</h4>
            <span className={`text-2xl font-bold ${getScoreColor(match.skillMatch?.score || 0)}`}>
              {match.skillMatch?.score || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${match.skillMatch?.score || 0}%` }}
            ></div>
          </div>
          
          {/* Matched Skills */}
          {match.skillMatch?.matchedSkills && match.skillMatch.matchedSkills.length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">Matched Skills ({match.skillMatch.matchedSkills.length})</div>
              <div className="flex flex-wrap gap-2">
                {match.skillMatch.matchedSkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                    {skill.skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {match.skillMatch?.missingSkills && match.skillMatch.missingSkills.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-2">Missing Skills ({match.skillMatch.missingSkills.length})</div>
              <div className="flex flex-wrap gap-2">
                {match.skillMatch.missingSkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Match */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Experience Match</h4>
            <span className={`text-2xl font-bold ${getScoreColor(match.experienceMatch?.score || 0)}`}>
              {match.experienceMatch?.score || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${match.experienceMatch?.score || 0}%` }}
            ></div>
          </div>
          {match.experienceMatch?.details && (
            <p className="text-sm text-gray-600">{match.experienceMatch.details}</p>
          )}
        </div>

        {/* Education Match */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Education Match</h4>
            <span className={`text-2xl font-bold ${getScoreColor(match.educationMatch?.score || 0)}`}>
              {match.educationMatch?.score || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${match.educationMatch?.score || 0}%` }}
            ></div>
          </div>
          {match.educationMatch?.details && (
            <p className="text-sm text-gray-600">{match.educationMatch.details}</p>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default MatchDetail;
