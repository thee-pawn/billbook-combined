import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleCategorySelect = (category) => {
    setSearchTerm(category);
    onChange(category);
    setIsOpen(false);
  };

  const handleAddNewCategory = () => {
    if (searchTerm.trim() && onAddCategory) {
      onAddCategory(searchTerm.trim());
      setIsOpen(false);
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCategories.length === 1) {
        handleCategorySelect(filteredCategories[0]);
      } else if (filteredCategories.length === 0 && searchTerm.trim() && onAddCategory) {
        handleAddNewCategory();
      }
    } else if (e.key === 'ArrowDown' && filteredCategories.length > 0) {
      e.preventDefault();
      // Focus first option (you could add keyboard navigation here)
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
        Category
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } ${className}`}
        />

        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`absolute inset-y-0 right-0 px-3 flex items-center ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCategories.length > 0 ? (
            <>
              {filteredCategories.map((category, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="w-full text-left px-3 py-2 hover:bg-teal-50 focus:bg-teal-50 focus:outline-none text-sm"
                >
                  {category}
                </button>
              ))}
            </>
          ) : (
            searchTerm.trim() && onAddCategory && (
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="w-full text-left px-3 py-2 hover:bg-teal-50 focus:bg-teal-50 focus:outline-none text-sm flex items-center text-teal-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add "{searchTerm.trim()}"
              </button>
            )
          )}

          {filteredCategories.length === 0 && !searchTerm.trim() && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No categories available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
