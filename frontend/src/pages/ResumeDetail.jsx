import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import Layout from '../components/Layout';
import { ArrowLeft, Download, FileText, Award } from 'lucide-react';

const ResumeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Prevent trying to fetch invalid IDs like "upload"
    if (id && id !== 'upload') {
      fetchResume();
    } else {
      navigate('/resumes');
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await resumeAPI.getResume(id);
      setResume(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load resume');
      console.error('Error fetching resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFileViewerUrl = () => {
    if (!resume) return '';
    
    // For PDF files, use browser's native viewer or Google Docs viewer
    if (resume.fileType === 'application/pdf') {
      // Use the file URL from the backend
      return resume.fileUrl || `/uploads/resumes/${resume.fileName}`;
    }
    
    // For DOCX files, use Google Docs viewer or Office Online
    const fileUrl = encodeURIComponent(resume.fileUrl || window.location.origin + `/uploads/resumes/${resume.fileName}`);
    return `https://docs.google.com/viewer?url=${fileUrl}&embedded=true`;
  };

  const handleDownload = () => {
    if (resume?.fileUrl) {
      window.open(resume.fileUrl, '_blank');
    }
  };

  const getATSScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !resume) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Resume not found'}
          </div>
          <button
            onClick={() => navigate('/resumes')}
            className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Resumes
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/resumes')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Resumes</span>
          </button>
          
          <div className="flex items-center gap-4">
            {/* ATS Score Badge */}
            {resume.atsScore !== undefined && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getATSScoreColor(resume.atsScore)}`}>
                <Award size={20} />
                <div>
                  <div className="text-xs font-medium opacity-80">ATS Score</div>
                  <div className="text-lg font-bold">{resume.atsScore}%</div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={20} />
              Download
            </button>
          </div>
        </div>

        {/* Resume Info Card */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {resume.personalInfo?.fullName || 'Resume'}
                </h1>
                <p className="text-sm text-gray-600">{resume.fileName}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                resume.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                resume.status === 'reviewed' ? 'bg-purple-100 text-purple-800' :
                resume.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {resume.status}
              </span>
            </div>
          </div>
        </div>

        {/* Resume Viewer */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">Resume Document</h2>
          </div>
          
          <div className="relative" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
            {resume.fileType === 'application/pdf' ? (
              <iframe
                src={getFileViewerUrl()}
                className="w-full h-full border-0"
                title="Resume PDF Viewer"
              />
            ) : (
              <iframe
                src={getFileViewerUrl()}
                className="w-full h-full border-0"
                title="Resume Document Viewer"
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResumeDetail;
