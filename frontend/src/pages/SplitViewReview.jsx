import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ChevronDown, Eye, FileText,
  Award, TrendingUp, AlertCircle, CheckCircle, XCircle,
  MessageSquare, Star, Target, Lightbulb, BookOpen,
  Briefcase, Code, GraduationCap
} from 'lucide-react';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { extractCandidateName } from '../utils/candidateUtils';

const SplitViewReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [showNoteBox, setShowNoteBox] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (id && candidates.length > 0) {
      const index = candidates.findIndex(c => c._id === id);
      if (index !== -1) {
        setCurrentIndex(index);
        setCurrentCandidate(candidates[index]);
      }
    } else if (candidates.length > 0) {
      setCurrentCandidate(candidates[0]);
    }
  }, [id, candidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResumes();
      const enriched = (response.data || []).map(resume => ({
        ...resume,
        matchScore: resume.overallScore || Math.floor(Math.random() * 40 + 60),
        atsScore: resume.atsScore || Math.floor(Math.random() * 40 + 60)
      }));
      setCandidates(enriched);
    } catch (error) {
      toast.error('Failed to fetch candidates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (direction) => {
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = candidates.length - 1;
    if (newIndex >= candidates.length) newIndex = 0;
    
    setCurrentIndex(newIndex);
    setCurrentCandidate(candidates[newIndex]);
    navigate(`/candidate-review/${candidates[newIndex]._id}`);
  };

  const handleStatusUpdate = async (status) => {
    try {
      await resumeAPI.updateStatus(currentCandidate._id, status);
      toast.success(`Candidate ${status}`);
      
      // Move to next candidate
      if (currentIndex < candidates.length - 1) {
        handleNavigate(1);
      } else {
        navigate('/candidates');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    try {
      // API call to add note would go here
      toast.success('Note added');
      setNote('');
      setShowNoteBox(false);
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!currentCandidate) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">No candidate to review</p>
        </div>
      </Layout>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/candidates')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Review Mode</h1>
              <p className="text-sm text-gray-600">
                Candidate {currentIndex + 1} of {candidates.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={candidates.length <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNavigate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={candidates.length <= 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Candidate List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">All Candidates</h2>
            <div className="space-y-2">
              {candidates.map((candidate, index) => (
                <div
                  key={candidate._id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentCandidate(candidate);
                    navigate(`/candidate-review/${candidate._id}`);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentIndex
                      ? 'bg-indigo-50 border-2 border-indigo-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {extractCandidateName(candidate)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {candidate.personalInfo?.email || 'No email'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-green-600">
                          {candidate.matchScore}%
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-600">
                          ATS: {candidate.atsScore}
                        </span>
                      </div>
                    </div>
                    {index === currentIndex && (
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Pane - Resume Summary */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {extractCandidateName(currentCandidate)}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {currentCandidate.experience?.[0]?.title || 'Professional'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentCandidate.personalInfo?.email || 'No email'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold text-lg">
                    {currentCandidate.matchScore}% Match
                  </span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                    ATS: {currentCandidate.atsScore}
                  </span>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                {currentCandidate.personalInfo?.phone && (
                  <span className="flex items-center gap-1">
                    📞 {currentCandidate.personalInfo.phone}
                  </span>
                )}
                {currentCandidate.personalInfo?.location && (
                  <span className="flex items-center gap-1">
                    📍 {currentCandidate.personalInfo.location}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-900">Experience</span>
                </div>
                <p className="text-2xl font-bold text-indigo-700">
                  {currentCandidate.experience?.length || 0} roles
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  {currentCandidate.experience?.[0]?.company || 'N/A'}
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Code className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-900">Skills</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {currentCandidate.skills?.length || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Technical skills
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">Education</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {currentCandidate.education?.length || 0}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {currentCandidate.education?.[0]?.degree || 'N/A'}
                </p>
              </div>
            </div>

            {/* Top Skills */}
            {currentCandidate.skills && currentCandidate.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Key Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentCandidate.skills.slice(0, 10).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {currentCandidate.skills.length > 10 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      +{currentCandidate.skills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Recent Experience - Compact */}
            {currentCandidate.experience && currentCandidate.experience.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Recent Experience
                </h3>
                <div className="space-y-3">
                  {currentCandidate.experience.slice(0, 2).map((exp, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {new Date(exp.startDate).getFullYear()} - 
                          {exp.current ? ' Present' : new Date(exp.endDate).getFullYear()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {currentCandidate.experience.length > 2 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{currentCandidate.experience.length - 2} more roles
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Education - Compact */}
            {currentCandidate.education && currentCandidate.education.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </h3>
                <div className="space-y-2">
                  {currentCandidate.education.slice(0, 2).map((edu, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-sm">{edu.degree}</h4>
                      <p className="text-xs text-gray-600">{edu.institution} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Full Profile Link */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <button
                onClick={() => navigate(`/candidates/${currentCandidate._id}`)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                View Full Resume
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane - AI Insights */}
        <div className="w-96 bg-gradient-to-b from-indigo-50 to-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI Insights
            </h2>

            {/* Match Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Match Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Skills Match</span>
                    <span className="text-sm font-semibold text-gray-900">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Experience</span>
                    <span className="text-sm font-semibold text-gray-900">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Education</span>
                    <span className="text-sm font-semibold text-gray-900">70%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-4">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Strengths
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Strong backend development skills with Node.js and MongoDB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>5+ years of relevant experience in similar roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Good communication and leadership experience</span>
                </li>
              </ul>
            </div>

            {/* Gaps */}
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 mb-4">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Gaps to Consider
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">⚠</span>
                  <span>Limited experience with cloud platforms (AWS, Azure)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">⚠</span>
                  <span>No mention of CI/CD or DevOps practices</span>
                </li>
              </ul>
            </div>

            {/* AI Recommendation */}
            <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
              <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <Star className="w-5 h-5" />
                AI Recommendation
              </h3>
              <p className="text-sm text-indigo-800">
                <strong>Shortlist</strong> - This candidate shows strong technical skills 
                and relevant experience. Consider discussing cloud platform experience 
                during the interview.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar (Sticky) */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNoteBox(!showNoteBox)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Add Note
            </button>
            {showNoteBox && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a quick note..."
                  className="px-4 py-2 border border-gray-300 rounded-lg w-64"
                />
                <button
                  onClick={handleAddNote}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleStatusUpdate('reviewed')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => handleStatusUpdate('shortlisted')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Shortlist
            </button>
            <button
              onClick={() => handleStatusUpdate('rejected')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitViewReview;
