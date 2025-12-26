import { X, TrendingUp, Award, Briefcase, GraduationCap, MapPin, Sparkles } from 'lucide-react';
import { useState } from 'react';

const MatchDetailDrawer = ({ match, onClose, onGenerateInterview, onChangeStatus }) => {
  const [showExplanation, setShowExplanation] = useState(true);

  if (!match) return null;

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMatchLabel = (score) => {
    if (score >= 90) return { label: 'Strong Match', emoji: '🟢' };
    if (score >= 75) return { label: 'Good Match', emoji: '🔵' };
    if (score >= 60) return { label: 'Potential', emoji: '🟡' };
    return { label: 'Weak Match', emoji: '🔴' };
  };

  const matchLabel = getMatchLabel(match.matchScore);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {match.candidateName || match.resumeId?.personalInfo?.fullName}
              </h2>
              <p className="text-gray-600">
                {match.jobTitle || match.jobId?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Overall Match Score */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overall Match</p>
              <div className="flex items-center space-x-2">
                <span className={`text-4xl font-bold ${getMatchColor(match.matchScore).split(' ')[0]}`}>
                  {match.matchScore}%
                </span>
                <span className="text-2xl">{matchLabel.emoji}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(match.matchScore)}`}>
                  {matchLabel.label}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-block px-3 py-1 mt-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {match.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  match.matchScore >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  match.matchScore >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  match.matchScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${match.matchScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Score Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Score Breakdown
            </h3>
            <div className="space-y-4">
              {match.breakdown && Object.entries(match.breakdown).map(([key, value]) => {
                const icons = {
                  skills: Award,
                  experience: Briefcase,
                  education: GraduationCap,
                  location: MapPin
                };
                const Icon = icons[key] || Award;
                const percentage = Math.round(value);
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center text-sm font-medium text-gray-700 capitalize">
                        <Icon className="w-4 h-4 mr-2 text-gray-500" />
                        {key}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          percentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                          percentage >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Explanation */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                AI Explanation
                <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-medium rounded">
                  AI-Suggested
                </span>
              </h3>
              <span className="text-gray-500">
                {showExplanation ? '▼' : '▶'}
              </span>
            </button>
            
            {showExplanation && (
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {match.explanation || 'AI analysis of this match will appear here. The system evaluates skills overlap, experience relevance, education fit, and location compatibility to provide this recommendation.'}
                </p>
                
                {match.strengths && match.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-green-800 mb-1">✓ Strengths:</p>
                    <ul className="space-y-1">
                      {match.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-green-700">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {match.concerns && match.concerns.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 mb-1">⚠ Areas to explore:</p>
                    <ul className="space-y-1">
                      {match.concerns.map((concern, index) => (
                        <li key={index} className="text-sm text-yellow-700">• {concern}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700 italic">
                    💡 This is an AI suggestion. Human review and judgment are essential for final decisions.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Skills Match (if available) */}
          {match.matchingSkills && match.matchingSkills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Matching Skills</h3>
              <div className="flex flex-wrap gap-2">
                {match.matchingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 space-y-3">
            <button
              onClick={() => onGenerateInterview && onGenerateInterview(match)}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Interview Kit</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onChangeStatus && onChangeStatus('shortlisted')}
                className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200"
              >
                Shortlist
              </button>
              <button
                onClick={() => onChangeStatus && onChangeStatus('rejected')}
                className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                Reject
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchDetailDrawer;
