// Base URL for the API - uses environment variable or falls back to default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_VERSION = '/api/v1';

// For development, use proxy path to avoid CORS issues
const FULL_API_URL = import.meta.env.DEV ? API_VERSION : `${API_BASE_URL}${API_VERSION}`;

/**
 * Authentication API functions
 */
export const authApi = {
    /**
     * Login with phone and password
     * @param {object} credentials - The login credentials (phone, password)
     * @returns {Promise} - A promise that resolves to the auth response
     */
    login: async (credentials) => {
        try {
            // For mocking during development
            
            // Real API call
            const response = await fetch(`${FULL_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            if (!response.ok) {
                throw new Error(`Login failed with status ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    /**
     * Register a new user
     * @param {object} userData - The user registration data
     * @returns {Promise} - A promise that resolves to the registration response
     */
    register: async (userData) => {
        try {
            // For mocking during development
            if (process.env.NODE_ENV === 'development') {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return {
                    userId: "new-user-123",
                    message: "Registration successful. OTP sent to your phone."
                };
            }
            
            // Real API call
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error(`Registration failed with status ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    
    /**
     * Verify OTP
     * @param {object} otpData - The OTP data (userId, otp)
     * @returns {Promise} - A promise that resolves to the verification response
     */
    verifyOtp: async (otpData) => {
        try {
            // For mocking during development
            if (process.env.NODE_ENV === 'development') {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Invalid OTP
                if (otpData.otp === "0000") {
                    throw new Error("Invalid OTP");
                }
                
                return {
                    token: "mock-auth-token-verified",
                    message: "OTP verified successfully"
                };
            }
            
            // Real API call
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(otpData)
            });
            
            if (!response.ok) {
                throw new Error(`OTP verification failed with status ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    },
    
    /**
     * Send forgot password request
     * @param {object} phoneData - The phone data (phone)
     * @returns {Promise} - A promise that resolves to the forgot password response
     */
    forgotPassword: async (phoneData) => {
        try {
            // For mocking during development
            if (process.env.NODE_ENV === 'development') {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return {
                    userId: "user123",
                    message: "Password reset OTP sent to your phone"
                };
            }
            
            // Real API call
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(phoneData)
            });
            
            if (!response.ok) {
                throw new Error(`Forgot password request failed with status ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },
    
    /**
     * Set or reset password
     * @param {object} passwordData - The password data (userId, password)
     * @param {string} token - The auth token
     * @param {boolean} isReset - Whether this is a password reset
     * @returns {Promise} - A promise that resolves to the password set/reset response
     */
    setPassword: async (passwordData, token, isReset = false) => {
        try {
            // For mocking during development
            if (process.env.NODE_ENV === 'development') {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return {
                    token: isReset ? null : "mock-auth-token-new-password",
                    message: isReset ? "Password reset successfully" : "Password set successfully"
                };
            }
            
            // Real API call
            const endpoint = isReset ? 'reset-password' : 'set-password';
            const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordData)
            });
            
            if (!response.ok) {
                throw new Error(`Password ${isReset ? 'reset' : 'set'} failed with status ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Password ${isReset ? 'reset' : 'set'} error:`, error);
            throw error;
        }
    },
    
    /**
     * Get user profile
     * @param {string} token - The auth token
     * @returns {Promise} - A promise that resolves to the user profile data
     */
    getUserProfile: async (token) => {
        try {
            // For mocking during development
            if (process.env.NODE_ENV === 'development') {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return {
                    id: "user123",
                    name: "John Doe",
                    phone: "+911234567890",
                    email: "john.doe@example.com",
                    role: "owner", // or "staff"
                    createdAt: "2023-01-01T00:00:00Z"
                };
            }
            
            // Real API call
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to get user profile with status ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
        }
    }
};

/**
 * Helper function to handle HTTP requests with authentication
 * @param {string} url - The URL to fetch
 * @param {string} method - The HTTP method
 * @param {object} body - The request body (for POST, PUT, etc.)
 * @returns {Promise} - A promise that resolves to the response data
 */
const fetchWithAuth = async (url, method = 'GET', body = null) => {
    try {
        // Get the auth token from localStorage (support both keys)
        const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
        
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Only set Content-Type for JSON data, not for FormData
        if (body && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const options = {
            method,
            headers
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            if (body instanceof FormData) {
                // For FormData, set body directly (browser will set correct Content-Type)
                options.body = body;
            } else {
                // For regular objects, stringify
                options.body = JSON.stringify(body);
            }
        }


        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', { status: response.status, statusText: response.statusText, body: errorText });
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}. ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        
        // Check if it's a network error
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error: Unable to connect to the server. Please check if the backend server is running on http://localhost:3000');
        }
        
        throw error;
    }
};

/**
 * Get store profile details
 * @param {string} storeId - The ID of the store
 * @returns {Promise} - A promise that resolves to the store profile data
 */
export const getStoreProfile = async (storeId) => {
    try {
        const url = `${FULL_API_URL}/stores/${storeId}`;
        const response = await fetchWithAuth(url);
        
        // Extract store data from the response
        if (response.success && response.data && response.data.store) {
            const store = response.data.store;
            
            // Map API response to the format expected by the component
            return {
                businessName: store.name || '',
                mobileNo: store.mobile_no || '',
                email: store.contact_email_id || '',
                reviewLink: '', // Not in API response
                gstNumber: store.gst_number || '',
                tax: store.tax_billing || 'Excluding',
                whatsappNo: store.whatsapp_no || '',
                reportingEmail: store.reporting_email_id || '',
                businessCategory: store.business_category || '',
                address: [
                    store.address_line_1,
                    store.locality,
                    store.city,
                    store.state,
                    store.pincode,
                    store.country
                ].filter(Boolean).join(', '),
                facebook: store.facebook_link || '',
                instagram: store.instagram_link || '',
                googleMaps: store.google_maps_link || '',
                addressDetails: {
                    addressLine1: store.address_line_1 || '',
                    locality: store.locality || '',
                    city: store.city || '',
                    state: store.state || '',
                    pincode: store.pincode || '',
                    country: store.country || '',
                    latitude: store.latitude ? store.latitude.toString() : '',
                    longitude: store.longitude ? store.longitude.toString() : ''
                },
                logo_url: store.logo_url || null
            };
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Failed to fetch store profile:', error);
        
        // Provide a more helpful error message for development
        if (error.message.includes('Network error')) {
            throw new Error('Backend server is not running. Please start the backend server on http://localhost:3000 or check your network connection.');
        }
        
        throw error;
    }
};

/**
 * Update store profile details
 * @param {string} storeId - The ID of the store
 * @param {object} profileData - The updated profile data
 * @returns {Promise} - A promise that resolves to the updated store profile data
 */
export const updateStoreProfile = async (storeId, profileData) => {
    try {
        const url = `${FULL_API_URL}/stores/${storeId}`;
        
        // Map component data to API format
        const apiData = {
            name: profileData.businessName,
            mobile_no: profileData.mobileNo,
            whatsapp_no: profileData.whatsappNo,
            contact_email_id: profileData.email,
            reporting_email_id: profileData.reportingEmail,
            gst_number: profileData.gstNumber,
            tax_billing: profileData.tax,
            business_category: profileData.businessCategory,
            instagram_link: profileData.instagram,
            facebook_link: profileData.facebook,
            google_maps_link: profileData.googleMaps,
            address_line_1: profileData.addressDetails?.addressLine1 || '',
            locality: profileData.addressDetails?.locality || '',
            city: profileData.addressDetails?.city || '',
            state: profileData.addressDetails?.state || '',
            country: profileData.addressDetails?.country || '',
            pincode: profileData.addressDetails?.pincode || '',
            latitude: profileData.addressDetails?.latitude ? parseFloat(profileData.addressDetails.latitude) : null,
            longitude: profileData.addressDetails?.longitude ? parseFloat(profileData.addressDetails.longitude) : null
        };

        const response = await fetchWithAuth(url, 'PUT', apiData);
        
        // Return the updated data in the same format as getStoreProfile
        if (response.success && response.data && response.data.store) {
            const store = response.data.store;
            
            return {
                businessName: store.name || '',
                mobileNo: store.mobile_no || '',
                email: store.contact_email_id || '',
                reviewLink: '',
                gstNumber: store.gst_number || '',
                tax: store.tax_billing || 'Excluding',
                whatsappNo: store.whatsapp_no || '',
                reportingEmail: store.reporting_email_id || '',
                businessCategory: store.business_category || '',
                address: [
                    store.address_line_1,
                    store.locality,
                    store.city,
                    store.state,
                    store.pincode,
                    store.country
                ].filter(Boolean).join(', '),
                facebook: store.facebook_link || '',
                instagram: store.instagram_link || '',
                googleMaps: store.google_maps_link || '',
                addressDetails: {
                    addressLine1: store.address_line_1 || '',
                    locality: store.locality || '',
                    city: store.city || '',
                    state: store.state || '',
                    pincode: store.pincode || '',
                    country: store.country || '',
                    latitude: store.latitude ? store.latitude.toString() : '',
                    longitude: store.longitude ? store.longitude.toString() : ''
                },
                logo: store.logo || null
            };
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Failed to update store profile:', error);
        throw error;
    }
};

/**
 * Get store shifts/schedule
 * @param {string} storeId - The ID of the store
 * @returns {Promise} - A promise that resolves to the shifts data
 */
export const getStoreShifts = async (storeId) => {
    try {
        const url = `${FULL_API_URL}/stores/${storeId}/shifts`;
        const response = await fetchWithAuth(url);
        
        // Extract shifts data from the response
        if (response.success && response.data && response.data.shifts) {
            const shifts = response.data.shifts;
            
            // Transform API response to match component format
            const weeklyHours = shifts.map(shift => ({
                day: shift.day.charAt(0).toUpperCase() + shift.day.slice(1), // Capitalize first letter
                isOpen: !shift.is_closed, // Convert is_closed to isOpen
                is24Hours: shift.is_24_hrs_open || false,
                slots: shift.is_closed || shift.is_24_hrs_open ? [] : [{
                    start: shift.opening_time || '09:00',
                    end: shift.closing_time || '18:00'
                }],
                shiftId: shift.id // Store the shift ID for updates
            }));
            
            return {
                weeklyHours,
                storeId: response.data.store_id
            };
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Failed to fetch store shifts:', error);
        throw error;
    }
};

/**
 * Update store shifts/schedule
 * @param {string} storeId - The ID of the store
 * @param {Array} weeklyHours - The schedule data to update
 * @returns {Promise} - A promise that resolves to the update response
 */
export const updateStoreShifts = async (storeId, weeklyHours) => {
    try {
        const url = `${FULL_API_URL}/stores/${storeId}/shifts`;
        
        // Transform component format to API format
        const shiftsData = weeklyHours.map(day => ({
            id: day.shiftId, // Include the shift ID
            day: day.day.toLowerCase(),
            is_closed: !day.isOpen, // Convert isOpen to is_closed
            is_24_hrs_open: day.is24Hours,
            opening_time: !day.isOpen || day.is24Hours ? null : (day.slots[0]?.start || '09:00'),
            closing_time: !day.isOpen || day.is24Hours ? null : (day.slots[0]?.end || '18:00')
        }));
        
        
        const response = await fetchWithAuth(url, 'PUT', { shifts: shiftsData });
        
        if (response.success) {
            return response;
        }
        
        throw new Error('Failed to update shifts');
    } catch (error) {
        console.error('Failed to update store shifts:', error);
        throw error;
    }
};

/**
 * Get store special shifts/overrides
 * @param {string} storeId - The ID of the store
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Number of items per page (default: 20)
 * @returns {Promise} - A promise that resolves to the special shifts data
 */
export const getStoreSpecialShifts = async (storeId, page = 1, limit = 20) => {
    try {
        const url = `${FULL_API_URL}/stores/${storeId}/special-shifts?page=${page}&limit=${limit}`;
        const response = await fetchWithAuth(url);
        
        // Extract special shifts data from the response
        if (response.success && response.data && response.data.special_shifts) {
            const specialShifts = response.data.special_shifts;
            
            // Transform API response to match component format
            const overrides = specialShifts.map(shift => ({
                id: shift.id,
                apiId: shift.id, // Keep the original API ID for updates
                date: shift.date.split('T')[0], // Extract date part only (YYYY-MM-DD)
                description: shift.name,
                isOpen: !shift.is_closed,
                is24Hours: shift.is_24_hours_open || false,
                slots: shift.is_closed || shift.is_24_hours_open ? [] : [{
                    start: shift.opening_time || '09:00',
                    end: shift.closing_time || '18:00'
                }]
            }));
            
            return {
                overrides,
                storeId: response.data.store_id,
                pagination: response.data.pagination
            };
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Failed to fetch store special shifts:', error);
        throw error;
    }
};

/**
 * Update a specific special shift/override
 * @param {string} storeId - The ID of the store
 * @param {string} specialShiftId - The ID of the special shift to update
 * @param {Object} overrideData - The override data to update
 * @returns {Promise} - A promise that resolves to the update response
 */
export const updateStoreSpecialShift = async (storeId, specialShiftId, overrideData) => {
    try {
        const url = `${FULL_API_URL}/stores/${storeId}/special-shifts/${specialShiftId}`;
        
        // Transform component format to API format
        const payload = {
            name: overrideData.description,
            is_closed: !overrideData.isOpen,
            opening_time: !overrideData.isOpen || overrideData.is24Hours ? null : (overrideData.slots[0]?.start || null),
            closing_time: !overrideData.isOpen || overrideData.is24Hours ? null : (overrideData.slots[0]?.end || null)
        };

        // Only include is_24_hours_open if the store is open
        if (overrideData.isOpen) {
            payload.is_24_hours_open = overrideData.is24Hours;
        }
        
        
        const response = await fetchWithAuth(url, 'PUT', payload);
        
        if (response.success) {
            return response;
        }
        
        throw new Error('Failed to update special shift');
    } catch (error) {
        console.error('Failed to update store special shift:', error);
        throw error;
    }
};

/**
 * Delete a specific special shift/override
 * @param {string} storeId - The ID of the store
 * @param {string} specialShiftId - The ID of the special shift to delete
 * @returns {Promise} - A promise that resolves to the delete response
 */
export const deleteStoreSpecialShift = async (storeId, specialShiftId) => {
    try {
        const url = `${FULL_API_URL}/stores/${storeId}/special-shifts/${specialShiftId}`;
        
        const response = await fetchWithAuth(url, 'DELETE');
        
        if (response.success) {
            return response;
        }
        
        throw new Error('Failed to delete special shift');
    } catch (error) {
        console.error('Failed to delete store special shift:', error);
        throw error;
    }
};

/**
 * Create a new special shift/override
 * @param {string} storeId - The ID of the store
 * @param {Object} overrideData - The override data to create
 * @returns {Promise} - A promise that resolves to the created special shift
 */
export const createStoreSpecialShift = async (storeId, overrideData) => {
    try {
        const url = `${FULL_API_URL}/stores/${storeId}/special-shifts`;
        
        // Transform component format to API format
        const payload = {
            date: overrideData.date,
            name: overrideData.description,
            is_closed: !overrideData.isOpen,
            opening_time: !overrideData.isOpen || overrideData.is24Hours ? null : (overrideData.slots[0]?.start || null),
            closing_time: !overrideData.isOpen || overrideData.is24Hours ? null : (overrideData.slots[0]?.end || null)
        };

        // Only include is_24_hours_open if the store is open
        if (overrideData.isOpen) {
            payload.is_24_hours_open = overrideData.is24Hours;
        }
        
        
        const response = await fetchWithAuth(url, 'POST', payload);
        
        if (response.success && response.data) {
            // Transform API response back to component format
            const createdShift = response.data;
            return {
                id: createdShift.id,
                apiId: createdShift.id,
                date: createdShift.date.split('T')[0],
                description: createdShift.name,
                isOpen: !createdShift.is_closed,
                is24Hours: createdShift.is_24_hours_open || false,
                slots: createdShift.is_closed || createdShift.is_24_hours_open ? [] : [{
                    start: createdShift.opening_time || '09:00',
                    end: createdShift.closing_time || '18:00'
                }]
            };
        }
        
        throw new Error('Failed to create special shift');
    } catch (error) {
        console.error('Failed to create store special shift:', error);
        throw error;
    }
};

/**
 * Get receipt/invoice settings for a store
 * @param {string} storeId - The ID of the store
 * @returns {Promise} - A promise that resolves to the receipt settings
 */
export const getReceiptSettings = async (storeId) => {
    try {
        const url = `${FULL_API_URL}/stores/${storeId}/receipt-settings`;
        
        const response = await fetchWithAuth(url);
        
        if (response.success && response.data && response.data.receipt_settings) {
            return {
                success: true,
                data: response.data.receipt_settings
            };
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Failed to fetch receipt settings:', error);
        throw error;
    }
};

/**
 * Upload a logo file for a store and return the file URL
 * @param {string} storeId - The ID of the store
 * @param {File} file - The logo file to upload
 * @param {string} token - The auth token
 * @returns {Promise<string>} - The URL of the uploaded logo
 */
export const uploadStoreLogo = async (storeId, file) => {
    const url = `${FULL_API_URL}/stores/${storeId}/logo`;
    const formData = new FormData();
    formData.append('logo', file);

    try {
        const response = await fetchWithAuth(url, 'POST', formData);
        return response; // Assuming the response contains success status
    } catch (error) {
        console.error('Failed to upload logo:', error);
        throw error;
    }
};

/**
 * Get store logo
 * @param {string} storeId - The ID of the store
 * @returns {Promise<Blob>} - The logo image blob
 */
export const getStoreLogo = async (storeId) => {
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
        
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const url = `${FULL_API_URL}/stores/${storeId}/logo?ts=${Date.now()}`;

        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            if (response.status === 404) {
                // No logo found - this is expected for stores without logos
                return null;
            }
            const errorText = await response.text();
            console.error('Logo fetch error:', { status: response.status, statusText: response.statusText, body: errorText });
            throw new Error(`Failed to fetch logo: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Failed to fetch store logo:', error);
        // Return null instead of throwing to allow graceful handling
        return null;
    }
};

/**
 * Expenses API functions
 */
export const expensesApi = {
    /**
     * Get all expenses for a store
     * @param {string} storeId - The ID of the store
     * @param {number} page - Page number for pagination (default: 1)
     * @param {number} limit - Number of items per page (default: 10)
     * @param {string} status - Filter by status (optional)
     * @param {string} sortBy - Field to sort by (default: 'date')
     * @param {string} sortOrder - Sort order 'asc' or 'desc' (default: 'desc')
     * @returns {Promise} - A promise that resolves to the expenses data
     */
    getExpenses: async (storeId, page = 1, limit = 10, status = null, sortBy = 'date', sortOrder = 'desc') => {
        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy,
                sortOrder
            });
            
            if (status) {
                params.append('status', status);
            }
            
            // Real API call using the correct endpoint format
            const url = `${FULL_API_URL}/expenses/${storeId}?${params.toString()}`;
            const response = await fetchWithAuth(url);
            return response;
        } catch (error) {
            console.error('Error fetching expenses:', error);
            throw error;
        }
    },

    /**
     * Upload receipt file
     * @param {string} storeId - The ID of the store
     * @param {File} file - The file to upload
     * @returns {Promise} - A promise that resolves to the upload response
     */
    uploadReceipt: async (storeId, file) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const formData = new FormData();
            formData.append('file', file);

            // Use the correct path format for expense receipts
            const path = encodeURIComponent(`${storeId}/expense_receipts`);
            const url = `${FULL_API_URL}/upload/single?path=${path}`;
            
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Note: Don't set Content-Type for FormData, let the browser set it
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload Error Response:', { status: response.status, statusText: response.statusText, body: errorText });
                throw new Error(`File upload failed with status ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading receipt:', error);
            throw error;
        }
    },

    /**
     * Create a new expense
     * @param {string} storeId - The ID of the store
     * @param {object} expenseData - The expense data
     * @param {File} receiptFile - Optional receipt file to upload
     * @returns {Promise} - A promise that resolves to the created expense
     */
    createExpense: async (storeId, expenseData, receiptFile = null) => {
        try {
            let receiptId = null;
            
            // If there's a receipt file, upload it first
            if (receiptFile) {
                const uploadResponse = await expensesApi.uploadReceipt(storeId, receiptFile);
                if (uploadResponse.success) {
                    receiptId = uploadResponse.data.filename;
                }
            }

            // Prepare the expense data in the format expected by the API
            const apiData = {
                expenseName: expenseData.expenseName || expenseData.title,
                date: expenseData.date,
                employee_id: expenseData.employeeId || expenseData.employee_id,
                category: expenseData.category,
                amount: parseFloat(expenseData.amount),
                paymentMethod: expenseData.paymentMethod,
                description: expenseData.description || '',
                receipt_id: receiptId || expenseData.receipt_id || null
            };

            // Real API call
            const url = `${FULL_API_URL}/expenses/${storeId}`;
            const response = await fetchWithAuth(url, 'POST', apiData);
            return response;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    },    /**
     * Update an expense
     * @param {string} storeId - The ID of the store
     * @param {string} expenseId - The ID of the expense
     * @param {object} expenseData - The updated expense data
     * @param {File} receiptFile - Optional receipt file to upload
     * @returns {Promise} - A promise that resolves to the updated expense
     */
    updateExpense: async (storeId, expenseId, expenseData, receiptFile = null) => {
        try {
            let receiptId = expenseData.receipt_id || null;
            
            // If there's a new receipt file, upload it first
            if (receiptFile) {
                const uploadResponse = await expensesApi.uploadReceipt(storeId, receiptFile);
                if (uploadResponse.success) {
                    receiptId = uploadResponse.data.filename;
                }
            }

            // Prepare the expense data in the format expected by the API
            const apiData = {
                expenseName: expenseData.expenseName || expenseData.title,
                date: expenseData.date,
                employee_id: expenseData.employeeId || expenseData.employee_id,
                category: expenseData.category,
                amount: parseFloat(expenseData.amount),
                paymentMethod: expenseData.paymentMethod,
                description: expenseData.description || '',
                receipt_id: receiptId
            };

            // Real API call
            const url = `${FULL_API_URL}/expenses/${storeId}/${expenseId}`;
            const response = await fetchWithAuth(url, 'PUT', apiData);
            return response;
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },
    
    /**
     * Delete an expense
     * @param {string} storeId - The ID of the store
     * @param {string} expenseId - The ID of the expense
     * @returns {Promise} - A promise that resolves to the deletion response
     */
    deleteExpense: async (storeId, expenseId) => {
        try {
            // Real API call
            const url = `${FULL_API_URL}/expenses/${storeId}/${expenseId}`;
            const response = await fetchWithAuth(url, 'DELETE');
            return response;
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    },

    /**
     * Get receipt file
     * @param {string} receiptId - The ID of the receipt file
     * @returns {Promise} - A promise that resolves to the receipt file blob
     */
    getReceiptFile: async (receiptId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const url = `${FULL_API_URL}/upload/file/${receiptId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch receipt file with status ${response.status}`);
            }

            return response.blob();
        } catch (error) {
            console.error('Error fetching receipt file:', error);
            throw error;
        }
    },

    /**
     * Approve an expense
     * @param {string} storeId - The ID of the store
     * @param {string} expenseId - The ID of the expense
     * @param {string} comments - Optional comments for approval
     * @returns {Promise} - A promise that resolves to the approval response
     */
    approveExpense: async (storeId, expenseId, comments = "Expense approved for processing") => {
        try {
            const url = `${FULL_API_URL}/expenses/${storeId}/${expenseId}/approval`;
            
            const requestBody = {
                status: "approved",
                comments: comments
            };
            
            const response = await fetchWithAuth(url, 'PATCH', requestBody);
            return response;
        } catch (error) {
            console.error('Error approving expense:', error);
            throw error;
        }
    },

    /**
     * Reject an expense
     * @param {string} storeId - The ID of the store
     * @param {string} expenseId - The ID of the expense
     * @param {string} comments - Optional comments for rejection
     * @returns {Promise} - A promise that resolves to the rejection response
     */
    rejectExpense: async (storeId, expenseId, comments = "Expense rejected") => {
        try {
            const url = `${FULL_API_URL}/expenses/${storeId}/${expenseId}/approval`;
            
            const requestBody = {
                status: "rejected",
                comments: comments
            };
            
            const response = await fetchWithAuth(url, 'PATCH', requestBody);
            return response;
        } catch (error) {
            console.error('Error rejecting expense:', error);
            throw error;
        }
    }
};

/**
 * Staff API
 */
export const staffApi = {
    /**
     * Get all staff members for a store
     * @param {string} storeId - The ID of the store
     * @param {number} page - Page number (default: 1)
     * @param {number} limit - Items per page (default: 50)
     * @param {string} status - Staff status filter (default: 'active')
     * @returns {Promise} - A promise that resolves to the staff list
     */
    getStaff: async (storeId, page = 1, limit = 50, status = 'active') => {
        try {
            // API contract given: GET /api/v1/staff/{store_id}
            const baseUrl = `${FULL_API_URL}/staff/${storeId}`;
            const url = `${baseUrl}?page=${page}&limit=${limit}&status=${status}`;
            const response = await fetchWithAuth(url, 'GET');
            // New backend response shape example: { staff: [ { staffId, storeId, personal: {...}, role: {...}, salary: {...}, commission: {...}, bank: {...}, status } ], pagination: {...} }
            if (response && Array.isArray(response.staff)) {
                const mapped = response.staff.map(s => {
                    const personal = s.personal || {};
                    const role = s.role || {};
                    return {
                        id: s.staffId || s.id,
                        staffId: s.staffId || s.id,
                        storeId: s.storeId,
                        name: personal.name || '',
                        email: personal.email || '',
                        contact: personal.phone || '',
                        gender: personal.gender || '',
                        designation: role.designation || '',
                        roleType: role.role || '',
                        services: role.services || [],
                        shifts: role.shifts || [],
                        salary: s.salary || null,
                        commission: s.commission || null,
                        bank: s.bank || null,
                        status: s.status || 'active',
                        dateOfJoining: (personal.dateOfJoining || personal.date_of_joining || null),
                        dateOfBirth: personal.dateOfBirth || personal.date_of_birth || null,
                        documentName: personal.documentName || null, // Use documentName instead of documentId
                        raw: s // keep raw for future reference
                    };
                });
                return { success: true, data: mapped, pagination: response.pagination || null };
            }
            return { success: false, data: [], pagination: null };
        } catch (error) {
            console.error('Error fetching staff:', error);
            throw error;
        }
    },

    /**
     * Upload staff document file to S3
     * @param {string} storeId - The ID of the store
     * @param {File} file - The document file to upload
     * @returns {Promise} - A promise that resolves to the upload response
     */
    uploadStaffDocument: async (storeId, file) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const formData = new FormData();
            formData.append('file', file);

            // Use the path format similar to expenses: storeId/staff_documents
            const path = encodeURIComponent(`${storeId}/staff_documents`);
            const url = `${FULL_API_URL}/upload/single?path=${path}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Note: Don't set Content-Type for FormData, let the browser set it
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload Error Response:', { status: response.status, statusText: response.statusText, body: errorText });
                throw new Error(`File upload failed with status ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading staff document:', error);
            throw error;
        }
    },

    /**
     * Get staff document file from S3
     * @param {string} documentId - The document ID/filename
     * @returns {Promise<Blob>} - A promise that resolves to the document file blob
     */
    getStaffDocument: async (documentId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const url = `${FULL_API_URL}/upload/file/${documentId}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch document: ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.error('Error fetching staff document:', error);
            throw error;
        }
    },

    /**
     * Create staff member
     */
    createStaff: async (storeId, staffPayload, documentFile = null) => {
        try {
            let documentName = null;

            // If document file is provided, upload it first
            if (documentFile) {
                const uploadResponse = await staffApi.uploadStaffDocument(storeId, documentFile);
                if (uploadResponse.success) {
                    documentName = uploadResponse.data.filename;
                }
            }

            // Add document name to payload
            const finalPayload = {
                ...staffPayload,
                personal: {
                    ...staffPayload.personal,
                    documentName: documentName
                }
            };

            const url = `${FULL_API_URL}/staff/${storeId}`;
            const response = await fetchWithAuth(url, 'POST', finalPayload);

            return response;
        } catch (error) {
            console.error('Error creating staff:', error);
            throw error;
        }
    },

    /**
     * Update staff member
     */
    updateStaff: async (storeId, staffId, staffPayload, documentFile = null) => {
        try {
            let documentName = staffPayload.personal?.documentName || null;

            // If there's a new document file, upload it first
            if (documentFile) {
                const uploadResponse = await staffApi.uploadStaffDocument(storeId, documentFile);
                if (uploadResponse.success) {
                    documentName = uploadResponse.data.filename;
                }
            }

            // Update the payload with the document name
            const updatedPayload = {
                ...staffPayload,
                personal: {
                    ...staffPayload.personal,
                    documentName: documentName
                }
            };

            const url = `${FULL_API_URL}/staff/${storeId}/${staffId}`;
            const response = await fetchWithAuth(url, 'PUT', updatedPayload);
            return response;
        } catch (error) {
            console.error('Error updating staff:', error);
            throw error;
        }
    },

    /**
     * Get staff members who can perform a specific service
     * @param {string} storeId - The ID of the store
     * @param {string} serviceId - The ID of the service
     * @returns {Promise} - A promise that resolves to the staff list for the service
     */
    getByService: async (storeId, serviceId) => {
        try {
            if (!storeId || !serviceId) {
                return { success: false, data: [] };
            }

            // Use the correct API endpoint: GET /api/v1/staff/{storeId}/by-service/{serviceId}
            const url = `${FULL_API_URL}/staff/${storeId}/by-service/${serviceId}`;
            const response = await fetchWithAuth(url, 'GET');

            // Handle the expected response structure: { "staff": [{ "staffId": "...", "name": "..." }] }
            if (response && Array.isArray(response.staff)) {
                // Map the response to the format expected by the AppointmentForm component
                const mappedStaff = response.staff.map(staff => ({
                    id: staff.staffId,
                    name: staff.name
                }));

                return {
                    success: true,
                    data: mappedStaff
                };
            }

            // If no staff found or invalid response, return empty array
            return { success: true, data: [] };
        } catch (error) {
            console.error('Error fetching staff by service:', error);
            return { success: false, data: [] };
        }
    },
};

// Customers API
export const customersApi = {
    /**
     * Fetch customers list for a store
     * @param {string} storeId
     * @param {number} page
     * @param {number} limit
     */
    getCustomers: async (storeId, page = 1, limit = 50) => {
        try {
            const url = `${FULL_API_URL}/customers/${storeId}?page=${page}&limit=${limit}`;
            const response = await fetchWithAuth(url, 'GET');
            if (response?.data?.customers) {
                const mapped = response.data.customers.map(c => ({
                    id: c.id,
                    name: c.name || '',
                    number: c.phoneNumber || c.phone || '',
                    gender: c.gender ? c.gender.charAt(0).toUpperCase() + c.gender.slice(1) : '',
                    loyaltyPoints: c.loyaltyPoints ?? 0,
                    walletBalance: c.walletBalance ?? 0,
                    dues: c.dues ?? 0,
                    membership: (c.memberships && c.memberships[0]?.name) || '',
                    lastVisit: c.lastVisit || null,
                    anniversary: c.anniversary || '',
                    birthday: c.birthday || '',
                    address: c.address || '',
                    raw: c
                }));
                return { success: true, data: mapped, pagination: response.data.pagination };
            }
            return { success: false, data: [] };
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    },
    /**
     * Create a customer
     * @param {string} storeId
     * @param {object} payload { phoneNumber, name, gender, birthday, anniversary, address }
     */
    createCustomer: async (storeId, payload) => {
        try {
            const url = `${FULL_API_URL}/customers/${storeId}`;
            const response = await fetchWithAuth(url, 'POST', payload);
            return response;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    },
    /**
     * Update a customer
     * @param {string} storeId
     * @param {string} customerId
     * @param {object} payload { name, gender, birthday, anniversary, address }
     */
    updateCustomer: async (storeId, customerId, payload) => {
        try {
            const url = `${FULL_API_URL}/customers/${storeId}/${customerId}`;
            const response = await fetchWithAuth(url, 'PUT', payload);
            return response;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    },
    /**
     * Fetch a single customer by full phone number (with country code, e.g. +919876543210)
     * Endpoint: GET /customers/{storeId}/by-phone/{phoneNumber}
     */
    getByPhone: async (storeId, phoneNumber) => {
        if (!storeId || !phoneNumber) return { success: false, customer: null };
        try {
            const url = `${FULL_API_URL}/customers/${storeId}/by-phone/${encodeURIComponent(phoneNumber)}`;
            const response = await fetchWithAuth(url, 'GET');
            const cust = response?.data?.customer;
            if (cust) {
                // Return both a convenient, flattened customer object and the original payload via data
                return {
                    success: true,
                    data: response?.data, // preserve original shape for callers that expect res.data.customer
                    customer: {
                        id: cust.id,
                        name: cust.name || '',
                        phoneNumber: cust.phoneNumber || cust.phone || phoneNumber,
                        gender: cust.gender || '',
                        anniversary: cust.anniversary || '',
                        birthday: cust.birthday || '',
                        address: cust.address || '',
                        loyaltyPoints: cust.loyaltyPoints ?? 0,
                        walletBalance: cust.walletBalance ?? 0,
                        dues: cust.dues ?? 0,
                        advanceAmount: cust.advanceAmount ?? 0,
                        lastVisit: cust.lastVisit || '',
                        referralCode: cust.referralCode || '',
                        memberships: Array.isArray(cust.memberships) ? cust.memberships : [],
                        servicePackages: Array.isArray(cust.servicePackages) ? cust.servicePackages : [],
                        raw: cust
                    }
                };
            }
            return { success: false, customer: null };
        } catch (error) {
            console.error('Error fetching customer by phone:', error);
            return { success: false, customer: null, error };
        }
    },
    /**
     * Customer Notes APIs
     */
    listNotes: async (storeId, customerId) => {
        if (!storeId || !customerId) return { success: false, notes: [] };
        try {
            const url = `${FULL_API_URL}/customers/${storeId}/${customerId}/notes`;
            const resp = await fetchWithAuth(url, 'GET');
            const notes = resp?.data?.notes || [];
            return { success: !!resp?.success, notes };
        } catch (error) {
            console.error('Error listing customer notes:', error);
            return { success: false, notes: [], error };
        }
    },
    addNote: async (storeId, customerId, payload) => {
        if (!storeId || !customerId || !payload?.note) throw new Error('Missing fields for add note');
        try {
            const url = `${FULL_API_URL}/customers/${storeId}/${customerId}/notes`;
            const resp = await fetchWithAuth(url, 'POST', { note: payload.note, starred: !!payload.starred });
            const note = resp?.data?.note || null;
            return { success: !!resp?.success, note };
        } catch (error) {
            console.error('Error adding customer note:', error);
            throw error;
        }
    },
    updateNote: async (storeId, customerId, noteId, payload) => {
        if (!storeId || !customerId || !noteId) throw new Error('Missing fields for update note');
        try {
            const url = `${FULL_API_URL}/customers/${storeId}/${customerId}/notes/${noteId}`;
            const resp = await fetchWithAuth(url, 'PUT', payload);
            const note = resp?.data?.note || null;
            return { success: !!resp?.success, note };
        } catch (error) {
            console.error('Error updating customer note:', error);
            throw error;
        }
    },
    deleteNote: async (storeId, customerId, noteId) => {
        if (!storeId || !customerId || !noteId) throw new Error('Missing fields for delete note');
        try {
            const url = `${FULL_API_URL}/customers/${storeId}/${customerId}/notes/${noteId}`;
            const resp = await fetchWithAuth(url, 'DELETE');
            return { success: !!resp?.success };
        } catch (error) {
            console.error('Error deleting customer note:', error);
            throw error;
        }
    }
};

// Store availability API
export const storesApi = {
    /**
     * Fetch availability (opening/closing) for a store on a specific date (YYYY-MM-DD)
     */
    getAvailability: async (storeId, date) => {
        try {
            const url = `${FULL_API_URL}/stores/${storeId}/availability?date=${date}`;
            const response = await fetchWithAuth(url, 'GET');
            if (response?.data) {
                const d = response.data;
                return {
                    success: !!response.success,
                    opening: d.opening_time || d.shift_info?.opening_time || null,
                    closing: d.closing_time || d.shift_info?.closing_time || null,
                    isOpen: d.is_open && !(d.shift_info?.is_closed),
                    raw: d
                };
            }
            return { success: false, opening: null, closing: null, isOpen: false };
        } catch (error) {
            console.error('Error fetching availability:', error);
            throw error;
        }
    }
};

// Products API
export const productsApi = {
    /**
     * Create a new product
     * @param {string} storeId - The ID of the store
     * @param {Object} productData - The product data
     * @returns {Promise} - A promise that resolves to the created product
     */
    createProduct: async (storeId, productData) => {
        try {
            const url = `${API_BASE_URL}/api/v1/products/${storeId}`;
            
            // Transform frontend data to match API expectations
            const toYMD = (v) => {
                if (!v) return '';
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
                const d = new Date(v);
                if (isNaN(d)) return '';
                const pad = (n) => String(n).padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
            };
            const apiData = {
                name: productData.productName,
                company: productData.company,
                cost_price: productData.costPrice,
                selling_price: productData.sellingPrice,
                usage: productData.productType,
                category: productData.category,
                qty: productData.quantity,
                prod_qty: productData.volume,
                prod_qty_unit: productData.volumeUnit,
                mfg_date: toYMD(productData.mfgDate),
                exp_date: toYMD(productData.expDate),
                notification_qty: productData.lowQtyNotification,
                expiry_notification_days: productData.expNotificationDays,
                hsn_sac_code: productData.hsnSac,
                tax_prcnt: productData.tax,
                description: productData.description || '',
                batch_no: productData.batchNo || ''
            };
            
            const response = await fetchWithAuth(url, 'POST', apiData);
            return response;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    /**
     * Get all products for a store
     * @param {string} storeId - The ID of the store
     * @returns {Promise} - A promise that resolves to the products list
     */
    getProducts: async (storeId) => {
        try {
            const url = `${API_BASE_URL}/api/v1/products/${storeId}`;
            
            const response = await fetchWithAuth(url, 'GET');
            return response;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    /**
     * Update a product
     * @param {string} storeId - The ID of the store
     * @param {string} productId - The ID of the product
     * @param {Object} productData - The updated product data
     * @returns {Promise} - A promise that resolves to the updated product
     */
    updateProduct: async (storeId, productId, productData) => {
        try {
            const url = `${API_BASE_URL}/api/v1/products/${storeId}/${productId}`;
            
            // Transform frontend data to match API expectations
            const toYMDu = (v) => {
                if (!v) return '';
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
                const d = new Date(v);
                if (isNaN(d)) return '';
                const pad = (n) => String(n).padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
            };
            const apiData = {
                name: productData.productName,
                company: productData.company,
                cost_price: productData.costPrice,
                selling_price: productData.sellingPrice,
                usage: productData.productType,
                category: productData.category,
                qty: productData.quantity,
                prod_qty: productData.volume,
                prod_qty_unit: productData.volumeUnit,
                mfg_date: toYMDu(productData.mfgDate),
                exp_date: toYMDu(productData.expDate),
                notification_qty: productData.lowQtyNotification,
                expiry_notification_days: productData.expNotificationDays,
                hsn_sac_code: productData.hsnSac,
                tax_prcnt: productData.tax,
                description: productData.description || '',
                batch_no: productData.batchNo || ''
            };
            
            const response = await fetchWithAuth(url, 'PUT', apiData);
            return response;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    /**
     * Delete a product
     * @param {string} storeId - The ID of the store
     * @param {string} productId - The ID of the product
     * @returns {Promise} - A promise that resolves to the deletion response
     */
    deleteProduct: async (storeId, productId) => {
        try {
            const url = `${API_BASE_URL}/api/v1/products/${storeId}/${productId}`;
            
            const response = await fetchWithAuth(url, 'DELETE');
            return response;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }
};

/**
 * Services API functions
 */
export const servicesApi = {
    // Get all services
    getAll: async (store_id) => {
        try {
            const url = `${FULL_API_URL}/services/${store_id}`;
            
            const response = await fetchWithAuth(url);
            return response;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    },

    // Get service by ID
    getById: async (store_id, serviceId) => {
        try {
            const url = `${FULL_API_URL}/services/${store_id}/${serviceId}`;
            
            const response = await fetchWithAuth(url);
            return response;
        } catch (error) {
            console.error('Error fetching service:', error);
            throw error;
        }
    },

    // Create new service
    create: async (store_id, serviceData) => {
        try {
            const url = `${FULL_API_URL}/services/${store_id}`;
            
            const response = await fetchWithAuth(url, 'POST', serviceData);
            return response;
        } catch (error) {
            console.error('Error creating service:', error);
            throw error;
        }
    },

    // Update existing service
    update: async (store_id, serviceId, serviceData) => {
        try {
            const url = `${FULL_API_URL}/services/${store_id}/${serviceId}`;
            
            const response = await fetchWithAuth(url, 'PUT', serviceData);
            return response;
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    },

    // Delete service
    delete: async (store_id, serviceId) => {
        try {
            const url = `${FULL_API_URL}/services/${store_id}/${serviceId}`;
            
            const response = await fetchWithAuth(url, 'DELETE');
            return response;
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    }
};

/**
 * Memberships API functions
 */
export const membershipsApi = {
    /**
     * Get all memberships for a store
     * @param {string} storeId - The ID of the store
     * @returns {Promise} - A promise that resolves to the memberships list
     */
    getAll: async (storeId) => {
        try {
            const url = `${FULL_API_URL}/memberships/${storeId}`;
            
            const response = await fetchWithAuth(url);
            return response;
        } catch (error) {
            console.error('Error fetching memberships:', error);
            throw error;
        }
    },

    /**
     * Create a new membership
     * @param {string} storeId - The ID of the store
     * @param {object} payload - Mapped membership payload per API contract
     */
    create: async (storeId, payload) => {
        try {
            const url = `${API_BASE_URL}/api/v1/memberships/${storeId}`;
            const response = await fetchWithAuth(url, 'POST', payload);
            return response;
        } catch (error) {
            console.error('Error creating membership:', error);
            throw error;
        }
    },
    // New: fetch single membership detail
    getById: async (storeId, membershipId) => {
        try {
            const url = `${API_BASE_URL}/api/v1/memberships/${storeId}/${membershipId}`;
            const response = await fetchWithAuth(url, 'GET');
            return response;
        } catch (error) {
            console.error('Error fetching membership detail:', error);
            throw error;
        }
    },
    // New: update membership
    update: async (storeId, membershipId, payload) => {
        try {
            const url = `${API_BASE_URL}/api/v1/memberships/${storeId}/${membershipId}`;
            const response = await fetchWithAuth(url, 'PUT', payload);
            return response;
        } catch (error) {
            console.error('Error updating membership:', error);
            throw error;
        }
    },
    // New: delete membership
    delete: async (storeId, membershipId) => {
        try {
            const url = `${API_BASE_URL}/api/v1/memberships/${storeId}/${membershipId}`;
            const response = await fetchWithAuth(url, 'DELETE');
            return response;
        } catch (error) {
            console.error('Error deleting membership:', error);
            throw error;
        }
    }
};

// Appointments API
export const appointmentsApi = {
    /**
     * Create an appointment
     * Endpoint: POST /api/v1/store/{storeId}/appointments
     * Body example:
     * { phoneNumber, customerName, gender, source, date, time, status, services:[{serviceId, staffId}], totalDurationMinutes, totalAmount, advanceAmount, payableAmount, paymentMode, notes }
     */
    create: async (storeId, payload) => {
        try {
            const url = `${FULL_API_URL}/appointments/store/${storeId}/appointments`;
            // Force status to 'scheduled' for create per requirement
            const body = { ...payload, status: 'scheduled' };
            const response = await fetchWithAuth(url, 'POST', body);
            return response;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    },
    /**
     * Get appointment by ID
     * Endpoint: GET /api/v1/store/{storeId}/appointments/{appointmentId}
     */
    getById: async (storeId, appointmentId) => {
        try {
            const url = `${FULL_API_URL}/appointments/store/${storeId}/appointments/${appointmentId}`;
            const response = await fetchWithAuth(url, 'GET');
            return response;
        } catch (error) {
            console.error('Error getting appointment by id:', error);
            throw error;
        }
    },
    /**
     * List appointments
     * Endpoint: GET /api/v1/store/{storeId}/appointments
     */
    list: async (storeId, params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const url = `${FULL_API_URL}/appointments/store/${storeId}/appointments${query ? `?${query}` : ''}`;
            const response = await fetchWithAuth(url, 'GET');
            return response;
        } catch (error) {
            console.error('Error listing appointments:', error);
            throw error;
        }
    },
    /**
     * Update an appointment
     * Endpoint: PUT /api/v1/store/{storeId}/appointments/{appointmentId}
     */
    update: async (storeId, appointmentId, payload) => {
        try {
            const url = `${FULL_API_URL}/appointments/store/${storeId}/appointments/${appointmentId}`;
            const response = await fetchWithAuth(url, 'PUT', payload);
            return response;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    },
    /**
     * Delete an appointment
     * Endpoint: DELETE /api/v1/store/{storeId}/appointments/{appointmentId}
     */
    delete: async (storeId, appointmentId) => {
        try {
            const url = `${FULL_API_URL}/appointments/store/${storeId}/appointments/${appointmentId}`;
            const response = await fetchWithAuth(url, 'DELETE');
            return response;
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }
};

// Bookings API (per OpenAPI spec)
export const bookingsApi = {
    // Create booking: POST /api/v1/store/{storeId}/bookings
    create: async (storeId, payload) => {
        try {
            const url = `${FULL_API_URL}/bookings/store/${storeId}/bookings`;
            const response = await fetchWithAuth(url, 'POST', payload);
            return response;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },
    // List bookings: GET /api/v1/store/{storeId}/bookings
    list: async (storeId, params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const url = `${FULL_API_URL}/bookings/store/${storeId}/bookings${query ? `?${query}` : ''}`;
            const response = await fetchWithAuth(url, 'GET');
            return response;
        } catch (error) {
            console.error('Error listing bookings:', error);
            throw error;
        }
    },
    // Get booking by ID: GET /api/v1/store/{storeId}/bookings/{bookingId}
    getById: async (storeId, bookingId) => {
        try {
            const url = `${FULL_API_URL}/bookings/store/${storeId}/bookings/${bookingId}`;
            const response = await fetchWithAuth(url, 'GET');
            return response;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },
    // Update booking: PUT /api/v1/store/{storeId}/bookings/{bookingId}
    update: async (storeId, bookingId, payload) => {
        try {
            const url = `${FULL_API_URL}/bookings/store/${storeId}/bookings/${bookingId}`;
            const response = await fetchWithAuth(url, 'PUT', payload);
            return response;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },
    // Patch status: PATCH /api/v1/store/{storeId}/bookings/{bookingId}/status
    patchStatus: async (storeId, bookingId, status) => {
        try {
            const url = `${FULL_API_URL}/bookings/store/${storeId}/bookings/${bookingId}/status`;
            const response = await fetchWithAuth(url, 'PATCH', { status });
            return response;
        } catch (error) {
            console.error('Error patching booking status:', error);
            throw error;
        }
    },
    // Delete booking (soft): DELETE /api/v1/store/{storeId}/bookings/{bookingId}
    delete: async (storeId, bookingId) => {
        try {
            const url = `${FULL_API_URL}/bookings/store/${storeId}/bookings/${bookingId}`;
            const response = await fetchWithAuth(url, 'DELETE');
            return response;
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    }
};

// Enquiries API (per provided endpoints)
export const enquiriesApi = {
    // Create enquiry: POST /api/v1/enquiries/{storeId}
    create: async (storeId, payload) => {
        try {
            const url = `${FULL_API_URL}/enquiries/${storeId}`;
            const response = await fetchWithAuth(url, 'POST', payload);
            return response;
        } catch (error) {
            console.error('Error creating enquiry:', error);
            throw error;
        }
    },
    // List enquiries: GET /api/v1/enquiries/{storeId}
    list: async (storeId, params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const url = `${FULL_API_URL}/enquiries/${storeId}${query ? `?${query}` : ''}`;
            const response = await fetchWithAuth(url, 'GET');
            return response;
        } catch (error) {
            console.error('Error listing enquiries:', error);
            throw error;
        }
    },
    // Get enquiry by ID: GET /api/v1/enquiries/{storeId}/{enquiryId}
    getById: async (storeId, enquiryId) => {
        try {
            const url = `${FULL_API_URL}/enquiries/${storeId}/${enquiryId}`;
            const response = await fetchWithAuth(url, 'GET');
            return response;
        } catch (error) {
            console.error('Error fetching enquiry:', error);
            throw error;
        }
    },
    // Update enquiry: PUT /api/v1/enquiries/{storeId}/{enquiryId}
    update: async (storeId, enquiryId, payload) => {
        try {
            const url = `${FULL_API_URL}/enquiries/${storeId}/${enquiryId}`;
            const response = await fetchWithAuth(url, 'PUT', payload);
            return response;
        } catch (error) {
            console.error('Error updating enquiry:', error);
            throw error;
        }
    },
    // Patch status: PATCH /api/v1/enquiries/{storeId}/{enquiryId}/status
    patchStatus: async (storeId, enquiryId, enquiry_status) => {
        try {
            const url = `${FULL_API_URL}/enquiries/${storeId}/${enquiryId}/status`;
            const response = await fetchWithAuth(url, 'PATCH', { enquiry_status });
            return response;
        } catch (error) {
            console.error('Error patching enquiry status:', error);
            throw error;
        }
    },
    // Patch follow-up: PATCH /api/v1/enquiries/{storeId}/{enquiryId}/follow-up
    patchFollowUp: async (storeId, enquiryId, follow_up_at) => {
        try {
            const url = `${FULL_API_URL}/enquiries/${storeId}/${enquiryId}/follow-up`;
            const response = await fetchWithAuth(url, 'PATCH', { follow_up_at });
            return response;
        } catch (error) {
            console.error('Error patching enquiry follow-up:', error);
            throw error;
        }
    },
    // Delete enquiry (soft)
    delete: async (storeId, enquiryId) => {
        try {
            const url = `${FULL_API_URL}/enquiries/${storeId}/${enquiryId}`;
            const response = await fetchWithAuth(url, 'DELETE');
            return response;
        } catch (error) {
            console.error('Error deleting enquiry:', error);
            throw error;
        }
    }
};

/**
 * Enums API functions
 */
export const enumsApi = {
  /**
   * Get service categories for a store
   * @param {string} storeId - The ID of the store
   * @returns {Promise} - A promise that resolves to the categories
   */
  getServiceCategories: async (storeId) => {
    try {
      const url = `${API_BASE_URL}/api/v1/enums/${storeId}/serviceCategory`;
      const response = await fetchWithAuth(url, 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  },

  /**
   * Update service categories for a store
   * @param {string} storeId - The ID of the store
   * @param {Array} values - Array of category values
   * @returns {Promise} - A promise that resolves to the updated categories
   */
  updateServiceCategories: async (storeId, values) => {
    try {
      const url = `${API_BASE_URL}/api/v1/enums/${storeId}/serviceCategory`;
      const response = await fetchWithAuth(url, 'PATCH', { values });
      return response;
    } catch (error) {
      console.error('Error updating service categories:', error);
      throw error;
    }
  },

  /**
   * Get product categories for a store
   * @param {string} storeId - The ID of the store
   * @returns {Promise} - A promise that resolves to the categories
   */
  getProductCategories: async (storeId) => {
    try {
      const url = `${API_BASE_URL}/api/v1/enums/${storeId}/productCategory`;
      const response = await fetchWithAuth(url, 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching product categories:', error);
      throw error;
    }
  },

  /**
   * Update product categories for a store
   * @param {string} storeId - The ID of the store
   * @param {Array} values - Array of category values
   * @returns {Promise} - A promise that resolves to the updated categories
   */
  updateProductCategories: async (storeId, values) => {
    try {
      const url = `${API_BASE_URL}/api/v1/enums/${storeId}/productCategory`;
      const response = await fetchWithAuth(url, 'PATCH', { values });
      return response;
    } catch (error) {
      console.error('Error updating product categories:', error);
      throw error;
    }
  },

  /**
   * Get roles for a store
   * @param {string} storeId - The ID of the store
   * @returns {Promise} - A promise that resolves to the roles
   */
  getRoles: async (storeId) => {
    try {
      const url = `${API_BASE_URL}/api/v1/enums/${storeId}/roles`;
      const response = await fetchWithAuth(url, 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  /**
   * Update roles for a store
   * @param {string} storeId - The ID of the store
   * @param {Array} values - Array of role values
   * @returns {Promise} - A promise that resolves to the updated roles
   */
  updateRoles: async (storeId, values) => {
    try {
      const url = `${API_BASE_URL}/api/v1/enums/${storeId}/roles`;
      const response = await fetchWithAuth(url, 'PATCH', { values });
      return response;
    } catch (error) {
      console.error('Error updating roles:', error);
      throw error;
    }
  }
};
