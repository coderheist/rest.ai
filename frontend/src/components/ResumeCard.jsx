import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ResumeCard = ({ resume, onStatusChange, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-purple-100 text-purple-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      interview: 'bg-yellow-100 text-yellow-800',
      offer: 'bg-orange-100 text-orange-800',
      hired: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || colors.new;
  };

  const getParsingStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.pending;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') return '📕';
    return '📘';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getFileIcon(resume.fileType)}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              {resume.personalInfo?.fullName || 'Unnamed Resume'}
            </h3>
          </div>
          {resume.personalInfo?.email && (
            <p className="text-sm text-gray-600">✉️ {resume.personalInfo.email}</p>
          )}
          {resume.personalInfo?.phone && (
            <p className="text-sm text-gray-600">📞 {resume.personalInfo.phone}</p>
          )}
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(resume.status)}`}>
            {resume.status}
          </span>
        </div>
      </div>

      {/* File Info */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="truncate max-w-[200px]" title={resume.fileName}>
            📄 {resume.fileName}
          </span>
          <span>{formatFileSize(resume.fileSize)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded ${getParsingStatusColor(resume.parsingStatus)}`}>
            {resume.parsingStatus === 'completed' ? '✓ Parsed' : 
             resume.parsingStatus === 'failed' ? '✗ Parsing Failed' :
             resume.parsingStatus === 'processing' ? '⏳ Parsing...' : '⏸ Pending'}
          </span>
          {resume.totalExperience > 0 && (
            <span className="text-xs text-gray-600">
              {Math.floor(resume.totalExperience / 12)}+ years exp
            </span>
          )}
        </div>
      </div>

      {/* Skills Preview */}
      {resume.skills?.technical?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Skills:</p>
          <div className="flex flex-wrap gap-1">
            {resume.skills.technical.slice(0, 4).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                {skill}
              </span>
            ))}
            {resume.skills.technical.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{resume.skills.technical.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Job Association */}
      {resume.jobId && (
        <div className="mb-4 text-sm">
          <span className="text-gray-600">Applied for: </span>
          <Link 
            to={`/jobs/${resume.jobId._id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {resume.jobId.title}
          </Link>
        </div>
      )}

      {/* Match Score */}
      {resume.matchScore !== undefined && resume.matchScore !== null && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Match Score</span>
            <span className="font-medium">{resume.matchScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                resume.matchScore >= 70 ? 'bg-green-500' :
                resume.matchScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${resume.matchScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 mb-4">
        <div className="flex justify-between">
          <span>Uploaded {new Date(resume.createdAt).toLocaleDateString()}</span>
          <span>{resume.viewCount || 0} views</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Link
          to={`/resumes/${resume._id}`}
          className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          View Details
        </Link>

        {onStatusChange && (
          <div className="relative group">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Status ▼
            </button>
            <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-10">
              {['new', 'reviewed', 'shortlisted', 'rejected', 'interview', 'offer', 'hired']
                .filter(s => s !== resume.status)
                .map(status => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(resume._id, status)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                  >
                    {status}
                  </button>
                ))}
            </div>
          </div>
        )}

        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this resume?')) {
                onDelete(resume._id);
              }
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            title="Delete resume"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

ResumeCard.propTypes = {
  resume: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    fileName: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
    fileType: PropTypes.string.isRequired,
    parsingStatus: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    personalInfo: PropTypes.object,
    skills: PropTypes.object,
    jobId: PropTypes.object,
    matchScore: PropTypes.number,
    totalExperience: PropTypes.number,
    viewCount: PropTypes.number,
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  onStatusChange: PropTypes.func,
  onDelete: PropTypes.func
};

export default ResumeCard;
