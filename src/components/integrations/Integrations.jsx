import React, { useState } from 'react';

// --- Data for Integrations ---
// In a real application, this might come from an API.
const integrationsData = [
    {
        id: 'google-reserve',
        name: 'Google Reserve',
        description: 'Capture online bookings directly from Google Search, Google Maps and more with our Google integration.',
        logo: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.27 5.03 12.5C5.03 8.73 8.36 5.73 12.19 5.73C14.02 5.73 15.63 6.36 16.85 7.48L19.09 5.32C17.11 3.5 14.8 2.5 12.19 2.5C6.98 2.5 2.86 6.75 2.86 12.5C2.86 18.25 6.98 22.5 12.19 22.5C17.6 22.5 21.5 18.53 21.5 12.71C21.5 12.11 21.45 11.59 21.35 11.1Z" fill="#4285F4"></path></svg>,
        features: [
            'Allow customers to book directly from Google Search and Maps.',
            'Sync your availability in real-time.',
            'Automatically update your Google listing with a "Book Online" button.',
            'Increase visibility and attract new customers effortlessly.'
        ],
        setupSteps: [
            'Connect your Google account.',
            'Verify your business listing.',
            'Enable the "Reserve with Google" option in your settings.',
            'Your booking slots will automatically appear on Google.'
        ]
    },
    {
        id: 'facebook-instagram',
        name: 'Facebook & Instagram',
        description: 'Add online booking to your social media pages and allow clients to book directly from your profile.',
        logo: <svg className="w-8 h-8" fill="#1877F2" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>,
        features: [
            'Add a "Book Now" button to your Facebook Page and Instagram profile.',
            'Let clients book appointments without leaving the app.',
            'Run targeted ad campaigns that lead directly to bookings.',
            'Sync customer data between platforms.'
        ],
        setupSteps: [
            'Connect your Facebook Business account.',
            'Select the page you want to add the booking button to.',
            'Customize the button and your services.',
            'Publish the changes and start accepting bookings.'
        ]
    },
    {
        id: 'meta-pixel',
        name: 'Meta Pixel Ads',
        description: 'Use your Facebook Ads Pixel to track events, and create audiences based on their activities.',
        logo: <svg className="w-8 h-8" fill="#006CFF" viewBox="0 0 48 48"><path d="M24,4A20,20,0,1,0,44,24,20,20,0,0,0,24,4Zm0,36A16,16,0,1,1,40,24,16,16,0,0,1,24,40ZM32.7,15.3a2,2,0,0,0-2.8,0L24,21.2,18.1,15.3a2,2,0,0,0-2.8,2.8L21.2,24l-5.9,5.9a2,2,0,1,0,2.8,2.8L24,26.8l5.9,5.9a2,2,0,0,0,2.8-2.8L26.8,24l5.9-5.9A2,2,0,0,0,32.7,15.3Z"></path></svg>,
        features: [
            'Track conversions from your Facebook and Instagram ads.',
            'Create custom audiences for retargeting based on website activity.',
            'Optimize your ad spend by focusing on high-converting user actions.',
            'Gain deep insights into your marketing funnel.'
        ],
        setupSteps: [
            'Create a Meta Pixel in your Facebook Events Manager.',
            'Copy your Pixel ID.',
            'Paste the ID into the integration settings here.',
            'Key events will be tracked automatically.'
        ]
    },
    {
        id: 'google-analytics',
        name: 'Google Analytics',
        description: 'Send events about certain actions to Google Analytics, and create goals based on events to track conversions.',
        logo: <svg className="w-8 h-8" fill="#F9AB00" viewBox="0 0 24 24"><path d="M12.9,2.6c-4.9-1.1-9.9,2-11,6.9S3.9,19.4,8.8,20.5c4.9,1.1,9.9-2,11-6.9S17.8,3.7,12.9,2.6z M9,17c-2.8,0-5-2.2-5-5s2.2-5,5-5 s5,2.2,5,5S11.8,17,9,17z M17,11c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5S19.8,11,17,11z"></path></svg>,
        features: [
            'Monitor user behavior and booking trends.',
            'Track the entire customer journey from ad click to completed booking.',
            'Create detailed conversion funnels and goals.',
            'Understand which marketing channels drive the most revenue.'
        ],
        setupSteps: [
            'Connect your Google Analytics account.',
            'Ensure you have a GA4 property set up.',
            'Enter your Measurement ID in the field below.',
            'Data will start flowing to your Analytics reports within hours.'
        ]
    }
];


// --- Reusable Components ---

/**
 * A single integration card for the main grid.
 */
const IntegrationCard = ({ integration, onViewDetails }) => (
    <div className="integration-card flex flex-col bg-white rounded-xl shadow-md overflow-hidden p-6 border border-gray-200 transition-transform transform hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50">
                {integration.logo}
            </div>
        </div>
        <div className="flex-grow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{integration.name}</h3>
            <p className="text-gray-600 text-sm mb-6">{integration.description}</p>
        </div>
        <button
            onClick={() => onViewDetails(integration)}
            className="w-full mt-auto py-2 px-4 bg-white text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            View
        </button>
    </div>
);

/**
 * The detailed view for a single integration.
 */
const IntegrationDetailPage = ({ integration, onBack }) => (
    <div className="animate-fade-in">
        <button onClick={onBack} className="flex text-gray-600 hover:text-gray-900 justify-end">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Integrations
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 border border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
                <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gray-50 mb-4 md:mb-0 md:mr-6">
                    {integration.logo}
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{integration.name}</h1>
                    <p className="text-gray-600 mt-1">{integration.description}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Key Features</h2>
                    <ul className="space-y-3 list-disc list-inside text-gray-700">
                        {integration.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">How to Set Up</h2>
                    <ol className="space-y-3 list-decimal list-inside text-gray-700">
                         {integration.setupSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
            </div>

             <div className="mt-12 text-center">
                <button className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Enable {integration.name}
                </button>
            </div>
        </div>
    </div>
);


/**
 * The main application component.
 */
export default function Integrations() {
    const [selectedIntegration, setSelectedIntegration] = useState(null);

    // Function to handle viewing integration details
    const handleViewDetails = (integration) => {
        setSelectedIntegration(integration);
    };

    // Function to go back to the list
    const handleGoBack = () => {
        setSelectedIntegration(null);
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="bg-gray-50 min-h-screen">
             <div className="  p-4 md:p-8">
                {selectedIntegration ? (
                    // Show the detail page if an integration is selected
                    <IntegrationDetailPage
                        integration={selectedIntegration}
                        onBack={handleGoBack}
                    />
                ) : (
                    // Show the main grid
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-left">Integrations</h1>
                        <p className="text-gray-600 mb-8 text-left">Supercharge your workflow by connecting with your favorite tools.</p>
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {integrationsData.map(integration => (
                                <IntegrationCard
                                    key={integration.id}
                                    integration={integration}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
