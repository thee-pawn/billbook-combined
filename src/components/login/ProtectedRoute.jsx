import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useStore } from './StoreContext';

const ProtectedRoute = ({ requireStore = false }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const { 
        currentStore, 
        isLoading: isStoreLoading, 
        storeLoadAttempted, 
        storesLoadAttempted,
        userStores 
    } = useStore();

    // Show loading while auth is loading
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
            </div>
        );
    }
    
    // Not authenticated at all - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If store is required, wait for store operations to complete
    if (requireStore) {
        const hasStoredStoreId = localStorage.getItem('currentStoreId');
        
        // Show loading if:
        // 1. Stores haven't been loaded yet, OR
        // 2. There's a stored store ID but we haven't attempted to load it yet, OR
        // 3. Store is currently being loaded
        if (!storesLoadAttempted || 
            (hasStoredStoreId && !storeLoadAttempted) ||
            isStoreLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
                </div>
            );
        }

        // Store operations completed - check if we have a store
        if (!currentStore) {
            return <Navigate to="/select-store" />;
        }
    }
    
    // All checks passed - render children
    return <Outlet />;
};

export default ProtectedRoute;