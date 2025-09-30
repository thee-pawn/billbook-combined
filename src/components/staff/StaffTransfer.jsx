import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

export default function TransferStaff({ handleClose } ) {
  const { showNotification } = useNotification();
  const [transferType, setTransferType] = useState('Permanent');
  const [selectedDate, setSelectedDate] = useState('');
  const [moveToBranch, setMoveToBranch] = useState('');
  const [staffName, setStaffName] = useState('John Doe'); // Example staff name

    const handleTransfer = () => {
      console.log('Transfer data:', {
        staffName,
        transferType,
        selectedDate,
        moveToBranch,
      });
      showNotification(`Transfer initiated for ${staffName} to ${moveToBranch} on ${selectedDate} as ${transferType}.`, 'success');
      // In a real application, you would send this data to a backend
    };

  return (
    
      

      <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition duration-200"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <h2 className="text-xl font-bold text-teal-600 text-center mt-4 mb-1">Transfer Staff</h2>
        <p className="text-lg font-bold text-gray-800 text-center mb-6">({staffName})</p>

        <div className="mb-4">
          <label htmlFor="transferType" className="block text-gray-700 text-sm font-semibold mb-2">
            Transfer Type:-
          </label>
          <select
            id="transferType"
            value={transferType}
            onChange={(e) => setTransferType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
          >
            <option value="Permanent">Permanent</option>
            <option value="Temporary">Temporary</option>
            <option value="Probation">Probation</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="selectDate" className="block text-gray-700 text-sm font-semibold mb-2">
            Select Date:-
          </label>
          <div className="relative">
            <input
              type="date" // Use type="date" for native date picker
              id="selectDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
              placeholder="dd-mm-yyyy"
            />
            {/* Calendar icon - native date input usually provides one */}
            {/* If a custom icon is needed, it would be positioned absolutely */}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="moveToBranch" className="block text-gray-700 text-sm font-semibold mb-2">
            Move to Branch:-
          </label>
          <select
            id="moveToBranch"
            value={moveToBranch}
            onChange={(e) => setMoveToBranch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
          >
            <option value="">Select</option>
            <option value="Branch A">Branch A</option>
            <option value="Branch B">Branch B</option>
            <option value="Branch C">Branch C</option>
          </select>
        </div>

        <button
          onClick={handleTransfer}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
        >
          {/* Refresh/Transfer icon from Lucide React if available */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.76 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.76-2.74L21 16"/><path d="M21 21v-5h-5"/></svg>
          <span>Transfer</span>
        </button>
      </div>
  );
}
