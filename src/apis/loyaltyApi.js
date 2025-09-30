/**
 * Loyalty Points Configuration API service
 */
import { apiRequest, authHeader } from './apiUtils';
import config from '../config';

const loyaltyApi = {
  /**
   * Update loyalty points configuration for a store (PUT)
   * @param {string} storeId
   * @param {Object} payload
   */
  updatePointsConfiguration: async (storeId, payload) => {
    const endpoint = `${config.apiEndpoints.loyalty.pointsConfiguration}${storeId}`;
    return apiRequest(endpoint, {
      method: 'PUT',
      headers: {
        ...authHeader(),
      },
      body: JSON.stringify(payload),
    });
  },
  /**
   * Save loyalty points configuration for a store
   * @param {string} storeId
   * @param {Object} payload - {
   *   loyaltyPointsConversionRate: number,
   *   serviceLoyaltyPoints: number,
   *   productLoyaltyPoints: number,
   *   membershipLoyaltyPoints: number
   * }
   */
  savePointsConfiguration: async (storeId, payload) => {
    const endpoint = `${config.apiEndpoints.loyalty.pointsConfiguration}${storeId}`;
    return apiRequest(endpoint, {
      method: 'POST',
      headers: {
        ...authHeader(),
      },
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get loyalty points configuration for a store
   * @param {string} storeId
   */
  getPointsConfiguration: async (storeId) => {
    const endpoint = `${config.apiEndpoints.loyalty.pointsConfiguration}${storeId}`;
    return apiRequest(endpoint, {
      method: 'GET',
      headers: {
        ...authHeader(),
      },
    });
  },
};

export default loyaltyApi;
