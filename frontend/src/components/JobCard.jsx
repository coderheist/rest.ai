import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const JobCard = ({ job, onStatusChange, onDelete, onDuplicate }) => {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      archived: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.draft;
  };

  const getLocationDisplay = (location) => {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : location.type;
  };

  const formatSalary = (salary) => {
    if (!salary.min && !salary.max) return 'Not specified';
    
    const format = (num) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}k`;
      }
      return num;
    };

    const period = salary.period === 'yearly' ? '/year' : salary.period === 'monthly' ? '/mo' : '/hr';
    
    if (salary.min && salary.max) {
      return `${salary.currency} ${format(salary.min)} - ${format(salary.max)}${period}`;
    }
    if (salary.min) {
      return `${salary.currency} ${format(salary.min)}+${period}`;
    }
    return `Up to ${salary.currency} ${format(salary.max)}${period}`;
  };

  const getDaysPosted = () => {
    const days = Math.floor((Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link 
            to={`/jobs/${job._id}`}
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {job.title}
          </Link>
          {job.department && (
            <p className="text-sm text-gray-600 mt-1">{job.department}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>

      {/* Description Preview */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Job Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">📍</span>
          <span className="text-gray-700">{getLocationDisplay(job.location)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">💼</span>
          <span className="text-gray-700 capitalize">{job.employmentType.replace('-', ' ')}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">📊</span>
          <span className="text-gray-700 capitalize">{job.experienceLevel} Level</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">💰</span>
          <span className="text-gray-700">{formatSalary(job.salary)}</span>
        </div>
      </div>

      {/* Skills */}
      {job.skills?.required?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
          <div className="flex flex-wrap gap-2">
            {job.skills.required.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {job.skills.required.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{job.skills.required.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 border-t pt-4">
        <div className="flex items-center gap-1">
          <span>👥</span>
          <span>{job.applicantsCount || 0} applicants</span>
        </div>
        <div className="flex items-center gap-1">
          <span>👁️</span>
          <span>{job.viewsCount || 0} views</span>
        </div>
        <div className="ml-auto text-xs">
          {getDaysPosted()}
        </div>
      </div>

      {/* Deadline Warning */}
      {job.deadline && (
        <div className={`text-xs mb-4 p-2 rounded ${
          new Date(job.deadline) < new Date() 
            ? 'bg-red-50 text-red-700' 
            : 'bg-yellow-50 text-yellow-700'
        }`}>
          {new Date(job.deadline) < new Date() 
            ? '⚠️ Deadline passed' 
            : `⏰ Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Link
          to={`/jobs/${job._id}`}
          className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          View Details
        </Link>

        {onStatusChange && (
          <div className="relative group">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Status ▼
            </button>
            <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-10">
              {['draft', 'active', 'paused', 'closed', 'archived']
                .filter(s => s !== job.status)
                .map(status => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(job._id, status)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                  >
                    {status}
                  </button>
                ))}
            </div>
          </div>
        )}

        {onDuplicate && (
          <button
            onClick={() => onDuplicate(job._id)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            title="Duplicate job"
          >
            📋
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this job?')) {
                onDelete(job._id);
              }
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            title="Delete job"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    department: PropTypes.string,
    location: PropTypes.shape({
      type: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      country: PropTypes.string
    }),
    employmentType: PropTypes.string,
    experienceLevel: PropTypes.string,
    salary: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
      currency: PropTypes.string,
      period: PropTypes.string
    }),
    skills: PropTypes.shape({
      required: PropTypes.arrayOf(PropTypes.string),
      preferred: PropTypes.arrayOf(PropTypes.string)
    }),
    status: PropTypes.string.isRequired,
    applicantsCount: PropTypes.number,
    viewsCount: PropTypes.number,
    createdAt: PropTypes.string,
    deadline: PropTypes.string
  }).isRequired,
  onStatusChange: PropTypes.func,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func
};

export default JobCard;
