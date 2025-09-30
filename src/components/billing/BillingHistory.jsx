// BillingHistory.js
import React, { useEffect, useMemo, useState } from 'react';
import GenericTable from './../common/GenericTable';
import Invoice from './Invoice';
import { Modal } from './../common/Modal';
import { DeleteConfirmationModal } from '@components/common/DeleteConfirmationModal';
import { Edit, Edit2, Eye, PencilIcon, Trash2Icon, Upload, X } from 'lucide-react';
import { Drawer } from '@components/common/Drawer';
import { MultiSelectDropdown } from '@components/common/MultiSelectDropdown';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@components/login/StoreContext';
import { getBills, getBillById } from '../../apis/billingApi';
import { useNotification } from '../../contexts/NotificationContext';

// Icons
const EyeIcon = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EditIcon = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;

// Data now fetched from backend via getBills

// Using shared Drawer

// --- Billing History Component ---
function BillingHistory() {
    const navigate = useNavigate();
    const { currentStore } = useStore();
    const { showSuccess, showError } = useNotification();
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInvoiceDrawerOpen, setIsInvoiceDrawerOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBillData, setSelectedBillData] = useState(null);
    const [selectedRawBill, setSelectedRawBill] = useState(null);
    const [billsToDelete, setBillsToDelete] = useState([]);

    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedInvoiceFilters, setSelectedInvoiceFilters] = useState([]);

    const [startDate, setStartDate] = useState('2025-06-01');

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = `${d.getMonth() + 1}`.padStart(2, '0');
        const day = `${d.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [endDate, setEndDate] = useState(formatDate(new Date()));

    // Normalize/format helpers
    const toTitleCase = (s) => (s ? String(s).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');
    const safeNumber = (v, d = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : d;
    };

    // Map backend bill shape -> table row shape
    const mapBillToRow = (bill) => {
        
        const customer = bill.customer || bill.client || {};
        const payments = bill.payments || bill.payment || [];
        const primaryPaymentMode = Array.isArray(payments) && payments.length > 0
            ? payments[0].mode || payments[0].payment_mode || payments[0].type
            : bill.payment_mode || bill.paymentMode || bill.mode || 'unknown';

        const dateRaw = bill.billingDate || bill.date || bill.created_at || bill.createdAt || bill.timestamp;
        const billNo = bill.invoice_number;
        const totalAmount = bill.grand_total;
        const dues = bill.dues ?? bill.balance ?? bill.outstanding ?? 0;
        const phone = customer.phoneNumber || customer.phone || customer.number || customer.contactNo || bill.customer_phone || '';
        const name = customer.name || bill.customer_name || bill.customerName || '';

        return {
            id: bill.bill_id || billNo || `${name}-${dateRaw}`,
            billNo: billNo || '-',
            customerId: phone || '-',
            customerName: name || '-',
            amount: safeNumber(totalAmount, 0),
            // Keep original date value if string; fallback to ISO now for display only
            billingDate: typeof dateRaw === 'string' && dateRaw ? dateRaw : new Date().toISOString(),
            dues: safeNumber(dues, 0),
            paymentMode: toTitleCase(primaryPaymentMode || 'unknown'),
            _raw: bill,
        };
    };

    const fetchBills = async (withRange = false) => {
        if (!currentStore?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const query = { page: '1', limit: '50' };
            // If your backend supports date range filters, enable this block
            if (withRange && startDate && endDate) {
                // Only send explicit date strings to avoid numeric coercion issues on backend
                query.startDate = startDate; // YYYY-MM-DD
                query.endDate = endDate;     // YYYY-MM-DD
            }
            const res = await getBills(currentStore.id, query);
            // Support different response shapes
            const billsArr = res?.data?.bills || res?.data?.items || res?.data || res?.bills || res?.items || [];
            const rows = (Array.isArray(billsArr) ? billsArr : []).map(mapBillToRow);
            setHistoryData(rows);
        } catch (e) {
            console.error('Failed to load bills:', e);
            setError(e?.message || 'Failed to load bills');
            setHistoryData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchBills(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStore?.id]);

    const setDateRange = (range) => {
        const today = new Date();
        const end = new Date(today);
        let start = new Date(today);

        switch (range) {
            case 'today':
                break;
            case 'week':
                start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                break;
            case 'month':
                start.setDate(1); // First day of the current month
                break;
            case 'last7':
                start.setDate(today.getDate() - 7); // Last 7 days
                break;
            case 'last30':
                start.setDate(today.getDate() - 30); // Last 30 days
                break;
            default:
                break;
        }

        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
    };
    // Removed state related to external filter popups

    // --- Modal Handlers ---

    const handleViewInvoice = async (row) => {
        try {
            const billId = row?.id || row?._raw?.id || row?.billNo;
            
            let bill;
            try {
                const res = await getBillById(currentStore.id, billId);
                bill = res?.data?.bill || res?.bill || res?.data || res;
            } catch (apiError) {
                console.warn('API call failed, using row data:', apiError);
                // Fallback to using the row data if API fails
                bill = row?._raw || row;
            }
            
            if (!bill) throw new Error('Bill data not available');
            
            
            setSelectedRawBill(bill);
            setSelectedBillData({ billNo: bill.invoice_number || bill.billNo || bill.bill_no || billId });
            setIsInvoiceDrawerOpen(true);
        } catch (e) {
            console.error('Error in handleViewInvoice:', e);
            setError(e?.message || 'Failed to load invoice');
        }
    };

    const handleDeleteInvoice = (billData) => {
        setBillsToDelete([billData]);
        setIsDeleteModalOpen(true);
    };

    const handleBulkDelete = () => {
        setBillsToDelete(selectedRows);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        // Add your delete logic here
        showSuccess(`${billsToDelete.length} invoice(s) deleted successfully!`);
        setIsDeleteModalOpen(false);
        setBillsToDelete([]);
        setSelectedRows([]);
    };

    const handleFilter = async () => {
        await fetchBills(true);
    };

    const handleEditBill = async (row) => {
        try {
            const billId = row?.id || row?._raw?.id || row?.billNo;
            
            let bill;
            try {
                const res = await getBillById(currentStore.id, billId);
                bill = res?.data?.bill || res?.bill || res?.data || res;
            } catch (apiError) {
                console.warn('API call failed for edit, using row data:', apiError);
                bill = row?._raw || row;
            }
            
            if (!bill) throw new Error('Bill data not available');
            
            
            const customer = bill.customer || {};
            const items = bill.items || bill.line_items || [];
            const payments = bill.payments || [];
            
            
            const navigationState = {
                mode: 'edit',
                billData: bill,
                customerPhone: customer.phone_number || customer.phone || customer.number || '',
                customerName: customer.name || '',
                date: bill.billing_date || bill.date || bill.created_at ? String(bill.billing_date || bill.date || bill.created_at).slice(0,10) : undefined,
                time: bill.time,
                // Remove items mapping since billData already contains the raw items
                payments: payments.map(p => ({
                    mode: p.mode || p.payment_mode || p.type || 'cash',
                    amount: Number(p.amount || 0),
                    timestamp: p.payment_timestamp || p.timestamp,
                })),
                paymentInfo: {
                    payments: payments,
                    advanceAmount: bill.advance_amount || 0
                }
            };
            
            navigate('/billing', { state: navigationState });
        } catch (e) {
            console.error('Error in handleEditBill:', e);
            setError(e?.message || 'Failed to load bill for edit');
        }
    };

    const closeBillingModal = () => {
        setIsBillingModalOpen(false);
        setSelectedBillData(null);
    };

    const handleRowSelect = (selectedRows) => {
        setSelectedRows(selectedRows); // Now receiving array of selected rows directly
    };

    // --- Column Definitions for GenericTable (Updated) ---
    const columns = [
        {
            id: 'billNo',
            header: 'Bill No',
            accessor: 'billNo',
            searchable: true,
            sortable: true// Enable text search via input below header
        },
        {
            id: 'billingDate',
            header: 'Billing Date',
            accessor: 'billingDate',
            sortable: true,
            filterable: true, // Enable inline filter dropdown
            filterType: 'dateRange', // Specify date range filter type
            // Custom cell renderer for date formatting
            cellRenderer: (row) => new Date(row.billingDate).toLocaleDateString()
        },

        {
            id: 'customerName',
            header: 'Customer Name',
            accessor: 'customerName',
            sortable: true,
            searchable: true
        },
        {
            id: 'customerId',
            header: 'Contact No.',
            accessor: 'customerId',
            searchable: true,
            sortable: true, // Assuming customerId is sortable
        },
        {
            id: 'dues',
            header: 'Dues',
            accessor: 'dues',
            sortable: true,
            textAlign: 'left',
            filterable: true, // Enable inline filter dropdown
            filterType: 'custom', // Use custom filter for the checkbox
            filterRenderer: (value, onChange) => (
                // Define the custom UI
                <div className="flex items-center">
                    <input
                        id="dues-filter-checkbox"
                        type="checkbox"
                        // The filter value will be true if checkbox is checked, otherwise undefined/null
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked ? true : undefined)} // Set value to true or undefined
                        className= {`cursor-pointer border-2 rounded flex items-center justify-center transition-colors duration-200
      ${!!value
        ? 'bg-teal-700 border-teal-700' 
        : 'bg-white border-gray-300 hover:border-teal-500'}
      `
    }
                    />
                    <label htmlFor="dues-filter-checkbox" className="ml-2 text-xs font-medium text-gray-700">
                        Show Dues Only
                    </label>
                </div>
            ),
            filterMatcher: (rowValue, filterValue) => {
                // Custom logic: if filterValue is true, only match rows where dues > 0
                if (filterValue === true) {
                    return rowValue > 0;
                }
                return true; // Otherwise, match all rows (filter not active)
            },
            cellRenderer: (row) => `$${row.dues.toFixed(2)}`
        },
        {
            id: 'amount',
            header: 'Total Amount',
            accessor: 'amount',
            sortable: true,
            textAlign: 'left',
            cellRenderer: (row) => `$${row.amount.toFixed(2)}`
        },
    ];
    const invoiceFilters = ['Non GST Bills', 'GST Bills', 'Due Bills'];

    const rowActions = [
        { 
            icon: <Eye className="text-blue-600 hover:text-blue-800" size={22} />, 
            title: 'View Bill',
            onClick: (row) => handleViewInvoice(row)
        },
        { 
            icon: <Edit className="text-green-600 hover:text-green-800" size={22} />, 
            title: 'Edit Bill',
            onClick: (row) => handleEditBill(row)
        },
        { 
            icon: <Trash2Icon className="text-red-600 hover:text-red-800" size={22} />, 
            title: 'Delete Bill',
            onClick: (row) => handleDeleteInvoice(row)
        },
    ];

    return (
        <div className="p-4 px-6 ">
      <div className="customer-header">
        <div className="text-3xl font-bold text-teal-700 text-left  mb-4 p-0">Invoices</div>
                <div className="flex space-x-4">
                    <button
                        onClick={handleBulkDelete}
                        disabled={!selectedRows || selectedRows.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2Icon size={16} />
                        Delete Selected ({selectedRows?.length || 0})
                    </button>
                    <button
                        disabled={!selectedRows || selectedRows.length === 0}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Upload size={20} />
                        Export ({selectedRows?.length || 0})
                    </button>
                </div>
            </div>


            <div className="bg-white rounded-lg shadow-md overflow-hidden">

                <div className="flex flex-row  gap-2 bg-white p-2 justify-between">
                    <div className="flex items-center gap-4">
                        <MultiSelectDropdown
                            options={invoiceFilters}
                            selectedOptions={selectedInvoiceFilters}
                            onChange={setSelectedInvoiceFilters}
                            placeholder="Select Filters"
                            heading=""
                        />
                    </div>
                    <div className='flex flex-row justify-end'>
                        <div className="flex items-center gap-2 pl-2 ">
                            <select
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-3 pr-8 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                                defaultValue=""
                            >
                                <option value="" disabled>Select Date Range</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="last7">Last 7 Days</option>
                                <option value="last30">Last 30 Days</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 px-2 ml-2 border-l border-gray-300">
                            <div>
                                {/* <label htmlFor="startDate" className="text-xs text-gray-500 block">Start Date</label> */}
                                <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-1 rounded-md border-gray-300 focus:ring-teal-500 focus:border-teal-500" />
                            </div>
                            <div>
                                {/* <label htmlFor="endDate" className="text-xs text-gray-500 block">End Date</label> */}
                                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-1 rounded-md border-gray-300 focus:ring-teal-500 focus:border-teal-500" />
                            </div>
                            <button onClick={handleFilter} className="  px-4 py-1 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-colors">Apply</button>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto ">
                    {error && (
                        <div className="p-2 text-red-600 text-sm">{error}</div>
                    )}
                    {isLoading ? (
                        <div className="p-4 text-gray-600 text-sm">Loading bills…</div>
                    ) : (
                        <GenericTable
                            columns={columns}
                            data={historyData}
                            rowActions={rowActions}
                            defaultSort={{ key: 'billingDate', direction: 'descending' }}
                            enableRowSelection={true}
                            onRowSelect={handleRowSelect}
                            selectedRows={selectedRows}
                        />
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Delete"
                message={`Are you sure you want to delete ${billsToDelete.length} selected invoice(s)? This action cannot be undone.`}
            />

            {/* Invoice Drawer */}
            <Drawer
                isOpen={isInvoiceDrawerOpen}
                onClose={() => setIsInvoiceDrawerOpen(false)}
                title={`Invoice Details: ${selectedBillData?.billNo || ''}`}
            >
                {selectedRawBill && (
                    <>
                        <Invoice
                            billData={selectedRawBill}
                            hideActions
                        />
                    </>
                )}
            </Drawer>
        </div >
    );
}

export default BillingHistory;
