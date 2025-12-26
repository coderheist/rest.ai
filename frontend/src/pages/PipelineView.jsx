import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Clock, UserCheck, UserX, Video, 
  Plus, Search, Filter, RefreshCw, Eye
} from 'lucide-react';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { extractCandidateName, getCandidateInitials } from '../utils/candidateUtils';
import CandidateQuickCard from '../components/CandidateQuickCard';

const PipelineView = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  const statuses = [
    { id: 'new', label: 'New', icon: Clock, color: 'bg-blue-500' },
    { id: 'reviewed', label: 'Reviewed', icon: Eye, color: 'bg-purple-500' },
    { id: 'shortlisted', label: 'Shortlisted', icon: UserCheck, color: 'bg-green-500' },
    { id: 'interview', label: 'Interview', icon: Video, color: 'bg-yellow-500' },
    { id: 'rejected', label: 'Rejected', icon: UserX, color: 'bg-red-500' }
  ];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResumes();
      const enriched = (response.data || []).map(resume => ({
        ...resume,
        matchScore: resume.overallScore || Math.floor(Math.random() * 40 + 60),
        atsScore: resume.atsScore || Math.floor(Math.random() * 40 + 60),
        status: resume.status || 'new'
      }));
      setCandidates(enriched);
    } catch (error) {
      toast.error('Failed to fetch candidates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCandidatesByStatus = (status) => {
    return candidates
      .filter(c => c.status === status)
      .filter(c => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          c.personalInfo?.fullName?.toLowerCase().includes(search) ||
          c.candidateName?.toLowerCase().includes(search) ||
          c.personalInfo?.email?.toLowerCase().includes(search)
        );
      });
  };

  const handleDragStart = (e, candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    if (!draggedCandidate || draggedCandidate.status === newStatus) {
      setDraggedCandidate(null);
      return;
    }

    try {
      await resumeAPI.updateStatus(draggedCandidate._id, newStatus);
      
      // Update local state
      setCandidates(prev =>
        prev.map(c =>
          c._id === draggedCandidate._id
            ? { ...c, status: newStatus }
            : c
        )
      );
      
      toast.success(`Moved to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setDraggedCandidate(null);
    }
  };

  const handleCardClick = (candidateId) => {
    navigate(`/candidates/${candidateId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline View</h1>
            <p className="text-gray-600 mt-1">Visual hiring pipeline - drag & drop to update status</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <button
              onClick={fetchCandidates}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-6 text-sm">
          {statuses.map(status => {
            const count = getCandidatesByStatus(status.id).length;
            const Icon = status.icon;
            return (
              <div key={status.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                <span className="font-medium text-gray-700">{status.label}:</span>
                <span className="font-bold text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-5 gap-4">
          {statuses.map(status => {
            const statusCandidates = getCandidatesByStatus(status.id);
            const Icon = status.icon;

            return (
              <div
                key={status.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.id)}
                className="bg-gray-50 rounded-lg border-2 border-gray-200 min-h-[600px] flex flex-col"
              >
                {/* Column Header */}
                <div className={`${status.color} text-white p-4 rounded-t-lg`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-bold text-lg">{status.label}</h3>
                    </div>
                    <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full text-sm font-semibold">
                      {statusCandidates.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {statusCandidates.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No candidates</p>
                    </div>
                  ) : (
                    statusCandidates.map(candidate => (
                      <div
                        key={candidate._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate)}
                        onClick={() => handleCardClick(candidate._id)}
                        onMouseEnter={() => setHoveredCard(candidate._id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`bg-white rounded-lg border-2 p-4 cursor-move hover:shadow-lg transition-all ${
                          draggedCandidate?._id === candidate._id
                            ? 'opacity-50 border-indigo-500'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {/* Avatar & Name */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600 flex-shrink-0">
                            {(candidate.personalInfo?.fullName || candidate.candidateName || 'U')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {candidate.personalInfo?.fullName || candidate.candidateName || 'Unknown'}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {candidate.personalInfo?.email || 'No email'}
                            </p>
                          </div>
                        </div>

                        {/* Scores */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 bg-green-50 rounded px-2 py-1">
                            <p className="text-xs text-green-600 font-medium">Match</p>
                            <p className="text-sm font-bold text-green-700">{candidate.matchScore}%</p>
                          </div>
                          <div className="flex-1 bg-blue-50 rounded px-2 py-1">
                            <p className="text-xs text-blue-600 font-medium">ATS</p>
                            <p className="text-sm font-bold text-blue-700">{candidate.atsScore}</p>
                          </div>
                        </div>

                        {/* Skills Preview */}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quick Action on Hover */}
                        {hoveredCard === candidate._id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/candidate-review/${candidate._id}`);
                              }}
                              className="w-full px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Quick Review
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Drag and drop candidates between columns to update their status. 
            Click on a card to view the full profile.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PipelineView;
