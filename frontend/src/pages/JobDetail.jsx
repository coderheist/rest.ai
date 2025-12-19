import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI } from '../services/api';
import JobForm from '../components/JobForm';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(isNew);

  useEffect(() => {
    if (!isNew) {
      fetchJob();
    }
  }, [id]);

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
      setError(err.response?.data?.error || `Failed to ${isNew ? 'create' : 'update'} job`);
      console.error('Error saving job:', err);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  onClick={() => {/* TODO: Implement resume upload */}}
                  className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center font-medium"
                >
                  Upload Resume
                </button>
              </div>

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
          )
        )}
      </div>
    </div>
  );
};

export default JobDetail;
