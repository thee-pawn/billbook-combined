import React, { useState } from 'react';
import { PanelHeader } from '../../common/FormElements';

const BusinessWebsitePanel = () => {
    // This is a placeholder component
    // In the original file there was no implementation for BusinessWebsitePanel
    
    return (
        <div className="mt-6">
            <PanelHeader title="Business Website" />
            <div className="p-10 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-700">Business Website Configuration</h2>
                <p className="text-gray-500 mt-2">
                    This panel allows you to configure your business website settings. 
                    The implementation for this section will be added in the future.
                </p>
                
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-teal-600 mb-4">Website Theme</h3>
                        <p className="text-gray-600">
                            Choose from various professionally designed themes for your business website.
                        </p>
                        <button className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors">
                            Select Theme
                        </button>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-teal-600 mb-4">Domain Configuration</h3>
                        <p className="text-gray-600">
                            Configure your custom domain or use a free subdomain provided by BillBook+.
                        </p>
                        <button className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors">
                            Configure Domain
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessWebsitePanel;
