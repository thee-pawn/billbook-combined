import { useEffect, useRef, useState } from "react";

export const MultiSelectDropdown = ({ options, selectedOptions, onChange, placeholder = "Select Services", heading="Select Services" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleOptionToggle = (option) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(o => o !== option)
      : [...selectedOptions, option];
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    onChange(selectedOptions.length === options.length ? [] : options);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              {heading}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="min-w-[200px] px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-left flex justify-between items-center"
        >
          <span className="text-gray-700">{selectedOptions.length > 0 ? `${selectedOptions.length} selected` : placeholder}</span>
          <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
        {selectedOptions.length > 0 && (
          <div className="flex-1 flex flex-wrap gap-2">
            {selectedOptions.map(option => (
              <span key={option} className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {option}
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionToggle(option);
                  }} 
                  className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-10 w-[200px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul className="max-h-60 overflow-y-auto">
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center border-b" onClick={handleSelectAll}>
              <input type="checkbox" checked={options.length > 0 && selectedOptions.length === options.length} readOnly className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"/>
              Select All
            </li>
            {options.map(option => (
              <li key={option} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleOptionToggle(option)}>
                <input type="checkbox" checked={selectedOptions.includes(option)} readOnly className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"/>
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};