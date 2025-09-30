/**
 * API for billing-related data and operations
 */

import { couponApi } from './couponApi';
import { apiRequest, authHeader, withCors } from './apiUtils';

// Service filters
export const getServiceFilters = async () => {
  // Mock data - in real implementation, this would fetch from backend
  const mockServiceFilters = ['Hair Styling', 'Nail Care', 'Skin Care', 'Massage'];
  return mockServiceFilters;
};

// Coupons - now using real API
export const getCoupons = async (storeId) => {
  try {
    if (!storeId) {
      console.warn('No store ID provided for fetching coupons');
      return [];
    }

    const response = await couponApi.getCoupons(storeId);
    const couponsData = response.coupons || [];

    // Transform API data to billing format
    return couponsData.map(coupon => ({
      id: coupon.id,
      name: coupon.couponCode,
      description: coupon.description,
      type: coupon.discount.type,
      value: coupon.discount.value,
      minPurchase: coupon.conditions?.minimumSpend || 0,
      maxDiscount: coupon.conditions?.maximumDisc || 0,
      usageLimit: coupon.conditions?.limit || 0,
      validFrom: coupon.validForm,
      validTo: coupon.validTill,
      status: coupon.status,
      _raw: coupon // Keep original data for reference
    }));
  } catch (error) {
    console.error('Error fetching coupons for billing:', error);
    // Fallback to empty array if API fails
    return [];
  }
};

// Services, Products, Memberships
export const getServices = async () => {
  // Mock data - in real implementation, this would fetch from backend
  return ['Hair Styling', 'Global Hair Color', 'Manicure', 'Pedicure'];
};

export const getProducts = async () => {
  // Mock data - in real implementation, this would fetch from backend
  return ['Loreal Shampoo', 'Conditioner XYZ', 'Hair Gel ABC'];
};

export const getMemberships = async () => {
  // Mock data - in real implementation, this would fetch from backend
  return ['Wallet Membership', 'Gold Membership', 'Annual Package'];
};

// Artists
export const getArtists = async () => {
  // Mock data - in real implementation, this would fetch from backend
  return [
    { id: 'shailendra', name: 'Shailendra' }, 
    { id: 'pawan', name: 'Pawan' },
    { id: 'siddharth', name: 'Siddharth' }, 
    { id: 'riya', name: 'Riya' }, 
    { id: 'amit', name: 'Amit' }
  ];
};

// Held invoices
export const getHeldInvoices = async () => {
  // Legacy mock for backward compatibility (unused when backend endpoints are available)
  return [
    {
      id: 'hold-1',
      customer: { number: '9876543210', name: 'Anita Singh', gender: 'Female' },
      date: '2025-07-15',
      time: '14:30',
      items: [
        { id: 101, type: 'Service', name: 'Hair Styling', artists: [{ id: 'riya', name: 'Riya', amount: 200 }], qty: 1, price: 800, discount: 0, discountType: 'percent', gst: 40 },
        { id: 102, type: 'Product', name: 'Loreal Shampoo', qty: 1, price: 450, discount: 0, discountType: 'percent', gst: 25 }
      ],
      total: 1315,
      heldAt: '2025-07-15T14:35'
    },
    {
      id: 'hold-2',
      customer: { number: '8765432109', name: 'Rajesh Kumar', gender: 'Male' },
      date: '2025-07-16',
      time: '11:15',
      items: [
        { id: 201, type: 'Service', name: 'Global Hair Color', artists: [{ id: 'shailendra', name: 'Shailendra', amount: 500 }], qty: 1, price: 1500, discount: 10, discountType: 'percent', gst: 75 },
      ],
      total: 1425,
      heldAt: '2025-07-16T11:20'
    },
    {
      id: 'hold-3',
      customer: { number: '7654321098', name: 'Preeti Verma', gender: 'Female' },
      date: '2025-07-17',
      time: '16:00',
      items: [
        { id: 301, type: 'Service', name: 'Manicure', artists: [{ id: 'pawan', name: 'Pawan', amount: 150 }], qty: 1, price: 600, discount: 0, discountType: 'percent', gst: 30 },
        { id: 302, type: 'Service', name: 'Pedicure', artists: [{ id: 'pawan', name: 'Pawan', amount: 200 }], qty: 1, price: 800, discount: 0, discountType: 'percent', gst: 40 },
        { id: 303, type: 'Product', name: 'Conditioner XYZ', qty: 1, price: 350, discount: 5, discountType: 'percent', gst: 20 }
      ],
      total: 1823.25,
      heldAt: '2025-07-17T16:30'
    }
  ];
};

