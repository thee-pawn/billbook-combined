/**
 * API for coupon-related operations
 */

import { apiRequest, authHeader, withCors } from './apiUtils';

export const couponApi = {
  /**
   * Get all coupons for a store
   * @param {string} storeId - Store ID
   * @returns {Promise<Object>} API response with coupons data
   */
  async getCoupons(storeId) {
    try {
      const response = await apiRequest(`/api/v1/coupons/${storeId}`, withCors({
        method: 'GET',
        headers: {
          ...authHeader(),
        },
      }));

      return response.data || {};
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  },

  /**
   * Create a new coupon
   * @param {string} storeId - Store ID
   * @param {Object} couponData - Coupon data
   * @returns {Promise<Object>} API response
   */
  async createCoupon(storeId, couponData) {
    try {
      const response = await apiRequest(`/api/v1/coupons/${storeId}`, withCors({
        method: 'POST',
        headers: {
          ...authHeader(),
        },
        body: JSON.stringify(couponData),
      }));

      return response;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  /**
   * Update an existing coupon
   * @param {string} storeId - Store ID
   * @param {string} couponId - Coupon ID
   * @param {Object} couponData - Updated coupon data
   * @returns {Promise<Object>} API response
   */
  async updateCoupon(storeId, couponId, couponData) {
    try {
      const response = await apiRequest(`/api/v1/coupons/${storeId}/${couponId}`, withCors({
        method: 'PUT',
        headers: {
          ...authHeader(),
        },
        body: JSON.stringify(couponData),
      }));

      return response;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  /**
   * Delete a coupon
   * @param {string} storeId - Store ID
   * @param {string} couponId - Coupon ID
   * @returns {Promise<Object>} API response
   */
  async deleteCoupon(storeId, couponId) {
    try {
      const response = await apiRequest(`/api/v1/coupons/${storeId}/${couponId}`, withCors({
        method: 'DELETE',
        headers: {
          ...authHeader(),
        },
      }));

      return response;
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  }
};
