import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { interviewAPI, jobAPI, resumeAPI } from '../services/api';
import Layout from '../components/Layout';
import InterviewKitDisplay from '../components/InterviewKitDisplay';

const InterviewKit = () => {
  const { kitId } = useParams();
  const navigate = useNavigate();
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('technical');

  useEffect(() => {
    fetchKit();
  }, [kitId]);

  const fetchKit = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getKit(kitId);
      setKit(response.data);
    } catch (err) {
      console.error('Error fetching interview kit:', err);
      setError(err.response?.data?.error || 'Failed to load interview kit');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !kit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Interview kit not found'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 print:mb-4">
        <div className="flex justify-between items-start mb-4 print:hidden">
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            ← Back
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Print / Export PDF
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 print:bg-none print:text-black print:border print:border-gray-300">
          <h1 className="text-3xl font-bold mb-2">Interview Kit</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Position</div>
              <div>{kit.jobId?.title}</div>
            </div>
            <div>
              <div className="font-medium">Candidate</div>
              <div>{kit.resumeId?.personalInfo?.fullName || 'N/A'}</div>
            </div>
            <div>
              <div className="font-medium">Total Questions</div>
              <div>{kit.totalQuestions || 0}</div>
            </div>
            <div>
              <div className="font-medium">Duration</div>
              <div>{kit.estimatedDuration || kit.interviewStructure?.duration || 60} minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Structure */}
      {kit.interviewStructure && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 print:break-inside-avoid">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Structure</h2>
          <div className="space-y-3">
            {kit.interviewStructure.sections?.map((section, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="text-lg font-bold text-blue-600">{section.duration}m</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{section.name}</div>
                  <div className="text-sm text-gray-600">{section.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden print:hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('technical')}
            className={`flex-1 px-6 py-3 font-medium ${
              activeTab === 'technical'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Technical ({kit.technicalQuestions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('behavioral')}
            className={`flex-1 px-6 py-3 font-medium ${
              activeTab === 'behavioral'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Behavioral ({kit.behavioralQuestions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('situational')}
            className={`flex-1 px-6 py-3 font-medium ${
              activeTab === 'situational'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Situational ({kit.situationalQuestions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`flex-1 px-6 py-3 font-medium ${
              activeTab === 'evaluation'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Evaluation
          </button>
        </div>
      </div>

      {/* Technical Questions */}
      {(activeTab === 'technical' || window.matchMedia('print').matches) && kit.technicalQuestions && (
        <div className="space-y-6 mb-6 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 hidden print:block">Technical Questions</h2>
          {kit.technicalQuestions.map((q, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 print:break-inside-avoid">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Q{index + 1}. {q.question}
                </h3>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {q.timeEstimate}m
                  </span>
                </div>
              </div>

              {q.skillsAssessed && q.skillsAssessed.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Skills Assessed:</div>
                  <div className="flex flex-wrap gap-2">
                    {q.skillsAssessed.map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {q.expectedAnswer && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Expected Answer:</div>
                  <p className="text-sm text-gray-600">{q.expectedAnswer}</p>
                </div>
              )}

              {q.evaluationCriteria && q.evaluationCriteria.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Evaluation Criteria:</div>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    {q.evaluationCriteria.map((criterion, i) => (
                      <li key={i}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Behavioral Questions */}
      {(activeTab === 'behavioral' || window.matchMedia('print').matches) && kit.behavioralQuestions && (
        <div className="space-y-6 mb-6 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 hidden print:block">Behavioral Questions</h2>
          {kit.behavioralQuestions.map((q, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 print:break-inside-avoid">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q{index + 1}. {q.question}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Category:</div>
                  <div className="text-sm text-gray-600 capitalize">{q.category?.replace('_', ' ')}</div>
                </div>
                {q.competency && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Competency:</div>
                    <div className="text-sm text-gray-600">{q.competency}</div>
                  </div>
                )}
              </div>

              {q.starFramework && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">STAR Framework:</div>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Situation:</span> {q.starFramework.situation}</div>
                    <div><span className="font-medium">Task:</span> {q.starFramework.task}</div>
                    <div><span className="font-medium">Action:</span> {q.starFramework.action}</div>
                    <div><span className="font-medium">Result:</span> {q.starFramework.result}</div>
                  </div>
                </div>
              )}

              {q.evaluationCriteria && q.evaluationCriteria.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Evaluation Criteria:</div>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    {q.evaluationCriteria.map((criterion, i) => (
                      <li key={i}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Situational Questions */}
      {(activeTab === 'situational' || window.matchMedia('print').matches) && kit.situationalQuestions && kit.situationalQuestions.length > 0 && (
        <div className="space-y-6 mb-6 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 hidden print:block">Situational Questions</h2>
          {kit.situationalQuestions.map((q, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 print:break-inside-avoid">
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Scenario:</div>
                <p className="text-gray-900 mb-3">{q.scenario}</p>
                <div className="text-lg font-semibold text-gray-900">Q: {q.question}</div>
              </div>

              {q.expectedApproach && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Expected Approach:</div>
                  <p className="text-sm text-gray-600">{q.expectedApproach}</p>
                </div>
              )}

              {q.evaluationPoints && q.evaluationPoints.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Evaluation Points:</div>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    {q.evaluationPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Evaluation Rubric */}
      {(activeTab === 'evaluation' || window.matchMedia('print').matches) && kit.evaluationRubric && (
        <div className="space-y-6 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900">Evaluation Rubric</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(kit.evaluationRubric).map(([key, value]) => (
              <div key={key} className="bg-white border border-gray-200 rounded-lg p-6 print:break-inside-avoid">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">{value.weight}%</span>
                </div>
                {value.criteria && value.criteria.length > 0 && (
                  <ul className="text-sm text-gray-600 space-y-1">
                    {value.criteria.map((criterion, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {kit.redFlags && kit.redFlags.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 print:break-inside-avoid">
                <h3 className="text-lg font-semibold text-red-900 mb-3">🚩 Red Flags</h3>
                <ul className="text-sm text-red-800 space-y-2">
                  {kit.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {kit.greenFlags && kit.greenFlags.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 print:break-inside-avoid">
                <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Green Flags</h3>
                <ul className="text-sm text-green-800 space-y-2">
                  {kit.greenFlags.map((flag, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Interviewer Notes */}
          {kit.interviewerNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 print:break-inside-avoid">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Interviewer Notes</h3>
              <p className="text-sm text-blue-800">{kit.interviewerNotes}</p>
            </div>
          )}

          {/* Focus Areas */}
          {kit.focusAreas && kit.focusAreas.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 print:break-inside-avoid">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {kit.focusAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500 print:mt-12">
        <p>Generated on {new Date(kit.createdAt).toLocaleString()}</p>
        <p>Model: {kit.llmModel}</p>
      </div>
    </Layout>
  );
};

export default InterviewKit;
