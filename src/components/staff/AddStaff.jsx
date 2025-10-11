import { UploadIcon, FileTextIcon, ImageIcon, FileIcon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import StaffSalary from './StaffSalary';
import { MultiSelectDropdown } from '@components/common/MultiSelectDropdown';
import { servicesApi, staffApi, enumsApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';
import { SearchableAddableSelect } from '@components/common/SearchableAddableSelect';
import { InputField, SelectField as CommonSelectField } from '@components/common/Inputs';
import { FormInputField } from '@components/common/FormElements';
import { useNotification } from '../../contexts/NotificationContext';

// Document Modal Component
const DocumentModal = ({ isOpen, onClose, documentId, staffName }) => {
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocumentFile();
    }
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [isOpen, documentId]);

  const fetchDocumentFile = async () => {
    try {
      setLoading(true);
      setError(null);
      const blob = await staffApi.getStaffDocument(documentId);
      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document file');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FileIcon className="w-6 h-6" />;
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <ImageIcon className="w-6 h-6" />;
    }
    return <FileTextIcon className="w-6 h-6" />;
  };

  const isImage = (filename) => {
    if (!filename) return false;
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex-shrink-0 flex justify-between items-center sticky top-0 bg-white z-10 p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Document - {staffName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-4">
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-2 text-gray-600">Loading document...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {documentUrl && !loading && !error && (
              <div className="text-center">
                {isImage(documentId) ? (
                  <img
                    src={documentUrl}
                    alt="Document"
                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    style={{ maxHeight: '70vh' }}
                  />
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <div className="flex flex-col items-center space-y-4">
                      {getFileIcon(documentId)}
                      <p className="text-gray-600">Document file: {documentId}</p>
                      <a
                        href={documentUrl}
                        download={documentId}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Download Document
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Generic SelectField supporting an 'options' prop (array of {value,label})
const SelectField = ({ label, id, value, onChange, required = true, options = [], placeholder, className = '', readOnly, error }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g,'_');
  return (
    <div className={className}>
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1 text-left">{label} {required && <span className="text-red-500">*</span>}</label>
      <select
        id={selectId}
        name={selectId}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        required={required}
        disabled={readOnly}
        className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${readOnly ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed' : error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default function AddStaff({ onAddStaff, onClose, isOpen = true, title = 'Add Staff', editData, mode = 'create' }) {
  const { currentStore } = useStore();
  const { showNotification } = useNotification();
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Step management
  const [step, setStep] = useState(1);

  // Shared state slices
  const [personalInfo, setPersonalInfo] = useState({
    name: '', gender: '', phone: '', email: '', dob: '', document: null, doj: ''
  });

  const [roleInfo, setRoleInfo] = useState({
    services: [], role: '', designation: '', dateOfJoining: '', shifts: weekDays.map(d => ({ day: d, enabled: ['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(d), start: '09:00', end: '18:00' }))
  });

  const [salaryInfo, setSalaryInfo] = useState({}); // Will be populated by StaffSalary child via callback if needed

  const [commissionState, setCommissionState] = useState({
    type: 'Percentage', bracket: 'Weekly', startDate: new Date().toISOString().split('T')[0],
    brackets: [{ id: 1, from: '0', to: '0', commission: '', commissionBy: 'Services' }]
  });

  const [bankInfo, setBankInfo] = useState({
    accountName: '', accountNumber: '', ifsc: '', bankName: '', branch: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const isViewMode = mode === 'view';

  // Error state for form validation
  const [errors, setErrors] = useState({});

  // Services & Designations
  const [availableServices, setAvailableServices] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  const [designationQuery, setDesignationQuery] = useState('');

  // Document modal state
  const [documentModal, setDocumentModal] = useState({ open: false, documentId: null, staffName: null });

  const filteredDesignations = designations.filter(d => d.toLowerCase().includes(designationQuery.toLowerCase()));
  const showAddDesignation = designationQuery && !designations.some(d => d.toLowerCase() === designationQuery.toLowerCase());

  useEffect(() => {
    const loadServices = async () => {
      if (!currentStore?.id) return;
      try {
        const res = await servicesApi.getAll(currentStore.id);
        const list = res?.data?.services || [];
        setAvailableServices(list.map(s => s.name));
      } catch {
        setAvailableServices([]);
      }
    };
    loadServices();
  }, [currentStore?.id]);

  // Fetch designations from the backend using enumsApi
  useEffect(() => {
    const fetchDesignations = async () => {
      if (!currentStore?.id) return; // Don't fetch if no store is selected

      setDesignationsLoading(true);
      try {
        const response = await enumsApi.getRoles(currentStore.id);
        // Handle the API response structure: response.data.enum.values
        const designationList = response?.data?.enum?.values || [];
        setDesignations(designationList);
      } catch (error) {
        console.error('Error fetching designations:', error);
        setDesignations([]); // Set empty array on error
      } finally {
        setDesignationsLoading(false);
      }
    };

    fetchDesignations();
  }, [currentStore?.id]);

  // Function to add a new designation
  const handleAddDesignation = async (newDesignation) => {
    if (!currentStore?.id) return;

    try {
      // Add the new designation to the existing list
      const updatedDesignations = [...designations, newDesignation];

      // Update the designations via API
      await enumsApi.updateRoles(currentStore.id, updatedDesignations);

      // Update local state
      setDesignations(updatedDesignations);
      updateRole('designation', newDesignation); // Set the newly added designation as selected
    } catch (error) {
      console.error('Error adding designation:', error);
      // Optionally show an error message to the user
    }
  };

  // Prefill when editData changes
  useEffect(() => {
    if (!editData) return;
    // personal
    setPersonalInfo(p => ({
      ...p,
      name: editData.name || '',
      gender: editData.gender || '',
      phone: editData.contact || '',
      email: editData.email || '',
      dob: editData.dateOfBirth ? editData.dateOfBirth.split('T')[0] : '',
      doj: editData.dateOfJoining ? editData.dateOfJoining.split('T')[0] : ''
    }));
    // role
    setRoleInfo(r => ({
      ...r,
      role: editData.roleType || '',
      designation: editData.designation || '',
      services: Array.isArray(editData.services) ? editData.services : [],
      shifts: Array.isArray(editData.shifts) ? editData.shifts.map(s => ({
        day: s.day,
        enabled: s.active,
        start: s.startTime,
        end: s.endTime
      })) : r.shifts
    }));
    // salary
    if (editData.salary) {
      const earn = (editData.salary.earnings || []).map((e,i) => ({ id: i+1, name: e.name, value: String(e.amount), isCustom: true }));
      const ded = (editData.salary.deductions || []).map((d,i) => ({ id: i+1000, name: d.name, value: String(d.amount), isCustom: true }));
      setSalaryInfo({
        salaryType: editData.salary.type || 'Monthly',
        salaryCycle: editData.salary.cycle || '1 to 1 of Every Month',
        earnings: earn.length ? earn : [{ id:1,name:'Basic', value:'0', isCustom:false }],
        deductions: ded
      });
    }
    // commission
    if (editData.commission) {
      setCommissionState(cs => ({
        ...cs,
        type: editData.commission.type || 'Percentage',
        bracket: editData.commission.bracketPeriod || 'Monthly',
        startDate: editData.commission.startDate ? editData.commission.startDate.split('T')[0] : cs.startDate,
        brackets: (editData.commission.slabs || []).map((sl,i) => ({ id: i+1, from: String(sl.from), to: String(sl.to), commission: String(sl.value), commissionBy: sl.basis || 'Services' }))
      }));
    }
    // bank
    if (editData.bank) {
      setBankInfo(b => ({
        ...b,
        accountName: editData.bank.accountName || '',
        accountNumber: editData.bank.accountNumber || '',
        ifsc: editData.bank.ifsc || '',
        bankName: editData.bank.bankName || '',
        branch: editData.bank.branch || ''
      }));
    }
  }, [editData]);

  // Handlers
  const updatePersonal = (field, value) => setPersonalInfo(p => ({ ...p, [field]: value }));
  const updateRole = (field, value) => setRoleInfo(r => ({ ...r, [field]: value }));
  const updateShift = (day, patch) => setRoleInfo(r => ({ ...r, shifts: r.shifts.map(s => s.day === day ? { ...s, ...patch } : s) }));
  const updateCommission = (patch) => setCommissionState(cs => ({ ...cs, ...patch }));
  const updateBank = (field, value) => setBankInfo(b => ({ ...b, [field]: value }));

  const addCommissionBracket = () => updateCommission({ brackets: [...commissionState.brackets, { id: Date.now(), from: '0', to: '0', commission: '', commissionBy: 'Services' }] });
  const removeCommissionBracket = (id) => updateCommission({ brackets: commissionState.brackets.filter(b => b.id !== id) });
  const changeCommissionBracket = (id, field, value) => updateCommission({ brackets: commissionState.brackets.map(b => b.id === id ? { ...b, [field]: value } : b) });

  const addDesignation = () => {
    if (showAddDesignation) setDesignations(d => [...d, designationQuery]);
    updateRole('designation', designationQuery);
  };

  // Validation functions for each step
  const validateStep1 = () => {
    const errs = {};
    if (!personalInfo.name.trim()) errs.name = 'Name is required';
    if (!personalInfo.phone.trim()) errs.phone = 'Phone is required';
    if (!personalInfo.gender) errs.gender = 'Gender is required';
    if (!personalInfo.doj) errs.doj = 'Date of joining is required';

    setErrors(e => ({ ...e, step1: errs }));
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!roleInfo.role) errs.role = 'Role is required';
    if (!roleInfo.designation || roleInfo.designation.trim() === '') errs.designation = 'Designation is required';
    // Optional: Add validation for services or designation if needed
    // if (roleInfo.services.length === 0) errors.push('At least one service is required');

    setErrors(e => ({ ...e, step2: errs }));
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    // Salary information is optional, so we can just return true
    // Add validation here if salary becomes required
    return true;
  };

  const validateStep4 = () => {
    // Commission information validation - but it's optional
    const errs = {};

    // Only validate commission brackets if they have values entered
    commissionState.brackets.forEach((bracket, index) => {
      // Only validate if user has entered some values (not just default empty/zero values)
      const hasFromValue = bracket.from && bracket.from !== '0' && bracket.from.trim() !== '';
      const hasToValue = bracket.to && bracket.to !== '0' && bracket.to.trim() !== '';
      const hasCommissionValue = bracket.commission && bracket.commission.trim() !== '';

      // If user has started entering values, then validate them
      if (hasFromValue || hasToValue || hasCommissionValue) {
        if (hasFromValue && hasToValue) {
          const fromValue = parseFloat(bracket.from);
          const toValue = parseFloat(bracket.to);

          if (isNaN(fromValue) || isNaN(toValue)) {
            errs[`bracket_${index + 1}`] = 'Invalid numeric values';
          } else if (fromValue >= toValue) {
            errs[`bracket_${index + 1}`] = "'From' value must be less than 'To' value";
          }
        }

        if (hasCommissionValue && (isNaN(parseFloat(bracket.commission)) || parseFloat(bracket.commission) < 0)) {
          errs[`bracket_${index + 1}`] = 'Invalid commission value';
        }
      }
    });

    setErrors(e => ({ ...e, step4: errs }));
    return Object.keys(errs).length === 0;
  };

  const validateStep5 = () => {
    // Bank information is completely optional - no validation required
    // Users can submit without entering any bank details
    const errs = {};

    // Only validate bank information if user has actually entered some data
    const hasBankData = bankInfo.accountNumber || bankInfo.ifsc || bankInfo.accountName || bankInfo.bankName || bankInfo.branch;

    if (hasBankData) {
      // If they started entering bank info, validate the format of critical fields
      if (bankInfo.accountNumber && !/^\d+$/.test(bankInfo.accountNumber)) {
        errs.accountNumber = 'Account number must contain only digits';
      }

      if (bankInfo.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankInfo.ifsc.toUpperCase())) {
        errs.ifsc = 'IFSC code format is invalid';
      }
    }

    setErrors(e => ({ ...e, step5: errs }));
    return Object.keys(errs).length === 0;
  };

  // Updated next function with validation
  const next = () => {
    if (isViewMode) {
      setStep(s => Math.min(5, s + 1));
      return;
    }

    let isValid = false;

    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setStep(s => Math.min(5, s + 1));
    }
  };

  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || isViewMode) return; // block submit in view mode

    // Run all step validations before submitting
    if (!validateStep1()) { setStep(1); return; }
    if (!validateStep2()) { setStep(2); return; }
    if (!validateStep3()) { setStep(3); return; }
    if (!validateStep4()) { setStep(4); return; }
    if (!validateStep5()) { setStep(5); return; }

    // Normalize data for backend contract
    const normalizedShifts = roleInfo.shifts.map(s => ({
      day: s.day,
      active: !!s.enabled,
      startTime: s.start,
      endTime: s.end
    }));

    // Only include salary if user has actually provided salary information
    let salary = null;
    if (salaryInfo && Object.keys(salaryInfo).length > 0 &&
        (salaryInfo.earnings?.length > 0 || salaryInfo.deductions?.length > 0)) {
      salary = {
        type: salaryInfo.salaryType || 'Monthly',
        cycle: salaryInfo.salaryCycle || '1 to 1 of Every Month',
        earnings: (salaryInfo.earnings || []).map(ei => ({ id: ei.id, name: ei.name, amount: parseFloat(ei.value) || 0 })),
        deductions: (salaryInfo.deductions || []).map(di => ({ id: di.id, name: di.name, amount: parseFloat(di.value) || 0 })),
        totals: salaryInfo.totals ? {
          totalEarnings: salaryInfo.totals.totalEarnings,
          totalDeductions: salaryInfo.totals.totalDeductions,
          grossPay: salaryInfo.totals.grossPay,
          netPay: salaryInfo.totals.netPayInHand,
        } : undefined
      };
    }

    // Only include commission if user has actually entered commission data
    let commission = null;
    const hasCommissionData = commissionState.brackets.some(bracket => {
      const hasFromValue = bracket.from && bracket.from !== '0' && bracket.from.trim() !== '';
      const hasToValue = bracket.to && bracket.to !== '0' && bracket.to.trim() !== '';
      const hasCommissionValue = bracket.commission && bracket.commission.trim() !== '';
      return hasFromValue || hasToValue || hasCommissionValue;
    });

    if (hasCommissionData) {
      commission = {
        type: commissionState.type,
        bracketPeriod: commissionState.bracket, // Weekly / Monthly
        startDate: commissionState.startDate,
        slabs: commissionState.brackets
          .filter(b => {
            // Only include brackets that have actual data
            const hasFromValue = b.from && b.from !== '0' && b.from.trim() !== '';
            const hasToValue = b.to && b.to !== '0' && b.to.trim() !== '';
            const hasCommissionValue = b.commission && b.commission.trim() !== '';
            return hasFromValue || hasToValue || hasCommissionValue;
          })
          .map(b => ({
            from: parseFloat(b.from) || 0,
            to: parseFloat(b.to) || 0,
            value: parseFloat(b.commission) || 0,
            basis: b.commissionBy // Services | Products | Memberships
          }))
      };
    }

    const payload = {
      storeId: currentStore?.id || null,
      personal: {
        name: personalInfo.name.trim(),
        gender: personalInfo.gender || null,
        phone: personalInfo.phone.trim(),
        email: personalInfo.email || null,
        dateOfBirth: personalInfo.dob || null,
        dateOfJoining: personalInfo.doj || null,
        // Document handling: either attach later via multipart or send metadata placeholder
        documentName: personalInfo.document?.name || null,
      },
      role: {
        role: roleInfo.role,
        designation: roleInfo.designation || null,
        services: roleInfo.services, // array of service names (or convert to IDs once available)
        shifts: normalizedShifts,
      },
      salary: salary,
      commission: commission,
      bank: {
        accountName: bankInfo.accountName || null,
        accountNumber: bankInfo.accountNumber || null,
        ifsc: bankInfo.ifsc || null,
        bankName: bankInfo.bankName || null,
        branch: bankInfo.branch || null,
      }
    };

    try {
      setSubmitting(true);
      if (onAddStaff) {
        // Pass both payload and document file, similar to expense form
        await onAddStaff(payload, personalInfo.document);
      }
      // Reset (optional) after successful submit
      // setStep(1); // Keep wizard on first step for a new entry
    } catch (err) {
      console.error('Submit failed', err);
      showNotification('Failed to create staff', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable Field Components Inline to avoid duplication from old single form
  // Using shared InputField directly now

  const TimeInput = ({ label, value, onChange }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type="time" value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded focus:ring-teal-500" />
    </div>
  );

  // Step rendering (stable) to avoid remount-induced focus loss
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-teal-700 text-left">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <FormInputField label="Name" name="name" value={personalInfo.name} onChange={e => updatePersonal('name', e.target.value)} required disabled={isViewMode} error={errors.step1?.name} />
              <SelectField
                label="Gender"
                value={personalInfo.gender}
                onChange={val => !isViewMode && updatePersonal('gender', val)}
                required={!isViewMode}
                placeholder="Select gender"
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' }
                ]}
                readOnly={isViewMode}
                error={errors.step1?.gender}
              />
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 text-left">Phone Number {!isViewMode && <span className="text-red-500">*</span>}</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <select
                    name="countryCode"
                    value={personalInfo.countryCode || '+91'}
                    onChange={e => updatePersonal('countryCode', e.target.value)}
                    disabled={isViewMode}
                    className={`inline-flex items-center pr-8 rounded-l-md border border-r-0 ${isViewMode
                        ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed'
                        : errors.step1?.phone ? 'border-red-400 bg-gray-50 text-gray-700 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 bg-gray-50 text-gray-700 focus:ring-teal-500 focus:border-teal-500'
                      } sm:text-sm`}
                  >
                    <option>+91</option><option>+1</option><option>+44</option><option>+61</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      updatePersonal('phone', val);
                    }}
                    placeholder="Phone Number"
                    required={!isViewMode}
                    disabled={isViewMode}
                    className={`flex-1 block w-full min-w-0 rounded-none rounded-r-md px-3 py-2 border ${isViewMode
                        ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed'
                        : errors.step1?.phone ? 'border-red-400 placeholder-gray-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500'
                      } sm:text-sm`}
                  />
                </div>
                {errors.step1?.phone && <p className="mt-1 text-sm text-red-600">{errors.step1.phone}</p>}
              </div>
              <FormInputField label="Email" type="email" name="email" value={personalInfo.email} onChange={e => updatePersonal('email', e.target.value)} disabled={isViewMode} />
              <FormInputField label="Date of Birth" type="date" name="dob" value={personalInfo.dob} onChange={e => updatePersonal('dob', e.target.value)} disabled={isViewMode} />
              <FormInputField label="Date of Joining" type="date" name="doj" value={personalInfo.doj} onChange={e => updatePersonal('doj', e.target.value)} disabled={isViewMode} required={!isViewMode} error={errors.step1?.doj} />

              {/* Document Section */}
              <div className='grid col-span-2'>
                {isViewMode && editData?.documentName ? (
                  // View mode - show document link
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Document</label>
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                      <button
                        type="button"
                        onClick={() => setDocumentModal({
                          open: true,
                          documentId: editData.documentName,
                          staffName: editData.name
                        })}
                        className="text-teal-600 hover:text-teal-800 underline flex items-center space-x-2"
                      >
                        <FileTextIcon className="w-4 h-4" />
                        <span>View Document</span>
                      </button>
                    </div>
                  </div>
                ) : !isViewMode && (
                  // Edit/Create mode - show file upload
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">ID Document Upload</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-teal-600 hover:text-teal-500">
                            <span>Upload Document</span>
                            <input
                              type="file"
                              className="sr-only"
                              onChange={e => updatePersonal('document', e.target.files?.[0] || null)}
                              accept="image/*,.pdf"
                            />
                          </label>
                        </div>
                        {personalInfo.document ? (
                          <p className="text-xs text-gray-500">Selected: {personalInfo.document.name}</p>
                        ) : (
                          <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-teal-700 text-left">Role Information</h3>
            <div className="space-y-4">
              <MultiSelectDropdown options={availableServices} selectedOptions={roleInfo.services} onChange={opts => !isViewMode && updateRole('services', opts)} heading="Services (Can Perform)" placeholder="Select Services" readOnly={isViewMode} />
              <div className="grid md:grid-cols-2 gap-6">
                <SelectField
                  label="Role"
                  value={roleInfo.role}
                  onChange={val => !isViewMode && updateRole('role', val)}
                  required={!isViewMode}
                  placeholder="Select role"
                  options={[
                    { value: 'staff', label: 'Staff' },
                    { value: 'admin', label: 'Admin' },
                      { value: 'owner', label: 'Owner' },
                  ]}
                  readOnly={isViewMode}
                  error={errors.step2?.role}
                />
                <div>
                  <SearchableAddableSelect
                    label="Designation"
                    value={roleInfo.designation}
                    options={designations}
                    onChange={(val) => { if (!isViewMode) { updateRole('designation', val); setDesignationQuery(val); } }}
                    onAdd={(val) => { if (!isViewMode) handleAddDesignation(val); }}
                    placeholder="Search or add designation"
                    required={!isViewMode}
                    disabled={isViewMode}
                    error={errors.step2?.designation}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-2 text-left">Shift Timings</h4>
                <div className="space-y-3">
                  {roleInfo.shifts.map(s => (
                    <div key={s.day} className="flex items-center justify-between p-1 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="w-24 font-medium text-sm">{s.day}</div>
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={s.enabled} onChange={e => !isViewMode && updateShift(s.day, { enabled: e.target.checked })} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" disabled={isViewMode} /> Active
                      </label>
                      <div className="flex items-center gap-2 ">
                        <TimeInput  value={s.start} onChange={v => !isViewMode && updateShift(s.day, { start: v })} />
                        <TimeInput  value={s.end} onChange={v => !isViewMode && updateShift(s.day, { end: v })} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-teal-700 text-left">Salary Information</h3>
            <StaffSalary onChange={setSalaryInfo} value={salaryInfo} readOnly={isViewMode} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-teal-700 text-left">Commission Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Type</label>
                <div className="flex bg-gray-200 rounded-lg p-1">
                  {['Percentage','Value'].map(opt => <button key={opt} disabled={isViewMode} type="button" onClick={() => !isViewMode && updateCommission({ type: opt })} className={`flex-1 py-1.5 text-sm font-medium rounded-md ${commissionState.type === opt ? 'bg-teal-500 text-white' : 'text-teal-600 hover:bg-white'} ${isViewMode ? 'opacity-60 cursor-not-allowed' : ''}`}>{opt}</button>)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Bracket</label>
                <div className="flex bg-gray-200 rounded-lg p-1">
                  {['Weekly','Monthly'].map(opt => <button key={opt} disabled={isViewMode} type="button" onClick={() => !isViewMode && updateCommission({ bracket: opt })} className={`flex-1 py-1.5 text-sm font-medium rounded-md ${commissionState.bracket === opt ? 'bg-teal-500 text-white' : 'text-teal-600 hover:bg-white'} ${isViewMode ? 'opacity-60 cursor-not-allowed' : ''}`}>{opt}</button>)}
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-2">
              {commissionState.brackets.map(b => (
                <div key={b.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <InputField label="From ₹" name={`from_${b.id}`} value={b.from} onChange={e => !isViewMode && changeCommissionBracket(b.id,'from',e.target.value)} disabled={isViewMode} error={errors.step4?.[`bracket_${b.id}`]} />
                    <InputField label="To ₹" name={`to_${b.id}`} value={b.to} onChange={e => !isViewMode && changeCommissionBracket(b.id,'to',e.target.value)} disabled={isViewMode} error={errors.step4?.[`bracket_${b.id}`]} />
                    <InputField label="Commission" name={`commission_${b.id}`} value={b.commission} onChange={e => !isViewMode && changeCommissionBracket(b.id,'commission',e.target.value)} disabled={isViewMode} error={errors.step4?.[`bracket_${b.id}`]} />
                    {commissionState.brackets.length > 1 && !isViewMode && <button type="button" onClick={() => removeCommissionBracket(b.id)} className="mb-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">&times;</button>}
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    {['Services','Products','Memberships'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 text-xs">
                        <input type="radio" name={`commissionBy_${b.id}`} value={cat} checked={b.commissionBy === cat} onChange={e => !isViewMode && changeCommissionBracket(b.id,'commissionBy',e.target.value)} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" disabled={isViewMode} /> {cat}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!isViewMode && (
              <div className="flex justify-end">
                <button type="button" onClick={addCommissionBracket} className="px-4 py-2 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600">+ Add Bracket</button>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-teal-700 text-left">Bank Account Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField label="Account Holder Name" name="accountName" value={bankInfo.accountName} onChange={e => updateBank('accountName', e.target.value)} disabled={isViewMode} />
              <InputField label="Account Number" name="accountNumber" value={bankInfo.accountNumber} onChange={e => updateBank('accountNumber', e.target.value)} disabled={isViewMode} error={errors.step5?.accountNumber} />
              <InputField label="IFSC Code" name="ifsc" value={bankInfo.ifsc} onChange={e => updateBank('ifsc', e.target.value)} disabled={isViewMode} error={errors.step5?.ifsc} />
              <InputField label="Bank Name" name="bankName" value={bankInfo.bankName} onChange={e => updateBank('bankName', e.target.value)} disabled={isViewMode} />
              <InputField label="Branch" name="branch" value={bankInfo.branch} onChange={e => updateBank('branch', e.target.value)} disabled={isViewMode} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-xl px-6 md:px-8 space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 text-sm">
          {Array.from({ length: 5 }).map((_, i) => {
            const idx = i + 1;
            return (
              <button key={idx} type="button" onClick={() => setStep(idx)} className={`h-8 w-8 rounded-full font-semibold border flex items-center justify-center transition ${step === idx ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-teal-50'}`}>{idx}</button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
  <div>{renderStep()}</div>
        <div className="flex justify-between pt-4">
          <button type="button" onClick={prev} disabled={step === 1} className={`px-6 py-2 rounded-lg font-medium border ${step === 1 ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-teal-700 border-teal-300 hover:bg-teal-50'}`}>Back</button>
          {step < 5 && !isViewMode && (
            <button type="button" onClick={next} className="px-8 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600">Next</button>
          )}
          {step === 5 && !isViewMode && (
            <button type="submit" disabled={submitting} className={`px-10 py-2 font-semibold rounded-lg ${submitting ? 'bg-teal-300 cursor-not-allowed text-white' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>{submitting ? 'Submitting...' : 'Submit'}</button>
          )}
          {isViewMode && (
            <button type="button" onClick={onClose} className="px-8 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg">Close</button>
          )}
        </div>
      </form>

      {/* Document Modal - Moved outside to avoid unmounting on step change */}
      {documentModal.open && (
        <DocumentModal
          isOpen={documentModal.open}
          onClose={() => setDocumentModal({ open: false, documentId: null, staffName: null })}
          documentId={documentModal.documentId}
          staffName={documentModal.staffName}
        />
      )}
    </div>
  );
}
