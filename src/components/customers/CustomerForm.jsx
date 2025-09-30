import React, { useState, useEffect, useMemo } from 'react';
import { InputField, SelectField, TextAreaField } from '@components/common/FormElements';
import { customersApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';

// FormRow component
const FormRow = ({ label, required = false, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center mb-4 max-w-xl mx-auto">
        <label className="w-full sm:w-1/3 text-sm font-medium text-gray-700 mb-1 sm:mb-0 text-left sm:text-right sm:mr-4">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <div className="w-full sm:w-2/3">
            {children}
        </div>
    </div>
);

// A list of sample countries. This can be expanded.
const countries = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'USA', code: '+1', flag: '🇺🇸' },
    { name: 'UK', code: '+44', flag: '🇬🇧' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
];

// Main Add Customer Form Component
export default function CustomerForm({ onCreated, onClose, customer = null, mode = 'create', onUpdated }) {
    const { currentStore } = useStore();
    const initialState = {
        countryCode: '+91',
        contact: '',
        name: '',
        gender: '',
        email: '',
        birthday: '',
        anniversary: '',
        address: '',
    };
    const [formData, setFormData] = useState(initialState);
    const [originalData, setOriginalData] = useState(initialState);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const isView = mode === 'view';
    const isEdit = mode === 'edit';

    // Convert DD/MM to yyyy-mm-dd for date input
    const ddmmToISO = (ddmm) => {
        if (!ddmm || !ddmm.includes('/')) return '';
        const [d,m] = ddmm.split('/');
        const year = new Date().getFullYear();
        return `${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    };

    useEffect(() => {
        if (customer) {
            const mapped = {
                countryCode: '+91',
                contact: (customer.number || customer.phoneNumber || '').replace(/^\+?91/, ''),
                name: customer.name || '',
                gender: customer.gender || '',
                email: customer.email || '',
                birthday: customer.birthday ? ddmmToISO(customer.birthday) : '',
                anniversary: customer.anniversary ? ddmmToISO(customer.anniversary) : '',
                address: customer.address || ''
            };
            setFormData(mapped);
            setOriginalData(mapped);
        } else if (mode === 'create') {
            setFormData(initialState);
            setOriginalData(initialState);
        }
    }, [customer, mode]);

    const isDirty = useMemo(() => {
        return Object.keys(formData).some(k => formData[k] !== originalData[k]);
    }, [formData, originalData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting || isView) return;
        setError(null);
        try {
            if (!currentStore?.id) throw new Error('Store not selected');
            if (!formData.contact || !formData.name || !formData.gender) {
                setError('Name, contact and gender are required');
                return;
            }
            setSubmitting(true);
            const payload = {
                name: formData.name.trim(),
                gender: formData.gender.toLowerCase(),
                birthday: formData.birthday ? formatDateToDDMM(formData.birthday) : undefined,
                anniversary: formData.anniversary ? formatDateToDDMM(formData.anniversary) : undefined,
                address: formData.address || undefined
            };
            let res;
            if (mode === 'create') {
                payload.phoneNumber = `${formData.contact.startsWith('+') ? formData.contact : formData.countryCode + formData.contact}`;
                res = await customersApi.createCustomer(currentStore.id, payload);
                if (res?.success) onCreated && onCreated(res?.data?.customer || null);
            } else if (isEdit && customer?.id) {
                if (!isDirty) { setSubmitting(false); return; }
                res = await customersApi.updateCustomer(currentStore.id, customer.id, payload);
                if (res?.success) onUpdated && onUpdated(res?.data?.customer || null);
            }
            if (res?.success) {
                onClose && onClose();
            } else if (res) {
                setError(res?.message || 'Operation failed');
            }
        } catch (err) {
            console.error('Create customer failed', err);
            setError(err.message || 'Error');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDateToDDMM = (isoDate) => {
        // isoDate is yyyy-mm-dd
        const [y,m,d] = isoDate.split('-');
        return `${d}/${m}`; // backend sample uses DD/MM
    };

    return (
            <div className="w-full max-w-xl bg-white rounded-xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4 px-4">
                    {/* Contact Field */}
                    <FormRow label="Contact" required>
                        <div className="flex items-center gap-2">
                            <SelectField
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handleChange}
                                className="w-[110px] flex-shrink-0"
                                options={countries.map(country => ({
                                    value: country.code,
                                    label: `${country.flag} ${country.code}`
                                }))}
                                isReadOnly={isView || isEdit}
                            />
                            <InputField
                                type="tel"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                placeholder="Contact"
                                required
                                className="flex-1"
                                isReadOnly={isView || isEdit}
                            />
                        </div>
                    </FormRow>

                    {/* Name Field */}
                    <FormRow label="Name" required>
                        <InputField
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            required
                            isReadOnly={isView}
                        />
                    </FormRow>

                    {/* Gender Field */}
                    <FormRow label="Gender" required>
                        <SelectField
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            options={[
                                { value: "", label: "Select Gender", disabled: true },
                                { value: "Male", label: "Male" },
                                { value: "Female", label: "Female" },
                                { value: "Other", label: "Other" }
                            ]}
                            isReadOnly={isView}
                        />
                    </FormRow>

                    {/* Email Field */}
                    <FormRow label="Email">
                        <InputField
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            isReadOnly={isView}
                        />
                    </FormRow>

                    {/* Birthday Field */}
                    <FormRow label="Birthday">
                        <InputField
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                            isReadOnly={isView}
                        />
                    </FormRow>
                    
                    {/* Anniversary Field */}
                    <FormRow label="Anniversary">
                        <InputField
                            type="date"
                            name="anniversary"
                            value={formData.anniversary}
                            onChange={handleChange}
                            isReadOnly={isView}
                        />
                    </FormRow>

                    {/* Address Field */}
                    <FormRow label="Address">
                        <TextAreaField
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Address"
                            isReadOnly={isView}
                        />
                    </FormRow>

                    {/* Submit Button */}
                    <div className="mt-10 flex justify-center">
                                                {error && <div className="text-sm text-red-600 mb-2 text-left w-full">{error}</div>}
                                                {!isView && (
                                                    <button
                                                        type="submit"
                                                        disabled={submitting || (isEdit && !isDirty)}
                                                        className={`w-1/3 sm:w-auto px-6 py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${submitting ? 'bg-teal-300 text-white cursor-not-allowed' : (isEdit ? (isDirty ? 'bg-teal-500 text-white hover:bg-teal-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed') : 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500')}`}
                                                    >
                                                        {submitting ? 'Saving...' : isEdit ? 'Update Customer' : 'Add Customer'}
                                                    </button>
                                                )}
                                                {isView && (
                                                    <button type="button" onClick={onClose} className="w-1/3 sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg">Close</button>
                                                )}
                    </div>
                </form>
            </div>
    );
}
