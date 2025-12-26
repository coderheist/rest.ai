import React from 'react';

const InterviewKitDisplay = ({ interviewKit, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!interviewKit) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600">No interview kit available</p>
      </div>
    );
  }

  const {
    technicalQuestions = [],
    behavioralQuestions = [],
    situationalQuestions = [],
    focusAreas = [],
    recommendedDuration = 60,
    interviewerNotes
  } = interviewKit;

  // Helper function to get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Question component
  const QuestionCard = ({ question, index, categoryColor }) => (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <span className={`flex-shrink-0 w-8 h-8 rounded-full ${categoryColor} flex items-center justify-center text-white font-bold text-sm`}>
            {index + 1}
          </span>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900 mb-2">{question.question}</h4>
            {question.difficulty && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>

      {question.expectedAnswer && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-1">Expected Answer:</p>
          <p className="text-sm text-blue-800">{question.expectedAnswer}</p>
        </div>
      )}

      {question.evaluationCriteria && question.evaluationCriteria.length > 0 && (
        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
          <p className="text-xs font-semibold text-purple-900 mb-2">Evaluation Criteria:</p>
          <ul className="space-y-1">
            {question.evaluationCriteria.map((criteria, idx) => (
              <li key={idx} className="text-sm text-purple-800 flex items-start">
                <span className="mr-2">•</span>
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {question.followUpQuestions && question.followUpQuestions.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-900 mb-2">Follow-up Questions:</p>
          <ul className="space-y-1">
            {question.followUpQuestions.map((followUp, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">→</span>
                <span>{followUp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Interview Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Kit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Questions</p>
            <p className="text-2xl font-bold text-gray-900">
              {technicalQuestions.length + behavioralQuestions.length + situationalQuestions.length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Duration</p>
            <p className="text-2xl font-bold text-gray-900">{recommendedDuration} min</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Focus Areas</p>
            <p className="text-2xl font-bold text-gray-900">{focusAreas.length}</p>
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      {focusAreas.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Focus Areas</h3>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium text-sm"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interviewer Notes */}
      {interviewerNotes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Interviewer Notes
          </h3>
          <p className="text-sm text-yellow-800">{interviewerNotes}</p>
        </div>
      )}

      {/* Technical Questions */}
      {technicalQuestions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            Technical Questions ({technicalQuestions.length})
          </h3>
          <div className="space-y-4">
            {technicalQuestions.map((q, idx) => (
              <QuestionCard key={idx} question={q} index={idx} categoryColor="bg-blue-600" />
            ))}
          </div>
        </div>
      )}

      {/* Behavioral Questions */}
      {behavioralQuestions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
            Behavioral Questions ({behavioralQuestions.length})
          </h3>
          <div className="space-y-4">
            {behavioralQuestions.map((q, idx) => (
              <QuestionCard key={idx} question={q} index={idx} categoryColor="bg-green-600" />
            ))}
          </div>
        </div>
      )}

      {/* Situational Questions */}
      {situationalQuestions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </span>
            Situational Questions ({situationalQuestions.length})
          </h3>
          <div className="space-y-4">
            {situationalQuestions.map((q, idx) => (
              <QuestionCard key={idx} question={q} index={idx} categoryColor="bg-purple-600" />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 bg-white border border-gray-200 rounded-lg p-4">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Interview Kit
        </button>
        <button
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
};

export default InterviewKitDisplay;
