import { ArrowDown, ArrowUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';

function Stats() {

    const [isExpanded, setIsExpanded] = useState(false);

    return (
    <div className="flex-shrink-0 mb-6 space-y-4">
        {/* Row 1: Use Flexbox for dynamic sizing */}
        <div className="flex items-center gap-4">
            {/* Cards will grow */}
            <div className="flex-grow"><StatCard2 title="Scheduled" value="30" bgColor="bg-white" borderColor="teal" /></div>
            <div className="flex-grow"><StatCard2 title="Completed" value="30" bgColor="bg-white" borderColor="blue" /></div>
            <div className='flex-grow'><StatCard2 title="In Progress" value="30" bgColor='bg-white' borderColor="green" /> </div>
            <div className="flex-grow"><StatCard2 title="Cancelled" value="30" bgColor="bg-white" borderColor="red" /></div>
            <div className="flex-grow"><StatCard2 title="Enquiry" value="30" bgColor="bg-white" borderColor="orange" /></div>
            <div className="flex-grow"><StatCard2 title="Total Services" value="100" borderColor="grey" /></div>
            {/* Button takes minimum space */}
            <div className="flex-shrink-0">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    aria-label={isExpanded ? "Collapse stats" : "Expand stats"}
                >
                    {isExpanded ? <ArrowUp className="w-5 h-5 text-gray-600" /> : <ArrowDown className="w-5 h-5 text-gray-600" />}
                </button>
            </div>
        </div>

        {/* Row 2: Conditionally rendered based on isExpanded state */}
        {isExpanded && (
            <div className="grid grid-cols-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <StatCard title="Total Revenue" value="100" borderColor="grey" />
                <StatCard title="Wallet Reedemed" value="100" borderColor="grey" />
                <StatCard title="Membership Reedemed" value="100" borderColor="grey" />
                <StatCard title="Loyalty Points Redeemed" value="100" borderColor="grey" />
                <StatCard title="Total Expenses" value="100" borderColor="grey" />
                <StatCard title="Net Revenue" value="100" borderColor="grey" />
            </div>
        )}
      </div>
    )
}

const StatCard = ({ title, value, bgColor = 'bg-gray-100', borderColor }) => (
  <div className={`${bgColor} p-3 rounded-lg shadow text-center border`} style={{ borderWidth: '2px', borderColor: borderColor }}>
    <div className="text-sm text-gray-600">{title}</div>
    <div className="text-xl font-bold text-gray-800">{value}</div>
  </div>
);

const StatCard2 = ({ title, value, bgColor = 'bg-gray-100', borderColor }) => (
  <div className={`${bgColor} p-3 rounded-lg shadow text-center border`} style={{ borderWidth: '2px', borderColor: borderColor }}>
    <div className="text-sm text-gray-600">{title} : <b>{value}</b></div>
  
  </div>
);

export default Stats;