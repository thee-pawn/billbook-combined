/**
 * Common phone input with country code selector
 */
import React from 'react';
import PropTypes from 'prop-types';
import config from '../../config';

// A list of sample countries. This can be expanded.
const countries = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'USA', code: '+1', flag: '🇺🇸' },
  { name: 'UK', code: '+44', flag: '🇬🇧' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
];

const PhoneInput = ({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  name = 'phone',
  placeholder = 'Phone',
  required = false,
  className = '',
  error = null,
  ...props
}) => {
  const baseClasses = "px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400";
  const errorClasses = error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "";
  const combinedClasses = `${baseClasses} ${errorClasses} ${className}`;

  // Create a simplified onChange handler that works with the SelectField component pattern
  const handleCountryCodeChange = (e) => {
    onCountryCodeChange(e);
  };

  return (
    <div className="w-full mb-4">
      <div className="flex items-center">
        <select
          name="countryCode"
          value={countryCode}
          onChange={handleCountryCodeChange}
          className={`${baseClasses} pr-6 flex-shrink-0`}
        >
          {countries.map(country => (
            <option key={`${country.code}-${country.name}`} value={country.code}>
              {country.flag} {country.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          name={name}
          placeholder={placeholder}
          id={name}
          value={value}
          onChange={onChange}
          className={`${combinedClasses} flex-1`}
          required={required}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

PhoneInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  countryCode: PropTypes.string,
  onCountryCodeChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.string
};

PhoneInput.defaultProps = {
  countryCode: config.defaultCountryCode
};

export default PhoneInput;
