import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI } from '../services/api';
import MatchCard from '../components/MatchCard';
import Layout from '../components/Layout';
import { Users, Star, Filter, Search, TrendingUp } from 'lucide-react';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    minScore: '',
    sortBy: 'score'
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [matches, filters]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await matchAPI.searchMatches();
      setMatches(response.data || []);
      calculateStats(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (matchesData) => {
    const total = matchesData.length;
    const shortlisted = matchesData.filter(m => m.status === 'shortlisted').length;
    const reviewed = matchesData.filter(m => m.status === 'reviewed').length;
    const avgScore = total > 0
      ? (matchesData.reduce((sum, m) => sum + (m.overallScore || 0), 0) / total).toFixed(1)
      : 0;

    setStats({
      totalMatches: total,
      shortlisted,
      reviewed,
      avgScore
    });
  };

  const applyFilters = () => {
    let filtered = [...matches];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(match =>
        match.resumeId?.candidateName?.toLowerCase().includes(searchLower) ||
        match.jobId?.title?.toLowerCase().includes(searchLower) ||
        match.resumeId?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(match => match.status === filters.status);
    }

    // Min score filter
    if (filters.minScore) {
      const minScore = parseFloat(filters.minScore);
      filtered = filtered.filter(match => (match.overallScore || 0) >= minScore);
    }

    // Sort
    switch (filters.sortBy) {
      case 'score':
        filtered.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => 
          (a.resumeId?.candidateName || '').localeCompare(b.resumeId?.candidateName || '')
        );
        break;
      default:
        break;
    }

    setFilteredMatches(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      minScore: '',
      sortBy: 'score'
    });
  };

  const handleStatusChange = async (matchId, newStatus) => {
    try {
      await matchAPI.updateMatchStatus(matchId, newStatus);
      fetchMatches();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleToggleShortlist = async (matchId) => {
    try {
      await matchAPI.toggleShortlist(matchId);
      fetchMatches();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle shortlist');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidate Matches</h1>
            <p className="text-gray-600 mt-2">View and manage all candidate-job matches</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMatches}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Shortlisted</p>
              <p className="text-2xl font-bold text-green-600">{stats.shortlisted}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Reviewed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <p className="text-gray-600 text-sm">Avg Score</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.avgScore}%</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Candidate or job..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Min Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Min Score
              </label>
              <select
                value={filters.minScore}
                onChange={(e) => handleFilterChange('minScore', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Score</option>
                <option value="90">90%+</option>
                <option value="80">80%+</option>
                <option value="70">70%+</option>
                <option value="60">60%+</option>
                <option value="50">50%+</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="score">Highest Score</option>
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.search || filters.status || filters.minScore) && (
            <div className="mt-4 flex items-center flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.search && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Search: {filters.search}
                </span>
              )}
              {filters.status && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Status: {filters.status}
                </span>
              )}
              {filters.minScore && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Min Score: {filters.minScore}%
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Match List */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">
            {matches.length === 0 ? 'No matches found' : 'No matches match your filters'}
          </p>
          {matches.length === 0 ? (
            <div className="space-y-3">
              <p className="text-gray-500 text-sm">
                Matches are created when resumes are uploaded for jobs
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/resumes"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Resumes
                </Link>
                <Link
                  to="/jobs"
                  className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View Jobs
                </Link>
              </div>
            </div>
          ) : (
            <button
              onClick={clearFilters}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredMatches.length} of {matches.length} matches
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                onShortlistChange={handleToggleShortlist}
                showJob={true}
                showResume={true}
              />
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Matches;
