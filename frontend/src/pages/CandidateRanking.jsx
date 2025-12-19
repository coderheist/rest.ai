import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchAPI, jobAPI } from '../services/api';
import MatchCard from '../components/MatchCard';

const CandidateRanking = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    minScore: 0,
    status: '',
    limit: 50
  });

  useEffect(() => {
    fetchData();
  }, [jobId, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch job details
      const jobResponse = await jobAPI.getJob(jobId);
      setJob(jobResponse.data);

      // Fetch matches
      const matchesResponse = await matchAPI.getJobMatches(jobId, filters);
      setMatches(matchesResponse.data);

      // Fetch statistics
      const statsResponse = await matchAPI.getJobMatchStats(jobId);
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateMatches = async () => {
    try {
      setCalculating(true);
      setError(null);
      await matchAPI.calculateJobMatches(jobId);
      await fetchData(); // Reload data
    } catch (err) {
      console.error('Error calculating matches:', err);
      setError(err.response?.data?.error || 'Failed to calculate matches');
    } finally {
      setCalculating(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Link to={`/jobs/${jobId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Back to Job Details
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Candidate Rankings
            </h1>
            {job && (
              <p className="text-gray-600 mt-1">
                {job.title} at {job.company}
              </p>
            )}
          </div>
          <button
            onClick={handleCalculateMatches}
            disabled={calculating}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
              calculating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {calculating ? 'Calculating...' : 'Recalculate All Matches'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Total Candidates</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalMatches}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Average Score</div>
            <div className="text-2xl font-bold text-gray-900">{stats.averageScore}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Excellent Matches</div>
            <div className="text-2xl font-bold text-green-600">{stats.distribution?.excellent || 0}</div>
            <div className="text-xs text-gray-500">Score ≥ 80</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Good Matches</div>
            <div className="text-2xl font-bold text-blue-600">{stats.distribution?.veryGood || 0}</div>
            <div className="text-xs text-gray-500">Score 70-79</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Minimum Score
            </label>
            <select
              value={filters.minScore}
              onChange={(e) => handleFilterChange('minScore', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>All Candidates</option>
              <option value={80}>Excellent (≥80)</option>
              <option value={70}>Very Good (≥70)</option>
              <option value={60}>Good (≥60)</option>
              <option value={50}>Fair (≥50)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Results Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={20}>20 candidates</option>
              <option value={50}>50 candidates</option>
              <option value={100}>100 candidates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Matches Found
          </h3>
          <p className="text-gray-600 mb-4">
            Click "Recalculate All Matches" to analyze candidates for this position.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {matches.length} {matches.length === 1 ? 'Candidate' : 'Candidates'}
            </h2>
            <div className="text-sm text-gray-500">
              Sorted by match score
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <MatchCard 
                key={match._id} 
                match={match}
                showJob={false}
                showResume={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateRanking;
