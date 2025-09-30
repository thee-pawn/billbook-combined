/**
 * Common form input component
 */
import React from 'react';
import PropTypes from 'prop-types';

const FormInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  required = false,
  className = '',
  error = null,
  ...props
}) => {
  const baseClasses = "w-full px-3 py-2 mb-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400";
  const errorClasses = error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "";
  const combinedClasses = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div className=" w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        id={name}
        required={required}
        className={combinedClasses}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

FormInput.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.string
};

export default FormInput;
