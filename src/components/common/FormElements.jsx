import React from 'react';

export const InputField = ({ 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    type = 'text', 
    required = false, 
    isReadOnly = false, 
    className = '',
    ...props 
}) => (
    <div className={className}>
        {label && (
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 text-left">
                {label} {required && !isReadOnly && <span className="text-red-500">*</span>}
            </label>
        )}
        <input 
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required && !isReadOnly}
            disabled={isReadOnly}
            className={`w-full px-3 py-2 rounded-md text-sm ${
                isReadOnly 
                    ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
            } border shadow-sm`}
            {...props}
        />
    </div>
);

export const SelectField = ({ 
    label, 
    name, 
    value, 
    onChange, 
    options, 
    required = false, 
    isReadOnly = false,
    placeholder,
    className = '' 
}) => (
    <div className={className}>
        {label && (
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 text-left">
                {label} {required && !isReadOnly && <span className="text-red-500">*</span>}
            </label>
        )}
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange} 
            required={required && !isReadOnly}
            disabled={isReadOnly}
            className={`w-full px-4 py-2 pr-8 rounded-md text-sm ${
                isReadOnly 
                    ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
            } border shadow-sm`}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

export const TextAreaField = ({ 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    required = false,
    isReadOnly = false,
    className = '',
    rows = 4
}) => (
    <div className={className}>
        {label && (
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 text-left">
                {label} {required && !isReadOnly && <span className="text-red-500">*</span>}
            </label>
        )}
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required && !isReadOnly}
            disabled={isReadOnly}
            rows={rows}
            className={`w-full px-3 py-2 rounded-md text-sm ${
                isReadOnly 
                    ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
            } border shadow-sm`}
        />
    </div>
);

export const Button = ({ 
    children, 
    onClick, 
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    ...props 
}) => {
    const baseStyles = 'rounded-md font-medium shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150';
    
    const variants = {
        primary: 'bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-500',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
        danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
        success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
    };

    const sizes = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const FormSection = ({ title, children, className = '' }) => (
    <div className={`space-y-4 ${className}`}>
        {title && (
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                {title}
            </h3>
        )}
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

// Toggle Switch component
export const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
            type="button"
            className={`${checked ? 'bg-teal-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
            onClick={onChange}
        >
            <span
                className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
        </button>
    </div>
);

// Panel Header component
export const PanelHeader = ({ title, subtitle }) => (
    <div className="mb-6">
        <h2 className="text-xl font-semibold text-teal-600 text-left">{title}</h2>
        {subtitle && <p className="text-gray-500 text-left mt-1">{subtitle}</p>}
    </div>
);

// Section Header component
export const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-4">
        <h4 className="text-md font-bold text-gray-800 text-left">{title}</h4>
        {subtitle && <p className="text-gray-500 mb-4 text-left">{subtitle}</p>}
    </div>
);

// Placeholder Panel for incomplete sections
export const PlaceholderPanel = ({ title }) => (
    <div className="mt-6 p-10 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        <p className="text-gray-500 mt-2">This panel is a placeholder. The design for this section can be added later.</p>
    </div>
);

// Input field with icon component
export const IconInputField = ({ 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    type = 'text', 
    required = false, 
    isReadOnly = false, 
    className = '',
    icon,
    ...props 
}) => (
    <div className={className}>
        {label && (
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 text-left">
                {label} {required && !isReadOnly && <span className="text-red-500">*</span>}
            </label>
        )}
        <div className="relative rounded-md shadow-sm">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    {icon}
                </div>
            )}
            <input 
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required && !isReadOnly}
                disabled={isReadOnly}
                className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 rounded-md text-sm ${
                    isReadOnly 
                        ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                        : 'border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
                } border shadow-sm`}
                {...props}
            />
        </div>
    </div>
);

// For backward compatibility with components using FormInputField
export const FormInputField = InputField;
