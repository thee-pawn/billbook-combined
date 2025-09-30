export const InputField = ({ label, placeholder, type = 'text', icon, value, onChange, name, required = false }) => {
  const isInlineLayout = !['Contact No.', 'Name'].includes(label);
  if (isInlineLayout) {
    return (
      <div className="mb-4 flex items-center">
        <label htmlFor={name} className="w-1/3 text-sm font-medium text-gray-700 mr-3 shrink-0 text-left">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative w-2/3">
          <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder || label}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
          />
          {icon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 text-left">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder || label}
          required={required}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export const SelectField = ({ label, options, icon, value, onChange, name, required = false }) => {
  const isInlineLayout = !['Contact No.', 'Name'].includes(label);
  if (isInlineLayout) {
    return (
      <div className="mb-4 flex items-center">
        <label htmlFor={name} className="w-1/3 text-sm font-medium text-gray-700 mr-3 shrink-0 text-left">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative w-2/3">
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm appearance-none focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out pr-10"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {icon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 text-left">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm appearance-none focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out pr-10"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {icon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};