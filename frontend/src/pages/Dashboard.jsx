import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, jobAPI } from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Briefcase,
  FileText,
  Users,
  Star,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, tenant, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [topJobs, setTopJobs] = useState([]);
  const [usage, setUsage] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        pipelineRes,
        activitiesRes,
        analyticsRes,
        topJobsRes,
        usageRes,
        jobsRes
      ] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getPipeline(),
        dashboardAPI.getActivities(15),
        dashboardAPI.getAnalytics(30),
        dashboardAPI.getTopJobs(5),
        dashboardAPI.getUsage(),
        jobAPI.getAllJobs({ limit: 5, status: 'active' })
      ]);

      setStats(statsRes);
      setPipeline(pipelineRes);
      setActivities(activitiesRes);
      setAnalytics(analyticsRes);
      setTopJobs(topJobsRes);
      setUsage(usageRes);
      setRecentJobs(jobsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'job': return <Briefcase className="w-4 h-4" />;
      case 'resume': return <FileText className="w-4 h-4" />;
      case 'match': return <Users className="w-4 h-4" />;
      case 'note': return <Activity className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'job': return 'bg-blue-100 text-blue-600';
      case 'resume': return 'bg-green-100 text-green-600';
      case 'match': return 'bg-purple-100 text-purple-600';
      case 'note': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Resume Screener</h1>
              <p className="text-sm text-gray-600">{tenant?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-2">
                <Link to="/dashboard" className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">Dashboard</Link>
                <Link to="/jobs" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Jobs</Link>
                <Link to="/candidates" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Candidates</Link>
              </nav>
              <div className="text-right border-l pl-4">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button onClick={logout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600">Here's what's happening with your recruitment today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg"><Briefcase className="w-6 h-6 text-blue-600" /></div>
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalJobs || 0}</h3>
            <p className="text-sm text-gray-600">Active Jobs</p>
            <div className="mt-2 text-xs text-green-600 font-medium">{stats?.activeJobs || 0} currently active</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg"><FileText className="w-6 h-6 text-green-600" /></div>
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalResumes || 0}</h3>
            <p className="text-sm text-gray-600">Resumes Uploaded</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg"><Users className="w-6 h-6 text-purple-600" /></div>
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalMatches || 0}</h3>
            <p className="text-sm text-gray-600">Candidates Matched</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg"><Star className="w-6 h-6 text-orange-600" /></div>
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.shortlistedCount || 0}</h3>
            <p className="text-sm text-gray-600">Shortlisted</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />Activity Trends (30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.jobTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} name="Jobs Posted" dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Quality Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats?.matchDistribution || []} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.range}: ${entry.count}`}>
                  {(stats?.matchDistribution || []).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Jobs */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-orange-600" />Top Performing Jobs
          </h3>
          <div className="space-y-3">
            {topJobs.length > 0 ? (
              topJobs.map((job) => (
                <div key={job.jobId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.jobTitle}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{job.matchCount} matches</span><span>•</span>
                      <span>{job.shortlistedCount} shortlisted</span><span>•</span>
                      <span className="text-blue-600 font-medium">Avg: {job.avgScore}%</span>
                    </div>
                  </div>
                  <Link to={`/jobs/${job.jobId}`} className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">View Details</Link>
                </div>
              ))
            ) : (<p className="text-center text-gray-500 py-4">No data available yet</p>)}
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />Recent Activity
            </h3>
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />{formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (<p className="text-center text-gray-500 py-8">No recent activity</p>)}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/jobs/new" className="block w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-center">+ Post New Job</Link>
                <Link to="/jobs" className="block w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center">View All Jobs</Link>
                <Link to="/candidates" className="block w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center">View Candidates</Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Jobs</h3>
              <div className="space-y-2">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <Link key={job._id} to={`/jobs/${job._id}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{job.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{job.department}</p>
                    </Link>
                  ))
                ) : (<p className="text-sm text-center text-gray-500 py-4">No active jobs yet</p>)}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Analytics */}
        {isAdmin && usage && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Usage</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(usage.currentPeriod).map(([key, value]) => {
                const limit = usage.limits[key];
                const percent = usage.utilizationPercent[key];
                return (
                  <div key={key} className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{value}</span>
                      <span className="text-sm text-gray-500">/ {limit}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${percent >= 90 ? 'bg-red-600' : percent >= 70 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
