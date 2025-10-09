import React, { useState, useEffect } from 'react';
import { PlusCircle, XCircle, AlertTriangle, ChevronDown, Edit3, Trash2 } from 'lucide-react'; // Using lucide-react for icons
import { InputField, SelectField, TextAreaField, Button, FormSection } from '@components/common/FormElements';
import { productsApi, enumsApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';
import CategorySelector from './CategorySelector';

// Mock data - replace with actual data fetching or props
const MOCK_PRODUCT_UNITS = ['ml', 'g', 'oz', 'pcs', 'drops'];

const AddServiceForm = ({ initialServiceData, onSave, onCancel, isViewMode = false }) => {
  const { currentStore } = useStore();
  const [serviceName, setServiceName] = useState(initialServiceData?.name || '');
  const [category, setCategory] = useState(initialServiceData?.category || '');
  const [description, setDescription] = useState(initialServiceData?.description || '');
  const [gender, setGender] = useState(initialServiceData?.gender || 'unisex');
  const [price, setPrice] = useState(initialServiceData?.price || '');
  const [duration, setDuration] = useState(initialServiceData?.duration || '');
  const [taxPercent, setTaxPercent] = useState(initialServiceData?.taxPercnt || '0');

  const [setReminder, setSetReminder] = useState(initialServiceData?.reminder ? true : false);
  const [reminderDays, setReminderDays] = useState(initialServiceData?.reminder || '30');

  const [products, setProducts] = useState(initialServiceData?.productUsage ? 
    initialServiceData.productUsage.map(p => ({
      id: Date.now().toString() + Math.random(),
      productId: p.productId,
      productName: p.productId, // This might need to be resolved to actual product name
      volume: p.qty,
      unit: p.unit
    })) : []);
  const [showProductUsage, setShowProductUsage] = useState(products.length > 0 || false);

  // State for fetched products from backend
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // State for service categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [errors, setErrors] = useState({});

  // Fetch available products from the backend when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentStore?.id) return; // Don't fetch if no store is selected

      setProductsLoading(true);
      try {
        const response = await productsApi.getProducts(currentStore.id);
        // Handle the specific API response structure: response.data.products
        const products = Array.isArray(response?.data?.products)
          ? response.data.products
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
        setAvailableProducts([]); // Set empty array on error
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [currentStore?.id]);

  // Fetch service categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      if (!currentStore?.id) return; // Don't fetch if no store is selected

      setCategoriesLoading(true);
      try {
        const response = await enumsApi.getServiceCategories(currentStore.id);
        // Handle the API response structure: response.data.enum.values
        const categoryList = response?.data?.enum?.values || [];
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Set empty array on error
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [currentStore?.id]);

  // Function to add a new category
  const handleAddCategory = async (newCategory) => {
    if (!currentStore?.id) return;

    try {
      // Add the new category to the existing list
      const updatedCategories = [...categories, newCategory];

      // Update the categories via API
      await enumsApi.updateServiceCategories(currentStore.id, updatedCategories);

      // Update local state
      setCategories(updatedCategories );
      setCategory(newCategory); // Set the newly added category as selected
    } catch (error) {
      console.error('Error adding category:', error);
      // Optionally show an error message to the user
    }
  };

  // Sync form fields when initialServiceData changes (view/edit/open another item)
  useEffect(() => {
    if (initialServiceData) {
      setServiceName(initialServiceData.name || '');
      setCategory(initialServiceData.category || '');
      setDescription(initialServiceData.description || '');
      setGender(initialServiceData.gender || 'unisex');

      // Ensure controlled inputs receive strings
      setPrice(
        initialServiceData.price !== undefined && initialServiceData.price !== null
          ? String(initialServiceData.price)
          : ''
      );
      setDuration(
        initialServiceData.duration !== undefined && initialServiceData.duration !== null
          ? String(initialServiceData.duration)
          : ''
      );
      setTaxPercent(
        initialServiceData.taxPercent !== undefined && initialServiceData.taxPercent !== null
          ? String(initialServiceData.taxPercent)
          : initialServiceData.taxPercnt !== undefined && initialServiceData.taxPercnt !== null
          ? String(initialServiceData.taxPercnt)
          : '0'
      );

      const reminderVal = initialServiceData.reminder ?? null;
      setSetReminder(!!reminderVal && Number(reminderVal) > 0);
      setReminderDays(
        reminderVal !== null && reminderVal !== undefined ? String(reminderVal) : '30'
      );

      const rawProducts = initialServiceData.productUsage || initialServiceData.products || [];
      const normalizedProducts = Array.isArray(rawProducts)
        ? rawProducts.map((p) => ({
            id: Date.now().toString() + Math.random(),
            productId: p.productId ?? p.id ?? '',
            productName: p.productName ?? '', // Don't fallback to productId, let it resolve from availableProducts
            volume: p.qty ?? p.volume ?? '',
            unit: p.unit ?? 'ml',
          }))
        : [];
      setProducts(normalizedProducts);
      setShowProductUsage(normalizedProducts.length > 0);
    } else {
      // Clear form for add mode
      setServiceName('');
      setCategory('');
      setDescription('');
      setGender('unisex');
      setPrice('');
      setDuration('');
      setTaxPercent('0');
      setSetReminder(false);
      setReminderDays('30');
      setProducts([]);
      setShowProductUsage(false);
      setErrors({});
    }
  }, [initialServiceData]);

  // Resolve product names when availableProducts are loaded
  useEffect(() => {
    if (availableProducts.length > 0 && products.length > 0) {
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product => {
          if (product.productId && !product.productName) {
            // Find the product in availableProducts and set the name
            const foundProduct = availableProducts.find(ap => ap.id === product.productId);
            if (foundProduct) {
              return {
                ...product,
                productName: foundProduct.name
              };
            }
          }
          return product;
        });

        // Only update if there are actual changes
        const hasChanges = updatedProducts.some((product, index) =>
          product.productName !== prevProducts[index]?.productName
        );

        if (hasChanges) {
          return updatedProducts;
        }
        return prevProducts;
      });
    }
  }, [availableProducts]); // Remove products from dependencies to avoid circular updates

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now().toString(),
        productId: '', // Initialize with empty productId (UUID will be set when product is selected)
        productName: '',
        volume: '',
        unit: MOCK_PRODUCT_UNITS[0]
      },
    ]);
    setShowProductUsage(true); // Show section if a product is added
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = products.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    if (updatedProducts.length === 0) {
        // setShowProductUsage(false); // Optionally hide if all products removed
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!serviceName.trim()) newErrors.serviceName = 'Service name is required.';
    if (!category) newErrors.category = 'Category is required.';
    
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = 'Valid price is required.';
    }
    
    if (!duration.trim() || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      newErrors.duration = 'Valid duration in minutes is required.';
    }
    
    // Tax is now optional - only validate if a value is provided
    if (taxPercent.trim() && (isNaN(parseFloat(taxPercent)) || parseFloat(taxPercent) < 0)) {
      newErrors.taxPercent = 'Tax percentage must be a valid number (0 or greater).';
    }

    // Validate reminder days: must be >= 1 when reminder is enabled
    if (setReminder && (!reminderDays.trim() || isNaN(parseInt(reminderDays)) || parseInt(reminderDays) < 1)) {
      newErrors.reminderDays = 'Reminder days must be 1 or greater.';
    }
    
    // Validate each product if product usage is shown
    if (showProductUsage) {
      products.forEach((product, index) => {
        if(!product.productName) {
          newErrors[`productName_${index}`] = 'Product selection is required.';
        }
        if(!product.volume || !product.volume.toString().trim() || isNaN(parseFloat(product.volume)) || parseFloat(product.volume) <= 0) {
          newErrors[`productVolume_${index}`] = 'Valid volume is required.';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Transform the data to match the API structure
      const serviceData = {
        name: serviceName,
        reminder: setReminder ? parseInt(reminderDays) : null,
        category,
        description,
        gender,
        price: parseFloat(price),
        duration: parseInt(duration),
        status: "active", // Default to active
        tax_prcnt: taxPercent.trim() ? parseFloat(taxPercent) : 0, // Default to 0 if empty
        productUsage: showProductUsage ? products.filter(p => p.productName && p.volume).map(p => ({
          productId: p.productId || p.productName, // This might need to be mapped to actual product IDs
          qty: parseFloat(p.volume),
          unit: p.unit
        })) : []
      };
      
      if (onSave) {
        try {
          await onSave(serviceData);
        } catch (error) {
          console.error('Error saving service:', error);
          // Handle error if needed
        }
      }
    }
  };

  // Function to reset the form to initial state
  const resetForm = () => {
    setServiceName('');
    setCategory('');
    setDescription('');
    setGender('unisex');
    setPrice('');
    setDuration('');
    setTaxPercent('0');
    setSetReminder(false);
    setReminderDays('30');
    setProducts([]);
    setShowProductUsage(false);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg space-y-6">
      <FormSection>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <InputField
            label="Name"
            name="serviceName"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Enter service name"
            required
            disabled={isViewMode}
            className={errors.serviceName ? 'error' : ''}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Set Reminder</label>
            <div className="flex items-center space-x-4">
              <label htmlFor="setReminderToggle" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    id="setReminderToggle" 
                    className="sr-only" 
                    checked={setReminder} 
                    onChange={(e) => setSetReminder(e.target.checked)} 
                    disabled={isViewMode}
                  />
                  <div className={`block w-10 h-6 rounded-full ${setReminder ? 'bg-teal-500' : 'bg-gray-300'} ${isViewMode ? 'opacity-50' : ''}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${setReminder ? 'translate-x-full' : ''}`}></div>
                </div>
              </label>
              {setReminder && (
                <div className="flex items-center">
                  <input 
                    type="number" 
                    value={reminderDays} 
                    onChange={(e) => setReminderDays(e.target.value)}
                    placeholder="Days"
                    disabled={isViewMode}
                    className={`w-20 px-3 py-2 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${errors.reminderDays ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100' : ''}`}
                  />
                  <span className="ml-2 text-sm text-gray-600">Day(s)</span>
                </div>
              )}
            </div>
            {setReminder && errors.reminderDays && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertTriangle size={14} className="mr-1"/>{errors.reminderDays}
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <CategorySelector
            value={category}
            onChange={setCategory}
            categories={categories}
            onAddCategory={handleAddCategory}
            disabled={isViewMode}
            placeholder="Select or type a category..."
            className={errors.category ? 'border-red-500' : ''}
            required
          />
          {errors.category && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertTriangle size={14} className="mr-1"/>{errors.category}
            </p>
          )}

          <TextAreaField
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description here"
            disabled={isViewMode}
            rows={3}
          />
        </div>
        
        <div className="flex flex-row gap-4 items-center">
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <div className="flex items-center space-x-4">
            {['male', 'female', 'unisex'].map(g => (
              <label key={g} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={isViewMode}
                  className="form-radio h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 capitalize">{g}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <InputField
            label="Price"
            name="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            step="0.01"
            placeholder="e.g., 500"
            disabled={isViewMode}
            required
          />
          
          <InputField
            label="Duration (minutes)"
            name="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            type="number"
            placeholder="e.g., 30"
            disabled={isViewMode}
            required
          />
          
          <InputField
            label="Tax % (Optional)"
            name="taxPercent"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
            type="number"
            step="0.1"
            placeholder="e.g., 18 (default: 0)"
            disabled={isViewMode}
          />
        </div>
        
        <div className="grid sm:grid-cols-1 gap-4">
          {!showProductUsage && !isViewMode && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowProductUsage(true);
                  if (products.length === 0) handleAddProduct();
                }}
                className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-teal-400 text-teal-600 rounded-md hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-1 text-sm"
              >
                <PlusCircle size={18} className="mr-2" />
                Add Product Usage (Optional)
              </button>
            </div>
          )}
        </div>
      </FormSection>
      
      {showProductUsage && (
        <FormSection title="Product Usage">
          {products.map((product, index) => (
            <div key={product.id} className="grid grid-cols-12 gap-3 items-end p-2 border-b border-gray-100 last:border-b-0">
              <div className="col-span-5">
                <label className="block text-xs font-medium text-gray-600 mb-1">Select Product</label>
                <select
                  value={product.productId || ''}
                  onChange={(e) => {
                    const selectedProduct = availableProducts.find(p => p.id === e.target.value);
                    if (selectedProduct) {
                      // Update both productId and productName in a single call to avoid race conditions
                      const updatedProducts = products.map((p, i) =>
                        i === index ? {
                          ...p,
                          productId: selectedProduct.id,
                          productName: selectedProduct.name
                        } : p
                      );
                      setProducts(updatedProducts);
                    } else {
                      // Clear both values
                      const updatedProducts = products.map((p, i) =>
                        i === index ? {
                          ...p,
                          productId: '',
                          productName: ''
                        } : p
                      );
                      setProducts(updatedProducts);
                    }
                  }}
                  disabled={isViewMode || productsLoading}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${errors[`productName_${index}`] ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100' : ''}`}
                >
                  <option value="">
                    {productsLoading ? 'Loading products...' : 'Select product...'}
                  </option>
                  {availableProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.company && `(${p.company})`}
                    </option>
                  ))}
                </select>
                {errors[`productName_${index}`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`productName_${index}`]}</p>
                )}
              </div>
              
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Use Vol.</label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={product.volume}
                  onChange={(e) => handleProductChange(index, 'volume', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${errors[`productVolume_${index}`] ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100' : ''}`}
                />
                {errors[`productVolume_${index}`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`productVolume_${index}`]}</p>
                )}
              </div>
              
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <select
                  value={product.unit}
                  onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm border-gray-300 ${isViewMode ? 'bg-gray-100' : ''}`}
                >
                  {MOCK_PRODUCT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              
              <div className="col-span-1 flex items-end justify-center">
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Remove Product"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddProduct}
            disabled={isViewMode}
            className={`mt-2 flex items-center px-3 py-1.5 border border-dashed border-teal-400 text-teal-600 rounded-md hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-300 text-xs ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <PlusCircle size={16} className="mr-1.5" />
            Add Product
          </button>
        </FormSection>
      )}

      <div className="flex justify-center space-x-3 pt-4">
        {!isViewMode && (
          <Button
            type="submit"
            variant="primary"
          >
            {initialServiceData ? 'Update Service' : 'Add Service'}
          </Button>
        )}
        
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </Button>
      </div>
    </form>
  );
};

export default AddServiceForm;
