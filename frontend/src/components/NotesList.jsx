import { useState } from 'react';
import PropTypes from 'prop-types';
import { noteAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Pin, Edit2, Trash2, Clock, Tag, User, Lock } from 'lucide-react';

const NotesList = ({ entityType, entityId, notes: initialNotes, onNoteChange }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState(initialNotes || []);
  const [editingNote, setEditingNote] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNoteTypeColor = (type) => {
    const colors = {
      general: 'bg-gray-100 text-gray-700',
      interview: 'bg-blue-100 text-blue-700',
      screening: 'bg-green-100 text-green-700',
      feedback: 'bg-yellow-100 text-yellow-700',
      'follow-up': 'bg-purple-100 text-purple-700'
    };
    return colors[type] || colors.general;
  };

  const handleTogglePin = async (noteId) => {
    try {
      const updatedNote = await noteAPI.togglePin(noteId);
      const newNotes = notes.map(n => n._id === noteId ? updatedNote : n);
      setNotes(newNotes);
      if (onNoteChange) onNoteChange(newNotes);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await noteAPI.delete(noteId);
      const newNotes = notes.filter(n => n._id !== noteId);
      setNotes(newNotes);
      if (onNoteChange) onNoteChange(newNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const canEditNote = (note) => {
    return note.userId?._id === user?._id || user?.role === 'ADMIN';
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No notes yet. Add your first note above.</p>
      </div>
    );
  }

  // Sort notes: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="space-y-4">
      {sortedNotes.map((note) => (
        <div
          key={note._id}
          className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
            note.isPinned
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2 flex-1">
              {note.isPinned && (
                <Pin className="w-4 h-4 text-blue-600 fill-current flex-shrink-0" />
              )}
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getNoteTypeColor(
                  note.type
                )}`}
              >
                {note.type}
              </span>
              {note.isPrivate && (
                <Lock className="w-4 h-4 text-gray-400" title="Private note" />
              )}
            </div>

            {canEditNote(note) && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleTogglePin(note._id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    note.isPinned
                      ? 'text-blue-600 hover:bg-blue-100'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={note.isPinned ? 'Unpin note' : 'Pin note'}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingNote(note)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit note"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <p className="text-gray-900 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
            {note.content}
          </p>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center space-x-1 mb-3 flex-wrap gap-1">
              <Tag className="w-3 h-3 text-gray-400" />
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{note.userId?.name || 'Unknown'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(note.createdAt)}</span>
              </span>
            </div>
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <span className="text-xs text-gray-400">Edited</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

NotesList.propTypes = {
  entityType: PropTypes.oneOf(['job', 'resume', 'match']).isRequired,
  entityId: PropTypes.string.isRequired,
  notes: PropTypes.array,
  onNoteChange: PropTypes.func
};

export default NotesList;
