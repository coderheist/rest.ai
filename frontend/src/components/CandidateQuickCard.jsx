import { Mail, Phone, MapPin, Award, Briefcase } from 'lucide-react';
import { extractCandidateName, extractCandidateEmail, getCandidateInitials } from '../utils/candidateUtils';

const CandidateQuickCard = ({ candidate, onViewProfile, compact = false }) => {
  if (!candidate) return null;

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600 text-sm">
              {getCandidateInitials(candidate)}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {extractCandidateName(candidate)}
              </p>
              <p className="text-xs text-gray-500">
                {extractCandidateEmail(candidate).substring(0, 20)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getMatchColor(candidate.matchScore || 0)}`}>
              {candidate.matchScore || 0}%
            </span>
          </div>
        </div>
        {onViewProfile && (
          <button
            onClick={() => onViewProfile(candidate._id)}
            className="w-full px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 font-medium"
          >
            View Profile
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-sm">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl">
          {getCandidateInitials(candidate)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {extractCandidateName(candidate)}
          </h3>
          <p className="text-sm text-gray-600">
            {candidate.experience?.[0]?.title || 'Professional'}
          </p>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`rounded-lg p-3 ${getMatchColor(candidate.matchScore || 0)}`}>
          <p className="text-xs font-medium mb-1">Match Score</p>
          <p className="text-2xl font-bold">{candidate.matchScore || 0}%</p>
        </div>
        <div className="rounded-lg p-3 bg-blue-50 text-blue-700">
          <p className="text-xs font-medium mb-1">ATS Score</p>
          <p className="text-2xl font-bold">{candidate.atsScore || 0}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 text-sm">
        {candidate.personalInfo?.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{candidate.personalInfo.email}</span>
          </div>
        )}
        {candidate.personalInfo?.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{candidate.personalInfo.phone}</span>
          </div>
        )}
        {candidate.personalInfo?.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{candidate.personalInfo.location}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                +{candidate.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(candidate.status)}`}>
          Status: {candidate.status || 'new'}
        </span>
      </div>

      {/* Action Button */}
      {onViewProfile && (
        <button
          onClick={() => onViewProfile(candidate._id)}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        >
          View Full Profile
        </button>
      )}
    </div>
  );
};

export default CandidateQuickCard;
