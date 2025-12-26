import React from 'react';

const CandidateRanking = ({ candidates, loading = false, onViewDetails, onGenerateInterview }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-gray-600">No candidates found</p>
        <p className="text-sm text-gray-500 mt-2">Upload resumes or run AI matching to see candidates here</p>
      </div>
    );
  }

  // Helper function to get rank badge color
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  // Helper function to get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-4">
      {candidates.map((candidate, index) => {
        const resume = candidate.resumeId || candidate;
        const score = candidate.overallScore || candidate.similarityScore * 100 || 0;
        const rank = candidate.rank || index + 1;

        return (
          <div
            key={candidate._id || index}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* Rank Badge */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRankBadgeColor(rank)}`}>
                {rank}
              </div>

              {/* Candidate Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {resume?.personalInfo?.fullName || 'Unknown Candidate'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {resume?.personalInfo?.email || 'No email provided'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg border font-bold ${getScoreColor(score)}`}>
                    {Math.round(score)}%
                  </div>
                </div>

                {/* Skills Preview */}
                {resume?.skills?.technical && resume.skills.technical.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.technical.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {resume.skills.technical.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          +{resume.skills.technical.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Score Breakdown */}
                {candidate.skillsScore !== undefined && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600">Skills</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.round(candidate.skillsScore)}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600">Experience</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.round(candidate.experienceScore || 0)}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600">Education</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.round(candidate.educationScore || 0)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onViewDetails && onViewDetails(candidate)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  {onGenerateInterview && (
                    <button
                      onClick={() => onGenerateInterview(candidate)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Generate Interview
                    </button>
                  )}
                  {resume?.personalInfo?.email && (
                    <a
                      href={`mailto:${resume.personalInfo.email}`}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Contact
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Match Summary (if available) */}
            {candidate.explanation?.summary && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {candidate.explanation.summary}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CandidateRanking;
