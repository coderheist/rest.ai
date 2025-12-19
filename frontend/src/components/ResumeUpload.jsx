import { useState, useCallback } from 'react';
import { resumeAPI } from '../services/api';
import PropTypes from 'prop-types';

const ResumeUpload = ({ jobId = null, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);

  const validateFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB.';
    }

    return null;
  };

  const handleFiles = (newFiles) => {
    const validFiles = [];
    const errors = [];

    Array.from(newFiles).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError('');
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setProgress({ current: 0, total: files.length });

      if (files.length === 1) {
        // Single file upload
        const response = await resumeAPI.uploadResume(files[0], jobId);
        setProgress({ current: 1, total: 1 });
        
        if (onUploadComplete) {
          onUploadComplete(response.data);
        }
      } else {
        // Multiple files upload
        const response = await resumeAPI.uploadMultipleResumes(files, jobId);
        setProgress({ current: files.length, total: files.length });
        
        if (onUploadComplete) {
          onUploadComplete(response.data);
        }

        if (response.data.failed && response.data.failed.length > 0) {
          const failedMessages = response.data.failed.map(f => f.error).join('\n');
          setError(`Some uploads failed:\n${failedMessages}`);
        }
      }

      // Clear files after successful upload
      setFiles([]);
      setProgress(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resumes');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Resumes</h3>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drag and drop resumes here
            </p>
            <p className="text-sm text-gray-600 mt-1">
              or click to browse files
            </p>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileInput}
            className="hidden"
            id="resume-upload-input"
            disabled={uploading}
          />
          <label
            htmlFor="resume-upload-input"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Browse Files
          </label>
          <p className="text-xs text-gray-500">
            Supported formats: PDF, DOC, DOCX (max 10MB each)
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl">
                    {file.type === 'application/pdf' ? '📕' : '📘'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Uploading...</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      <div className="mt-6 flex justify-end space-x-4">
        {files.length > 0 && (
          <button
            onClick={() => setFiles([])}
            disabled={uploading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Clear All
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} Resume${files.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
};

ResumeUpload.propTypes = {
  jobId: PropTypes.string,
  onUploadComplete: PropTypes.func
};

export default ResumeUpload;
