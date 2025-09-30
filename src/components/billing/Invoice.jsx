import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PrintIcon, WhatsAppIcon } from '@components/common/Icons';
import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@components/login/StoreContext';
import { getReceiptSettings } from '../../apis/APIs';
import ThermalInvoice from './ThermalInvoice';
import { useNotification } from '../../contexts/NotificationContext';

function Invoice({
    storeDetails = {},
    customerDetails = {},
    invoiceDetails = {},
    billingItems = [],
    summary = {},
    paymentInfo = {},
    terms = [],
    billData = null, // raw bill data from backend API
    invoiceSettings, // optional; if not provided, will be fetched
    storeId: storeIdProp, // optional; defaults to currentStore.id
    hideActions = false, // new prop to hide action buttons when used in preview
    onClose = null // callback to close the modal when edit bill is clicked
}) {
    const navigate = useNavigate();
    const { currentStore, currentStoreProfile, currentReceiptSettings, loadReceiptSettings } = useStore();
    const { showNotification } = useNotification();
    const storeId = storeIdProp || currentStore?.id;

    // Invoice settings state
    const [settings, setSettings] = useState(null);
    const [settingsError, setSettingsError] = useState(null);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [printLayout, setPrintLayout] = useState('a4'); // 'a4' | 'thermal'

    // Store logo state
    const [logoUrl, setLogoUrl] = useState('');
    const logoUrlRef = useRef(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    // Extract data from raw billData if provided
    const extractFromBillData = (billData) => {
        if (!billData) return null;
        
        const customer = billData.customer || {};
        const items = billData.items || billData.line_items || [];
        const payments = billData.payments || [];
        
        return {
            customerDetails: {
                name: customer.name || '',
                number: customer.phone_number || customer.phone || customer.number || '',
                contactNo: customer.phone_number || customer.phone || customer.number || '',
                gender: customer.gender || '',
                address: customer.address || '',
                loyaltyPoints: customer.loyaltyPoints || billData.loyalty_points,
                walletBalance: customer.walletBalance || billData.wallet_balance,
            },
            invoiceDetails: {
                billbookInvoiceId: billData.bill_id || billData.id,
                invoiceNo: billData.invoice_number || billData.billNo || billData.bill_no,
                dateTime: billData.billing_date || billData.date || billData.created_at,
                time: billData.time,
            },
            billingItems: items.map((item, idx) => ({
                id: item.id || `item-${idx}`,
                type: item.type || item.item_type || 'Service',
                name: item.name || item.item_name || '',
                artist: item.staff_name || '',
                qty: item.qty || item.quantity || 1,
                price: item.price || item.unit_price || 0,
                discount: item.discount_value || item.discount || 0,
                discountType: item.discount_type || 'percent',
                discountPercent: item.discount_type === 'percent' ? (item.discount_value || item.discount || 0) : undefined,
                discountValue: item.discount_type === 'flat' ? (item.discount_value || item.discount || 0) : undefined,
                total: item.total || item.line_total || item.totalPrice || 0,
                totalPrice: item.total || item.line_total || item.totalPrice || 0,
                gst: item.cgst && item.sgst ? (Number(item.cgst) + Number(item.sgst)) : (item.tax || 0),
            })),
            summary: {
                subTotal: billData.totals.sub_total || billData.sub_total || 0,
                CGST: billData.totals.cgst_amount || 0,
                SGST: billData.totals.sgst_amount || 0,
                cgstPercent: billData.cgst_percent,
                sgstPercent: billData.sgst_percent,
                discount: billData.bill_discount || billData.discount || 0,
                total: billData.grand_total || billData.total || 0,
                dues: billData.totals.dues || billData.balance || 0,
                payments: payments,
            },
            paymentInfo: {
                payments: payments.map(p => ({
                    mode: p.mode || p.payment_mode || p.type,
                    amount: Number(p.amount || 0)
                })),
                advanceAmount: payments.find(p => (p.mode || p.payment_mode || p.type) === 'advance')?.amount || billData.advanceAmount || billData.advance_amount || 0
            }
        };
    };

    // Use extracted data if billData is provided, otherwise use props
    const extractedData = extractFromBillData(billData);

    // Map API receipt_settings to our settings shape
    const mapApiToSettings = (api) => ({
        showLogo: !!api.logo,
        showGst: !!api.gst_no,
        showArtist: !!api.staff_name,
        showLoyalty: !!api.loyalty_points,
        showWallet: !!api.wallet_balance,
        showPaymentMethod: !!api.payment_method,
        showDateTime: !!api.date_time,
        showClientMob: !!api.customer_contact,
        showDiscount: !!api.discount,
        showBillNotes: Array.isArray(api.notes) ? api.notes.length > 0 : false,
        notes: Array.isArray(api.notes) ? api.notes : []
    });

    // Load settings if not provided
    useEffect(() => {
        if (invoiceSettings) {
            setSettings(invoiceSettings);
            setSettingsError(null);
            return;
        }
        if (!storeId) return;
        setSettingsLoading(true);
        setSettingsError(null);
        // Prefer cached receipt settings from context
        const cached = currentReceiptSettings;
        if (cached) {
            setSettings(mapApiToSettings(cached));
            setSettingsLoading(false);
            return;
        }
        // Fallback: load via context to populate cache
        loadReceiptSettings(storeId)
            .then((data) => {
                if (data) {
                    setSettings(mapApiToSettings(data));
                } else {
                    setSettings(null);
                    setSettingsError('Failed to load invoice settings');
                }
            })
            .catch((e) => {
                setSettings(null);
                setSettingsError(e?.message || 'Failed to load invoice settings');
            })
            .finally(() => setSettingsLoading(false));
    }, [invoiceSettings, storeId, currentReceiptSettings, loadReceiptSettings]);

    // Fetch store logo when settings allow and storeId available
    useEffect(() => {
        if (!settings?.showLogo || !storeId) {
            if (logoUrlRef.current) {
                URL.revokeObjectURL(logoUrlRef.current);
                logoUrlRef.current = null;
            }
            setLogoUrl('');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) return;

        let aborted = false;
        fetch(`${API_BASE_URL}/api/v1/stores/${storeId}/logo?ts=${Date.now()}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
            .then((resp) => (resp.ok ? resp.blob() : null))
            .then((blob) => {
                if (aborted) return;
                if (!blob) {
                    if (logoUrlRef.current) {
                        URL.revokeObjectURL(logoUrlRef.current);
                        logoUrlRef.current = null;
                    }
                    setLogoUrl('');
                    return;
                }
                const url = URL.createObjectURL(blob);
                if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current);
                logoUrlRef.current = url;
                setLogoUrl(url);
            })
            .catch(() => {
                if (!aborted) {
                    setLogoUrl('');
                }
            });
        return () => {
            aborted = true;
        };
    }, [settings?.showLogo, storeId]);

    useEffect(() => {
        return () => {
            if (logoUrlRef.current) {
                URL.revokeObjectURL(logoUrlRef.current);
                logoUrlRef.current = null;
            }
        };
    }, []);

    // Defaults
    const defaultStore = useMemo(() => ({
        name: 'BillBookPlus',
        addressLines: [
            'Sanik Colony, Pitamber Place, Booty More',
            'Ranchi, Jharkhand',
        ],
        phones: ['7992269740', '7992269740'],
        gst: '29SSKCR3202C1PP',
    }), []);

    const defaultInvoice = useMemo(() => ({
        billbookInvoiceId: 'BBPLS000123',
        invoiceNo: 'BBPLS01',
        dateTime: '01-01-2025, 12:00pm',
    }), []);

    // Prefer cached store profile when available
    // Support both shapes:
    // 1) Raw-ish API shape (store_name/name, address_line1/2, city/state, phone/phones, gst_no)
    // 2) Normalized shape from getStoreProfile (businessName, address (string), addressDetails{}, mobileNo/whatsappNo, gstNumber)
    const mergedStoreProfile = currentStoreProfile ? (() => {
        const rawName = currentStoreProfile.store_name || currentStoreProfile.name;
        const normName = currentStoreProfile.businessName;

        // Build address lines from various possible shapes
        const addressLines = [];
        if (currentStoreProfile.address_line1 || currentStoreProfile.address_line2 || currentStoreProfile.city || currentStoreProfile.state) {
            // Raw-ish shape
            if (currentStoreProfile.address_line1) addressLines.push(currentStoreProfile.address_line1);
            if (currentStoreProfile.address_line2) addressLines.push(currentStoreProfile.address_line2);
            const cityState = `${currentStoreProfile.city || ''}${currentStoreProfile.state ? ', ' + currentStoreProfile.state : ''}`.trim();
            if (cityState) addressLines.push(cityState);
        } else if (currentStoreProfile.addressDetails && (currentStoreProfile.addressDetails.addressLine1 || currentStoreProfile.addressDetails.locality || currentStoreProfile.addressDetails.city || currentStoreProfile.addressDetails.state || currentStoreProfile.addressDetails.pincode)) {
            // Normalized addressDetails shape
            const ad = currentStoreProfile.addressDetails;
            if (ad.addressLine1) addressLines.push(ad.addressLine1);
            const locality = ad.locality ? ad.locality : '';
            const cityStatePin = [ad.city, ad.state, ad.pincode].filter(Boolean).join(', ');
            const line2 = [locality, cityStatePin].filter(Boolean).join(', ');
            if (line2) addressLines.push(line2);
        } else if (currentStoreProfile.address) {
            // Normalized single address string
            const parts = String(currentStoreProfile.address).split(',').map(s => s.trim()).filter(Boolean);
            if (parts.length) addressLines.push(...parts);
        }

        // Phones from various shapes
        let phones = [];
        if (Array.isArray(currentStoreProfile.phones)) {
            phones = currentStoreProfile.phones.filter(Boolean);
        } else if (currentStoreProfile.phone) {
            phones = [currentStoreProfile.phone];
        } else {
            // Normalized fields
            phones = [currentStoreProfile.mobileNo, currentStoreProfile.whatsappNo].filter(Boolean);
        }

        // GST from various shapes
        const gst = currentStoreProfile.gst_no || currentStoreProfile.gst || currentStoreProfile.gstNumber || '';

        return {
            name: normName || rawName,
            addressLines,
            phones,
            gst,
        };
    })() : null;
    const store = { ...defaultStore, ...(mergedStoreProfile || {}), ...storeDetails };
    const customer = extractedData ? { ...extractedData.customerDetails } : { ...customerDetails };
    const invoice = extractedData ? { ...defaultInvoice, ...extractedData.invoiceDetails } : { ...defaultInvoice, ...invoiceDetails };
    const items = extractedData ? extractedData.billingItems : billingItems;
    const finalSummary = extractedData ? { ...extractedData.summary } : { ...summary };
    const finalPayment = extractedData ? { ...extractedData.paymentInfo } : { ...paymentInfo };
    const finalTerms = settings?.showBillNotes && settings?.notes?.length
        ? settings.notes
        : (terms.length > 0 ? terms : null);

    const handleSendWhatsApp = () => {
        showNotification('WhatsApp functionality not implemented.', 'info');
    };
    const handlePrintBill = () => {
        // Add a class to <body> to choose which layout prints, then remove it after printing
        const layoutClass = printLayout === 'thermal' ? 'print-thermal' : 'print-a4';
        document.body.classList.add(layoutClass);
        const cleanup = () => {
            document.body.classList.remove(layoutClass);
            window.removeEventListener('afterprint', cleanup);
        };
        window.addEventListener('afterprint', cleanup);
        window.print();
    };
    const handleEditBill = () => {
        // Close the modal first if onClose callback is provided
        if (onClose && typeof onClose === 'function') {
            onClose();
        }
        
        // Navigate to billing panel with bill data for editing
        const navigationState = {
            mode: 'edit',
            billData: billData,
            customerDetails: customer,
            invoiceDetails: invoice,
            billingItems: items,
            items: items, // Add items here too for compatibility
            summary: finalSummary,
            paymentInfo: finalPayment,
            payments: finalPayment?.payments?.map(p => ({
                mode: p.mode || 'cash',
                amount: Number(p.amount || 0),
                timestamp: new Date().toISOString()
            })) || []
        };
        navigate('/billing', { state: navigationState });
    };

    // Helper: format amounts to two decimals, safely handles strings like "₹100/-"
    const formatAmount = (val) => {
        if (val === null || val === undefined) return '';
        const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        if (Number.isNaN(num)) return String(val);
        return num.toFixed(2);
    };

    // Helper to normalize discount field names
    const getItemDiscount = (item) => {
        const val = item?.discountValue ?? item?.discount_amount ?? item?.discountAmount ?? item?.discount_value ?? item?.discount;
        return val;
    };

    // Helper to normalize price field names
    const getItemPrice = (item) => {
        const raw = item?.unit_price ?? item?.unitPrice ?? item?.price;
        if (raw == null) return 0;
        const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
        return Number.isNaN(num) ? 0 : num;
    };

    // Helper to normalize qty
    const getItemQty = (item) => {
        const raw = item?.qty ?? item?.quantity ?? 1;
        const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
        return Number.isNaN(num) ? 1 : num;
    };

    // Helper to get explicit line total only (do not compute here)
    const getItemTotal = (item) => {
        const explicit = item?.totalPrice ?? item?.total_price ?? item?.line_total ?? item?.total ?? null;
        if (explicit == null) return null;
        const num = typeof explicit === 'number' ? explicit : parseFloat(String(explicit).replace(/[^0-9.-]/g, ''));
        return Number.isNaN(num) ? null : num;
    };

    // Helper to get discount value and whether it's percent-based
    const getItemDiscountInfo = (item) => {
        // Prefer explicit percent fields when present
        const percentRaw = item?.discountPercent ?? item?.discount_percent ?? item?.discount_percentage ?? item?.percentDiscount ?? item?.percentage ?? item?.discountRate;
        const typeRaw = item?.discountType ?? item?.discount_type ?? item?.discountMode ?? item?.discount_unit; // may be 'percent' or '%'
        const isPercentFlag = item?.discountIsPercent ?? item?.isPercentDiscount ?? item?.is_percentage;
        let isPercent = false;
        if (typeof isPercentFlag === 'boolean') {
            isPercent = isPercentFlag;
        } else if (typeof typeRaw === 'string') {
            const t = typeRaw.toLowerCase();
            isPercent = t.includes('percent') || t === '%';
        }
        if (percentRaw != null) {
            const pv = typeof percentRaw === 'number' ? percentRaw : parseFloat(String(percentRaw).replace(/[^0-9.-]/g, ''));
            if (!Number.isNaN(pv)) return { value: pv, isPercent: true };
        }
        // Fallback to amount-based discount
        const amountRaw = getItemDiscount(item);
        if (amountRaw != null) {
            const av = typeof amountRaw === 'number' ? amountRaw : parseFloat(String(amountRaw).replace(/[^0-9.-]/g, ''));
            if (!Number.isNaN(av)) return { value: av, isPercent };
        }
        return { value: null, isPercent: false };
    };

    // Show discount column if settings allow or any item has discount
    const showDiscountCol = useMemo(() => {
        if (settings?.showDiscount) return true;
        return Array.isArray(items) && items.some(it => {
            const info = getItemDiscountInfo(it);
            const d = info.value;
            const num = typeof d === 'number' ? d : parseFloat(String(d ?? '').replace(/[^0-9.-]/g, ''));
            return d != null && !Number.isNaN(num) && Math.abs(num) > 0;
        });
    }, [settings?.showDiscount, items]);

    return (
        <div>
                        {/* Print styles: only print the selected invoice area (controlled by body class) */}
            <style>{`
                @media print {
                                    body * { visibility: hidden; }
                                    /* A4 print */
                                    body.print-a4 #invoice-print-area, body.print-a4 #invoice-print-area * { visibility: visible; }
                                    body.print-a4 #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                                    /* Thermal print */
                                    body.print-thermal #thermal-print-area, body.print-thermal #thermal-print-area * { visibility: visible; }
                                    body.print-thermal #thermal-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
            {/* Action buttons - only show when not in preview mode */}
            {!hideActions && (
                <div className="mb-4 print:hidden">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <label className="text-sm text-gray-700">Print Layout:</label>
                        <select value={printLayout} onChange={(e) => setPrintLayout(e.target.value)} className="border rounded px-2 py-1 text-sm">
                            <option value="a4">A4 (Standard)</option>
                            <option value="thermal">Thermal (80mm)</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={handleSendWhatsApp} className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"><WhatsAppIcon className="mr-1 h-4 w-4" />WhatsApp</button>
                        <button onClick={handlePrintBill} className="inline-flex items-center bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"><PrintIcon className="mr-1 h-4 w-4" />Print Bill</button>
                        <button onClick={handleEditBill} className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"><Edit className="mr-1 h-4 w-4" />Edit Bill</button>
                    </div>
                </div>
            )}

            {/* A4 Layout */}
            <div id="invoice-print-area" className="p-2 md:p-2 bg-white max-w-4xl mx-auto font-sans border shadow-lg">
                <div className="flex justify-center items-center">
                    <h3>INVOICE</h3>
                </div>

                {/* Settings loading/error states */}
                {settingsLoading && (
                    <div className="text-xs text-gray-500 mb-2">Loading invoice settings…</div>
                )}
                {settingsError && (
                    <div className="text-xs text-red-600 mb-2">{settingsError}</div>
                )}

                <div className="flex justify-between items-start mb-4 text-left">
                    {/* Store Details */}
                    <div className="text-xs">
                        {settings?.showLogo && logoUrl && (
                            <img src={logoUrl} alt="Store Logo" className="h-10 w-auto mb-2" />
                        )}
                        {/* Store Name */}
                        {store.name && (
                            <p className="font-bold text-sm mb-1">{store.name}</p>
                        )}
                        {store.addressLines?.map((line, index) => <p key={index}>{line}</p>)}
                        {store.phones?.length > 0 && (
                            <p>Ph: {store.phones.join(' , ')}</p>
                        )}
                        {settings?.showGst && store.gst && (
                            <p>GST: {store.gst}</p>
                        )}
                    </div>
                    <div className="text-right text-xs">
                        <p><strong className="font-medium">Name:</strong> {customer.name}</p>
                        {settings?.showClientMob && (
                            <p><strong className="font-medium">Contact No:</strong> {customer.contactNo}</p>
                        )}
                        <p><strong className="font-medium">Invoice No: {invoice.invoiceNo}</strong></p>
                        {settings?.showDateTime && (
                            <p><strong className="font-medium">Date & Time: {invoice.dateTime}</strong></p>
                        )}
                        {settings?.showLoyalty && customer.loyaltyPoints && (
                            <p><strong className="font-medium">Loyalty Point:</strong> {customer.loyaltyPoints}</p>
                        )}
                        {settings?.showWallet && customer.walletBalance && (
                            <p><strong className="font-medium">Wallet Balance:</strong> {customer.walletBalance}</p>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-teal-600 text-white">
                            <tr>
                                <th className="py-1 px-2 font-medium">TYPE</th>
                                <th className="py-1 px-2 font-medium">SERVICE / PRODUCT</th>
                                {settings?.showArtist && (
                                    <th className="py-1 px-2 font-medium">ARTIST</th>
                                )}
                                <th className="py-1 px-2 font-medium text-center">QTY</th>
                                <th className="py-1 px-2 font-medium text-right">PRICE</th>
                                {showDiscountCol && (
                                    <th className="py-1 px-2 font-medium text-right">DISCOUNT</th>
                                )}
                                <th className="py-1 px-2 font-medium text-right">TOTAL PRICE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id || index} className="border-b">
                                    <td className="py-1 px-2">{item.type}</td>
                                    <td className="py-1 px-2">{item.name}</td>
                                    {settings?.showArtist && (
                                        <td className="py-1 px-2">{item.artist}</td>
                                    )}
                                    <td className="py-1 px-2 text-center">{item.qty}</td>
                                    <td className="py-1 px-2 text-right">{formatAmount(getItemPrice(item))}</td>
                                    {showDiscountCol && (
                                        <td className="py-1 px-2 text-right">{
                                            (() => {
                                                const { value, isPercent } = getItemDiscountInfo(item);
                                                if (value == null) return '';
                                                return `${formatAmount(value)}${isPercent ? '%' : ''}`;
                                            })()
                                        }</td>
                                    )}
                                    <td className="py-1 px-2 text-right">{(() => { const t = getItemTotal(item); return t == null ? '' : formatAmount(t); })()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary and Payment Section */}
                <div className="flex justify-end mb-4">
                    <div className="w-full md:w-1/2 lg:w-5/12 text-xs">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-t">
                                    <td className="py-1 px-2 font-medium text-right">TOTAL</td>
                                    <td className="py-1 px-2 text-right">{formatAmount(finalSummary.subTotal)}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 px-2 font-medium text-right">CGST {finalSummary.cgstPercent != null ? `${finalSummary.cgstPercent}%` : ''}</td>
                                    <td className="py-1 px-2 text-right">{formatAmount(finalSummary.CGST)}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 px-2 font-medium text-right">SGST {finalSummary.sgstPercent != null ? `${finalSummary.sgstPercent}%` : ''}</td>
                                    <td className="py-1 px-2 text-right">{formatAmount(finalSummary.SGST)}</td>
                                </tr>
                                {settings?.showDiscount && (
                                    <tr>
                                        <td className="py-1 px-2 font-medium text-right">DISCOUNT</td>
                                        <td className="py-1 px-2 text-right">{formatAmount(finalSummary.discount)}</td>
                                    </tr>
                                )}
                                <tr className="border-y font-bold text-sm">
                                    <td className="py-1 px-2 text-right">TOTAL (Round Off)</td>
                                    <td className="py-1 px-2 text-right">{formatAmount(finalSummary.total)}</td>
                                </tr>
                                {settings?.showPaymentMethod && (finalPayment.payments || finalSummary.payments) && (finalPayment.payments || finalSummary.payments)
                                    .filter(p => p && p.amount != null && Number(p.amount) > 0)
                                    .map((p, index) => (
                                    <tr key={index} className="bg-green-100">
                                        <td className="py-1 px-2 font-medium text-right"><strong>Paid By {p.mode} </strong></td>
                                        <td className="py-1 px-2 text-right"><strong>{formatAmount(p.amount)}</strong></td>
                                    </tr>
                                ))}
                                {settings?.showPaymentMethod && finalPayment.advanceAmount != null && Number(finalPayment.advanceAmount) > 0 && (
                                    <tr className="bg-yellow-100">
                                        <td className="py-1 px-2 font-medium text-right"><strong>Advance Amount </strong></td>
                                        <td className="py-1 px-2 text-right"><strong>{formatAmount(finalPayment.advanceAmount)}</strong></td>
                                    </tr>
                                )}
                                {settings?.showPaymentMethod && (
                                    <tr className="bg-red-100 font-bold">
                                        <td className="py-1 px-2 text-right">Payable (Dues)</td>
                                        <td className="py-1 px-2 text-right">{formatAmount(finalSummary.dues)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Terms and Conditions / Notes */}
                {finalTerms && finalTerms.length > 0 && (
                    <div className="text-xs mt-6 border-t pt-2 text-left">
                        <p className="font-bold mb-1">Notes:</p>
                        <ol className="list-decimal list-inside space-y-0.5">
                            {finalTerms.map((term, index) => <li key={index}>{term}</li>)}
                        </ol>
                    </div>
                )}

            </div>

            {/* Thermal Layout - rendered but hidden unless printing thermal */}
            <div className="hidden print:block">
                <ThermalInvoice
                  storeDetails={store}
                  customerDetails={customer}
                  invoiceDetails={invoice}
                  billingItems={items}
                  summary={finalSummary}
                  terms={finalTerms || []}
                />
            </div>
        </div>
    );
}

export default Invoice;

/* --- Example Usage ---

function App() {
  // --- Example Data (replace with actual data from your Billing component state) ---

  const storeInfo = {
    // logoComponent: YourCustomLogo, // Optional: Pass a React component
    // smallLogoComponent: YourSmallLogo,
    name: "My Awesome Salon",
    addressLines: ["123 Style Street", "Glamour City, ST 12345"],
    phones: ["555-1234", "555-5678"],
    gst: "MYGSTIN12345"
  };

  const customerInfo = {
    name: "Jane Doe",
    contactNo: "555-9876",
    loyaltyPoints: "150/-",
    walletBalance: "250/-"
  };

  const invoiceInfo = {
    billbookInvoiceId: "BBPLUS98765",
    invoiceNo: "INV-0042",
    dateTime: "2025-04-28, 08:00pm"
  };

  const itemsData = [
    { id: 'i1', type: 'Service', name: 'Deluxe Manicure', artist: 'Riya', qty: 1, price: '800/-', discount: '80 (10%)', totalPrice: '720/-' },
    { id: 'i2', type: 'Product', name: 'Premium Hand Cream', artist: 'N/A', qty: 1, price: '450/-', discount: '0', totalPrice: '450/-' },
  ];

  const summaryData = {
    subTotal: '1170/-', // 720 + 450
    cgstPercent: 9,
    cgstAmount: '105.30/-',
    sgstPercent: 9,
    sgstAmount: '105.30/-',
    grandTotal: '1381/-' // Rounded? 1170 + 105.3 + 105.3 = 1380.6
  };

  const paymentData = {
    payments: [
        { mode: 'Credit Card', amount: '1000/-' },
        { mode: 'Wallet Balance', amount: '250/-' }
    ],
    totalPaid: '1250/-',
    totalDues: '131/-' // 1381 - 1250
  };

  const termsData = [
    "All services are final.",
    "Please check your belongings before leaving.",
    "Prices subject to change without notice."
  ];


  return (
    <div>
      <h1 className="text-center text-xl my-4">Invoice Preview Example</h1>
      <InvoicePreview
        storeDetails={storeInfo}
        customerDetails={customerInfo}
        invoiceDetails={invoiceInfo}
        billingItems={itemsData}
        summary={summaryData}
        paymentInfo={paymentData}
        terms={termsData}
      />
      <h1 className="text-center text-xl my-4">Invoice Preview with Default Data</h1>
      <InvoicePreview />
    </div>
  );
}

// export default App; // If this was the main App component

*/
