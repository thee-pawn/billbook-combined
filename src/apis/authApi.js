/**
 * Authentication API service
 */
import { apiRequest, authHeader, withCors } from './apiUtils';
import config from '../config';

const authApi = {
  /**
   * Log in a user
   * 
   * @param {Object} credentials - User login credentials with phone and password
   * @returns {Promise} - Login response with token
   */
  login: async (credentials) => {
    return apiRequest(config.apiEndpoints.auth.login, withCors({
      method: 'POST',
      body: JSON.stringify({
        phone: credentials.phone,
        password: credentials.password
      })
    }));
  },
  
  /**
   * Send login OTP
   * 
   * @param {Object} phoneData - Phone data with phoneNumber for OTP
   * @returns {Promise} - OTP send response with userId
   */
  sendLoginOtp: async (phoneData) => {
    return apiRequest(config.apiEndpoints.auth.sendLoginOtp, withCors({
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: phoneData.phoneNumber
      })
    }));
  },

  /**
   * Register a new user
   * 
   * @param {Object} userData - New user registration data with name, phoneNumber, and email
   * @returns {Promise} - Registration response with userId
   */
  register: async (userData) => {
    return apiRequest(config.apiEndpoints.auth.register, withCors({
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        email: userData.email
      })
    }, 'omit'));
  },

  /**
   * Verify OTP code (general purpose)
   * 
   * @param {Object} otpData - userId, phoneNumber and OTP verification data
   * @returns {Promise} - Verification response with token
   */
  verifyOtp: async (otpData) => {
    return apiRequest(config.apiEndpoints.auth.verifyOtp, withCors({
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: otpData.phoneNumber,
        otp: otpData.otp
      })
    }));
  },
  
  /**
   * Verify registration OTP code
   * 
   * @param {Object} otpData - userId, phoneNumber and OTP verification data for registration
   * @returns {Promise} - Verification response with token
   */
  verifyRegistrationOtp: async (otpData) => {
    return apiRequest(config.apiEndpoints.auth.verifyRegistrationOtp, withCors({
      method: 'POST',
      body: JSON.stringify({
        userId: otpData.userId,
        phoneNumber: otpData.phoneNumber,
        otp: otpData.otp
      })
    }));
  },

  /**
   * Resend OTP
   * 
   * @param {Object} resendData - userId, phoneNumber and attempts
   * @returns {Promise} - Response with success status
   */
  resendOtp: async (resendData) => {
    return apiRequest(config.apiEndpoints.auth.resendOtp, withCors({
      method: 'POST',
      body: JSON.stringify({
        userId: resendData.userId,
        phoneNumber: resendData.phoneNumber,
        attempts: resendData.attempts || 1
      })
    }));
  },

  /**
   * Request password reset
   * 
   * @param {Object} phoneData - User's phone number
   * @returns {Promise} - Password reset request response with userId
   */
  forgotPassword: async (phoneData) => {
    return apiRequest(config.apiEndpoints.auth.forgotPassword, withCors({
      method: 'POST',
      body: JSON.stringify({
        phone: phoneData.phone
      })
    }));
  },

  /**
   * Set password (initial setup)
   * 
   * @param {Object} passwordData - Password data including userId and new password
   * @param {string} token - JWT token for authorization
   * @returns {Promise} - Password setup response
   */
  setPassword: async (passwordData, token) => {
    return apiRequest(config.apiEndpoints.auth.setPassword, withCors({
      method: 'POST',
      headers: token ? authHeader(token) : {},
      body: JSON.stringify({
        userId: passwordData.userId,
        password: passwordData.password
      })
    }));
  },

  /**
   * Reset password (after forgot password flow)
   * 
   * @param {Object} resetData - Reset data including userId and new password
   * @param {string} token - JWT token for authorization
   * @returns {Promise} - Password reset response
   */
  resetPassword: async (resetData, token) => {
    return apiRequest(config.apiEndpoints.auth.resetPassword, withCors({
      method: 'POST',
      headers: token ? authHeader(token) : {},
      body: JSON.stringify({
        userId: resetData.userId,
        password: resetData.password
      })
    }));
  },

  /**
   * Enable multi-factor authentication
   * 
   * @param {string} token - JWT token for authorization
   * @param {string} userId - User ID to enable MFA for
   * @returns {Promise} - MFA setup response
   */
  enableMfa: async (token, userId) => {
    return apiRequest(config.apiEndpoints.auth.enableMfa, withCors({
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify({
        userId
      })
    }));
  },

  /**
   * Logout user
   * 
   * @param {string} token - JWT token for authorization
   * @returns {Promise} - Logout response
   */
  logout: async (token) => {
    return apiRequest(config.apiEndpoints.auth.logout, withCors({
      method: 'POST',
      headers: authHeader(token)
    }));
  },

  /**
   * Get user profile
   * 
   * @param {string} token - JWT token for authorization (optional, will get from localStorage if not provided)
   * @returns {Promise} - User profile data with stores
   */
  getUserProfile: async (token) => {
    return apiRequest(config.apiEndpoints.auth.profile, withCors({
      method: 'GET',
      headers: authHeader(token)
    }));
  }
};

export default authApi;
