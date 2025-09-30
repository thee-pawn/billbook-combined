import React, { useState } from "react";
import "./../../css/Customer.css";
import CouponsTab from "./CouponsTab";
import LoyaltyPointsTab from "./LoyaltyPointsTab";
import MembershipsTab from "./MembershipsTab";
import PackagesTab from "./PackagesTab";

const Memberships = () => {
  const [activeTab, setActiveTab] = useState('memberships');

  return (
    <div className="p-4 px-8 space-y-6">
      <div className="flex rounded-xl border border-gray-200 overflow-hidden shadow-sm border-gray-300 font-bold w-full md:w-3/4 lg:w-3/4">
        {['memberships','packages','coupons','loyalty'].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 text-center text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-300 ease-in-out ${
              activeTab === tab ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            } ${idx===0 ? 'rounded-l-lg border-r border-gray-300' : idx===3 ? 'rounded-r-lg' : 'border-r border-gray-300'}`}
          >
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>
      {activeTab === 'memberships' && <MembershipsTab />}
      {activeTab === 'packages' && <PackagesTab />}
      {activeTab === 'coupons' && <CouponsTab />}
      {activeTab === 'loyalty' && <LoyaltyPointsTab />}
    </div>
  );
};

export default Memberships;
