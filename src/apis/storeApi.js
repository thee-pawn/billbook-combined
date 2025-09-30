/**
 * Store API service
 */
import { apiRequest, authHeader } from './apiUtils';
import config from '../config';

const storeApi = {
  /**
   * Get all stores for the authenticated user
   * Uses the new /api/v1/stores endpoint with fallback to user-based approach
   * 
   * @returns {Promise} - List of stores associated with the authenticated user
   */
  getStores: async () => {
    
    try {
      // First try the new /api/v1/stores endpoint
      return await apiRequest(config.apiEndpoints.stores.list, {
        method: 'GET',
        headers: authHeader()
      });
    } catch (error) {
      
      // If that fails, try to get user profile and then use the getUserStores endpoint
      try {
        const { authApi } = await import('./authApi');
        const userResponse = await authApi.getUserProfile();
        
        if (userResponse.success && userResponse.data && userResponse.data.id) {
          const userId = userResponse.data.id;
          
          // Use the legacy endpoint with user ID
          const endpoint = config.apiEndpoints.stores.getUserStores + userId;
          const storesResponse = await apiRequest(endpoint, {
            method: 'GET',
            headers: authHeader()
          });
          
          // Transform the response to match the expected format
          if (storesResponse.success && storesResponse.data) {
            return {
              success: true,
              message: 'Stores retrieved successfully',
              data: {
                stores: Array.isArray(storesResponse.data) ? storesResponse.data : [storesResponse.data],
                pagination: {
                  page: 1,
                  limit: 10,
                  total: Array.isArray(storesResponse.data) ? storesResponse.data.length : 1,
                  pages: 1
                }
              }
            };
          }
        }
        
        throw new Error('Failed to get user information for store lookup');
      } catch (fallbackError) {
        console.error('Fallback approach also failed:', fallbackError);
        throw error; // Throw the original error
      }
    }
  },

  /**
   * Get stores for the current user (legacy method)
   * 
   * @param {string} ownerId - Owner ID (user ID from login response)
   * @returns {Promise} - List of stores associated with the user
   */
  getUserStores: async (ownerId) => {
    // Use the actual user ID from login response
    const endpoint = config.apiEndpoints.stores.getUserStores + ownerId;
    
    return apiRequest(endpoint, {
      method: 'GET',
      headers: authHeader()
    });
  },
  
  /**
   * Create a new store
   * 
   * @param {Object} storeData - New store data
   * @returns {Promise} - Created store data
   */
  createStore: async (storeData) => {
    return apiRequest(config.apiEndpoints.stores.create, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(storeData)
    });
  },
  
  /**
   * Get store details by ID
   * 
   * @param {string} storeId - Store ID
   * @returns {Promise} - Store details
   */
  getStoreById: async (storeId) => {
    return apiRequest(config.apiEndpoints.stores.getById + storeId, {
      method: 'GET',
      headers: authHeader()
    });
  },

  /**
   * Alias for getStoreById for backward compatibility
   */
  getStore: async (storeId) => {
    return storeApi.getStoreById(storeId);
  },

  /**
   * Get store profile details
   * 
   * @param {string} storeId - Store ID
   * @returns {Promise} - Store profile details
   */
  getStoreProfile: async (storeId) => {
    return apiRequest(config.apiEndpoints.stores.getProfile + storeId, {
      method: 'GET',
      headers: authHeader()
    });
  },
  
  /**
   * Create a store profile
   * 
   * @param {Object} profileData - Complete store profile data
   * @returns {Promise} - Created store profile data
   */
  createStoreProfile: async (profileData) => {
    return apiRequest(config.apiEndpoints.stores.create, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(profileData)
    });
  },
  
  /**
   * Update a store
   * 
   * @param {string} storeId - Store ID
   * @param {Object} storeData - Updated store data
   * @returns {Promise} - Updated store data
   */
  updateStore: async (storeId, storeData) => {
    return apiRequest(config.apiEndpoints.stores.update + storeId, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(storeData)
    });
  },
  
  /**
   * Delete a store
   * 
   * @param {string} storeId - Store ID
   * @returns {Promise} - Success status
   */
  deleteStore: async (storeId) => {
    return apiRequest(config.apiEndpoints.stores.delete + storeId, {
      method: 'DELETE',
      headers: authHeader()
    });
  },
  
  /**
   * Get all stores (admin function)
   * 
   * @returns {Promise} - List of all stores
   */
  getAllStores: async () => {
    return apiRequest(config.apiEndpoints.stores.list, {
      method: 'GET',
      headers: authHeader()
    });
  },
  
  /**
   * Get store customers
   * 
   * @param {string} storeId - Store ID
   * @returns {Promise} - List of store customers
   */
  getStoreCustomers: async (storeId) => {
    return apiRequest(`/api/v1/store/${storeId}/customers`, {
      method: 'GET',
      headers: authHeader()
    });
  },
  
  /**
   * Get store products
   * 
   * @param {string} storeId - Store ID
   * @returns {Promise} - List of store products
   */
  getStoreProducts: async (storeId) => {
    return apiRequest(`/api/v1/store/${storeId}/products`, {
      method: 'GET',
      headers: authHeader()
    });
  },
  
  /**
   * Get store services
   * 
   * @param {string} storeId - Store ID
   * @returns {Promise} - List of store services
   */
  getStoreServices: async (storeId) => {
    return apiRequest(`/api/v1/store/${storeId}/services`, {
      method: 'GET',
      headers: authHeader()
    });
  }
};

export default storeApi;
