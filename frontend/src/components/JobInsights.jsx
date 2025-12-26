import React from 'react';

const JobInsights = ({ insights, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  const {
    totalCandidates = 0,
    averageScore = 0,
    topCandidateScore = 0,
    qualifiedCandidates = 0,
    qualifiedPercentage = 0,
    skillGaps = []
  } = insights;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">{totalCandidates}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Top Score */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Top Score</p>
              <p className="text-2xl font-bold text-gray-900">{topCandidateScore}%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Qualified */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Qualified</p>
              <p className="text-2xl font-bold text-gray-900">
                {qualifiedCandidates}
                <span className="text-sm text-gray-500 ml-1">({qualifiedPercentage}%)</span>
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Gaps Analysis */}
      {skillGaps && skillGaps.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Skill Gaps</h3>
          <p className="text-sm text-gray-600 mb-4">
            Skills that candidates are most commonly missing for this position
          </p>
          <div className="space-y-3">
            {skillGaps.slice(0, 10).map((gap, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{gap.skill}</span>
                    <span className="text-sm text-gray-600">
                      {gap.count} candidates ({gap.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${gap.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {skillGaps.length > 10 && (
            <p className="text-sm text-gray-500 mt-4">
              And {skillGaps.length - 10} more skill gaps...
            </p>
          )}
        </div>
      )}

      {/* Insights Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          AI Insights
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          {totalCandidates === 0 && (
            <p>No candidates have been matched to this job yet.</p>
          )}
          {totalCandidates > 0 && qualifiedPercentage >= 50 && (
            <p>• Great candidate pool! {qualifiedPercentage}% of candidates meet the qualification threshold.</p>
          )}
          {totalCandidates > 0 && qualifiedPercentage < 50 && qualifiedPercentage > 20 && (
            <p>• Moderate candidate pool. Consider reviewing candidates with scores above {averageScore}%.</p>
          )}
          {totalCandidates > 0 && qualifiedPercentage <= 20 && (
            <p>• Limited qualified candidates. You may want to adjust job requirements or expand your search.</p>
          )}
          {skillGaps.length > 0 && (
            <p>• Most candidates are missing: {skillGaps.slice(0, 3).map(g => g.skill).join(', ')}. Consider providing training or adjusting requirements.</p>
          )}
          {topCandidateScore >= 90 && (
            <p>• You have excellent candidates! The top scorer achieved {topCandidateScore}%.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInsights;
