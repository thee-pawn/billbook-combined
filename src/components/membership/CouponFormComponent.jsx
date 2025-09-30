import React, { useState, useEffect } from 'react';
import { useStore } from '../login/StoreContext';
import { apiRequest, authHeader } from '../../apis/apiUtils';
import { productsApi, servicesApi, membershipsApi } from '../../apis/APIs';

// Helper component for form input fields
const InputField = ({ label, id, type = 'text', placeholder, value, onChange, required = true, className = '', startAdornment }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 text-left">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {startAdornment && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">{startAdornment}</span>
        </div>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${startAdornment ? 'pl-7' : 'px-4'}`}
      />
    </div>
  </div>
);

// Helper component for select dropdowns
const SelectField = ({ label, id, value, onChange, required = true, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 text-left">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="h-[42px] w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
            {children}
        </select>
    </div>
);

// Helper component for Radio Groups
const RadioGroup = ({ name, options, selectedValue, onChange, label }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
        <div className="flex items-center space-x-6">
            {options.map(option => (
                <div key={option.value} className="flex items-center">
                    <input
                        id={`${name}-${option.value}`}
                        name={name}
                        type="radio"
                        value={option.value}
                        checked={selectedValue === option.value}
                        onChange={onChange}
                        className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-900">
                        {option.label}
                    </label>
                </div>
            ))}
        </div>
    </div>
);

// Helper component for Simple Multi-Select Dropdown (no hierarchy)
const SimpleMultiSelectDropdown = ({ label, labelExtra, items, selectedItems, onSelectionChange, placeholder, idPrefix }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    
    // Filter items based on search text
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    
    const handleItemToggle = (itemId) => {
        if (selectedItems.includes(itemId)) {
            onSelectionChange(selectedItems.filter(id => id !== itemId));
        } else {
            onSelectionChange([...selectedItems, itemId]);
        }
    };
    
    const handleSelectAll = () => {
        const allVisibleIds = filteredItems.map(item => item.id);
        
        if (allVisibleIds.every(id => selectedItems.includes(id))) {
            // Deselect all visible items
            onSelectionChange(selectedItems.filter(id => !allVisibleIds.includes(id)));
        } else {
            // Select all visible items
            const newSelected = [...new Set([...selectedItems, ...allVisibleIds])];
            onSelectionChange(newSelected);
        }
    };
    
    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 text-left">{label}</label>
                {labelExtra && <div className="ml-2">{labelExtra}</div>}
            </div>
            
            {/* Dropdown Input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            
            {/* Simple Dropdown Options */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Select All Option */}
                    {filteredItems.length > 0 && (
                        <div className="p-2 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="w-full text-left px-2 py-1 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded"
                            >
                                Select All Visible Items
                            </button>
                        </div>
                    )}
                    
                    {/* Options List */}
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div
                                key={item.id}
                                className={`flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                                    selectedItems.includes(item.id) ? 'bg-teal-50' : ''
                                }`}
                                onClick={() => handleItemToggle(item.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => {}} // Handled by div click
                                    className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-2"
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500">
                                        ₹{item.price}
                                        {item.validity && ` • Valid for ${item.validity}`}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            No items found matching "{searchText}"
                        </div>
                    )}
                </div>
            )}
            
            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

// Helper component for Hierarchical Multi-Select Dropdown with Search functionality
const HierarchicalMultiSelectDropdown = ({ label, labelExtra, items, selectedItems, onSelectionChange, placeholder, idPrefix }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    
    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});
    
    // Filter items and categories based on search text
    const getFilteredData = () => {
        if (!searchText) return groupedItems;
        
        const filtered = {};
        Object.keys(groupedItems).forEach(category => {
            const categoryItems = groupedItems[category].filter(item =>
                item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                category.toLowerCase().includes(searchText.toLowerCase())
            );
            
            if (categoryItems.length > 0 || category.toLowerCase().includes(searchText.toLowerCase())) {
                filtered[category] = categoryItems;
            }
        });
        
        return filtered;
    };
    
    const filteredData = getFilteredData();
    
    // Get selected item objects
    const selectedItemObjects = items.filter(item => selectedItems.includes(item.id));
    
    const handleItemToggle = (itemId) => {
        if (selectedItems.includes(itemId)) {
            onSelectionChange(selectedItems.filter(id => id !== itemId));
        } else {
            onSelectionChange([...selectedItems, itemId]);
        }
    };
    
    const handleRemoveSelected = (itemId) => {
        onSelectionChange(selectedItems.filter(id => id !== itemId));
    };
    
    const handleCategoryToggle = (category) => {
        const categoryItems = groupedItems[category] || [];
        const categoryItemIds = categoryItems.map(item => item.id);
        const allCategorySelected = categoryItemIds.every(id => selectedItems.includes(id));
        
        if (allCategorySelected) {
            // Deselect all items in this category
            onSelectionChange(selectedItems.filter(id => !categoryItemIds.includes(id)));
        } else {
            // Select all items in this category
            const newSelected = [...new Set([...selectedItems, ...categoryItemIds])];
            onSelectionChange(newSelected);
        }
    };
    
    const toggleCategoryExpansion = (category) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };
    
    const getCategorySelectionState = (category) => {
        const categoryItems = groupedItems[category] || [];
        const categoryItemIds = categoryItems.map(item => item.id);
        const selectedCount = categoryItemIds.filter(id => selectedItems.includes(id)).length;
        
        if (selectedCount === 0) return 'none';
        if (selectedCount === categoryItemIds.length) return 'all';
        return 'partial';
    };
    
    const handleSelectAll = () => {
        const allVisibleItems = Object.values(filteredData).flat();
        const allVisibleIds = allVisibleItems.map(item => item.id);
        
        if (allVisibleIds.every(id => selectedItems.includes(id))) {
            // Deselect all visible items
            onSelectionChange(selectedItems.filter(id => !allVisibleIds.includes(id)));
        } else {
            // Select all visible items
            const newSelected = [...new Set([...selectedItems, ...allVisibleIds])];
            onSelectionChange(newSelected);
        }
    };
    
    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 text-left">{label}</label>
                {labelExtra && <div className="ml-2">{labelExtra}</div>}
            </div>
            
            {/* Dropdown Input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            
            {/* Hierarchical Dropdown Options */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {/* Select All Option */}
                    {Object.keys(filteredData).length > 0 && (
                        <div className="p-2 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="w-full text-left px-2 py-1 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded"
                            >
                                Select All Visible Items
                            </button>
                        </div>
                    )}
                    
                    {/* Categories and Items */}
                    {Object.keys(filteredData).length > 0 ? (
                        Object.keys(filteredData).map(category => {
                            const categoryItems = filteredData[category];
                            const selectionState = getCategorySelectionState(category);
                            const isExpanded = expandedCategories.has(category);
                            
                            return (
                                <div key={category} className="border-b border-gray-100 last:border-b-0">
                                    {/* Category Header */}
                                    <div className="flex items-center p-3 bg-gray-50 hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={selectionState === 'all'}
                                            ref={input => {
                                                if (input) input.indeterminate = selectionState === 'partial';
                                            }}
                                            onChange={() => handleCategoryToggle(category)}
                                            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleCategoryExpansion(category)}
                                            className="flex items-center flex-1 text-left"
                                        >
                                            <svg 
                                                className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            <span className="font-medium text-gray-900">{category}</span>
                                            <span className="ml-2 text-sm text-gray-500">({categoryItems.length})</span>
                                        </button>
                                    </div>
                                    
                                    {/* Category Items */}
                                    {isExpanded && (
                                        <div className="bg-white">
                                            {categoryItems.map(item => (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-center px-6 py-2 hover:bg-gray-50 cursor-pointer ${
                                                        selectedItems.includes(item.id) ? 'bg-teal-50' : ''
                                                    }`}
                                                    onClick={() => handleItemToggle(item.id)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item.id)}
                                                        onChange={() => {}} // Handled by div click
                                                        className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            ₹{item.price}
                                                            {item.duration && ` • ${item.duration} min`}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            No items found matching "{searchText}"
                        </div>
                    )}
                </div>
            )}
            
            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default function CouponFormComponent({ initialData = null, onSave, onCancel }) {
  const { currentStore } = useStore();
  
  // Debug logging removed
  
  // State for loading data
  const [availableServices, setAvailableServices] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableMemberships, setAvailableMemberships] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  
  // State for basic form fields
  const [couponCode, setCouponCode] = useState(initialData?.couponCode || initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [validity, setValidity] = useState(initialData?.validity || { years: '', months: '', days: '' });
  const [validFrom, setValidFrom] = useState(() => {
    if (initialData?.validFrom) {
      try {
        // Handle different date formats
        let dateStr = initialData.validFrom;
        if (typeof dateStr === 'string') {
          // If it's already in YYYY-MM-DD format, use it directly
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr;
          }
          // Handle DD/MM/YYYY format
          if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          // Convert from other formats
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        // ignore parse error
      }
    }
    return '';
  });
  const [validTo, setValidTo] = useState(() => {
    if (initialData?.validTo) {
      try {
        // Handle different date formats
        let dateStr = initialData.validTo;
        if (typeof dateStr === 'string') {
          // If it's already in YYYY-MM-DD format, use it directly
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr;
          }
          // Handle DD/MM/YYYY format
          if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          // Convert from other formats
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        // ignore parse error
      }
    }
    return '';
  });
  
  // State for discount details
  const [discountType, setDiscountType] = useState(() => {
    if (initialData?.discountType === 'percentage') return 'Percentage';
    if (initialData?.discountType === 'fixed') return 'Value';
    return 'Percentage';
  });
  const [discountValue, setDiscountValue] = useState(() => {
    return initialData?.discountValue || '';
  });
  
  // State for coupon limits and conditions
  const [minPurchase, setMinPurchase] = useState(initialData?.minPurchase || '');
  const [maxDiscount, setMaxDiscount] = useState(initialData?.maxDiscount || '');
  const [usageLimit, setUsageLimit] = useState(initialData?.usageLimit || '1');
  const [usageType, setUsageType] = useState('per_customer');

  // Custom API functions to match the exact endpoints
  const fetchServices = async (storeId) => {
    try {
      const response = await servicesApi.getAll(storeId);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchProducts = async (storeId) => {
    try {
      const response = await productsApi.getProducts(storeId);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchMemberships = async (storeId) => {
    try {
      const response = await membershipsApi.getAll(storeId);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Load services and products data
  useEffect(() => {
    const loadServicesAndProducts = async () => {
      if (!currentStore?.id) {
        return;
      }

  
      
      // Load services
  setServicesLoading(true);
      try {
        const servicesResponse = await fetchServices(currentStore.id);
        
        if (servicesResponse?.data?.services) {
          // Transform API response to match expected format (same as Services component)
          const transformedServices = servicesResponse.data.services.map(service => ({
            id: service.id,
            name: service.name,
            price: parseFloat(service.price),
            duration: service.duration,
            category: service.category,
            description: service.description,
            gender: service.gender,
            status: service.status,
            // Additional fields from the working Services component
            reminder: service.reminder,
            taxPercnt: parseFloat(service.tax_prcnt || 0)
          }));
          setAvailableServices(transformedServices);
  } else {
  }
      } catch (error) {
        setAvailableServices([]);
      } finally {
        setServicesLoading(false);
      }

      // Load products
      setProductsLoading(true);
      try {
        const productsResponse = await fetchProducts(currentStore.id);
        
        if (productsResponse?.data?.products) {
          // Transform API response to match expected format (same as Products component)
          const transformedProducts = productsResponse.data.products.map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.selling_price || product.price || 0),
            category: product.category,
            company: product.company,
            description: product.description,
            // Additional fields from the working Products component
            costPrice: parseFloat(product.cost_price || 0),
            productType: product.usage,
            quantity: product.qty,
            volume: product.prod_qty,
            volumeUnit: product.prod_qty_unit
          }));
          setAvailableProducts(transformedProducts);
  } else {
  }
      } catch (error) {
        setAvailableProducts([]);
      } finally {
        setProductsLoading(false);
      }
      
      // Load memberships
      setMembershipsLoading(true);
      try {
        const membershipsResponse = await fetchMemberships(currentStore.id);
        
        if (membershipsResponse?.data?.memberships) {
          // Transform API response to match expected format
          const transformedMemberships = membershipsResponse.data.memberships.map(membership => ({
            id: membership.id,
            name: membership.name,
            price: parseFloat(membership.price || 0),
            validity: membership.validity,
            description: membership.description,
            status: membership.status,
            // Additional fields that might be useful
            walletBalance: membership.wallet_balance,
            overallDiscount: membership.overall_discount
          }));
          setAvailableMemberships(transformedMemberships);
  } else {
  }
      } catch (error) {
        setAvailableMemberships([]);
      } finally {
        setMembershipsLoading(false);
      }
    };

    loadServicesAndProducts();
  }, [currentStore?.id]);
  useEffect(() => {
    if (initialData) {
      setValidity(initialData?.validity || { years: '', months: '', days: '' });
      
      // Handle dates
      if (initialData?.validFrom) {
        try {
          let dateStr = initialData.validFrom;
          if (typeof dateStr === 'string') {
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // Already in YYYY-MM-DD format
              setValidFrom(dateStr);
            } else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
              // DD/MM/YYYY format - split and rearrange
              const [day, month, year] = dateStr.split('/');
              const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              setValidFrom(formattedDate);
            } else {
              // Try generic date parsing as fallback
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                setValidFrom(date.toISOString().split('T')[0]);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing validFrom in useEffect:', e);
        }
      }
      
      if (initialData?.validTo) {
        try {
          let dateStr = initialData.validTo;
          if (typeof dateStr === 'string') {
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // Already in YYYY-MM-DD format
              setValidTo(dateStr);
            } else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
              // DD/MM/YYYY format - split and rearrange
              const [day, month, year] = dateStr.split('/');
              const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              setValidTo(formattedDate);
            } else {
              // Try generic date parsing as fallback
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                setValidTo(date.toISOString().split('T')[0]);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing validTo in useEffect:', e);
        }
      }
      
      // Handle discount
      if (initialData?.discountType === 'percentage') {
        setDiscountType('Percentage');
      } else if (initialData?.discountType === 'fixed') {
        setDiscountType('Value');
      }
      
      setDiscountValue(initialData?.discountValue || '');
      setMinPurchase(initialData?.minPurchase || '');
      setMaxDiscount(initialData?.maxDiscount || '');
      setUsageLimit(initialData?.usageLimit || '1');
      
      // Handle services/products/memberships selections
      const rawServices = initialData?._raw?.includedServices;
      
      if (rawServices) {
        if (rawServices.allIncluded) {
          // If all included, select all available services
          const allServiceIds = availableServices.map(service => service.id);
          setSelectedServices(allServiceIds);
        } else {
          const serviceSelections = rawServices.inclusions || [];
          setSelectedServices(serviceSelections);
        }
      } else {
        const fallbackServices = initialData?.applicableServices || [];
        setSelectedServices(fallbackServices);
      }
      
      const rawProducts = initialData?._raw?.includedProducts;
      
      if (rawProducts) {
        if (rawProducts.allIncluded) {
          // If all included, select all available products
          const allProductIds = availableProducts.map(product => product.id);
          setSelectedProducts(allProductIds);
        } else {
          const productSelections = rawProducts.inclusions || [];
          setSelectedProducts(productSelections);
        }
      } else {
        const fallbackProducts = initialData?.applicableProducts || [];
        setSelectedProducts(fallbackProducts);
      }
      const rawMemberships = initialData?._raw?.includedMemberships;
      
      if (rawMemberships) {
        if (rawMemberships.allIncluded) {
          // If all included, select all available memberships
          const allMembershipIds = availableMemberships.map(membership => membership.id);
          setSelectedMemberships(allMembershipIds);
        } else {
          const membershipSelections = rawMemberships.inclusions || [];
          setSelectedMemberships(membershipSelections);
        }
      } else {
        const fallbackMemberships = initialData?.applicableMemberships || [];
        setSelectedMemberships(fallbackMemberships);
      }
      
      
    } else {
      // No initial data provided (new coupon)
    }
  }, [initialData, availableServices, availableProducts, availableMemberships]); // Include available data in dependencies
  
  // Additional effect to handle the case when available data loads after initialData
  useEffect(() => {
    if (!initialData) return;
    
    
    // Re-sync services selections if we have raw data but available services just loaded
    const rawServices = initialData._raw?.includedServices;
    if (rawServices?.allIncluded && availableServices.length > 0) {
      const allServiceIds = availableServices.map(service => service.id);
      if (selectedServices.length !== allServiceIds.length) {
        setSelectedServices(allServiceIds);
        setIsAllServicesSelected(true);
      }
    }
    
    // Re-sync products selections  
    const rawProducts = initialData._raw?.includedProducts;
    if (rawProducts?.allIncluded && availableProducts.length > 0) {
      const allProductIds = availableProducts.map(product => product.id);
      if (selectedProducts.length !== allProductIds.length) {
        setSelectedProducts(allProductIds);
        setIsAllProductsSelected(true);
      }
    }
    
    // Re-sync memberships selections
    const rawMemberships = initialData._raw?.includedMemberships;
    if (rawMemberships?.allIncluded && availableMemberships.length > 0) {
      const allMembershipIds = availableMemberships.map(membership => membership.id);
      if (selectedMemberships.length !== allMembershipIds.length) {
        setSelectedMemberships(allMembershipIds);
        setIsAllMembershipsSelected(true);
      }
    }
  }, [availableServices, availableProducts, availableMemberships]); // Only trigger when available data changes
  
  // State for applicable services and products
  const [selectedServices, setSelectedServices] = useState(() => {
    const raw = initialData?._raw?.includedServices;
    if (raw) {
      if (raw.allIncluded) {
        // If all included, select all available services
        const result = availableServices.map(service => service.id);
        return result;
      } else {
        const result = raw.inclusions || [];
        return result;
      }
    }
    const fallback = initialData?.applicableServices || [];
    return fallback;
  });
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const raw = initialData?._raw?.includedProducts;
    if (raw) {
      if (raw.allIncluded) {
        // If all included, select all available products
        const result = availableProducts.map(product => product.id);
        return result;
      } else {
        const result = raw.inclusions || [];
        return result;
      }
    }
    const fallback = initialData?.applicableProducts || [];
    return fallback;
  });
  const [selectedMemberships, setSelectedMemberships] = useState(() => {
    const raw = initialData?._raw?.includedMemberships;
    if (raw) {
      if (raw.allIncluded) {
        // If all included, select all available memberships
        const result = availableMemberships.map(membership => membership.id);
        return result;
      } else {
        const result = raw.inclusions || [];
        return result;
      }
    }
    const fallback = initialData?.applicableMemberships || [];
    return fallback;
  });
  
  // State to track "Select All" checkbox status independently
  const [isAllServicesSelected, setIsAllServicesSelected] = useState(() => {
    const raw = initialData?._raw?.includedServices;
    return raw?.allIncluded || false;
  });
  
  const [isAllProductsSelected, setIsAllProductsSelected] = useState(() => {
    const raw = initialData?._raw?.includedProducts;
    return raw?.allIncluded || false;
  });
  
  const [isAllMembershipsSelected, setIsAllMembershipsSelected] = useState(() => {
    const raw = initialData?._raw?.includedMemberships;
    return raw?.allIncluded || false;
  });
  
  // Update "Select All" states when initialData changes
  useEffect(() => {
    if (initialData) {
      
      const rawServices = initialData._raw?.includedServices;
      const servicesAllIncluded = rawServices?.allIncluded || false;
      setIsAllServicesSelected(servicesAllIncluded);
      
      const rawProducts = initialData._raw?.includedProducts;
      const productsAllIncluded = rawProducts?.allIncluded || false;
      setIsAllProductsSelected(productsAllIncluded);
      
      const rawMemberships = initialData._raw?.includedMemberships;
      const membershipsAllIncluded = rawMemberships?.allIncluded || false;
      setIsAllMembershipsSelected(membershipsAllIncluded);
    } else {
      // Reset to false when no initial data (new coupon)
      setIsAllServicesSelected(false);
      setIsAllProductsSelected(false);
      setIsAllMembershipsSelected(false);
    }
  }, [initialData]);
  
  // Log selection state changes
  useEffect(() => {
  }, [selectedServices]);
  
  useEffect(() => {
  }, [selectedProducts]);
  
  useEffect(() => {
  }, [selectedMemberships]);
  
  // Log "Select All" state changes  
  useEffect(() => {
  }, [isAllServicesSelected, isAllProductsSelected, isAllMembershipsSelected]);
  
  // Log available data changes
  useEffect(() => {
    if (availableServices.length > 0) {
    }
  }, [availableServices]);
  
  useEffect(() => {
    if (availableProducts.length > 0) {
    }
  }, [availableProducts]);
  
  useEffect(() => {
  }, [availableMemberships]);
  
  // Helper functions for select all functionality
  const handleSelectAllServices = () => {
    const allServiceIds = availableServices.map(service => service.id);
    const currentlyAllSelected = isAllServicesSelected;
    
    if (currentlyAllSelected) {
      setSelectedServices([]);
      setIsAllServicesSelected(false);
    } else {
      setSelectedServices(allServiceIds);
      setIsAllServicesSelected(true);
    }
  };

  const handleSelectAllProducts = () => {
    const allProductIds = availableProducts.map(product => product.id);
    const currentlyAllSelected = isAllProductsSelected;
    
    if (currentlyAllSelected) {
      setSelectedProducts([]);
      setIsAllProductsSelected(false);
    } else {
      setSelectedProducts(allProductIds);
      setIsAllProductsSelected(true);
    }
  };

  const areAllServicesSelected = () => {
    // Check if all available services are selected
    if (availableServices.length === 0) return false;
    const allServiceIds = availableServices.map(service => service.id);
    return allServiceIds.every(id => selectedServices.includes(id));
  };

  const areSomeServicesSelected = () => {
    return selectedServices.length > 0 && !areAllServicesSelected();
  };

  const areAllProductsSelected = () => {
    // Check if all available products are selected
    if (availableProducts.length === 0) return false;
    const allProductIds = availableProducts.map(product => product.id);
    return allProductIds.every(id => selectedProducts.includes(id));
  };

  const areSomeProductsSelected = () => {
    return selectedProducts.length > 0 && !areAllProductsSelected();
  };

  const handleSelectAllMemberships = () => {
    const allMembershipIds = availableMemberships.map(membership => membership.id);
    const currentlyAllSelected = isAllMembershipsSelected;
    if (currentlyAllSelected) {
      // If currently all selected, deselect all
      setSelectedMemberships([]);
      setIsAllMembershipsSelected(false);
    } else {
      // If not all selected, select all
      setSelectedMemberships(allMembershipIds);
      setIsAllMembershipsSelected(true);
    }
  };

  // Helper function to check current states
  const logCurrentStates = () => {
  };

  const areAllMembershipsSelected = () => {
    // Check if all available memberships are selected
    if (availableMemberships.length === 0) return false;
    const allMembershipIds = availableMemberships.map(membership => membership.id);
    return allMembershipIds.every(id => selectedMemberships.includes(id));
  };

  const areSomeMembershipsSelected = () => {
    return selectedMemberships.length > 0 && !areAllMembershipsSelected();
  };
  
  // Custom handlers that also update the "select all" state
  const handleServicesSelectionChange = (newSelection) => {
    setSelectedServices(newSelection);
    
    // Update the "select all" state based on whether all available services are selected
    const allServiceIds = availableServices.map(service => service.id);
    const allSelected = allServiceIds.length > 0 && allServiceIds.every(id => newSelection.includes(id));
    setIsAllServicesSelected(allSelected);
  };
  
  const handleProductsSelectionChange = (newSelection) => {
    setSelectedProducts(newSelection);
    
    // Update the "select all" state based on whether all available products are selected
    const allProductIds = availableProducts.map(product => product.id);
    const allSelected = allProductIds.length > 0 && allProductIds.every(id => newSelection.includes(id));
    setIsAllProductsSelected(allSelected);
  };
  
  const handleMembershipsSelectionChange = (newSelection) => {
    setSelectedMemberships(newSelection);
    
    // Update the "select all" state based on whether all available memberships are selected
    const allMembershipIds = availableMemberships.map(membership => membership.id);
    const allSelected = allMembershipIds.length > 0 && allMembershipIds.every(id => newSelection.includes(id));
    setIsAllMembershipsSelected(allSelected);
  };
  
  const handleValidityChange = (e) => {
    const { name, value } = e.target;
    setValidity(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    
    // Prepare form data for saving
    const formData = {
        id: initialData?.id || Date.now(),
        name: couponCode,
        type: "Coupon",
        description,
        validity,
        validFrom,
        validTo,
        price: "0", // Coupons don't have a price, they provide discounts
        walletBalance: "0",
        percentage: discountType === 'Percentage' ? Number(discountValue) : 0,
        discountAmount: discountType === 'Value' ? Number(discountValue) : 0,
        discountType: discountType,
        minPurchase: Number(minPurchase) || 0,
        maxDiscount: Number(maxDiscount) || 0,
        usageLimit: Number(usageLimit),
        usageType: usageType,
        applicableServices: selectedServices,
        applicableProducts: selectedProducts,
        applicableMemberships: selectedMemberships,
  // Use helper functions that check actual current state
        servicesAllIncluded: areAllServicesSelected(),
        productsAllIncluded: areAllProductsSelected(),
        membershipsAllIncluded: areAllMembershipsSelected(),
        status: initialData?.status || 'Active',
    };
    
    // Call the onSave function passed as prop
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-2">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Section: Basic Info */}
          <div className="bg-white border border-teal-200 p-6 rounded-xl shadow-sm space-y-4">
            <h4 className="text-md font-medium text-teal-900 mb-4 text-left">Coupon Information</h4>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-4">
              <InputField 
                id="couponCode" 
                label="Coupon Code"
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                placeholder="e.g. SUMMER25"
              />
              
              <InputField 
                id="description" 
                label="Description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g. Summer discount coupon"
              />

              <div>
                <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Valid From <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  id="validFrom"
                  name="validFrom" 
                  value={validFrom} 
                  onChange={e => setValidFrom(e.target.value)} 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Valid To <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  id="validTo"
                  name="validTo" 
                  value={validTo} 
                  onChange={e => setValidTo(e.target.value)} 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Discount Section */}
          <div className="bg-white border border-teal-200 p-6 rounded-xl shadow-sm">
            <h4 className="text-md font-medium text-teal-900 mb-4 text-left">Discount Details</h4>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-4">
              <RadioGroup 
                label="Discount Type"
                name="discountType"
                selectedValue={discountType}
                onChange={e => setDiscountType(e.target.value)}
                options={[
                  {value: 'Percentage', label: 'Percentage Discount'}, 
                  {value: 'Value', label: 'Fixed Amount'}
                ]}
              />
              
              <InputField 
                id="discountValue" 
                label={`${discountType === 'Percentage' ? 'Discount Percentage' : 'Discount Amount'}`}
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                startAdornment={discountType === 'Value' ? '₹' : null}
                placeholder={discountType === 'Percentage' ? "e.g. 25" : "e.g. 500"}
              />
            </div>
          </div>
          
          {/* Conditions Section */}
          <div className="bg-white border border-teal-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-md font-medium text-teal-900 mb-4 text-left">Coupon Conditions</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-4">
              <InputField 
                id="minPurchase" 
                label="Minimum Purchase Amount"
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                required={false}
                startAdornment="₹"
                placeholder="0 for no minimum"
              />
              
              <InputField 
                id="maxDiscount" 
                label="Maximum Discount Amount"
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                required={false}
                startAdornment="₹"
                placeholder="0 for no maximum"
              />
              
              <InputField 
                id="usageLimit" 
                label="Usage Limit"
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="How many times this coupon can be used"
              />
              
              <SelectField 
                id="usageType" 
                label="Usage Type" 
                value={usageType} 
                onChange={e => setUsageType(e.target.value)}
              >
                <option value="per_customer">Once Per Customer</option>
                <option value="unlimited">Unlimited Per Customer</option>
                <option value="total">Total Uses (All Customers)</option>
              </SelectField>
            </div>
          </div>

          {/* Applicable Services, Products and Memberships Section */}
          <div className="bg-white border border-teal-200 p-6 rounded-xl shadow-sm">
            <h4 className="text-md font-medium text-teal-900 mb-4 text-left">Applicable Services, Products & Memberships</h4>
            
            {/* Applicable Services Row */}
            <div className="mb-6">
              <HierarchicalMultiSelectDropdown
                label="Applicable Services"
                labelExtra={
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAllServices"
                      checked={areAllServicesSelected()}
                      ref={input => {
                        if (input) input.indeterminate = areSomeServicesSelected();
                      }}
                      onChange={handleSelectAllServices}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-2"
                    />
                    <label htmlFor="selectAllServices" className="text-sm text-gray-600 cursor-pointer">
                      Select All
                    </label>
                  </div>
                }
                items={availableServices}
                selectedItems={selectedServices}
                onSelectionChange={handleServicesSelectionChange}
                placeholder="Search and select services..."
                idPrefix="services"
              />
            </div>

            {/* Applicable Products Row */}
            <div className="mb-6">
              <HierarchicalMultiSelectDropdown
                label="Applicable Products"
                labelExtra={
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAllProducts"
                      checked={areAllProductsSelected()}
                      ref={input => {
                        if (input) input.indeterminate = areSomeProductsSelected();
                      }}
                      onChange={handleSelectAllProducts}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-2"
                    />
                    <label htmlFor="selectAllProducts" className="text-sm text-gray-600 cursor-pointer">
                      Select All
                    </label>
                  </div>
                }
                items={availableProducts}
                selectedItems={selectedProducts}
                onSelectionChange={handleProductsSelectionChange}
                placeholder="Search and select products..."
                idPrefix="products"
              />
            </div>

            {/* Applicable Memberships Row */}
            <div className="mb-4">
              <SimpleMultiSelectDropdown
                label="Applicable Memberships"
                labelExtra={
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAllMemberships"
                      checked={areAllMembershipsSelected()}
                      ref={input => {
                        if (input) input.indeterminate = areSomeMembershipsSelected();
                      }}
                      onChange={handleSelectAllMemberships}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-2"
                    />
                    <label htmlFor="selectAllMemberships" className="text-sm text-gray-600 cursor-pointer">
                      Select All
                    </label>
                  </div>
                }
                items={availableMemberships}
                selectedItems={selectedMemberships}
                onSelectionChange={handleMembershipsSelectionChange}
                placeholder="Search and select memberships..."
                idPrefix="memberships"
              />
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> If no services, products, or memberships are selected, this coupon will be applicable to all by default. Click on category checkboxes to select/deselect entire categories at once.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center space-x-4 pt-6 border-t border-gray-200">
            {/* Debug button - remove in production */}
            <button
              type="button"
              onClick={logCurrentStates}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
            >
              Debug States
            </button>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition"
              >
                {initialData ? 'Update' : 'Create'} Coupon
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
