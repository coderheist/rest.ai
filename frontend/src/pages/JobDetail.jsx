import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI, exportAPI, reviewAPI } from '../services/api';
import JobForm from '../components/JobForm';
import Layout from '../components/Layout';
import ResumeUpload from '../components/ResumeUpload';
import CandidateRanking from '../components/CandidateRanking';
import JobInsights from '../components/JobInsights';
import ReviewCard from '../components/ReviewCard';
import { FileDown, FileSpreadsheet, FileText, Star, ThumbsUp, ThumbsDown, AlertCircle, Upload } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(isNew);
  
  // AI features state
  const [topCandidates, setTopCandidates] = useState([]);
  const [jobInsights, setJobInsights] = useState(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [rescreening, setRescreening] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, candidates, insights, reviews
  const [exporting, setExporting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchJob();
      fetchTopCandidates();
      fetchJobInsights();
      fetchJobReviews();
    }
  }, [id]);

  const fetchTopCandidates = async () => {
    try {
      setLoadingCandidates(true);
      const response = await jobAPI.getTopCandidates(id, 10);
      setTopCandidates(response.data || []);
    } catch (err) {
      console.error('Error fetching top candidates:', err);
      // Don't show error, just leave empty
    } finally {
      setLoadingCandidates(false);
    }
  };

  const fetchJobInsights = async () => {
    try {
      setLoadingInsights(true);
      const response = await jobAPI.getJobInsights(id);
      setJobInsights(response.data || null);
    } catch (err) {
      console.error('Error fetching job insights:', err);
      // Don't show error, just leave empty
    } finally {
      setLoadingInsights(false);
    }
  };

  const fetchJobReviews = async () => {
    try {
      setLoadingReviews(true);
      const [reviewsRes, distRes] = await Promise.all([
        reviewAPI.getByJob(id),
        reviewAPI.getRecommendationDistribution(id)
      ]);
      setReviews(reviewsRes.data?.reviews || reviewsRes.data || []);
      setReviewStats(distRes.data || null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Don't show error, just leave empty
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleRescreenCandidates = async () => {
    if (!window.confirm('This will re-evaluate all candidates for this job. Continue?')) {
      return;
    }

    try {
      setRescreening(true);
      await jobAPI.rescreenCandidates(id);
      // Refresh data after rescreening
      await fetchTopCandidates();
      await fetchJobInsights();
      alert('Candidates have been rescreened successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to rescreen candidates');
    } finally {
      setRescreening(false);
    }
  };

  const handleResumeUpload = () => {
    setShowUploadModal(true);
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    // Refresh data after upload
    fetchTopCandidates();
    fetchJobInsights();
    alert('Resume(s) uploaded successfully!');
  };

  const handleViewCandidateDetails = (candidate) => {
    if (candidate._id) {
      navigate(`/matches/${candidate._id}`);
    }
  };

  const handleGenerateInterview = (candidate) => {
    if (candidate.resumeId?._id) {
      navigate(`/interview-kit/new?jobId=${id}&resumeId=${candidate.resumeId._id}`);
    }
  };

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await jobAPI.getJob(id);
      setJob(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch job details');
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      setError('');
      
      if (isNew) {
        const response = await jobAPI.createJob(formData);
        navigate(`/jobs/${response.data._id}`);
      } else {
        const response = await jobAPI.updateJob(id, formData);
        setJob(response.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error saving job:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors
          .map(e => `${e.field}: ${e.message}`)
          .join(', ');
        setError(`Validation failed: ${validationErrors}`);
      } else {
        setError(err.response?.data?.error || `Failed to ${isNew ? 'create' : 'update'} job`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/jobs');
    } else {
      setIsEditing(false);
      setError('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await jobAPI.deleteJob(id);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete job');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await jobAPI.changeStatus(id, newStatus);
      setJob(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change status');
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await jobAPI.duplicateJob(id);
      navigate(`/jobs/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to duplicate job');
    }
  };
const handleExportCSV = async () => {
    try {
      setExporting(true);
      const response = await exportAPI.exportCandidatesCSV(id);
      const filename = `${job.title.replace(/\s+/g, '_')}_candidates_${new Date().toISOString().split('T')[0]}.csv`;
      exportAPI.downloadFile(response.data, filename);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleExportJobSummary = async () => {
    try {
      setExporting(true);
      const response = await exportAPI.exportJobSummaryPDF(id);
      const filename = `${job.title.replace(/\s+/g, '_')}_summary_${new Date().toISOString().split('T')[0]}.pdf`;
      exportAPI.downloadFile(response.data, filename);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to export summary');
    } finally {
      setExporting(false);
    }
  };

  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
{/* Export Dropdown */}
                <div className="relative group">
                  <button
                    disabled={exporting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    {exporting ? 'Exporting...' : 'Export'}
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={handleExportCSV}
                      disabled={exporting}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Export to CSV</div>
                        <div className="text-xs text-gray-500">All candidates data</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportJobSummary}
                      disabled={exporting}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">Job Summary PDF</div>
                        <div className="text-xs text-gray-500">Complete report</div>
                      </div>
                    </button>
                  </div>
                </div>

                
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/jobs" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Jobs
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isNew ? 'Create New Job' : isEditing ? 'Edit Job' : job?.title}
              </h1>
              {!isNew && !isEditing && job && (
                <p className="text-gray-600 mt-2">
                  Created {new Date(job.createdAt).toLocaleDateString()} • 
                  {job.applicantsCount || 0} applicants • 
                  {job.viewsCount || 0} views
                </p>
              )}
            </div>

            {!isNew && !isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDuplicate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Duplicate
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
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

        {/* Form or View */}
        {(isNew || isEditing) ? (
          <JobForm
            initialData={job}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={saving}
          />
        ) : (
          job && (
            <div className="bg-white rounded-lg shadow p-8 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between pb-6 border-b">
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    job.status === 'active' ? 'bg-green-100 text-green-800' :
                    job.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    job.status === 'closed' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  
                  {job.status !== 'archived' && (
                    <div className="relative group">
                      <button className="text-sm text-blue-600 hover:text-blue-800 underline">
                        Change Status ▼
                      </button>
                      <div className="absolute top-full mt-2 left-0 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                        {['draft', 'active', 'paused', 'closed', 'archived']
                          .filter(s => s !== job.status)
                          .map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(status)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                            >
                              {status}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {job.deadline && (
                  <div className={`text-sm ${
                    new Date(job.deadline) < new Date() ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <Link
                  to={`/jobs/${id}/candidates`}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-center font-medium"
                >
                  View Ranked Candidates
                </Link>
                <button
                  onClick={handleResumeUpload}
                  className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center font-medium"
                >
                  Upload Resume
                </button>
                <button
                  onClick={handleRescreenCandidates}
                  disabled={rescreening}
                  className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rescreening ? 'Rescreening...' : 'Rescreen All'}
                </button>
              </div>

              {/* Tabs Navigation - Premium Design */}
              <div className="border-b-2 border-gray-200 mb-6">
                <nav className="flex space-x-1 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`relative py-4 px-6 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                      activeTab === 'overview'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="relative z-10">Overview</span>
                    {activeTab === 'overview' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-full animate-slideUp"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('candidates')}
                    className={`relative py-4 px-6 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                      activeTab === 'candidates'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>Candidates</span>
                      {topCandidates.length > 0 && (
                        <span className="px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-bold shadow-md">
                          {topCandidates.length}
                        </span>
                      )}
                    </span>
                    {activeTab === 'candidates' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-full animate-slideUp"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`relative py-4 px-6 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                      activeTab === 'insights'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="relative z-10">AI Insights</span>
                    {activeTab === 'insights' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-full animate-slideUp"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`relative py-4 px-6 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                      activeTab === 'reviews'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>Reviews</span>
                      {reviews.length > 0 && (
                        <span className="px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-bold shadow-md">
                          {reviews.length}
                        </span>
                      )}
                    </span>
                    {activeTab === 'reviews' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-full animate-slideUp"></div>
                    )}
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Department</h3>
                  <p className="text-gray-900">{job.department || 'Not specified'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Employment Type</h3>
                  <p className="text-gray-900 capitalize">{job.employmentType.replace('-', ' ')}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                  <p className="text-gray-900">
                    {job.location.type.charAt(0).toUpperCase() + job.location.type.slice(1)}
                    {(job.location.city || job.location.state || job.location.country) && (
                      <> • {[job.location.city, job.location.state, job.location.country].filter(Boolean).join(', ')}</>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Experience Level</h3>
                  <p className="text-gray-900 capitalize">{job.experienceLevel} Level</p>
                </div>

                {(job.experienceYears.min || job.experienceYears.max) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Experience Required</h3>
                    <p className="text-gray-900">
                      {job.experienceYears.min} - {job.experienceYears.max || '+'} years
                    </p>
                  </div>
                )}

                {(job.salary.min || job.salary.max) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Salary Range</h3>
                    <p className="text-gray-900">
                      {job.salary.currency} {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} 
                      {job.salary.period === 'yearly' ? '/year' : job.salary.period === 'monthly' ? '/month' : '/hour'}
                    </p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {(job.skills.required.length > 0 || job.skills.preferred.length > 0) && (
                <div className="py-6 border-t">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                  
                  {job.skills.required.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Required</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.required.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.skills.preferred.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.preferred.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities.length > 0 && (
                <div className="py-6 border-t">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {job.responsibilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {job.qualifications.length > 0 && (
                <div className="py-6 border-t">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Qualifications</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {job.qualifications.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits.length > 0 && (
                <div className="py-6 border-t">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {job.benefits.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Posted By */}
              {job.createdBy && (
                <div className="py-6 border-t">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Posted By</h2>
                  <p className="text-gray-700">
                    {job.createdBy.name} ({job.createdBy.email})
                  </p>
                </div>
              )}
                </div>
              )}

              {/* Candidates Tab */}
              {activeTab === 'candidates' && (
                <div className="space-y-6">
                  {/* Upload Section - Premium Design */}
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">Upload Candidates</h3>
                          <p className="text-gray-600">Add resumes directly to this job position</p>
                        </div>
                      </div>
                      <button
                        onClick={handleResumeUpload}
                        className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload Resume</span>
                      </button>
                    </div>
                  </div>

                  {/* Candidate Ranking Component */}
                  <CandidateRanking
                    candidates={topCandidates}
                    loading={loadingCandidates}
                    onViewDetails={handleViewCandidateDetails}
                    onGenerateInterview={handleGenerateInterview}
                  />
                </div>
              )}

              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div>
                  <JobInsights
                    insights={jobInsights}
                    loading={loadingInsights}
                  />
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {loadingReviews ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-600">
                        Reviews will appear here once candidates have been evaluated.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Review Statistics */}
                      {reviewStats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Total Reviews</span>
                              <Star className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {reviewStats.totalReviews || 0}
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Strong Yes</span>
                              <ThumbsUp className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              {reviewStats.recommendations?.['strong-yes'] || 0}
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Yes</span>
                              <ThumbsUp className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {reviewStats.recommendations?.yes || 0}
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">No</span>
                              <ThumbsDown className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="text-2xl font-bold text-red-600">
                              {(reviewStats.recommendations?.no || 0) + (reviewStats.recommendations?.['strong-no'] || 0)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard 
                            key={review._id} 
                            review={review}
                            showCandidateName={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Upload Resume for {job?.title}</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ResumeUpload jobId={id} onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default JobDetail;
