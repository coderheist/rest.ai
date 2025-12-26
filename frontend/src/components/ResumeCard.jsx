import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Award,
  Briefcase,
  GraduationCap,
  MapPin
} from 'lucide-react';

const ResumeCard = ({ resume, rank, onDelete, onStatusChange }) => {
  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') return '📕';
    return '📘';
  };

  const getStatusConfig = (status) => {
    const configs = {
      new: { 
        label: 'New', 
        bgColor: 'bg-blue-100', 
        textColor: 'text-blue-700',
        icon: Clock,
        borderColor: 'border-blue-300'
      },
      reviewed: { 
        label: 'Reviewed', 
        bgColor: 'bg-purple-100', 
        textColor: 'text-purple-700',
        icon: Eye,
        borderColor: 'border-purple-300'
      },
      shortlisted: { 
        label: 'Shortlisted', 
        bgColor: 'bg-green-100', 
        textColor: 'text-green-700',
        icon: Star,
        borderColor: 'border-green-300'
      },
      rejected: { 
        label: 'Rejected', 
        bgColor: 'bg-red-100', 
        textColor: 'text-red-700',
        icon: XCircle,
        borderColor: 'border-red-300'
      },
      interview: { 
        label: 'Interview', 
        bgColor: 'bg-yellow-100', 
        textColor: 'text-yellow-700',
        icon: Briefcase,
        borderColor: 'border-yellow-300'
      },
      offer: { 
        label: 'Offer', 
        bgColor: 'bg-indigo-100', 
        textColor: 'text-indigo-700',
        icon: Award,
        borderColor: 'border-indigo-300'
      },
      hired: { 
        label: 'Hired', 
        bgColor: 'bg-emerald-100', 
        textColor: 'text-emerald-700',
        icon: CheckCircle,
        borderColor: 'border-emerald-300'
      }
    };
    return configs[status] || configs.new;
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete resume: ${resume.personalInfo?.fullName || resume.fileName}?`)) {
      onDelete(resume._id);
    }
  };

  const handleStatusChange = (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(resume._id, newStatus);
    }
  };

  const statusConfig = getStatusConfig(resume.status || 'new');
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${statusConfig.borderColor} overflow-hidden relative group`}>
      {/* Top Bar with Status and Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} text-xs font-semibold`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.label}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Delete resume"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Rank Badge - Floating */}
      {rank && rank <= 10 && (
        <div className={`absolute top-14 left-4 z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-lg ${
          rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900' :
          rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
          rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-orange-900' :
          'bg-gradient-to-br from-blue-400 to-blue-500 text-blue-900'
        }`}>
          #{rank}
        </div>
      )}

      {/* Main Content */}
      <div className="p-5">
        {/* Name and File Info */}
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-2">
            <span className="text-2xl mt-1">{getFileIcon(resume.fileType)}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                {resume.personalInfo?.fullName || resume.candidateName || 'Unnamed Candidate'}
              </h3>
              <p className="text-xs text-gray-500 truncate" title={resume.fileName}>
                {resume.fileName}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          {(resume.personalInfo?.email || resume.email || resume.personalInfo?.location?.city) && (
            <div className="space-y-1 mt-3 text-xs text-gray-600">
              {(resume.personalInfo?.email || resume.email) && (
                <div className="flex items-center gap-1.5 truncate">
                  <span>📧</span>
                  <span className="truncate">{resume.personalInfo?.email || resume.email}</span>
                </div>
              )}
              {resume.personalInfo?.location?.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  <span>{resume.personalInfo.location.city}{resume.personalInfo.location.state ? `, ${resume.personalInfo.location.state}` : ''}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scores Section */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* ATS Score */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs font-semibold text-gray-600 mb-1">ATS SCORE</p>
            <div className={`text-2xl font-bold ${
              resume.atsScore >= 80 ? 'text-green-600' :
              resume.atsScore >= 60 ? 'text-blue-600' :
              resume.atsScore >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {resume.atsScore !== undefined && resume.atsScore !== null ? Math.round(resume.atsScore) : 0}
              <span className="text-sm">%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  resume.atsScore >= 80 ? 'bg-green-500' :
                  resume.atsScore >= 60 ? 'bg-blue-500' :
                  resume.atsScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${resume.atsScore || 0}%` }}
              />
            </div>
          </div>

          {/* Match Score */}
          {resume.matchScore !== undefined && resume.matchScore !== null && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-semibold text-gray-600 mb-1">MATCH</p>
              <div className={`text-2xl font-bold ${
                resume.matchScore >= 80 ? 'text-green-600' :
                resume.matchScore >= 60 ? 'text-purple-600' :
                resume.matchScore >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(resume.matchScore)}
                <span className="text-sm">%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    resume.matchScore >= 80 ? 'bg-green-500' :
                    resume.matchScore >= 60 ? 'bg-purple-500' :
                    resume.matchScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${resume.matchScore || 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Experience (if no match score) */}
          {(resume.matchScore === undefined || resume.matchScore === null) && resume.totalExperience !== undefined && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                EXPERIENCE
              </p>
              <div className="text-2xl font-bold text-green-700">
                {Math.floor(resume.totalExperience / 12) || 0}
                <span className="text-sm">y</span>
              </div>
            </div>
          )}
        </div>

        {/* Skills Preview */}
        {resume.skills && (resume.skills.technical?.length > 0 || resume.skills.length > 0) && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Top Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {(resume.skills.technical || resume.skills).slice(0, 3).map((skill, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {((resume.skills.technical || resume.skills).length > 3) && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  +{(resume.skills.technical || resume.skills).length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {onStatusChange && (
          <div className="mb-4 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {resume.status !== 'reviewed' && (
                <button
                  onClick={(e) => handleStatusChange(e, 'reviewed')}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md text-xs font-medium transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Review
                </button>
              )}
              {resume.status !== 'shortlisted' && (
                <button
                  onClick={(e) => handleStatusChange(e, 'shortlisted')}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-xs font-medium transition-colors"
                >
                  <Star className="w-3 h-3" />
                  Shortlist
                </button>
              )}
              {resume.status !== 'interview' && (
                <button
                  onClick={(e) => handleStatusChange(e, 'interview')}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-md text-xs font-medium transition-colors"
                >
                  <Briefcase className="w-3 h-3" />
                  Interview
                </button>
              )}
              {resume.status !== 'rejected' && (
                <button
                  onClick={(e) => handleStatusChange(e, 'rejected')}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-medium transition-colors"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
              )}
            </div>
          </div>
        )}

        {/* View Details Button */}
        <Link
          to={`/resumes/${resume._id}`}
          className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-sm shadow-md hover:shadow-lg"
        >
          View Full Profile
        </Link>
      </div>
    </div>
  );
};

ResumeCard.propTypes = {
  rank: PropTypes.number,
  resume: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    fileName: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    personalInfo: PropTypes.object,
    candidateName: PropTypes.string,
    email: PropTypes.string,
    atsScore: PropTypes.number,
    matchScore: PropTypes.number,
    totalExperience: PropTypes.number,
    skills: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    status: PropTypes.string
  }).isRequired,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func
};

export default ResumeCard;
