import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Calendar, 
  User, 
  Briefcase,
  Filter,
  Search,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getAll();
      setInterviews(response.data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to load interview kits');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (kitId) => {
    if (!window.confirm('Are you sure you want to delete this interview kit?')) {
      return;
    }

    try {
      await interviewAPI.deleteKit(kitId);
      toast.success('Interview kit deleted');
      fetchInterviews();
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Failed to delete interview kit');
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = filters.search === '' || 
      interview.candidateName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      interview.jobTitle?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700'
    };
    return colors[difficulty] || colors.medium;
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

  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Kits</h1>
          <p className="text-gray-600 mt-1">AI-generated interview questions for your candidates</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
            <p className="text-sm text-gray-600">Total Kits</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by candidate or job title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Interview Kits Grid */}
      {filteredInterviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interview Kits Yet</h3>
          <p className="text-gray-600 mb-6">
            Generate interview questions from the matches page or job details
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterviews.map((kit) => (
            <div
              key={kit._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {kit.questions?.length || 0} Questions
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {kit.candidateName || kit.resumeId?.personalInfo?.fullName || 'Unknown Candidate'}
                </h3>
                <p className="text-sm text-gray-600">
                  {kit.jobTitle || kit.jobId?.title || 'Unknown Position'}
                </p>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Question Types */}
                {kit.questionTypes && Object.keys(kit.questionTypes).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Question Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(kit.questionTypes).map(([type, count]) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {type}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Difficulty Distribution */}
                {kit.difficultyDistribution && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Difficulty:</p>
                    <div className="flex gap-2">
                      {Object.entries(kit.difficultyDistribution).map(([level, count]) => (
                        <span
                          key={level}
                          className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(level)}`}
                        >
                          {level}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated Date */}
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  Generated {new Date(kit.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <Link
                  to={`/interviews/${kit._id}`}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Kit</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(kit._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Kits</p>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{interviews.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">This Week</p>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {interviews.filter(kit => {
              const kitDate = new Date(kit.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return kitDate >= weekAgo;
            }).length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Questions</p>
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {interviews.length > 0 
              ? Math.round(interviews.reduce((acc, kit) => acc + (kit.questions?.length || 0), 0) / interviews.length)
              : 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Ready to Use</p>
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{interviews.length}</p>
        </div>
      </div>
    </div>
    </div>
    </div>
    </Layout>
  );
};

export default Interviews;
