/**
 * Sign up form component
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormInput, PhoneInput, Button, ErrorMessage } from '../common';

const SignupForm = ({ onSubmit, isLoading, errorMessage, onBack }) => {
  const [signupData, setSignupData] = useState({
    name: '', 
    countryCode: '+91', 
    phone: '', 
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryCodeChange = (e) => {
    setSignupData(prev => ({ ...prev, countryCode: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: signupData.name,
      phoneNumber: signupData.countryCode + signupData.phone,
      email: signupData.email || null
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-teal-600 mb-6 text-center">Create Account</h2>
      
      <ErrorMessage message={errorMessage} />
      
      <FormInput
        type="text"
        name="name"
        placeholder="Name *"
        value={signupData.name}
        onChange={handleChange}
        required
      />
      
      <PhoneInput
        value={signupData.phone}
        onChange={handleChange}
        countryCode={signupData.countryCode}
        onCountryCodeChange={handleCountryCodeChange}
        required
      />
      
      <FormInput
        type="email"
        name="email"
        placeholder="Email"
        value={signupData.email}
        onChange={handleChange}
      />
      
      <Button
        type="submit"
        disabled={isLoading}
        isLoading={isLoading}
      >
        {isLoading ? "Creating..." : "Next"}
      </Button>
      
      <Button variant="link" onClick={onBack} className="block w-full text-center mt-2">
        &larr; Back
      </Button>
    </form>
  );
};

SignupForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onBack: PropTypes.func.isRequired
};

export default SignupForm;
