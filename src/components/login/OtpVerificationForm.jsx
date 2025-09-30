/**
 * OTP verification form component
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormInput, Button, ErrorMessage } from '../common';

const OtpVerificationForm = ({ 
  onSubmit, 
  isLoading, 
  errorMessage, 
  otpMessage, 
  onBack,
  onResendOtp
}) => {
  const [otp, setOtp] = useState('');

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(otp);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Verify OTP</h2>
      <p className="text-center text-sm text-gray-600 mb-4">{otpMessage}</p>
      
      <ErrorMessage message={errorMessage} />
      
      <FormInput
        type="text"
        name="otp"
        placeholder="Enter OTP"
        value={otp}
        onChange={handleChange}
        required
      />
      
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        isLoading={isLoading}
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </Button>
      
      <p className="text-center text-sm mt-4">
        Didn't receive OTP? 
        <Button variant="link" onClick={onResendOtp} className="font-semibold ml-1">
          Resend OTP
        </Button>
      </p>
      
      <Button variant="link" onClick={onBack} className="block w-full text-center mt-2">
        &larr; Back
      </Button>
    </div>
  );
};

OtpVerificationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  otpMessage: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onResendOtp: PropTypes.func.isRequired
};

export default OtpVerificationForm;
