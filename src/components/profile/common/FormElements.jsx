import React from 'react';

// Form Input Field component
export const FormInputField = ({ label, name, value, onChange, type = 'text', placeholder, icon, readOnly = false }) => (
    <div className="w-full">
        {label && (
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1 text-left">
                {label}
            </label>
        )}
        <div className={`relative flex items-center ${icon ? 'pr-10' : ''}`}>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${readOnly ? 'bg-gray-100' : ''}`}
            />
            {icon && <span className="absolute right-3 text-gray-500">{icon}</span>}
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
        <h3 className="text-xl font-bold text-gray-800 text-left">{title}</h3>
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
