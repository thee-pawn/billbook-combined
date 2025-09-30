import React, { useState } from 'react';
import { PanelHeader, SectionHeader } from '../../common/FormElements';

const SubscriptionPanel = () => {
    // Overview data
    const overviewData = {
        sms: { total: 1000, used: 400, remaining: 600 },
        whatsapp: { total: 2000, used: 1000, remaining: 1000 },
        validity: { total: 365, used: 165, remaining: 200 }
    };

    // Subscription plans
    const plans = [
        {
            id: 1,
            name: 'Basic',
            price: 10000,
            features: ['Appointment Booking', 'Customer Management'],
            buttonColor: 'blue'
        },
        {
            id: 2,
            name: 'Standard',
            price: 15000,
            features: ['Everything in Basic', 'Inventory Management', 'SMS Alerts'],
            buttonColor: 'green'
        },
        {
            id: 3,
            name: 'Premium',
            price: 20000,
            features: ['Everything in Standard', 'Staff Payroll', 'Marketing Tools', 'Dedicated Support'],
            buttonColor: 'purple'
        }
    ];

    // Subscription history
    const history = [
        { id: 1, plan: 'Basic Plan', startDate: '01-01-2025', validity: '365 Days', transaction: 'Cash', amount: '₹10000', status: 'Unpaid' },
        { id: 2, plan: 'Standard Plan', startDate: '01-01-2025', validity: '365 Days', transaction: 'PayTm', amount: '₹15000', status: 'Paid' },
        { id: 3, plan: 'Premium Plan', startDate: '01-01-2025', validity: '365 Days', transaction: 'Credit Card', amount: '₹20000', status: 'Paid' }
    ];

    const handleBuyNow = (planId) => {
    };

    return (
        <div className="mt-6 space-y-10">
            {/* Overview Section */}
            <section>
                <SectionHeader title="Overview" />
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="grid sm:grid-cols-1 md:grid-cols-3">
                        {/* SMS Section */}
                        <div className="p-2 border-b md:border-b-0 md:border-r border-gray-200">
                            <h3 className="font-semibold text-center text-teal-600 mb-3">SMS</h3>
                            <p className="text-center text-sm text-gray-600">
                                Total SMS: <span className="font-semibold">{overviewData.sms.total}</span>
                            </p>
                            <p className="text-center text-sm text-red-500">
                                Used SMS: <span className="font-semibold">{overviewData.sms.used}</span>
                            </p>
                            <p className="text-center text-sm text-green-500">
                                Remaining SMS: <span className="font-semibold">{overviewData.sms.remaining}</span>
                            </p>
                        </div>

                        {/* WhatsApp Section */}
                        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
                            <h3 className="font-semibold text-center text-teal-600 mb-3">WHATSAPP</h3>
                            <p className="text-center text-sm text-gray-600">
                                Total Whatsapp: <span className="font-semibold">{overviewData.whatsapp.total}</span>
                            </p>
                            <p className="text-center text-sm text-red-500">
                                Used Whatsapp: <span className="font-semibold">{overviewData.whatsapp.used}</span>
                            </p>
                            <p className="text-center text-sm text-green-500">
                                Remaining Whatsapp: <span className="font-semibold">{overviewData.whatsapp.remaining}</span>
                            </p>
                        </div>

                        {/* Subscription Validity */}
                        <div className="p-6">
                            <h3 className="font-semibold text-center text-teal-600 mb-3">SUBSCRIPTION</h3>
                            <p className="text-center text-sm text-gray-600">
                                Total Validity: <span className="font-semibold">{overviewData.validity.total} Days</span>
                            </p>
                            <p className="text-center text-sm text-red-500">
                                Used Validity: <span className="font-semibold">{overviewData.validity.used} Days</span>
                            </p>
                            <p className="text-center text-sm text-green-500">
                                Remaining Validity: <span className="font-semibold">{overviewData.validity.remaining} Days</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Subscription Plans */}
            <section>
                <SectionHeader title="Subscription Plan" />
                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                            <div className="p-6 flex-grow">
                                <h3 className="text-center font-bold text-xl text-gray-800 mb-2">{plan.name}</h3>
                                <p className="text-center font-bold text-2xl mb-6">
                                    ₹{plan.price}<span className="text-sm font-normal text-gray-600">/year</span>
                                </p>
                                <div className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="px-6 pb-6 mt-auto">
                                <button
                                    onClick={() => handleBuyNow(plan.id)}
                                    className={`w-full py-2 rounded-md font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors`}
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Subscription History */}
            <section>
                <SectionHeader title="Subscription History" />
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-teal-500 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">SUBSCRIPTION PLAN</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">START DATE</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">VALIDITY</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">TRANSACTION DETAILS</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">AMOUNT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">STATUS</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.plan}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.startDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.validity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.transaction}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default SubscriptionPanel;
