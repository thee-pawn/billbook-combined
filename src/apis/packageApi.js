import { apiRequest, authHeader, withCors } from './apiUtils';

export const packageApi = {
  /**
   * Fetch service packages for a store
   * @param {string} storeId
   * @param {number} page
   * @param {number} limit
   */
  async getPackages(storeId, page = 1, limit = 10) {
    const query = `?page=${page}&limit=${limit}`;
    const endpoint = `/api/v1/service-packages/${storeId}${query}`;
    const res = await apiRequest(endpoint, withCors({
      method: 'GET',
      headers: {
        ...authHeader(),
      },
    }));
    return res; // shape: { success, message, data: { packages, pagination } }
  },

  /**
   * Create a new service package
   * @param {string} storeId
   * @param {object} payload
   */
  async createPackage(storeId, payload) {
    const endpoint = `/api/v1/service-packages/${storeId}`;
    const res = await apiRequest(endpoint, withCors({
      method: 'POST',
      headers: {
        ...authHeader(),
      },
      body: JSON.stringify(payload),
    }));
    return res;
  },

  /**
   * Get a single service package by id
   * @param {string} storeId
   * @param {string|number} packageId
   */
  async getPackageById(storeId, packageId) {
    const endpoint = `/api/v1/service-packages/${storeId}/${packageId}`;
    const res = await apiRequest(endpoint, withCors({
      method: 'GET',
      headers: { ...authHeader() },
    }));
    return res;
  },

  /**
   * Update a service package
   * @param {string} storeId
   * @param {string|number} packageId
   * @param {object} payload
   */
  async updatePackage(storeId, packageId, payload) {
    const endpoint = `/api/v1/service-packages/${storeId}/${packageId}`;
    const res = await apiRequest(endpoint, withCors({
      method: 'PUT',
      headers: { ...authHeader() },
      body: JSON.stringify(payload),
    }));
    return res;
  },

  /**
   * Delete a service package
   * @param {string} storeId
   * @param {string|number} packageId
   */
  async deletePackage(storeId, packageId) {
    const endpoint = `/api/v1/service-packages/${storeId}/${packageId}`;
    const res = await apiRequest(endpoint, withCors({
      method: 'DELETE',
      headers: { ...authHeader() },
    }));
    return res;
  },
};
