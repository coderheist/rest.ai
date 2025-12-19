import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Usage API calls
export const usageAPI = {
  // Get current usage statistics
  getUsage: async () => {
    const response = await api.get('/usage');
    return response.data;
  },

  // Get usage analytics with warnings and recommendations (admin only)
  getAnalytics: async () => {
    const response = await api.get('/usage/analytics');
    return response.data;
  },

  // Increment usage counter (internal use)
  incrementUsage: async (counterName, amount = 1) => {
    const response = await api.post('/usage/increment', { counterName, amount });
    return response.data;
  }
};

// Job API calls
export const jobAPI = {
  // Get all jobs with optional filters
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get single job by ID
  getJob: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Create new job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update existing job
  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  // Delete job
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  // Change job status
  changeStatus: async (jobId, status) => {
    const response = await api.patch(`/jobs/${jobId}/status`, { status });
    return response.data;
  },

  // Get job statistics
  getStats: async () => {
    const response = await api.get('/jobs/stats/summary');
    return response.data;
  },

  // Get active jobs only
  getActiveJobs: async () => {
    const response = await api.get('/jobs/active');
    return response.data;
  },

  // Duplicate job
  duplicateJob: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/duplicate`);
    return response.data;
  },

  // Bulk update job status
  bulkUpdateStatus: async (jobIds, status) => {
    const response = await api.patch('/jobs/bulk/status', { jobIds, status });
    return response.data;
  }
};

// Resume API calls
export const resumeAPI = {
  // Upload single resume
  uploadResume: async (file, jobId = null) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (jobId) formData.append('jobId', jobId);
    
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Upload multiple resumes
  uploadMultipleResumes: async (files, jobId = null) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('resumes', file);
    });
    if (jobId) formData.append('jobId', jobId);
    
    const response = await api.post('/resumes/upload/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get all resumes with optional filters
  getResumes: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/resumes?${params.toString()}`);
    return response.data;
  },

  // Get single resume by ID
  getResume: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}`);
    return response.data;
  },

  // Delete resume
  deleteResume: async (resumeId) => {
    const response = await api.delete(`/resumes/${resumeId}`);
    return response.data;
  },

  // Update resume status
  updateStatus: async (resumeId, status) => {
    const response = await api.patch(`/resumes/${resumeId}/status`, { status });
    return response.data;
  },

  // Update resume metadata (notes, tags)
  updateMetadata: async (resumeId, metadata) => {
    const response = await api.patch(`/resumes/${resumeId}/metadata`, metadata);
    return response.data;
  },

  // Retry parsing
  retryParsing: async (resumeId) => {
    const response = await api.post(`/resumes/${resumeId}/retry-parse`);
    return response.data;
  },

  // Get resume statistics
  getStats: async (jobId = null) => {
    const params = jobId ? `?jobId=${jobId}` : '';
    const response = await api.get(`/resumes/stats/summary${params}`);
    return response.data;
  },

  // Search resumes
  searchResumes: async (query) => {
    const response = await api.get(`/resumes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get resumes by job
  getResumesByJob: async (jobId) => {
    const response = await api.get(`/resumes/job/${jobId}`);
    return response.data;
  },

  // Bulk update resume status
  bulkUpdateStatus: async (resumeIds, status) => {
    const response = await api.patch('/resumes/bulk/status', { resumeIds, status });
    return response.data;
  }
};

export default api;
