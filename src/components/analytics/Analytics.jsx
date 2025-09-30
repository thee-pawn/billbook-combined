import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  BubbleController,
} from 'chart.js';
import { Bar, Line, Pie, Bubble } from 'react-chartjs-2';

// We need to register all the components we are using from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  BubbleController
);


// --- MOCK DATA (Formatted for Chart.js) ---
const revenueByEmployeeData = {
  labels: ['Shailendra', 'Rohan', 'Priya', 'Amit', 'Sunita', 'Vikram'],
  datasets: [{
      data: [4200, 3100, 2800, 4500, 1900, 1200],
      backgroundColor: ['#14b8a6', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#6b7280'],
  }]
};

// Updated to include 'counts' for the new table column
const revenueByServiceTypeData = {
    labels: ['Haircut', 'Coloring', 'Facial', 'Massage', 'Manicure'],
    datasets: [{
        data: [15000, 8500, 6200, 4500, 3100],
        counts: [120, 45, 55, 30, 75], // Added counts for each service
        backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#6366f1'],
    }]
};

const revenueByMembershipTypeData = {
    labels: ['Gold', 'Silver', 'Platinum'],
    datasets: [{
        data: [15000, 8500, 6200],
        counts: [120, 45, 55], // Added counts for each service
        backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b'],
    }]
};

const serviceVsProductRevenueData = {
    labels: ['Services Revenue', 'Products Revenue', 'Membership Revenue'],
    datasets: [{
        data: [37300, 7931, 5000],
        backgroundColor: ['#06b6d4', '#a855f7', '#0ea5e9'],
    }]
};

const dailySalesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        label: 'Sales',
        data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
    }]
};

const dailyCustomersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        label: 'Customers',
        data: [22, 15, 45, 25, 35, 41, 38],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
    }]
};

const appointmentHeatmapData = {
    datasets: [
        { label: 'Sun', data: [{x: 0, y: 10, v: 5}, {x: 0, y: 11, v: 8}, {x: 0, y: 17, v: 12}] },
        { label: 'Mon', data: [{x: 1, y: 9, v: 2}, {x: 1, y: 18, v: 4}] },
        { label: 'Tue', data: [{x: 2, y: 12, v: 7}, {x: 2, y: 16, v: 9}] },
        { label: 'Wed', data: [{x: 3, y: 10, v: 15}, {x: 3, y: 14, v: 11}] },
        { label: 'Thu', data: [{x: 4, y: 11, v: 10}, {x: 4, y: 15, v: 8}, {x: 4, y: 19, v: 6}] },
        { label: 'Fri', data: [{x: 5, y: 10, v: 18}, {x: 5, y: 13, v: 20}, {x: 5, y: 18, v: 22}] },
        { label: 'Sat', data: [{x: 6, y: 9, v: 25}, {x: 6, y: 12, v: 30}, {x: 6, y: 16, v: 28}] },
    ].flatMap(day => day.data.map(d => ({...d, 
        backgroundColor: `rgba(20, 184, 166, ${d.v / 30})`,
        r: d.v * 0.75 + 5 // Scale radius based on appointment count
    }))) // Normalize color by max appointments
};

const heatmapOptions = {
    maintainAspectRatio: false,
    scales: {
        y: { beginAtZero: true, min: 8, max: 21, ticks: { stepSize: 1, callback: (value) => `${value}:00` } },
        x: { beginAtZero: true, min: -0.5, max: 6.5, ticks: { callback: (value) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][value] }}
    },
    plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => `${c.chart.data.datasets[0].data[c.dataIndex].v} appointments` } }
    }
};

// --- SVG ICONS ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CurrencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><line x1="3" y1="3" x2="21" y2="21"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>;

