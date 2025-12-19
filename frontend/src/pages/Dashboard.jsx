import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usageAPI } from '../services/api';
import UsageCard from '../components/UsageCard';
import UsageAnalytics from '../components/UsageAnalytics';

const Dashboard = () => {
  const { user, tenant, logout } = useAuth();
  const [usageData, setUsageData] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  // Fetch usage data on component mount
  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoadingUsage(true);
      const response = await usageAPI.getUsage();
      setUsageData(response.data);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Resume Screener</h1>
              <p className="text-sm text-gray-600">{tenant?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <nav className="flex space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/jobs"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Jobs
                </Link>
              </nav>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            Your workspace is ready. Start by creating a job posting or uploading resumes.
          </p>
        </div>

        {/* Plan Info */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow p-6 mb-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Current Plan: {tenant?.plan}</h3>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm opacity-90">Resume Limit</p>
              <p className="text-2xl font-bold">{tenant?.resumeLimit === -1 ? '∞' : tenant?.resumeLimit}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Job Limit</p>
              <p className="text-2xl font-bold">{tenant?.jdLimit === -1 ? '∞' : tenant?.jdLimit}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">AI Usage Limit</p>
              <p className="text-2xl font-bold">{tenant?.aiUsageLimit === -1 ? '∞' : tenant?.aiUsageLimit}</p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage Card - Full width on mobile, 1 column on desktop */}
          <div className="lg:col-span-1">
            <UsageCard usageData={usageData} loading={loadingUsage} />
          </div>

          {/* Quick Actions - Full width on mobile, 2 columns on desktop */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Job</h3>
              <p className="text-gray-600 text-sm mb-4">Post a new job description and start screening candidates</p>
              <Link
                to="/jobs/new"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Create Job
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resumes</h3>
              <p className="text-gray-600 text-sm mb-4">Upload and parse resumes for AI screening</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Upload Resumes
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">Track your recruitment metrics and insights</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                View Analytics
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Refresh Usage</h3>
              <p className="text-gray-600 text-sm mb-4">Update your current usage statistics</p>
              <button 
                onClick={fetchUsageData}
                disabled={loadingUsage}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingUsage ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Analytics Section */}
        {isAdmin && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Usage Analytics</h2>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </button>
            </div>
            <UsageAnalytics show={showAnalytics} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
