import React, { useEffect, useState } from 'react';
import { InputField, TextAreaField, Button, FormSection } from '../common/FormElements';
import { customersApi, servicesApi, productsApi, membershipsApi, enquiriesApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';

import { Calendar, Clock, X, PlusCircle } from 'lucide-react';

// Main component for the Enquiry Form

// --- OPTIONS CONFIGURATION ---
const enquiryTypeOptions = ['Hot', 'Cold', 'Warm'];
const enquiryStatusOptions = ['Pending', 'Converted', 'Closed'];
const sourceOfEnquiryOptions = ['Walk-In', 'Instagram', 'Facebook', 'Cold Calling', 'Website', 'Client Reference'];
const enquiryForCategoryOptions = ['Service', 'Membership/Package', 'Product'];

// No static categories are used now (Offers removed for now)
const enquiryForSubOptions = {};


// The Enquiry Form Component


export function EnquiryForm({ mode = 'edit', enquiry, onSave, onCancel }) {
  const isViewMode = mode === 'view';
    const { currentStore } = useStore();
  // State to hold form data
  const [formData, setFormData] = useState({
    contactNo: '',
    name: '',
    gender: '',
    email: '',
    sourceOfEnquiry: '',
    enquiryType: '',
    enquiryStatus: '',
    notes: '',
    countryCode: '+91',
    followUpDate: '',
    followUpTime: '',
  });
    // phone lookup state
    const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
    const [phoneLookupError, setPhoneLookupError] = useState(null);
    const [lastFetchedPhone, setLastFetchedPhone] = useState('');
  
  // State for repeatable enquiry fields
  const [enquiries, setEnquiries] = useState([{ id: 1, enquiryForCategory: '', enquiryForSpecific: '' }]);
    // Dirty tracking
    const [isDirty, setIsDirty] = useState(false);
    const [initialSnapshot, setInitialSnapshot] = useState(null);

    // Dynamic lists for category-specific options
    const [servicesList, setServicesList] = useState([]); // [{id,name}]
    const [productsList, setProductsList] = useState([]); // [{id,name}]
    const [membershipsList, setMembershipsList] = useState([]); // [{id,name}]
    const [listsLoading, setListsLoading] = useState(false);
    const [listsError, setListsError] = useState(null);

  // Handler for regular input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

        // Track gender from lookup to mirror AppointmentForm behavior
        const [lookupGender, setLookupGender] = useState('');
        // Normalize gender to one of ['male','female','other'] like AppointmentForm
        const normalizeGender = (g) => {
            if (!g) return '';
            const v = String(g).trim().toLowerCase();
            if (v === 'm' || v === 'male') return 'male';
            if (v === 'f' || v === 'female') return 'female';
            if (v === 'o' || v === 'other' || v === 'others') return 'other';
            return '';
        };

            // Normalize Source of Enquiry to slug values similar to AppointmentForm style
            const normalizeSource = (s) => {
                if (!s) return '';
                const v = String(s).trim().toLowerCase();
                if (v === 'walk-in' || v === 'walk in') return 'walk-in';
                if (v === 'instagram') return 'instagram';
                if (v === 'facebook') return 'facebook';
                if (v === 'cold calling' || v === 'cold-calling' || v === 'phone') return 'phone';
                if (v === 'website') return 'website';
                if (v === 'client reference' || v === 'client-reference' || v === 'referral') return 'client-reference';
                return v;
            };

    // Fetch customer by full phone number once 10 digits are present
        const fetchCustomerByPhone = async (fullPhone) => {
        if (!currentStore?.id || !fullPhone) return;
        setPhoneLookupLoading(true);
        setPhoneLookupError(null);
        try {
            const res = await customersApi.getByPhone(currentStore.id, fullPhone);
                    if (res.success && res.customer) {
                        const g = normalizeGender(res.customer.gender) || '';
                        setLookupGender(g);
                        setFormData(prev => ({
                            ...prev,
                            name: res.customer.name || '',
                            gender: g
                        }));
            } else {
                setPhoneLookupError('Customer not found');
            }
        } catch (err) {
            console.error(err);
            setPhoneLookupError('Lookup failed');
        } finally {
            setPhoneLookupLoading(false);
            setLastFetchedPhone(fullPhone);
        }
    };
  
  // Handler for changes within the repeatable enquiry fields
  const handleEnquiryChange = (id, e) => {
      const { name } = e.target;
      let { value } = e.target;
      setEnquiries(prevEnquiries => {
          return prevEnquiries.map(enquiry => {
              if (enquiry.id === id) {
                  const updated = { ...enquiry };
                  if (name === 'enquiryForCategory') {
                      updated.enquiryForCategory = normalizeEnquiryCategory(value);
                      updated.enquiryForSpecific = '';
                  } else if (name === 'enquiryForSpecific') {
                      // Store the ID for selected entity
                      updated.enquiryForSpecific = value;
                  }
                  return updated;
              }
              return enquiry;
          });
      });
  };

    // Normalize Enquiry Type to lowercase slugs: hot, cold, warm
    const normalizeEnquiryType = (t) => {
        if (!t) return '';
        const v = String(t).trim().toLowerCase();
        if (v === 'hot') return 'hot';
        if (v === 'cold') return 'cold';
        if (v === 'warm') return 'warm';
        return v;
    };

  // Function to add a new enquiry row
  const addEnquiryRow = () => {
      setEnquiries(prev => [...prev, { id: Date.now(), enquiryForCategory: '', enquiryForSpecific: '' }]);
  };

    // Normalize Enquiry Status: pending, converted, closed
    const normalizeEnquiryStatus = (s) => {
        if (!s) return '';
        const v = String(s).trim().toLowerCase();
        if (v === 'pending') return 'pending';
        if (v === 'converted') return 'converted';
        if (v === 'closed') return 'closed';
        return v;
    };
    // Normalize Enquiry Details category and specific values
    const normalizeEnquiryCategory = (label) => {
        if (!label) return '';
        const v = String(label).trim().toLowerCase();
        if (v === 'service') return 'service';
        if (v === 'membership/package' || v === 'membership-package') return 'membership-package';
        if (v === 'offer') return 'offer';
        if (v === 'product') return 'product';
        return v;
    };
    const slugifyOption = (label) => {
        if (!label) return '';
        return String(label)
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // Fetch dynamic lists when store changes
    useEffect(() => {
        if (!currentStore?.id) return;
        let active = true;
        (async () => {
            setListsLoading(true);
            setListsError(null);
            try {
                const [svcRes, prodRes, memRes] = await Promise.all([
                    servicesApi.getAll(currentStore.id),
                    productsApi.getProducts(currentStore.id),
                    membershipsApi.getAll(currentStore.id)
                ]);
                if (!active) return;
                const svcs = (svcRes?.data?.services || svcRes?.services || []).map(s => ({ id: s.id, name: s.name }));
                const prods = (prodRes?.data?.products || prodRes?.products || prodRes?.data || []).map(p => ({ id: p.id, name: p.name }));
                const mems = (memRes?.data?.memberships || memRes?.memberships || memRes?.data || []).map(m => ({ id: m.id, name: m.name }));
                setServicesList(svcs);
                setProductsList(prods);
                setMembershipsList(mems);
            } catch (err) {
                if (active) setListsError('Failed to load options');
            } finally {
                if (active) setListsLoading(false);
            }
        })();
        return () => { active = false; };
    }, [currentStore?.id]);

        // Initialize form from enquiry prop when provided
        useEffect(() => {
            if (!enquiry) return;
            const parseISOToDateTime = (iso) => {
                if (!iso) return { d: '', t: '' };
                const dt = new Date(iso);
                const yyyy = `${dt.getFullYear()}`;
                const mm = `${dt.getMonth() + 1}`.padStart(2, '0');
                const dd = `${dt.getDate()}`.padStart(2, '0');
                const hh = `${dt.getHours()}`.padStart(2, '0');
                const min = `${dt.getMinutes()}`.padStart(2, '0');
                return { d: `${yyyy}-${mm}-${dd}`, t: `${hh}:${min}` };
            };
            const { d, t } = parseISOToDateTime(enquiry.follow_up_at);
            const normalizedGender = normalizeGender(enquiry.gender) || '';
            const fd = {
                contactNo: enquiry.contact_no || '',
                name: enquiry.name || '',
                gender: normalizedGender,
                email: enquiry.email || '',
                sourceOfEnquiry: enquiry.source || '',
                enquiryType: normalizeEnquiryType(enquiry.enquiry_type) || '',
                enquiryStatus: normalizeEnquiryStatus(enquiry.enquiry_status) || '',
                notes: enquiry.notes || '',
                countryCode: enquiry.country_code || '+91',
                followUpDate: d,
                followUpTime: t,
            };
            const det = (enquiry.enquiry_details || enquiry.details || []).map((it, idx) => ({
                id: idx + 1,
                enquiryForCategory: normalizeEnquiryCategory(it.category),
                enquiryForSpecific: it.reference_id || '',
            }))
            setFormData(fd);
            setEnquiries(det.length ? det : [{ id: 1, enquiryForCategory: '', enquiryForSpecific: '' }]);
            // snapshot for dirty tracking
            setInitialSnapshot(JSON.stringify({ formData: fd, enquiries: det }));
            setIsDirty(false);
        }, [enquiry]);

        // Dirty tracking: compare current state against snapshot
        useEffect(() => {
            const snap = initialSnapshot;
            if (!snap) return;
            const current = JSON.stringify({ formData, enquiries });
            setIsDirty(current !== snap);
        }, [formData, enquiries, initialSnapshot]);

    // Build options for Specific dropdown based on selected category
    const getSpecificOptions = (category) => {
        const cat = normalizeEnquiryCategory(category);
        if (!cat) return [];
        if (cat === 'service') return servicesList.map(s => ({ value: s.id, label: s.name }));
        if (cat === 'product') return productsList.map(p => ({ value: p.id, label: p.name }));
        if (cat === 'membership-package') return membershipsList.map(m => ({ value: m.id, label: m.name }));
        return [];
    };

    // Build backend payload
    const toISODateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;
        const dt = new Date(`${dateStr}T${timeStr}:00`);
        if (isNaN(dt.getTime())) return null;
        return dt.toISOString();
    };

    const buildEnquiryPayload = () => {
        // Map enquiry rows to required shape { category, name, reference_id }
        const enquiry_details = enquiries
            .filter(row => row.enquiryForCategory && row.enquiryForSpecific)
            .map(row => {
                const cat = normalizeEnquiryCategory(row.enquiryForCategory);
                let name = '';
                let reference_id = null;
                if (cat === 'service') {
                    const s = servicesList.find(x => String(x.id) === String(row.enquiryForSpecific));
                    name = s?.name || '';
                    reference_id = s?.id ?? row.enquiryForSpecific;
                } else if (cat === 'product') {
                    const p = productsList.find(x => String(x.id) === String(row.enquiryForSpecific));
                    name = p?.name || '';
                    reference_id = p?.id ?? row.enquiryForSpecific;
                } else if (cat === 'membership-package') {
                    const m = membershipsList.find(x => String(x.id) === String(row.enquiryForSpecific));
                    name = m?.name || '';
                    reference_id = m?.id ?? row.enquiryForSpecific;
                }
                return { category: cat, name, reference_id };
            });

        return {
            contact_no: formData.contactNo,
            country_code: formData.countryCode,
            name: formData.name,
            gender: formData.gender, // already normalized to one of: male|female|other
            email: formData.email || undefined,
            source: normalizeSource(formData.sourceOfEnquiry), // website|walk-in|phone|instagram|facebook|google (examples)
            enquiry_type: normalizeEnquiryType(formData.enquiryType), // hot|cold|warm
            enquiry_status: normalizeEnquiryStatus(formData.enquiryStatus), // pending|converted|closed
            notes: formData.notes || '',
            follow_up_at: toISODateTime(formData.followUpDate, formData.followUpTime),
            enquiry_details,
        };
    };
  
  // Function to remove an enquiry row
  const removeEnquiryRow = (id) => {
      // Prevent removing the last row
      if (enquiries.length > 1) {
        setEnquiries(prev => prev.filter(enquiry => enquiry.id !== id));
      }
  };


  // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.contactNo || !formData.name || !formData.gender) {
            console.error('Please fill in all required fields.');
            return;
        }
        // Build normalized payload for backend
        const payload = buildEnquiryPayload();
        try {
            let resp;
            if (enquiry?.id) {
                resp = await enquiriesApi.update(currentStore.id, enquiry.id, payload);
            } else {
                resp = await enquiriesApi.create(currentStore.id, payload);
            }
            onSave && onSave(resp?.data || resp);
        } catch (err) {
            console.error('Failed to save enquiry:', err);
        }
    };

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid for form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

          {/* Left Column */}
          <div className="space-y-6">
            <div>
                <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Contact No {!isViewMode && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <select 
                        name="countryCode" 
                        value={formData.countryCode} 
                        onChange={handleChange}
                        disabled={isViewMode}
                        className={`inline-flex items-center pr-8 rounded-l-md border border-r-0 ${
                            isViewMode ? 'bg-gray-50 border-gray-200' : 'border-gray-300 bg-gray-50'
                        } text-gray-700 sm:text-sm focus:ring-teal-500 focus:border-teal-500`}
                    >
                        <option>+91</option><option>+1</option><option>+44</option><option>+61</option>
                    </select>
                                        <input 
                                                type="tel" 
                                                name="contactNo" 
                                                id="contactNo" 
                                                value={formData.contactNo} 
                                                onChange={(e) => {
                                                    const digits = e.target.value.replace(/[^0-9]/g, '');
                                                    setFormData(prev => ({ ...prev, contactNo: digits }));
                                                    if (!isViewMode && digits.length === 10) {
                                                        const fullPhone = `${formData.countryCode || '+91'}${digits}`;
                                                        if (fullPhone !== lastFetchedPhone) {
                                                            fetchCustomerByPhone(fullPhone);
                                                        }
                                                    }
                                                }} 
                                                placeholder="Phone No." 
                                                required={!isViewMode}
                                                disabled={isViewMode}
                                                className={`flex-1 block w-full min-w-0 rounded-none rounded-r-md px-3 py-2 border ${
                                                        isViewMode ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                                                } placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 sm:text-sm`} 
                                        />
                </div>
                                {(phoneLookupLoading || phoneLookupError) && (
                                    <div className={`mt-1 text-xs ${phoneLookupError ? 'text-red-600' : 'text-gray-500'}`}>
                                        {phoneLookupLoading ? 'Looking up customer…' : phoneLookupError}
                                    </div>
                                )}
            </div>
            <InputField 
                label="Name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Name*" 
                required 
                isReadOnly={isViewMode}
            />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Gender {!isViewMode && <span className="text-red-500">*</span>}
                </label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => {
                        const v = normalizeGender(e.target.value);
                        setFormData(prev => ({ ...prev, gender: v }));
                    }}
                    disabled={isViewMode}
                    required={!isViewMode}
                    className={`w-full px-3 py-2 rounded-md text-sm ${
                        isViewMode 
                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
                    } border shadow-sm`}
                >
                    <option value="">Gender*</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <InputField 
                label="Email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Email" 
                isReadOnly={isViewMode}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Source Of Enquiry {!isViewMode && <span className="text-red-500">*</span>}
                </label>
                <select
                    name="sourceOfEnquiry"
                    value={formData.sourceOfEnquiry}
                    onChange={(e) => {
                        const v = normalizeSource(e.target.value);
                        setFormData(prev => ({ ...prev, sourceOfEnquiry: v }));
                    }}
                    disabled={isViewMode}
                    required={!isViewMode}
                    className={`w-full px-3 py-2 rounded-md text-sm ${
                        isViewMode 
                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
                    } border shadow-sm`}
                >
                    <option value="">Select Source</option>
                    {sourceOfEnquiryOptions.map(label => {
                        const value = normalizeSource(label);
                        return (
                            <option key={value} value={value}>{label}</option>
                        );
                    })}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Enquiry Type {!isViewMode && <span className="text-red-500">*</span>}
                </label>
                <select
                    name="enquiryType"
                    value={formData.enquiryType}
                    onChange={(e) => {
                        const v = normalizeEnquiryType(e.target.value);
                        setFormData(prev => ({ ...prev, enquiryType: v }));
                    }}
                    disabled={isViewMode}
                    required={!isViewMode}
                    className={`w-full px-3 py-2 rounded-md text-sm ${
                        isViewMode 
                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
                    } border shadow-sm`}
                >
                    <option value="">- Select a type -</option>
                    {enquiryTypeOptions.map(label => (
                        <option key={label.toLowerCase()} value={label.toLowerCase()}>{label}</option>
                    ))}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Enquiry Status {!isViewMode && <span className="text-red-500">*</span>}
                </label>
                <select
                    name="enquiryStatus"
                    value={formData.enquiryStatus}
                    onChange={(e) => {
                        const v = normalizeEnquiryStatus(e.target.value);
                        setFormData(prev => ({ ...prev, enquiryStatus: v }));
                    }}
                    disabled={isViewMode}
                    required={!isViewMode}
                    className={`w-full px-3 py-2 rounded-md text-sm ${
                        isViewMode 
                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
                    } border shadow-sm`}
                >
                    <option value="">Select Status</option>
                    {enquiryStatusOptions.map(label => (
                        <option key={label.toLowerCase()} value={label.toLowerCase()}>{label}</option>
                    ))}
                </select>
            </div>
             {/* Follow Up Date & Time */}
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Follow Up Date & Time {!isViewMode && <span className="text-red-500">*</span>}
                 </label>
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <input
                            type="date"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleChange}
                            required={!isViewMode}
                            disabled={isViewMode}
                            className={`w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                isViewMode ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                            }`}
                        />
                    </div>
                    <div className="relative flex-1">
                        <input
                            type="time"
                            name="followUpTime"
                            value={formData.followUpTime}
                            onChange={handleChange}
                            required={!isViewMode}
                            disabled={isViewMode}
                            className={`w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                isViewMode ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                            }`}
                        />
                    </div>
                </div>
            </div>
          </div>
          
           {/* --- REPEATABLE ENQUIRY SECTION --- */}
            <div className="md:col-span-2 space-y-4">
                <h4 className="text-lg font-medium text-gray-900 text-left">Enquiry Details</h4>
                {enquiries.map((enquiry, index) => (
                    <div key={enquiry.id} className="p-2 rounded-lg">
                        <div className="grid grid-cols-[40%_40%_10%] gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                    Category {!isViewMode && <span className="text-red-500">*</span>}
                                </label>
                                <select
                                    name="enquiryForCategory"
                                    value={enquiry.enquiryForCategory}
                                    onChange={(e) => handleEnquiryChange(enquiry.id, e)}
                                    disabled={isViewMode}
                                    required={!isViewMode}
                                    className={`w-full px-3 py-2 rounded-md text-sm ${
                                        isViewMode 
                                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                                            : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
                                    } border shadow-sm`}
                                >
                                    <option value="">Select Category</option>
                                    {enquiryForCategoryOptions.map(label => (
                                        <option key={normalizeEnquiryCategory(label)} value={normalizeEnquiryCategory(label)}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {enquiry.enquiryForCategory && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                        Specific {!isViewMode && <span className="text-red-500">*</span>}
                                    </label>
                                    <select
                                        name="enquiryForSpecific"
                                        value={enquiry.enquiryForSpecific}
                                        onChange={(e) => handleEnquiryChange(enquiry.id, e)}
                                        disabled={isViewMode}
                                        required={!isViewMode}
                                        className={`w-full px-3 py-2 rounded-md text-sm ${
                                            isViewMode 
                                                ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                                                : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
                                        } border shadow-sm`}
                                    >
                                        <option value="">Select Specific Item</option>
                                        {getSpecificOptions(enquiry.enquiryForCategory).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                {!isViewMode && enquiries.length > 1 && (
                                    <Button 
                                        type="button" 
                                        onClick={() => removeEnquiryRow(enquiry.id)} 
                                        variant="icon" 
                                        color="danger"
                                    >
                                        <X size={20} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {!isViewMode && (
                    <Button 
                        type="button" 
                        onClick={addEnquiryRow} 
                        variant="outlined"
                        color="primary"
                        className="flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        Add More
                    </Button>
                )}
            </div>

           {/* Remarks/Notes - Full Width */}
          <div className="md:col-span-2 text-left">
            <TextAreaField 
                label="Remarks/Notes" 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Enter Notes" 
                isReadOnly={isViewMode}
            />
          </div>
        </div>

        {/* Submit Button - Only show in edit mode */}
        {!isViewMode && (
            <div className="flex justify-center pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={!isDirty}
                >
                    {enquiry?.id ? 'Update Enquiry' : 'Save Enquiry'}
                </Button>
            </div>
        )}
      </form>
    </div>
  );
}


// --- Main Enquiry Form Component ---

