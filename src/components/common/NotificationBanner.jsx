import React, { useState, useEffect } from 'react';

const NotificationBanner = ({ message, type = 'success', duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) {
                    setTimeout(() => onClose(), 300); // Wait for fade out animation
                }
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!isVisible) {
        return null;
    }

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'info':
                return 'bg-blue-500';
            default:
                return 'bg-green-500';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '✓';
        }
    };

    return (
        <div 
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${getBackgroundColor()} text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            } max-w-md w-full mx-4`}
            style={{ minWidth: '300px' }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold">{getIcon()}</span>
                    <span className="text-sm font-medium">{message}</span>
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        if (onClose) {
                            setTimeout(() => onClose(), 300);
                        }
                    }}
                    className="text-white hover:text-gray-200 text-lg font-bold leading-none"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default NotificationBanner;