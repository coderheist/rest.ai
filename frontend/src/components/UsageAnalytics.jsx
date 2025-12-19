import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usageAPI } from '../services/api';

/**
 * UsageAnalytics Component
 * Advanced usage analytics with warnings and recommendations (Admin only)
 */
const UsageAnalytics = ({ show = false }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      fetchAnalytics();
    }
  }, [show]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usageAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading analytics</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { warnings, recommendations } = analytics;

  return (
    <div className="space-y-6">
      {/* Warnings Section */}
      {warnings && warnings.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <h3 className="text-lg font-semibold text-yellow-900">Usage Warnings</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  warning.severity === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{warning.message}</p>
                    <p className="text-sm text-gray-600 mt-1">Type: {warning.type}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      warning.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {warning.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">💡</span>
              <h3 className="text-lg font-semibold text-blue-900">Recommendations</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {rec.action === 'upgrade' ? '🚀 Upgrade Plan' : rec.action}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{rec.reason}</p>
                    {rec.plan && (
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        Recommended Plan: {rec.plan}
                      </span>
                    )}
                  </div>
                  <button className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Issues */}
      {(!warnings || warnings.length === 0) && (!recommendations || recommendations.length === 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-green-600">
            <span className="text-4xl mb-4 block">✅</span>
            <p className="font-semibold text-lg">Everything looks good!</p>
            <p className="text-sm text-gray-600 mt-2">
              Your usage is within healthy limits. Keep up the great work!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

UsageAnalytics.propTypes = {
  show: PropTypes.bool
};

export default UsageAnalytics;
