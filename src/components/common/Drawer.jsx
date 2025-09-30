import {X} from "lucide-react";
import React from "react";

export const Drawer = ({ isOpen, onClose, title, children, width }) => {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0  bg-opacity-20  z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 border-l border-gray-300 h-full w-1/2 bg-white shadow-lg z-300 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ width: width || 'min(800px, 95vw)' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-300">
                    <p className="text-lg font-semibold text-teal-700">{title}</p>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
                    {children}
                </div>
            </div>
        </>
    );
};
