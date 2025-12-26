import React from 'react';

const MatchExplanation = ({ match }) => {
  if (!match || !match.explanation) {
    return null;
  }

  const { explanation, overallScore, skillsScore, experienceScore, educationScore } = match;

  // Helper function to get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Helper function to get score badge
  const getScoreBadge = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Match Score</h3>
          <div className={`px-4 py-2 rounded-full font-bold text-2xl ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {getScoreBadge(overallScore)} match for this position
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Skills Score */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Skills</span>
              <span className={`text-lg font-bold ${getScoreColor(skillsScore)}`}>
                {skillsScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${skillsScore >= 80 ? 'bg-green-500' : skillsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${skillsScore}%` }}
              ></div>
            </div>
          </div>

          {/* Experience Score */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Experience</span>
              <span className={`text-lg font-bold ${getScoreColor(experienceScore)}`}>
                {experienceScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${experienceScore >= 80 ? 'bg-green-500' : experienceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${experienceScore}%` }}
              ></div>
            </div>
          </div>

          {/* Education Score */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Education</span>
              <span className={`text-lg font-bold ${getScoreColor(educationScore)}`}>
                {educationScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${educationScore >= 80 ? 'bg-green-500' : educationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${educationScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {explanation.strengths && explanation.strengths.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Strengths
          </h3>
          <ul className="space-y-2">
            {explanation.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start text-sm text-green-800">
                <span className="mr-2">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {explanation.weaknesses && explanation.weaknesses.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {explanation.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start text-sm text-yellow-800">
                <span className="mr-2">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {explanation.recommendations && explanation.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Recommendations
          </h3>
          <ul className="space-y-2">
            {explanation.recommendations.map((recommendation, idx) => (
              <li key={idx} className="flex items-start text-sm text-blue-800">
                <span className="mr-2">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      {explanation.summary && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{explanation.summary}</p>
        </div>
      )}

      {/* Matched Skills */}
      {match.matchedSkills && match.matchedSkills.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Matched Skills</h3>
          <div className="flex flex-wrap gap-2">
            {match.matchedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {match.missingSkills && match.missingSkills.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Missing Skills</h3>
          <div className="flex flex-wrap gap-2">
            {match.missingSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchExplanation;
