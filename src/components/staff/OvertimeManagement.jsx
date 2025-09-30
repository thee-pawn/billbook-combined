import React, { useState, useCallback, useEffect } from 'react';

// OvertimeEntryRow Component for individual overtime types
const OvertimeEntryRow = ({ overtime, onOvertimeChange, onRemove }) => {
  const { id, title, hours, overtimeType, amount } = overtime;

  // Handle changes to any field within the overtime entry
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Convert to number for hours and amount if applicable
    if (name === 'hours') {
      // Ensure hours are formatted as HH:MM
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m) && h >= 0 && m >= 0 && m < 60) {
        newValue = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      } else {
        newValue = "00:00"; // Default to 00:00 on invalid input
      }
    } else if (name === 'amount') {
      newValue = Number(value);
      if (isNaN(newValue)) {
        newValue = 0;
      }
    }

    onOvertimeChange(id, { ...overtime, [name]: newValue });
  }, [overtime, id, onOvertimeChange]);

  // Effect to calculate amount based on overtimeType and hours
  useEffect(() => {
    let calculatedAmount = amount; // Start with current amount if it's manually set

    // Only auto-calculate if overtimeType is not 'Custom'
    if (overtimeType !== 'Custom') {
      const [h, m] = hours.split(':').map(Number);
      const totalHours = h + m / 60; // Convert HH:MM to total hours

      switch (overtimeType) {
        case 'Fixed Amount':
          calculatedAmount = 0; // As per image, fixed amount starts at 0
          break;
        case '1x Salary':
          calculatedAmount = 104.17 * totalHours; // Example rate
          break;
        case '1.5x Salary':
          calculatedAmount = (104.17 * 1.5) * totalHours; // Example rate
          break;
        case '2x Salary':
          calculatedAmount = (104.17 * 2) * totalHours; // Example rate
          break;
        default:
          calculatedAmount = 0;
      }
    }

    // Update the parent component with the calculated amount
    onOvertimeChange(id, { ...overtime, amount: calculatedAmount });
  }, [hours, overtimeType, id, onOvertimeChange]);


  return (
    <div className="">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button
          onClick={() => onRemove(id)}
          className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-700 transition duration-200"
          aria-label={`Remove ${title}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div className="grid sm:grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="flex items-center space-x-2">
          <input
            type="text" // Changed to text to allow HH:MM format
            name="hours"
            value={hours}
            onChange={handleChange}
            className="w-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="HH:MM"
          />
          <span className="text-gray-600">hrs</span>
        </div>
        <div>
          <select
            name="overtimeType"
            value={overtimeType}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Fixed Amount">Fixed Amount</option>
            <option value="1x Salary">1x Salary</option>
            <option value="1.5x Salary">1.5x Salary</option>
            <option value="2x Salary">2x Salary</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-gray-700 font-medium">₹</span>
          <input
            type="number"
            name="amount"
            value={amount.toFixed(2)}
            onChange={handleChange}
            className="w-24 p-2 ml-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
            min="0"
            step="0.01"
            disabled={overtimeType !== 'Custom'} // Disable if not custom
          />
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">Amount: ₹ {amount.toFixed(2)}</p>
    </div>
  );
};

// Main OvertimeManagement Component
export default function OvertimeManagement() {
  const [overtimes, setOvertimes] = useState([
    { id: 'overtime-1', title: 'Overtime (after the shift ends)', hours: '01:00', overtimeType: 'Fixed Amount', amount: 0 },
    { id: 'overtime-2', title: 'Early Overtime (before the shift begins)', hours: '00:00', overtimeType: '1x Salary', amount: 0 },
  ]);
  const [sendSms, setSendSms] = useState(false);

  // Calculate total amount whenever overtimes state changes
  const totalAmount = overtimes.reduce((sum, overtime) => sum + overtime.amount, 0);

  // Callback to update individual overtime entry
  const handleOvertimeChange = useCallback((id, updatedOvertime) => {
    setOvertimes(prevOvertimes =>
      prevOvertimes.map(overtime => (overtime.id === id ? updatedOvertime : overtime))
    );
  }, []);

  // Callback to remove an overtime entry
  const handleRemoveOvertime = useCallback((id) => {
    setOvertimes(prevOvertimes => prevOvertimes.filter(overtime => overtime.id !== id));
  }, []);

  // Handle Apply Overtime button click
  const handleApplyOvertime = () => {
    alert('Overtimes applied! Check console for details.');
  };

  return (
    <div className=" font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <script src="https://cdn.tailwindcss.com"></script>

      <div className=" mx-auto  my-8 ">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Overtime</h1>
        <p className="text-sm text-gray-600 mb-6">Shailendra | 01 Jul, 2025</p>

        {overtimes.map((overtime) => (
          <OvertimeEntryRow
            key={overtime.id}
            overtime={overtime}
            onOvertimeChange={handleOvertimeChange}
            onRemove={handleRemoveOvertime}
          />
        ))}

        {/* Conditionally render this section only if there are overtimes */}
        {overtimes.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-800">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">₹ {totalAmount.toFixed(2)}</span>
            </div>

            <label className="flex items-center space-x-2 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={sendSms}
                onChange={(e) => setSendSms(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Send SMS to Staff</span>
            </label>

            <button
              onClick={handleApplyOvertime}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              Apply Overtime
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
