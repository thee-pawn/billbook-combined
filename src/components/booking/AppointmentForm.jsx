import { color } from 'framer-motion';
import { Delete, DeleteIcon, Trash2 } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { InputField, SelectField, Button, FormSection } from '../common/FormElements';
import { DeleteConfirmationModal } from '@components/common/DeleteConfirmationModal';
import { servicesApi, storesApi, staffApi, customersApi, appointmentsApi } from '../../apis/APIs';

import { useStore } from '../login/StoreContext';

export const AppointmentCompletionConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Do you want to delete this item? This action cannot be undone.',
  confirmText = 'Complete and Start Billing',
  cancelText = 'Cancel',
  danger = false,
  details,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white border border-gray-300 rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {details}
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md border border-gray-300 hover:bg-gray-50">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-white font-medium rounded-md ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

function AppointmentForm({ appointment, customers, services: servicesProp, staff, statuses, onSave, onCancel, newAppointment, isReadOnly = false }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(appointment);
  const [serviceRows, setServiceRows] = useState([{ serviceId: '', staffId: '' }]);
  const [serviceTime, setServiceTime] = useState(0);
  const { currentStore } = useStore();
  const [timeSlots, setTimeSlots] = useState([]); // generated slots
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  // Services fetched from backend (fallback to passed prop if provided later)
  const [services, setServices] = useState(servicesProp || []);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  // Dynamic staff options per service row
  const [staffOptionsCache, setStaffOptionsCache] = useState({}); // serviceId -> [{id,name}]
  const [rowStaffOptions, setRowStaffOptions] = useState([]); // index -> options array
  const [rowStaffLoading, setRowStaffLoading] = useState([]); // index -> boolean
  const [rowStaffError, setRowStaffError] = useState([]); // index -> error string or null
  // Customer phone lookup state
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
  const [phoneLookupError, setPhoneLookupError] = useState(null);
  const [lastFetchedPhone, setLastFetchedPhone] = useState('');
  const [lookupGender, setLookupGender] = useState('');
  // Appointment submission state
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [appointmentError, setAppointmentError] = useState(null);
  // Dirty tracking
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  // Complete-before-billing modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);


  // Helpers to parse values from backend
  const parsePhone = (phone) => {
    if (!phone) return { code: '+91', local: '' };
    const m = String(phone).match(/^\+(\d{1,3})/);
    const codeDigits = m ? m[1] : '91';
    const code = `+${codeDigits}`;
    const digits = String(phone).replace(/\D/g, '');
    const local = digits.slice(codeDigits.length);
    return { code, local };
  };
  const toDateInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const timeLabel12h = (hhmm) => {
    if (!hhmm) return '';
    const [hStr, mStr] = hhmm.split(':');
    const h = Number(hStr);
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${hour12}:${mStr} ${ampm}`;
  };

  // Update form data if the appointment prop changes (e.g., when opening modal for edit/view)
  useEffect(() => {
    if (!appointment) return;
    const { code, local } = parsePhone(appointment.phoneNumber || appointment.contactNo);
    const normalizedGender = normalizeGender(appointment.gender) || '';
    const mapped = {
      countryCode: code,
      contactNo: local,
      customerName: appointment.customerName || appointment.name || '',
      gender: normalizedGender,
      source: appointment.source || '',
      date: toDateInput(appointment.date || appointment.date_time || appointment.dateTime),
      time: appointment.time || '',
      status: appointment.status || 'scheduled',
      totalAmount: appointment.totalAmount ?? appointment.total_amount ?? 0,
      paidAmount: appointment.advanceAmount ?? appointment.advance_amount ?? 0,
      paymentMode: appointment.paymentMode || appointment.payment_mode || '',
      notes: appointment.notes || ''
    };
    setFormData(mapped);
    // map services rows
    const rows = (appointment.services || appointment.items || []).map(s => ({
      serviceId: s.serviceId || s.service_id || '',
      staffId: s.staffId || s.staff_id || ''
    }));
    setServiceRows(rows.length ? rows : [{ serviceId: '', staffId: '' }]);
    // set initial snapshot for dirty tracking (exclude computed totalAmount)
    const snapshot = {
      form: {
        countryCode: mapped.countryCode || '+91',
        contactNo: mapped.contactNo || '',
        customerName: mapped.customerName || '',
        gender: mapped.gender || '',
        source: mapped.source || '',
        date: mapped.date || '',
        time: mapped.time || '',
        status: mapped.status || 'scheduled',
        paidAmount: mapped.paidAmount || 0,
        paymentMode: mapped.paymentMode || '',
        notes: mapped.notes || ''
      },
      rows: (rows.length ? rows : [{ serviceId: '', staffId: '' }]).map(r => ({
        serviceId: r.serviceId || '',
        staffId: r.staffId || ''
      }))
    };
    setInitialSnapshot(snapshot);
    // prepare row state arrays and fetch staff options for visible rows
    setRowStaffOptions(Array((rows.length || 1)).fill([]));
    setRowStaffLoading(Array((rows.length || 1)).fill(false));
    setRowStaffError(Array((rows.length || 1)).fill(null));
    rows.forEach((r, idx) => { if (r.serviceId) fetchStaffForService(r.serviceId, idx); });
  }, [appointment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generate 15-min interval slots between opening and closing (inclusive of opening, inclusive of closing if on interval)
  const generateSlots = useCallback((open, close) => {
    if (!open || !close) return [];
    const [openH, openM] = open.split(':').map(Number);
    const [closeH, closeM] = close.split(':').map(Number);
    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;
    const slots = [];
    for (let m = startMinutes; m <= endMinutes; m += 15) {
      const h = Math.floor(m / 60);
      const mm = m % 60;
      const label24 = `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      // Convert to 12h am/pm
      const hour12 = ((h + 11) % 12) + 1;
      const ampm = h < 12 ? 'AM' : 'PM';
      const label12 = `${hour12}:${String(mm).padStart(2, '0')} ${ampm}`;
      slots.push({ value: label24, label: label12 });
    }
    return slots;
  }, []);

  // Fetch availability whenever date changes
  useEffect(() => {
    const date = formData.date;
    if (!date || !currentStore?.id) { setTimeSlots([]); return; }
    let active = true;
    (async () => {
      setLoadingSlots(true); setAvailabilityError(null);
      try {
        const res = await storesApi.getAvailability(currentStore.id, date);
        if (!active) return;
        if (res.success && res.isOpen && res.opening && res.closing) {
          const slots = generateSlots(res.opening, res.closing);
          setTimeSlots(slots);
          // If current selected time not in new slots, reset
          if (!slots.find(s => s.value === formData.time)) {
            setFormData(prev => ({ ...prev, time: '' }));
          }
        } else {
          setTimeSlots([]);
        }
      } catch (err) {
        if (active) { setAvailabilityError('Failed to load time slots'); setTimeSlots([]); }
      } finally { if (active) setLoadingSlots(false); }
    })();
    return () => { active = false; };
  }, [formData.date, currentStore?.id, generateSlots]);

  const handleServiceRowChange = (index, name, value) => {
    const updatedServiceRows = [...serviceRows];
    updatedServiceRows[index][name] = value;
    // If service changed, reset staffId and related row staff state, then fetch
    if (name === 'serviceId') {
      updatedServiceRows[index].staffId = '';
      // Reset row specific states
      setRowStaffOptions(prev => { const clone = [...prev]; clone[index] = []; return clone; });
      setRowStaffError(prev => { const clone = [...prev]; clone[index] = null; return clone; });
      setRowStaffLoading(prev => { const clone = [...prev]; clone[index] = true; return clone; });
    }
    setServiceRows(updatedServiceRows);
    updateServiceTime();
    if (name === 'serviceId' && value) {
      fetchStaffForService(value, index);
    }
  };

  // Normalize gender to one of ['male','female','other']
  const normalizeGender = useCallback((g) => {
    if (!g) return '';
    const v = String(g).trim().toLowerCase();
    if (v === 'm' || v === 'male') return 'male';
    if (v === 'f' || v === 'female') return 'female';
    if (v === 'other' || v === 'o' || v === 'others') return 'other';
    return '';
  }, []);

  // Fetch customer by full phone number once 10 digits entered
  const fetchCustomerByPhone = useCallback(async (fullPhone) => {
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
          customerName: prev.customerName || res.customer.name || '',
          gender: g || prev.gender || ''
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
  }, [currentStore?.id]);

  // Fetch staff capable of selected service for a row (with caching)
  const fetchStaffForService = useCallback(async (serviceId, rowIndex) => {
    if (!serviceId || !currentStore?.id) return;
    // If cached, use it
    if (staffOptionsCache[serviceId]) {
      setRowStaffOptions(prev => {
        const clone = [...prev];
        clone[rowIndex] = staffOptionsCache[serviceId];
        return clone;
      });
      return;
    }
    setRowStaffLoading(prev => { const clone = [...prev]; clone[rowIndex] = true; return clone; });
    setRowStaffError(prev => { const clone = [...prev]; clone[rowIndex] = null; return clone; });
    try {
      const res = await staffApi.getByService(currentStore.id, serviceId);
      const options = res.success ? (res.data || []) : [];
      setStaffOptionsCache(prev => ({ ...prev, [serviceId]: options }));
      setRowStaffOptions(prev => { const clone = [...prev]; clone[rowIndex] = options; return clone; });
    } catch (err) {
      setRowStaffError(prev => { const clone = [...prev]; clone[rowIndex] = 'Failed to load staff'; return clone; });
      setRowStaffOptions(prev => { const clone = [...prev]; clone[rowIndex] = []; return clone; });
    } finally {
      setRowStaffLoading(prev => { const clone = [...prev]; clone[rowIndex] = false; return clone; });
    }
  }, [currentStore?.id, staffOptionsCache]);

  const updateServiceTime = (rowsArg) => {
    const rows = rowsArg || serviceRows;
    let total = 0;
    rows.forEach((r) => {
      const svc = services.find(s => s.id === r.serviceId);
      total += svc?.duration || 0;
    });
    setServiceTime(total);
  };

  // Build payload for API submission
  const buildAppointmentPayload = () => {
    const selectedServices = serviceRows
      .filter(r => r.serviceId && r.staffId)
      .map(r => ({ serviceId: r.serviceId, staffId: r.staffId }));
    const totalDurationMinutes = serviceRows.reduce((acc, r) => {
      const svc = services.find(s => s.id === r.serviceId);
      return acc + (svc?.duration || 0);
    }, 0);
  const normalizedGender = normalizeGender(formData.gender) || normalizeGender(lookupGender) || 'other';
    return {
      phoneNumber: `${formData.countryCode || '+91'}${formData.contactNo || ''}`,
      customerName: formData.customerName || '',
      gender: normalizedGender,
      source: formData.source || '',
      date: formData.date,
      time: formData.time,
      status: formData.status || 'scheduled',
      services: selectedServices,
      totalDurationMinutes,
      totalAmount: formData.totalAmount || 0,
      advanceAmount: formData.paidAmount || 0,
      payableAmount: Math.max(0, (formData.totalAmount || 0) - (formData.paidAmount || 0)),
      paymentMode: formData.paymentMode || '',
      notes: formData.notes || ''
    };
  };

  // Recalculate total amount whenever selected services or services list changes
  useEffect(() => {
    if (!services || services.length === 0) return;
    let total = 0;
    serviceRows.forEach(r => {
      const svc = services.find(s => s.id === r.serviceId);
      if (svc && typeof svc.price !== 'undefined') {
        const priceNum = Number(svc.price);
        if (!isNaN(priceNum)) total += priceNum;
      }
    });
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [serviceRows, services]);

  // Compute dirty state by comparing current snapshot to initial
  const isDirty = useMemo(() => {
    if (!initialSnapshot) return false;
    const currentSnapshot = {
      form: {
        countryCode: formData.countryCode || '+91',
        contactNo: formData.contactNo || '',
        customerName: formData.customerName || '',
        gender: formData.gender || '',
        source: formData.source || '',
        date: formData.date || '',
        time: formData.time || '',
        status: formData.status || 'scheduled',
        paidAmount: formData.paidAmount || 0,
        paymentMode: formData.paymentMode || '',
        notes: formData.notes || ''
      },
      rows: (serviceRows && serviceRows.length ? serviceRows : [{ serviceId: '', staffId: '' }]).map(r => ({
        serviceId: r.serviceId || '',
        staffId: r.staffId || ''
      }))
    };
    try {
      return JSON.stringify(currentSnapshot) !== JSON.stringify(initialSnapshot);
    } catch {
      // Fallback to enabling update if comparison fails
      return true;
    }
  }, [formData, serviceRows, initialSnapshot]);

  // Fetch services on mount / store change
  useEffect(() => {
    if (!currentStore?.id) return;
    let active = true;
    (async () => {
      setServicesLoading(true); setServicesError(null);
      try {
        const res = await servicesApi.getAll(currentStore.id);
        if (!active) return;
        const list = res?.data?.services || res?.services || [];
        setServices(list);
      } catch (err) {
        if (active) setServicesError('Failed to load services');
      } finally { if (active) setServicesLoading(false); }
    })();
    return () => { active = false; };
  }, [currentStore?.id]);

  const addServiceRow = () => {
    const updated = [...serviceRows, { serviceId: '', staffId: '' }];
    setServiceRows(updated);
    setRowStaffOptions(prev => [...prev, []]);
    setRowStaffLoading(prev => [...prev, false]);
    setRowStaffError(prev => [...prev, null]);
    updateServiceTime(updated);
  };

  const deleteServiceRow = (index) => {
    const updated = serviceRows.filter((_, i) => i !== index);
    setServiceRows(updated);
    setRowStaffOptions(prev => prev.filter((_, i) => i !== index));
    setRowStaffLoading(prev => prev.filter((_, i) => i !== index));
    setRowStaffError(prev => prev.filter((_, i) => i !== index));
    updateServiceTime(updated);
  };


  const labelStyle = "block text-sm font-medium text-gray-700 mb-1 text-left";

  const inputStyle = `w-full border rounded px-3 py-2 text-sm focus:outline-none ${isReadOnly
      ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed'
      : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
    }`;

  // Prevent form submission in view mode
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly || appointmentSaving) return;
    // For updates, avoid submitting when nothing changed
    if (!newAppointment && !isDirty) return;
    const payload = buildAppointmentPayload();
    if (newAppointment) {
      if (!currentStore?.id) return;
      setAppointmentSaving(true);
      setAppointmentError(null);
      appointmentsApi.create(currentStore.id, payload)
        .then(res => {
          if (res?.success) {
            onSave(res);
          } else {
            setAppointmentError(res?.message || 'Failed to create appointment');
          }
        })
        .catch(err => {
          setAppointmentError('Error creating appointment');
          console.error(err);
        })
        .finally(() => setAppointmentSaving(false));
    } else {
      // Update existing appointment via API, include status from formData
      if (!currentStore?.id || !appointment?.id) {
        const formDataWithServices = { ...formData, services: serviceRows };
        return onSave(formDataWithServices);
      }
      setAppointmentSaving(true);
      setAppointmentError(null);
      const updatePayload = { ...payload, status: formData.status || payload.status || 'scheduled' };
      appointmentsApi.update(currentStore.id, appointment.id, updatePayload)
        .then(res => {
          if (res?.success) {
            onSave(res);
          } else {
            setAppointmentError(res?.message || 'Failed to update appointment');
          }
        })
        .catch(err => {
          setAppointmentError('Error updating appointment');
          console.error(err);
        })
        .finally(() => setAppointmentSaving(false));
    }
  };

  // Helper to build prefill items from selected services
  const buildBillingItemsFromServices = () => {
    return (serviceRows || [])
      .filter(r => r.serviceId)
      .map(r => {
        const svc = (services || []).find(s => s.id === r.serviceId) || {};
        return {
          type: 'Service',
          serviceId: r.serviceId,
          name: svc.name || 'Service',
          qty: 1,
          price: Number(svc.price || 0),
          gst: Number(svc.gst || svc.tax || 18),
          staffId: r.staffId || null
        };
      });
  };

  // Navigate to Billing; if not completed, confirm to mark completed and update before proceeding
  const handleGenerateBill = async () => {
    const statusVal = (formData.status || appointment?.status || '').toString().toLowerCase();
    const isDone = ['completed', 'done', 'finished'].includes(statusVal);
    const fullPhone = `${formData.countryCode || '+91'}${formData.contactNo || ''}`;

    // If not completed, ask user to mark completed and proceed
    if (!isDone) {
      setCompleteModalOpen(true);
      return;
    }

    // Proceed to billing with prefilled data
    const items = buildBillingItemsFromServices();
    navigate('/billing', {
      state: {
        mode: 'prefill',
        source: 'appointment',
        appointmentId: appointment?.id || null,
        customerPhone: fullPhone,
        customerName: formData.customerName || '',
        items,
        date: formData.date,
        time: formData.time
      }
    });
  };

  const confirmCompleteAndStartBilling = async () => {
    setCompleteModalOpen(false);
    try {
      if (currentStore?.id && appointment?.id) {
        const payload = { ...buildAppointmentPayload(), status: 'completed' };
        await appointmentsApi.update(currentStore.id, appointment.id, payload);
      }
      setFormData(prev => ({ ...prev, status: 'completed' }));
    } catch (e) {
      console.warn('Failed to update appointment status to completed before billing:', e);
      // proceed regardless
    }
    const items = buildBillingItemsFromServices();
    const fullPhone = `${formData.countryCode || '+91'}${formData.contactNo || ''}`;
    navigate('/billing', {
      state: {
        mode: 'prefill',
        source: 'appointment',
        appointmentId: appointment?.id || null,
        customerPhone: fullPhone,
        customerName: formData.customerName || '',
        items,
        date: formData.date,
        time: formData.time
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className='grid sm:grid-cols-1 lg:grid-cols-[40%_50%_10%] md:grid-cols-2 gap-8'>
        <label htmlFor="contactNumber" className={labelStyle}>Contact Number<span style={{ color: "red" }}>*</span></label>
        <div>

          <div className="mt-1 flex rounded-md shadow-sm">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              disabled={isReadOnly}
              className={`inline-flex items-center pr-8 rounded-l-md border border-r-0 ${isReadOnly
                  ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed'
                  : 'border-gray-300 bg-gray-50 text-gray-700 focus:ring-teal-500 focus:border-teal-500'
                } sm:text-sm`}
            >
              <option>+91</option><option>+1</option><option>+44</option><option>+61</option>
            </select>
            <input
              type="tel"
              name="contactNo"
              id="contactNo"
              value={formData.contactNo}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                // Keep only digits in state for contactNo, reconstruct full phone with countryCode when needed
                setFormData(prev => ({ ...prev, contactNo: val }));
                if (val.length === 10) {
                  const fullPhone = `${formData.countryCode || '+91'}${val}`;
                  if (fullPhone !== lastFetchedPhone) {
                    fetchCustomerByPhone(fullPhone);
                  }
                }
              }}
              placeholder="PhoneNo."
              required
              disabled={isReadOnly}
              className={`flex-1 block w-full min-w-0 rounded-none rounded-r-md px-3 py-2 border ${isReadOnly
                  ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed'
                  : 'border-gray-300 placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500'
                } sm:text-sm`}
            />
          </div>
          {(phoneLookupLoading || phoneLookupError) && (
            <div className="mt-1 text-xs {phoneLookupError ? 'text-red-600' : 'text-gray-500'}">
              {phoneLookupLoading ? 'Looking up customer…' : phoneLookupError}
            </div>
          )}
        </div>
      </div>
      <div className='grid grid-cols-[40%_50%_10%] md:grid-cols-2 gap-8'>
        <label htmlFor="customerId" className={labelStyle}>Customer Name<span style={{ color: "red" }}>*</span></label>
        <input
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          required
          disabled={isReadOnly}
          className={inputStyle}
        />
      </div>
      <div className='grid grid-cols-[40%_50%_10%] md:grid-cols-1 gap-8'>
        <label htmlFor="gender" className={labelStyle}>Gender<span style={{ color: "red" }}>*</span></label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={(e) => {
            const v = normalizeGender(e.target.value);
            setFormData(prev => ({ ...prev, gender: v }));
          }}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
        >
          <option value="" disabled> Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className='grid grid-cols-[40%_50%_10%] md:grid-cols-2 gap-8'>
        <label htmlFor="source" className={labelStyle}>Source</label>
        <select
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
        >
          <option value="" disabled> Select Source</option>
          <option value="walk-in">Walk-In</option>
          <option value="website">Website</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="google">Google</option>
          <option value="referral">Referral</option>
        </select>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='grid grid-cols-[30%_30%_30%_10%] md:grid-cols-1 gap-4'>
          <label htmlFor="name" className={labelStyle}>Date & Time<span style={{ color: "red" }}>*</span></label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date} // Should be YYYY-MM-DD
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
          <select
            id="time"
            name="time"
            value={formData.time || ''}
            onChange={handleChange}
            required
            disabled={loadingSlots || isReadOnly || !formData.date}
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white ${loadingSlots ? 'opacity-60' : ''}`}
          >
            {loadingSlots && <option value="">Loading slots...</option>}
            {!loadingSlots && timeSlots.length === 0 && <option value="">No slots available</option>}
            {!loadingSlots && timeSlots.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
            {/* Ensure current time is visible even if not in slots */}
            {!loadingSlots && formData.time && !timeSlots.find(s => s.value === formData.time) && (
              <option value={formData.time}>{timeLabel12h(formData.time)}</option>
            )}
          </select>
        </div>
      </div>

      {servicesError && <div className='text-sm text-red-600'> {servicesError} </div>}
      {serviceRows.map((row, index) => (
        <div key={index} className='grid grid-cols-[30%_30%_30%_10%] md:grid-cols-2 gap-4 items-center'>
          <label htmlFor={`serviceId-${index}`} className={labelStyle}>Service</label>
          <select
            id={`serviceId-${index}`}
            name="serviceId"
            value={row.serviceId}
            onChange={(e) => handleServiceRowChange(index, 'serviceId', e.target.value)}
            required
            disabled={isReadOnly || servicesLoading || services.length===0}
            className={inputStyle}
          >
            <option value="" disabled>{servicesLoading ? 'Loading services...' : services.length===0 ? 'No services' : 'Select Service'}</option>
            {!servicesLoading && services.map(serv => (
              <option key={serv.id} value={serv.id}>{serv.name}</option>
            ))}
          </select>
          <select
            id={`staffId-${index}`}
            name="staffId"
            value={row.staffId}
            onChange={(e) => handleServiceRowChange(index, 'staffId', e.target.value)}
            required
            disabled={isReadOnly || !row.serviceId || rowStaffLoading[index]}
            className={inputStyle}
          >
            <option value="" disabled>
              { !row.serviceId ? 'Select service first' : rowStaffLoading[index] ? 'Loading staff...' : (rowStaffError[index] ? 'Error loading staff' : (rowStaffOptions[index] && rowStaffOptions[index].length ? 'Select Staff' : 'No staff available')) }
            </option>
            {!rowStaffLoading[index] && !rowStaffError[index] && rowStaffOptions[index] && rowStaffOptions[index].map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
          {rowStaffError[index] && <span className='text-xs text-red-600'>{rowStaffError[index]}</span>}
          {!isReadOnly && (
            <Trash2
              size={16}
              onClick={() => deleteServiceRow(index)}
              color='red'
              className="cursor-pointer"
            />
          )}
        </div>
      ))}
      {!isReadOnly && (
        <div className='flex flex-row justify-end mr-10'>
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
      <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
        <div>
          <label htmlFor="toalAmount" className={labelStyle + 'justify-center'}>Total Amount</label>
          <input
            type="number"
            id="totalAmount"
            name="totalAmount"
            value={formData.totalAmount}
            readOnly
            className="w-full border border-gray-200 bg-gray-100 cursor-not-allowed rounded px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Auto-calculated from selected services</p>
        </div>
        <div>
          <label htmlFor="paidAmount" className={labelStyle + 'justify-center'}>Advance Amount</label>
          <input
            type="number"
            id="paidAmount"
            name="paidAmount"
            value={formData.paidAmount ?? 0}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label htmlFor="paymentMode" className={labelStyle + 'justify-center'}>Payment Mode</label>
          <select
            id="paymentMode"
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            <option value="" disabled>Select Payment Mode</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>
        <div>
          <label htmlFor="balanceAmount" className={labelStyle + 'justify-center'}>Payable Amount</label>
          <input
            type="number"
            id="balanceAmount"
            name="balanceAmount"
            value={Math.max(0, (formData.totalAmount || 0) - (formData.paidAmount || 0))}
            readOnly
            className="w-full border border-gray-200 bg-gray-100 cursor-not-allowed rounded px-3 py-2 text-sm"
          />
        </div>

      </div>
      <div className='grid grid-cols-[40%_50%_10%] md:grid-cols-2 gap-8'>
        <label htmlFor="estimatedTime" className={labelStyle}>Estimated Time : {Math.floor(serviceTime / 60) + 'hr ' + serviceTime % 60 + 'min'}</label>
      </div>

      {!isReadOnly &&
        <div className="flex justify-center">
          {newAppointment ? (
            <Button
              type="submit"
              variant="primary"
              size='lg'
              disabled={appointmentSaving}
            >
              {appointmentSaving ? 'Saving...' : 'Save Appointment'}
            </Button>
          ) : (
            <div className="grid grid-cols-3 gap-4 w-full">
              <Button
                type="button"
                variant="danger"
                className="w-full"
                onClick={async () => {
                  if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
                  if (!currentStore?.id || !appointment?.id) {
                    return onSave({ ...formData, status: 'cancelled' });
                  }
                  try {
                    setAppointmentSaving(true);
                    setAppointmentError(null);
                    const cancelPayload = { ...buildAppointmentPayload(), status: 'cancelled' };
                    const res = await appointmentsApi.update(currentStore.id, appointment.id, cancelPayload);
                    if (res?.success) {
                      onSave(res);
                    } else {
                      setAppointmentError(res?.message || 'Failed to cancel appointment');
                    }
                  } catch (err) {
                    console.error(err);
                    setAppointmentError('Error cancelling appointment');
                  } finally {
                    setAppointmentSaving(false);
                  }
                }}
              >
                Cancel Appointment
              </Button>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={appointmentSaving || !isDirty}
              >
                Update Appointment
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleGenerateBill}
              >
                Generate Bill
              </Button>
            </div>
          )}
        </div>
      }
      {appointmentError && <div className='text-center text-sm text-red-600'>{appointmentError}</div>}
      <AppointmentCompletionConfirmation
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onConfirm={confirmCompleteAndStartBilling}
        title="Mark Appointment Completed"
        message="This appointment is not marked as completed. Do you want to mark it as completed and start billing?"
      />
    </form>
  );
}

export default AppointmentForm;