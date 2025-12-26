import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import Layout from '../components/Layout';

const Exports = () => {
  const [exportType, setExportType] = useState('candidates');
  const [format, setFormat] = useState('csv');
  const [filters, setFilters] = useState({
    jobId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const endpoint = exportType === 'candidates' 
        ? '/export/candidates/csv'
        : exportType === 'jobs'
        ? '/export/job-summary/pdf'
        : '/export/matches/excel';

      const response = await api.post(endpoint, filters, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exportType}_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${exportType} exported successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exports & Reports</h1>
        <p className="text-gray-600 mt-1">Download and share your hiring data</p>
      </div>

      {/* Export Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl">
        <div className="space-y-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What would you like to export?
            </label>
            <div className="space-y-3">
              {[
                { value: 'candidates', label: 'Candidates', icon: FileText, description: 'Export candidate profiles and resumes' },
                { value: 'jobs', label: 'Jobs', icon: FileSpreadsheet, description: 'Export job postings and details' },
                { value: 'matches', label: 'Matches', icon: File, description: 'Export match scores and rankings' }
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      exportType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportType"
                      value={type.value}
                      checked={exportType === type.value}
                      onChange={(e) => setExportType(e.target.value)}
                      className="sr-only"
                    />
                    <Icon className={`w-5 h-5 mr-3 ${
                      exportType === type.value ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium ${
                        exportType === type.value ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </p>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['csv', 'excel', 'pdf'].map((fmt) => (
                <label
                  key={fmt}
                  className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    format === fmt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={format === fmt}
                    onChange={(e) => setFormat(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-medium uppercase text-sm">{fmt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Filter className="w-4 h-4 mr-2" />
              Filters (Optional)
            </label>
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview</option>
                  <option value="hired">Hired</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Export {exportType.charAt(0).toUpperCase() + exportType.slice(1)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Exports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow duration-200 text-left">
            <div>
              <p className="font-medium text-gray-900">All Candidates</p>
              <p className="text-sm text-gray-600">CSV format</p>
            </div>
            <Download className="w-5 h-5 text-blue-600" />
          </button>
          <button className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow duration-200 text-left">
            <div>
              <p className="font-medium text-gray-900">Open Jobs</p>
              <p className="text-sm text-gray-600">PDF format</p>
            </div>
            <Download className="w-5 h-5 text-indigo-600" />
          </button>
          <button className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow duration-200 text-left">
            <div>
              <p className="font-medium text-gray-900">Top Matches</p>
              <p className="text-sm text-gray-600">Excel format</p>
            </div>
            <Download className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>
    </div>
    </div>
    </div>
    </Layout>
  );
};

export default Exports;
