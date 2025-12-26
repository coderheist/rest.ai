import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Target,
  MessageSquare,
  Activity,
  Download
} from 'lucide-react';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';

const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'matches', label: 'Matches', icon: Target },
    { id: 'interviews', label: 'Interviews', icon: MessageSquare },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  useEffect(() => {
    if (id) {
      fetchCandidate();
    }
  }, [id]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResume(id);
      setCandidate(response.data);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      toast.error('Failed to load candidate profile');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700',
      reviewed: 'bg-purple-100 text-purple-700',
      shortlisted: 'bg-yellow-100 text-yellow-700',
      interview: 'bg-indigo-100 text-indigo-700',
      offer: 'bg-green-100 text-green-700',
      hired: 'bg-green-200 text-green-800',
      rejected: 'bg-red-100 text-red-700'
    };
    return styles[status] || styles.new;
  };

  const getATSScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <Layout>
      <div className="text-center py-12">
        <p className="text-gray-600">Candidate not found</p>
        <Link to="/talent-pool" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Talent Pool
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
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-white">
                {candidate.personalInfo?.fullName?.charAt(0).toUpperCase() || 'C'}
              </span>
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {candidate.personalInfo?.fullName || 'Unknown Candidate'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                {candidate.personalInfo?.email && (
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {candidate.personalInfo.email}
                  </span>
                )}
                {candidate.personalInfo?.phone && (
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {candidate.personalInfo.phone}
                  </span>
                )}
                {candidate.personalInfo?.location && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {candidate.personalInfo.location}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(candidate.status)}`}>
                  {candidate.status}
                </span>
                <span className={`text-2xl font-bold ${getATSScoreColor(candidate.atsScore)}`}>
                  {candidate.atsScore || 0}
                </span>
                <span className="text-sm text-gray-600">ATS Score</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {candidate.personalInfo?.linkedin && (
              <a
                href={candidate.personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {candidate.personalInfo?.website && (
              <a
                href={candidate.personalInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Website"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={() => window.open(candidate.filePath, '_blank')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download Resume"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{candidate.appliedJobs?.length || 0}</p>
            <p className="text-sm text-gray-600">Jobs Applied</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{candidate.experience?.length || 0}</p>
            <p className="text-sm text-gray-600">Years Experience</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {(candidate.skills?.technical?.length || 0) + (candidate.skills?.soft?.length || 0)}
            </p>
            <p className="text-sm text-gray-600">Skills</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{candidate.education?.length || 0}</p>
            <p className="text-sm text-gray-600">Degrees</p>
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
          {activeTab === 'profile' && <ProfileTab candidate={candidate} />}
          {activeTab === 'resume' && <ResumeTab candidate={candidate} />}
          {activeTab === 'matches' && <MatchesTab candidateId={id} />}
          {activeTab === 'interviews' && <InterviewsTab candidateId={id} />}
          {activeTab === 'activity' && <ActivityTab candidateId={id} />}
        </div>
      </div>
    </div>
    </div>
    </div>
    </Layout>
  );
};

// Profile Tab
const ProfileTab = ({ candidate }) => (
  <div className="space-y-6">
    {/* Skills */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Award className="w-5 h-5 mr-2" />
        Skills
      </h3>
      <div className="space-y-3">
        {candidate.skills?.technical && candidate.skills.technical.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Technical Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.technical.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {candidate.skills?.soft && candidate.skills.soft.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Soft Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.soft.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Experience Summary */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Briefcase className="w-5 h-5 mr-2" />
        Experience Summary
      </h3>
      <div className="space-y-4">
        {candidate.experience?.slice(0, 3).map((exp, index) => (
          <div key={index} className="border-l-2 border-blue-200 pl-4">
            <h4 className="font-semibold text-gray-900">{exp.title}</h4>
            <p className="text-sm text-gray-600">{exp.company}</p>
            <p className="text-sm text-gray-500">{exp.duration}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Education Summary */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <GraduationCap className="w-5 h-5 mr-2" />
        Education
      </h3>
      <div className="space-y-3">
        {candidate.education?.map((edu, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
            <p className="text-sm text-gray-600">{edu.institution}</p>
            <p className="text-sm text-gray-500">{edu.year}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Resume Tab
const ResumeTab = ({ candidate }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Resume Details</h3>
      <button
        onClick={() => window.open(candidate.filePath, '_blank')}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Download Original</span>
      </button>
    </div>

    <div className="bg-gray-50 rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700">File Name</p>
          <p className="text-gray-900">{candidate.fileName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">File Type</p>
          <p className="text-gray-900">{candidate.fileType?.toUpperCase()}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">ATS Score</p>
          <p className="text-2xl font-bold text-blue-600">{candidate.atsScore || 0}/100</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Uploaded</p>
          <p className="text-gray-900">{new Date(candidate.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>

    {/* Full experience and education */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">Complete Experience</h4>
      {candidate.experience?.map((exp, index) => (
        <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
          <h5 className="font-semibold text-gray-900">{exp.title}</h5>
          <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
          {exp.description && (
            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Matches Tab
const MatchesTab = ({ candidateId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [candidateId]);

  const fetchMatches = async () => {
    try {
      const response = await resumeAPI.getMatches(candidateId);
      setMatches(response.data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading matches...</div>;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Job Matches</h3>
      {matches.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No matches found</p>
      ) : (
        matches.map((match) => (
          <div
            key={match._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div>
              <p className="font-semibold text-gray-900">{match.jobId?.title}</p>
              <p className="text-sm text-gray-600">Match Score: {match.matchScore}%</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              match.matchScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {match.recommendation}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

// Interviews Tab
const InterviewsTab = ({ candidateId }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-gray-900">Interview Kits</h3>
    <p className="text-gray-600 text-center py-8">No interview kits generated yet</p>
  </div>
);

// Activity Tab
const ActivityTab = ({ candidateId }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
        <div>
          <p className="font-medium text-gray-900">Resume uploaded</p>
          <p className="text-sm text-gray-600">2 days ago</p>
        </div>
      </div>
    </div>
  </div>
);

export default CandidateProfile;
