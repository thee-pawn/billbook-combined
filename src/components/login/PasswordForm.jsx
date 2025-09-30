/**
 * Password setup/reset form component
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormInput, Button, ErrorMessage } from '../common';

const PasswordForm = ({ 
  onSubmit, 
  isLoading, 
  errorMessage, 
  onBack, 
  isReset = false 
}) => {
  const [passwordData, setPasswordData] = useState({
    password: '',
    repassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(passwordData);
  };

  const title = isReset ? "Create New Password" : "Set Your Password";

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-teal-600 mb-6 text-center">{title}</h2>
      
      <ErrorMessage message={errorMessage} />
      
      <FormInput
        type="password"
        name="password"
        placeholder="Create Password"
        value={passwordData.password}
        onChange={handleChange}
        required
      />
      
      <FormInput
        type="password"
        name="repassword"
        placeholder="Re-enter Password"
        value={passwordData.repassword}
        onChange={handleChange}
        required
      />
      
      <Button
        type="submit"
        disabled={isLoading}
        isLoading={isLoading}
      >
        {isLoading ? "Saving..." : "Save Password"}
      </Button>
      
      <Button variant="link" onClick={onBack} className="block w-full text-center mt-2">
        &larr; Back
      </Button>
    </form>
  );
};

PasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  isReset: PropTypes.bool
};

export default PasswordForm;
