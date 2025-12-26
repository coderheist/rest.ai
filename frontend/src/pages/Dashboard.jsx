import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, jobAPI } from '../services/api';
import Layout from '../components/Layout';
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
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Briefcase,
  FileText,
  Users,
  Star,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Award,
  ChevronRight,
  Calendar,
  Sparkles
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
        jobAPI.getJobs({ limit: 5, status: 'active' })
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Sparkles className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing insights and analytics</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {/* Header Section with Gradient */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 -mx-6 -mt-6 px-8 py-10 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              Welcome back, {user?.name}! 
              <Sparkles className="w-8 h-8 ml-3 text-yellow-300 animate-pulse" />
            </h1>
            <p className="text-blue-100 text-lg">Here's your recruitment activity overview</p>
            <div className="flex items-center mt-3 space-x-4 text-sm text-blue-100">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              {tenant && (
                <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                  {tenant.plan} Plan
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* KPI Cards with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Active Jobs Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-semibold">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>{stats?.activeJobs || 0}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Jobs</p>
                <h3 className="text-4xl font-bold text-gray-900">{stats?.totalJobs || 0}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  {stats?.activeJobs || 0} positions open
                </p>
              </div>
            </div>
          </div>

          {/* Resumes Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-semibold">
                  <Zap className="w-4 h-4 mr-1" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Resumes</p>
                <h3 className="text-4xl font-bold text-gray-900">{stats?.totalResumes || 0}</h3>
                <p className="text-sm text-gray-600">Candidates in database</p>
              </div>
            </div>
          </div>

          {/* Matches Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center text-purple-600 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4 mr-1" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">AI Matches</p>
                <h3 className="text-4xl font-bold text-gray-900">{stats?.totalMatches || 0}</h3>
                <p className="text-sm text-gray-600">Candidates matched</p>
              </div>
            </div>
          </div>

          {/* Shortlisted Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center text-orange-600 text-sm font-semibold">
                  <Award className="w-4 h-4 mr-1" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Shortlisted</p>
                <h3 className="text-4xl font-bold text-gray-900">{stats?.shortlistedCount || 0}</h3>
                <p className="text-sm text-gray-600">Top candidates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section with Enhanced Design */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Activity Trends - Takes 2 columns */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Activity Trends
                </h3>
                <p className="text-sm text-gray-500 mt-1 ml-12">Last 30 days performance</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics?.jobTrends || []}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  fill="url(#colorJobs)" 
                  name="Jobs Posted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Match Quality Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Match Quality
              </h3>
              <p className="text-sm text-gray-500 mt-1 ml-12">Score distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie 
                  data={stats?.matchDistribution || []} 
                  dataKey="count" 
                  nameKey="range" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  label={(entry) => `${entry.range}`}
                  labelLine={false}
                >
                  {(stats?.matchDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Jobs with Better Design */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mr-3">
                  <Award className="w-5 h-5 text-white" />
                </div>
                Top Performing Jobs
              </h3>
              <p className="text-sm text-gray-500 mt-1 ml-12">Jobs with highest engagement</p>
            </div>
            <Link 
              to="/jobs" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center group"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {topJobs.length > 0 ? (
              topJobs.map((job, index) => (
                <div 
                  key={job.jobId} 
                  className="group relative flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {job.jobTitle}
                      </h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-1 text-blue-500" />
                          {job.matchCount} matches
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center text-gray-600">
                          <Star className="w-4 h-4 mr-1 text-orange-500" />
                          {job.shortlistedCount} shortlisted
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center font-semibold text-green-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {job.avgScore}% avg score
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    to={`/jobs/${job.jobId}`} 
                    className="px-5 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center group"
                  >
                    View
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No performance data available yet</p>
                <Link to="/jobs/new" className="inline-flex items-center mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Post your first job
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Activity - Takes 2 columns */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-500 mt-1 ml-12">Latest updates and actions</p>
              </div>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="group flex items-start space-x-4 p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-200"
                  >
                    <div className={`p-3 rounded-xl ${getActivityColor(activity.type)} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1.5">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">Start by posting a job or uploading resumes</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Active Jobs */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <p className="text-blue-100 text-sm mb-5">Get started quickly</p>
              <div className="space-y-3">
                <Link 
                  to="/jobs/new" 
                  className="block w-full px-4 py-3.5 text-sm font-semibold text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition-all duration-300 text-center shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  + Post New Job
                </Link>
                <Link 
                  to="/resumes" 
                  className="block w-full px-4 py-3.5 text-sm font-semibold text-white bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-300 text-center border border-white/30"
                >
                  + Upload Resume
                </Link>
                <Link 
                  to="/jobs" 
                  className="block w-full px-4 py-3.5 text-sm font-medium text-white bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 text-center border border-white/20"
                >
                  View All Jobs
                </Link>
                <Link 
                  to="/matches" 
                  className="block w-full px-4 py-3.5 text-sm font-medium text-white bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 text-center border border-white/20"
                >
                  View Matches
                </Link>
              </div>
            </div>

            {/* Active Jobs */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Active Jobs
                </h3>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                  {recentJobs.length}
                </span>
              </div>
              <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <Link 
                      key={job._id} 
                      to={`/jobs/${job._id}`} 
                      className="group block p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{job.department}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No active jobs yet</p>
                    <Link to="/jobs/new" className="inline-flex items-center mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Create one now
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Analytics for Admins */}
        {isAdmin && usage && (
          <div className="mt-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 border border-indigo-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <Target className="w-6 h-6 mr-3" />
                  Plan Usage Analytics
                </h3>
                <p className="text-indigo-100 mt-1">Monitor your subscription limits</p>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <span className="text-white font-bold text-sm">{tenant?.plan} PLAN</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {Object.entries(usage.currentPeriod).map(([key, value]) => {
                const limit = usage.limits[key];
                const percent = usage.utilizationPercent[key];
                return (
                  <div key={key} className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <p className="text-xs text-white/80 uppercase tracking-wide mb-3 font-semibold">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <div className="flex items-baseline space-x-2 mb-3">
                      <span className="text-3xl font-bold text-white">{value}</span>
                      <span className="text-sm text-white/70">/ {limit}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          percent >= 90 ? 'bg-red-400' : 
                          percent >= 70 ? 'bg-yellow-400' : 
                          'bg-green-400'
                        }`} 
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-white/70">{percent.toFixed(0)}% utilized</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </Layout>
  );
};

export default Dashboard;
