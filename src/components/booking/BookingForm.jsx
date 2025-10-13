import { DeleteIcon, LucideDelete, RecycleIcon, Trash2Icon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { InputField, SelectField, TextAreaField, Button, FormSection } from '../common/FormElements';
import { useStore } from '../login/StoreContext';
import { customersApi, servicesApi, staffApi, bookingsApi } from '../../apis/APIs';

// --- Artist Selector Component ---
const ArtistSelector = ({ allArtists, selectedArtists, onAdd, onRemove, onClickArtist }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef(null);

    const availableArtists = allArtists.filter(artist => !selectedArtists.some(selected => selected.id === artist.id));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectorRef]);
    
    return (
        <div className="relative" ref={selectorRef}>
            <div className="relative block w-full min-h-[38px] p-1 border border-gray-300 bg-white rounded-md shadow-sm cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex flex-wrap gap-1 pr-8">
                    {selectedArtists.map((artist, index) => (
                        <div key={artist.id} className="flex items-center gap-1 bg-gray-200 rounded-md pl-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); onClickArtist(); }}>
                           <span className="text-sm font-medium">{artist.name}</span>
                           <span className="text-sm font-medium text-gray-600 border-l border-gray-400 px-2">
                                Amt: {artist.amount || 0}
                           </span>
                           <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(index); }} className="text-gray-500 hover:text-red-600 p-0.5">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                           </button>
                        </div>
                    ))}
                    {!selectedArtists.length && <span className="text-sm text-gray-400 p-1">Select Artist(s)</span>}
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <ul className="py-1 max-h-40 overflow-y-auto">
                        {availableArtists.length > 0 ? availableArtists.map(artist => (
                            <li key={artist.id} onClick={() => { onAdd(artist.id); setIsOpen(false); }} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left">
                                {artist.name}
                            </li>
                        )) : <li className="px-3 py-2 text-sm text-gray-500">No more artists</li>}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- Artist Revenue Share Modal Component ---
