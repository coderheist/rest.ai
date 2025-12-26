import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const CandidateFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.status !== 'all' || 
           filters.skills || 
           filters.experienceMin || 
           filters.experienceMax ||
           filters.sortBy !== 'matchScore';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg transition-colors ${
            showAdvanced 
              ? 'bg-blue-50 border-blue-300 text-blue-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters() && (
            <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {Object.values(filters).filter(v => v && v !== 'all' && v !== 'matchScore').length}
            </span>
          )}
        </button>
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Clear</span>
          </button>
        )}
      </div>

      {/* Quick Filters Row */}
      <div className="flex items-center space-x-3">
        {/* Status Filter */}
        <div className="relative flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="reviewed">Reviewed</option>
            <option value="interviewing">Interviewing</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
          <ChevronDown className="absolute right-3 top-8 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Sort By */}
        <div className="relative flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sortBy || 'matchScore'}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="matchScore">Match Score (High to Low)</option>
            <option value="matchScoreAsc">Match Score (Low to High)</option>
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="experience">Experience (High to Low)</option>
          </select>
          <ChevronDown className="absolute right-3 top-8 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200 space-y-4 animate-fadeIn">
          <h4 className="text-sm font-semibold text-gray-900">Advanced Filters</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Skills Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Skills Contains
              </label>
              <input
                type="text"
                placeholder="e.g., React, Node.js"
                value={filters.skills || ''}
                onChange={(e) => handleChange('skills', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Experience Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Experience Range (years)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="50"
                  value={filters.experienceMin || ''}
                  onChange={(e) => handleChange('experienceMin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="50"
                  value={filters.experienceMax || ''}
                  onChange={(e) => handleChange('experienceMax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Match Score Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Match Score Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min %"
                  min="0"
                  max="100"
                  value={filters.matchScoreMin || ''}
                  onChange={(e) => handleChange('matchScoreMin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max %"
                  min="0"
                  max="100"
                  value={filters.matchScoreMax || ''}
                  onChange={(e) => handleChange('matchScoreMax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Applied Date
              </label>
              <select
                value={filters.dateRange || 'all'}
                onChange={(e) => handleChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
              <ChevronDown className="absolute right-3 top-8 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateFilters;