// Billing operations
export const saveBill = async (...args) => {
  // If called with (storeId, payload) from new flow, route to real API
  if (args.length === 2 && typeof args[0] !== 'object') {
    const [storeId, payload] = args;
    const generateIdempotencyKey = () => `bill-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const res = await apiRequest(`/api/v1/billing/${storeId}/bills`, withCors({
      method: 'POST',
      headers: { ...authHeader(), 'Idempotency-Key': generateIdempotencyKey() },
      body: JSON.stringify(payload)
    }));
    return res;
  }
  // Mock fallback
  const billData = args[0];
  return { success: true, message: 'Bill saved successfully', id: `bill-${Date.now()}` };
};

export const holdBill = async (...args) => {
  if (args.length === 2 && typeof args[0] !== 'object') {
    const [storeId, payload] = args;
    const res = await apiRequest(`/api/v1/billing/${storeId}/bills/hold`, withCors({
      method: 'POST',
      headers: { ...authHeader() },
      body: JSON.stringify(payload)
    }));
    return res;
  }
  // Mock fallback
  const billData = args[0];
  return { success: true, message: 'Bill held successfully', id: `hold-${Date.now()}` };
};

export const loadHeldBill = async (id) => {
  // Mock implementation - would fetch from backend
  const heldInvoices = await getHeldInvoices();
  const invoice = heldInvoices.find(inv => inv.id === id);
  return invoice || null;
};

// New real endpoints wrappers
export const getBills = async (storeId, query = {}) => {
  const params = new URLSearchParams(query).toString();
  const res = await apiRequest(`/api/v1/billing/${storeId}/bills${params ? `?${params}` : ''}`, withCors({
    method: 'GET',
    headers: { ...authHeader() }
  }));
  return res;
};

export const getHeldBills = async (storeId) => {
  const res = await apiRequest(`/api/v1/billing/${storeId}/bills/held`, withCors({
    method: 'GET',
    headers: { ...authHeader() }
  }));
  return res;
};

export const getHeldBillById = async (storeId, heldId) => {
  const res = await apiRequest(`/api/v1/billing/${storeId}/bills/held/${heldId}`, withCors({
    method: 'GET',
    headers: { ...authHeader() }
  }));
  return res;
};

// Get a single bill by id
export const getBillById = async (storeId, billId) => {
  const res = await apiRequest(`/api/v1/billing/${storeId}/bills/${billId}`, withCors({
    method: 'GET',
    headers: { ...authHeader() }
  }));
  return res;
};

// Get customer bills (client history)
export const getCustomerBills = async (storeId, customerId, options = {}) => {
  const params = new URLSearchParams();
  
  // Add due_only filter if specified
  if (options.dueOnly) {
    params.append('due_only', 'true');
  }
  
  // Add other potential filters
  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit);
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  
  const queryString = params.toString();
  const url = `/api/v1/billing/${storeId}/customers/${customerId}/bills${queryString ? `?${queryString}` : ''}`;
  
  const res = await apiRequest(url, withCors({
    method: 'GET',
    headers: { ...authHeader() }
  }));
  return res;
};

// Aliases matching external spec naming
export const createBill = saveBill; // POST /bills with Idempotency-Key
export const listBills = getBills;   // GET /bills with query params
export const getBill = getBillById;