// --- HELPER COMPONENTS ---
const StatCard = ({ title, value, icon, description, trend = null }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-between relative">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {description && <p className="text-xs text-gray-400 mt-2">{description}</p>}
        </div>
        
        {trend && (
            <div className="absolute bottom-4 right-4">
                <div className={`flex items-center text-xs font-medium ${trend.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.isIncrease ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                    {trend.value}
                </div>
                <p className="text-[10px] text-gray-500">vs last month</p>
            </div>
        )}
    </div>
);

const ChartContainer = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-md ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const PieChartWithTable = ({ title, chartData, tableHeaders }) => {
    const hasCounts = chartData.datasets[0].counts && chartData.datasets[0].counts.length > 0;
    const revenueHeader = tableHeaders[hasCounts ? 2 : 1];

    return (
        <ChartContainer title={title}>
            <div className="flex sm:flex-col md:flex-row gap-6 h-[300px]">
                <div className="relative md:w-1/2 h-full min-h-[150px] flex items-center justify-center">
                    <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { bodyFont: { size: 14 } } } }} />
                </div>
                <div className="md:w-1/2 w-full overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white uppercase bg-slate-800 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">{tableHeaders[0]}</th>
                                {hasCounts && <th scope="col" className="px-6 py-3 text-center">{tableHeaders[1]}</th>}
                                <th scope="col" className="px-6 py-3 text-right">{revenueHeader}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.labels.map((label, index) => (
                                <tr key={label} className="bg-white border-b border-gray-200">
                                    <td className="px-6 py-3 font-medium text-gray-800">
                                        <div className="flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 inline-block rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}></span>
                                            {label}
                                        </div>
                                    </td>
                                    {hasCounts && (
                                        <td className="px-6 py-3 text-gray-600 text-center">
                                            {chartData.datasets[0].counts[index]}
                                        </td>
                                    )}
                                    <td className="px-6 py-3 text-gray-600 font-semibold text-right">
                                        ₹{chartData.datasets[0].data[index].toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ChartContainer>
    );
};


const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- MAIN DASHBOARD COMPONENT ---
export default function Analytics() {
    const { showNotification } = useNotification();
    const [startDate, setStartDate] = useState('2025-06-01');
    const [endDate, setEndDate] = useState(formatDate(new Date()));
    // State to keep track of the active section
    const [activeSection, setActiveSection] = useState('sales');

    const setDateRange = (range) => {
        const today = new Date();
        const end = new Date(today);
        let start = new Date(today);
        
        switch(range) {
            case 'today':
                break;
            case 'week':
                start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                break;
            case 'month':
                start.setDate(1); // First day of the current month
                break;
            default:
                break;
        }

        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
    };

    const handleFilter = () => {
        showNotification(`Filtering data from ${startDate} to ${endDate}. Check the console.`, 'info');
    };

    // A helper function to determine button classes for styling
    const getButtonClasses = (sectionName) => {
        const baseClasses = "flex-1 py-3 px-4 text-center text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-300 ease-in-out";
        if (activeSection === sectionName) {
            return `${baseClasses} bg-teal-500 text-white`;
        }
        return `${baseClasses} bg-white text-gray-700 hover:bg-gray-100`;
    };

    // Render the different sections based on the active section
    const renderContent = () => {
        switch (activeSection) {
            case 'sales':
                return (
                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="Total Revenue" 
                                value="₹45,231" 
                                trend={{ isIncrease: true, value: "12.4%" }}
                            />
                            <StatCard 
                                title="Avg Rev / Customer" 
                                value="₹7,538" 
                                trend={{ isIncrease: false, value: "3.2%" }}
                            />
                            <StatCard 
                                title="Avg Rev / Staff" 
                                value="₹6,461" 
                                trend={{ isIncrease: true, value: "8.7%" }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <ChartContainer title="Revenue Distribution" className="lg:col-span-2">
                                <div style={{ position: 'relative', height: '300px' }}>
                                    <Pie 
                                        data={serviceVsProductRevenueData} 
                                        options={{ 
                                            maintainAspectRatio: false, 
                                            plugins: { 
                                                legend: { position: 'right', labels: { font: { size: 14 } } }, 
                                                tooltip: { bodyFont: { size: 14 } } 
                                            } 
                                        }} 
                                    />
                                </div>
                            </ChartContainer>
                            <ChartContainer title="Daily Sales" className="lg:col-span-2">
                                <div style={{ position: 'relative', height: '300px' }}>
                                    <Line data={dailySalesData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
                                </div>
                            </ChartContainer>
                            <PieChartWithTable
                                title="Revenue by Employee"
                                chartData={revenueByEmployeeData}
                                tableHeaders={['Employee', 'Revenue']}
                            />
                            <PieChartWithTable
                                title="Revenue by Membership Type"
                                chartData={revenueByMembershipTypeData}
                                tableHeaders={['Category', 'Count', 'Revenue']}
                            />
                        </div>
                    </div>
                );
            case 'products':
                return (
                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="Avg Service Cost" 
                                value="₹6,461" 
                                trend={{ isIncrease: true, value: "5.3%" }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <PieChartWithTable
                                title="Revenue by Service Type"
                                chartData={revenueByServiceTypeData}
                                tableHeaders={['Service', 'Count', 'Revenue']}
                            />
                            <ChartContainer title="Revenue Distribution" className="lg:col-span-1">
                                <div style={{ position: 'relative', height: '300px' }}>
                                    <Pie 
                                        data={serviceVsProductRevenueData} 
                                        options={{ 
                                            maintainAspectRatio: false, 
                                            plugins: { 
                                                legend: { position: 'right', labels: { font: { size: 14 } } }, 
                                                tooltip: { bodyFont: { size: 14 } } 
                                            } 
                                        }} 
                                    />
                                </div>
                            </ChartContainer>
                        </div>
                    </div>
                );
            case 'appointments':
                return (
                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="Total Appointments" 
                                value="1,230" 
                                trend={{ isIncrease: true, value: "7.1%" }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <ChartContainer title="Appointment Heatmap (by hour)" className="lg:col-span-2">
                                <div style={{ position: 'relative', height: '300px' }}>
                                    <Bubble data={{datasets: [{data: appointmentHeatmapData.datasets}]}} options={heatmapOptions} />
                                </div>
                            </ChartContainer>
                        </div>
                    </div>
                );
            case 'staff':
                return (
                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="Avg Rev / Staff" 
                                value="₹6,461" 
                                trend={{ isIncrease: true, value: "9.2%" }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <PieChartWithTable
                                title="Revenue by Employee"
                                chartData={revenueByEmployeeData}
                                tableHeaders={['Employee', 'Revenue']}
                            />
                        </div>
                    </div>
                );
            case 'customers':
                return (
                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="Total Customers" 
                                value="854" 
                                trend={{ isIncrease: true, value: "11.4%" }}
                            />
                            <StatCard 
                                title="New Customers" 
                                value="121" 
                                trend={{ isIncrease: false, value: "2.8%" }}
                            />
                            <StatCard 
                                title="Avg Rev / Customer" 
                                value="₹7,538" 
                                trend={{ isIncrease: true, value: "6.5%" }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <ChartContainer title="Daily Customers" className="lg:col-span-2">
                                <div style={{ position: 'relative', height: '300px' }}>
                                    <Line data={dailyCustomersData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
                                </div>
                            </ChartContainer>
                        </div>
                    </div>
                );
            case 'promotions':
                return (
                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="Total Customers" 
                                value="854" 
                                trend={{ isIncrease: true, value: "4.3%" }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <PieChartWithTable
                                title="Revenue by Membership Type"
                                chartData={revenueByMembershipTypeData}
                                tableHeaders={['Category', 'Count', 'Revenue']}
                            />
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Select a section to view analytics</p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6">
            <div className="mx-auto">
                <header className="mb-8">
                    <div className="flex flex-row xl:flex-row justify-between xl:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Analytics Dashboard</h1>
                            <p className="text-gray-500 mt-1">Welcome back, here's a look at your business performance.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setDateRange('today')} className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300">Today</button>
                                <button onClick={() => setDateRange('week')} className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300">This Week</button>
                                <button onClick={() => setDateRange('month')} className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300">This Month</button>
                            </div>
                            <div className="flex items-center gap-2 border-l pl-2">
                                <div>
                                    <label htmlFor="startDate" className="text-xs text-gray-500 block">Start Date</label>
                                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-1 rounded-md border-gray-300 focus:ring-teal-500 focus:border-teal-500"/>
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="text-xs text-gray-500 block">End Date</label>
                                    <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-1 rounded-md border-gray-300 focus:ring-teal-500 focus:border-teal-500"/>
                                </div>
                                <button onClick={handleFilter} className="self-end h-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-colors">Apply</button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Section navigation tabs */}
                <div className="flex rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
                    <button
                        onClick={() => setActiveSection('sales')}
                        className={`${getButtonClasses('sales')} border-r border-gray-300`}
                    >
                        Sales & Revenue
                    </button>
                    <button
                        onClick={() => setActiveSection('products')}
                        className={`${getButtonClasses('products')} border-r border-gray-300`}
                    >
                        Products & Services
                    </button>
                    <button
                        onClick={() => setActiveSection('appointments')}
                        className={`${getButtonClasses('appointments')} border-r border-gray-300`}
                    >
                        Appointments & Bookings
                    </button>
                    <button
                        onClick={() => setActiveSection('staff')}
                        className={`${getButtonClasses('staff')} border-r border-gray-300`}
                    >
                        Staff
                    </button>
                    <button
                        onClick={() => setActiveSection('customers')}
                        className={`${getButtonClasses('customers')} border-r border-gray-300`}
                    >
                        Customers
                    </button>
                    <button
                        onClick={() => setActiveSection('promotions')}
                        className={`${getButtonClasses('promotions')}`}
                    >
                        Promotions
                    </button>
                </div>

                {/* Render the content based on active section */}
                {renderContent()}
            </div>
        </div>
    );
}
