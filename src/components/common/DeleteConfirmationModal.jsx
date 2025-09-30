import React from 'react';

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Do you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  danger = true,
  details,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white border border-gray-300 rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {details}
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md border border-gray-300 hover:bg-gray-50">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-white font-medium rounded-md ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
