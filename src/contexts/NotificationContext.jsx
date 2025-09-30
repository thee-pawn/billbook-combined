import React, { createContext, useContext, useState } from 'react';
import NotificationBanner from '../components/common/NotificationBanner';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = (message, type = 'success', duration = 5000) => {
        const id = Date.now() + Math.random();
        const newNotification = { id, message, type, duration };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // Auto remove after duration
        setTimeout(() => {
            removeNotification(id);
        }, duration + 300); // Add 300ms for fade out animation
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const showSuccess = (message, duration = 5000) => showNotification(message, 'success', duration);
    const showError = (message, duration = 5000) => showNotification(message, 'error', duration);
    const showWarning = (message, duration = 5000) => showNotification(message, 'warning', duration);
    const showInfo = (message, duration = 5000) => showNotification(message, 'info', duration);

    return (
        <NotificationContext.Provider value={{
            showNotification,
            showSuccess,
            showError,
            showWarning,
            showInfo,
            removeNotification
        }}>
            {children}
            
            {/* Render notifications */}
            <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
                {notifications.map((notification, index) => (
                    <div
                        key={notification.id}
                        style={{ top: `${16 + index * 70}px` }}
                        className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto"
                    >
                        <NotificationBanner
                            message={notification.message}
                            type={notification.type}
                            duration={0} // We handle duration in the provider
                            onClose={() => removeNotification(notification.id)}
                        />
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export default NotificationContext;