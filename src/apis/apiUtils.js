/**
 * API utilities for making requests
 */
import config from '../config';

/**
 * Base API fetch function with error handling
 * 
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Fetch options including method, headers, body
 * @returns {Promise} - API response
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    // Handle both relative URLs (for development proxy) and absolute URLs
    const url = endpoint.startsWith('http') ? endpoint : `${config.apiBaseUrl}${endpoint}`;
    
    // Default headers with content type
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Log API calls in development environment
    if (config.appEnv === 'development') {
      console.log('API Request:', {
        url,
        headers, 
        body: options.body ? JSON.parse(options.body) : undefined
      });
    }

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors', // Enable CORS mode for all requests
      credentials: 'same-origin', // Send cookies only to same origin
    });

    // Handle empty responses
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (config.appEnv === 'development') {
      console.log('API Response:', { status: response.status, data });
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Something went wrong',
        data
      };
    }

    return data;
  } catch (error) {
    // Standardize error format for handling in components
    if (error.status) {
      throw error;
    } else {
      throw {
        status: 0,
        message: 'Network error. Please check your internet connection.',
        originalError: error
      };
    }
  }
};

/**
 * Helper to add authorization header with JWT token
 * 
 * @param {string} token - JWT token (optional, will get from localStorage if not provided)
 * @returns {Object} - Headers object with Authorization
 */
export const authHeader = (token) => {
  // Check if token is still valid (24 hour expiration)
  const tokenTimestamp = localStorage.getItem('tokenTimestamp');
  if (tokenTimestamp) {
    const now = Date.now();
    const tokenAge = now - parseInt(tokenTimestamp);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (tokenAge >= twentyFourHours) {
      // Token expired, clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('tokenTimestamp');
      localStorage.removeItem('userData');
      localStorage.removeItem('currentStoreId');
      return {};
    }
  }
  
  // Support both keys: 'token' (existing app) and 'jwt_token' (backend spec)
  const storedToken = localStorage.getItem('token') || localStorage.getItem('jwt_token');
  const authToken = token || storedToken;
  return authToken ? {
    'Authorization': `Bearer ${authToken}`
  } : {};
};

/**
 * Helper to create full request options with CORS and credentials
 * 
 * @param {Object} options - Base request options
 * @param {string} credentialsMode - Credentials mode ('omit', 'same-origin', 'include')
 * @returns {Object} - Options with CORS settings
 */
export const withCors = (options = {}, credentialsMode = 'include') => {
  // Add CORS headers to the existing headers
  const headers = {
    ...options.headers || {},
    'Access-Control-Allow-Origin': config.apiBaseUrl,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
  };

  return {
    ...options,
    mode: 'cors',
    credentials: credentialsMode,
    headers
  };
};
