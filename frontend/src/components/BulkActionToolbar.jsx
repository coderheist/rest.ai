import { X, UserCheck, UserX, FolderPlus, Trash2, Download } from 'lucide-react';

const BulkActionToolbar = ({ selectedCount, onStatusUpdate, onDelete, onClear }) => {
  return (
    <div className="bg-indigo-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <span className="font-semibold">{selectedCount} candidate(s) selected</span>
        <button
          onClick={onClear}
          className="text-white hover:text-indigo-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStatusUpdate('reviewed')}
          className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
        >
          Mark Reviewed
        </button>
        <button
          onClick={() => onStatusUpdate('shortlisted')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          Shortlist
        </button>
        <button
          onClick={() => onStatusUpdate('rejected')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
        >
          <UserX className="w-4 h-4" />
          Reject
        </button>
        <div className="w-px h-8 bg-indigo-400 mx-2"></div>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default BulkActionToolbar;
