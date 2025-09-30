import { UploadIcon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import StaffSalary from './StaffSalary';
import { MultiSelectDropdown } from '@components/common/MultiSelectDropdown';
import { servicesApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';
import { SearchableAddableSelect } from '@components/common/SearchableAddableSelect';
import { InputField, SelectField as CommonSelectField } from '@components/common/Inputs';
import { FormInputField } from '@components/common/FormElements';
import { useNotification } from '../../contexts/NotificationContext';

// Generic SelectField supporting an 'options' prop (array of {value,label})
const SelectField = ({ label, id, value, onChange, required = true, options = [], placeholder, className = '', readOnly }) => {
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
        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
};

// Helper for toggle buttons
const ToggleButton = ({ options, selected, setSelected }) => (
    <div className="flex bg-gray-200 rounded-lg p-1 text-left">
        {options.map(option => (
            <button
                key={option}
                type="button"
                onClick={() => setSelected(option)}
                className={`w-full py-1.5 text-sm font-medium rounded-md transition-colors ${selected === option ? 'bg-teal-500 text-white shadow' : 'text-teal-600 hover:bg-white'}`}
            >
                {option}
            </button>
        ))}
    </div>
);

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

  // Services & Designations
  const [availableServices, setAvailableServices] = useState([]);
  const [designations, setDesignations] = useState(['Stylist','Therapist','Receptionist','Manager']);
  const [designationQuery, setDesignationQuery] = useState('');

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

  const next = () => setStep(s => Math.min(5, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
  if (submitting || isViewMode) return; // block submit in view mode

    // Basic required validations (early exit with simple alerts for now)
    if (!personalInfo.name.trim()) { showNotification('Name is required', 'error'); setStep(1); return; }
    if (!personalInfo.phone.trim()) { showNotification('Phone is required', 'error'); setStep(1); return; }
    if (!personalInfo.gender) { showNotification('Gender is required', 'error'); setStep(1); return; }
    if (!roleInfo.role) { showNotification('Role is required', 'error'); setStep(2); return; }

    // Normalize data for backend contract
    const normalizedShifts = roleInfo.shifts.map(s => ({
      day: s.day,
      active: !!s.enabled,
      startTime: s.start,
      endTime: s.end
    }));

    const salary = salaryInfo && Object.keys(salaryInfo).length > 0 ? {
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
    } : null;

    const commission = {
      type: commissionState.type,
      bracketPeriod: commissionState.bracket, // Weekly / Monthly
      startDate: commissionState.startDate,
      slabs: commissionState.brackets.map(b => ({
        from: parseFloat(b.from) || 0,
        to: parseFloat(b.to) || 0,
        value: parseFloat(b.commission) || 0,
        basis: b.commissionBy // Services | Products | Memberships
      }))
    };

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
      commission,
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
        await onAddStaff(payload);
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
              <FormInputField label="Name" name="name" value={personalInfo.name} onChange={e => updatePersonal('name', e.target.value)} required disabled={isViewMode} />
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
              />
              <FormInputField label="Phone Number" name="phone" value={personalInfo.phone} onChange={e => updatePersonal('phone', e.target.value)} required disabled={isViewMode} />
              <FormInputField label="Email" type="email" name="email" value={personalInfo.email} onChange={e => updatePersonal('email', e.target.value)} disabled={isViewMode} />
              <FormInputField label="Date of Birth" type="date" name="dob" value={personalInfo.dob} onChange={e => updatePersonal('dob', e.target.value)} disabled={isViewMode} />
              <FormInputField label="Date of Joining" type="date" name="doj" value={personalInfo.doj} onChange={e => updatePersonal('doj', e.target.value)} disabled={isViewMode} />
              <div className='grid col-span-2'>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">ID Document {isViewMode ? '' : 'Upload'}</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-teal-600 hover:text-teal-500">
                        <span>Upload Document</span>
                        {!isViewMode && <input type="file" className="sr-only" onChange={e => updatePersonal('document', e.target.files?.[0] || null)} />}
                      </label>
                    </div>
                    {personalInfo.document ? <p className="text-xs text-gray-500">Selected: {personalInfo.document.name}</p> : <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>}
                  </div>
                </div>
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
                    { value: 'admin', label: 'Admin' }
                  ]}
                  readOnly={isViewMode}
                />
                <div>
                  <SearchableAddableSelect
                    label="Designation"
                    value={roleInfo.designation}
                    options={designations}
                    onChange={(val) => { if (!isViewMode) { updateRole('designation', val); setDesignationQuery(val); } }}
                    onAdd={(val) => { if (!isViewMode) setDesignations(d => [...d, val]); }}
                    placeholder="Search or add designation"
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
                    <InputField label="From ₹" name={`from_${b.id}`} value={b.from} onChange={e => !isViewMode && changeCommissionBracket(b.id,'from',e.target.value)} disabled={isViewMode} />
                    <InputField label="To ₹" name={`to_${b.id}`} value={b.to} onChange={e => !isViewMode && changeCommissionBracket(b.id,'to',e.target.value)} disabled={isViewMode} />
                    <InputField label="Commission" name={`commission_${b.id}`} value={b.commission} onChange={e => !isViewMode && changeCommissionBracket(b.id,'commission',e.target.value)} disabled={isViewMode} />
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
              <InputField label="Account Holder Name" name="accountName" value={bankInfo.accountName} onChange={e => updateBank('accountName', e.target.value)} required disabled={isViewMode} />
              <InputField label="Account Number" name="accountNumber" value={bankInfo.accountNumber} onChange={e => updateBank('accountNumber', e.target.value)} required disabled={isViewMode} />
              <InputField label="IFSC Code" name="ifsc" value={bankInfo.ifsc} onChange={e => updateBank('ifsc', e.target.value)} disabled={isViewMode} />
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
    </div>
  );
}
