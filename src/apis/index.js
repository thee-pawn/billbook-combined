/**
 * Index file for exporting all API services
 */
import authApi from './authApi';
import * as billingApi from './billingApi';
import storeApi from './storeApi';
import loyaltyApi from './loyaltyApi';
import { couponApi } from './couponApi';
import { salesQueriesApi } from './salesQueriesApi';
// Import other API services as they are created
// import customersApi from './customersApi';
// import productsApi from './productsApi';

// Export all APIs
export {
  authApi,
  billingApi,
  storeApi,
  loyaltyApi,
  couponApi,
  salesQueriesApi,
  // customersApi,
  // productsApi,
};
