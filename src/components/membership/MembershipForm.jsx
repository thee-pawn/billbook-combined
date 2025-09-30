import { MultiSelectDropdown } from '@components/common/MultiSelectDropdown';
import React, { useState, useRef, useEffect } from 'react';

// Helper component for form input fields to reduce repetition
const InputField = ({ label, id, type = 'text', placeholder, value, onChange, required = true, className = '', startAdornment }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
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
        className={`w-full py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${startAdornment ? 'pl-7' : 'px-4'}`}
      />
    </div>
  </div>
);

// Helper component for select dropdowns
const SelectField = ({ label, id, value, onChange, required = true, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="h-[42px] w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {children}
        </select>
    </div>
);


// Helper component for checkboxes
const CheckboxField = ({ label, id, checked, onChange, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <div className="flex items-center">
            <input
                id={id}
                name={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={id} className="ml-3 block text-md font-semibold text-gray-900">
                {label}
            </label>
        </div>
        {checked && <div className="pl-8 pt-4 border-t border-gray-200">{children}</div>}
    </div>
);


// Helper component for Radio Groups
const RadioGroup = ({ name, options, selectedValue, onChange, label }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
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
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-900">
                        {option.label}
                    </label>
                </div>
            ))}
        </div>
    </div>
);

// New Multi-Select Dropdown Component



