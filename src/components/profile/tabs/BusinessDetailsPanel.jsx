import React, { useState, useEffect, useRef } from 'react';
import { FormInputField, PanelHeader, SectionHeader, IconInputField } from '../../common/FormElements';
import { CameraIcon, FacebookIcon, InstagramIcon, GoogleMapsIcon } from '../../common/Icons';
import MapsComponent from './MapsComponent';
import { getStoreProfile, updateStoreProfile, getStoreLogo, uploadStoreLogo } from '../../../apis/APIs';
import { useStore } from '../../login/StoreContext';
import { useNotification } from '../../../contexts/NotificationContext';

const BusinessDetailsPanel = () => {
    const { currentStore } = useStore();
    const { showSuccess, showError, showWarning } = useNotification();
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    // Track current object URL to revoke on change
    const logoObjectUrlRef = useRef(null);
    const [details, setDetails] = useState({
        businessName: '', mobileNo: '', email: '', reviewLink: '', gstNumber: '',
        tax: 'Excluding', whatsappNo: '', reportingEmail: '', businessCategory: '', address: '',
        facebook: '', instagram: '', googleMaps: '',
        // Include address details within the details state
        addressDetails: {
            addressLine1: '',
            locality: '',
            city: '',
            state: '',
            pincode: '',
            country: '',
            latitude: '',
            longitude: ''
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Helper to clean up any existing object URL
    const setPreviewFromBlob = (blob) => {
        if (logoObjectUrlRef.current) {
            URL.revokeObjectURL(logoObjectUrlRef.current);
            logoObjectUrlRef.current = null;
        }
        if (blob) {
            const url = URL.createObjectURL(blob);
            logoObjectUrlRef.current = url;
            setLogoPreview(url);
        } else {
            setLogoPreview('');
        }
    };

    const loadLogo = async (storeId) => {
        if (!storeId) return;
        try {
            
            // Check if we have a valid token
            const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
            if (!token) {
                console.warn('BusinessDetailsPanel: No authentication token found');
                setPreviewFromBlob(null);
                return;
            }
            
            // Use direct fetch with proper URL structure for development
            const logoUrl = `/api/v1/stores/${storeId}/logo?ts=${Date.now()}`;
            
            const response = await fetch(logoUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                cache: 'no-store'
            });
            
            console.log('Logo fetch response:', {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length')
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    setPreviewFromBlob(null);
                    return;
                }
                throw new Error(`Failed to fetch logo: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            
            if (blob && blob.size > 0) {
                setPreviewFromBlob(blob);
            } else {
                setPreviewFromBlob(null);
            }
        } catch (e) {
            console.error('BusinessDetailsPanel: Failed to load logo:', e);
            setPreviewFromBlob(null);
        }
    };

    // Fetch profile data when component mounts or store changes
    useEffect(() => {
        // For testing - set the token if it's not available
        const existingToken = localStorage.getItem('token') || localStorage.getItem('jwt_token');
        if (!existingToken) {
            const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg2MTFiNzk3LWVlMzgtNDg1NC1hZTkyLTJhOGMwZjdiZTZhMiIsInBob25lIjoiKzkxOTExMDE3ODIyNyIsIm5hbWUiOiJQYXdhbiBLdW1hciIsImlhdCI6MTc1OTIxNzU4MywiZXhwIjoxNzU5MzAzOTgzfQ.YkogpJTu04vXHGUBtMUzTExuMO-ItpooGYZSa7ieW_o';
            localStorage.setItem('token', testToken);
        }
        
        const fetchProfileData = async () => {
            if (!currentStore?.id) {
                setError("No store selected. Please select a store first.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const profileData = await getStoreProfile(currentStore.id);
                setDetails(profileData);
                // Fetch logo separately with auth and no-cache
                await loadLogo(currentStore.id);
            } catch (err) {
                setError("Failed to load profile data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
        return () => {
            if (logoObjectUrlRef.current) {
                URL.revokeObjectURL(logoObjectUrlRef.current);
                logoObjectUrlRef.current = null;
            }
        };
    }, [currentStore?.id]);

    const handleLogoChange = (e) => {
        if (e.target.files && e.target.files[0]) { 
            const file = e.target.files[0]; 
            setLogo(file); 
            // Show immediate preview from file and revoke any older URL
            if (logoObjectUrlRef.current) {
                URL.revokeObjectURL(logoObjectUrlRef.current);
                logoObjectUrlRef.current = null;
            }
            const url = URL.createObjectURL(file);
            logoObjectUrlRef.current = url;
            setLogoPreview(url);
            setHasChanges(true);
        } 
    };
    
    const handleDetailsChange = (e) => { 
        const { name, value } = e.target; 
        setDetails(prev => ({ ...prev, [name]: value }));
        setHasChanges(true);
    };


    // Function to handle address updates from MapsComponent
    const handleAddressUpdate = (addressData) => {
        // Format the address string
        const formattedAddress = [
            addressData.addressLine1,
            addressData.locality,
            addressData.city,
            addressData.state,
            addressData.pincode,
            addressData.country
        ].filter(Boolean).join(', ');
        
        // Update both address and addressDetails in the details state
        setDetails(prev => ({
            ...prev,
            address: formattedAddress,
            addressDetails: addressData
        }));
        
        setHasChanges(true);
    };
    
    // Function to save the profile
    const handleSaveProfile = async () => {
        if (!hasChanges) return;
        if (!currentStore?.id) {
            showError("No store selected. Cannot save profile.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            // If a new logo file is selected, upload it first via API
            if (logo instanceof File) {
                await uploadStoreLogo(currentStore.id, logo);
            }

            // Update the rest of the profile details
            const updatedProfile = await updateStoreProfile(currentStore.id, details);
            setDetails(updatedProfile);
            setHasChanges(false);

            // Refresh the logo from server (no-cache) after update/upload
            await loadLogo(currentStore.id);
            showSuccess('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            showError("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // Function to cancel changes and revert to original data
    const handleCancelChanges = async () => {
        if (!hasChanges) return;
        if (!currentStore?.id) {
            return;
        }
        try {
            setIsLoading(true);
            const originalProfileData = await getStoreProfile(currentStore.id);
            setDetails(originalProfileData);
            setLogo(null);
            // Reload logo from server (no-cache)
            await loadLogo(currentStore.id);
            setHasChanges(false);
            setError(null);
            showSuccess('Changes cancelled and reverted to original data');
        } catch (err) {
            console.error("Failed to revert changes:", err);
            showError("Failed to revert changes. Please refresh the page.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6">
            {/* Show loading when no store is selected */}
            {!currentStore && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading store information...</p>
                    </div>
                </div>
            )}
            
            {/* Show error state if store selection failed */}
            {currentStore && error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="font-bold text-red-700">Error</p>
                    <p className="text-red-600">{error}</p>
                </div>
            )}
            
            {/* Show main content when store is selected and no critical errors */}
            {currentStore && !error && (
                <div>
                    <div className="mb-8">
                        <div className="mt-4">
                            <label htmlFor="logo-upload" className="cursor-pointer">
                                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                                    {logoPreview ? (
                                        <img 
                                            src={logoPreview} 
                                            alt="Logo Preview" 
                                            className="w-full h-full object-cover rounded-lg" 
                                        />
                                    ) : (
                                        <> 
                                            <CameraIcon /> 
                                            <span className="text-sm mt-2 text-left">Add Logo</span> 
                                        </>
                                    )}
                                </div>
                            </label>
                            <input 
                                id="logo-upload" 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleLogoChange} 
                            />
                        </div>
                    </div>
                    <hr className="my-4 border-gray-300" />
                    <div>
                        <SectionHeader title="Business Information" />
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                            <FormInputField 
                                label="Business name" 
                                name="businessName" 
                                value={details.businessName} 
                                onChange={handleDetailsChange} 
                            />
                            <FormInputField 
                                label="Registered Mobile No" 
                                name="mobileNo" 
                                type="tel" 
                                value={details.mobileNo} 
                                onChange={handleDetailsChange} 
                            />
                            <FormInputField 
                                label="Email Id" 
                                name="email" 
                                type="email" 
                                value={details.email} 
                                onChange={handleDetailsChange} 
                            />
                            <FormInputField 
                                label="Gst Number" 
                                name="gstNumber" 
                                value={details.gstNumber} 
                                onChange={handleDetailsChange} 
                            />
                            <div>
                                <label htmlFor="tax" className="block text-sm font-semibold text-gray-700 mb-1 text-left">Tax</label>
                                <select 
                                    id="tax" 
                                    name="tax" 
                                    value={details.tax} 
                                    onChange={handleDetailsChange} 
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option>Excluding</option>
                                    <option>Including</option>
                                </select>
                            </div>
                            <FormInputField 
                                label="Reporting Whatsapp No" 
                                name="whatsappNo" 
                                type="tel" 
                                value={details.whatsappNo} 
                                onChange={handleDetailsChange} 
                            />
                            <FormInputField 
                                label="Reporting Email ID" 
                                name="reportingEmail" 
                                type="email" 
                                value={details.reportingEmail} 
                                onChange={handleDetailsChange} 
                            />
                            <FormInputField 
                                label="Business Category" 
                                name="businessCategory" 
                                value={details.businessCategory} 
                                onChange={handleDetailsChange} 
                            />
                        </div>
                    </div>
                    
                    <hr className="my-4 border-gray-300" />
                    <div>
                        <SectionHeader title="Social Media Profiles" />
                        <div className="space-y-4 max-w-md">
                            <IconInputField 
                                name="facebook" 
                                placeholder="Facebook URL" 
                                value={details.facebook} 
                                onChange={handleDetailsChange} 
                                icon={<FacebookIcon />} 
                            />
                            <IconInputField 
                                name="instagram" 
                                placeholder="Instagram URL" 
                                value={details.instagram} 
                                onChange={handleDetailsChange} 
                                icon={<InstagramIcon />} 
                            />
                            <IconInputField 
                                name="googleMaps" 
                                placeholder="Google Maps URL" 
                                value={details.googleMaps} 
                                onChange={handleDetailsChange} 
                                icon={<GoogleMapsIcon />} 
                            />
                        </div>
                    </div>

                    <hr className="my-4 border-gray-300" />
                    <div>
                        <SectionHeader title="Location" />
                        <div className="flex sm:flex-col md:flex-row lg:flex-row gap-8 mt-6">
                            <MapsComponent 
                                onAddressUpdate={handleAddressUpdate} 
                                hasChanges={hasChanges}
                                isSaving={isSaving}
                                onSave={handleSaveProfile}
                                onCancel={handleCancelChanges}
                                initialLocation={details.addressDetails}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                        <p className="mt-4 text-center">Loading profile data...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessDetailsPanel;
