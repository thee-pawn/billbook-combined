/**
 * Common button component
 */
import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  type = 'button',
  onClick,
  disabled = false,
  isLoading = false,
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseClasses = "w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm font-medium disabled:bg-gray-400";
  
  const variantClasses = {
    primary: "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500",
    secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    link: "bg-transparent text-teal-600 hover:underline p-0 focus:ring-0"
  };
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={combinedClasses}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {typeof children === 'string' ? 'Loading...' : children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'link'])
};

export default Button;