export default function MembershipForm({ initialData = null, onSave, onCancel }) {
  const MOCK_SERVICES = ['Facial', 'Manicure', 'Pedicure', 'Massage', 'Haircut', 'Waxing', 'Threading'];
  
  // State for basic form fields
  const [membershipName, setMembershipName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [membershipType, setMembershipType] = useState(initialData?.type || 'Membership');
  const [validity, setValidity] = useState(initialData?.validity || { years: '', months: '', days: '' });
  const [price, setPrice] = useState(initialData?.price || '');

  // State for "Wallet Balance" section
  const [isWalletBalance, setIsWalletBalance] = useState(initialData?.walletBalance ? true : false);
  const [walletBalance, setWalletBalance] = useState(initialData?.walletBalance || '');

  // State for "Discount on Total Bill" section
  const [isTotalDiscount, setIsTotalDiscount] = useState(initialData?.percentage ? true : false);
  const [totalDiscountType, setTotalDiscountType] = useState('Percentage');
  const [totalDiscountValue, setTotalDiscountValue] = useState(initialData?.percentage || '');
  
  // State for "Apply Discount Across All Services" section
  const [isCrossServiceDiscount, setIsCrossServiceDiscount] = useState(false);
  const [crossServiceDiscountType, setCrossServiceDiscountType] = useState('Percentage');
  const [crossServiceDiscountValue, setCrossServiceDiscountValue] = useState('');
  const [crossServiceMaxCount, setCrossServiceMaxCount] = useState(1);
  const [serviceInclusion, setServiceInclusion] = useState('Include All');
  const [crossSelectedServices, setCrossSelectedServices] = useState([]);

  // State for "Duration Membership"
  const [isDurationMembership, setIsDurationMembership] = useState(false);
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('30Min');

  // State for "Discount on Specific Services"
  const [isSpecificDiscount, setIsSpecificDiscount] = useState(false);
  const [specificDiscounts, setSpecificDiscounts] = useState([
    { id: 1, service: 'Facial', count: 1, discountType: 'Percentage', discountValue: 10 }
  ]);

  const handleValidityChange = (e) => {
      const { name, value } = e.target;
      // Allow only numbers
      if (/^\d*$/.test(value)) {
          setValidity(prev => ({ ...prev, [name]: value }));
      }
  };

  const addSpecificDiscount = () => {
    setSpecificDiscounts([
      ...specificDiscounts,
      { id: Date.now(), service: '', count: 0, discountType: 'Percentage', discountValue: 0 }
    ]);
  };

  const removeSpecificDiscount = (id) => {
    setSpecificDiscounts(specificDiscounts.filter(d => d.id !== id));
  };
  
  const handleSpecificDiscountChange = (id, field, value) => {
      setSpecificDiscounts(specificDiscounts.map(d => d.id === id ? {...d, [field]: value} : d));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare form data for saving
    const formData = {
        id: initialData?.id || Date.now(),
        name: membershipName,
        type: membershipType,
        description,
        validity,
        price,
        walletBalance: isWalletBalance ? walletBalance : "0",
        percentage: isTotalDiscount ? Number(totalDiscountValue) : 0,
        status: initialData?.status || 'Active',
        
        // Include other form fields
        isCrossServiceDiscount,
        crossServiceDiscountType,
        crossServiceDiscountValue,
        crossServiceMaxCount,
        serviceInclusion,
        crossSelectedServices,
        isDurationMembership,
        duration,
        durationUnit,
        isSpecificDiscount,
        specificDiscounts
    };
    
    // Call the onSave function passed as prop
    onSave(formData);
  };

  return (
    <div className="  p-4 ">
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Top Section: Basic Info */}
          <div className="bg-white border border-gray-300 p-6 rounded-xl shadow-md">
             <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-4">
                {/* Type Selection */}
                <SelectField 
                  id="membershipType" 
                  label="Type" 
                  value={membershipType} 
                  onChange={(e) => setMembershipType(e.target.value)}
                >
                  <option value="Membership">Membership</option>
                  <option value="Package">Package</option>
                  <option value="Loyalty">Loyalty Program</option>
                </SelectField>
                
                <InputField 
                  id="membershipName" 
                  label={membershipType === 'Package' ? 'Package Name' : 
                         membershipType === 'Loyalty' ? 'Program Name' : 'Membership Name'} 
                  value={membershipName} 
                  onChange={(e) => setMembershipName(e.target.value)} 
                />
                <InputField id="description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

                {/* Custom Validity Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validity <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="text" name="years" value={validity.years} onChange={handleValidityChange} placeholder="Years" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" name="months" value={validity.months} onChange={handleValidityChange} placeholder="Months" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" name="days" value={validity.days} onChange={handleValidityChange} placeholder="Days" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <InputField id="price" label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} startAdornment="₹" />
             </div>
          </div>
          
                  {/* Wallet Balance Section */}
                  <div className='border border-gray-300 rounded-xl'>
          <CheckboxField label="Add Wallet Balance?" id="isWalletBalance" checked={isWalletBalance} onChange={(e) => setIsWalletBalance(e.target.checked)}>
             <InputField 
                id="walletBalance" 
                label="Wallet Balance"
                type="number"
                value={walletBalance}
                onChange={(e) => setWalletBalance(e.target.value)}
                required={true}
                startAdornment="₹"
             />
                      </CheckboxField>
                      </div>

                  {/* Discount on Total Bill Section */}
                  <div className='border border-gray-300 rounded-xl'>
          <CheckboxField label="Discount On The Total Bill?" id="isTotalDiscount" checked={isTotalDiscount} onChange={(e) => setIsTotalDiscount(e.target.checked)}>
             <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <RadioGroup 
                    label="Discount Type"
                    name="totalDiscountType"
                    selectedValue={totalDiscountType}
                    onChange={e => setTotalDiscountType(e.target.value)}
                    options={[{value: 'Percentage', label: 'Percentage'}, {value: 'Value', label: 'Value'}]}
                />
                <InputField 
                    id="totalDiscountValue" 
                    label={`Discount ${totalDiscountType === 'Percentage' ? '%' : 'Value'}`} 
                    type="number"
                    value={totalDiscountValue}
                    onChange={(e) => setTotalDiscountValue(e.target.value)}
                    startAdornment={totalDiscountType === 'Value' ? '₹' : null}
                />
             </div>
                      </CheckboxField>
                      </div>
          
                  {/* Apply Discount Across All Services Section */}
            <div className='border border-gray-300 rounded-xl'>
           <CheckboxField label="Apply Discount Across All Services?" id="isCrossServiceDiscount" checked={isCrossServiceDiscount} onChange={(e) => setIsCrossServiceDiscount(e.target.checked)}>
               <div className="space-y-6pb-4">
                   <div className="grid  border-b border-gray-200  pb-4 grid-cols-3 md:grid-cols-3 gap-6">
                        <RadioGroup 
                            label="Discount Type"
                            name="crossServiceDiscountType"
                            selectedValue={crossServiceDiscountType}
                            onChange={e => setCrossServiceDiscountType(e.target.value)}
                            options={[{value: 'Percentage', label: 'Percentage'}, {value: 'Value', label: 'Value'}]}
                        />
                       <InputField id="crossServiceDiscountValue" label={`Service Discount ${crossServiceDiscountType === 'Percentage' ? '%' : 'Value'}`} type="number" value={crossServiceDiscountValue} onChange={(e) => setCrossServiceDiscountValue(e.target.value)} startAdornment={crossServiceDiscountType === 'Value' ? '₹' : null} />
                       <InputField id="crossServiceMaxCount" label="Minimum Service Cost" type="number" value={crossServiceMaxCount} onChange={(e) => setCrossServiceMaxCount(e.target.value)} />
                   </div>
                   <div className="pt-4">
                       <RadioGroup
                           label="Apply to Services"
                           name="serviceInclusion"
                           selectedValue={serviceInclusion}
                           onChange={e => setServiceInclusion(e.target.value)}
                           options={[
                               {value: 'Include All', label: 'Include All Services'}, 
                               {value: 'Include Specific', label: 'Include Specific Services'},
                               {value: 'Exclude', label: 'Exclude Services'}
                           ]}
                       />
                       {(serviceInclusion === 'Include Specific' || serviceInclusion === 'Exclude') && (
                           <div className="mt-4">
                               <MultiSelectDropdown
                                   options={MOCK_SERVICES}
                                   selectedOptions={crossSelectedServices}
                                   onChange={setCrossSelectedServices}
                               />
                           </div>
                       )}
                   </div>
               </div>
                      </CheckboxField>
                      </div>

                  {/* Duration Membership Section */}
                  <div className='border border-gray-300 rounded-xl'>
           <CheckboxField label="Duration Membership?" id="isDurationMembership" checked={isDurationMembership} onChange={(e) => setIsDurationMembership(e.target.checked)}>
              <div className="flex items-end gap-4">
                 <InputField id="duration" label="Duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                 <div className="flex rounded-lg border border-gray-300">
                     <button type="button" onClick={() => setDurationUnit('Min')} className={`px-4 py-2 rounded-l-md ${durationUnit === 'Min' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700'} transition`}>Min</button>
                     <button type="button" onClick={() => setDurationUnit('Hrs')} className={`px-4 py-2 rounded-r-md ${durationUnit === 'Hrs' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700'} transition`}>Hrs</button>
                 </div>
              </div>
                      </CheckboxField>
                      </div>

                  {/* Discount on Specific Services Section */}
                  <div className='border border-gray-300 rounded-xl'>
           <CheckboxField label="Service Package" id="isSpecificDiscount" checked={isSpecificDiscount} onChange={(e) => setIsSpecificDiscount(e.target.checked)}>
               <div className="space-y-4">
                   {specificDiscounts.map((discount) => (
                       <div key={discount.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative space-y-4">
                           {specificDiscounts.length > 1 && (
                               <button type="button" onClick={() => removeSpecificDiscount(discount.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold">&times;</button>
                           )}
                           <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                               <SelectField 
                                    id={`service_name_${discount.id}`} 
                                    label="Service" 
                                    value={discount.service} 
                                    onChange={e => handleSpecificDiscountChange(discount.id, 'service', e.target.value)}
                                >
                                    <option value="">Select Service</option>
                                    {MOCK_SERVICES.map(service => <option key={service} value={service}>{service}</option>)}
                               </SelectField>
                               <InputField id={`service_count_${discount.id}`} label="Service Count" type="number" value={discount.count} onChange={e => handleSpecificDiscountChange(discount.id, 'count', e.target.value)} />
                           </div>
                            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                               <RadioGroup
                                   label="Service Discount Type"
                                   name={`specificDiscountType_${discount.id}`}
                                   selectedValue={discount.discountType}
                                   onChange={e => handleSpecificDiscountChange(discount.id, 'discountType', e.target.value)}
                                   options={[{value: 'Percentage', label: 'Percentage'}, {value: 'Value', label: 'Value'}]}
                               />
                               <InputField 
                                   id={`service_discount_val_${discount.id}`} 
                                   label={`Service Discount ${discount.discountType === 'Percentage' ? '%' : 'Value'}`} 
                                   type="number" value={discount.discountValue} 
                                   onChange={e => handleSpecificDiscountChange(discount.id, 'discountValue', e.target.value)} 
                                   startAdornment={discount.discountType === 'Value' ? '₹' : null}
                               />
                           </div>
                       </div>
                   ))}
                   <button type="button" onClick={addSpecificDiscount} className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 transition">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                       Add Another Service
                   </button>
               </div>
                      </CheckboxField>
                      </div>

           {/* Submit Button */}
          <div className="flex justify-center space-x-4">
             <button 
                type="button" 
                onClick={onCancel}
                className="px-8 py-3 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-transform shadow-lg"
             >
                Cancel
             </button>
             <button 
                type="submit" 
                className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105 shadow-lg"
             >
                {initialData ? 'Update' : 'Create'} {membershipType}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