const ArtistRevenueModal = ({ isOpen, onClose, serviceArtists, allArtists, totalAmount, onSave }) => {
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        setArtists(JSON.parse(JSON.stringify(serviceArtists)));
    }, [isOpen, serviceArtists]);

    if (!isOpen) return null;

    const handleArtistUpdate = (index, field, value) => {
        const updated = [...artists];
        updated[index][field] = value;
        setArtists(updated);
    };

    const addArtist = (artistId) => {
        if (!artistId || artists.some(a => a.id === artistId)) return;
        const artistToAdd = allArtists.find(a => a.id === artistId);
        setArtists([...artists, { ...artistToAdd, inr: '', percentage: '' }]);
    };
    
    const removeArtist = (index) => {
        setArtists(artists.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(artists);
        onClose();
    };

    const availableArtists = allArtists.filter(artist => !artists.some(a => a.id === artist.id));

    return (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg border-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-teal-600">Artist Revenue Share</h3>                           <Button 
                                onClick={onClose} 
                                variant="icon" 
                                color="secondary"
                            >
                                &times;
                            </Button>
                </div>
                <div className="mb-4 text-right font-semibold text-gray-700">Total Amount: {totalAmount || '0.00'}</div>
                <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 bg-teal-600 text-white p-4 rounded-md text-sm font-semibold text-left">
                        <div className="col-span-6">Artist Name</div>
                        <div className="col-span-3">Amount</div>
                        <div className="col-span-2"> Percentage</div>
                        <div className="col-span-1"></div>
                    </div>
                    {artists.map((artist, index) => (
                        <div key={artist.id} className="grid grid-cols-12 gap-2 items-center text-left px-4">
                            <div className="col-span-6 font-medium">{artist.name}</div>
                            <div className="col-span-3"><input type="number" placeholder="INR" value={artist.inr || ''} onChange={(e) => handleArtistUpdate(index, 'inr', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md sm:text-sm"/></div>
                            <div className="col-span-2"><input type="number" placeholder="%" value={artist.percentage || ''} onChange={(e) => handleArtistUpdate(index, 'percentage', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md sm:text-sm"/></div>
                            <div className="col-span-1 text-center">                           <Button 
                                onClick={() => removeArtist(index)} 
                                variant="icon" 
                                color="danger"
                            >
                                <Trash2Icon/>
                            </Button></div>
                        </div>
                    ))}
                    
                </div>
                <div className="mt-6 text-center">
                    <Button 
                        onClick={handleSave} 
                        variant="primary"
                        size="sm"
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Main Booking Form Component ---

export const BookingForm = ({ mode = 'edit', booking, onSave, onCancel }) => {
    const isViewMode = mode === 'view';
    const { currentStore } = useStore();
    const [formData, setFormData] = useState({ countryCode: '+91', contactNo: '', customerName: '', gender: '', bookingDateTime: '2025-06-18T22:30', email: '', address: '', venueType: 'Indoor', remarks: '', totalAmount: 0, advancedAmount: 0, payMode: 'Cash', payableAmount: 0 });
    const [serviceRows, setServiceRows] = useState([{ serviceId: '', serviceName: '', staffId: '', staffName: '', unitPrice: '', quantity: '1', dateTime: '', venue: '' }]);
    const [isDirty, setIsDirty] = useState(false);
    const [initialSnapshot, setInitialSnapshot] = useState(null);
    const [servicesList, setServicesList] = useState([]); // from backend
    const [servicesLoading, setServicesLoading] = useState(false);
    const [servicesError, setServicesError] = useState(null);
    const [rowStaffOptions, setRowStaffOptions] = useState([]);
    const [rowStaffLoading, setRowStaffLoading] = useState([]);
    const [rowStaffError, setRowStaffError] = useState([]);
    // Artist revenue modal state removed
    const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
    const [phoneLookupError, setPhoneLookupError] = useState(null);
    const [lastFetchedPhone, setLastFetchedPhone] = useState('');

    const normalizeGender = (g) => {
        if (!g) return '';
        const v = String(g).trim().toLowerCase();
        if (v === 'm' || v === 'male') return 'Male';
        if (v === 'f' || v === 'female') return 'Female';
        if (v === 'o' || v === 'other' || v === 'others') return 'Other';
        return '';
    };

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePhoneChange = async (e) => {
        const digits = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, contactNo: digits }));
        if (!isViewMode && digits.length === 10 && currentStore?.id) {
            const fullPhone = `${formData.countryCode || '+91'}${digits}`;
            if (fullPhone !== lastFetchedPhone) {
                setPhoneLookupLoading(true);
                setPhoneLookupError(null);
                try {
                    const res = await customersApi.getByPhone(currentStore.id, fullPhone);
                    if (res.success && res.customer) {
                        setFormData(prev => ({
                            ...prev,
                            customerName: res.customer.name || prev.customerName || '',
                            email: res.customer.raw?.email || prev.email || '',
                            gender: normalizeGender(res.customer.gender) || prev.gender || '',
                            address: res.customer.address || prev.address || ''
                        }));
                    } else {
                        setPhoneLookupError('Customer not found');
                    }
                } catch (err) {
                    setPhoneLookupError('Lookup failed');
                } finally {
                    setPhoneLookupLoading(false);
                    setLastFetchedPhone(fullPhone);
                }
            }
        }
    };
    const handleServiceRowChange = (index, name, value) => {
        const updated = [...serviceRows];
        updated[index][name] = value;
        if (name === 'serviceId') {
            updated[index].staffId = '';
            setRowStaffOptions(prev => { const c = [...prev]; c[index] = []; return c; });
            setRowStaffError(prev => { const c = [...prev]; c[index] = null; return c; });
            setRowStaffLoading(prev => { const c = [...prev]; c[index] = true; return c; });
        }
        setServiceRows(updated);
        if (name === 'serviceId' && value) fetchStaffForService(value, index);
    };

    const addServiceRow = () => {
    setServiceRows(prev => [...prev, { serviceId: '', serviceName: '', staffId: '', staffName: '', unitPrice: '', quantity: '1', dateTime: '', venue: '' }]);
        setRowStaffOptions(prev => [...prev, []]);
        setRowStaffLoading(prev => [...prev, false]);
        setRowStaffError(prev => [...prev, null]);
    };
    const removeServiceRow = (index) => {
        if (serviceRows.length <= 1) return;
        setServiceRows(serviceRows.filter((_, i) => i !== index));
        setRowStaffOptions(prev => prev.filter((_, i) => i !== index));
        setRowStaffLoading(prev => prev.filter((_, i) => i !== index));
        setRowStaffError(prev => prev.filter((_, i) => i !== index));
    };

    const buildPayload = () => {
        const items = serviceRows
            .filter(r => r.serviceId)
            .map(r => {
                const svc = servicesList.find(s => s.id === r.serviceId);
                const price = typeof svc?.price !== 'undefined' ? Number(svc.price) : undefined;
                return {
                    service_id: r.serviceId,
                    service_name: svc?.name || undefined,
                    unit_price: isNaN(price) ? undefined : price,
                    staff_id: r.staffId || null,
                    quantity: Math.max(1, Number(r.quantity) || 1),
                    scheduled_at: r.dateTime ? new Date(r.dateTime).toISOString() : null,
                    venue: formData.venueType === 'Indoor' ? null : (r.venue || null)
                };
            });
        // Some backends store the venue at the booking level. If outdoor, set it from the first non-empty item venue
        const bookingLevelVenue = (() => {
            if (String(formData.venueType || 'Indoor').toLowerCase() === 'indoor') return null;
            const firstWithVenue = serviceRows.find(r => r.venue && String(r.venue).trim().length > 0);
            return firstWithVenue ? firstWithVenue.venue : null;
        })();

        return {
            country_code: formData.countryCode,
            contact_no: formData.contactNo,
            customer_name: formData.customerName,
            gender: String(formData.gender || '').toLowerCase(),
            email: formData.email || undefined,
            address: formData.address || undefined,
            booking_datetime: formData.bookingDateTime ? new Date(formData.bookingDateTime).toISOString() : new Date().toISOString(),
            venue_type: String(formData.venueType || 'Indoor').toLowerCase(),
            remarks: formData.remarks || undefined,
            advance_amount: Number(formData.advancedAmount) || 0,
            payment_mode: String(formData.payMode || 'Cash').toLowerCase(),
            // venue: bookingLevelVenue,
            items
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewMode) return;
        if (!currentStore?.id) { console.error('No store selected'); return; }
        try {
            const payload = buildPayload();
            let resp;
            if (booking?.id) {
                resp = await bookingsApi.update(currentStore.id, booking.id, payload);
            } else {
                resp = await bookingsApi.create(currentStore.id, payload);
            }
            onSave && onSave(resp?.data || resp);
        } catch (err) {
            console.error('Failed to save booking:', err);
        }
    };

    // Fetch services from backend
    useEffect(() => {
        if (!currentStore?.id) return;
        let active = true;
        (async () => {
            setServicesLoading(true); setServicesError(null);
            try {
                const res = await servicesApi.getAll(currentStore.id);
                if (!active) return;
                const list = res?.data?.services || res?.services || [];
                setServicesList(list);
            } catch (err) {
                if (active) setServicesError('Failed to load services');
            } finally { if (active) setServicesLoading(false); }
        })();
        return () => { active = false; };
    }, [currentStore?.id]);

    // Initialize from booking prop
    useEffect(() => {
        if (!booking) {
            // For new bookings, set initial snapshot after component mounts
            const initialFormData = { countryCode: '+91', contactNo: '', customerName: '', gender: '', bookingDateTime: '2025-06-18T22:30', email: '', address: '', venueType: 'Indoor', remarks: '', totalAmount: 0, advancedAmount: 0, payMode: 'Cash', payableAmount: 0 };
            const initialRows = [{ serviceId: '', serviceName: '', staffId: '', staffName: '', unitPrice: '', quantity: '1', dateTime: '', venue: '' }];
            setInitialSnapshot(JSON.stringify({ formData: initialFormData, rows: initialRows }));
            setIsDirty(false);
            return;
        }
        // Unwrap/merge common backend getById shapes:
        // 1) { data: { booking, items } }
        // 2) { data: { data: booking } }
        // 3) { booking, items }
        // 4) direct booking object
        let b = booking;
        if (b?.data?.booking) {
            b = { ...b.data.booking, items: b.data.items || b.data.booking.items || [] };
        } else if (b?.data?.data) {
            b = b.data.data;
        } else if (b?.booking) {
            b = { ...b.booking, items: b.items || b.booking.items || [] };
        }
        const parseISO = (iso) => {
            if (!iso) return '';
            const d = new Date(iso);
            const yyyy = d.getFullYear();
            const mm = `${d.getMonth() + 1}`.padStart(2, '0');
            const dd = `${d.getDate()}`.padStart(2, '0');
            const hh = `${d.getHours()}`.padStart(2, '0');
            const mi = `${d.getMinutes()}`.padStart(2, '0');
            return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
        };
        const fd = {
            countryCode: b.country_code || '+91',
            contactNo: b.contact_no || '',
            customerName: b.customer_name || '',
            gender: b.gender ? b.gender[0].toUpperCase() + b.gender.slice(1) : '',
            bookingDateTime: parseISO(b.booking_datetime),
            email: b.email || '',
            address: b.address || '',
            venueType: b.venue_type ? (b.venue_type.charAt(0).toUpperCase() + b.venue_type.slice(1)) : 'Indoor',
            remarks: b.remarks || '',
            totalAmount: b.total_amount || 0,
            advancedAmount: b.advance_amount || 0,
            payMode: b.payment_mode ? b.payment_mode.charAt(0).toUpperCase() + b.payment_mode.slice(1) : 'Cash',
            payableAmount: b.payable_amount || 0,
        };
        const rows = (b.items || []).map(it => ({
            serviceId: it.service_id || '',
            serviceName: it.service_name || '',
            staffId: it.staff_id || '',
            staffName: it.staff_name || '',
            unitPrice: it.unit_price || '',
            quantity: String(it.quantity || '1'),
            dateTime: parseISO(it.scheduled_at),
            venue: (it.venue ?? b.venue ?? ''),
        }));
        setFormData(fd);
        setServiceRows(rows.length ? rows : [{ serviceId: '', serviceName: '', staffId: '', staffName: '', unitPrice: '', quantity: '1', dateTime: '', venue: '' }]);
        setInitialSnapshot(JSON.stringify({ formData: fd, rows: rows }));
        setIsDirty(false);
        // Preload staff options for existing services in edit mode so dropdowns are populated
        if (rows.length && !isViewMode) {
            // Initialize loading arrays to correct length
            setRowStaffOptions(Array(rows.length).fill([]));
            setRowStaffLoading(Array(rows.length).fill(false));
            setRowStaffError(Array(rows.length).fill(null));
            rows.forEach((r, idx) => { if (r.serviceId) fetchStaffForService(r.serviceId, idx); });
        }
    }, [booking]);

    // Dirty tracking
    useEffect(() => {
        if (!initialSnapshot) return;
        const snap = initialSnapshot;
        const current = JSON.stringify({ formData, rows: serviceRows });
        setIsDirty(current !== snap);
    }, [formData, serviceRows, initialSnapshot]);

    // Fetch staff for a selected service (like AppointmentForm)
    const fetchStaffForService = async (serviceId, rowIndex) => {
        if (!serviceId || !currentStore?.id) return;
        try {
            const res = await staffApi.getByService(currentStore.id, serviceId);
            const options = res.success ? (res.data || []) : [];
            setRowStaffOptions(prev => { const clone = [...prev]; clone[rowIndex] = options; return clone; });
        } catch (err) {
            setRowStaffError(prev => { const clone = [...prev]; clone[rowIndex] = 'Failed to load staff'; return clone; });
            setRowStaffOptions(prev => { const clone = [...prev]; clone[rowIndex] = []; return clone; });
        } finally {
            setRowStaffLoading(prev => { const clone = [...prev]; clone[rowIndex] = false; return clone; });
        }
    };

    // Auto-calc totals and payable
    useEffect(() => {
        // In view mode, respect server-calculated amounts; don't recompute
        if (isViewMode) return;
        if (!servicesList || servicesList.length === 0) { setFormData(prev => ({ ...prev, totalAmount: 0, payableAmount: Math.max(0, 0 - (prev.advancedAmount || 0)) })); return; }
        let total = 0;
        serviceRows.forEach(r => {
            const svc = servicesList.find(s => s.id === r.serviceId);
            if (svc && typeof svc.price !== 'undefined') {
                const priceNum = Number(svc.price);
                if (!isNaN(priceNum)) total += priceNum;
            }
        });
        setFormData(prev => ({ ...prev, totalAmount: total, payableAmount: Math.max(0, total - (Number(prev.advancedAmount) || 0)) }));
    }, [serviceRows, servicesList, isViewMode]);

    // Update payable when advance changes
    useEffect(() => {
        if (isViewMode) return; // Keep server-provided payable in view mode
        const total = Number(formData.totalAmount) || 0;
        const adv = Number(formData.advancedAmount) || 0;
        setFormData(prev => ({ ...prev, payableAmount: Math.max(0, total - adv) }));
    }, [formData.advancedAmount, formData.totalAmount, isViewMode]);

    return (
        <>
            {/* ArtistRevenueModal removed: staff selection is per service row */}

            <div className="bg-white rounded-lg w-full mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Details Section */}
                     <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 text-left">Contact No {!isViewMode && <span className="text-red-500">*</span>}</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <select 
                                    name="countryCode" 
                                    value={formData.countryCode} 
                                    onChange={handleInputChange} 
                                    disabled={isViewMode}
                                    className={`inline-flex items-center pr-8 rounded-l-md border border-r-0 ${isViewMode ? 'bg-gray-50 border-gray-200' : 'border-gray-300 bg-gray-50'} text-gray-700 sm:text-sm focus:ring-teal-500 focus:border-teal-500`}
                                >
                                    <option>+91</option><option>+1</option><option>+44</option><option>+61</option>
                                </select>
                                <input 
                                    type="tel" 
                                    name="contactNo" 
                                    id="contactNo" 
                                    value={formData.contactNo} 
                                    onChange={handlePhoneChange} 
                                    placeholder="PhoneNo." 
                                    required={!isViewMode} 
                                    disabled={isViewMode}
                                    className={`flex-1 block w-full min-w-0 rounded-none rounded-r-md px-3 py-2 border ${isViewMode ? 'bg-gray-50 border-gray-200' : 'border-gray-300'} placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 sm:text-sm`} 
                                />
                            </div>
                            {(phoneLookupLoading || phoneLookupError) && (
                                <div className={`mt-1 text-xs ${phoneLookupError ? 'text-red-600' : 'text-gray-500'}`}>
                                    {phoneLookupLoading ? 'Looking up customer…' : phoneLookupError}
                                </div>
                            )}
                        </div>
                        <InputField label="Customer Name" name="customerName" placeholder="Name*" value={formData.customerName} onChange={handleInputChange} required isReadOnly={isViewMode} />
                        <InputField label="Booking Date & Time" name="bookingDateTime" type="datetime-local" value={formData.bookingDateTime} onChange={handleInputChange} required isReadOnly={isViewMode} />
                        <SelectField label="Gender" name="gender" value={formData.gender} onChange={(e)=> setFormData(prev=>({...prev, gender: normalizeGender(e.target.value)}))} required isReadOnly={isViewMode} options={[{value: 'Male', label: 'Male'}, {value: 'Female', label: 'Female'}, {value: 'Other', label: 'Other'}]} />
                        <InputField label="Email ID" name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} isReadOnly={isViewMode} />
                        <InputField label="Residential Address" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} isReadOnly={isViewMode} />
                    </div>

                    {/* Event Schedule Section */}
                    <div>
                        <div className="flex items-center gap-8 mb-2">
                            <h4 className="text-lg font-semibold text-gray-800 whitespace-nowrap">Event Schedule & Booking Details:</h4>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input 
                                        type="radio" 
                                        id="indoor" 
                                        name="venueType" 
                                        value="Indoor" 
                                        checked={formData.venueType === 'Indoor'} 
                                        onChange={handleInputChange} 
                                        disabled={isViewMode}
                                        className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" 
                                    />
                                    <label htmlFor="indoor" className="ml-2 block text-sm text-gray-900">Indoor</label>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="radio" 
                                        id="outdoor" 
                                        name="venueType" 
                                        value="Outdoor" 
                                        checked={formData.venueType === 'Outdoor'} 
                                        onChange={handleInputChange} 
                                        disabled={isViewMode}
                                        className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" 
                                    />
                                    <label htmlFor="outdoor" className="ml-2 block text-sm text-gray-900">Outdoor</label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="bg-teal-600 text-white grid grid-cols-10 gap-2 p-2 rounded-t-md text-sm font-semibold">
                                <div className="col-span-2">Service</div>
                                <div className="col-span-2">Staff</div>
                                <div className="col-span-1/2">Qty</div>
                                <div className="col-span-2">Date & Time</div>
                                {formData.venueType !== 'Indoor' && (
                                    <div className="col-span-3">Venue</div>
                                )}
                            </div>
                            <div className="space-y-4 pt-4">
                                {serviceRows.map((row, index) => (
                                    <div key={index} className="relative p-2 pr-10 bg-gray-50 rounded-lg">
                                        {serviceRows.length > 1 && !isViewMode && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeServiceRow(index)} 
                                                className="absolute top-3 right-2 bg-transparent p-0.5 rounded-full text-red-500 hover:text-red-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                        <div className="grid grid-cols-10 gap-x-2 items-start">
                                            <div className="col-span-2">
                                                {isViewMode ? (
                                                    <div className="px-3 py-2 text-sm text-gray-800 bg-gray-50 rounded-md border border-gray-200">
                                                        {row.serviceName || servicesList.find(s => s.id === row.serviceId)?.name || '—'}
                                                    </div>
                                                ) : (
                                                    <select
                                                        id={`serviceId-${index}`}
                                                        name="serviceId"
                                                        value={row.serviceId}
                                                        onChange={(e) => handleServiceRowChange(index, 'serviceId', e.target.value)}
                                                        disabled={isViewMode}
                                                        className={`w-full px-3 py-2 rounded-md text-sm ${isViewMode ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'} border shadow-sm`}
                                                    >
                                                        {row.serviceId && row.serviceName && !servicesList.length && (
                                                            <option value={row.serviceId}>{row.serviceName}</option>
                                                        )}
                                                        <option value="">{servicesLoading ? 'Loading services...' : (servicesError ? 'Failed to load services' : 'Select Service')}</option>
                                                        {!servicesLoading && !servicesError && servicesList.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                {isViewMode ? (
                                                    <div className="px-3 py-2 text-sm text-gray-800 bg-gray-50 rounded-md border border-gray-200">
                                                        {row.staffName || (rowStaffOptions[index] || []).find(o => o.id === row.staffId)?.name || '—'}
                                                    </div>
                                                ) : (
                                                    <select
                                                        id={`staffId-${index}`}
                                                        name="staffId"
                                                        value={row.staffId}
                                                        onChange={(e) => handleServiceRowChange(index, 'staffId', e.target.value)}
                                                        disabled={isViewMode || !row.serviceId}
                                                        className={`w-full px-3 py-2 rounded-md text-sm ${isViewMode ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'} border shadow-sm`}
                                                    >
                                                        {row.staffId && row.staffName && !(rowStaffOptions[index] && rowStaffOptions[index].length) && (
                                                            <option value={row.staffId}>{row.staffName}</option>
                                                        )}
                                                        <option value="">
                                                            { !row.serviceId ? 'Select service first' : rowStaffLoading[index] ? 'Loading staff...' : (rowStaffError[index] ? 'Error loading staff' : (rowStaffOptions[index] && rowStaffOptions[index].length ? 'Select Staff' : 'No staff available')) }
                                                        </option>
                                                        {!rowStaffLoading[index] && !rowStaffError[index] && rowStaffOptions[index] && rowStaffOptions[index].map(opt => (
                                                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                            <div className="col-span-1/2">
                                                <InputField 
                                                    name="quantity" 
                                                    type="number" 
                                                    value={row.quantity}
                                                    onChange={(e) => handleServiceRowChange(index, 'quantity', e.target.value)} 
                                                    min="1"
                                                    isReadOnly={isViewMode}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <InputField 
                                                    name="dateTime" 
                                                    type="datetime-local" 
                                                    value={row.dateTime}
                                                    onChange={(e) => handleServiceRowChange(index, 'dateTime', e.target.value)}
                                                    isReadOnly={isViewMode}
                                                />
                                            </div>
                                            {formData.venueType !== 'Indoor' && (
                                                <div className="col-span-3">
                                                    <InputField 
                                                        name="venue" 
                                                        placeholder="Venue" 
                                                        value={row.venue}
                                                        onChange={(e) => handleServiceRowChange(index, 'venue', e.target.value)}
                                                        isReadOnly={isViewMode}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {!isViewMode && (
                            <div className="text-right mt-2">
                                <Button 
                                type="button" 
                                onClick={addServiceRow} 
                                variant="primary"
                                size="sm"
                            >
                                + Add
                            </Button>
                            </div>
                        )}
                    </div>

                    {/* Payment Details Section */}
                    <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-6">
                        <InputField label="Total Amount" name="totalAmount" type="number" placeholder="0.00" value={formData.totalAmount} onChange={(e)=> setFormData(prev=>({...prev, totalAmount: Number(e.target.value)||0}))} isReadOnly={true} />
                        <InputField label="Advanced Amount" name="advancedAmount" type="number" placeholder="0.00" value={formData.advancedAmount} onChange={(e)=> setFormData(prev=>({...prev, advancedAmount: Number(e.target.value)||0}))} isReadOnly={isViewMode} />
                        <SelectField label="Payment Mode" name="payMode" value={formData.payMode} onChange={handleInputChange} options={[{value: 'Cash', label: 'Cash'}, {value: 'Card', label: 'Card'}, {value: 'Online', label: 'Online'}]} isReadOnly={isViewMode} />
                        <InputField label="Payable Amount" name="payableAmount" type="number" placeholder="0.00" value={formData.payableAmount} onChange={(e)=> setFormData(prev=>({...prev, payableAmount: Number(e.target.value)||0}))} isReadOnly={true} />
                    </div>

                    {/* Remarks Section */}
                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 text-left">Remarks/Notes:</label>
                        <textarea 
                            id="remarks" 
                            name="remarks" 
                            rows="3" 
                            value={formData.remarks} 
                            onChange={handleInputChange} 
                            disabled={isViewMode}
                            className={`mt-1 block w-full px-3 py-2 border ${isViewMode ? 'bg-gray-50 border-gray-200' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 sm:text-sm`} 
                            placeholder="Enter Notes"
                        ></textarea>
                    </div>
                    
                    {/* Submit Button - Only show in edit mode */}
                    {!isViewMode && (
                        <div className="text-center p-2">
                            <Button 
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={!isDirty}
                            >
                                {booking?.id ? 'Update Booking' : 'Save Booking'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};
