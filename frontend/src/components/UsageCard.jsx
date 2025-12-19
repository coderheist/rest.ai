import PropTypes from 'prop-types';

/**
 * UsageCard Component
 * Displays usage statistics with progress bars and warnings
 */
const UsageCard = ({ usageData, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No usage data available</p>
      </div>
    );
  }

  const { current, limits, period, percentUsed } = usageData;

  // Helper function to determine progress bar color
  const getProgressColor = (percent) => {
    if (percent >= 90) return 'bg-red-600';
    if (percent >= 75) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  // Helper function to get text color for warnings
  const getTextColor = (percent) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Usage items configuration
  const usageItems = [
    {
      label: 'Resumes Processed',
      current: current.resumesProcessed,
      limit: limits.resumeLimit,
      percent: percentUsed.resumes,
      icon: '📄'
    },
    {
      label: 'Jobs Created',
      current: current.jobsCreated,
      limit: limits.jdLimit,
      percent: percentUsed.jobs,
      icon: '💼'
    },
    {
      label: 'AI Usage (LLM Calls)',
      current: current.llmCalls,
      limit: limits.aiUsageLimit,
      percent: percentUsed.aiUsage,
      icon: '🤖'
    }
  ];

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Usage Statistics</h3>
        <p className="text-blue-100 text-sm mt-1">
          Billing Period: {formatDate(period.start)} - {formatDate(period.end)}
        </p>
      </div>

      {/* Usage Metrics */}
      <div className="p-6 space-y-6">
        {usageItems.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${getTextColor(item.percent)}`}>
                  {item.current}
                </span>
                <span className="text-gray-500 text-sm">
                  {' / '}
                  {item.limit === -1 ? '∞' : item.limit}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(item.percent)}`}
                style={{ width: `${Math.min(item.percent, 100)}%` }}
              ></div>
            </div>

            {/* Percentage and Warning */}
            <div className="flex justify-between items-center text-xs">
              <span className={`font-medium ${getTextColor(item.percent)}`}>
                {item.percent}% used
              </span>
              {item.percent >= 75 && item.limit !== -1 && (
                <span className="text-yellow-600 font-medium">
                  {item.percent >= 90 ? '⚠️ Limit almost reached!' : '⚡ High usage'}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Additional Metrics */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Interview Kits</p>
              <p className="text-lg font-bold text-gray-900">{current.interviewKitsGenerated}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Embedding Calls</p>
              <p className="text-lg font-bold text-gray-900">{current.embeddingCalls}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">LLM Tokens Used</p>
              <p className="text-lg font-bold text-gray-900">
                {current.llmTokensUsed.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Estimated Cost</p>
              <p className="text-lg font-bold text-gray-900">
                ${current.estimatedCostUSD.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade CTA (if usage is high) */}
        {(percentUsed.resumes >= 75 || percentUsed.jobs >= 75 || percentUsed.aiUsage >= 75) && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🚀</span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900">
                  Running out of resources?
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Upgrade your plan to get more resumes, jobs, and AI usage limits.
                </p>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

UsageCard.propTypes = {
  usageData: PropTypes.shape({
    current: PropTypes.shape({
      resumesProcessed: PropTypes.number.isRequired,
      jobsCreated: PropTypes.number.isRequired,
      interviewKitsGenerated: PropTypes.number.isRequired,
      embeddingCalls: PropTypes.number.isRequired,
      llmCalls: PropTypes.number.isRequired,
      llmTokensUsed: PropTypes.number.isRequired,
      estimatedCostUSD: PropTypes.number.isRequired
    }),
    limits: PropTypes.shape({
      resumeLimit: PropTypes.number.isRequired,
      jdLimit: PropTypes.number.isRequired,
      aiUsageLimit: PropTypes.number.isRequired
    }),
    period: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired
    }),
    percentUsed: PropTypes.shape({
      resumes: PropTypes.number.isRequired,
      jobs: PropTypes.number.isRequired,
      aiUsage: PropTypes.number.isRequired
    })
  }),
  loading: PropTypes.bool
};

export default UsageCard;
