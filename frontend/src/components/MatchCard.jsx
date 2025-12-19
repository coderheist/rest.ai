import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const MatchCard = ({ match, showJob = true, showResume = true }) => {
  // Score color based on match quality
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Recommendation badge
  const getRecommendationBadge = (recommendation) => {
    const badges = {
      strong_match: { text: 'Strong Match', color: 'bg-green-100 text-green-800' },
      good_match: { text: 'Good Match', color: 'bg-blue-100 text-blue-800' },
      potential_match: { text: 'Potential Match', color: 'bg-yellow-100 text-yellow-800' },
      weak_match: { text: 'Weak Match', color: 'bg-orange-100 text-orange-800' },
      not_recommended: { text: 'Not Recommended', color: 'bg-red-100 text-red-800' }
    };

    const badge = badges[recommendation] || badges.not_recommended;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // Status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', color: 'bg-gray-100 text-gray-700' },
      completed: { text: 'Completed', color: 'bg-blue-100 text-blue-700' },
      reviewed: { text: 'Reviewed', color: 'bg-green-100 text-green-700' },
      rejected: { text: 'Rejected', color: 'bg-red-100 text-red-700' }
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        {/* Score Circle */}
        <div className={`flex-shrink-0 w-20 h-20 rounded-full border-4 flex items-center justify-center ${getScoreColor(match.overallScore)}`}>
          <div className="text-center">
            <div className="text-2xl font-bold">{match.overallScore}</div>
            <div className="text-xs">Score</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-2 items-end">
          {getRecommendationBadge(match.recommendation)}
          {getStatusBadge(match.status)}
          {match.rank && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Rank #{match.rank}
            </span>
          )}
        </div>
      </div>

      {/* Job Info */}
      {showJob && match.jobId && (
        <div className="mb-3">
          <div className="text-sm text-gray-500">Position</div>
          <Link 
            to={`/jobs/${match.jobId._id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {match.jobId.title}
          </Link>
          {match.jobId.company && (
            <div className="text-sm text-gray-600">{match.jobId.company}</div>
          )}
        </div>
      )}

      {/* Resume/Candidate Info */}
      {showResume && match.resumeId && (
        <div className="mb-4">
          <div className="text-sm text-gray-500">Candidate</div>
          <Link 
            to={`/resumes/${match.resumeId._id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {match.resumeId.personalInfo?.fullName || 'Unknown Candidate'}
          </Link>
          {match.resumeId.personalInfo?.email && (
            <div className="text-sm text-gray-600">{match.resumeId.personalInfo.email}</div>
          )}
        </div>
      )}

      {/* Component Scores */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Skills</div>
          <div className="text-lg font-semibold text-gray-900">{match.skillMatch?.score || 0}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Experience</div>
          <div className="text-lg font-semibold text-gray-900">{match.experienceMatch?.score || 0}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Education</div>
          <div className="text-lg font-semibold text-gray-900">{match.educationMatch?.score || 0}%</div>
        </div>
      </div>

      {/* Skills Match Details */}
      {match.skillMatch && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Skills Match</div>
            <div className="text-sm text-gray-500">
              {match.skillMatch.matchedSkills?.length || 0} matched
            </div>
          </div>
          
          {/* Matched Skills */}
          {match.skillMatch.matchedSkills && match.skillMatch.matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {match.skillMatch.matchedSkills.slice(0, 5).map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded"
                >
                  {skill.skill}
                </span>
              ))}
              {match.skillMatch.matchedSkills.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{match.skillMatch.matchedSkills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Missing Skills */}
          {match.skillMatch.missingSkills && match.skillMatch.missingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {match.skillMatch.missingSkills.slice(0, 3).map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded"
                >
                  Missing: {skill}
                </span>
              ))}
              {match.skillMatch.missingSkills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{match.skillMatch.missingSkills.length - 3} more missing
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Strengths */}
      {match.strengths && match.strengths.length > 0 && (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 mb-1">Strengths</div>
          <ul className="text-sm text-gray-600 space-y-1">
            {match.strengths.slice(0, 2).map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns */}
      {match.concerns && match.concerns.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Concerns</div>
          <ul className="text-sm text-gray-600 space-y-1">
            {match.concerns.slice(0, 2).map((concern, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">!</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Link 
          to={`/matches/${match._id}`}
          className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View Details
        </Link>
        {showResume && match.resumeId && (
          <Link 
            to={`/resumes/${match.resumeId._id}`}
            className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            View Resume
          </Link>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span>Calculated {new Date(match.calculatedAt).toLocaleDateString()}</span>
        {match.semanticSimilarity && (
          <span>Similarity: {(match.semanticSimilarity * 100).toFixed(1)}%</span>
        )}
      </div>
    </div>
  );
};

MatchCard.propTypes = {
  match: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    overallScore: PropTypes.number.isRequired,
    recommendation: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    rank: PropTypes.number,
    jobId: PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      company: PropTypes.string
    }),
    resumeId: PropTypes.shape({
      _id: PropTypes.string,
      personalInfo: PropTypes.shape({
        fullName: PropTypes.string,
        email: PropTypes.string
      })
    }),
    skillMatch: PropTypes.shape({
      score: PropTypes.number,
      matchedSkills: PropTypes.array,
      missingSkills: PropTypes.array
    }),
    experienceMatch: PropTypes.shape({
      score: PropTypes.number
    }),
    educationMatch: PropTypes.shape({
      score: PropTypes.number
    }),
    strengths: PropTypes.array,
    concerns: PropTypes.array,
    calculatedAt: PropTypes.string,
    semanticSimilarity: PropTypes.number
  }).isRequired,
  showJob: PropTypes.bool,
  showResume: PropTypes.bool
};

export default MatchCard;
