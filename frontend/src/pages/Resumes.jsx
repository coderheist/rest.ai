import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI, jobAPI } from '../services/api';
import ResumeCard from '../components/ResumeCard';
import ResumeUpload from '../components/ResumeUpload';
import Layout from '../components/Layout';
import { 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  Sparkles, 
  X, 
  Trash2, 
  Users, 
  Database,
  Briefcase,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showCustomRanking, setShowCustomRanking] = useState(false);
  const [customCriteria, setCustomCriteria] = useState('');
  const [rankingInProgress, setRankingInProgress] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [applyingToJob, setApplyingToJob] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'atsScore',  // Default sort by ATS score
    jobFilter: 'all' // all, assigned, unassigned
  });

  useEffect(() => {
    fetchResumes();
    fetchStats();
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [resumes, filters]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await resumeAPI.getResumes();
      setResumes(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch resumes');
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getJobs();
      setJobs(response.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await resumeAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...resumes];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(resume =>
        resume.candidateName?.toLowerCase().includes(searchLower) ||
        resume.personalInfo?.fullName?.toLowerCase().includes(searchLower) ||
        resume.email?.toLowerCase().includes(searchLower) ||
        resume.personalInfo?.email?.toLowerCase().includes(searchLower) ||
        resume.phone?.includes(filters.search) ||
        resume.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
        resume.skills?.technical?.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(resume => resume.status === filters.status);
    }

    // Sort
    switch (filters.sortBy) {
      case 'atsScore':
        filtered.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
        break;
      case 'matchScore':
        filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => (a.personalInfo?.fullName || a.candidateName || '').localeCompare(b.personalInfo?.fullName || b.candidateName || ''));
        break;
      case 'experience':
        filtered.sort((a, b) => (b.totalExperience || 0) - (a.totalExperience || 0));
        break;
      default:
        // Default to ATS score
        filtered.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
        break;
    }

    setFilteredResumes(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      sortBy: 'atsScore'
    });
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    fetchResumes();
    fetchStats();
    
    // Show processing message
    const processingToast = toast.loading('Processing resume and calculating ATS score...', {
      duration: 6000
    });
    
    // Refresh multiple times to catch the ATS score when it's ready
    setTimeout(() => {
      fetchResumes();
      fetchStats();
    }, 2000);
    
    setTimeout(() => {
      fetchResumes();
      fetchStats();
    }, 4000);
    
    setTimeout(() => {
      fetchResumes();
      fetchStats();
      toast.dismiss(processingToast);
      toast.success('Resume processed! ATS score calculated.');
    }, 6000);
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await resumeAPI.deleteResume(resumeId);
      fetchResumes();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete resume');
    }
  };

  const handleStatusChange = async (resumeId, newStatus) => {
    try {
      await resumeAPI.updateStatus(resumeId, newStatus);
      // Update local state immediately for better UX
      setResumes(prev => prev.map(r => 
        r._id === resumeId ? { ...r, status: newStatus } : r
      ));
      fetchStats(); // Refresh stats
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
      console.error('Status update error:', err);
    }
  };

  const handleCustomRanking = async () => {
    if (!customCriteria.trim()) {
      alert('Please enter ranking criteria');
      return;
    }

    setRankingInProgress(true);
    try {
      // This would call the AI service to re-rank based on custom criteria
      // For now, we'll show a placeholder
      alert(`Custom ranking based on: "${customCriteria}" - This feature will rank resumes based on your specific requirements using AI.`);
      setShowCustomRanking(false);
      setCustomCriteria('');
    } catch (err) {
      alert('Failed to apply custom ranking');
    } finally {
      setRankingInProgress(false);
    }
  };

  const handleDeleteAll = async () => {
    if (filteredResumes.length === 0) {
      alert('No resumes to delete');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${filteredResumes.length} resume(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setLoading(true);
      // Delete all filtered resumes
      await Promise.all(
        filteredResumes.map(resume => resumeAPI.deleteResume(resume._id))
      );
      
      alert(`Successfully deleted ${filteredResumes.length} resume(s)`);
      fetchResumes();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete resumes');
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Resumes</h1>
            <p className="text-gray-600 mt-2">Manage candidate resumes</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { fetchResumes(); fetchStats(); }}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              title="Refresh to get latest ATS scores"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={filteredResumes.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete All</span>
            </button>
            <button
              onClick={() => setShowCustomRanking(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Sparkles className="w-5 h-5" />
              <span>Custom Rank</span>
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Resume</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
              <p className="text-xs font-semibold opacity-90 mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.totalResumes || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg shadow-lg">
              <p className="text-xs font-semibold opacity-90 mb-1">New</p>
              <p className="text-2xl font-bold">{resumes.filter(r => r.status === 'new').length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
              <p className="text-xs font-semibold opacity-90 mb-1">Reviewed</p>
              <p className="text-2xl font-bold">{resumes.filter(r => r.status === 'reviewed').length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
              <p className="text-xs font-semibold opacity-90 mb-1">Shortlisted</p>
              <p className="text-2xl font-bold">{resumes.filter(r => r.status === 'shortlisted').length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow-lg">
              <p className="text-xs font-semibold opacity-90 mb-1">Interview</p>
              <p className="text-2xl font-bold">{resumes.filter(r => r.status === 'interview').length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-lg shadow-lg">
              <p className="text-xs font-semibold opacity-90 mb-1">Offer/Hired</p>
              <p className="text-2xl font-bold">{resumes.filter(r => ['offer', 'hired'].includes(r.status)).length}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg shadow-lg">
              <p className="text-xs font-semibold opacity-90 mb-1">Rejected</p>
              <p className="text-2xl font-bold">{resumes.filter(r => r.status === 'rejected').length}</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {showUpload && (
          <div className="mb-6">
            <ResumeUpload onUploadComplete={handleUploadSuccess} />
          </div>
        )}

        {/* Custom Ranking Modal */}
        {showCustomRanking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Custom Ranking
                </h3>
                <button
                  onClick={() => setShowCustomRanking(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Describe your specific requirements to rank resumes based on custom criteria using AI.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ranking Criteria
                </label>
                <textarea
                  value={customCriteria}
                  onChange={(e) => setCustomCriteria(e.target.value)}
                  placeholder="E.g., 'Prioritize candidates with React and Node.js experience, minimum 5 years in full-stack development, and team leadership skills'"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="4"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> Be specific about required skills, experience level, education, or any other criteria important for your role.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCustomRanking(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={rankingInProgress}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomRanking}
                  disabled={rankingInProgress || !customCriteria.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {rankingInProgress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Ranking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Apply Ranking</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Name, email, phone, skills..."
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
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
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
                <option value="atsScore">ATS Score (High to Low)</option>
                <option value="matchScore">Match Score (High to Low)</option>
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.search || filters.status) && (
            <div className="mt-4 flex items-center space-x-2">
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

      {/* Resume List */}
      {filteredResumes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">
            {resumes.length === 0 ? 'No resumes uploaded yet' : 'No resumes match your filters'}
          </p>
          {resumes.length === 0 ? (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Your First Resume</span>
            </button>
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
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredResumes.length} of {resumes.length} resumes
            </div>
            
            {/* Status Summary Pills */}
            <div className="flex gap-2 flex-wrap">
              {['new', 'reviewed', 'shortlisted', 'interview'].map(status => {
                const count = resumes.filter(r => r.status === status).length;
                if (count === 0) return null;
                return (
                  <button
                    key={status}
                    onClick={() => handleFilterChange('status', filters.status === status ? '' : status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      filters.status === status 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredResumes.map((resume, index) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                rank={index + 1}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Resumes;
