import React, { useState, useEffect } from 'react';
import { PlusCircle, CalendarDays, Bell } from 'lucide-react';
import { InputField, SelectField, TextAreaField, Button, FormSection } from '../common/FormElements';
import { productsApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';

// Mock data - replace with actual data fetching or props
const MOCK_PRODUCT_CATEGORIES = ['Shampoo', 'Conditioner', 'Hair Oil', 'Styling Gel', 'Face Wash', 'Moisturizer', 'Serum'];
const MOCK_COMPANY_NAMES = ['L\'Oreal', 'Garnier', 'P&G', 'Unilever', 'Local Supplier Inc.'];
const MOCK_PRODUCT_TYPES = ['Internal Usage', 'Retail'];
const MOCK_TAX_RATES = [0, 5, 12, 18, 28]; // Example tax percentages

const ProductForm = ({ initialProductData, onSave, onCancel, isViewOnly = false }) => {
  const { currentStore } = useStore();
  const [productName, setProductName] = useState(initialProductData?.name || '');
  const [company, setCompany] = useState(initialProductData?.company || '');
  const [costPrice, setCostPrice] = useState(initialProductData?.costPrice || '');
  const [category, setCategory] = useState(initialProductData?.category || '');
  const [productType, setProductType] = useState(initialProductData?.productType || '');
  const [sellingPrice, setSellingPrice] = useState(initialProductData?.sellingPrice || '');
  const [volume, setVolume] = useState(initialProductData?.volume || '');
  const [volumeUnit, setVolumeUnit] = useState(initialProductData?.volumeUnit || 'ml');
  const [quantity, setQuantity] = useState(initialProductData?.quantity || '');
  const [tax, setTax] = useState(initialProductData?.tax || '');
  
  // Helper: pad to 2 digits
  const pad2 = (n) => String(n).padStart(2, '0');
  // Helper: Date object -> YYYY-MM-DD
  const dateObjToYMD = (d) => `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  // Robust helper to convert various date representations to input format (YYYY-MM-DD)
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';

    // If it's already a Date
    if (dateValue instanceof Date && !isNaN(dateValue)) {
      return dateObjToYMD(dateValue);
    }

    if (typeof dateValue === 'string') {
      const trimmed = dateValue.trim();
      if (!trimmed) return '';

      // If already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
      // If ISO with time
      if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) return trimmed.slice(0, 10);

      // Try to parse common locale formats like DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, etc.
      const parts = trimmed.split(/[\/.\-]/).map(p => p.trim());
      if (parts.length === 3 && parts.every(p => /^\d+$/.test(p))) {
        // Year-first (YYYY-MM-DD or YYYY/MM/DD)
        if (parts[0].length === 4) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          const d = parseInt(parts[2], 10);
          if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return `${y}-${pad2(m)}-${pad2(d)}`;
        }
        // Day-first or Month-first. Prefer day-first if ambiguous (common outside US)
        let a = parseInt(parts[0], 10);
        let b = parseInt(parts[1], 10);
        let c = parseInt(parts[2], 10);
        let day, month, year;
        if (a > 12) { // definitely DD/MM/YYYY
          day = a; month = b; year = c;
        } else if (b > 12) { // definitely MM/DD/YYYY
          day = b; month = a; year = c;
        } else { // ambiguous -> assume DD/MM/YYYY
          day = a; month = b; year = c;
        }
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return `${year}-${pad2(month)}-${pad2(day)}`;
      }

      // Numeric timestamp
      const asNum = Number(trimmed);
      if (!Number.isNaN(asNum) && trimmed.length >= 10) {
        const d = new Date(asNum);
        if (!isNaN(d)) return dateObjToYMD(d);
      }
    }

    // Fallback to Date parser
    const parsed = new Date(dateValue);
    return !isNaN(parsed.getTime()) ? dateObjToYMD(parsed) : '';
  };
  
  const [mfgDate, setMfgDate] = useState(formatDateForInput(initialProductData?.mfgDate));
  const [lowQtyNotification, setLowQtyNotification] = useState(initialProductData?.lowQtyNotification || '');
  const [expDate, setExpDate] = useState(formatDateForInput(initialProductData?.expDate));
  const [expNotificationDays, setExpNotificationDays] = useState(initialProductData?.expNotificationDays || '');
  const [hsnSac, setHsnSac] = useState(initialProductData?.hsnSac || '');
  const [description, setDescription] = useState(initialProductData?.description || '');
  const [batchNo, setBatchNo] = useState(initialProductData?.batchNo || '');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active store id from context
  const STORE_ID = currentStore?.id;

  const MOCK_VOLUME_UNITS = ['ml', 'g', 'L', 'kg', 'pcs', 'oz'];

  // Update form fields when initialProductData changes (for editing)
  useEffect(() => {
    if (initialProductData) {
      setProductName(initialProductData.name || '');
      setCompany(initialProductData.company || '');
      setCostPrice(initialProductData.costPrice || '');
      setCategory(initialProductData.category || '');
      setProductType(initialProductData.productType || '');
      setSellingPrice(initialProductData.sellingPrice || '');
      setVolume(initialProductData.volume || '');
      setVolumeUnit(initialProductData.volumeUnit || 'ml');
      setQuantity(initialProductData.quantity || '');
      setTax(initialProductData.tax || '');
      setMfgDate(formatDateForInput(initialProductData.mfgDate));
      setExpDate(formatDateForInput(initialProductData.expDate));
      setLowQtyNotification(initialProductData.lowQtyNotification || '');
      setExpNotificationDays(initialProductData.expNotificationDays || '');
      setHsnSac(initialProductData.hsnSac || '');
      setDescription(initialProductData.description || '');
      setBatchNo(initialProductData.batchNo || '');
      setErrors({});
    } else {
      // Clear form when no initial data (for adding new product)
      setProductName('');
      setCompany('');
      setCostPrice('');
      setCategory('');
      setProductType('');
      setSellingPrice('');
      setVolume('');
      setVolumeUnit('ml');
      setQuantity('');
      setTax('');
      setMfgDate('');
      setExpDate('');
      setLowQtyNotification('');
      setExpNotificationDays('');
      setHsnSac('');
      setDescription('');
      setBatchNo('');
      setErrors({});
    }
  }, [initialProductData]);


  const validateForm = () => {
    // Skip validation in view-only mode
    if (isViewOnly) return true;
    
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = 'Product name is required.';
    if (!company.trim()) newErrors.company = 'Company name is required.';
    if (!costPrice.trim() || isNaN(parseFloat(costPrice)) || parseFloat(costPrice) < 0) {
      newErrors.costPrice = 'Valid cost price is required.';
    }
    if (!category) newErrors.category = 'Category is required.';
    if (!sellingPrice.trim() || isNaN(parseFloat(sellingPrice)) || parseFloat(sellingPrice) < 0) {
      newErrors.sellingPrice = 'Valid selling price is required.';
    }
    if (costPrice.trim() && sellingPrice.trim() && parseFloat(sellingPrice) < parseFloat(costPrice)) {
      newErrors.sellingPrice = 'Selling price cannot be less than cost price.';
    }
    if (!volume.trim() || isNaN(parseFloat(volume)) || parseFloat(volume) <= 0) {
      newErrors.volume = 'Valid volume is required.';
    }
    if (!quantity.trim() || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required.';
    }
    if (tax.trim() && (isNaN(parseFloat(tax)) || parseFloat(tax) < 0 || parseFloat(tax) > 100)) {
      newErrors.tax = 'Valid tax percentage (0-100) or leave empty.';
    }
    if (!mfgDate) newErrors.mfgDate = 'Manufacturing date is required.';
    if (!expDate) newErrors.expDate = 'Expiry date is required.';
    if (mfgDate && expDate && new Date(expDate) < new Date(mfgDate)) {
      newErrors.expDate = 'Expiry date cannot be before manufacturing date.';
    }
    if (!lowQtyNotification.trim() || isNaN(parseInt(lowQtyNotification)) || parseInt(lowQtyNotification) < 0) {
      newErrors.lowQtyNotification = 'Valid low quantity threshold is required.';
    }
    if (!expNotificationDays.trim() || isNaN(parseInt(expNotificationDays)) || parseInt(expNotificationDays) < 0) {
      newErrors.expNotificationDays = 'Valid expiry notification days are required.';
    }
    if (!hsnSac.trim()) newErrors.hsnSac = 'HSN/SAC code is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't submit in view-only mode
    if (isViewOnly) return;
    
    if (!STORE_ID) {
      setErrors({ submit: 'No store selected. Please select a store and try again.' });
      return;
    }
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const productData = {
          productName,
          company,
          costPrice: parseFloat(costPrice),
          category,
          productType,
          sellingPrice: parseFloat(sellingPrice),
          volume: parseFloat(volume),
          volumeUnit,
          quantity: parseInt(quantity),
          tax: tax ? parseFloat(tax) : null,
          mfgDate,
          lowQtyNotification: parseInt(lowQtyNotification),
          expDate,
          expNotificationDays: parseInt(expNotificationDays),
          hsnSac,
          description,
          batchNo
        };
        
        
        if (initialProductData) {
          // Update existing product
          await productsApi.updateProduct(STORE_ID, initialProductData.id, productData);
        } else {
          // Create new product
          await productsApi.createProduct(STORE_ID, productData);
        }
        
        // Call the onSave callback to handle success (close modal, refresh list, etc.)
        if (onSave) {
          onSave(productData);
        }
      } catch (error) {
        console.error('Error saving product:', error);
        // You might want to show an error message to the user here
        // For now, we'll just log the error
        setErrors({ submit: 'Failed to save product. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    } else {
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 md:p-6 bg-white max-w-3xl mx-auto space-y-4">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Product Name" 
            name="productName"
            value={productName} 
            onChange={(e) => setProductName(e.target.value)} 
            placeholder="Enter product name" 
            error={errors.productName} 
            required={!isViewOnly}
            disabled={isViewOnly}
          />
          <InputField 
            label="Company" 
            name="company"
            value={company} 
            onChange={(e) => setCompany(e.target.value)} 
            placeholder="Enter company name" 
            error={errors.company} 
            required={!isViewOnly}
            disabled={isViewOnly}
          />
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Cost Price (₹)" 
            name="costPrice"
            value={costPrice} 
            onChange={(e) => setCostPrice(e.target.value)} 
            type="number" 
            placeholder="e.g., 100" 
            min="0"
            required={!isViewOnly}
            disabled={isViewOnly}
          />
          <InputField 
            label="Selling Price (₹)" 
            name="sellingPrice"
            value={sellingPrice} 
            onChange={(e) => setSellingPrice(e.target.value)} 
            type="number" 
            placeholder="e.g., 150" 
            min="0"
            required={!isViewOnly}
            disabled={isViewOnly}
          />
        </div>
      
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <SelectField
            label="Product Type"
            name="productType"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            required={!isViewOnly}
            disabled={isViewOnly}
            options={[
              { value: "", label: "Select product type..." },
              ...MOCK_PRODUCT_TYPES.map(type => ({ value: type, label: type }))
            ]}
          />
          <SelectField
            label="Category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required={!isViewOnly}
            disabled={isViewOnly}
            options={[
              { value: "", label: "Select category..." },
              ...MOCK_PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))
            ]}
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Quantity in Stock" 
            name="quantity"
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            type="number" 
            placeholder="e.g., 50" 
            min="0"
            required={!isViewOnly}
            disabled={isViewOnly}
          />
          <div className="flex gap-3">
            <div className="flex-grow">
              <InputField 
                label="Volume" 
                name="volume"
                value={volume} 
                onChange={(e) => setVolume(e.target.value)} 
                type="number" 
                placeholder="e.g., 100" 
                min="0"
                required={!isViewOnly}
                disabled={isViewOnly}
              />
            </div>
            <div className="w-1/3 self-end">
              <SelectField
                label="Unit"
                name="volumeUnit"
                value={volumeUnit}
                onChange={(e) => setVolumeUnit(e.target.value)}
                disabled={isViewOnly}
                options={MOCK_VOLUME_UNITS.map(unit => ({ value: unit, label: unit }))}
              />
            </div>
          </div>
        </div>
      
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Manufacturing Date" 
            name="mfgDate"
            value={mfgDate} 
            onChange={(e) => setMfgDate(e.target.value)} 
            type="date" 
            required={!isViewOnly}
            disabled={isViewOnly}
          />
          <InputField 
            label="Expiry Date" 
            name="expDate"
            value={expDate} 
            onChange={(e) => setExpDate(e.target.value)} 
            type="date" 
            required={!isViewOnly}
            disabled={isViewOnly}
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <InputField 
            label="Low Quantity Notification At" 
            name="lowQtyNotification"
            value={lowQtyNotification} 
            onChange={(e) => setLowQtyNotification(e.target.value)} 
            type="number" 
            placeholder="e.g., 10 units" 
            min="0"
            required={!isViewOnly}
            disabled={isViewOnly}
          />
          <InputField 
            label="Expiry Notification (Days)" 
            name="expNotificationDays"
            value={expNotificationDays} 
            onChange={(e) => setExpNotificationDays(e.target.value)} 
            type="number" 
            placeholder="e.g., 30 days" 
            min="0"
            required={!isViewOnly}
            disabled={isViewOnly}
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="HSN/SAC Code" 
            name="hsnSac"
            value={hsnSac} 
            onChange={(e) => setHsnSac(e.target.value)} 
            placeholder="Enter HSN or SAC code" 
            required={!isViewOnly}
            disabled={isViewOnly}
          />
          <InputField 
            label="Tax (%)" 
            name="tax"
            value={tax} 
            onChange={(e) => setTax(e.target.value)} 
            type="number" 
            placeholder="e.g., 18 (optional)" 
            min="0" 
            max="100"
            disabled={isViewOnly}
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-1 gap-4">
          <InputField 
            label="Batch Number (Optional)" 
            name="batchNo"
            value={batchNo} 
            onChange={(e) => setBatchNo(e.target.value)} 
            placeholder="Enter batch number"
            disabled={isViewOnly}
          />
        </div>

        <TextAreaField
          label="Description (Optional)"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Enter product description, details, or notes..."
          disabled={isViewOnly}
        />

      {!isViewOnly && (
        <div className="flex justify-center space-x-3 pt-4">
          {errors.submit && (
            <div className="w-full text-center mb-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {initialProductData ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              initialProductData ? 'Update Product' : 'Add Product'
            )}
          </Button>
        </div>
      )}
    </form>
  );
};


export default ProductForm; // Or export App if you uncomment the App example
