import React, { useEffect, useState } from 'react';
import { servicesApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';

// Helper component for form input fields
const InputField = ({ label, id, type = 'text', placeholder, value, onChange, required = true, className = '', startAdornment, disabled = false }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 text-left">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {startAdornment && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">{startAdornment}</span>
        </div>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
  disabled={disabled}
        className={`w-full py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${startAdornment ? 'pl-7' : 'px-4'}`}
      />
    </div>
  </div>
);

// Helper component for select dropdowns
const SelectField = ({ label, id, value, onChange, required = true, children, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 text-left">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="h-[42px] w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
            {children}
        </select>
    </div>
);

// Helper component for text areas
const TextAreaField = ({ label, id, value, onChange, placeholder, required = true, rows = 3, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 text-left">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-vertical"
        />
    </div>
);

// Helper component for Radio Groups
const RadioGroup = ({ name, options, selectedValue, onChange, label, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
        <div className="flex items-center space-x-6">
            {options.map(option => (
                <div key={option.value} className="flex items-center">
                    <input
                        id={`${name}-${option.value}`}
                        name={name}
                        type="radio"
                        value={option.value}
                        checked={selectedValue === option.value}
                        onChange={onChange}
                        disabled={disabled}
                        className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-900">
                        {option.label}
                    </label>
                </div>
            ))}
        </div>
    </div>
);

const PackageFormComponent = ({ initialData, onSave, onCancel, readOnly = false }) => {
  const { currentStore } = useStore();
  // Basic package information
  const [packageName, setPackageName] = useState(initialData?.packageName || '');
  const [packageDescription, setPackageDescription] = useState(initialData?.description || '');
  const [packagePrice, setPackagePrice] = useState(initialData?.price || '');
  const [packageDiscountType, setPackageDiscountType] = useState(initialData?.discountType || '');
  const [packageDiscountValue, setPackageDiscountValue] = useState(initialData?.discountValue || '');
  const [validity, setValidity] = useState(() => {
    const v = initialData?.validity || {};
    const raw = initialData?._raw || {};
    return {
      years: v.years ?? raw.validity_years ?? 0,
      months: v.months ?? raw.validity_months ?? 0,
      days: v.days ?? raw.validity_days ?? 0,
    };
  });

  // Services included in the package
  const [packageServices, setPackageServices] = useState(initialData?.services || [
    { id: 1, service: '', serviceId: '', servicePrice: '', serviceDuration: '', serviceCategory: '', quantityType: 'sessions', sessions: 1, hours: 1, discountType: 'Percentage', discountValue: 0 }
  ]);

  // Available services fetched from API (same mapping as CouponFormComponent)
  const [availableServices, setAvailableServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      if (!currentStore?.id) return;
      setServicesLoading(true);
      try {
        const response = await servicesApi.getAll(currentStore.id);
        if (response?.data?.services) {
          const transformed = response.data.services.map(service => ({
            id: service.id,
            name: service.name,
            price: parseFloat(service.price),
            duration: service.duration,
            category: service.category,
            description: service.description,
            gender: service.gender,
            status: service.status,
            reminder: service.reminder,
            taxPercnt: parseFloat(service.tax_prcnt || 0)
          }));
          setAvailableServices(transformed);
        } else {
          setAvailableServices([]);
        }
      } catch (err) {
        setAvailableServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, [currentStore?.id]);

  // Service management functions
  const addPackageService = () => {
    const newId = Math.max(...packageServices.map(s => s.id)) + 1;
    setPackageServices([...packageServices, {
      id: newId,
      service: '',
      serviceId: '',
      servicePrice: '',
      serviceDuration: '',
      serviceCategory: '',
      quantityType: 'sessions',
      sessions: 1,
      hours: 1,
      discountType: 'Percentage',
      discountValue: 0
    }]);
  };

  const removePackageService = (id) => {
    setPackageServices(packageServices.filter(service => service.id !== id));
  };

  const handlePackageServiceChange = (id, field, value) => {
    setPackageServices(packageServices.map(service => {
      if (service.id === id) {
        if (field === 'service') {
          // Find the selected service details
          const selectedService = availableServices.find(s => s.name === value);
          if (selectedService) {
            return {
              ...service,
              [field]: value,
              serviceId: selectedService.id,
              servicePrice: selectedService.price,
              serviceDuration: selectedService.duration,
              serviceCategory: selectedService.category
            };
          }
        }
        return { ...service, [field]: value };
      }
      return service;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return; // no-op in view mode
    
    const packageData = {
      name: packageName,
      description: packageDescription,
      price: parseFloat(packagePrice) || 0,
      discountType: packageDiscountType,
      discountValue: parseFloat(packageDiscountValue) || 0,
      validity: {
        years: Number(validity.years) || 0,
        months: Number(validity.months) || 0,
        days: Number(validity.days) || 0,
      },
      services: packageServices.filter(service => service.service) // Only include services that are selected
    };

    onSave(packageData);
  };

  // Sync state when initialData changes (for View/Edit)
  useEffect(() => {
    if (initialData) {
      setPackageName(initialData.packageName || '');
      setPackageDescription(initialData.description || '');
      setPackagePrice(initialData.price || '');
      const v = initialData.validity || {};
      setValidity({
        years: v.years ?? 0,
        months: v.months ?? 0,
        days: v.days ?? 0,
      });
      if (Array.isArray(initialData.services) && initialData.services.length > 0) {
        setPackageServices(initialData.services.map((s, idx) => ({
          id: s.id || idx + 1,
          service: s.service || '',
          serviceId: s.serviceId || '',
          servicePrice: s.servicePrice || '',
          serviceDuration: s.serviceDuration || '',
          serviceCategory: s.serviceCategory || '',
          quantityType: s.quantityType || 'sessions',
          sessions: s.sessions ?? 1,
          hours: s.hours ?? 1
        })));
      } else {
        setPackageServices([{ id: 1, service: '', serviceId: '', servicePrice: '', serviceDuration: '', serviceCategory: '', quantityType: 'sessions', sessions: 1, hours: 1}]);
      }
    } else {
      // Reset for create mode
      setPackageName('');
      setPackageDescription('');
      setPackagePrice('');
      setValidity({ years: 0, months: 0, days: 0 });
      setPackageServices([{ id: 1, service: '', serviceId: '', servicePrice: '', serviceDuration: '', serviceCategory: '', quantityType: 'sessions', sessions: 1, hours: 1}]);
    }
  }, [initialData]);

  return (
    <div className="max-w-4xl mx-auto p-2">
  <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Package Information */}
        <div className="bg-white p-6 rounded-xl border border-teal-200 shadow-sm space-y-4">
          <h4 className="text-md font-medium text-teal-900 mb-4 text-left">Package Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="packageName"
              label="Package Name"
              placeholder="Enter package name"
              value={packageName}
              onChange={e => setPackageName(e.target.value)}
              disabled={readOnly}
            />
            
            <InputField
              id="packagePrice"
              label="Package Price"
              type="number"
              placeholder="Enter package price"
              value={packagePrice}
              onChange={e => setPackagePrice(e.target.value)}
              disabled={readOnly}
              startAdornment="₹"
            />
          </div>

          <TextAreaField
            id="packageDescription"
            label="Package Description"
            placeholder="Describe what's included in this package"
            value={packageDescription}
            onChange={e => setPackageDescription(e.target.value)}
            required={false}
            disabled={readOnly}
          />

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              id="validityYears"
              label="Validity (Years)"
              type="number"
              placeholder="0"
              value={validity.years}
              onChange={e => setValidity(v => ({ ...v, years: e.target.value }))}
              required={false}
              disabled={readOnly}
            />
            <InputField
              id="validityMonths"
              label="Validity (Months)"
              type="number"
              placeholder="0"
              value={validity.months}
              onChange={e => setValidity(v => ({ ...v, months: e.target.value }))}
              required={false}
              disabled={readOnly}
            />
            <InputField
              id="validityDays"
              label="Validity (Days)"
              type="number"
              placeholder="0"
              value={validity.days}
              onChange={e => setValidity(v => ({ ...v, days: e.target.value }))}
              required={false}
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Services Included in Package */}
        <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-sm space-y-4">
          <h4 className="text-md font-medium text-teal-900 mb-4 text-left">Services Included</h4>
          
          <div className="space-y-4">
            {packageServices.map((service) => (
              <div key={service.id} className="p-4 bg-white rounded-lg border border-teal-200 relative space-y-4">
                {packageServices.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removePackageService(service.id)} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold hover:bg-red-600 transition"
                  >
                    &times;
                  </button>
                )}
                
                <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                  <SelectField 
                    id={`package_service_${service.id}`} 
                    label="Service" 
                    value={service.service} 
                    onChange={e => handlePackageServiceChange(service.id, 'service', e.target.value)}
                    disabled={readOnly}
                  >
                    <option value="">{servicesLoading ? 'Loading services…' : 'Select Service'}</option>
                    {availableServices.map(availableService => (
                      <option key={availableService.id} value={availableService.name}>
                        {availableService.name} - ₹{availableService.price} ({availableService.duration} min)
                      </option>
                    ))}
                  </SelectField>
                  
                  {/* Service Details Display */}
                  {service.service && service.servicePrice && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-semibold text-gray-600">Price:</span>
                          <span className="ml-1 text-teal-700">₹{service.servicePrice}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-600">Duration:</span>
                          <span className="ml-1 text-teal-700">{service.serviceDuration} min</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-600">Category:</span>
                          <span className="ml-1 text-teal-700">{service.serviceCategory}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-600">ID:</span>
                          <span className="ml-1 text-teal-700">#{service.serviceId}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  <SelectField 
                    id={`package_quantity_type_${service.id}`} 
                    label="Quantity Type" 
                    value={service.quantityType} 
                    onChange={e => handlePackageServiceChange(service.id, 'quantityType', e.target.value)}
                    disabled={readOnly}
                  >
                    <option value="sessions">Number of Sessions</option>
                    <option value="hours">Total Hours</option>
                  </SelectField>
                  
                  {service.quantityType === 'sessions' ? (
                    <InputField 
                      id={`package_sessions_${service.id}`} 
                      label="Number of Sessions" 
                      type="number" 
                      value={service.sessions} 
                      onChange={e => handlePackageServiceChange(service.id, 'sessions', e.target.value)} 
                      placeholder="1"
                      disabled={readOnly}
                    />
                  ) : (
                    <InputField 
                      id={`package_hours_${service.id}`} 
                      label="Total Hours" 
                      type="number" 
                      step="0.5"
                      value={service.hours} 
                      onChange={e => handlePackageServiceChange(service.id, 'hours', e.target.value)} 
                      placeholder="1"
                      disabled={readOnly}
                    />
                  )}
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addPackageService} 
              className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-teal-400 text-teal-600 rounded-lg hover:bg-gray-50 transition"
              disabled={readOnly}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Another Service
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          {!readOnly && (
          <button
            type="submit"
            className="px-6 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition"
          >
            Save Package
          </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PackageFormComponent;
