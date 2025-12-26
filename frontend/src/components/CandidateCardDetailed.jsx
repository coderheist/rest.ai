import { useState } from 'react';
import { 
  Eye, Mail, MessageSquare, FileDown, MoreVertical, 
  UserCheck, UserX, Star, Clock, Briefcase, Phone, RefreshCw
} from 'lucide-react';
import { extractCandidateName, extractCandidateEmail, getCandidateInitials } from '../utils/candidateUtils';

const CandidateCardDetailed = ({ 
  candidate, 
  onViewDetails, 
  onGenerateInterview,
  onUpdateStatus,
  onAddNote,
  onSelect,
  isSelected,
  onRetryParsing
}) => {
  const [showActions, setShowActions] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const resume = candidate.resumeId || candidate;
  
  // Enhanced debug logging - only log actual failures
  if (resume.parsingStatus === 'failed') {
    console.error('❌ PARSING FAILED for:', {
      fileName: resume.fileName,
      name: resume.personalInfo?.fullName || 'Unknown',
      status: resume.parsingStatus,
      error: resume.parsingError,
      hasRawText: !!resume.rawText,
      hasPersonalInfo: !!resume.personalInfo,
      hasSkills: !!(resume.skills?.technical?.length || resume.skills?.length),
      atsScore: resume.atsScore
    });
  } else if (resume.parsingStatus === 'pending' || resume.parsingStatus === 'processing') {
    console.warn('⏳ PARSING IN PROGRESS for:', {
      fileName: resume.fileName,
      status: resume.parsingStatus
    });
  }
  
  const name = extractCandidateName(resume);
  const email = extractCandidateEmail(resume);
  const initials = getCandidateInitials(resume);
  const phone = resume.personalInfo?.phone || resume.phone || 'N/A';
  const experience = calculateExperience(resume);
  const matchScore = candidate.overallScore || candidate.matchScore || 0;
  const atsScore = candidate.atsScore || resume.atsScore || 0;
  const status = candidate.status || 'new';

  // Get scores with fallbacks
  const skillsScore = candidate.skillsScore || candidate.matchDetails?.skillMatch || 0;
  const experienceScore = candidate.experienceScore || candidate.matchDetails?.experienceMatch || 0;
  const educationScore = candidate.educationScore || candidate.matchDetails?.educationMatch || 0;
  
  // Get actual resume data
  const skills = resume.skills?.technical || resume.skills || [];
  const education = resume.education || [];
  const hasMatchData = matchScore > 0 || skillsScore > 0;

  function calculateExperience(resume) {
    if (!resume.experience || resume.experience.length === 0) return 0;
    const totalMonths = resume.experience.reduce((acc, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate);
      return acc + (end - start) / (1000 * 60 * 60 * 24 * 30);
    }, 0);
    return Math.floor(totalMonths / 12);
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const formatScore = (score, label = 'Score') => {
    // If parsing is in progress or pending
    if (resume.parsingStatus === 'pending' || resume.parsingStatus === 'processing') {
      return { display: '...', label: 'Parsing', pending: true };
    }
    
    // If parsing failed
    if (resume.parsingStatus === 'failed') {
      return { display: 'N/A', label: 'Failed', pending: true };
    }
    
    // If score exists and is greater than 0
    if (score && score > 0) {
      return { display: `${Math.round(score)}%`, label, pending: false };
    }
    
    // For match scores - might still be calculating
    if (label === 'Match' && resume.parsingStatus === 'completed') {
      return { display: 'Calc...', label: 'Matching', pending: true };
    }
    
    // Default: not available yet
    return { display: 'N/A', label: 'Pending', pending: true };
  };

  const matchScoreData = formatScore(matchScore, 'Match');
  const atsScoreData = formatScore(atsScore, 'ATS');

  const getStatusConfig = (status) => {
    const configs = {
      new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Star },
      shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-700', icon: UserCheck },
      reviewed: { label: 'Reviewed', color: 'bg-purple-100 text-purple-700', icon: Eye },
      interviewing: { label: 'Interviewing', color: 'bg-indigo-100 text-indigo-700', icon: MessageSquare },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: UserX },
      hired: { label: 'Hired', color: 'bg-green-100 text-green-700', icon: UserCheck }
    };
    return configs[status] || configs.new;
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = (newStatus) => {
    onUpdateStatus(candidate._id, newStatus);
    setShowActions(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        {/* Checkbox + Avatar + Basic Info */}
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(candidate._id)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />

          {/* Avatar */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {initials}
          </div>

          {/* Name, Email, Phone */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
              <a 
                href={`mailto:${email}`}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors truncate"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{email}</span>
              </a>
              {phone !== 'N/A' && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{phone}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{experience} years</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1 ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3" />
                <span>{statusConfig.label}</span>
              </span>
              {resume.parsingStatus === 'pending' && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    ⏳ Parsing pending
                  </span>
                </>
              )}
              {resume.parsingStatus === 'processing' && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    ⚙️ Parsing...
                  </span>
                </>
              )}
              {resume.parsingStatus === 'failed' && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    ❌ Parsing failed•</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    Parsing {resume.parsingStatus}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Score Badges */}
        <div className="flex-shrink-0 flex flex-col space-y-2">
          <div className={`px-4 py-2 rounded-lg border-2 font-bold text-xl ${
            matchScoreData.pending 
              ? 'bg-gray-50 text-gray-400 border-gray-200' 
              : getScoreColor(matchScore)
          }`}>
            <div className="text-center">
              <div className={matchScoreData.pending ? 'animate-pulse' : ''}>
                {matchScoreData.display}
              </div>
              <div className="text-xs font-normal">{matchScoreData.label}</div>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 font-bold text-sm ${
            atsScoreData.pending 
              ? 'bg-gray-50 text-gray-400 border-gray-200' 
              : getScoreColor(atsScore)
          }`}>
            <div className="text-center">
              <div className={atsScoreData.pending ? 'animate-pulse' : ''}>
                {atsScoreData.display}
              </div>
              <div className="text-xs font-normal">{atsScoreData.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Row */}
      {skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 6).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium border border-blue-200"
              >
                {typeof skill === 'string' ? skill : skill.name || skill.skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      {hasMatchData && (matchScore > 0 || skillsScore > 0) ? (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Skills Match</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      skillsScore > 0 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    style={{ width: `${skillsScore || 0}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-bold min-w-[45px] ${
                  skillsScore > 0 ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {skillsScore > 0 ? `${Math.round(skillsScore)}%` : 'N/A'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Experience</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      experienceScore > 0 ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                    style={{ width: `${experienceScore || 0}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-bold min-w-[45px] ${
                  experienceScore > 0 ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {experienceScore > 0 ? `${Math.round(experienceScore)}%` : 'N/A'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Education</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      educationScore > 0 ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                    style={{ width: `${educationScore || 0}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-bold min-w-[45px] ${
                  educationScore > 0 ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {educationScore > 0 ? `${Math.round(educationScore)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-center text-sm text-gray-500">
            {resume.parsingStatus === 'completed' ? '⏳ Match scores calculating...' : '📄 Resume parsing in progress...'}
          </p>
        </div>
      )}

      {/* Retry Parsing Button for Failed */}
      {resume.parsingStatus === 'failed' && onRetryParsing && (
        <button
          onClick={async () => {
            setRetrying(true);
            await onRetryParsing(candidate);
            setRetrying(false);
          }}
          disabled={retrying}
          className="flex items-center space-x-1.5 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 mb-4"
        >
          <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
          <span>{retrying ? 'Retrying...' : 'Retry Parsing'}</span>
        </button>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(candidate)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          
          {onGenerateInterview && (
            <button
              onClick={() => onGenerateInterview(candidate)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Interview</span>
            </button>
          )}

          {onAddNote && (
            <button
              onClick={() => onAddNote(candidate)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              title="Add Note"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          <a
            href={`mailto:${email}`}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            title="Send Email"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>

        {/* More Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showActions && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowActions(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => handleStatusChange('shortlisted')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Move to Shortlisted</span>
                </button>
                <button
                  onClick={() => handleStatusChange('reviewed')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Mark as Reviewed</span>
                </button>
                <button
                  onClick={() => handleStatusChange('interviewing')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Move to Interviewing</span>
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <UserX className="w-4 h-4" />
                  <span>Reject Candidate</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <a
                  href={resume.filePath || '#'}
                  download
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Resume</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-3">
        <Clock className="w-3 h-3" />
        <span>Updated {new Date(candidate.updatedAt || candidate.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default CandidateCardDetailed;
