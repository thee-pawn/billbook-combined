import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Info, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// Salary builder component (controlled via onChange)
const StaffSalary = ({ value, onChange, readOnly = false }) => {
  // Initialize from incoming value (only once); subsequent external changes can be synced if needed
  const [salaryType, setSalaryType] = useState(value?.salaryType || 'Monthly');
  const [salaryCycle, setSalaryCycle] = useState(value?.salaryCycle || '1 to 1 of Every Month');
  const [earnings, setEarnings] = useState(value?.earnings?.length ? value.earnings : [
    { id: 1, name: 'Basic', value: '0', isCustom: false }
  ]);
  const [deductions, setDeductions] = useState(value?.deductions || []);

  const [isEarningsExpanded, setIsEarningsExpanded] = useState(true);
  const [isDeductionsExpanded, setIsDeductionsExpanded] = useState(true);

  // Derived totals
  const totals = React.useMemo(() => {
    const totalEarnings = earnings.reduce((sum, i) => sum + (parseFloat(i.value) || 0), 0);
    const totalDeductions = deductions.reduce((sum, i) => sum + (parseFloat(i.value) || 0), 0);
    const grossPay = totalEarnings;
    const netPayInHand = totalEarnings - totalDeductions;
    return { totalEarnings, totalDeductions, grossPay, netPayInHand };
  }, [earnings, deductions]);

  // Propagate up whenever core data changes
  useEffect(() => {
    onChange?.({
      salaryType,
      salaryCycle,
      earnings,
      deductions,
      totals
    });
  }, [salaryType, salaryCycle, earnings, deductions, totals, onChange]);

  // Optional sync if parent value object changes reference (deep sync can be added if required)
  useEffect(() => {
    if (value) {
      if (value.salaryType && value.salaryType !== salaryType) setSalaryType(value.salaryType);
      if (value.salaryCycle && value.salaryCycle !== salaryCycle) setSalaryCycle(value.salaryCycle);
      if (value.earnings && value.earnings !== earnings) setEarnings(value.earnings);
      if (value.deductions && value.deductions !== deductions) setDeductions(value.deductions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleInputChange = (type, id, newValue) => {
    if (readOnly) return;
    if (type === 'earnings') {
      setEarnings(prev => prev.map(item => item.id === id ? { ...item, value: newValue } : item));
    } else {
      setDeductions(prev => prev.map(item => item.id === id ? { ...item, value: newValue } : item));
    }
  };

  // Handler to add new custom earning/deduction field
  const handleAddMore = (type) => {
    if (readOnly) return;
    const newItem = {
      id: Date.now(), // Unique ID for the new item
      name: "",
      value: '0',
      isCustom: true,
    };
    if (type === 'earnings') {
      setEarnings(prev => [...prev, newItem]);
    } else if (type === 'deductions') {
      setDeductions(prev => [...prev, newItem]);
    }
  };

  // Handler to remove an earning/deduction field
  const handleRemoveItem = (type, id) => {
    if (readOnly) return;
    if (type === 'earnings') {
      setEarnings(prev => prev.filter(item => item.id !== id));
    } else if (type === 'deductions') {
      setDeductions(prev => prev.filter(item => item.id !== id));
    }
  };

  // Helper component for an input row (Earning/Deduction)
  // NOTE: Previously an inner component (InputRow) caused remounts each render (new function identity).
  // Rows are now rendered inline inside map to keep stable DOM nodes and preserve cursor during typing.

  return (
    <div className=" flex items-center justify-center font-inter">
      <style>{`
      /* Hide number input spinners for all browsers */
      input.hide-number-spin::-webkit-outer-spin-button,
      input.hide-number-spin::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input.hide-number-spin[type=text][inputmode=decimal] {
        -moz-appearance: textfield;
      }
    `}</style>
  <div className="bg-white w-full max-w-2xl">
        {/* Salary Type and Salary Cycle */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="salaryType" className="block text-gray-700 font-semibold mb-2 text-left">
              Salary Type
            </label>
            <div className="relative">
              <select
                id="salaryType"
        value={salaryType}
        onChange={(e) => setSalaryType(e.target.value)}
        disabled={readOnly}
        className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white pr-8 disabled:opacity-50"
              >
                <option>Monthly</option>
                <option>Annually</option>
                <option>Weekly</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>
          </div>
        </div>

        {/* Earnings Section */}
        <div className="mb-8 border border-gray-200 rounded-lg p-4">
          <div
            className="flex items-center justify-between cursor-pointer py-2"
            onClick={() => setIsEarningsExpanded(!isEarningsExpanded)}
          >
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800 mr-2">Earnings</h3>
              <Info size={16} className="text-gray-400" />
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 font-semibold text-lg">
                ₹{totals.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Month
              </span>
              {isEarningsExpanded ? <ChevronUp size={20} className="ml-2 text-gray-500" /> : <ChevronDown size={20} className="ml-2 text-gray-500" />}
            </div>
          </div>
          {isEarningsExpanded && (
            <div className="mt-4">
              {earnings.map(item => {
                return (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    {item.isCustom ? (
                      <input
                        type="text"
                        value={item.name}
                        disabled={readOnly}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setEarnings(prev => prev.map(i => i.id === item.id ? { ...i, name: newName } : i));
                        }}
                        className="flex-1 p-2 mr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    ) : (
                      <span className="text-gray-700 font-medium w-40 truncate">{item.name}</span>
                    )}
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">₹</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.value}
                        disabled={readOnly}
                        onChange={(e) => handleInputChange('earnings', item.id, e.target.value)}
                        className="w-24 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-teal-500 hide-number-spin"
                      />
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('earnings', item.id)}
                          className="ml-3 p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors duration-200"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleAddMore('earnings')}
                  className="mt-4 text-teal-700 font-medium flex items-center"
                >
                  + Add More
                </button>)
              }
            </div>
          )}
        </div>

        {/* Deductions Section */}
        <div className="mb-8 border border-gray-200 rounded-lg p-4">
          <div
            className="flex items-center justify-between cursor-pointer py-2"
            onClick={() => setIsDeductionsExpanded(!isDeductionsExpanded)}
          >
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800 mr-2">Deductions</h3>
              <Info size={16} className="text-gray-400" />
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 font-semibold text-lg">
                ₹{totals.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Month
              </span>
              {isDeductionsExpanded ? <ChevronUp size={20} className="ml-2 text-gray-500" /> : <ChevronDown size={20} className="ml-2 text-gray-500" />}
            </div>
          </div>
          {isDeductionsExpanded && (
            <div className="mt-4">
              {deductions.map(item => {
                return (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    {item.isCustom ? (
                      <input
                        type="text"
                        value={item.name}
                        disabled={readOnly}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setDeductions(prev => prev.map(i => i.id === item.id ? { ...i, name: newName } : i));
                        }}
                        className="flex-1 p-2 mr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    ) : (
                      <span className="text-gray-700 font-medium w-40 truncate">{item.name}</span>
                    )}
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">₹</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.value}
                        disabled={readOnly}
                        onChange={(e) => handleInputChange('deductions', item.id, e.target.value)}
                        className="w-24 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-teal-500 hide-number-spin"
                      />
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('deductions', item.id)}
                          className="ml-3 p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors duration-200"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleAddMore('deductions')}
                  className="mt-4 text-teal-700 font-medium flex items-center"
                >
                  + Add More
                </button>)
              }
            </div>
          )}
        </div>

        {/* Gross Pay and Net Pay In Hand */}
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-800 font-semibold text-lg">Gross Pay <span className="text-gray-500 text-sm">(Total Earnings)</span></span>
            <span className="text-gray-800 font-bold text-lg">
              ₹{totals.grossPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Month
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-800 font-semibold text-lg">Net Pay In Hand <span className="text-gray-500 text-sm">(Gross Pay - Deductions)</span></span>
            <span className="text-gray-800 font-bold text-lg">
              ₹{totals.netPayInHand.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Month
            </span>
          </div>
        </div>

        {/* Create Salary Button */}
      </div>
    </div>
  );
};

StaffSalary.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default StaffSalary;
