/**
 * Forgot password form component
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PhoneInput, Button, ErrorMessage } from '../common';

const ForgotPasswordForm = ({ onSubmit, isLoading, errorMessage, onBack }) => {
  const [credentials, setCredentials] = useState({ 
    countryCode: '+91', 
    phone: '' 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryCodeChange = (e) => {
    setCredentials(prev => ({ ...prev, countryCode: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      phone: credentials.countryCode + credentials.phone
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Reset Password</h2>
      <p className="text-center text-sm text-gray-600 mb-4">Enter your phone number to receive a reset code.</p>
      
      <ErrorMessage message={errorMessage} />
      
      <PhoneInput
        value={credentials.phone}
        onChange={handleChange}
        countryCode={credentials.countryCode}
        onCountryCodeChange={handleCountryCodeChange}
        required
      />
      
      <Button
        type="submit"
        disabled={isLoading}
        isLoading={isLoading}
      >
        {isLoading ? "Sending..." : "Send Reset Code"}
      </Button>
      
      <Button variant="link" onClick={onBack} className="block w-full text-center mt-2">
        &larr; Back
      </Button>
    </form>
  );
};

ForgotPasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onBack: PropTypes.func.isRequired
};

export default ForgotPasswordForm;
