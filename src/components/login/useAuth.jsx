import { useContext } from 'react';
import { AuthContext } from './AuthContext';
// Import the actual context from our AuthContext.jsx file

// This file now ONLY exports the hook.
export const useAuth = () => {
    return useContext(AuthContext);
};