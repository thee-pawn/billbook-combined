import React, { useEffect, useState } from 'react';
import { MultiSelectDropdown } from '@components/common/MultiSelectDropdown';
import { servicesApi } from '../../apis/APIs';
import { packageApi } from '../../apis/packageApi';
import { useStore } from '../login/StoreContext';

// Reusable input field
const InputField = ({ label, id, type = 'text', placeholder, value, onChange, required = true, className = '', startAdornment, readOnly }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 text-left">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      {startAdornment && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">{startAdornment}</span>
        </div>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className={`w-full py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${startAdornment ? 'pl-7' : 'px-4'} ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
    </div>
  </div>
);

const SelectField = ({ label, id, value, onChange, required = true, children, className = '', readOnly }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 text-left">{label} {required && <span className="text-red-500">*</span>}</label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      disabled={readOnly}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
    >
      {children}
    </select>
  </div>
);

const RadioGroup = ({ label, name, options, selectedValue, onChange, readOnly }) => (
  <div className="space-y-2">
    <p className="text-sm font-semibold text-gray-700 text-left">{label}</p>
    <div className="flex flex-wrap gap-4">
      {options.map(o => (
        <label key={o.value} className="inline-flex items-center space-x-2 cursor-pointer">
          <input type="radio" name={name} value={o.value} checked={selectedValue === o.value} onChange={onChange} className="form-radio text-teal-600 focus:ring-teal-500" disabled={readOnly} />
          <span className="text-sm text-gray-700">{o.label}</span>
        </label>
      ))}
    </div>
  </div>
);

const CheckboxField = ({ label, id, checked, onChange, children, disabled = false }) => (
  <div className={`p-4 rounded-xl relative bg-white ${disabled ? 'opacity-60' : ''}` }>
    <div className="flex items-center mb-3">
      <input id={id} type="checkbox" checked={checked} onChange={e => !disabled && onChange(e)} disabled={disabled} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
      <label htmlFor={id} className="ml-2 text-md font-semibold text-teal-900 select-none">{label}</label>
    </div>
    {checked && <div className="mt-2 space-y-4">{children}</div>}
  </div>
);

export default function MembershipFormComponent({ initialData = null, onSave, onCancel, readOnly = false }) {
  const { currentStore } = useStore();

  // Remote data
  const [availableServices, setAvailableServices] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // Basic fields
  const [membershipName, setMembershipName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [validity, setValidity] = useState(initialData?.validity || { years: '', months: '', days: '' });
  const [price, setPrice] = useState(initialData?.price || '');

  // Wallet balance
  const [isWalletBalance, setIsWalletBalance] = useState(!!initialData?.walletBalance);
  const [walletBalance, setWalletBalance] = useState(initialData?.walletBalance || '');

  // Total bill discount
  const [isTotalDiscount, setIsTotalDiscount] = useState(!!initialData?.percentage);
  const [totalDiscountType, setTotalDiscountType] = useState('Percentage');
  const [totalDiscountValue, setTotalDiscountValue] = useState(initialData?.percentage || '');

  // Cross service discount
  const [isCrossServiceDiscount, setIsCrossServiceDiscount] = useState(false);
  const [crossServiceDiscountType, setCrossServiceDiscountType] = useState('Percentage');
  const [crossServiceDiscountValue, setCrossServiceDiscountValue] = useState('');
  const [crossServiceMaxAmount, setCrossServiceMaxAmount] = useState(1); // label shows Min Service Cost
  const [serviceInclusion, setServiceInclusion] = useState('Include All');
  const [crossSelectedServices, setCrossSelectedServices] = useState([]);

  // Service package
  const [isServicePackage, setIsServicePackage] = useState(false);
  const [packageSelectionMode, setPackageSelectionMode] = useState('existing');
  const [selectedExistingPackage, setSelectedExistingPackage] = useState('');
  const [packageServices, setPackageServices] = useState([
    { id: 1, service: '', quantityType: 'sessions', sessions: 1, hours: 1, discountType: 'Percentage', discountValue: 0 }
  ]);

  // Loyalty points
  const [isLoyaltyPoints, setIsLoyaltyPoints] = useState(false);
  const [bonusPoints, setBonusPoints] = useState('');
  const [isBonusPoints, setIsBonusPoints] = useState(false);
  const [isAdditionalPoints, setIsAdditionalPoints] = useState(false);
  const [additionalPointsConfig, setAdditionalPointsConfig] = useState({
    service: { multiplier: '0' },
    products: { multiplier: '0' },
    membership: { multiplier: '0' },
  });

  const serviceNameOptions = availableServices.map(s => s.name);

  // Fetch remote data
  useEffect(() => {
    if (!currentStore?.id) return;
    const loadServices = async () => {
      setServicesLoading(true);
      try {
        const res = await servicesApi.getAll(currentStore.id);
        if (res?.data?.services) {
          setAvailableServices(res.data.services.map(s => ({ id: s.id, name: s.name, price: parseFloat(s.price), duration: s.duration, category: s.category })));
        } else setAvailableServices([]);
      } catch { setAvailableServices([]); } finally { setServicesLoading(false); }
    };
    const loadPackages = async () => {
      setPackagesLoading(true);
      try {
        const res = await packageApi.getPackages(currentStore.id, 1, 100);
        const list = res?.data?.packages || [];
        setAvailablePackages(list.map(p => ({ id: p.id, name: p.package_name, price: p.price })));
      } catch { setAvailablePackages([]); } finally { setPackagesLoading(false); }
    };
    loadServices();
    loadPackages();
  }, [currentStore?.id]);

  useEffect(() => {
    if (!initialData) {
      setMembershipName('');
      setDescription('');
      setValidity({ years: '', months: '', days: '' });
      setPrice('');
      setIsWalletBalance(false); setWalletBalance('');
      setIsTotalDiscount(false); setTotalDiscountValue(''); setTotalDiscountType('Percentage');
      setIsCrossServiceDiscount(false); setCrossServiceDiscountValue(''); setCrossServiceDiscountType('Percentage'); setCrossServiceMaxAmount(1); setServiceInclusion('Include All'); setCrossSelectedServices([]);
      setIsServicePackage(false); setPackageSelectionMode('existing'); setSelectedExistingPackage(''); setPackageServices([{ id:1, service:'', quantityType:'sessions', sessions:1, hours:1, discountType:'Percentage', discountValue:0 }]);
      setIsLoyaltyPoints(false); setIsBonusPoints(false); setBonusPoints(''); setIsAdditionalPoints(false); setAdditionalPointsConfig({ service:{multiplier:'0'}, products:{multiplier:'0'}, membership:{multiplier:'0'} });
      return;
    }
    // Populate from initialData
    setMembershipName(initialData.name || '');
    setDescription(initialData.description || '');
    // Validity may already be object with numeric/string values
    if (initialData.validity) {
      setValidity({
        years: initialData.validity.years ?? initialData.validity.validity_years ?? '',
        months: initialData.validity.months ?? initialData.validity.validity_months ?? '',
        days: initialData.validity.days ?? initialData.validity.validity_days ?? '',
      });
    }
    setPrice(initialData.price?.toString ? initialData.price.toString() : initialData.price || '');
    const wb = initialData.walletBalance ?? initialData.wallet_balance; setIsWalletBalance(!!wb && Number(wb) > 0); setWalletBalance(wb?.toString?.() || wb || '');
    const perc = initialData.percentage ?? 0; setIsTotalDiscount(Number(perc) > 0); setTotalDiscountValue(perc?.toString?.() || perc || ''); if (initialData.totalDiscountType) setTotalDiscountType((initialData.totalDiscountType.charAt(0).toUpperCase() + initialData.totalDiscountType.slice(1)));
    const csVal = initialData.crossServiceDiscountValue ?? 0; setIsCrossServiceDiscount(Number(csVal) > 0); setCrossServiceDiscountValue(csVal?.toString?.() || csVal || ''); if (initialData.crossServiceDiscountType) setCrossServiceDiscountType(initialData.crossServiceDiscountType.charAt(0).toUpperCase() + initialData.crossServiceDiscountType.slice(1));
    if (initialData.crossServiceMaxAmount) setCrossServiceMaxAmount(initialData.crossServiceMaxAmount);
    if (initialData.serviceInclusion) setServiceInclusion(initialData.serviceInclusion);
    if (initialData.crossSelectedServices) setCrossSelectedServices(initialData.crossSelectedServices);
    const pkgSvcs = Array.isArray(initialData.packageServices) ? initialData.packageServices : [];
    setIsServicePackage(pkgSvcs.length > 0 || !!initialData.isServicePackage);
    if (pkgSvcs.length > 0) { setPackageSelectionMode('create'); setPackageServices(pkgSvcs.map((s,i)=> ({ id: s.id || i+1, service: s.service || '', serviceId: s.serviceId, servicePrice: s.servicePrice, serviceDuration: s.serviceDuration, serviceCategory: s.serviceCategory, quantityType: s.quantityType || 'sessions', sessions: s.sessions ?? 1, hours: s.hours ?? 1, discountType: s.discountType || 'Percentage', discountValue: s.discountValue || 0 }))); }
    // Loyalty
    setIsLoyaltyPoints(!!initialData.isLoyaltyPoints);
    setIsBonusPoints(!!initialData.isBonusPoints); setBonusPoints(initialData.bonusPoints?.toString?.() || initialData.bonusPoints || '');
    setIsAdditionalPoints(!!initialData.isAdditionalPoints);
    if (initialData.additionalPointsConfig) setAdditionalPointsConfig(initialData.additionalPointsConfig);
  }, [initialData]);

  const handleValidityChange = (e) => setValidity(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const addPackageService = () => setPackageServices(prev => ([...prev, { id: prev.length ? Math.max(...prev.map(s => s.id)) + 1 : 1, service: '', quantityType: 'sessions', sessions: 1, hours: 1, discountType: 'Percentage', discountValue: 0 }]));
  const removePackageService = (id) => setPackageServices(prev => prev.filter(s => s.id !== id));
  const handlePackageServiceChange = (id, field, value) => setPackageServices(prev => prev.map(s => {
    if (s.id !== id) return s;
    if (field === 'service') {
      const svc = availableServices.find(a => a.name === value);
      return { ...s, service: value, serviceId: svc?.id, servicePrice: svc?.price, serviceDuration: svc?.duration, serviceCategory: svc?.category };
    }
    return { ...s, [field]: value };
  }));

  const handleExistingPackageSelection = async (packageId) => {
    setSelectedExistingPackage(packageId);
    if (!packageId || !currentStore?.id) return;
    try {
      const detailRes = await packageApi.getPackageById(currentStore.id, packageId);
      const raw = detailRes?.data?.package || detailRes?.data || {};
      const servicesRaw = raw.services || raw.package_services || [];
      const converted = servicesRaw.map((s, idx) => {
        const svcId = s.service_id || s.serviceId;
        const svc = availableServices.find(a => a.id === svcId) || {};
        const quantityType = (s.quantity_type || s.quantityType || '').toLowerCase() === 'hours' ? 'hours' : 'sessions';
        const qty = Number(s.qty || s.quantity || 0) || 1;
        return { id: idx + 1, service: s.service_name || s.serviceName || svc.name || '', serviceId: svcId || svc.id || '', servicePrice: s.service_price || svc.price || '', serviceDuration: s.service_duration || svc.duration || '', serviceCategory: s.service_category || svc.category || '', quantityType, sessions: quantityType === 'sessions' ? qty : 1, hours: quantityType === 'hours' ? qty : 1, discountType: 'Percentage', discountValue: 0 };
      });
      setPackageServices(converted);
    } catch {}
  };

  const handleAdditionalPointsChange = (section, field, value) => setAdditionalPointsConfig(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Date.now(),
      name: membershipName,
      type: 'Membership',
      description,
      validity,
      price,
      walletBalance: isWalletBalance ? walletBalance : '0',
      percentage: isTotalDiscount ? Number(totalDiscountValue) : 0,
      status: initialData?.status || 'Active',
      isCrossServiceDiscount,
      crossServiceDiscountType,
      crossServiceDiscountValue,
      crossServiceMaxAmount,
      serviceInclusion,
      crossSelectedServices,
      isServicePackage,
      packageServices: packageServices.map(({ service, serviceId, servicePrice, serviceDuration, serviceCategory, quantityType, sessions, hours, discountType, discountValue }) => ({ service, serviceId, servicePrice, serviceDuration, serviceCategory, quantityType, sessions, hours, discountType, discountValue })),
      isLoyaltyPoints,
      isBonusPoints,
      bonusPoints: (isLoyaltyPoints && isBonusPoints) ? Number(bonusPoints) : 0,
      isAdditionalPoints,
      additionalPointsConfig,
    });
  };

  return (
    <div className="p-2 md:p-4 max-w-4xl mx-auto">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-teal-200 p-6 rounded-xl shadow-md">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <InputField id="membershipName" label="Membership Name" value={membershipName} onChange={(e) => !readOnly && setMembershipName(e.target.value)} required={!readOnly} readOnly={readOnly} />
              <InputField id="description" label="Description" value={description} onChange={(e) => !readOnly && setDescription(e.target.value)} required={!readOnly} readOnly={readOnly} />
              <div>
                <label htmlFor="validity" className="block text-sm font-medium text-gray-700 mb-1">Validity <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" name="years" value={validity.years} onChange={handleValidityChange} placeholder="Years" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" readOnly={readOnly} />
                  <input type="text" name="months" value={validity.months} onChange={handleValidityChange} placeholder="Months" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" readOnly={readOnly} />
                  <input type="text" name="days" value={validity.days} onChange={handleValidityChange} placeholder="Days" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" readOnly={readOnly} />
                </div>
              </div>
              <InputField id="price" label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} startAdornment="₹" readOnly={readOnly} />
            </div>
          </div>

          {/* Wallet Balance */}
          <div className='border border-teal-200 rounded-xl'>
            <CheckboxField label="Add Wallet Balance?" id="isWalletBalance" checked={isWalletBalance} onChange={(e) => setIsWalletBalance(e.target.checked)} disabled={readOnly}>
              <InputField id="walletBalance" label="Wallet Balance" type="number" value={walletBalance} onChange={(e) => setWalletBalance(e.target.value)} startAdornment="₹" readOnly={readOnly} />
            </CheckboxField>
          </div>

          {/* Total Discount */}
          <div className='border border-teal-200 rounded-xl'>
            <CheckboxField label="Discount On The Total Bill?" id="isTotalDiscount" checked={isTotalDiscount} onChange={(e) => setIsTotalDiscount(e.target.checked)} disabled={readOnly}>
              <div className="grid md:grid-cols-2 gap-6">
                <RadioGroup label="Discount Type" name="totalDiscountType" selectedValue={totalDiscountType} onChange={e => setTotalDiscountType(e.target.value)} options={[{ value: 'Percentage', label: 'Percentage' }, { value: 'Value', label: 'Value' }]} readOnly={readOnly} />
                <InputField id="totalDiscountValue" label={`Discount ${totalDiscountType === 'Percentage' ? '%' : 'Value'}`} type="number" value={totalDiscountValue} onChange={(e) => setTotalDiscountValue(e.target.value)} startAdornment={totalDiscountType === 'Value' ? '₹' : null} readOnly={readOnly} />
              </div>
            </CheckboxField>
          </div>

          {/* Cross Service Discount */}
          <div className='border border-teal-200 rounded-xl'>
            <CheckboxField label="Apply Discount Across All Services?" id="isCrossServiceDiscount" checked={isCrossServiceDiscount} onChange={(e) => setIsCrossServiceDiscount(e.target.checked)} disabled={readOnly}>
              <div className="space-y-6 pb-4">
                <div className="grid md:grid-cols-3 gap-6 border-b border-teal-200 pb-4">
                  <RadioGroup label="Discount Type" name="crossServiceDiscountType" selectedValue={crossServiceDiscountType} onChange={e => setCrossServiceDiscountType(e.target.value)} options={[{ value: 'Percentage', label: 'Percentage' }, { value: 'Value', label: 'Value' }]} readOnly={readOnly} />
                  <InputField id="crossServiceDiscountValue" label={`Service Discount ${crossServiceDiscountType === 'Percentage' ? '%' : 'Value'}`} type="number" value={crossServiceDiscountValue} onChange={(e) => setCrossServiceDiscountValue(e.target.value)} startAdornment={crossServiceDiscountType === 'Value' ? '₹' : null} readOnly={readOnly} />
                  <InputField id="crossServiceMaxAmount" label="Minimum Service Cost" type="number" value={crossServiceMaxAmount} onChange={(e) => setCrossServiceMaxAmount(e.target.value)} readOnly={readOnly} />
                </div>
                <div className="pt-4">
                  <RadioGroup label="Apply to Services" name="serviceInclusion" selectedValue={serviceInclusion} onChange={e => setServiceInclusion(e.target.value)} options={[{ value: 'Include All', label: 'Include All Services' }, { value: 'Include Specific', label: 'Include Specific Services' }, { value: 'Exclude', label: 'Exclude Services' }]} readOnly={readOnly} />
                  {(serviceInclusion === 'Include Specific' || serviceInclusion === 'Exclude') && (
                    <div className="mt-4">
                      <MultiSelectDropdown options={serviceNameOptions} selectedOptions={crossSelectedServices} onChange={setCrossSelectedServices} disabled={readOnly} />
                    </div>
                  )}
                </div>
              </div>
            </CheckboxField>
          </div>

          {/* Service Package */}
          <div className='border border-teal-200 rounded-xl'>
            <CheckboxField label="Include Service Package?" id="isServicePackage" checked={isServicePackage} onChange={(e) => setIsServicePackage(e.target.checked)} disabled={readOnly}>
              <div className="space-y-4">
                <div className="text-sm text-teal-700 mb-4">Choose an existing package or create a custom one</div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <RadioGroup label="Package Option" name="packageSelectionMode" selectedValue={packageSelectionMode} onChange={e => setPackageSelectionMode(e.target.value)} options={[{ value: 'existing', label: 'Select Existing Package' }, { value: 'create', label: 'Create Custom Package' }]} readOnly={readOnly} />
                </div>
                {packageSelectionMode === 'existing' && (
                  <div className="space-y-4">
                    <SelectField id="existingPackageSelection" label="Choose Existing Package" value={selectedExistingPackage} onChange={e => handleExistingPackageSelection(e.target.value)} readOnly={readOnly}>
                      <option value="">{packagesLoading ? 'Loading packages...' : 'Select a Package'}</option>
                      {availablePackages.map(pkg => (<option key={pkg.id} value={pkg.id}>{pkg.name} - ₹{pkg.price}</option>))}
                    </SelectField>
                    {selectedExistingPackage && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
                        {(() => { const pkg = availablePackages.find(p => p.id === parseInt(selectedExistingPackage)); return pkg ? <p><strong>Package Price:</strong> ₹{pkg.price}</p> : null; })()}
                        <p className="text-xs text-blue-600">Services loaded below for editing.</p>
                      </div>
                    )}
                  </div>
                )}
                {packageSelectionMode === 'create' && (
                  <div className="space-y-4">
                    {packageServices.map(service => (
                      <div key={service.id} className="p-4 bg-white rounded-lg border border-teal-200 relative space-y-4">
                        {packageServices.length > 1 && (
                          <button type="button" onClick={() => removePackageService(service.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold">&times;</button>
                        )}
                        <div className="grid gap-4">
                          <SelectField id={`package_service_${service.id}`} label="Service" value={service.service} onChange={e => handlePackageServiceChange(service.id, 'service', e.target.value)} readOnly={readOnly}>
                            <option value="">{servicesLoading ? 'Loading services...' : 'Select Service'}</option>
                            {availableServices.map(s => (<option key={s.id} value={s.name}>{s.name} - ₹{s.price} ({s.duration} min)</option>))}
                          </SelectField>
                          {service.service && service.servicePrice && (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm grid sm:grid-cols-2 md:grid-cols-4 gap-2">
                              <div><span className="font-semibold">Price:</span> ₹{service.servicePrice}</div>
                              <div><span className="font-semibold">Duration:</span> {service.serviceDuration} min</div>
                              <div><span className="font-semibold">Category:</span> {service.serviceCategory}</div>
                              <div><span className="font-semibold">ID:</span> #{service.serviceId}</div>
                            </div>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <SelectField id={`package_quantity_type_${service.id}`} label="Quantity Type" value={service.quantityType} onChange={e => handlePackageServiceChange(service.id, 'quantityType', e.target.value)} readOnly={readOnly}>
                            <option value="sessions">Number of Sessions</option>
                            <option value="hours">Total Hours</option>
                          </SelectField>
                          {service.quantityType === 'sessions' ? (
                            <InputField id={`package_sessions_${service.id}`} label="Number of Sessions" type="number" value={service.sessions} onChange={e => handlePackageServiceChange(service.id, 'sessions', e.target.value)} readOnly={readOnly} />
                          ) : (
                            <InputField id={`package_hours_${service.id}`} label="Total Hours" type="number" step="0.5" value={service.hours} onChange={e => handlePackageServiceChange(service.id, 'hours', e.target.value)} readOnly={readOnly} />
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <RadioGroup label="Discount Type (Optional)" name={`packageServiceDiscountType_${service.id}`} selectedValue={service.discountType} onChange={e => handlePackageServiceChange(service.id, 'discountType', e.target.value)} options={[{ value: 'Percentage', label: 'Percentage' }, { value: 'Value', label: 'Fixed Amount' }]} readOnly={readOnly} />
                          <InputField id={`package_service_discount_${service.id}`} label={`Additional Discount ${service.discountType === 'Percentage' ? '%' : 'Amount'}`} type="number" value={service.discountValue} onChange={e => handlePackageServiceChange(service.id, 'discountValue', e.target.value)} startAdornment={service.discountType === 'Value' ? '₹' : null} required={false} placeholder="0 for none" readOnly={readOnly} />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addPackageService} className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-teal-400 text-teal-600 rounded-lg hover:bg-gray-50 transition" disabled={readOnly}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Another Service</button>
                  </div>
                )}
              </div>
            </CheckboxField>
          </div>

          {/* Loyalty Points */}
          <div className='border border-teal-200 rounded-xl'>
            <CheckboxField label="Include Loyalty Points?" id="isLoyaltyPoints" checked={isLoyaltyPoints} onChange={(e) => setIsLoyaltyPoints(e.target.checked)} disabled={readOnly}>
              <div className="space-y-6">
                <div className="p-4 bg-white rounded-lg border border-teal-200">
                  <div className="flex items-center mb-4">
                    <input id="isBonusPoints" type="checkbox" checked={isBonusPoints} onChange={(e) => setIsBonusPoints(e.target.checked)} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" disabled={readOnly} />
                    <label htmlFor="isBonusPoints" className="ml-2 text-md font-semibold text-teal-900">One-time Bonus Points</label>
                  </div>
                  {isBonusPoints && (
                    <div>
                      <p className="text-sm text-teal-700 mb-4">Points awarded immediately on membership purchase</p>
                      <InputField id="bonusPoints" label="Bonus Points" type="number" value={bonusPoints} onChange={(e) => setBonusPoints(e.target.value)} placeholder="e.g. 100" required={false} readOnly={readOnly} />
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white rounded-lg border border-teal-200">
                  <div className="flex items-center mb-4">
                    <input id="isAdditionalPoints" type="checkbox" checked={isAdditionalPoints} onChange={(e) => setIsAdditionalPoints(e.target.checked)} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" disabled={readOnly} />
                    <label htmlFor="isAdditionalPoints" className="ml-2 text-md font-semibold text-teal-900">Additional Points Multiplier</label>
                  </div>
                  {isAdditionalPoints && (
                    <div>
                      <p className="text-sm text-teal-700 mb-4"><strong>Note:</strong> Applied on top of normal points.</p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <InputField label="Service Points Multiplier" id="service_multiplier" type="number" step="0.1" value={additionalPointsConfig.service.multiplier} onChange={(e) => handleAdditionalPointsChange('service', 'multiplier', e.target.value)} placeholder="0" required={false} readOnly={readOnly} />
                        <InputField label="Product Points Multiplier" id="products_multiplier" type="number" step="0.1" value={additionalPointsConfig.products.multiplier} onChange={(e) => handleAdditionalPointsChange('products', 'multiplier', e.target.value)} placeholder="0" required={false} readOnly={readOnly} />
                        <InputField label="Membership Points Multiplier" id="membership_multiplier" type="number" step="0.1" value={additionalPointsConfig.membership.multiplier} onChange={(e) => handleAdditionalPointsChange('membership', 'multiplier', e.target.value)} placeholder="0" required={false} readOnly={readOnly} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CheckboxField>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button type="button" onClick={onCancel} className="px-8 py-3 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-transform shadow-lg">{readOnly ? 'Close' : 'Cancel'}</button>
            {!readOnly && (
              <button type="submit" className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105 shadow-lg">{initialData ? 'Update' : 'Create'} Membership</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
