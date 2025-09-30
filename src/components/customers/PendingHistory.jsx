import React, { useState, useEffect } from 'react';
import { Eye, CreditCard } from 'lucide-react';
import { getCustomerBills } from '../../apis/billingApi';

// Helper function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    });
};

// --- Individual Row Component ---
// This component represents a single row in the pending history table.
const HistoryRow = ({ item }) => {
  // State for the payment amount and mode for this specific row
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('Cash');

  const handlePayNow = () => {
    // In a real app, you would handle the payment logic here.
    // For example, send a request to your backend with the item id, payAmount, and payMode.
    if (!payAmount || isNaN(payAmount) || Number(payAmount) <= 0) {
        alert('Please enter a valid payment amount.');
        return;
    }
    alert(`Simulating payment for Bill No: ${item.billNo}\nAmount: ${payAmount}\nMode: ${payMode}`);
  };

  return (
    <tr className="border-b border-gray-200 bg-white hover:bg-gray-50">
      <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{item.date}</td>
      <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{item.billNo}</td>
      <td className="py-3 px-4 text-sm text-gray-700 font-medium whitespace-nowrap">₹{item.dues}</td>
      <td className="py-3 px-4 text-center">
        <button 
          onClick={() => window.open(item.invoiceUrl, '_blank')}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="View Invoice"
        >
          <Eye className="w-5 h-5 text-gray-600" />
        </button>
      </td>
      <td className="py-3 px-4">
        <input
          type="number"
          value={payAmount}
          onChange={(e) => setPayAmount(e.target.value)}
          placeholder="0"
          className="w-full max-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </td>
      <td className="py-3 px-4">
        <select
          value={payMode}
          onChange={(e) => setPayMode(e.target.value)}
          className="w-full max-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option>Cash</option>
          <option>Card</option>
          <option>Online</option>
        </select>
      </td>
      <td className="py-3 px-4">
        <button
          onClick={handlePayNow}
          className="flex items-center justify-center gap-2 w-full max-w-[120px] px-4 py-2 text-sm font-semibold text-white bg-teal-500 rounded-md hover:bg-teal-600 active:bg-teal-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <CreditCard className="w-4 h-4" />
          Pay now
        </button>
      </td>
    </tr>
  );
};


// --- Main Component ---
// This is the main component that renders the entire "Pending History" section.
export default function PendingHistory({ 
    customer = null, 
    storeId = null 
}) {
    const [pendingHistoryData, setPendingHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch customer bills with due_only=true
    const fetchPendingBills = async () => {
        if (!storeId || !customer?.id) {
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                page: 1,
                limit: 100,
                due_only: true // Only fetch bills with pending dues
            };
            
            const response = await getCustomerBills(storeId, customer.id, params);
            
            
            // Transform the API response to match the component's format
            const bills = response.data?.bills || response.data || [];
            
            const transformedData = bills.map((bill, index) => ({
                id: bill.bill_id || index,
                date: formatDate(bill.billing_timestamp || bill.created_at),
                billNo: bill.invoice_number || `BILL-${bill.bill_id}`,
                dues: `${bill.dues || 0}`,
                invoiceUrl: '#', // TODO: Add actual invoice URL
                billId: bill.bill_id,
                grandTotal: bill.grand_total || 0
            }));
            
            setPendingHistoryData(transformedData);
        } catch (err) {
            console.error('Error fetching pending bills:', err);
            setError('Failed to load pending bills');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when component mounts or dependencies change
    useEffect(() => {
        fetchPendingBills();
    }, [storeId, customer?.id]);
  return (
    <div className="bg-stone-50 w-full flex items-center justify-center font-sans max-h-[70vh] overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading pending bills...</div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-600">{error}</div>
          </div>
        )}
        
        {/* No customer selected */}
        {!loading && !error && (!storeId || !customer?.id) && (
          <div className="text-center py-8">
            <div className="text-gray-600">Please select a customer to view pending bills</div>
          </div>
        )}
        
        {/* Main Content */}
        {!loading && !error && storeId && customer?.id && (
          <div className="overflow-hidden rounded-lg shadow-lg">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-teal-600">
                <tr>
                  <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                  <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">Bill No</th>
                  <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">Dues</th>
                  <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">Invoice</th>
                  <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">Pay Amount</th>
                  <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">Pay Mode</th>
                  <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingHistoryData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No pending bills found
                    </td>
                  </tr>
                ) : (
                  pendingHistoryData.map((item) => (
                    <HistoryRow key={item.id} item={item} />
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
