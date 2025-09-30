import React from 'react';
import { XIcon } from './Icons';

/**
 * Modal component for displaying content in a modal dialog
 */
export const Modal = ({ isOpen, onClose, title, children, widthClass = 'max-w-md md:max-w-lg lg:max-w-xl' }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-20 z-50 flex justify-center items-center">
      <div className={`bg-white rounded-lg shadow-xl ${widthClass} w-full border-2`}>
        <div className="flex justify-between items-center px-2 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="w-5 h-5"/>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;