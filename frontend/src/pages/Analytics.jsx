import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Download,
  RefreshCw
} from 'lucide-react';
import { dashboardAPI, jobAPI, matchAPI } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [topJobs, setTopJobs] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, topJobsRes, pipelineRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getAnalytics(timeRange),
        dashboardAPI.getTopJobs(10),
        dashboardAPI.getPipeline()
      ]);

      setStats(statsRes);
      setAnalytics(analyticsRes);
      setTopJobs(topJobsRes || []);
      setPipeline(pipelineRes);
      toast.success('Analytics updated');
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      </Layout>
    );
  }

  const kpis = [
    {
      title: 'Total Jobs',
      value: stats?.totalJobs || '0',
      change: stats?.jobsThisMonth || '0',
      trend: 'up',
      icon: Briefcase,
      color: 'blue'
    },
    {
      title: 'Total Candidates',
      value: stats?.totalResumes || '0',
      change: stats?.resumesThisWeek || '0',
      trend: 'up',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Total Matches',
      value: stats?.totalMatches || '0',
      change: '+' + ((stats?.shortlistRate || 0).toFixed(0)) + '%',
      trend: 'up',
      icon: Target,
      color: 'purple'
    },
    {
      title: 'Avg Match Score',
      value: (stats?.avgMatchScore || 0).toFixed(1) + '%',
      change: stats?.interviewsGenerated || '0',
      trend: 'up',
      icon: TrendingUp,
      color: 'indigo'
    }
  ];

  // Calculate funnel data from pipeline
  const funnelData = pipeline ? [
    { stage: 'Applied', count: stats?.totalResumes || 0, percentage: 100, color: 'blue' },
    { stage: 'Screened', count: pipeline.screened || 0, percentage: pipeline.screened ? Math.round((pipeline.screened / stats?.totalResumes) * 100) : 0, color: 'indigo' },
    { stage: 'Shortlisted', count: pipeline.shortlisted || 0, percentage: pipeline.shortlisted ? Math.round((pipeline.shortlisted / stats?.totalResumes) * 100) : 0, color: 'purple' },
    { stage: 'Interview', count: stats?.totalInterviews || 0, percentage: stats?.totalInterviews ? Math.round((stats?.totalInterviews / stats?.totalResumes) * 100) : 0, color: 'pink' },
    { stage: 'Offered', count: pipeline.offered || 0, percentage: pipeline.offered ? Math.round((pipeline.offered / stats?.totalResumes) * 100) : 0, color: 'green' }
  ] : [];

  // Calculate match quality distribution
  const matchQualityData = analytics?.matchDistribution || [
    { label: 'Strong Match (90-100%)', count: 0, color: 'green' },
    { label: 'Good Match (75-89%)', count: 0, color: 'blue' },
    { label: 'Potential (60-74%)', count: 0, color: 'yellow' },
    { label: 'Weak (<60%)', count: 0, color: 'red' }
  ];

  return (    <Layout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Performance insights and hiring metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last Year</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? ArrowUp : ArrowDown;
          const trendColor = kpi.trend === 'up' ? 'text-green-600' : 'text-red-600';
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${kpi.color}-50`}>
                  <Icon className={`w-6 h-6 text-${kpi.color}-600`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${trendColor}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{kpi.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{kpi.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Hiring Funnel
          </h3>
          <div className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{stage.stage}</span>
                  <span className="text-gray-600">{stage.count} ({stage.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r from-${stage.color}-500 to-${stage.color}-600 h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match Quality Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Match Quality Distribution
          </h3>
          <div className="space-y-4">
            {matchQualityData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full bg-${item.color}-500`}></div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
            Top Performing Jobs
          </h3>
          <button
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Job Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Candidates</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Matches</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Shortlisted</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Score</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {topJobs.length > 0 ? topJobs.map((job, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{job.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{job.candidateCount || 0}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{job.matchCount || 0}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{job.shortlistedCount || 0}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{job.avgScore ? job.avgScore.toFixed(1) : '0'}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      job.status === 'active' ? 'text-green-700 bg-green-100' : 
                      job.status === 'closed' ? 'text-gray-700 bg-gray-100' : 
                      'text-yellow-700 bg-yellow-100'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No job data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
    </div>
    </Layout>
  );
};

export default Analytics;
