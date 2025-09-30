import React, { useState } from 'react';
import AccessControlDrawer from './AccessControlDrawer';
import { Edit, EditIcon, Eye, EyeIcon } from 'lucide-react';

// Import tab components
import BusinessDetailsPanel from './tabs/BusinessDetailsPanel';
import InvoiceEditPanel from './tabs/InvoiceEditPanel';
import BusinessWebsitePanel from './tabs/BusinessWebsitePanel';
import AccessControlsPanel from './tabs/AccessControlsPanel';
import SubscriptionPanel from './tabs/SubscriptionPanel';
import Schedule from './tabs/Schedule';

// Import icons from common components
import { 
    UserIcon, 
    LocationIcon,
    InvoiceIcon, 
    LinkIcon, 
    LockIcon,
    CalendarIcon
} from '../common/Icons';

// --- Main Profile Settings Component ---
export default function Profile() {
    const TABS = {
        BRAND_PROFILE: 'Business details',
        INVOICE_EDIT: 'Invoice Settings',
        BRAND_WEBSITE: 'Business Website',
        SUBSCRIPTION: 'Subscription',
        ACCESS_CONTROLS: 'Access Controls',
        SCHEDULE: 'Schedule',
    };

    const [activeTab, setActiveTab] = useState(TABS.BRAND_PROFILE);

    // Helper function to determine button classes for styling
    const getButtonClasses = (tabName) => {
        const baseClasses = "flex items-center gap-2 py-3 px-4 text-center text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-300 ease-in-out";
        if (activeTab === tabName) {
            return `${baseClasses} bg-teal-500 text-white`;
        }
        return `${baseClasses} bg-white text-gray-700 hover:bg-gray-100`;
    };

    const renderContent = () => {
        switch (activeTab) {
            case TABS.BRAND_PROFILE: return <BusinessDetailsPanel />;
            case TABS.INVOICE_EDIT: return <InvoiceEditPanel />;
            case TABS.BRAND_WEBSITE: return <BusinessWebsitePanel />;
            case TABS.ACCESS_CONTROLS: return <AccessControlsPanel />;
            case TABS.SUBSCRIPTION: return <SubscriptionPanel />;
            case TABS.SCHEDULE: return <Schedule />;

            default: return null;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="w-full mx-auto">
                <div className="text-3xl font-bold text-teal-700 text-left mb-4 p-0">Profile</div>
                
                {/* Section navigation tabs */}
                <div className="flex flex-wrap rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
                    <button
                        onClick={() => setActiveTab(TABS.BRAND_PROFILE)}
                        className={`${getButtonClasses(TABS.BRAND_PROFILE)} border-r border-gray-300 flex-1`}
                    >
                        <UserIcon /> {TABS.BRAND_PROFILE}
                    </button>
                    <button
                        onClick={() => setActiveTab(TABS.SCHEDULE)}
                        className={`${getButtonClasses(TABS.SCHEDULE)} border-r border-gray-300 flex-1`}
                    >
                        <CalendarIcon /> {TABS.SCHEDULE}
                    </button>
                    <button
                        onClick={() => setActiveTab(TABS.INVOICE_EDIT)}
                        className={`${getButtonClasses(TABS.INVOICE_EDIT)} border-r border-gray-300 flex-1`}
                    >
                        <InvoiceIcon /> {TABS.INVOICE_EDIT}
                    </button>
                    {/* <button
                        onClick={() => setActiveTab(TABS.BRAND_WEBSITE)}
                        className={`${getButtonClasses(TABS.BRAND_WEBSITE)} border-r border-gray-300 flex-1`}
                    >
                        <LinkIcon /> {TABS.BRAND_WEBSITE}
                    </button> */}
                    <button
                        onClick={() => setActiveTab(TABS.SUBSCRIPTION)}
                        className={`${getButtonClasses(TABS.SUBSCRIPTION)} border-r border-gray-300 flex-1`}
                    >
                        <LinkIcon /> {TABS.SUBSCRIPTION}
                    </button>
                    
                    {/* <button
                        onClick={() => setActiveTab(TABS.ACCESS_CONTROLS)}
                        className={`${getButtonClasses(TABS.ACCESS_CONTROLS)} flex-1`}
                    >
                        <LockIcon /> {TABS.ACCESS_CONTROLS}
                    </button> */}
                </div>

                <div className="mt-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
