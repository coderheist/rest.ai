import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ChevronDown, Check, X, 
  Users, Briefcase, Award, Clock, MoreVertical,
  Eye, UserCheck, UserX, FolderPlus, Download,
  RefreshCw, SlidersHorizontal
} from 'lucide-react';
import { resumeAPI, jobAPI } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import BulkActionToolbar from '../components/BulkActionToolbar';
import RejectionDialog from '../components/RejectionDialog';
import { extractCandidateName, extractCandidateEmail, getCandidateInitials } from '../utils/candidateUtils';

const CandidateInbox = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectingCandidate, setRejectingCandidate] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    jobId: 'all',
    skills: '',
    experienceMin: '',
    experienceMax: '',
    status: 'all',
    source: 'all'
  });

  const [sortBy, setSortBy] = useState('matchScore'); // matchScore, atsScore, recent

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [candidates, filters, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesRes, jobsRes] = await Promise.all([
        resumeAPI.getResumes(),
        jobAPI.getJobs()
      ]);
      
      // Enrich candidates with match scores
      const enrichedCandidates = (candidatesRes.data || []).map(resume => ({
        ...resume,
        matchScore: resume.overallScore || Math.floor(Math.random() * 40 + 60), // Mock for now
        atsScore: resume.atsScore || Math.floor(Math.random() * 40 + 60), // Mock for now
        experience: calculateExperience(resume),
        status: resume.status || 'new'
      }));

      setCandidates(enrichedCandidates);
      setJobs(jobsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch candidates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateExperience = (resume) => {
    if (!resume.experience || resume.experience.length === 0) return 0;
    const totalMonths = resume.experience.reduce((acc, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate);
      return acc + (end - start) / (1000 * 60 * 60 * 24 * 30);
    }, 0);
    return Math.floor(totalMonths / 12);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...candidates];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => {
        const name = extractCandidateName(c).toLowerCase();
        const email = extractCandidateEmail(c).toLowerCase();
        return name.includes(searchLower) ||
               email.includes(searchLower) ||
               c.skills?.some(skill => skill.toLowerCase().includes(searchLower));
      });
    }

    // Job filter
    if (filters.jobId !== 'all') {
      filtered = filtered.filter(c => c.jobId === filters.jobId);
    }

    // Skills filter
    if (filters.skills) {
      const skillsLower = filters.skills.toLowerCase();
      filtered = filtered.filter(c =>
        c.skills?.some(skill => skill.toLowerCase().includes(skillsLower))
      );
    }

    // Experience filter
    if (filters.experienceMin) {
      filtered = filtered.filter(c => c.experience >= parseInt(filters.experienceMin));
    }
    if (filters.experienceMax) {
      filtered = filtered.filter(c => c.experience <= parseInt(filters.experienceMax));
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
      if (sortBy === 'atsScore') return b.atsScore - a.atsScore;
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    setFilteredCandidates(filtered);
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map(c => c._id)));
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCandidates(newSelected);
  };

  const handleReview = (candidateId) => {
    navigate(`/candidate-review/${candidateId}`);
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      const candidateIds = Array.from(selectedCandidates);
      await Promise.all(
        candidateIds.map(id => resumeAPI.updateStatus(id, newStatus))
      );
      toast.success(`Updated ${candidateIds.length} candidate(s) to ${newStatus}`);
      setSelectedCandidates(new Set());
      fetchData();
    } catch (error) {
      toast.error('Failed to update candidates');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedCandidates.size} candidate(s)?`)) return;
    
    try {
      const candidateIds = Array.from(selectedCandidates);
      await Promise.all(candidateIds.map(id => resumeAPI.delete(id)));
      toast.success(`Deleted ${candidateIds.length} candidate(s)`);
      setSelectedCandidates(new Set());
      fetchData();
    } catch (error) {
      toast.error('Failed to delete candidates');
    }
  };

  const handleReject = (candidate) => {
    setRejectingCandidate(candidate);
    setShowRejectDialog(true);
  };

  const confirmReject = async (reason, moveToTalentPool) => {
    try {
      await resumeAPI.updateStatus(rejectingCandidate._id, 'rejected', {
        rejectionReason: reason,
        talentPool: moveToTalentPool
      });
      toast.success('Candidate rejected');
      setShowRejectDialog(false);
      setRejectingCandidate(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to reject candidate');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-purple-100 text-purple-800',
      shortlisted: 'bg-green-100 text-green-800',
      interview: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.new;
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600';
  };



  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidate Inbox</h1>
            <p className="text-gray-600 mt-1">Review and manage incoming resumes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <FolderPlus className="w-5 h-5" />
              Upload Resumes
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
              </div>
              <Users className="w-10 h-10 text-indigo-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">
                  {candidates.filter(c => c.status === 'new').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-green-600">
                  {candidates.filter(c => c.status === 'shortlisted').length}
                </p>
              </div>
              <UserCheck className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Match Score</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {Math.round(candidates.reduce((acc, c) => acc + c.matchScore, 0) / candidates.length) || 0}%
                </p>
              </div>
              <Award className="w-10 h-10 text-indigo-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or skills..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Job Filter */}
            <select
              value={filters.jobId}
              onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="matchScore">Sort by Match Score</option>
              <option value="atsScore">Sort by ATS Score</option>
              <option value="recent">Sort by Recent</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Skills (e.g., React)"
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Min Experience (years)"
                value={filters.experienceMin}
                onChange={(e) => setFilters({ ...filters, experienceMin: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Max Experience (years)"
                value={filters.experienceMax}
                onChange={(e) => setFilters({ ...filters, experienceMax: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>

        {/* Bulk Action Toolbar */}
        {selectedCandidates.size > 0 && (
          <BulkActionToolbar
            selectedCount={selectedCandidates.size}
            onStatusUpdate={handleBulkStatusUpdate}
            onDelete={handleBulkDelete}
            onClear={() => setSelectedCandidates(new Set())}
          />
        )}

        {/* Candidates Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700"><span>Name</span></th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700"><span>Match</span></th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700"><span>ATS</span></th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700"><span>Experience</span></th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700"><span>Status</span></th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700"><span>Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                      No candidates found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map(candidate => (
                    <tr 
                      key={candidate._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.has(candidate._id)}
                          onChange={() => toggleSelect(candidate._id)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600">
                            {getCandidateInitials(candidate)}
                          </div>
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 truncate">
                              {extractCandidateName(candidate)}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {extractCandidateEmail(candidate)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-lg font-bold ${getMatchColor(candidate.matchScore)}`}>
                          {candidate.matchScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700 font-medium">{candidate.atsScore}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700">{candidate.experience}y</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(candidate.status)}`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleReview(candidate._id)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1 text-sm font-medium"
                          >
                            <span>Review</span>
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center text-sm text-gray-600">
          <span>Showing {filteredCandidates.length} of {candidates.length} candidates</span>
        </div>
      </div>

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <RejectionDialog
          candidate={rejectingCandidate}
          onConfirm={confirmReject}
          onCancel={() => {
            setShowRejectDialog(false);
            setRejectingCandidate(null);
          }}
        />
      )}
    </Layout>
  );
};

export default CandidateInbox;
