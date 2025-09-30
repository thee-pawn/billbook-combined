import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Hand, Recycle, Save, Trash2 } from 'lucide-react';
import * as billingApi from '../../apis/billingApi';
import { staffApi, getStoreProfile, servicesApi, productsApi, membershipsApi } from '../../apis/APIs';
import CustomerForm2 from '@components/customers/Customer2';
import { customersApi } from '../../apis/APIs';
import SplitPaymentComponent from './PaymentForm';
import CustomerHistory from '@components/customers/CustomerHistory';
import PendingHistory from '@components/customers/PendingHistory';
import { CustomerNotes } from '@components/customers/CustomerNotes';
import Modal from '@components/common/Modal';
import { XIcon, SaveIcon } from '@components/common/Icons';
import { InputField, SelectField } from '@components/common/FormElements';
import ArtistSelector from '@components/common/ArtistSelector';
import Invoice from './Invoice';
import ArtistRevenueModal from './ArtistRevenueModal';
import LoadInvoiceModal from './LoadInvoiceModal';
import { useStore } from '../login/StoreContext';
import { useNotification } from '../../contexts/NotificationContext';




// --- Main Billing Component ---

function Billing() {
  // Get current store from context
  const { currentStore } = useStore();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const location = useLocation();
  const navState = location.state || {};

  // --- State ---
  const initialClientData = {
    number: '',
    name: '',
    gender: '',
    paymentDues: '0.00',
    walletBalance: '0.00',
    loyaltyPoints: '0',
    advanceAmount: 0,
    referralPoints: 0,
    referralCode: '',
    membership: '',
    memberships: [],
    packages: '',
    lastVisit: '',
    birthday: '',
    anniversary: '',
    address: ''
  };

  const [billingItems, setBillingItems] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(initialClientData);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('');
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [showBilling, setShowBilling] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [payments, setPayments] = useState([]);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [adjustTotal, setAdjustTotal] = useState(0);
  const [dateTime, setDateTime] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
  });
  const [isClientHistoryOpen, setIsClientHistoryOpen] = useState(false);
  const [isDuesHistoryOpen, setIsDuesHistoryOpen] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newNoteStarred, setNewNoteStarred] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isLoadedInvoice, setIsLoadedInvoice] = useState(false);
  // Track last phone fetched to avoid duplicate API calls
  const lastFetchedPhoneRef = useRef(null);
  
  // State for API data
  const [serviceFilters, setServiceFilters] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [membershipsCatalog, setMembershipsCatalog] = useState([]);
  const [artists, setArtists] = useState([]);
  const [heldInvoices, setHeldInvoices] = useState([]);
  // Items enriched with per-line totals for Invoice rendering
  const [invoiceItems, setInvoiceItems] = useState([]);
  // Store raw bill response from backend
  const [savedBillData, setSavedBillData] = useState(null);
  // Tax settings
  const [applyTax, setApplyTax] = useState(true); // default checked
  const [isTaxInclusive, setIsTaxInclusive] = useState(false); // false means prices are tax-excluding

  // Calculation states
  const [calculatedSubTotal, setCalculatedSubTotal] = useState(0);
  const [totalItemDiscount, setTotalItemDiscount] = useState(0);
  const [totalGST, setTotalGST] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalDues, setTotalDues] = useState(0);
  // Derived helpers for coupon and adjustment logic
  const computeSubtotal = () => billingItems.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.qty || 0)), 0);
  const computeTotalBeforeExtra = () => billingItems.reduce((acc, it) => acc + (computeItemAmounts(it).total || 0), 0);
  const computeCouponDiscount = (subtotal) => {
    if (!selectedCoupons || selectedCoupons.length === 0) return 0;
    return Math.min(subtotal, selectedCoupons.reduce((acc, c) => {
      if (!c) return acc;
      const type = String(c.type || '').toLowerCase();
      const value = Number(c.value || 0);
      let disc = 0;
      if (type.includes('percent')) {
        disc = subtotal * (value / 100);
      } else {
        disc = value;
      }
      const maxDisc = Number(c.maxDiscount || 0);
      if (maxDisc > 0) disc = Math.min(disc, maxDisc);
      return acc + Math.max(0, disc);
    }, 0));
  };
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  useEffect(() => {
    // Set the current date and time
    setDateTime({ 
      date: new Date().toISOString().slice(0, 10), 
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) 
    });
    
    // Only fetch data if we have a current store
    if (!currentStore?.id) {
      console.warn('No store selected, cannot fetch billing data');
      return;
    }

    // Fetch all required data from APIs (resilient to individual failures)
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          billingApi.getServiceFilters(),
          billingApi.getCoupons(currentStore.id),
          servicesApi.getAll(currentStore.id),
          productsApi.getProducts(currentStore.id),
          membershipsApi.getAll(currentStore.id),
          staffApi.getStaff(currentStore.id),
          billingApi.getHeldBills(currentStore.id),
          getStoreProfile(currentStore.id)
        ]);

        const [
          serviceFiltersRes,
          couponsRes,
          servicesRes,
          productsRes,
          membershipsRes,
          staffRes,
          heldInvoicesRes,
          storeProfileRes
        ] = results.map(r => (r.status === 'fulfilled' ? r.value : null));

        if (serviceFiltersRes) setServiceFilters(serviceFiltersRes);
        if (couponsRes) setCoupons(couponsRes);

        // Map API responses to arrays of names for dropdowns with robust shapes
        const svcRaw = (servicesRes?.data?.services || servicesRes?.services || servicesRes?.data || []);
        const prodRaw = (productsRes?.data?.products || productsRes?.products || productsRes?.data || []);
        const membRaw = (membershipsRes?.data?.memberships || membershipsRes?.memberships || membershipsRes?.data || []);

        const svcCatalog = svcRaw.map(s => ({
          id: s.id,
          name: s.name,
          price: Number(s.price || 0),
          gst: Number(s.tax_prcnt || s.tax || 0)
        })).filter(x => x.name);
        const prodCatalog = prodRaw.map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.selling_price ?? p.price ?? 0),
          gst: Number(p.tax_prcnt || p.tax || 0)
        })).filter(x => x.name);
        const membCatalog = (Array.isArray(membRaw) ? membRaw : []).map(m => ({
          id: m?.id ?? m,
          name: typeof m === 'string' ? m : m?.name,
          price: Number((typeof m === 'object' ? (m.price ?? 0) : 0)),
          gst: Number((typeof m === 'object' ? (m.tax_prcnt ?? m.tax ?? 0) : 0))
        })).filter(x => x.name);

        const svcNames = svcCatalog.map(x => x.name);
        const prodNames = prodCatalog.map(x => x.name);
        const membNames = membCatalog.map(x => x.name);

        setServicesCatalog(svcCatalog);
        setProductsCatalog(prodCatalog);
        setMembershipsCatalog(membCatalog);
        setServices(svcNames);
        setProducts(prodNames);
        setMemberships(membNames);
        // Map backend staff to artists list expected by ArtistSelector
        const normalizedArtists = (staffRes && staffRes.success ? staffRes.data : [])
          .map(s => ({ id: String(s.id || s.staffId), name: s.name || '' }))
          .filter(a => a.id && a.name);
        setArtists(normalizedArtists);
        if (heldInvoicesRes) setHeldInvoices(heldInvoicesRes?.data?.held || heldInvoicesRes || []);
        // Determine tax inclusivity from store profile: 'Excluding' => not inclusive; otherwise inclusive
        try {
          const storeProfile = storeProfileRes;
          const taxBilling = (storeProfile && (storeProfile.tax || storeProfile.tax_billing)) || 'Excluding';
          setIsTaxInclusive(String(taxBilling).toLowerCase() !== 'excluding');
        } catch (e) {
          console.warn('Unable to determine tax_billing from store profile; defaulting to Excluding');
          setIsTaxInclusive(false);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      }
    };
    
    fetchData();
  }, [currentStore?.id]); // Add dependency on currentStore.id

  // Prefill from navigation state (runs whenever navigation state changes)
  useEffect(() => {
    const mode = navState.mode || 'manual';
    if (mode !== 'prefill' && mode !== 'edit') {
      return; // manual mode: keep defaults
    }

    // Handle edit mode with complete bill data
    if (mode === 'edit' && navState.billData) {
      
      const bill = navState.billData;
      const customer = bill.customer || navState.customerDetails || {};
      const items = bill.items || bill.line_items || navState.billingItems || [];
      const payments = bill.payments || navState.paymentInfo?.payments || [];
      
      
      // Set customer details - try to fetch complete details by ID if available
      if (customer.id) {
        const fallbackData = {
          id: customer.id,
          name: customer.name || bill.customer_name || navState.customerName || '',
          gender: customer.gender || '',
          address: customer.address || '',
          loyaltyPoints: customer.loyaltyPoints || bill.loyalty_points || '0',
          walletBalance: customer.walletBalance || bill.wallet_balance || '0.00',
          paymentDues: bill.dues || bill.balance || '0.00',
          advanceAmount: customer.advanceAmount || bill.advance_amount || 0,
          referralCode: customer.referralCode || '',
          membership: customer.membership || '',
          memberships: customer.memberships || [],
          packages: customer.packages || '',
          lastVisit: customer.lastVisit || '',
          birthday: customer.birthday || '',
          anniversary: customer.anniversary || ''
        };

        // Parse phone number for fallback
        const rawPhone = customer.phoneNumber || customer.phone || customer.number || customer.contactNo || 
                        bill.customer_phone || navState.customerPhone || '';
        if (rawPhone) {
          const digits = String(rawPhone).replace(/\D/g, '');
          fallbackData.number = digits;
          fallbackData.contactNo = rawPhone;
        }

        // Use async function to handle customer fetch
        (async () => {
          const customerDetails = await fetchCustomerById(customer.id, fallbackData);
          setCustomerDetails(prev => ({ ...prev, ...customerDetails }));
        })();
      } else {
        // Fallback to basic customer data if no ID
        const rawPhone = customer.phoneNumber || customer.phone || customer.number || customer.contactNo || 
                        bill.customer_phone || navState.customerPhone || '';
        const customerName = customer.name || bill.customer_name || navState.customerName || '';
        
        if (rawPhone || customerName) {
          const digits = String(rawPhone).replace(/\D/g, '');
          setCustomerDetails(prev => ({
            ...prev,
            id: customer.id,
            number: digits,
            contactNo: rawPhone,
            name: customerName,
            gender: customer.gender || '',
            address: customer.address || '',
            loyaltyPoints: customer.loyaltyPoints || bill.loyalty_points || '0',
            walletBalance: customer.walletBalance || bill.wallet_balance || '0.00',
            paymentDues: bill.dues || bill.balance || '0.00',
            advanceAmount: customer.advanceAmount || bill.advance_amount || 0,
            referralCode: customer.referralCode || '',
            membership: customer.membership || '',
            memberships: customer.memberships || [],
            packages: customer.packages || '',
            lastVisit: customer.lastVisit || '',
            birthday: customer.birthday || '',
            anniversary: customer.anniversary || ''
          }));
          
        }
      }

      // Set billing items - check multiple sources
      
      // Try multiple sources for items (prioritize to avoid duplication)
      const itemsToUse = items.length > 0 ? items : 
                        (navState.items && navState.items.length > 0) ? navState.items :
                        (bill.billingItems && bill.billingItems.length > 0) ? bill.billingItems :
                        (navState.billingItems && navState.billingItems.length > 0) ? navState.billingItems : [];
      
      
      if (itemsToUse.length > 0) {
        const mapped = itemsToUse.map((it, idx) => {
          // Normalize the type to match frontend expectations
          const rawType = it.type || it.item_type || 'service';
          const normalizedType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase(); // service -> Service
          
          return {
            id: it.id || `item-${Date.now()}-${idx}`,
            type: normalizedType,
            name: it.name || it.item_name || '',
            qty: it.qty || it.quantity || 1,
            price: Number(it.price || it.unit_price || it.line_total || it.base_amount || 0),
            discount: Number(it.discount_value || it.discount_amount || it.discount || 0),
            discountType: it.discount_type || 'percent',
            gst: it.cgst_rate && it.sgst_rate ? (Number(it.cgst_rate) + Number(it.sgst_rate)) : 
                 it.cgst_amount && it.sgst_amount ? (Number(it.cgst_amount) + Number(it.sgst_amount)) :
                 (Number(it.tax) || 18),
            artists: (it.staff_id ? [{ id: String(it.staff_id), name: it.staff_name || 'Artist' }] : []),
            isLoadedItem: true // Mark as loaded item to preserve price display
          };
        });
        setBillingItems(mapped);
        
        // Set flag to indicate this is a loaded invoice (edit mode)
        setIsLoadedInvoice(true);
        
        // Verify the items were set with a timeout
        setTimeout(() => {
        }, 100);
      } else {
        setBillingItems([]);
      }

      // Set payments (exclude advance payments - advance should only come from customer data)
      if (payments.length > 0) {
        const mappedPayments = payments
          .filter(p => (p.mode || p.payment_mode || p.type || 'cash') !== 'advance') // Exclude advance payments
          .map((p, idx) => ({
            id: p.id || `pay-${Date.now()}-${idx}`,
            mode: p.mode || p.payment_mode || p.type || 'cash',
            amount: Number(p.amount || 0),
            timestamp: p.payment_timestamp || p.timestamp || new Date().toISOString()
          }));
        setPayments(mappedPayments);
      }

      // Set extra discount and adjust total if available
      if (bill.bill_discount || bill.discount) {
        setExtraDiscount(Number(bill.bill_discount || bill.discount || 0));
      }
      if (bill.adjustment || bill.adjust_total) {
        setAdjustTotal(Number(bill.adjustment || bill.adjust_total || 0));
      }

      // Set date/time from bill
      const billDate = bill.billing_date || bill.date || bill.created_at;
      if (billDate) {
        const dateStr = String(billDate).slice(0, 10);
        const timeStr = bill.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        setDateTime({ date: dateStr, time: timeStr });
      }

      return;
    }

    // Handle prefill mode (existing logic)
    // Extract phone from multiple possible keys and normalize to digits
    const rawPhone = navState.customerPhone || navState.phoneNumber || navState.contactNo || navState.number;
    if (rawPhone) {
      const digits = String(rawPhone).replace(/\D/g, '');
      setCustomerDetails(prev => ({
        ...prev,
        number: digits,
        contactNo: digits,
        name: navState.customerName || prev.name
      }));
    }

    // Map items with robust fallbacks
    if (Array.isArray(navState.items) && navState.items.length) {
      const mapped = navState.items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        type: it.type || 'Service',
        name: it.name || it.service_name || it.serviceName || '',
        qty: it.qty || 1,
        price: Number(it.price ?? it.unit_price ?? it.unitPrice ?? 0),
        discount: Number(it.discount || 0),
        discountType: it.discountType || 'percent',
        gst: Number(it.gst ?? it.tax ?? 18),
        // Store as objects with id/name to satisfy ArtistSelector immediately; names reconciled later when artists load
        artists: (it.artists || (it.staffId ? [it.staffId] : (it.staff_id ? [it.staff_id] : [])))
          .map(val => {
            if (typeof val === 'object' && val !== null) {
              const id = String(val.id ?? '');
              return { id, name: val.name || 'Artist' };
            }
            return { id: String(val), name: 'Artist' };
          })
      }));
      setBillingItems(mapped);
    }

    // Apply date/time if provided
    if (navState.date || navState.time) {
      setDateTime(prev => ({
        date: navState.date || prev.date,
        time: navState.time || prev.time
      }));
    }
  }, [location.state]);

  // Auto-fetch customer by phone when the billing page has a contact number (from booking/prefill/manual)
  useEffect(() => {
    if (!currentStore?.id) return;
    const src = customerDetails?.contactNo || customerDetails?.number || '';
    const digits = String(src).replace(/\D/g, '');
    if (digits.length < 10) return;
    const phone = digits.length === 10 ? `+91${digits}` : `+${digits}`;
    if (lastFetchedPhoneRef.current === phone) return;
    lastFetchedPhoneRef.current = phone;

    (async () => {
      try {
        const res = await customersApi.getByPhone(currentStore.id, phone);
        const cust = res?.data?.customer || res?.customer || null;
        if (res?.success && cust) {
          const phoneDigits = String(cust.phoneNumber || '').replace(/\D/g, '');
          const normalizedNumber = phoneDigits.replace(/^91/, '');
          const toDM = (s) => {
            if (!s) return '';
            if (/^\d{2}\/\d{2}$/.test(s)) return s;
            const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (m) return `${m[3]}/${m[2]}`;
            const d = new Date(s);
            if (!isNaN(d.getTime())) {
              const dd = String(d.getDate()).padStart(2, '0');
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              return `${dd}/${mm}`;
            }
            return s;
          };
          const formatLastVisit = (s) => {
            if (!s) return '';
            const d = new Date(s);
            if (isNaN(d.getTime())) return String(s);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            const HH = String(d.getHours()).padStart(2, '0');
            const MM = String(d.getMinutes()).padStart(2, '0');
            return `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
          };
          const memberships = Array.isArray(cust.memberships) ? cust.memberships : [];
          const packages = Array.isArray(cust.servicePackages) ? cust.servicePackages : [];
          setCustomerDetails(prev => ({
            ...prev,
            id: cust.id || prev.id,
            name: cust.name || prev.name,
            gender: cust.gender || prev.gender,
            number: normalizedNumber || digits,
            contactNo: cust.phoneNumber || phone,
            address: cust.address || prev.address,
            loyaltyPoints: cust.loyaltyPoints ?? prev.loyaltyPoints,
            walletBalance: cust.walletBalance ?? prev.walletBalance,
            paymentDues: cust.dues ?? prev.paymentDues,
            advanceAmount: cust.advanceAmount ?? prev.advanceAmount,
            lastVisit: formatLastVisit(cust.lastVisit) || prev.lastVisit,
            referralCode: cust.referralCode || prev.referralCode,
            memberships: memberships,
            membership: memberships.map(m => (typeof m === 'string' ? m : (m?.name || ''))).filter(Boolean).join(', '),
            packages: packages.map(p => (typeof p === 'string' ? p : (p?.name || ''))).filter(Boolean).join(', '),
            birthday: toDM(cust.birthday) || prev.birthday,
            anniversary: toDM(cust.anniversary) || prev.anniversary,
          }));
        }
      } catch (err) {
        console.warn('Customer auto-fetch failed:', err?.message || err);
      }
    })();
  }, [currentStore?.id, customerDetails?.contactNo, customerDetails?.number]);

  // Debug billingItems changes
  useEffect(() => {
    if (billingItems.length === 0) {
    } else {
      billingItems.forEach((item, idx) => {
      });
    }
  }, [billingItems]);

  // Once artists are loaded, reconcile any prefilled artist IDs into artist objects for ArtistSelector
  useEffect(() => {
    if (!artists || artists.length === 0) return;
    setBillingItems(prevItems => {
      let changed = false;
      const mapped = prevItems.map(item => {
        const current = item.artists || [];
        // Map each artist entry to an object {id, name}
        const reconciled = current.map(a => {
          if (typeof a === 'object' && a !== null) {
            const id = String(a.id ?? '');
            if (!id) return a;
            const found = artists.find(ar => String(ar.id) === id);
            if (!a.name && found) return found;
            return { id, name: a.name || (found ? found.name : '') };
          }
          const id = String(a);
          const found = artists.find(ar => String(ar.id) === id);
          return found ? found : { id, name: 'Artist' };
        });
        // Determine if anything changed (compare by ids and names)
        const isSameLength = current.length === reconciled.length;
        const isSame = isSameLength && current.every((orig, idx) => {
          const o = typeof orig === 'object' && orig !== null ? { id: String(orig.id ?? ''), name: orig.name || '' } : { id: String(orig), name: '' };
          const r = reconciled[idx];
          return String(o.id) === String(r.id) && (o.name || '') === (r.name || '');
        });
        if (!isSame) {
          changed = true;
          return { ...item, artists: reconciled };
        }
        return item;
      });
      return changed ? mapped : prevItems;
    });
  }, [artists]);

  // Helper to compute per-item amounts based on tax settings
  const computeItemAmounts = (item) => {
    const qty = Number(item.qty || 0);
    const price = Number(item.price || 0);
    const rate = Number(item.gst || 0);
    const basePrice = price * qty;

    // Calculate discount amount: percent on base price or flat
    const discountAmount = item.discountType === 'percent'
      ? (basePrice * (Number(item.discount || 0) / 100))
      : Number(item.discount || 0);

    if (!applyTax || rate <= 0) {
      // No tax: total = price - discount
      return {
        baseIncl: basePrice,
        baseExcl: basePrice,
        discountAmount,
        taxAmount: 0,
        total: Math.max(0, basePrice - discountAmount)
      };
    }

    // Calculate tax on the full price (before discount)
    let taxAmount;
    let baseExcl;
    let baseIncl;

    if (isTaxInclusive) {
      // Price includes tax: extract exclusive base and calculate tax
      baseIncl = basePrice;
      baseExcl = rate > 0 ? (basePrice / (1 + rate / 100)) : basePrice;
      taxAmount = baseIncl - baseExcl;
    } else {
      // Price excludes tax: calculate tax on full price
      baseExcl = basePrice;
      taxAmount = basePrice * (rate / 100);
      baseIncl = basePrice + taxAmount;
    }

    // User requested formula: price + total tax - discount
    const total = Math.max(0, basePrice + taxAmount - discountAmount);

    return { 
      baseIncl, 
      baseExcl, 
      discountAmount, 
      taxAmount, 
      total 
    };
  };

  // Calculate totals whenever billing items or payments change
  useEffect(() => {
    calculateBillingTotals();
  }, [billingItems, payments, extraDiscount, applyTax, isTaxInclusive, customerDetails?.advanceAmount]);

  const calculateBillingTotals = () => {
    // Subtotal (sum of price * qty)
    const subTotal = billingItems.reduce((total, item) => total + (Number(item.price || 0) * Number(item.qty || 0)), 0);
    setCalculatedSubTotal(subTotal);

    // Discount (based on item type and tax inclusion extraction)
    const itemDiscount = billingItems.reduce((acc, item) => acc + computeItemAmounts(item).discountAmount, 0);
    setTotalItemDiscount(itemDiscount);

    // GST amount (based on tax inclusion/exclusion and toggle)
    const gst = billingItems.reduce((acc, item) => acc + computeItemAmounts(item).taxAmount, 0);
    setTotalGST(gst);

    // Total after extra discount (should include tax)
    const totalBeforeExtra = billingItems.reduce((acc, item) => acc + computeItemAmounts(item).total, 0);
    const total = Math.max(0, totalBeforeExtra - Number(extraDiscount || 0));
    setCalculatedTotal(total);

    // Calculate paid amount from payments (including advance if available)
    const advance = Number(customerDetails?.advanceAmount || 0);
    const regularPayments = payments.reduce((total, payment) => total + Number(payment.amount), 0);
    const totalPaidWithAdvance = regularPayments + advance;
    setTotalPaid(totalPaidWithAdvance);

    // Calculate dues
    const calculatedDues = Math.max(0, total - totalPaidWithAdvance);
    setTotalDues(calculatedDues);
    
    // Debug logging for edit mode
    if (navState.mode === 'edit') {
    }
  };

  // Keep adjustTotal and extraDiscount in sync against itemTotalBase (subtotal - couponDiscount)
  useEffect(() => {
    // Base for Adjust Total should consider tax: use total including tax before extra discount
    const subtotal = computeSubtotal();
    const couponDisc = computeCouponDiscount(subtotal);
    const totalBeforeExtra = computeTotalBeforeExtra();
    const baseInclTax = Math.max(0, totalBeforeExtra - couponDisc);
    // Clamp extraDiscount to base including tax
    setExtraDiscount(prev => clamp(Number(prev || 0), 0, baseInclTax));
    // Enforce Adjust Total = baseInclTax - extraDiscount
    setAdjustTotal(clamp(baseInclTax - Number(extraDiscount || 0), 0, baseInclTax));
  }, [billingItems, selectedCoupons, applyTax, isTaxInclusive]);

  const handleExtraDiscountChange = (val) => {
    const n = Number(val || 0);
    const subtotal = computeSubtotal();
    const couponDisc = computeCouponDiscount(subtotal);
    const totalBeforeExtra = computeTotalBeforeExtra();
    const baseInclTax = Math.max(0, totalBeforeExtra - couponDisc);
    const clamped = clamp(n, 0, baseInclTax);
    setExtraDiscount(clamped);
    setAdjustTotal(baseInclTax - clamped);
  };

  const handleAdjustTotalChange = (val) => {
    const n = Number(val || 0);
    const subtotal = computeSubtotal();
    const couponDisc = computeCouponDiscount(subtotal);
    const totalBeforeExtra = computeTotalBeforeExtra();
    const baseInclTax = Math.max(0, totalBeforeExtra - couponDisc);
    const clamped = clamp(n, 0, baseInclTax);
    setAdjustTotal(clamped);
    setExtraDiscount(baseInclTax - clamped);
  };

  const calculateItemTotal = (item) => {
    if (!item) return 0;
    const { total } = computeItemAmounts(item);
    return total || 0;
  };

  // Helpers to resolve catalog id and staff from current catalogs/items
  const resolveCatalogId = (item) => {
    if (item?.catalogId) return item.catalogId;
    
    // Normalize type for matching
    const itemType = String(item.type || '').toLowerCase();
    const catalog = itemType === 'service' ? servicesCatalog
                  : itemType === 'product' ? productsCatalog
                  : itemType === 'membership' || itemType === 'package' ? membershipsCatalog
                  : servicesCatalog; // default to services
    
    const found = (catalog || []).find(x => x.name === item.name);
    
    // Debug logging if no ID found
    if (!found?.id) {
      console.warn('Could not resolve catalog ID for item:', {
        itemName: item.name,
        itemType: item.type,
        normalizedType: itemType,
        catalogLength: catalog?.length || 0,
        availableNames: (catalog || []).map(x => x.name).slice(0, 5)
      });
    }
    
    return found?.id ?? null;
  };

  const resolvePrimaryStaffId = (item) => {
    const arr = Array.isArray(item?.artists) ? item.artists : [];
    const first = arr[0];
    if (!first) return null;
    if (typeof first === 'object') return String(first.id ?? '');
    return String(first);
  };

  const toISOFromDateTime = (dateStr, timeStr) => {
    try {
      return new Date(`${dateStr}T${timeStr || '00:00'}:00`).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  // Normalize UI payment modes to backend-accepted values
  const normalizePaymentMode = (mode) => {
    const m = String(mode || '').trim().toLowerCase();
    if (!m) return 'none';
    if (m.includes('cash')) return 'cash';
    if (m.includes('upi')) return 'upi';
    if (m.includes('wallet') || m.includes('loyalty') || m.includes('points')) return 'wallet';
    if (m.includes('card') || m.includes('debit') || m.includes('credit')) return 'card';
    return 'cash';
  };

  // Build payload for backend "save bill/invoice"
  const buildBillingPayload = () => {

    // Customer: send id if found via lookup, else send details
    const foundCustomerId = customerDetails?.id || customerDetails?.customerId || customerDetails?.raw?.id;
    const digits = String(customerDetails?.number || customerDetails?.contactNo || '').replace(/\D/g, '');
    const phoneE164 = digits.length === 10 ? `+91${digits}` : (digits ? `+${digits}` : '');

    const customerPart = foundCustomerId
      ? { customer_id: String(foundCustomerId) }
      : {
          customer: {
            name: customerDetails?.name || '',
            gender: customerDetails?.gender || 'male',
            contact_no: phoneE164 || '',
            address: customerDetails?.address || '',
            ...(customerDetails?.birthday && { birthday: customerDetails.birthday }),
            ...(customerDetails?.anniversary && { anniversary: customerDetails.anniversary })
          }
        };

    // Coupons
    const couponCodes = (selectedCoupons || [])
      .map(c => c.code || c.id || c.name)
      .filter(Boolean);
    const couponCode = couponCodes[0] || null;

    // Items (service/product/membership)
    const items = (billingItems || [])
      .filter(it => it.name && it.name.trim() !== '') // Filter out items without names
      .map((it, idx) => {
        const itemAmounts = computeItemAmounts(it);
        
        // Use display price (same as shown in billing table)
        const displayPrice = getDisplayPrice(it);
        
        // Calculate GST amounts (split CGST and SGST equally)
        const totalGstAmount = itemAmounts.taxAmount || 0;
        const cgstAmount = +(totalGstAmount / 2).toFixed(2);
        const sgstAmount = +(totalGstAmount / 2).toFixed(2);
        
        return {
          line_no: idx + 1,
          type: String(it.type || 'Service').toLowerCase(),
          id: resolveCatalogId(it),
          staff_id: resolvePrimaryStaffId(it),
          qty: Number(it.qty || 1),
          price: Number(displayPrice || 0),
          discount_type: it.discountType || 'percent',
          discount_value: Number(it.discount || 0),
          cgst: cgstAmount,
          sgst: sgstAmount
        };
      })
      .filter(item => item.id) // Filter out items without valid catalog IDs
      .reduce((acc, item) => {
        // Deduplicate items with same catalog ID by merging quantities
        const existingIndex = acc.findIndex(existing => existing.id === item.id && existing.staff_id === item.staff_id);
        if (existingIndex >= 0) {
          // Merge quantities and recalculate amounts
          const existing = acc[existingIndex];
          const combinedQty = existing.qty + item.qty;
          acc[existingIndex] = {
            ...existing,
            qty: combinedQty,
            cgst: +(existing.cgst + item.cgst).toFixed(2),
            sgst: +(existing.sgst + item.sgst).toFixed(2)
          };
        } else {
          acc.push(item);
        }
        return acc;
      }, [])
      .map((item, idx) => ({ ...item, line_no: idx + 1 })); // Renumber line items

    // Payments (include advance amount if available)
    const advance = Number(customerDetails?.advanceAmount || 0);
    const allPayments = [...(payments || [])];
    
    console.log('Payment processing:', {
      regularPayments: payments?.length || 0,
      advanceFromCustomer: advance,
      totalAdvanceUsed: advance
    });
    
    // Add advance as a payment if it exists (only from customer data, not from saved payments)
    if (advance > 0) {
      allPayments.push({
        mode: 'advance',
        amount: advance,
        reference: null,
        timestamp: new Date().toISOString()
      });
    }
    
    const totalPaidAmount = allPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const paymentMode =
      allPayments.length === 1 ? normalizePaymentMode(allPayments[0].mode)
      : allPayments.length > 1 ? 'split'
      : 'none';

    // Timestamps
    const billingTs = toISOFromDateTime(dateTime?.date, dateTime?.time);
    const defaultPaymentTs = new Date().toISOString();

    return {
      ...customerPart,
      coupon_code: couponCode,
      coupon_codes: couponCodes,
      referral_code: customerDetails?.referralCode || customerDetails?.refrerralCode || null,
      items,
      discount: Number(extraDiscount || 0),
      payment_mode: paymentMode,
      payment_amount: +totalPaidAmount.toFixed(2),
      payments: allPayments.map(p => ({
        mode: p.mode === 'advance' ? 'advance' : normalizePaymentMode(p.mode),
        amount: Number(p.amount || 0),
        reference: p.reference || null,
        payment_timestamp: p.timestamp ? new Date(p.timestamp).toISOString() : defaultPaymentTs
      })),
      billing_timestamp: billingTs
    };
  };

  // Enrich items for invoice rendering (carry per-line totals from Billing)
  const enrichItemsForInvoice = () => {
    const enriched = (billingItems || []).map(it => {
      const a = computeItemAmounts(it);
      return {
        ...it,
        totalPrice: +Number(a.total || 0).toFixed(2),
        line_total: +Number(a.total || 0).toFixed(2),
        discount_amount: +Number(a.discountAmount || 0).toFixed(2),
        discount_percent: it.discountType === 'percent' ? Number(it.discount || 0) : undefined,
        discount_value: it.discountType === 'flat' ? Number(it.discount || 0) : undefined
      };
    });
    setInvoiceItems(enriched);
  };

  const openClientHistory = () => setIsClientHistoryOpen(true);
  const openDuesHistory = () => setIsDuesHistoryOpen(true);
  const closeDuesHistory = () => setIsDuesHistoryOpen(false);
  const closeClientHistory = () => setIsClientHistoryOpen(false);
  const openNotesModal = () => setIsNotesModalOpen(true);
  const closeNotesModal = () => setIsNotesModalOpen(false);
  const openLoadModal = () => setIsLoadModalOpen(true);
  const closeLoadModal = () => setIsLoadModalOpen(false);
  const openArtistRevenueModal = (itemId) => {
    setEditingItemId(itemId);
    setIsArtistModalOpen(true);
  };

  // Handle customer data changes
  const handleClientDataChange = async (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    // Keep contactNo and number in sync so the input reflects edits immediately
    if (name === 'contactNo') {
      setCustomerDetails(prev => ({ ...prev, contactNo: val, number: String(val).replace(/\D/g, '') }));
    } else if (name === 'number') {
      setCustomerDetails(prev => ({ ...prev, number: val, contactNo: val }));
    } else {
      setCustomerDetails(prev => ({ ...prev, [name]: val }));
    }
    // If phone number field edited, try to fetch customer by phone when it looks complete
    if ((name === 'contactNo' || name === 'number') && currentStore?.id) {
      const digits = String(val).replace(/\D/g, '');
      // Assume 10-digit domestic; prefix +91 (or keep as digits if backend expects exact)
      if (digits.length >= 10) {
        const phone = digits.length === 10 ? `+91${digits}` : `+${digits}`;
        try {
          const res = await customersApi.getByPhone(currentStore.id, phone);
          const cust = res?.data?.customer || res?.customer || null;
          if (res?.success && cust) {
            const phoneDigits = String(cust.phoneNumber || '').replace(/\D/g, '');
            const normalizedNumber = phoneDigits.replace(/^91/, '');
            const toDM = (s) => {
              if (!s) return '';
              if (/^\d{2}\/\d{2}$/.test(s)) return s;
              const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
              if (m) return `${m[3]}/${m[2]}`;
              const d = new Date(s);
              if (!isNaN(d.getTime())) {
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                return `${dd}/${mm}`;
              }
              return s;
            };
            const memberships = Array.isArray(cust.memberships) ? cust.memberships : [];
            const packages = Array.isArray(cust.servicePackages) ? cust.servicePackages : [];
            const formatLastVisit = (s) => {
              if (!s) return '';
              const d = new Date(s);
              if (isNaN(d.getTime())) return String(s);
              const dd = String(d.getDate()).padStart(2, '0');
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const yyyy = d.getFullYear();
              const HH = String(d.getHours()).padStart(2, '0');
              const MM = String(d.getMinutes()).padStart(2, '0');
              return `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
            };
            setCustomerDetails(prev => ({
              ...prev,
              id: cust.id || prev.id,
              name: cust.name || prev.name,
              gender: cust.gender || prev.gender,
              number: normalizedNumber || digits,
              contactNo: cust.phoneNumber || phone,
              address: cust.address || prev.address,
              loyaltyPoints: cust.loyaltyPoints ?? prev.loyaltyPoints,
              walletBalance: cust.walletBalance ?? prev.walletBalance,
              paymentDues: cust.dues ?? prev.paymentDues,
              advanceAmount: (cust.advanceAmount ?? prev.advanceAmount ?? 0),
              lastVisit: formatLastVisit(cust.lastVisit) || prev.lastVisit,
              referralCode: cust.referralCode || prev.referralCode,
              memberships: memberships,
              membership: memberships.map(m => (typeof m === 'string' ? m : (m?.name || ''))).filter(Boolean).join(', '),
              packages: packages.map(p => (typeof p === 'string' ? p : (p?.name || ''))).filter(Boolean).join(', '),
              birthday: toDM(cust.birthday) || prev.birthday,
              anniversary: toDM(cust.anniversary) || prev.anniversary,
            }));
          } else {
            // Customer not found - reset to default values but keep the current contact numbers
            setCustomerDetails(prev => ({
              ...initialClientData,
              number: prev.number,
              contactNo: prev.contactNo,
            }));
          }
        } catch (err) {
          console.warn('Customer lookup failed:', err?.message || err);
          // Reset to default values on error but keep the current contact numbers
          setCustomerDetails(prev => ({
            ...initialClientData,
            number: prev.number,
            contactNo: prev.contactNo,
          }));
        }
      }
    }
  };

  // Handler for date and time changes
  const handleDateTimeChange = (e) => {
    const { name, value } = e.target;
    setDateTime(prev => ({ ...prev, [name]: value }));
  };

  // Handler for service filter changes
  const handleServiceFilterChange = (e) => {
    setSelectedServiceFilter(e.target.value);
  };

  // Handler for coupon selection
  const handleCouponChange = (e) => {
    const couponId = e.target.value;
    if (!couponId) return;
    
    const selectedCoupon = coupons.find(c => c.id === couponId);
    if (selectedCoupon) {
      setSelectedCoupons(prev => [...prev, selectedCoupon]);
    }
  };

  // Handler for coupon removal
  const removeCoupon = (couponId) => {
    setSelectedCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
  };

  // Get name options for dropdowns based on item type
  const getNameOptions = (itemType) => {
    const raw = itemType === 'Service' ? services : itemType === 'Product' ? products : (itemType === 'Membership' || itemType === 'Package') ? memberships : [];
    // Map arrays of strings or objects to a unique array of names (strings)
    const names = (raw || []).map(x => (typeof x === 'string' ? x : (x && x.name) ? x.name : '')).filter(Boolean);
    return Array.from(new Set(names));
  };

  const handleInvoiceClose = () => setShowInvoice(false);

  const handleSavePayment = (paymentData) => {
    setPayments(prev => [...prev, { ...paymentData, id: `pay-${Date.now()}` }]);
  };

  const handleClearAdvance = () => {
    setCustomerDetails(prev => ({ ...prev, advanceAmount: 0 }));
  };

  const handleHoldBill = async () => {
    if (billingItems.length === 0) {
      showWarning('Please add at least one item to hold.');
      return;
    }
    try {
      const payload = buildBillingPayload();
      if (typeof billingApi.holdBill === 'function') {
        await billingApi.holdBill(currentStore?.id, payload);
        if (typeof billingApi.getHeldBills === 'function') {
          const refreshed = await billingApi.getHeldBills(currentStore?.id);
          setHeldInvoices(refreshed?.data?.held || refreshed || []);
        }
        showSuccess('Bill put on hold.');
      } else {
        console.warn('billingApi.holdBill not implemented. Payload:', payload);
        showInfo('Hold API not implemented yet.');
      }
    } catch (err) {
      console.error('Hold bill failed:', err);
      showError('Failed to hold bill.');
    }
  };

  const handleSaveBill = async () => {
    if (billingItems.length === 0) {
      showWarning("Please add at least one item to the bill.");
      return;
    }
    const payload = buildBillingPayload();
    // Basic validations to prevent avoidable 400s
    const hasCustomerId = !!payload.customer_id;
    const hasCustomerObj = !!payload.customer;
    if (!hasCustomerId && hasCustomerObj) {
      const c = payload.customer || {};
      // Accept E.164 (+xxxxxxxxxxx) or plain 10-15 digits
      const phoneOk = typeof c.contact_no === 'string' && /^[+]?\d{10,15}$/.test(c.contact_no);
      if (!c.name || !phoneOk) {
        showWarning('Please enter customer name and a valid phone number with country code (e.g., +919876543210).');
        return;
      }
    }
    // Ensure each item has a catalog id resolved
    const itemsWithoutIds = (payload.items || []).filter(it => !it.id);
    if (itemsWithoutIds.length > 0) {
      const missingItems = itemsWithoutIds.map(it => `${it.type}: ${billingItems[it.line_no - 1]?.name || 'Unknown'}`).join(', ');
      showError(`Some items are missing their catalog IDs: ${missingItems}. Please ensure these items exist in your catalog.`);
      console.error('Items missing catalog IDs:', itemsWithoutIds, 'Available catalogs:', {
        services: servicesCatalog?.length || 0,
        products: productsCatalog?.length || 0, 
        memberships: membershipsCatalog?.length || 0
      });
      return;
    }
    try {
      if (typeof billingApi.saveBill === 'function') {
        const response = await billingApi.saveBill(currentStore?.id, payload);
        // Store the raw response for Invoice component
        const billData = response?.data?.bill || response?.bill || response?.data || response;
        setSavedBillData(billData);
      } else {
        console.warn('billingApi.saveBill not implemented. Payload:', payload);
        // Fallback: use current state data for Invoice if API not available
        setSavedBillData(null);
      }
      setShowInvoice(true);
    } catch (e) {
      console.error('Save bill failed:', e);
      const msg = e?.message || e?.data?.message || 'Failed to save bill.';
      const firstErr = Array.isArray(e?.data?.errors) && e.data.errors.length ? `\n${e.data.errors[0].field}: ${e.data.errors[0].message}` : '';
      showError(`${msg}${firstErr}`);
    }
  };

  // Add a customer note using API
  const handleAddCustomerNote = async () => {
    try {
      const storeId = currentStore?.id;
      const customerId = customerDetails?.id || customerDetails?.customerId || customerDetails?.raw?.id;
      if (!storeId || !customerId) {
        showWarning('Select a customer before adding a note.');
        return;
      }
      const noteText = String(newNote || '').trim();
      if (!noteText) return;
      await customersApi.addNote(storeId, customerId, { note: noteText, starred: newNoteStarred });
      setNewNote('');
      setNewNoteStarred(false);
      // Optionally: refresh notes panel if open in future enhancement
    } catch (e) {
      console.error('Failed to add note:', e);
      showError(e?.message || 'Failed to add note');
    }
  };

  // Reusable function to fetch customer by ID
  const fetchCustomerById = async (customerId, fallbackData = {}) => {
    if (!customerId || !currentStore?.id) {
      console.warn('⚠️ Missing customerId or storeId for customer fetch');
      return fallbackData;
    }

    try {
      
      // Create direct API call to fetch customer by ID
      const apiRequest = async (url, options) => {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      };

      const authHeader = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
      };

      const withCors = (options = {}) => ({
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });

      // Fetch customer by ID using direct API call
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const API_VERSION = '/api/v1';
      const FULL_API_URL = import.meta.env.DEV ? API_VERSION : `${API_BASE_URL}${API_VERSION}`;
      
      const customerResponse = await apiRequest(
        `${FULL_API_URL}/customers/${currentStore.id}/${customerId}`,
        withCors({
          method: 'GET',
          headers: { ...authHeader() }
        })
      );


      if (customerResponse?.success && customerResponse?.data?.customer) {
        const customer = customerResponse.data.customer;
        const phoneDigits = String(customer.phoneNumber || '').replace(/\D/g, '');
        const normalizedNumber = phoneDigits.replace(/^91/, '');
        
        // Helper functions
        const toDM = (s) => {
          if (!s) return '';
          const date = new Date(s);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          return `${day}/${month}`;
        };

        const formatLastVisit = (s) => {
          if (!s) return '';
          const date = new Date(s);
          return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };

        const memberships = Array.isArray(customer.memberships) ? customer.memberships : [];
        const packages = Array.isArray(customer.servicePackages) ? customer.servicePackages : [];
        
        // Return complete customer details
        const customerDetails = {
          id: customer.id,
          name: customer.name || '',
          gender: customer.gender || '',
          number: normalizedNumber || phoneDigits,
          contactNo: customer.phoneNumber || '',
          address: customer.address || '',
          loyaltyPoints: customer.loyaltyPoints ?? '0',
          walletBalance: customer.walletBalance ?? '0.00',
          paymentDues: customer.dues ?? '0.00',
          advanceAmount: customer.advanceAmount ?? 0,
          referralCode: customer.referralCode || '',
          lastVisit: formatLastVisit(customer.lastVisit) || '',
          memberships: memberships,
          membership: memberships.map(m => (typeof m === 'string' ? m : (m?.name || ''))).filter(Boolean).join(', '),
          packages: packages.map(p => (typeof p === 'string' ? p : (p?.name || ''))).filter(Boolean).join(', '),
          birthday: toDM(customer.birthday) || '',
          anniversary: toDM(customer.anniversary) || '',
        };

        console.log('Customer details loaded:', {
          id: customer.id,
          name: customer.name,
          phone: customer.phoneNumber,
          advance: customer.advanceAmount,
          dues: customer.dues
        });

        return customerDetails;
      } else {
        console.warn('⚠️ Customer fetch unsuccessful');
        return fallbackData;
      }
    } catch (error) {
      console.error('❌ Error fetching customer by ID:', error);
      return fallbackData;
    }
  };

  const handleLoadInvoice = async (invoiceId) => {
    try {
      let heldData = null;
      if (typeof billingApi.getHeldBillById === 'function') {
        const res = await billingApi.getHeldBillById(currentStore?.id, invoiceId);
        // Extract held data from nested structure
        heldData = res?.data?.held || res?.data || res || null;
      } else {
        // Fallback to legacy mock loader
        heldData = await billingApi.loadHeldBill(invoiceId);
      }
      
      if (!heldData) return;

      // Extract payload from held data
      const payload = heldData.payload || heldData;

      // Fetch complete customer details using customer_id from payload
      if (payload.customer_id) {
        const fallbackData = {
          id: payload.customer_id,
          referralCode: payload.referral_code || '',
        };
        
        // If we have customer_summary, parse it for fallback
        if (heldData.customer_summary) {
          const summaryMatch = heldData.customer_summary.match(/^(.+?)\s*\(([^)]+)\)$/);
          if (summaryMatch) {
            fallbackData.name = summaryMatch[1].trim();
            const customerPhone = summaryMatch[2].replace(/[^\d+]/g, '');
            const phoneDigits = customerPhone.replace(/^\+91/, '').replace(/^\+/, '').replace(/[^\d]/g, '');
            const displayPhone = phoneDigits.length === 10 ? phoneDigits : customerPhone;
            fallbackData.contactNo = customerPhone;
            fallbackData.number = displayPhone;
          }
        }

        const customerDetails = await fetchCustomerById(payload.customer_id, fallbackData);
        
        // Merge with referral code from payload if not present in customer data
        setCustomerDetails(prev => ({
          ...prev,
          ...customerDetails,
          referralCode: customerDetails.referralCode || payload.referral_code || prev.referralCode,
        }));
      } else if (heldData.customer_summary) {
        // If no customer_id, parse customer_summary
        let customerName = '';
        let customerPhone = '';
        
        const summaryMatch = heldData.customer_summary.match(/^(.+?)\s*\(([^)]+)\)$/);
        if (summaryMatch) {
          customerName = summaryMatch[1].trim();
          customerPhone = summaryMatch[2].replace(/[^\d+]/g, '');
        } else {
          customerName = heldData.customer_summary;
        }

        const phoneDigits = customerPhone.replace(/^\+91/, '').replace(/^\+/, '').replace(/[^\d]/g, '');
        const displayPhone = phoneDigits.length === 10 ? phoneDigits : customerPhone;
        
        setCustomerDetails(prev => ({
          ...prev,
          name: customerName || prev.name,
          contactNo: customerPhone || prev.contactNo,
          number: displayPhone || prev.number,
        }));
        
        console.log('Manual customer details:', {
          name: customerName,
          phone: customerPhone
        });
      }

      // Load date and time from billing_timestamp
      if (payload.billing_timestamp) {
        const billDate = new Date(payload.billing_timestamp);
        const dateStr = billDate.toISOString().slice(0, 10);
        const timeStr = billDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        setDateTime({ date: dateStr, time: timeStr });
      }

      // Transform and load billing items
      const items = payload.items || [];
      console.log('Catalog sizes:', {
        services: servicesCatalog?.length || 0,
        products: productsCatalog?.length || 0, 
        memberships: membershipsCatalog?.length || 0
      });
      
      if (items.length > 0) {
        const transformedItems = await Promise.all(
          items.map(async (item, index) => {
            let itemName = '';
            let itemPrice = Number(item.price || 0); // Use exact price from held invoice (already tax-inclusive)
            let itemGst = 0;
            
            // Calculate GST rate from cgst + sgst amounts (for display purposes only)
            const cgst = Number(item.cgst || 0);
            const sgst = Number(item.sgst || 0);
            const totalGstAmount = cgst + sgst;
            
            // Calculate GST percentage based on the tax amounts relative to taxable base
            if (totalGstAmount > 0 && itemPrice > 0) {
              // If price includes tax, calculate GST rate from tax amount
              const taxableBase = itemPrice - totalGstAmount;
              itemGst = taxableBase > 0 ? Math.round((totalGstAmount / taxableBase) * 100) : 18;
            } else {
              itemGst = 18; // Default GST rate
            }

            // Try to resolve item name from catalogs
            const itemType = String(item.type || 'service').toLowerCase();
            const catalog = itemType === 'service' ? servicesCatalog :
                          itemType === 'product' ? productsCatalog :
                          itemType === 'membership' || itemType === 'package' ? membershipsCatalog :
                          servicesCatalog;
            
            console.log('Item processing:', {
              itemId: item.id,
              catalogType: itemType,
              catalogSize: catalog?.length || 0,
              catalogItems: (catalog || []).slice(0, 3).map(c => ({ id: c.id, name: c.name }))
            });
            
            const found = (catalog || []).find(x => String(x.id) === String(item.id));
            if (found) {
              itemName = found.name;
              // Always use the held invoice price (don't override with catalog price)
              // Only use GST rate from catalog if we couldn't calculate it from tax amounts
              if (itemGst === 18 && found.gst) itemGst = Number(found.gst);
            } else {
              // Fallback: use type and line number as name
              itemName = `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${index + 1}`;
            }

            // Find staff name from artists list
            const staffArtists = [];
            if (item.staff_id && artists.length > 0) {
              const staff = artists.find(a => String(a.id) === String(item.staff_id));
              if (staff) {
                staffArtists.push(staff);
              }
            }

            // Normalize type for frontend
            const normalizedType = itemType.charAt(0).toUpperCase() + itemType.slice(1).toLowerCase();

            return {
              id: `item-${Date.now()}-${index}`,
              type: normalizedType === 'Service' ? 'Service' : 
                    normalizedType === 'Product' ? 'Product' :
                    normalizedType === 'Membership' ? 'Membership' :
                    normalizedType === 'Package' ? 'Package' : 'Service',
              name: itemName,
              qty: Number(item.qty || 1),
              price: itemPrice, // Preserve exact price from held invoice (tax-inclusive)
              discount: Number(item.discount_value || 0),
              discountType: item.discount_type || 'percent',
              gst: itemGst,
              artists: staffArtists,
              catalogId: item.id, // Store original catalog ID
              isLoadedItem: true // Mark as loaded item to preserve price display
            };
          })
        );

        console.log('Transformed items loaded:', transformedItems.length);
        setBillingItems(transformedItems);
      }

      // Load payments (exclude advance payments - advance should only come from customer data)
      if (payload.payments && Array.isArray(payload.payments)) {
        const transformedPayments = payload.payments
          .filter(payment => payment.mode !== 'advance') // Exclude advance payments
          .map((payment, idx) => ({
            id: `pay-${Date.now()}-${idx}`,
            mode: payment.mode || 'cash',
            amount: Number(payment.amount || 0),
            reference: payment.reference,
            timestamp: payment.payment_timestamp || new Date().toISOString()
          }));
        setPayments(transformedPayments);
      }

      // Set extra discount
      if (payload.discount) {
        setExtraDiscount(Number(payload.discount));
      }


      // Set flag to indicate this is a loaded invoice
      setIsLoadedInvoice(true);

      // Close the modal
      closeLoadModal();
    } catch (error) {
      console.error('Error loading invoice:', error);
      showError('Failed to load held invoice. Please try again.');
    }
  };

  // Handle adding a new item to the bill
  const handleAddItem = (type) => {
    const newItem = {
      id: `item-${Date.now()}`,
      type,
      name: '',
      qty: 1,
      price: 0,
      discount: 0,
      discountType: 'percent',
      gst: 18,
      artists: []
    };
    setBillingItems(prev => [...prev, newItem]);
  };

  // Handle changing an item's property
  const handleBillingItemChange = (itemId, property, value) => {
    setBillingItems(prev => {
      return prev.map(item => {
        if (item.id !== itemId) return item;
        const numericProps = ['qty','price','discount','gst'];
        let next = { ...item };
        if (property === 'price') {
          const inputVal = Number(value || 0);
          
          // For loaded items, set price directly without any calculations
          if (item.isLoadedItem || isLoadedInvoice) {
            next.price = inputVal;
          } else {
            // For new items, apply tax inclusive/exclusive logic
            if (isTaxInclusive) {
              const rate = Number(next.gst || 0);
              // store inclusive price, display exclusive
              next.price = inputVal * (1 + (rate / 100));
            } else {
              next.price = inputVal;
            }
          }
        } else {
          next[property] = numericProps.includes(property) ? Number(value) : value;
        }
        // When name changes, auto-fill price and gst from catalogs
        if (property === 'name') {
          const itemType = String(next.type || '').toLowerCase();
          const catalog = itemType === 'service' ? servicesCatalog 
                        : itemType === 'product' ? productsCatalog 
                        : itemType === 'membership' || itemType === 'package' ? membershipsCatalog
                        : servicesCatalog; // default
          const found = (catalog || []).find(x => x.name === value);
          if (found) {
            next.price = Number(found.price || 0);
            next.gst = Number(found.gst || 0);
            next.catalogId = found.id;
          } else {
            console.warn(`No catalog entry found for ${itemType}: ${value}`, {
              catalogLength: catalog?.length || 0,
              availableNames: (catalog || []).map(x => x.name).slice(0, 5)
            });
          }
        }
        return next;
      });
    });
  };

  // Display price: if prices are inclusive, show exclusive per-unit price in the input
  // For loaded/edited invoices, show the exact stored price without any calculations
  const getDisplayPrice = (item) => {
    const p = Number(item.price || 0);
    const r = Number(item.gst || 0);
    
    // If this is a loaded invoice or the item is marked as loaded, show the exact price
    if (item.isLoadedItem || isLoadedInvoice) {
      return p;
    }
    
    // For new items in tax-inclusive mode, calculate exclusive price for display
    if (isTaxInclusive && r > 0) {
      return +(p / (1 + r / 100)).toFixed(2);
    }
    return p;
  };

  // Handle removing an item
  const handleRemoveItem = (itemId) => {
    setBillingItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Handle adding an artist to an item
  const handleAddArtistToItem = (itemId, artistId) => {
    const artistObj = artists.find(a => String(a.id) === String(artistId)) || { id: String(artistId), name: 'Artist' };
    setBillingItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, artists: [...(item.artists || []), artistObj] } 
          : item
      )
    );
  };

  // Handle removing an artist from an item
  const handleRemoveArtistFromItem = (itemId, artistIndex) => {
    setBillingItems(prev => 
      prev.map(item => {
        if (item.id !== itemId) return item;
        const updatedArtists = [...(item.artists || [])];
        updatedArtists.splice(artistIndex, 1);
        return { ...item, artists: updatedArtists };
      })
    );
  };

  // Handle saving artist revenue distribution
  const handleSaveArtistRevenue = (distribution) => {
    // Save the artist revenue distribution for the item
    setIsArtistModalOpen(false);
  };

  const CouponTag = ({ coupon, onRemove }) => (
    <div className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mb-1">
      <span>{coupon.name}</span>
      <button onClick={() => onRemove(coupon.id)} className="ml-1.5 text-blue-600 hover:text-red-600"><XIcon className="w-3 h-3" /></button>
    </div>
  );

  const groupedItems = billingItems.reduce((acc, item) => {
    (acc[item.type] = acc[item.type] || []).push(item);
    return acc;
  }, {});
  
  
  const sectionOrder = ['Service', 'Product', 'Membership', 'Package'];

  return (
    <div>
      {showBilling && (
        <div className="flex flex-col px-2 py-0 bg-gray-100 font-sans h-75% overflow-hidden pb-4">
          <div className='grid sm:grid-cols-1 lg:grid-cols-[20%_80%] gap-2 flex-grow min-h-0'>
            <div className="min-h-0 pl-4">
              <CustomerForm2 
                customerDetails={customerDetails} 
                handleCustomerDataChange={handleClientDataChange} 
                openClientHistory={openClientHistory}
                openDuesHistory={openDuesHistory}
                openNotesModal={openNotesModal} 
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-md flex flex-col h-full min-h-0 pr-4">
              <div className="p-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 flex-shrink-0">
                <SelectField
                  value={selectedServiceFilter}
                  onChange={handleServiceFilterChange}
                  className="sm:w-full w-auto"
                  options={[
                    { value: "", label: "Service Category" },
                    ...serviceFilters.map(filter => ({ value: filter, label: filter }))
                  ]}
                />
                <div className="flex items-center gap-2">
                  <input type="date" name="date" value={dateTime.date} onChange={handleDateTimeChange} className="border border-gray-300 rounded px-3 py-1.5 text-sm" />
                  <input type="time" name="time" value={dateTime.time} onChange={handleDateTimeChange} className="border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>

              <div className="overflow-auto flex-grow">
                <table className="w-full text-sm text-left table-fixed">
                  <colgroup>
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '5%' }} />
                  </colgroup>
                  <thead className="bg-teal-600 text-white uppercase text-xs tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-4">Name</th>
                      <th className="py-2 px-4">Artist</th>
                      <th className="py-2 px-4 text-center">Qty</th>
                      <th className="py-2 px-4 text-right">Price</th>
                      <th className="py-2 px-4 text-center">Discount</th>
                      <th className="py-2 px-4 text-right">GST</th>
                      <th className="py-2 px-4 text-right">Total</th>
                      <th className="py-2 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {billingItems.length === 0 ? (
                      <tr><td colSpan="8" className="text-center text-gray-500 py-16">No items added yet. Use buttons below to add.</td></tr>
                    ) : (
                      sectionOrder.flatMap(type => {
                        if (!groupedItems[type]) return [];
                        const sectionItems = groupedItems[type];
                        return [
                          <tr key={`${type}-header`} className="bg-gray-100">
                            <td colSpan="8" className="pt-2 pb-1 px-1 font-semibold text-gray-800 border-t-4 border-gray-200">
                                {type}{(type === 'Membership' || type === 'Package') ? '' : 's'}
                            </td>
                          </tr>,
                          ...sectionItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="p-4 align-middle">
                                  <SelectField
                                  value={item.name}
                                  onChange={(e) => handleBillingItemChange(item.id, 'name', e.target.value)}
                                  className="w-full bg-transparent"
                                  options={(() => {
                                    const opts = getNameOptions(item.type);
                                    const ensure = item.name && !opts.includes(item.name) ? [item.name, ...opts] : opts;
                                    return [
                                      { value: "", label: "Select", disabled: true },
                                      ...ensure.map(name => ({ value: name, label: name }))
                                    ];
                                  })()}
                                />
                              </td>
                                <td className="p-4 align-middle">
                                  <div className="w-full">
                                    <ArtistSelector 
                                      allArtists={artists}
                                      selectedArtists={item.artists || []}
                                      onAdd={(artistId) => handleAddArtistToItem(item.id, artistId)}
                                      onRemove={(artistIndex) => handleRemoveArtistFromItem(item.id, artistIndex)}
                                      onClickArtist={() => openArtistRevenueModal(item.id)}
                                    />
                                  </div>
                              </td>
                                <td className="p-4 text-center align-middle">
                                  <input type="text" value={item.qty} onChange={(e) => handleBillingItemChange(item.id, 'qty', e.target.value)} className="w-full border-1 border-gray-300 shadow-sm rounded text-center focus:ring-1 focus:ring-teal-500 text-sm bg-transparent" />
                              </td>
                                <td className="p-4 text-right align-middle">
                                  <input type="text" value={getDisplayPrice(item)} onChange={(e) => handleBillingItemChange(item.id, 'price', e.target.value)} className="w-full border-1 border-gray-300 shadow-sm rounded text-right focus:ring-1 focus:ring-teal-500 text-sm bg-transparent" />
                              </td>
                                <td className="p-4 align-middle">
                                  <div className="grid grid-cols-[1fr_auto] items-center gap-2 w-full border border-gray-300 rounded px-2 py-1">
                                    <input
                                      type="text"
                                      value={item.discount}
                                      onChange={(e) => handleBillingItemChange(item.id, 'discount', e.target.value)}
                                      className="w-full border-0 text-right focus:ring-1 focus:ring-teal-500 text-sm bg-transparent"
                                    />
                                    <select
                                      aria-label="Discount type"
                                      value={item.discountType}
                                      onChange={(e) => handleBillingItemChange(item.id, 'discountType', e.target.value)}
                                      className="min-w-[3.5rem] border-0 rounded focus:ring-1 focus:ring-teal-500 text-sm bg-transparent"
                                    >
                                      <option value="percent">%</option>
                                      <option value="flat">₹</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="p-4 text-right align-middle">
                                  <input type="text" value={item.gst} onChange={(e) => handleBillingItemChange(item.id, 'gst', e.target.value)} className="w-full border-1 border-gray-300 shadow-sm rounded text-right focus:ring-1 focus:ring-teal-500 text-sm bg-transparent" />
                              </td>
                                <td className="p-4 text-right font-medium align-middle">
                                  <div className="w-full text-right">₹{calculateItemTotal(item).toFixed(2)}</div>
                              </td>
                                <td className="p-4 text-center align-middle">
                                  <div className="w-full flex justify-center">
                                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700"><XIcon className="w-4 h-4" /></button>
                                  </div>
                              </td>
                            </tr>
                          ))
                        ];
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex-shrink-0 p-3 flex flex-wrap justify-center gap-2 md:gap-4 bg-gray-100 border-y border-gray-200">
                <button onClick={() => handleAddItem('Service')} className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-1.5 px-3 rounded shadow">Add Service</button>
                <button onClick={() => handleAddItem('Product')} className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-1.5 px-3 rounded shadow">Add Product</button>
                <button onClick={() => handleAddItem('Membership')} className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-1.5 px-3 rounded shadow">Add Membership</button>
              </div>

              <div className='bg-gray-100 flex flex-wrap justify-between gap-2 p-2 flex-shrink-0'>
                <div className='sm:w-full lg:w-1/2'>
                  <SplitPaymentComponent
                    totalDueAmount={totalDues}
                    payments={payments}
                    advanceAmount={customerDetails?.advanceAmount || 0}
                    onAddPayment={handleSavePayment}
                    onDeletePayment={(paymentId) => setPayments(prev => prev.filter(p => p.id !== paymentId))}
                    onClearAdvance={handleClearAdvance}
                  />
                </div>
                <div className='order-2 bg-white rounded-lg shadow-md p-2 flex flex-col gap-2 sm:w-full lg:w-1/5'>
                  <div className="justify-between items-center mb-2">
                    {selectedCoupons.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCoupons.map(coupon => (
                          <div key={coupon.id} className='flex flex-row'><div className='justify-left'><label>Applied Coupon : </label></div><div className='justify-end'><CouponTag coupon={coupon} onRemove={removeCoupon} /></div></div>
                        ))}
                      </div>
                    )}
                    {selectedCoupons.length === 0 && (
                      <SelectField
                        value=""
                        onChange={handleCouponChange}
                        className="w-full bg-white"
                        options={[
                          { value: "", label: "Select Coupon ...", disabled: true },
                          ...coupons.map(coupon => ({
                            value: coupon.id,
                            label: `${coupon.name} (${coupon.description})`,
                            disabled: selectedCoupons.some(sc => sc.id === coupon.id)
                          }))
                        ]}
                      />
                    )}
                  </div>
                  <div>
                    <InputField name='refrerralCode' placeholder='Enter Referral Code' value={customerDetails.referralCode} onChange={handleClientDataChange} />
                  </div>
                  <div className='mt-2 gap-2 '>
                    <div className='grid grid-cols-2 gap-4'>
                      <label className='text-left'>Discount</label>
                      <InputField name="discount" value={extraDiscount} onChange={(e) => handleExtraDiscountChange(e.target.value)} />
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <label className='text-left'>Adjust Total</label>
                      <InputField name="adjustTotal" value={adjustTotal} onChange={(e) => handleAdjustTotalChange(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <label htmlFor="applyGST" className="text-sm font-medium text-gray-600">Apply Tax</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="applyGST"
                          name="applyGST"
                          className="sr-only peer"
                          checked={applyTax}
                          onChange={(e) => setApplyTax(e.target.checked)}
                        />
                        <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="sm:w-full lg:w-1/4 lg:order-3 space-y-2 text-sm bg-white rounded-lg shadow-md p-3">
                  <div className="flex justify-between border-b pb-1"><span className="font-semibold">Sub Total</span><span>₹{calculatedSubTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between border-b pb-1"><span className="font-semibold">Discount</span><span className="text-red-500">-₹{totalItemDiscount.toFixed(2)}</span></div>
                  <div className="flex justify-between border-b pb-1"><span className="font-semibold">Tax (GST)</span><span>₹{totalGST.toFixed(2)}</span></div>
                  <div className="flex justify-between pt-1 pb-1 border-b text-lg"><span className="font-bold">Total</span><span className="font-bold text-teal-600">₹{calculatedTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between pt-2"><span className="font-semibold text-green-600">Paid</span><span className="font-semibold text-green-600">₹{totalPaid.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-red-600">Dues</span><span className="font-semibold text-red-600">₹{totalDues.toFixed(2)}</span></div>
                </div>
              </div>

              <div className='flex sm:flex-col md:flex-row gap-2 justify-between items-center p-2 bg-gray-100 rounded-b-lg flex-shrink-0 border-t'>
                  <div className='flex items-center gap-2 sm:w-full md:w-1/2'>
                    <button
                      type='button'
                      onClick={() => setNewNoteStarred(s => !s)}
                      title={newNoteStarred ? 'Starred' : 'Mark as Starred'}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border ${newNoteStarred ? 'bg-yellow-200 border-yellow-400' : 'bg-white border-gray-300'} hover:shadow`}
                    >
                      {/* simple star glyph */}
                      <span className={`text-sm ${newNoteStarred ? 'text-yellow-600' : 'text-teal-600'}`}>★</span>
                    </button>
                    <input
                      type='text'
                      placeholder='Add Notes..'
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      className='flex-1 p-2 border border-gray-300 rounded-lg'
                    />
                    <button
                      type='button'
                      onClick={handleAddCustomerNote}
                      className='bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow'
                    >
                      Add Note
                    </button>
                  </div>
                  <div className="flex items-center gap-2 justify-end flex-wrap sm:w-full md:w-1/2">
                      <button onClick={openLoadModal} className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow"><Recycle className='mr-1 h-4 w-4' /> Load </button>
                      <button onClick={handleHoldBill} className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow"><Hand className='mr-1 h-4 w-4' /> Hold </button>
                      <button onClick={handleSaveBill} className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow"><SaveIcon /> Generate Bill </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showInvoice} onClose={handleInvoiceClose} title="Invoice" widthClass='max-w-2xl'>
        {savedBillData ? (
          <Invoice
            billData={savedBillData}
            hideActions={false}
            onClose={handleInvoiceClose}
          />
        ) : (
          <Invoice
            billingItems={invoiceItems.length ? invoiceItems : billingItems}
            customerDetails={customerDetails}
            invoiceDetails={dateTime}
            summary={{ subTotal: calculatedSubTotal, discount: totalItemDiscount + extraDiscount, CGST: totalGST / 2, SGST: totalGST / 2, total: calculatedTotal, paid: totalPaid, dues: totalDues, payments }}
            onClose={handleInvoiceClose}
          />
        )}
      </Modal>
      
      <Modal isOpen={isClientHistoryOpen} onClose={closeClientHistory} title="Client History" widthClass='max-w-4xl'>
        <CustomerHistory 
          customer={customerDetails} 
          storeId={currentStore?.id}
          dueOnly={false}
        />
      </Modal>
      
      <Modal isOpen={isDuesHistoryOpen} onClose={closeDuesHistory} title="Pending Bills" widthClass='max-w-6xl'>
        <PendingHistory 
          customer={customerDetails} 
          storeId={currentStore?.id}
        />
      </Modal>
      
      <Modal isOpen={isNotesModalOpen} onClose={closeNotesModal} title="Customer Notes" widthClass='max-w-4xl'>
        <CustomerNotes customer={customerDetails} />
      </Modal>

      <ArtistRevenueModal
        isOpen={isArtistModalOpen}
        onClose={() => setIsArtistModalOpen(false)}
        serviceArtists={editingItemId ? billingItems.find(item => item.id === editingItemId)?.artists || [] : []}
        allArtists={artists}
        totalAmount={editingItemId ? calculateItemTotal(billingItems.find(item => item.id === editingItemId) || {}).toFixed(2) : '0.00'}
        onSave={handleSaveArtistRevenue}
      />
      
      <LoadInvoiceModal
        isOpen={isLoadModalOpen}
        onClose={closeLoadModal}
        invoices={heldInvoices}
        onLoadInvoice={handleLoadInvoice}
      />
    </div>
  );
}

export default Billing;
