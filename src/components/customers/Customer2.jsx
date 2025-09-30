import React, { useState } from 'react';
import { ChevronDown, CalendarDays, Hand, Eye } from 'lucide-react';
import { InputField, SelectField } from '@components/common/Inputs';

const CustomerFormDetails = ({ customerDetails, handleCustomerDataChange, openClientHistory, openNotesModal, openDuesHistory }) => {

  const handleChange = (e) => {
    handleCustomerDataChange(e);
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (

    <div className="bg-white p-2 rounded-xl shadow-2xl w-full flex-grow flex flex-col overflow-hidden">
      <form className="overflow-y-auto flex-grow">
        <InputField
          label="Contact No."
          name="contactNo"
          type="tel"
          value={customerDetails.contactNo ?? customerDetails.number ?? ''}
          onChange={handleChange}
        />
        <InputField
          label="Name"
          name="name"
          value={customerDetails.name}
          onChange={handleChange}
        />
        <SelectField
          label="Gender"
          name="gender"
          value={customerDetails.gender}
          onChange={handleChange}
          options={genderOptions}
          icon={<ChevronDown size={20} className="text-gray-400" />}
        />
        <InputField
          label="Birthday (DD/MM)"
          name="birthday"
          type="text"
          placeholder="DD/MM"
          value={customerDetails.birthday}
          onChange={handleChange}
        />
        <InputField
          label="Anniversary (DD/MM)"
          name="anniversary"
          type="text"
          placeholder="DD/MM"
          value={customerDetails.anniversary}
          onChange={handleChange}
        />
        <div className="mb-4 flex items-center">
          <label htmlFor="paymentDues" className="w-1/3 text-sm font-medium text-gray-700 mr-3 shrink-0 text-left">
            Payment Dues
          </label>
          <div className="flex items-center shadow-sm appearance-none border rounded w-full leading-tight focus-within:shadow-lg focus-within:ring-1 focus-within:ring-teal-500">
            <input
              id="paymentDues"
              name="paymentDues"
              value={customerDetails.paymentDues}
              onChange={handleChange}
              className="appearance-none bg-transparent border-none w-full py-2 px-3 text-gray-700 flex-grow focus:outline-none"
            />
            <button
              type="button"
              onClick={openDuesHistory}
              className="p-2 text-gray-500 hover:text-teal-600 focus:outline-none"
              aria-label="View client history for payment dues"
            >
              <Eye size={20} />
            </button>
          </div>
        </div>
        <InputField
          label="Advance Amount"
          name="advanceAmount"
          type="number"
          value={customerDetails.advanceAmount !== undefined && customerDetails.advanceAmount !== null ? String(customerDetails.advanceAmount) : ''}
          onChange={handleChange}
        />

        <InputField
          label="Wallet Balance"
          name="walletBalance"
          value={customerDetails.walletBalance}
          onChange={handleChange}
        />
        <InputField
          label="Loyalty Points"
          name="loyaltyPoints"
          value={customerDetails.loyaltyPoints}
          onChange={handleChange}
        />
        <InputField
          label="Referral Points"
          name="referralPoints"
          value={customerDetails.referralPoints}
          onChange={handleChange}
        />
        <InputField
          label="Memberships"
          name="membership"
          value={customerDetails.membership}
          onChange={handleChange}
        />
        <InputField
          label="Packages"
          name="packages"
          value={customerDetails.packages}
          onChange={handleChange}
        />
        <InputField
          label="Last Visit"
          name="lastVisit"
          value={customerDetails.lastVisit}
          onChange={handleChange}
        />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 gap-4">
          {openClientHistory!=null && <button
            type="button"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-1 px-1 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            onClick={openClientHistory}
          >
            Client History
          </button>}
          {openNotesModal && <button
            type="button"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-1 px-1 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            onClick={openNotesModal}
          >
            Notes
          </button>}
        </div>
      </form>
    </div>
  );
};

// Main component to be exported, CustomerForm.
export default function CustomerForm2({ customerDetails, handleCustomerDataChange, openClientHistory, openDuesHistory, openNotesModal }) {
  return (
    <div className="bg-gray-100 min-h-full flex flex-col mr-2 font-sans">
              <CustomerFormDetails customerDetails={customerDetails} handleCustomerDataChange={handleCustomerDataChange} openClientHistory={openClientHistory} openNotesModal={openNotesModal} openDuesHistory={openDuesHistory} />
    </div>
  );
}
