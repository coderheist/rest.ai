import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const JobForm = ({ initialData = null, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: {
      type: 'onsite',
      city: '',
      state: '',
      country: ''
    },
    employmentType: 'full-time',
    experienceLevel: 'mid',
    experienceYears: {
      min: 0,
      max: null
    },
    salary: {
      min: null,
      max: null,
      currency: 'USD',
      period: 'yearly'
    },
    skills: {
      required: [],
      preferred: []
    },
    responsibilities: [],
    qualifications: [],
    benefits: [],
    status: 'draft',
    deadline: ''
  });

  const [currentSkillRequired, setCurrentSkillRequired] = useState('');
  const [currentSkillPreferred, setCurrentSkillPreferred] = useState('');
  const [currentResponsibility, setCurrentResponsibility] = useState('');
  const [currentQualification, setCurrentQualification] = useState('');
  const [currentBenefit, setCurrentBenefit] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddItem = (listName, currentValue, setCurrentValue) => {
    if (!currentValue.trim()) return;
    
    if (listName.includes('.')) {
      const [parent, child] = listName.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: [...prev[parent][child], currentValue.trim()]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [listName]: [...prev[listName], currentValue.trim()]
      }));
    }
    
    setCurrentValue('');
  };

  const handleRemoveItem = (listName, index) => {
    if (listName.includes('.')) {
      const [parent, child] = listName.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: prev[parent][child].filter((_, i) => i !== index)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [listName]: prev[listName].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up data
    const submitData = {
      ...formData,
      experienceYears: {
        min: Number(formData.experienceYears.min) || 0,
        max: formData.experienceYears.max ? Number(formData.experienceYears.max) : null
      },
      salary: {
        ...formData.salary,
        min: formData.salary.min ? Number(formData.salary.min) : null,
        max: formData.salary.max ? Number(formData.salary.max) : null
      },
      deadline: formData.deadline || null
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={200}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength={5000}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Detailed job description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Engineering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type *
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Type *
            </label>
            <select
              name="location.type"
              value={formData.location.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., San Francisco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="location.state"
              value={formData.location.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., California"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="location.country"
              value={formData.location.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., USA"
            />
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience Level *
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead</option>
              <option value="executive">Executive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Years
            </label>
            <input
              type="number"
              name="experienceYears.min"
              value={formData.experienceYears.min}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Years
            </label>
            <input
              type="number"
              name="experienceYears.max"
              value={formData.experienceYears.max || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Salary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Salary Range</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Salary
            </label>
            <input
              type="number"
              name="salary.min"
              value={formData.salary.min || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Salary
            </label>
            <input
              type="number"
              name="salary.max"
              value={formData.salary.max || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              name="salary.currency"
              value={formData.salary.currency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              name="salary.period"
              value={formData.salary.period}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hourly">Hourly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Required Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentSkillRequired}
              onChange={(e) => setCurrentSkillRequired(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('skills.required', currentSkillRequired, setCurrentSkillRequired))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a required skill..."
            />
            <button
              type="button"
              onClick={() => handleAddItem('skills.required', currentSkillRequired, setCurrentSkillRequired)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.required.map((skill, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveItem('skills.required', index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentSkillPreferred}
              onChange={(e) => setCurrentSkillPreferred(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('skills.preferred', currentSkillPreferred, setCurrentSkillPreferred))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a preferred skill..."
            />
            <button
              type="button"
              onClick={() => handleAddItem('skills.preferred', currentSkillPreferred, setCurrentSkillPreferred)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.preferred.map((skill, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveItem('skills.preferred', index)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Responsibilities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Responsibilities</h3>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={currentResponsibility}
            onChange={(e) => setCurrentResponsibility(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('responsibilities', currentResponsibility, setCurrentResponsibility))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a responsibility..."
          />
          <button
            type="button"
            onClick={() => handleAddItem('responsibilities', currentResponsibility, setCurrentResponsibility)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {formData.responsibilities.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem('responsibilities', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Qualifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Qualifications</h3>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={currentQualification}
            onChange={(e) => setCurrentQualification(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('qualifications', currentQualification, setCurrentQualification))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a qualification..."
          />
          <button
            type="button"
            onClick={() => handleAddItem('qualifications', currentQualification, setCurrentQualification)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {formData.qualifications.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem('qualifications', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Benefits</h3>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={currentBenefit}
            onChange={(e) => setCurrentBenefit(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('benefits', currentBenefit, setCurrentBenefit))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a benefit..."
          />
          <button
            type="button"
            onClick={() => handleAddItem('benefits', currentBenefit, setCurrentBenefit)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {formData.benefits.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem('benefits', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Status and Deadline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Status & Deadline</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
};

JobForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool
};

export default JobForm;
