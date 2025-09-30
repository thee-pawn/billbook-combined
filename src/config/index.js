/**
 * Application configuration
 * This file centralizes environment variables and configuration
 */

const isDev = import.meta.env.VITE_APP_ENV === 'development';

const config = {
  // In development, use relative URLs to leverage the Vite proxy
  apiBaseUrl: isDev ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'),
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  appName: import.meta.env.VITE_APP_NAME || 'BillBook+',
  apiEndpoints: {
    auth: {
      login: '/api/v1/auth/login',
      register: '/api/v1/auth/register',
      sendLoginOtp: '/api/v1/auth/send-login-otp', // New endpoint for sending login OTP
      verifyOtp: '/api/v1/auth/login/otp/verify',
      verifyRegistrationOtp: '/api/v1/auth/register/otp/verify',  // New endpoint for registration OTP verification
      resendOtp: '/api/v1/auth/resend-otp',
      setPassword: '/api/v1/auth/password-set',
      resetPassword: '/api/v1/auth/reset-password',
      forgotPassword: '/api/v1/auth/forgot-password',
      enableMfa: '/api/v1/auth/enable-mfa',
      logout: '/api/v1/auth/logout',
      profile: '/api/v1/auth/profile',
    },
    customers: {
      list: '/api/v1/customers',
      create: '/api/v1/customers',
      update: '/api/v1/customers/',
      delete: '/api/v1/customers/',
    },
    products: {
      list: '/api/v1/products',
      create: '/api/v1/products',
      update: '/api/v1/products/',
      delete: '/api/v1/products/',
    },
    stores: {
      list: '/api/v1/stores', // Updated to match your new API endpoint
      create: '/api/v1/store/profile',
      getProfile: '/api/v1/store/profile/',
      getUserStores: '/api/v1/store/owner/',
      getById: '/api/v1/stores/',
      update: '/api/v1/store/',
      delete: '/api/v1/store/',
    },
    loyalty: {
      // Using the pattern provided in the cURL: base path expects storeId appended
      pointsConfiguration: '/api/v1/loyalty-points-configuration/',
    },
    // Add other API endpoints as needed
  },
  defaultCountryCode: '+91',
};

export default config;
