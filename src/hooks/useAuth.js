/**
 * Custom hook for authentication
 */
import { useContext } from 'react';
import { AuthContext } from '../components/login/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};

/**
 * Higher-order component for protecting routes
 */
export const withAuth = (Component) => {
    return function AuthenticatedComponent(props) {
        const { isAuthenticated, isLoading } = useAuth();
        
        if (isLoading) {
            return <div>Loading...</div>;
        }
        
        if (!isAuthenticated) {
            window.location.href = '/login';
            return null;
        }
        
        return <Component {...props} />;
    };
};