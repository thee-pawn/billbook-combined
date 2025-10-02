import React, { useState, useEffect } from 'react';
import { FormInputField, ToggleSwitch } from '../../common/FormElements';
import { getReceiptSettings } from '../../../apis/APIs';
import { useStore } from '../../login/StoreContext';
import Invoice from '../../billing/Invoice';

const InvoiceEditPanel = () => {
    const { currentStore } = useStore();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [originalSettings, setOriginalSettings] = useState(null);
    const [originalTextFields, setOriginalTextFields] = useState(null);
    
    const [settings, setSettings] = useState({
        showLogo: true,
        showGst: true,
        showArtist: true, // This maps to staff_name in API
        showLoyalty: true,
        showWallet: true, // This maps to wallet_balance in API
        showPaymentMethod: true,
        showDateTime: true, // This maps to date_time in API
        showClientMob: true, // This maps to customer_contact in API
        showDiscount: true,
        showBillNotes: true,
        showEditInvoiceNo: false,
        showEditContactNo: false,
        showEditTerms: true,
    });

    const [textFields, setTextFields] = useState({
        billNotes: '',
        invoiceNo: 'BBPLS01',
        contactNo: '7992269740',
    });

    // Fetch receipt settings when component mounts or store changes
    useEffect(() => {
        const fetchReceiptSettings = async () => {
            if (!currentStore?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
                // Use the direct API call instead of the getReceiptSettings helper
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/v1/stores/${currentStore.id}/receipt-settings`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success && result.data?.receipt_settings) {
                    const apiSettings = result.data.receipt_settings;

                    // Map API settings to component state
                    const newSettings = {
                        showLogo: apiSettings.logo,
                        showGst: apiSettings.gst_no,
                        showArtist: apiSettings.staff_name,
                        showLoyalty: apiSettings.loyalty_points,
                        showWallet: apiSettings.wallet_balance,
                        showPaymentMethod: apiSettings.payment_method,
                        showDateTime: apiSettings.date_time,
                        showClientMob: apiSettings.customer_contact,
                        showDiscount: apiSettings.discount,
                        showBillNotes: true, // Always show if we have notes
                        showEditInvoiceNo: false,
                        showEditContactNo: false,
                        showEditTerms: true,
                    };
                    
                    setSettings(newSettings);
                    setOriginalSettings(newSettings);

                    // Set text fields from API
                    const newTextFields = {
                        billNotes: apiSettings.notes && apiSettings.notes.length > 0 ? apiSettings.notes.join('\n') : '',
                        invoiceNo: 'BBPLS01',
                        contactNo: apiSettings.phone_numbers || '7992269740',
                    };
                    
                    setTextFields(newTextFields);
                    setOriginalTextFields(newTextFields);

                } else {
                    console.warn('No receipt settings found, using defaults');
                }
            } catch (err) {
                console.error('Failed to load receipt settings:', err);
                setError(`Failed to load receipt settings: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchReceiptSettings();
    }, [currentStore?.id]);

    const handleToggle = (key) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: !prev[key] };
            // Check if settings have changed from original
            const settingsChanged = originalSettings && JSON.stringify(newSettings) !== JSON.stringify(originalSettings);
            const textChanged = originalTextFields && JSON.stringify(textFields) !== JSON.stringify(originalTextFields);
            setHasChanges(settingsChanged || textChanged);
            return newSettings;
        });
    };

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setTextFields(prev => {
            const newTextFields = { ...prev, [name]: value };
            // Check if text fields have changed from original
            const textChanged = originalTextFields && JSON.stringify(newTextFields) !== JSON.stringify(originalTextFields);
            const settingsChanged = originalSettings && JSON.stringify(settings) !== JSON.stringify(originalSettings);
            setHasChanges(settingsChanged || textChanged);
            return newTextFields;
        });
    };

    // Function to save invoice settings
    const handleSaveSettings = async () => {
        if (!hasChanges || !currentStore?.id) return;
        
        setIsSaving(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');

            // Prepare data in the format expected by the API
            const requestData = {
                logo: settings.showLogo,
                gst_no: settings.showGst,
                staff_name: settings.showArtist,
                loyalty_points: settings.showLoyalty,
                wallet_balance: settings.showWallet,
                payment_method: settings.showPaymentMethod,
                date_time: settings.showDateTime,
                customer_contact: settings.showClientMob,
                discount: settings.showDiscount,
                phone_numbers: textFields.contactNo,
                notes: textFields.billNotes ? textFields.billNotes.split('\n').filter(line => line.trim() !== '') : []
            };


            const response = await fetch(`${API_BASE_URL}/api/v1/stores/${currentStore.id}/receipt-settings`, {
                method: 'PUT', // or POST - check which method the API expects
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (result.success) {
                // Update original values after successful save
                setOriginalSettings(settings);
                setOriginalTextFields(textFields);
                setHasChanges(false);

                alert('Invoice settings saved successfully!');
            } else {
                throw new Error(result.message || 'Failed to save settings');
            }
        } catch (err) {
            console.error("Failed to save invoice settings:", err);
            setError(`Failed to save invoice settings: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    // Function to cancel changes and revert to original data
    const handleCancelChanges = () => {
        if (!hasChanges) return;
        
        if (originalSettings && originalTextFields) {
            setSettings(originalSettings);
            setTextFields(originalTextFields);
            setHasChanges(false);
            setError(null);
        }
    };

    // Build invoiceSettings object to pass into Invoice
    const invoiceSettingsForPreview = {
        ...settings,
        // Convert single billNotes string to notes array for the invoice component
        notes: settings?.showBillNotes && textFields?.billNotes
            ? textFields.billNotes.split('\n').filter(Boolean)
            : (settings?.notes || [])
    };

    // Map currentStore to storeDetails for preview
    const storeDetails = currentStore ? {
        name: currentStore.name,
        addressLines: [
            [currentStore.address_line_1, currentStore.locality, currentStore.city].filter(Boolean).join(', '),
            [currentStore.state, currentStore.pincode, currentStore.country].filter(Boolean).join(', ')
        ].filter(line => line && line.length > 0),
        phones: [currentStore.mobile_no, currentStore.whatsapp_no].filter(Boolean),
        gst: currentStore.gst_number || ''
    } : {};

    // Simple sample data for preview
    const customerDetails = {
        name: 'Sample Customer',
        contactNo: '9999999999',
        loyaltyPoints: '500/-',
        walletBalance: '2500/-'
    };
    const invoiceDetails = {
        billbookInvoiceId: 'BBPLS000123',
        invoiceNo: textFields.invoiceNo || 'INV-0001',
        dateTime: new Date().toLocaleString()
    };
    const billingItems = [
        { id: 'svc1', type: 'Service', name: 'Hair Cut', artist: 'Siddharth', qty: 1, price: '500/-', discountValue: '100 (20%)', totalPrice: '400/-' },
        { id: 'prd1', type: 'Product', name: 'Loreal Shampoo', artist: 'N/A', qty: 2, price: '1000/-', discountValue: '200', totalPrice: '1600/-' }
    ];
    const summary = {
        subTotal: '4500/-',
        cgstPercent: 9,
        CGST: '405/-',
        sgstPercent: 9,
        SGST: '405/-',
        discount: settings.showDiscount ? '300/-' : undefined,
        total: '5310/-',
        payments: settings.showPaymentMethod ? [{ mode: 'Cash', amount: '3000/-' }] : undefined,
        dues: settings.showPaymentMethod ? '2310/-' : undefined
    };

    const termsArray = (settings.showEditTerms && textFields.terms)
        ? textFields.terms.split('\n').filter(Boolean)
        : [];

    return (
        <div className="mt-6">
            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <span className="ml-2 text-gray-600">Loading receipt settings...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* No Store Selected */}
            {!currentStore && !isLoading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <p className="text-yellow-600 text-sm">Please select a store to view receipt settings.</p>
                </div>
            )}

            {/* Main Content */}
            {!isLoading && !error && currentStore && (
                <div className="flex sm:flex-col lg:flex-row gap-8">
                    {/* Live Invoice Preview using Invoice component */}
                    <div className="lg:w-1/2 w-full bg-white p-2 shadow-lg rounded-lg border border-gray-200">
                        <Invoice
                            storeDetails={storeDetails}
                            customerDetails={customerDetails}
                            invoiceDetails={invoiceDetails}
                            billingItems={billingItems}
                            summary={summary}
                            terms={termsArray}
                            invoiceSettings={invoiceSettingsForPreview}
                            hideActions={true}
                        />
                    </div>

                    {/* Settings Editor */}
                    <div className="lg:w-1/2 w-full space-y-4">
                        <div className="bg-white p-6 shadow-md rounded-lg space-y-4">
                            <h3 className="font-semibold text-lg text-teal-600">Invoice Setting</h3>
                            <ToggleSwitch label="Show Logo" checked={settings.showLogo} onChange={() => handleToggle('showLogo')} />
                            <ToggleSwitch label="Show GST No" checked={settings.showGst} onChange={() => handleToggle('showGst')} />
                            <ToggleSwitch label="Show Staff Name" checked={settings.showArtist} onChange={() => handleToggle('showArtist')} />
                            <ToggleSwitch label="Show Loyalty Point" checked={settings.showLoyalty} onChange={() => handleToggle('showLoyalty')} />
                            <ToggleSwitch label="Show Wallet Balance" checked={settings.showWallet} onChange={() => handleToggle('showWallet')} />
                            <ToggleSwitch label="Show Payment Method" checked={settings.showPaymentMethod} onChange={() => handleToggle('showPaymentMethod')} />
                            <ToggleSwitch label="Show Date & Time" checked={settings.showDateTime} onChange={() => handleToggle('showDateTime')} />
                            <ToggleSwitch label="Show Client Mob No" checked={settings.showClientMob} onChange={() => handleToggle('showClientMob')} />
                            <ToggleSwitch label="Show Discount" checked={settings.showDiscount} onChange={() => handleToggle('showDiscount')} />
                        {/*</div>*/}
                        {/*<div className="bg-white p-6 shadow-md rounded-lg space-y-4">*/}
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Bill Notes</label>
                                <textarea
                                    name="billNotes"
                                    value={textFields.billNotes}
                                    onChange={handleTextChange}
                                    rows="2"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Enter bill notes here..."
                                />



                                <FormInputField
                                    name="contactNo"
                                    label="Contact Numbers"
                                    placeholder="Contact Number"
                                    value={textFields.contactNo}
                                    onChange={handleTextChange}
                                />

                        </div>
                    </div>
                </div>
            )}

            {/* Update and Cancel Buttons - Similar to Schedule Component */}
            {hasChanges && (
                <div className="flex justify-end mt-8 mb-6 space-x-3">
                    {/* Cancel Button */}
                    <button
                        onClick={handleCancelChanges}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                        Cancel
                    </button>

                    {/* Update Button */}
                    <button
                        onClick={handleSaveSettings}
                        disabled={!hasChanges || isSaving}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                            hasChanges && !isSaving
                                ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-sm'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating Invoice Settings...
                            </span>
                        ) : (
                            'Update Invoice Settings'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default InvoiceEditPanel;
