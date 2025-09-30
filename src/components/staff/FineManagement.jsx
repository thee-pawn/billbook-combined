import React, { useState, useCallback, useEffect } from 'react';

// FineEntryRow Component for individual fine types
const FineEntryRow = ({ fine, onFineChange, onRemove }) => {
  const { id, title, hours, fineType, amount } = fine;

  // Handle changes to any field within the fine entry
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Convert to number for hours and amount if applicable
    if (name === 'hours' || name === 'amount') {
      newValue = Number(value);
      if (isNaN(newValue)) { // Prevent NaN if input is not a valid number
        newValue = 0;
      }
    }

    onFineChange(id, { ...fine, [name]: newValue });
  }, [fine, id, onFineChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        {/* Title is now an editable input */}
        <input
          type="text"
          name="title"
          value={title}
          onChange={handleChange}
          className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500"
          placeholder="Fine Type"
        />
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
            type="number"
            name="hours"
            value={hours}
            onChange={handleChange}
            className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
          <span className="text-gray-600">hrs</span>
        </div>
        <div>
          <select
            name="fineType"
            value={fineType}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Fixed Amount">Fixed Amount</option>
            <option value="Half Day">Half Day</option>
            <option value="Full Day">Full Day</option>
            <option value="Custom">Custom</option> {/* Added custom option */}
          </select>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-gray-700 font-medium">₹</span>
          <input
            type="number"
            name="amount"
            value={amount.toFixed(2)} // Display with 2 decimal places
            onChange={handleChange}
            className="w-24 p-2 ml-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
            min="0"
            step="0.01"
          />
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">Amount: ₹ {amount.toFixed(2)}</p>
    </div>
  );
};

// Main FineManagement Component
export default function FineManagement() {
  // Initial fines as an array
  const [fines, setFines] = useState([
    { id: 'fine-1', title: 'Late Entry', hours: 2, fineType: 'Fixed Amount', amount: 100 },
    { id: 'fine-2', title: 'Excess Breaks', hours: 1, fineType: 'Half Day', amount: 250 },
    { id: 'fine-3', title: 'Early Out', hours: 1, fineType: 'Full Day', amount: 500 },
  ]);
  const [sendSms, setSendSms] = useState(false);

  // Calculate total amount whenever fines state changes
  const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0);

  // Callback to update individual fine entry
  const handleFineChange = useCallback((id, updatedFine) => {
    setFines(prevFines =>
      prevFines.map(fine => (fine.id === id ? updatedFine : fine))
    );
  }, []);

  // Callback to remove a fine entry
  const handleRemoveFine = useCallback((id) => {
    setFines(prevFines => prevFines.filter(fine => fine.id !== id));
  }, []);

  // Function to add a new fine entry
  const handleAddFine = useCallback(() => {
    const newId = `fine-${Date.now()}`; // Simple unique ID
    setFines(prevFines => [
      ...prevFines,
      { id: newId, title: 'New Fine Type', hours: 0, fineType: 'Fixed Amount', amount: 0 },
    ]);
  }, []);

  // Handle Apply Fine button click
  const handleApplyFine = () => {
    alert('Fines applied! Check console for details.');
  };

  return (
    <div className="">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <script src="https://cdn.tailwindcss.com"></script>

      <div className=" my-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fine</h1>
        <p className="text-sm text-gray-600 mb-6">mahesh | 08 Jul, 2025</p>

        {fines.map((fine) => (
          <FineEntryRow
            key={fine.id}
            fine={fine}
            onFineChange={handleFineChange}
            onRemove={handleRemoveFine}
          />
        ))}

        <button
          onClick={handleAddFine}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 mt-4 mb-6"
        >
          Add Fine Entry
        </button>

        {/* Conditionally render this section only if there are fines */}
        {fines.length > 0 && (
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
              onClick={handleApplyFine}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Apply Fine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
