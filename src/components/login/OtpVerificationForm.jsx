/**
 * OTP verification form component
 */
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, ErrorMessage } from '../common';
import { Clock } from 'lucide-react';

const OtpVerificationForm = ({ 
  onSubmit, 
  isLoading, 
  errorMessage, 
  otpMessage, 
  onBack,
  onResendOtp
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Initialize refs and start timer
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setCanResend(true);
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    if (canResend) {
      onResendOtp();
      startTimer(); // Restart the timer after resending
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Handle Enter key
    else if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.replace(/\D/g, '').split('').slice(0, 6);

    if (pasteArray.length > 0) {
      const newOtp = [...otp];
      pasteArray.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);

      // Focus the next empty input or the last filled input
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      onSubmit(otpString);
    }
  };

  const handleFocus = (index) => {
    // Select the content when focused
    inputRefs.current[index]?.select();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Verify OTP</h2>
      <p className="text-center text-sm text-gray-600 mb-6">{otpMessage}</p>

      <ErrorMessage message={errorMessage} />
      
      {/* OTP Input Boxes */}
      <div className="mb-6">
        <div className="flex justify-center space-x-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-colors"
              autoComplete="off"
            />
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Enter the 6-digit OTP sent to your phone
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || otp.join('').length !== 6}
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </Button>
      
      <div className="text-center text-sm mt-4">
        <span className="text-gray-600">Didn't receive OTP? </span>
        <Button
          variant="link"
          onClick={handleResendOtp}
          disabled={!canResend}
          className={`font-semibold ml-1 ${!canResend ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Resend OTP
        </Button>
        {!canResend && (
          <span className="text-teal-600 font-medium ml-2 flex items-center justify-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(timer)}
          </span>
        )}
      </div>

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
