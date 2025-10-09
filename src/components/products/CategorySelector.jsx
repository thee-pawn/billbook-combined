import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';

const CategorySelector = ({
  value,
  onChange,
  categories = [],
  onAddCategory,
  disabled = false,
  placeholder = "Select or type a category...",
  className = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Update filtered categories when categories or inputValue changes
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categories, inputValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectCategory = (category) => {
    setInputValue(category);
    onChange(category);
    setIsOpen(false);
  };

  const handleAddNewCategory = async () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !categories.includes(trimmedValue)) {
      if (onAddCategory) {
        await onAddCategory(trimmedValue);
      }
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue) {
        // If the exact category exists, select it
        const exactMatch = categories.find(cat =>
          cat.toLowerCase() === trimmedValue.toLowerCase()
        );
        if (exactMatch) {
          handleSelectCategory(exactMatch);
        } else {
          // Add new category
          handleAddNewCategory();
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showAddOption = inputValue.trim() &&
    !categories.some(cat => cat.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Category {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown
            size={20}
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCategories.length > 0 && (
            <div className="py-1">
              {filteredCategories.map((category, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between"
                >
                  <span>{category}</span>
                  {category === value && <Check size={16} className="text-blue-500" />}
                </button>
              ))}
            </div>
          )}

          {showAddOption && onAddCategory && (
            <>
              {filteredCategories.length > 0 && <hr className="border-gray-200" />}
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center text-blue-600"
              >
                <Plus size={16} className="mr-2" />
                Add "{inputValue.trim()}"
              </button>
            </>
          )}

          {filteredCategories.length === 0 && !showAddOption && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No categories found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
