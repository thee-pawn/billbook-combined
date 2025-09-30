import React, { useState, useMemo, useCallback } from 'react';

// Mock data for employee sales
const mockSalesData = [
  // Product Sales
  { id: 's001', type: 'product', name: 'Premium Coffee Mug', amount: 25.00, date: '2025-07-12' },
  { id: 's002', type: 'product', name: 'Ergonomic Mouse', amount: 50.00, date: '2025-07-11' },
  { id: 's003', type: 'product', name: 'Noise-Cancelling Headphones', amount: 150.00, date: '2025-07-08' },
  { id: 's004', type: 'product', name: 'Desk Organizer', amount: 15.00, date: '2025-06-28' },
  { id: 's005', type: 'product', name: 'Smart Water Bottle', amount: 35.00, date: '2025-07-12' },
  { id: 's006', type: 'product', name: 'Wireless Charger', amount: 40.00, date: '2025-07-01' },

  // Service Sales
  { id: 's007', type: 'service', name: 'Consulting Hour (Basic)', amount: 100.00, date: '2025-07-12' },
  { id: 's008', type: 'service', name: 'Premium Support Package', amount: 250.00, date: '2025-07-10' },
  { id: 's009', type: 'service', name: 'Installation Service', amount: 75.00, date: '2025-07-09' },
  { id: 's010', type: 'service', name: 'Training Session', amount: 120.00, date: '2025-06-25' },
  { id: 's011', type: 'service', name: 'Data Migration', amount: 300.00, date: '2025-07-05' },

  // Membership Sales
  { id: 's012', type: 'membership', name: 'Gold Tier Membership', amount: 500.00, date: '2025-07-12' },
  { id: 's013', type: 'membership', name: 'Silver Tier Membership', amount: 200.00, date: '2025-07-07' },
  { id: 's014', type: 'membership', name: 'Bronze Tier Membership', amount: 100.00, date: '2025-06-30' },
  { id: 's015', type: 'membership', name: 'Platinum Tier Membership', amount: 1000.00, date: '2025-07-03' },
];

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

// Helper function to get start and end of various periods
const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'thisWeek':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Sunday as start of week
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Saturday as end of week
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    default: // Custom range, use current date as default if not set
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); // Last 7 days default
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  }
  return { start: formatDate(startDate), end: formatDate(endDate) };
};

export default function EmployeeRevenueReport() {
  const [dateRange, setDateRange] = useState(getDateRange('thisMonth')); // Default to this month
  const [filterType, setFilterType] = useState('all'); // 'all', 'product', 'service', 'membership'
  const [employeeName, setEmployeeName] = useState('John Doe'); // Example employee name

  // Filter sales data based on date range
  const filteredSales = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999); // Include full end day

    return mockSalesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
  }, [dateRange]);

  // Calculate summary totals
  const summaryTotals = useMemo(() => {
    const totals = { product: 0, service: 0, membership: 0, grandTotal: 0 };
    filteredSales.forEach(sale => {
      totals[sale.type] += sale.amount;
      totals.grandTotal += sale.amount;
    });
    return totals;
  }, [filteredSales]);

  // Filtered list for display based on category filter
  const displayedSales = useMemo(() => {
    if (filterType === 'all') {
      return filteredSales;
    }
    return filteredSales.filter(sale => sale.type === filterType);
  }, [filteredSales, filterType]);

  // Handle date range preset selection
  const handlePresetDateRange = useCallback((period) => {
    setDateRange(getDateRange(period));
  }, []);

  return (
    <div className="">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <script src="https://cdn.tailwindcss.com"></script>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl my-8 border border-gray-300">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Revenue Report for {employeeName}</h1>
        <p className="text-sm text-gray-600 mb-6">Generated on {formatDate(new Date())}</p>

        {/* Date Range Selector */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">Select Date Range</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => handlePresetDateRange('today')}
              className="px-4 py-2 rounded-md bg-teal-200 text-teal-800 hover:bg-teal-300 transition duration-200 text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => handlePresetDateRange('thisWeek')}
              className="px-4 py-2 rounded-md bg-teal-200 text-teal-800 hover:bg-teal-300 transition duration-200 text-sm font-medium"
            >
              This Week
            </button>
            <button
              onClick={() => handlePresetDateRange('thisMonth')}
              className="px-4 py-2 rounded-md bg-teal-200 text-teal-800 hover:bg-teal-300 transition duration-200 text-sm font-medium"
            >
              This Month
            </button>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="startDate">
              From:
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
            />
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="endDate">
              To:
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
            />
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-6 p-4 bg-teal-100 rounded-lg border border-teal-300">
          <h3 className="text-lg font-semibold text-teal-900 mb-3">Revenue Summary</h3>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white rounded-md">
              <p className="text-sm text-teal-700">Product Sales</p>
              <p className="text-xl font-bold text-teal-800">₹ {summaryTotals.product.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white rounded-md">
              <p className="text-sm text-teal-700">Services</p>
              <p className="text-xl font-bold text-teal-800">₹ {summaryTotals.service.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white rounded-md">
              <p className="text-sm text-teal-700">Memberships</p>
              <p className="text-xl font-bold text-teal-800">₹ {summaryTotals.membership.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-teal-200 rounded-md text-center">
            <p className="text-lg text-teal-900">Grand Total Revenue</p>
            <p className="text-3xl font-extrabold text-teal-900">₹ {summaryTotals.grandTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Sales List Section */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Sales List</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${filterType === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('product')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${filterType === 'product' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Products
            </button>
            <button
              onClick={() => setFilterType('service')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${filterType === 'service' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Services
            </button>
            <button
              onClick={() => setFilterType('membership')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${filterType === 'membership' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Memberships
            </button>
          </div>

          {displayedSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="py-2 px-3 text-left text-sm font-semibold uppercase">Date</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold uppercase">Type</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold uppercase">Item</th>
                    <th className="py-2 px-3 text-right text-sm font-semibold uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedSales.map((sale, index) => (
                    <tr key={sale.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100 last:border-b-0`}>
                      <td className="py-2 px-3 text-sm text-gray-800">{sale.date}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 capitalize">{sale.type}</td>
                      <td className="py-2 px-3 text-sm text-gray-800">{sale.name}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 text-right">₹ {sale.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No sales data found for the selected period and filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}
