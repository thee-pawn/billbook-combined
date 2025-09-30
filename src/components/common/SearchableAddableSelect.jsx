import React, { useEffect, useRef, useState } from 'react';

/**
 * Reusable searchable single-select with add-new option.
 * Props:
 *  - label?: string
 *  - value: string
 *  - options: string[]
 *  - onChange(value: string): void
 *  - onAdd?(value: string): void (called when a new option is added)
 *  - placeholder?: string
 *  - allowAdd?: boolean (default true)
 *  - disabled?: boolean
 *  - className?: string (wrapper)
 *  - dropdownClassName?: string
 */
export const SearchableAddableSelect = ({
  label,
  value,
  options = [],
  onChange,
  onAdd,
  placeholder = 'Search or type...',
  allowAdd = true,
  disabled = false,
  className = '',
  dropdownClassName = '',
}) => {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  const canAdd = allowAdd && query.trim() && !options.some(o => o.toLowerCase() === query.trim().toLowerCase());

  const handleSelect = (opt) => {
    onChange?.(opt);
    setQuery(opt);
    setOpen(false);
  };

  const handleAdd = () => {
    if (!canAdd) return;
    const newVal = query.trim();
    onAdd?.(newVal);
    onChange?.(newVal);
    setOpen(false);
  };

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1 text-left">{label}</label>}
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          value={query}
            onFocus={() => !disabled && setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
          placeholder={placeholder}
          className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        {open && !disabled && (
          <div className={`absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto ${dropdownClassName}`}>
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 ${opt === value ? 'bg-teal-100 text-teal-700' : 'text-gray-700'}`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No matches</div>
            )}
            {canAdd && (
              <button type="button" onClick={handleAdd} className="w-full px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 border-t border-gray-100">
                + Add "{query.trim()}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableAddableSelect;
