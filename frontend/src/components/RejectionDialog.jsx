import { useState } from 'react';
import { X, AlertCircle, FolderPlus } from 'lucide-react';

const RejectionDialog = ({ candidate, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [moveToTalentPool, setMoveToTalentPool] = useState(false);
  const [otherReason, setOtherReason] = useState('');

  const rejectionReasons = [
    { value: 'skill_mismatch', label: 'Skill mismatch' },
    { value: 'experience_mismatch', label: 'Experience mismatch' },
    { value: 'not_relevant', label: 'Not relevant now' },
    { value: 'salary_expectations', label: 'Salary expectations too high' },
    { value: 'location_mismatch', label: 'Location mismatch' },
    { value: 'other', label: 'Other' }
  ];

  const handleConfirm = () => {
    const finalReason = reason === 'other' ? otherReason : reason;
    onConfirm(finalReason, moveToTalentPool);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reject Candidate</h2>
              <p className="text-sm text-gray-600">
                {candidate?.personalInfo?.fullName || candidate?.candidateName || 'Unknown'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection (optional)
            </label>
            <div className="space-y-2">
              {rejectionReasons.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {reason === 'other' && (
            <div>
              <textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Please specify the reason..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Talent Pool Option */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={moveToTalentPool}
                onChange={(e) => setMoveToTalentPool(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FolderPlus className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-indigo-900">Move to Talent Pool</span>
                </div>
                <p className="text-sm text-indigo-700">
                  Keep this candidate for future opportunities. They might be a good fit for other roles.
                </p>
              </div>
            </label>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This action can be reversed from the candidate's profile page.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Reject & Move On
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionDialog;
