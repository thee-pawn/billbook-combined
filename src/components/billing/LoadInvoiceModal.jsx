import React from 'react';
import Modal from '@components/common/Modal';

/**
 * Modal for loading held invoices
 */
const LoadInvoiceModal = ({ isOpen, onClose, invoices, onLoadInvoice }) => {
    const formatDateTime = (dateStr, timeStr) => {
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${formattedDate}, ${timeStr}`;
    };

    const formatTimeAgo = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHrs / 24);

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Load Held Invoices" widthClass="max-w-3xl">
            <div className="mb-4">
                <p className="text-gray-600 mb-4">These invoices were put on hold. Click "Resume" to load an invoice into the billing screen.</p>
                
                {!invoices || invoices.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        <p>No held invoices available.</p>
                    </div>
                ) : (
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Held</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(invoices || []).map((invoice) => (
                                    <tr key={invoice.id || invoice.held_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {invoice.customer?.name || invoice.customer_name || invoice.customer_summary || 'Unknown Customer'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {invoice.customer?.number || invoice.customer?.phone || invoice.customer_phone || 
                                                 (invoice.customer_summary && invoice.customer_summary.includes('(') ? 
                                                  invoice.customer_summary.match(/\((.*?)\)/)?.[1] || 'No phone' : 'No phone')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {invoice.date && invoice.time ? formatDateTime(invoice.date, invoice.time) : 
                                                 (invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : 'No date')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                ₹{(invoice.total || invoice.amount_estimate || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {invoice.heldAt ? formatTimeAgo(invoice.heldAt) : 
                                                 (invoice.created_at ? formatTimeAgo(invoice.created_at) : 'Unknown')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => onLoadInvoice(invoice.id || invoice.held_id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                            >
                                                Resume
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default LoadInvoiceModal;
