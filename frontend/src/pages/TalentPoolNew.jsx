import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI, jobAPI, matchAPI } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  X, 
  Users, 
  Database,
  Briefcase,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown,
  Upload,
  Eye,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Award,
  Target,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Code,
  Plus,
  Trash2,
  MessageSquare,
  FileText,
  MoreVertical,
  Check,
  ArrowUpDown,
  SlidersHorizontal,
  Grid3x3,
  List
} from 'lucide-react';

const TalentPoolNew = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    reviewed: 0,
    shortlisted: 0,
    interview: 0
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    minScore: 0,
    maxScore: 100,
    skills: [],
    experience: 'all',
    jobId: 'all'
  });

  const [sortBy, setSortBy] = useState('recent'); // recent, score, name, experience
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showJobAssignment, setShowJobAssignment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [candidates, filters, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [resumesRes, statsRes, jobsRes] = await Promise.all([
         resumeAPI.getResumes(),
        resumeAPI.getStats(),
        jobAPI.getJobs()
      ]);
      
      console.log('📊 First candidate data:', resumesRes.data?.[0]);
      setCandidates(resumesRes.data || []);
      setStats(statsRes.data || stats);
      setJobs(jobsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...candidates];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.personalInfo?.fullName?.toLowerCase().includes(searchLower) ||
        c.personalInfo?.email?.toLowerCase().includes(searchLower) ||
        c.skills?.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Score filter
    filtered = filtered.filter(c => {
      const score = c.atsScore || 0;
      return score >= filters.minScore && score <= filters.maxScore;
    });

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(c =>
        filters.skills.every(skill =>
          c.skills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    // Experience filter
    if (filters.experience !== 'all') {
      const expYears = parseInt(filters.experience);
      filtered = filtered.filter(c => {
        const candidateExp = c.experience?.reduce((sum, exp) => sum + (exp.years || 0), 0) || 0;
        if (filters.experience === '0-2') return candidateExp <= 2;
        if (filters.experience === '3-5') return candidateExp >= 3 && candidateExp <= 5;
        if (filters.experience === '6-10') return candidateExp >= 6 && candidateExp <= 10;
        if (filters.experience === '10+') return candidateExp > 10;
        return true;
      });
    }

    // Job filter
    if (filters.jobId !== 'all') {
      filtered = filtered.filter(c => c.jobMatches?.some(m => m.jobId === filters.jobId));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.atsScore || 0) - (a.atsScore || 0);
        case 'name':
          return (a.personalInfo?.fullName || '').localeCompare(b.personalInfo?.fullName || '');
        case 'experience':
          const aExp = a.experience?.reduce((sum, exp) => sum + (exp.years || 0), 0) || 0;
          const bExp = b.experience?.reduce((sum, exp) => sum + (exp.years || 0), 0) || 0;
          return bExp - aExp;
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredCandidates(filtered);
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map(c => c._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCandidate = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkStatusChange = async (newStatus) => {
    try {
      await Promise.all(
        selectedIds.map(id => resumeAPI.updateStatus(id, { status: newStatus }))
      );
      toast.success(`Updated ${selectedIds.length} candidate(s) to ${newStatus}`);
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      toast.error('Failed to update candidates');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} candidate(s)?`)) return;

    try {
      await Promise.all(selectedIds.map(id => resumeAPI.deleteResume(id)));
      toast.success(`Deleted ${selectedIds.length} candidate(s)`);
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete candidates');
    }
  };

  const handleBulkAssignToJob = async (jobId) => {
    try {
      await Promise.all(
        selectedIds.map(id => matchAPI.calculateMatch(jobId, id))
      );
      toast.success(`Assigned ${selectedIds.length} candidate(s) to job`);
      setSelectedIds([]);
      setShowJobAssignment(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign candidates');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      reviewed: 'bg-purple-100 text-purple-700 border-purple-200',
      shortlisted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      interview: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      offer: 'bg-green-100 text-green-700 border-green-200',
      hired: 'bg-green-200 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || colors.new;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Candidate Pool</h1>
                <p className="text-gray-600 mt-1">Review, shortlist, and process candidates</p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/resumes"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Resume</span>
                </Link>
                <button
                  onClick={fetchData}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total || candidates.length}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.new || 0}</p>
                    <p className="text-sm text-gray-600">New</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.reviewed || 0}</p>
                    <p className="text-sm text-gray-600">Reviewed</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-yellow-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.shortlisted || 0}</p>
                    <p className="text-sm text-gray-600">Shortlisted</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">{stats.interview || 0}</p>
                    <p className="text-sm text-gray-600">Interview</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Left side - Search and Filters */}
              <div className="flex items-center space-x-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, skills..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                    showFilters
                      ? 'bg-blue-50 border-blue-300 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="recent">Recent First</option>
                  <option value="score">Highest Score</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="experience">Most Experience</option>
                </select>
              </div>

              {/* Right side - View mode and bulk actions */}
              <div className="flex items-center space-x-3">
                {selectedIds.length > 0 && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">{selectedIds.length} selected</span>
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <select
                      value={filters.experience}
                      onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="0-2">0-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minScore}
                      onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">{filters.minScore}%</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job</label>
                    <select
                      value={filters.jobId}
                      onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Jobs</option>
                      {jobs.map(job => (
                        <option key={job._id} value={job._id}>{job.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({
                      search: '',
                      status: 'all',
                      minScore: 0,
                      maxScore: 100,
                      skills: [],
                      experience: 'all',
                      jobId: 'all'
                    })}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}

            {/* Bulk Actions Dropdown */}
            {showBulkActions && selectedIds.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBulkStatusChange('reviewed')}
                    className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-all"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('shortlisted')}
                    className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-all"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('interview')}
                    className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-all"
                  >
                    Move to Interview
                  </button>
                  <button
                    onClick={() => setShowJobAssignment(true)}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all"
                  >
                    Assign to Job
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('rejected')}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Select Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {selectAll ? 'Deselect All' : 'Select All'} ({filteredCandidates.length} candidates)
              </span>
            </div>
            {selectedIds.length > 0 && (
              <span className="text-sm font-medium text-blue-600">
                {selectedIds.length} selected
              </span>
            )}
          </div>

          {/* Candidates Grid/List */}
          {filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or upload new resumes</p>
              <Link
                to="/resumes"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resume</span>
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate._id}
                  candidate={candidate}
                  isSelected={selectedIds.includes(candidate._id)}
                  onSelect={() => handleSelectCandidate(candidate._id)}
                  getStatusColor={getStatusColor}
                  getScoreColor={getScoreColor}
                  onRefresh={fetchData}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map((candidate) => (
                <CandidateListItem
                  key={candidate._id}
                  candidate={candidate}
                  isSelected={selectedIds.includes(candidate._id)}
                  onSelect={() => handleSelectCandidate(candidate._id)}
                  getStatusColor={getStatusColor}
                  getScoreColor={getScoreColor}
                  onRefresh={fetchData}
                />
              ))}
            </div>
          )}

          {/* Job Assignment Modal */}
          {showJobAssignment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Assign to Job</h3>
                  <button
                    onClick={() => setShowJobAssignment(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Assign {selectedIds.length} candidate(s) to a job opening
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {jobs.map(job => (
                    <button
                      key={job._id}
                      onClick={() => handleBulkAssignToJob(job._id)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.location?.city || 'Remote'}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

// Candidate Card Component (Grid View)
const CandidateCard = ({ candidate, isSelected, onSelect, getStatusColor, getScoreColor, onRefresh }) => {
  const [showActions, setShowActions] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      await resumeAPI.updateStatus(candidate._id, { status: newStatus });
      toast.success('Status updated');
      onRefresh();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
      isSelected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <Link
                to={`/candidates/${candidate._id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
              >
                {candidate.personalInfo?.fullName || 'Unknown'}
              </Link>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Mail className="w-3 h-3 mr-1" />
                {candidate.personalInfo?.email || 'No email'}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-all"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <Link
                  to={`/candidates/${candidate._id}`}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Profile</span>
                </Link>
                <button
                  onClick={() => handleStatusChange('shortlisted')}
                  className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <Star className="w-4 h-4" />
                  <span>Shortlist</span>
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Score & Status Badges */}
        <div className="flex items-center gap-2 mb-4">
          {candidate.atsScore && (
            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(candidate.atsScore)}`}>
              <Award className="w-4 h-4" />
              <span>{candidate.atsScore}% ATS</span>
            </div>
          )}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
            {candidate.status || 'new'}
          </div>
        </div>

        {/* Candidate Summary */}
        <div className="space-y-3 mb-4">
          {/* Summary or Raw Text Preview */}
          {candidate.personalInfo?.summary ? (
            <div className="text-sm text-gray-700 line-clamp-3 bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Summary</p>
              {candidate.personalInfo.summary}
            </div>
          ) : candidate.rawText ? (
            <div className="text-sm text-gray-700 line-clamp-3 bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Preview</p>
              {candidate.rawText}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            {/* Experience */}
            <div className="flex items-start space-x-2 bg-blue-50 p-2 rounded-lg">
              <Briefcase className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase">Experience</p>
                <p className="text-sm text-gray-900 font-semibold truncate">
                  {candidate.totalExperience >= 0 
                    ? `${candidate.totalExperience} ${candidate.totalExperience === 1 ? 'year' : 'years'}`
                    : 'Not specified'}
                </p>
              </div>
            </div>

            {/* ATS Score Detail */}
            <div className="flex items-start space-x-2 bg-green-50 p-2 rounded-lg">
              <Award className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase">Match Score</p>
                <p className="text-sm text-gray-900 font-semibold">
                  {candidate.atsScore ? `${candidate.atsScore}%` : 'Not scored'}
                </p>
              </div>
            </div>
          </div>

          {/* Organizations */}
          {candidate.experience && candidate.experience.length > 0 && (
            <div className="flex items-start space-x-2">
              <Target className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase">Organizations</p>
                <p className="text-sm text-gray-900 mt-0.5 truncate">
                  {candidate.experience.slice(0, 2).map(exp => exp.company).filter(Boolean).join(' • ')}
                  {candidate.experience.length > 2 && ` • +${candidate.experience.length - 2} more`}
                </p>
              </div>
            </div>
          )}

          {/* Tech Skills */}
          {(candidate.skills?.technical?.length > 0 || candidate.skills?.tools?.length > 0 || 
            (Array.isArray(candidate.skills) && candidate.skills.length > 0)) && (
            <div className="flex items-start space-x-2">
              <Code className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Tech Skills</p>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(candidate.skills) 
                    ? candidate.skills 
                    : [...(candidate.skills?.technical || []), ...(candidate.skills?.tools || [])]
                  ).slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                      {skill}
                    </span>
                  ))}
                  {(Array.isArray(candidate.skills) ? candidate.skills.length : 
                    [...(candidate.skills?.technical || []), ...(candidate.skills?.tools || [])].length) > 4 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                      +{(Array.isArray(candidate.skills) ? candidate.skills.length : 
                        [...(candidate.skills?.technical || []), ...(candidate.skills?.tools || [])].length) - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 px-5 py-3 bg-gray-50 rounded-b-xl flex items-center justify-between">
        <Link
          to={`/candidates/${candidate._id}`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Full Profile →
        </Link>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 hover:bg-white rounded-lg transition-all" title="Download Resume">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-white rounded-lg transition-all" title="Add Note">
            <FileText className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Candidate List Item Component (List View)
const CandidateListItem = ({ candidate, isSelected, onSelect, getStatusColor, getScoreColor, onRefresh }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 p-4 flex items-center space-x-4 transition-all hover:shadow-md ${
      isSelected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      
      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
        {/* Name & Email */}
        <div className="col-span-3">
          <Link
            to={`/candidates/${candidate._id}`}
            className="font-semibold text-gray-900 hover:text-blue-600 block"
          >
            {candidate.personalInfo?.fullName || 'Unknown'}
          </Link>
          <p className="text-xs text-gray-600">{candidate.personalInfo?.email || 'No email'}</p>
        </div>

        {/* Score */}
        <div className="col-span-2">
          {candidate.atsScore && (
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(candidate.atsScore)}`}>
              <Award className="w-3 h-3" />
              <span>{candidate.atsScore}%</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="col-span-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
            {candidate.status || 'new'}
          </span>
        </div>

        {/* Experience */}
        <div className="col-span-2 text-sm text-gray-700">
          <div className="flex items-center">
            <Briefcase className="w-3 h-3 mr-1" />
            <span className="font-medium">{candidate.totalExperience || 0} yrs</span>
          </div>
        </div>

        {/* Top Companies */}
        <div className="col-span-2 text-xs text-gray-600">
          {candidate.experience && candidate.experience.length > 0 ? (
            <span className="truncate block">
              {candidate.experience.slice(0, 2).map(exp => exp.company).join(', ')}
            </span>
          ) : (
            <span className="text-gray-400">No experience</span>
          )}
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end space-x-1">
          <Link
            to={`/candidates/${candidate._id}`}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </Link>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentPoolNew;
