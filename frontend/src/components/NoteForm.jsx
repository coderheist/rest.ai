import { useState } from 'prop-types';
import PropTypes from 'prop-types';
import { noteAPI } from '../services/api';
import { X, Save, Pin, AlertCircle } from 'lucide-react';

const NoteForm = ({ entityType, entityId, onSave, onCancel, initialData = null }) => {
  const [content, setContent] = useState(initialData?.content || '');
  const [type, setType] = useState(initialData?.type || 'general');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Note content is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const noteData = {
        relatedTo: {
          type: entityType,
          id: entityId
        },
        content: content.trim(),
        type,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isPinned,
        isPrivate
      };

      let savedNote;
      if (initialData) {
        savedNote = await noteAPI.update(initialData._id, noteData);
      } else {
        savedNote = await noteAPI.create(noteData);
      }

      onSave(savedNote);
      
      // Reset form if creating new note
      if (!initialData) {
        setContent('');
        setType('general');
        setTags('');
        setIsPinned(false);
        setIsPrivate(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {initialData ? 'Edit Note' : 'Add New Note'}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add your note here..."
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {content.length}/2000 characters
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="general">General</option>
              <option value="interview">Interview</option>
              <option value="screening">Screening</option>
              <option value="feedback">Feedback</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. important, technical, follow-up"
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 flex items-center">
              <Pin className="w-4 h-4 mr-1" />
              Pin this note
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Private (only visible to you)</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : initialData ? 'Update Note' : 'Save Note'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

NoteForm.propTypes = {
  entityType: PropTypes.oneOf(['job', 'resume', 'match']).isRequired,
  entityId: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  initialData: PropTypes.object
};

export default NoteForm;
