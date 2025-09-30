import React, { useState, useEffect } from 'react';
import { getCustomerBills } from '../../apis/billingApi';

// Eye icon component for the "Preview Invoice" column
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-gray-800 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

// Date picker component
const DatePicker = ({ label, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>
        <div className="relative">
            <input 
                type="date"
                value={value}
                onChange={onChange}
                className="bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
        </div>
    </div>
);

// Helper function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    });
};

// Main Client History Component
export default function CustomerHistory({ 
    customer = null, 
    storeId = null, 
    dueOnly = false 
}) {
    // Default client data if no customer prop is provided
    const defaultClientData = {
        name: "Shailendra Kumar",
        phone: "7992269740",
        gender: "Male",
        totalRevenue: 5000,
        totalAppointments: 20,
        lastVisit: "01-01-2025"
    };

    const clientData = customer || defaultClientData;
    
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState('2025-01-01');

    // Fetch customer bills
    const fetchCustomerBills = async () => {
        if (!storeId || !clientData.id) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                page: 1,
                limit: 100
            };
            
            // Add due_only filter if this is for dues history
            if (dueOnly) {
                params.due_only = true;
            }
            
            // Add date filters if set
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            
            const response = await getCustomerBills(storeId, clientData.id, params);
            
            
            // Transform the API response to match the component's format
            // The backend response has bills nested under data.bills
            const bills = response.data?.bills || response.data || [];
            
            const transformedData = bills.map((bill, index) => {
                const services = bill.items?.map(item => item.name).join(', ') || 'No services';
                const staffNames = bill.items?.map(item => item.staff || 'Unknown').join(', ') || 'Unknown';
                
                return {
                    id: bill.bill_id || index,
                    date: formatDate(bill.billing_timestamp || bill.created_at),
                    status: bill.payment_status === 'paid' ? 'Completed' : 
                           bill.payment_status === 'unpaid' ? 'Pending' :
                           bill.payment_status === 'partial' ? 'Partial' :
                           bill.status === 'cancelled' ? 'Cancelled' : 
                           'Pending',
                    service: services,
                    staff: staffNames,
                    amount: bill.grand_total || bill.sub_total || 0,
                    remaining: bill.dues || 0,
                    billId: bill.bill_id,
                    invoiceNumber: bill.invoice_number,
                    paymentMode: bill.payment_mode
                };
            });
            
            setHistoryData(transformedData);
        } catch (err) {
            console.error('Error fetching customer bills:', err);
            setError('Failed to load customer history');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount and when dependencies change
    useEffect(() => {
        fetchCustomerBills();
    }, [storeId, clientData.id, dueOnly, startDate, endDate]);

    // Calculate summary data
    const totalRevenue = historyData.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const totalAppointments = historyData.length;
    const lastVisit = historyData.length > 0 ? historyData[0].date : 'N/A';

    return (
        <div className="bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-5xl bg-white rounded-xl sm:p-8 max-h-[70vh] overflow-y-auto">
                {/* Client Info and Date Filters */}
                <div className="md:flex-row justify-between items-start mb-8 gap-6">
                    {/* Client Details */}
                    <div className="grid grid-cols-2 justify-between space-y-2 text-gray-800 text-left">
                        <p><span className="font-bold justify-start">Name:-</span> {clientData.name || clientData.customer_name || 'N/A'}</p>
                        <p className='text-right'><span className="font-bold text-right">Total Appointment:-</span> {totalAppointments}</p>
                        <p className='text-left'><span className="font-bold text-left">Number:-</span> {clientData.phone || clientData.customer_phone || 'N/A'}</p>
                        <p className='text-right'><span className="font-bold text-right">Total Revenue:-</span> ₹{totalRevenue.toFixed(2)}/-</p>
                        <p className='text-left'><span className="font-bold text-left">Gender:-</span> {clientData.gender || 'N/A'}</p>
                        <p className='text-right'><span className="font-bold text-right">Last Visit:-</span> {lastVisit}</p>
                    </div>

                    <hr className="my-2 border-gray-300" />

                    {/* Date Filters */}
                    <div className="flex items-center gap-4 pt-4 justify-between">
                        <DatePicker label="Start Date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <DatePicker label="End Date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>

                {/* Loading/Error States */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="text-gray-600">Loading customer history...</div>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8">
                        <div className="text-red-600">{error}</div>
                    </div>
                )}

                {/* History Table */}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <div className="min-w-full">
                            {/* Table Header */}
                            <div className="bg-teal-500 text-white rounded-t-lg flex">
                                <div className="p-3 w-1/6 font-semibold text-left">Date</div>
                                <div className="p-3 w-1/6 font-semibold text-left">Status</div>
                                <div className="p-3 w-1/4 font-semibold text-left">Service</div>
                                <div className="p-3 w-1/6 font-semibold text-left">Staff</div>
                                <div className="p-3 w-1/6 font-semibold text-right">Amount</div>
                                <div className="p-3 w-1/6 font-semibold text-center">Preview</div>
                            </div>

                            {/* Table Body */}
                            <div>
                                {historyData.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        {dueOnly ? 'No due bills found' : 'No billing history found'}
                                    </div>
                                ) : (
                                    historyData.map((item, index) => (
                                        <div key={item.id} className={`flex border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <div className="p-3 w-1/6 text-gray-700">{item.date}</div>
                                            <div className="p-3 w-1/6">
                                                <span className={`font-medium ${
                                                    item.status === 'Completed' ? 'text-green-600' : 
                                                    item.status === 'Cancelled' ? 'text-red-600' :
                                                    item.status === 'Pending' ? 'text-yellow-600' :
                                                    'text-gray-600'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className="p-3 w-1/4 text-gray-700">{item.service}</div>
                                            <div className="p-3 w-1/6 text-gray-700">{item.staff}</div>
                                            <div className="p-3 w-1/6 text-right text-gray-700">
                                                ₹{item.amount}
                                                {item.remaining > 0 && (
                                                    <div className="text-xs text-red-600">
                                                        Due: ₹{item.remaining}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 w-1/6 flex justify-center items-center">
                                                <EyeIcon />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
