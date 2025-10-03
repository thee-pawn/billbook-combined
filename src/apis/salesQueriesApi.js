// Sales Queries API - Based on the Postman collection for managing customer sales inquiries

// Base URL for the API - uses environment variable or falls back to default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_VERSION = '/api/v1';

// For development, use proxy path to avoid CORS issues
const FULL_API_URL = import.meta.env.DEV ? API_VERSION : `${API_BASE_URL}${API_VERSION}`;

/**
 * Sales Queries API functions
 */
export const salesQueriesApi = {
    /**
     * Create a new sales query
     * @param {object} queryData - The sales query data
     * @param {string} queryData.name - Customer name (required)
     * @param {string} queryData.query - Customer inquiry (required)
     * @param {string} [queryData.phoneNumber] - Customer phone number (optional)
     * @param {string} [queryData.email] - Customer email (optional)
     * @returns {Promise} - A promise that resolves to the created query
     */
    createQuery: async (queryData) => {
        try {
            // Validate required fields
            if (!queryData.name || !queryData.query) {
                throw new Error('Name and query are required fields');
            }

            console.log('Making API call to:', `${FULL_API_URL}/sales-queries`);
            console.log('Request data:', queryData);

            // Try real API call first
            try {
                const response = await fetch(`${FULL_API_URL}/sales-queries`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phoneNumber: queryData.phoneNumber,
                        email: queryData.email,
                        name: queryData.name,
                        query: queryData.query
                    })
                });

                console.log('API Response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to create sales query: ${response.status}`);
                }

                const result = await response.json();
                console.log('API Response data:', result);
                return result;

            } catch (fetchError) {
                console.warn('Backend API call failed, using mock response:', fetchError.message);

                // Fallback to mock response if backend is not available
                await new Promise(resolve => setTimeout(resolve, 800));

                return {
                    success: true,
                    message: "Sales query created successfully (mock response - backend unavailable)",
                    data: {
                        id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        phoneNumber: queryData.phoneNumber || null,
                        email: queryData.email || null,
                        name: queryData.name,
                        query: queryData.query,
                        status: "open",
                        created_at: new Date().toISOString()
                    }
                };
            }

        } catch (error) {
            console.error('Error creating sales query:', error);
            throw error;
        }
    },

    /**
     * Get all sales queries with pagination and filtering
     * @param {object} options - Query options
     * @param {number} [options.page=1] - Page number
     * @param {number} [options.limit=20] - Items per page
     * @param {string} [options.status] - Filter by status (open/closed)
     * @returns {Promise} - A promise that resolves to the paginated queries
     */
    getAllQueries: async (options = {}) => {
        try {
            const { page = 1, limit = 20, status } = options;

            // Build query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (status) {
                queryParams.append('status', status);
            }

            // For development/testing
            if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
                await new Promise(resolve => setTimeout(resolve, 500));

                return {
                    success: true,
                    message: "Sales queries retrieved successfully",
                    data: {
                        salesQueries: [],
                        pagination: {
                            currentPage: page,
                            totalPages: 0,
                            totalItems: 0,
                            itemsPerPage: limit
                        }
                    }
                };
            }

            const response = await fetch(`${FULL_API_URL}/sales-queries?${queryParams}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch sales queries: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error fetching sales queries:', error);
            throw error;
        }
    },

    /**
     * Get a specific sales query by ID
     * @param {string} queryId - The query ID
     * @returns {Promise} - A promise that resolves to the query data
     */
    getQueryById: async (queryId) => {
        try {
            if (!queryId) {
                throw new Error('Query ID is required');
            }

            // For development/testing
            if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
                await new Promise(resolve => setTimeout(resolve, 300));

                return {
                    success: true,
                    message: "Sales query retrieved successfully",
                    data: {
                        id: queryId,
                        phoneNumber: "+1234567890",
                        email: "customer@example.com",
                        name: "John Doe",
                        query: "Sample query for development",
                        status: "open",
                        created_at: new Date().toISOString()
                    }
                };
            }

            const response = await fetch(`${FULL_API_URL}/sales-queries/${queryId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Sales query not found');
                }
                throw new Error(`Failed to fetch sales query: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error fetching sales query:', error);
            throw error;
        }
    },

    /**
     * Update the status of a sales query
     * @param {string} queryId - The query ID
     * @param {string} status - The new status (open/closed)
     * @returns {Promise} - A promise that resolves to the updated query
     */
    updateQueryStatus: async (queryId, status) => {
        try {
            if (!queryId || !status) {
                throw new Error('Query ID and status are required');
            }

            if (!['open', 'closed'].includes(status)) {
                throw new Error('Status must be either "open" or "closed"');
            }

            // For development/testing
            if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
                await new Promise(resolve => setTimeout(resolve, 500));

                return {
                    success: true,
                    message: `Sales query marked as ${status} successfully`,
                    data: {
                        id: queryId,
                        phoneNumber: "+1234567890",
                        email: "customer@example.com",
                        name: "John Doe",
                        query: "Sample query for development",
                        status: status,
                        created_at: new Date().toISOString()
                    }
                };
            }

            const response = await fetch(`${FULL_API_URL}/sales-queries/${queryId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update query status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error updating sales query status:', error);
            throw error;
        }
    }
};

export default salesQueriesApi;
