import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2,
  Users,
  Target,
  MessageSquare,
  BarChart3,
  Upload,
  RefreshCw,
  FileDown,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import { jobAPI, exportAPI, resumeAPI, matchAPI } from '../services/api';
import CandidateRanking from '../components/CandidateRanking';
import CandidateCardDetailed from '../components/CandidateCardDetailed';
import CandidateFilters from '../components/CandidateFilters';
import AddNotesModal from '../components/AddNotesModal';
import BulkActionToolbar from '../components/BulkActionToolbar';
import ResumeUpload from '../components/ResumeUpload';
import JobPostModal from '../components/JobPostModal';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { extractCandidateName, extractCandidateEmail } from '../utils/candidateUtils';

const JobDetailNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [rescreening, setRescreening] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState(null);
  const [generatingPosts, setGeneratingPosts] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'matches', label: 'Matches', icon: Target },
    { id: 'interviews', label: 'Interviews', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  useEffect(() => {
    if (id && id !== 'new') {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJob(id);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleRescreenCandidates = async () => {
    if (!window.confirm('This will re-evaluate all candidates for this job. Continue?')) {
      return;
    }

    try {
      setRescreening(true);
      await jobAPI.rescreenCandidates(id);
      toast.success('Candidates re-screened successfully');
      fetchJob(); // Refresh data
    } catch (error) {
      console.error('Error rescreening:', error);
      toast.error('Failed to re-screen candidates');
    } finally {
      setRescreening(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportAPI.exportJobSummary(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `job_${id}_summary.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Job summary exported');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export job summary');
    }
  };

  const handleGeneratePosts = async () => {
    try {
      setGeneratingPosts(true);
      const response = await jobAPI.generateJobPosts(id);
      console.log('📊 Generated posts response:', response);
      console.log('📄 Posts data:', response.data);
      setGeneratedPosts(response.data);
      setShowPostModal(true);
      toast.success('Job posts generated successfully!');
    } catch (error) {
      console.error('Error generating posts:', error);
      toast.error('Failed to generate job posts');
    } finally {
      setGeneratingPosts(false);
    }
  };

  const handleRegeneratePosts = async () => {
    await handleGeneratePosts();
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      open: 'bg-green-100 text-green-700',
      closed: 'bg-red-100 text-red-700',
      'on-hold': 'bg-yellow-100 text-yellow-700'
    };
    return styles[status] || styles.draft;
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

  if (!job) {
    return (
      <Layout>
      <div className="text-center py-12">
        <p className="text-gray-600">Job not found</p>
        <Link to="/jobs" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Jobs
        </Link>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(job.status)}`}>
                {job.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {typeof job.location === 'object' 
                  ? `${job.location.city || ''}${job.location.city && job.location.state ? ', ' : ''}${job.location.state || ''}${(job.location.city || job.location.state) && job.location.country ? ', ' : ''}${job.location.country || ''}`
                  : job.location}
              </span>
              <span className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />
                {job.employmentType}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {job.requirements?.experience}+ years
              </span>
              {job.salary && (
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {job.salary.min}k - {job.salary.max}k {job.salary.currency}
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleGeneratePosts}
              disabled={generatingPosts}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate Job Posts"
            >
              <Sparkles className={`w-4 h-4 ${generatingPosts ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Generate Posts</span>
            </button>
            <button
              onClick={() => navigate(`/jobs/${id}/edit`)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit Job"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export Summary"
            >
              <FileDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{job.applicantsCount || 0}</p>
            <p className="text-sm text-gray-600">Candidates</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{job.matchesCount || 0}</p>
            <p className="text-sm text-gray-600">Matches</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{job.interviewsCount || 0}</p>
            <p className="text-sm text-gray-600">Interviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{job.viewsCount || 0}</p>
            <p className="text-sm text-gray-600">Views</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab job={job} />
          )}
          {activeTab === 'candidates' && (
            <CandidatesTab 
              jobId={id} 
              onUpload={() => setShowUploadModal(true)} 
              onRescreen={handleRescreenCandidates}
              rescreening={rescreening}
            />
          )}
          {activeTab === 'matches' && (
            <MatchesTab jobId={id} />
          )}
          {activeTab === 'interviews' && (
            <InterviewsTab jobId={id} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab jobId={id} />
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <ResumeUpload 
          jobId={id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchJob();
          }}
        />
      )}

      {/* Job Post Modal */}
      <JobPostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        posts={generatedPosts}
        onRegenerate={handleRegeneratePosts}
        loading={generatingPosts}
      />
    </div>
    </div>
    </div>
    </Layout>
  );
};

// Overview Tab Component
const OverviewTab = ({ job }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
      <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
      <div className="flex flex-wrap gap-2">
        {job.requirements?.skills?.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Experience: {job.requirements?.experience}+ years</li>
          <li>• Education: {job.requirements?.education}</li>
          <li>• Department: {job.department}</li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Type: {job.employmentType}</li>
          <li>• Location: {typeof job.location === 'object' 
            ? `${job.location.city || ''}${job.location.city && job.location.state ? ', ' : ''}${job.location.state || ''}${(job.location.city || job.location.state) && job.location.country ? ', ' : ''}${job.location.country || ''}`
            : job.location}</li>
          {job.salary && (
            <li>• Salary: {job.salary.min}k - {job.salary.max}k {job.salary.currency}</li>
          )}
        </ul>
      </div>
    </div>
  </div>
);

// Candidates Tab Component
const CandidatesTab = ({ jobId, onUpload, onRescreen, rescreening }) => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    skills: '',
    experienceMin: '',
    experienceMax: '',
    matchScoreMin: '',
    matchScoreMax: '',
    dateRange: 'all',
    sortBy: 'matchScore'
  });

  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [candidates, filters]);

  // Poll for parsing status updates - FIX: Prevent race condition
  useEffect(() => {
    const hasPendingResumes = candidates.some(
      c => c.parsingStatus === 'pending' || c.parsingStatus === 'processing' ||
           (c.parsingStatus === 'completed' && (!c.matchScore || c.matchScore === 0))
    );

    if (hasPendingResumes && !isPolling) {
      console.log('🔄 Polling for updates - pending resumes found');
      const interval = setInterval(async () => {
        if (!isPolling) { // Double-check before fetching
          setIsPolling(true);
          await fetchCandidates();
          setIsPolling(false);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [candidates, jobId, isPolling]);

  const fetchCandidates = async () => {
    if (isPolling) return; // Prevent concurrent fetches
    
    try {
      setLoading(true);
      const response = await resumeAPI.getResumesByJob(jobId);
      
      console.log('📊 Fetched resumes:', response.data);
      
      // Enrich with match scores
      const enriched = (response.data || []).map(resume => {
        console.log('📋 Resume parsing status:', {
          fileName: resume.fileName,
          parsingStatus: resume.parsingStatus,
          parsingError: resume.parsingError,
          hasRawText: !!resume.rawText,
          atsScore: resume.atsScore
        });
        
        const enrichedResume = {
          ...resume,
          matchScore: resume.matchScore || resume.overallScore || 0,
          atsScore: resume.atsScore || 0,
          skillsScore: resume.matchDetails?.skillMatch || 0,
          experienceScore: resume.matchDetails?.experienceMatch || 0,
          educationScore: resume.matchDetails?.educationMatch || 0
        };
        
        console.log('✅ Enriched candidate:', {
          name: resume.personalInfo?.fullName,
          matchScore: enrichedResume.matchScore,
          atsScore: enrichedResume.atsScore,
          skillsScore: enrichedResume.skillsScore,
          experienceScore: enrichedResume.experienceScore,
          educationScore: enrichedResume.educationScore,
          matchDetails: resume.matchDetails
        });
        
        return enrichedResume;
      });
      
      setCandidates(enriched);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
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
               c.skills?.technical?.some(skill => skill.toLowerCase().includes(searchLower));
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Skills filter
    if (filters.skills) {
      const skillsLower = filters.skills.toLowerCase();
      filtered = filtered.filter(c =>
        c.skills?.technical?.some(skill => skill.toLowerCase().includes(skillsLower))
      );
    }

    // Experience filter
    if (filters.experienceMin) {
      filtered = filtered.filter(c => calculateExperience(c) >= parseInt(filters.experienceMin));
    }
    if (filters.experienceMax) {
      filtered = filtered.filter(c => calculateExperience(c) <= parseInt(filters.experienceMax));
    }

    // Match score filter
    if (filters.matchScoreMin) {
      filtered = filtered.filter(c => c.matchScore >= parseInt(filters.matchScoreMin));
    }
    if (filters.matchScoreMax) {
      filtered = filtered.filter(c => c.matchScore <= parseInt(filters.matchScoreMax));
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(c => new Date(c.createdAt) >= filterDate);
    }

    // Sort
    filtered.sort((a, b) => {
      switch(filters.sortBy) {
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'matchScoreAsc':
          return a.matchScore - b.matchScore;
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return extractCandidateName(a).localeCompare(extractCandidateName(b));
        case 'experience':
          return calculateExperience(b) - calculateExperience(a);
        default:
          return 0;
      }
    });

    setFilteredCandidates(filtered);
  };

  const handleSelectAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map(c => c._id)));
    }
  };

  const handleSelect = (id) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCandidates(newSelected);
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      const resumeIds = Array.from(selectedCandidates);
      await resumeAPI.bulkUpdateStatus({ resumeIds, status: newStatus });
      toast.success(`Updated ${resumeIds.length} candidate(s) to ${newStatus}`);
      setSelectedCandidates(new Set());
      fetchCandidates();
    } catch (error) {
      toast.error('Failed to update candidates');
    }
  };

  const handleUpdateStatus = async (candidateId, newStatus) => {
    try {
      await resumeAPI.updateStatus(candidateId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchCandidates();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = (candidate) => {
    setCurrentCandidate(candidate);
    setShowNoteModal(true);
  };

  const handleSaveNote = async (candidateId, note) => {
    try {
      await resumeAPI.addNote(candidateId, { note });
      toast.success('Note added successfully');
      fetchCandidates();
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleViewDetails = (candidate) => {
    window.open(`/candidate-review/${candidate._id}`, '_blank');
  };

  const handleRetryParsing = async (candidate) => {
    try {
      await resumeAPI.retryParsing(candidate._id);
      toast.success('Parsing retry initiated. Please wait...');
      // Refresh after a short delay to allow parsing to start
      setTimeout(() => {
        fetchCandidates();
      }, 2000);
    } catch (error) {
      toast.error('Failed to retry parsing');
      console.error('Retry parsing error:', error);
    }
  };

  const handleRetryAllFailed = async () => {
    const failedCandidates = candidates.filter(c => {
      const resume = c.resumeId || c;
      return resume.parsingStatus === 'failed';
    });

    if (failedCandidates.length === 0) {
      toast.info('No failed parsing found');
      return;
    }

    try {
      toast.loading(`Retrying parsing for ${failedCandidates.length} candidates...`);
      await Promise.all(
        failedCandidates.map(c => resumeAPI.retryParsing(c._id))
      );
      toast.dismiss();
      toast.success(`Retry initiated for ${failedCandidates.length} candidates`);
      setTimeout(() => {
        fetchCandidates();
      }, 3000);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to retry parsing');
      console.error('Bulk retry error:', error);
    }
  };

  const handleRunMatching = async () => {
    const parsedCandidates = candidates.filter(c => {
      const resume = c.resumeId || c;
      return resume.parsingStatus === 'completed';
    });

    if (parsedCandidates.length === 0) {
      toast.error('No parsed resumes to match');
      return;
    }

    try {
      setLoading(true);
      toast.loading(`Running AI matching for ${parsedCandidates.length} candidates...`);
      
      // Call the matching endpoint
      await matchAPI.calculateJobMatches(jobId);
      
      toast.dismiss();
      toast.success(`Matching completed for ${parsedCandidates.length} candidates`);
      
      // Refresh to get updated scores
      fetchCandidates();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to run matching');
      console.error('Matching error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      skills: '',
      experienceMin: '',
      experienceMax: '',
      matchScoreMin: '',
      matchScoreMax: '',
      dateRange: 'all',
      sortBy: 'matchScore'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          All Candidates ({filteredCandidates.length})
        </h3>
        <div className="flex space-x-2">
          {candidates.some(c => (c.resumeId || c).parsingStatus === 'completed' && (!c.matchScore || c.matchScore === 0)) && (
            <button
              onClick={handleRunMatching}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Target className="w-4 h-4" />
              <span>Run AI Matching</span>
            </button>
          )}
          <button
            onClick={onRescreen}
            disabled={rescreening}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${rescreening ? 'animate-spin' : ''}`} />
            <span>{rescreening ? 'Re-screening...' : 'Re-screen All'}</span>
          </button>
          <button
            onClick={onUpload}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <CandidateFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions */}
      {selectedCandidates.size > 0 && (
        <BulkActionToolbar
          selectedCount={selectedCandidates.size}
          onStatusUpdate={handleBulkStatusUpdate}
          onDeselectAll={() => setSelectedCandidates(new Set())}
        />
      )}

      {/* Select All */}
      {filteredCandidates.length > 0 && (
        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
          >
            {selectedCandidates.size === filteredCandidates.length ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span className="font-medium">
              {selectedCandidates.size === filteredCandidates.length 
                ? 'Deselect All' 
                : 'Select All'}
            </span>
          </button>
          {selectedCandidates.size > 0 && (
            <span className="text-sm text-gray-600">
              ({selectedCandidates.size} selected)
            </span>
          )}
        </div>
      )}

      {/* Candidate Cards */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-600 mb-4">
            {candidates.length === 0 
              ? 'Upload resumes to start screening candidates'
              : 'Try adjusting your filters'}
          </p>
          {candidates.length === 0 && (
            <button
              onClick={onUpload}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Upload First Resume</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => (
            <CandidateCardDetailed
              key={candidate._id}
              candidate={candidate}
              isSelected={selectedCandidates.has(candidate._id)}
              onSelect={handleSelect}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              onAddNote={handleAddNote}
              onRetryParsing={handleRetryParsing}
              onGenerateInterview={(c) => {
                // Navigate to interview generation
                window.location.href = `/interviews/generate?candidateId=${c._id}&jobId=${jobId}`;
              }}
            />
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <AddNotesModal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setCurrentCandidate(null);
        }}
        candidate={currentCandidate}
        onSave={handleSaveNote}
      />
    </div>
  );
};

// Matches Tab Component
const MatchesTab = ({ jobId }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Matches</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Generate All Matches
        </button>
      </div>
      <CandidateRanking jobId={jobId} showFilters={true} matchesOnly={true} />
    </div>
  );
};

// Interviews Tab Component
const InterviewsTab = ({ jobId }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, [jobId]);

  const fetchInterviews = async () => {
    try {
      const response = await jobAPI.getInterviews(jobId);
      setInterviews(response.data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading interviews...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Interview Kits</h3>
      {interviews.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No interview kits generated yet
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {interview.candidateName}
                </p>
                <p className="text-sm text-gray-600">
                  {interview.questions?.length || 0} questions • Generated {new Date(interview.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Link
                to={`/interviews/${interview._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Kit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ jobId }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Job Analytics</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Conversion Rate</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">12%</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Avg Match Score</p>
          <p className="text-2xl font-bold text-green-900 mt-1">78%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-700 font-medium">Days Open</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">24</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 text-center">
          Detailed analytics coming soon
        </p>
      </div>
    </div>
  );
};

export default JobDetailNew;
