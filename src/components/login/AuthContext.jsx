import { createContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../apis';

// Export the context itself so other files (our new hook) can use it.
export const AuthContext = createContext(null);

// The AuthProvider component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const initializationAttempted = useRef(false);

    // Check token expiration on app startup
    useEffect(() => {
        const checkTokenValidity = () => {
            // Prevent multiple initialization attempts
            if (initializationAttempted.current) {
                return;
            }
            
            initializationAttempted.current = true;
            
            const token = localStorage.getItem('token');
            const tokenTimestamp = localStorage.getItem('tokenTimestamp');
            
            if (token && tokenTimestamp) {
                const now = Date.now();
                const tokenAge = now - parseInt(tokenTimestamp);
                const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                
                
                if (tokenAge < twentyFourHours) {
                    // Token is still valid, set authentication state
                    const userData = localStorage.getItem('userData');
                    if (userData) {
                        try {
                            setUser(JSON.parse(userData));
                            setIsAuthenticated(true);
                            
                            // Set up auto-logout timer for remaining time
                            const remainingTime = twentyFourHours - tokenAge;
                            setTimeout(() => {
                                logout();
                            }, remainingTime);
                        } catch (e) {
                            console.error('🔐 AuthContext: Error parsing user data:', e);
                            clearAuthData();
                        }
                    } else {
                        clearAuthData();
                    }
                } else {
                    clearAuthData();
                }
            } else {
            }
            
            setIsLoading(false);
        };

        checkTokenValidity();
    }, []); // Empty dependency array to run only once
    
    // Periodic token validation check (every 5 minutes)
    useEffect(() => {
        if (!isAuthenticated) return;
        
        const checkInterval = setInterval(() => {
            if (!isTokenValid()) {
                logout();
            }
        }, 5 * 60 * 1000); // Check every 5 minutes
        
        return () => clearInterval(checkInterval);
    }, [isAuthenticated]);
    
    // Helper function to clear all auth data
    const clearAuthData = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenTimestamp');
        localStorage.removeItem('userData');
        localStorage.removeItem('currentStoreId');
        setUser(null);
        setIsAuthenticated(false);
    };

    const login = async (phoneOrToken, password = null, userData = null) => {
        setIsLoading(true);
        
        try {
            // If password is provided, it's a regular login with phone/password
            if (password !== null) {
                const response = await authApi.login({ phone: phoneOrToken, password });
                
                if (response && response.success && response.data) {
                    // Store token with timestamp for 24-hour expiration
                    const now = Date.now();
                    const userInfo = response.data.user || { phone: phoneOrToken };
                    
                    localStorage.setItem('token', response.data.authToken);
                    localStorage.setItem('tokenTimestamp', now.toString());
                    localStorage.setItem('userData', JSON.stringify(userInfo));
                    
                    setUser(userInfo);
                    setIsAuthenticated(true);
                    
                    
                    // Set up auto-logout timer for 24 hours
                    setTimeout(() => {
                        logout();
                    }, 24 * 60 * 60 * 1000);
                    
                    // Small delay to ensure context updates are processed
                    setTimeout(() => {
                        navigate('/home');
                    }, 100);
                    
                    return { success: true };
                } else {
                    return { success: false, message: response.message || 'Invalid credentials' };
                }
            } else {
                // If no password, it's already authenticated with token (from OTP verification)
                const authToken = phoneOrToken;
                const now = Date.now();
                const userInfo = userData || {};
                
                localStorage.setItem('token', authToken);
                localStorage.setItem('tokenTimestamp', now.toString());
                localStorage.setItem('userData', JSON.stringify(userInfo));
                
                setUser(userInfo);
                setIsAuthenticated(true);
                
                
                // Set up auto-logout timer for 24 hours
                setTimeout(() => {
                    logout();
                }, 24 * 60 * 60 * 1000);
                
                // Small delay to ensure context updates are processed
                setTimeout(() => {
                    navigate('/home');
                }, 100);
                
                return { success: true };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        clearAuthData();
        navigate('/login');
    };

    // Utility function to check if token is still valid
    const isTokenValid = () => {
        const token = localStorage.getItem('token');
        const tokenTimestamp = localStorage.getItem('tokenTimestamp');
        
        if (!token || !tokenTimestamp) return false;
        
        const now = Date.now();
        const tokenAge = now - parseInt(tokenTimestamp);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        return tokenAge < twentyFourHours;
    };

    const value = {
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        isTokenValid
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. REMOVE the useAuth hook and its export from this file.