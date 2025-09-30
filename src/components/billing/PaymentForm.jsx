import { ArrowRightIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

// Helper function to format date as YYYY-MM-DD for input type="date"
const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format time as HH:MM for input type="time"
const getFormattedTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};


const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const SplitPaymentComponent = ({ totalDueAmount = 0, payments = [], onAddPayment, onDeletePayment, advanceAmount = 0, onClearAdvance }) => {
  const { showWarning } = useNotification();
  const initialDate = new Date();
  const [selectedDate, setSelectedDate] = useState(getFormattedDate(initialDate));
  const [selectedTime, setSelectedTime] = useState(getFormattedTime(initialDate));

  const paymentOptions = ['CASH', 'UPI', 'WALLET', 'CREDIT CARD', 'DEBIT CARD', 'LOYALTY POINTS'];
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(paymentOptions[0]);
  const [currentAmount, setCurrentAmount] = useState('');

  // Update current amount when totalDueAmount changes
  useEffect(() => {
    if (totalDueAmount > 0) {
      setCurrentAmount(totalDueAmount.toString());
    } else if (totalDueAmount === 0) {
      setCurrentAmount('');
    }
  }, [totalDueAmount]);

  // All payments and remaining due are controlled by parent (Billing)

  const handleAddPayment = () => {
    const amountFloat = parseFloat(currentAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      showWarning("Please enter a valid amount.");
      return;
    }
    if (!selectedPaymentMode) {
      showWarning("Please select a payment mode.");
      return;
    }
    // Optional: Check if amountFloat exceeds remainingAmount if you want to enforce that
    // if (amountFloat > remainingAmount) {
    //   alert("Payment amount cannot exceed the remaining amount.");
    //   return;
    // }

    const newPayment = {
      id: Date.now(),
      date: selectedDate,
      time: selectedTime,
      mode: selectedPaymentMode,
      amount: amountFloat,
    };

    if (typeof onAddPayment === 'function') {
      onAddPayment(newPayment);
    }
    setCurrentAmount(''); // Reset amount input - will be refilled by useEffect
    // Optionally reset date/time or mode
    // setSelectedPaymentMode(paymentOptions[0]);
  };

  const handleDeletePayment = (paymentId) => {
    if (paymentId === 'advance-payment') {
      // Handle advance payment deletion by calling onClearAdvance
      if (typeof onClearAdvance === 'function') {
        onClearAdvance();
      }
    } else {
      // Handle regular payment deletion
      if (typeof onDeletePayment === 'function') {
        onDeletePayment(paymentId);
      }
    }
  };

  // Create combined payments list including advance amount
  const allPayments = [...payments];
  if (advanceAmount && Number(advanceAmount) > 0) {
    allPayments.unshift({
      id: 'advance-payment',
      mode: 'ADVANCE',
      amount: Number(advanceAmount),
      isAdvance: true
    });
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Left Side: Input Area */}
      <div className=" grid grid-cols-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50">
        <div className="space-y-4 border-r border-gray-400 pr-4">
          {/* Date and Time Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                id="payment-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <input
                type="time"
                id="payment-time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Payment Mode Buttons */}
          <div>
            <div className="grid grid-cols-3 gap-2">
              {paymentOptions.map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedPaymentMode(mode)}
                  className={`
                    p-1 border rounded-md text-xs font-medium transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 h-10
                    ${selectedPaymentMode === mode
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md'
                      : 'bg-white text-teal-600 border-teal-400 hover:bg-teal-50 hover:border-teal-500'
                    }
                  `}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input and Add Button */}
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <input
                type="text"
                id="payment-amount"
                value={currentAmount}
                onChange={(e) => {
                    // Allow only numbers and one decimal
                    if (/^\d*\.?\d*$/.test(e.target.value)) {
                        setCurrentAmount(e.target.value);
                    }
                }}
                placeholder={`₹${totalDueAmount.toFixed(2)}`}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddPayment}
              className="p-2.5 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 shadow-md"
              title="Add Payment"
            >
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
        <div className="w-full md:w-3/5 p-2 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">
            Remaining Amt: <span className="text-teal-600">₹{Number(totalDueAmount || 0).toFixed(2)}</span>
          </p>
          <h6 className="text-sm font-semibold text-gray-800">Payments Added</h6>
          
        </div>
        {(!allPayments || allPayments.length === 0) ? (
          <p className="text-sm text-gray-500 text-center py-2">No payments added yet.</p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {allPayments.map(payment => (
              <li key={payment.id} className={`flex items-center justify-between p-1 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow ${payment.isAdvance ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
                <div className="text-xs text-gray-700">
                  <p>
                    <span className="font-medium">{payment.mode}</span>
                    {payment.isAdvance && <span className="text-yellow-600 ml-1">(Advance)</span>}
                    {' - ₹'}{payment.amount.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePayment(payment.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                  title={payment.isAdvance ? "Remove Advance" : "Delete Payment"}
                >
                  <XMarkIcon size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>

      {/* Right Side: Added Payments and Remaining Amount */}
      
    </div>
  );
};

export default SplitPaymentComponent;

