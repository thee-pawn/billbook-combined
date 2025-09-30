import React, { useState, useEffect } from 'react';

const AccessControlDrawer = ({ isOpen, onClose, editMode = false, roleData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        allowedPages: {
            home: false,
            customers: false,
            staff: false,
            expenses: false,
            integrations: false,
            viewMaskedClientNo: false,
            invoices: false,
            memberships: false,
            services: false,
            reviews: false,
            support: false,
            appointments: false,
            analytics: false,
            products: false,
            profile: false,
            backDatedBill: false
        },
        permissions: {
            add: {
                staff: false,
                customers: false,
                product: false,
                service: false,
                membership: false,
                expense: false,
                loyaltyPoints: false,
                walletBalance: false,
                invoice: false
            },
            edit: {
                staff: false,
                customers: false,
                product: false,
                service: false,
                membership: false,
                expense: false,
                loyaltyPoints: false,
                walletBalance: false,
                invoice: false
            },
            delete: {
                staff: false,
                customers: false,
                product: false,
                service: false,
                membership: false,
                expense: false,
                loyaltyPointsRedeem: false,
                walletBalanceRedeem: false,
                invoice: false
            }
        }
    });

    // If we're editing, initialize form with role data
    useEffect(() => {
        if (editMode && roleData) {
            // This is a placeholder - in a real implementation, you would map
            // from your role data format to the form data format
            setFormData({
                name: roleData.name || '',
                allowedPages: {
                    ...formData.allowedPages,
                    // Map the pages from roleData
                },
                permissions: {
                    ...formData.permissions,
                    // Map the permissions from roleData
                }
            });
        } else {
            // Reset form when opening in create mode
            setFormData({
                name: '',
                allowedPages: {
                    home: false,
                    customers: false,
                    staff: false,
                    expenses: false,
                    integrations: false,
                    viewMaskedClientNo: false,
                    invoices: false,
                    memberships: false,
                    services: false,
                    reviews: false,
                    support: false,
                    appointments: false,
                    analytics: false,
                    products: false,
                    profile: false,
                    backDatedBill: false
                },
                permissions: {
                    add: {
                        staff: false,
                        customers: false,
                        product: false,
                        service: false,
                        membership: false,
                        expense: false,
                        loyaltyPoints: false,
                        walletBalance: false,
                        invoice: false
                    },
                    edit: {
                        staff: false,
                        customers: false,
                        product: false,
                        service: false,
                        membership: false,
                        expense: false,
                        loyaltyPoints: false,
                        walletBalance: false,
                        invoice: false
                    },
                    delete: {
                        staff: false,
                        customers: false,
                        product: false,
                        service: false,
                        membership: false,
                        expense: false,
                        loyaltyPointsRedeem: false,
                        walletBalanceRedeem: false,
                        invoice: false
                    }
                }
            });
        }
    }, [isOpen, editMode, roleData]);

    const handleNameChange = (e) => {
        setFormData({
            ...formData,
            name: e.target.value
        });
    };

    const handlePageToggle = (pageName) => {
        setFormData({
            ...formData,
            allowedPages: {
                ...formData.allowedPages,
                [pageName]: !formData.allowedPages[pageName]
            }
        });
    };

    const handlePermissionToggle = (section, permission) => {
        setFormData({
            ...formData,
            permissions: {
                ...formData.permissions,
                [section]: {
                    ...formData.permissions[section],
                    [permission]: !formData.permissions[section][permission]
                }
            }
        });
    };

    const handleSubmit = () => {
        // Here you would handle saving the access control data
        
        // Close drawer after save
        onClose();
    };

    const LockIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    );

    // CheckboxGroup component for rendering grouped checkboxes
    const CheckboxGroup = ({ title, items, section, handleToggle }) => (
        <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(items).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={() => handleToggle(section, key)}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 z-300 flex justify-end">
            <div className="bg-gray-100 w-full max-w-2xl h-full overflow-y-auto p-6 transform transition-transform duration-300 border-l border-gray-300 shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <LockIcon />
                        <h2 className="text-xl font-bold text-gray-800">
                            {editMode ? 'Edit Access Control' : 'Create Access Control'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Access Name */}
                    <div>
                        <label className="block text-sm font-semibold text-teal-600 mb-1">
                            Create Access Name*
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            placeholder="Access Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Allowed Pages */}
                    <div>
                        <label className="block text-sm font-semibold text-teal-600 mb-1">
                            Allowed Page*
                        </label>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(formData.allowedPages).map(([pageName, isChecked]) => (
                                    <label key={pageName} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handlePageToggle(pageName)}
                                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Add, Edit & Delete Permissions */}
                    <div>
                        <label className="block text-sm font-semibold text-teal-600 mb-1">
                            Add, Edit & Delete
                        </label>
                        
                        <CheckboxGroup 
                            title="Add" 
                            items={formData.permissions.add} 
                            section="add" 
                            handleToggle={handlePermissionToggle} 
                        />
                        
                        <CheckboxGroup 
                            title="Edit" 
                            items={formData.permissions.edit} 
                            section="edit" 
                            handleToggle={handlePermissionToggle} 
                        />
                        
                        <CheckboxGroup 
                            title="Delete" 
                            items={formData.permissions.delete} 
                            section="delete" 
                            handleToggle={handlePermissionToggle} 
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleSubmit}
                            className="px-20 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessControlDrawer;
