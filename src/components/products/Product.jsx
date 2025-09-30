import React, { useState, useEffect } from "react";
import "./../../css/Customer.css"; // Import the CSS file
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";
import GenericTable from "@components/common/GenericTable";
import { EditIcon, EyeIcon, Trash2Icon, X } from "lucide-react";
import { Drawer } from "@components/common/Drawer";
import { productsApi } from '../../apis/APIs';
import { DeleteConfirmationModal } from "@components/common/DeleteConfirmationModal";
import { useStore } from '../login/StoreContext';
import { useNotification } from '../../contexts/NotificationContext';

// Using shared Drawer

// Using shared DeleteConfirmationModal

const Products = () => {
  const { currentStore } = useStore();
  const { showNotification } = useNotification();
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Delete confirmation modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (currentStore?.id) {
      fetchProducts();
    }
  }, [currentStore?.id]);

  const fetchProducts = async () => {
    if (!currentStore?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await productsApi.getProducts(currentStore.id);
      
      if (response && response.success && response.data && response.data.products) {
        // Transform API response to match component expectations
        const ymd = (val) => {
          if (!val) return '';
          if (typeof val === 'string') {
            // If ISO string with time or plain YYYY-MM-DD, slice to date
            const m = val.match(/^\d{4}-\d{2}-\d{2}/);
            if (m) return m[0];
          }
          const d = new Date(val);
          if (isNaN(d)) return '';
          const pad = (n) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
        };

        const transformedProducts = response.data.products.map(product => ({
          id: product.id,
          name: product.name,
          company: product.company,
          mfgDate: ymd(product.mfg_date),
          expDate: ymd(product.exp_date),
          sellingPrice: parseFloat(product.selling_price || 0),
          productType: product.usage,
          quantity: product.qty,
          costPrice: parseFloat(product.cost_price || 0),
          category: product.category,
          volume: product.prod_qty,
          volumeUnit: product.prod_qty_unit,
          tax: parseFloat(product.tax_prcnt || 0),
          hsnSac: product.hsn_sac_code,
          description: product.description,
          batchNo: product.batch_no,
          lowQtyNotification: product.notification_qty,
          expNotificationDays: product.expiry_notification_days,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }));
        setData(transformedProducts);
      } else {
        console.error('Invalid API response structure:', response);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductClick = () => {
    setSelectedProduct(null);
    setDrawerTitle('Add Product');
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    if (!currentStore?.id) return;
    
    try {
      if (selectedProduct) {
        // Update existing product
        await productsApi.updateProduct(currentStore.id, selectedProduct.id, productData);
      } else {
        // Create new product
        await productsApi.createProduct(currentStore.id, productData);
      }
      
      // Refresh the products list
      await fetchProducts();
      handleDrawerClose();
    } catch (error) {
      console.error('Error saving product:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setDrawerTitle('View Product Details');
    setIsDrawerOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setDrawerTitle('Edit Product');
    setIsDrawerOpen(true);
  };

  const handleRemoveProduct = (productId) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete || !currentStore?.id) return;

    try {
      await productsApi.deleteProduct(currentStore.id, productToDelete);
      
      // Refresh the products list
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      // You might want to show an error message to the user here
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const productData = [];

  const columns = [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      width: '10%',
      searchable: true,
      sortable: true// Enable text search via input below header
    },
    {
      id: 'company',
      header: 'Company',
      accessor: 'company',
      width: '10%',
      sortable: true,
      searchable: true
    },
    {
      id: 'productType',
      header: 'Product Type',
      width: '15%',
      accessor: 'productType',
      sortable: true,
      filterable: true,
      filterType: 'custom',
      filterRenderer: (value, onChange) => {
        const options = ['Internal Usage', 'Retail'];
        const selectedOptions = value || [];
        
        const handleToggleOption = (option) => {
          if (selectedOptions.includes(option)) {
            onChange(selectedOptions.filter(item => item !== option));
          } else {
            onChange([...selectedOptions, option]);
          }
        };
        
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Select Product Type</div>
            {options.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`productType-${option}`}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor={`productType-${option}`} className="text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      },
      filterMatcher: (rowValue, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        return filterValue.includes(rowValue);
      }
    },
    {
      id: 'category',
      header: 'Category',
      width: '15%',
      accessor: 'category',
      sortable: true,
      searchable: true
    },
    {
      id: 'mfgDate',
      header: 'Mfg Date',
      accessor: 'mfgDate',
      width: '10%',
      sortable: true,
      filterable: true, // Enable inline filter dropdown
      filterType: 'dateRange', // Specify date range filter type
      // Display as locale date while keeping value as YYYY-MM-DD for filters and forms
      cellRenderer: (row) => {
        if (!row.mfgDate) return '';
        const d = new Date(row.mfgDate);
        return isNaN(d) ? row.mfgDate : d.toLocaleDateString();
      }
    },
    {
      id: 'expDate',
      header: 'Exp Date',
      accessor: 'expDate',
      width: '10%',
      sortable: true,
      filterable: true, // Enable inline filter dropdown
      filterType: 'dateRange', // Specify date range filter type
      // Display as locale date while keeping value as YYYY-MM-DD for filters and forms
      cellRenderer: (row) => {
        if (!row.expDate) return '';
        const d = new Date(row.expDate);
        return isNaN(d) ? row.expDate : d.toLocaleDateString();
      }
    },

    {
      id: 'sellingPrice',
      header: 'Price',
      accessor: 'sellingPrice',
      width: '10%',
      sortable: true,
      cellRenderer: (row) => `₹${row.sellingPrice.toFixed(2)}`
    },
    {
      id: 'quantity',
      header: 'Qty',
      accessor: 'quantity',
      sortable: true,
      width: '10%',
      textAlign: 'left'
    },
    {
      id: 'volume',
      header: 'Volume',
      accessor: 'volume',
      width: '10%',
      sortable: true,
      cellRenderer: (row) => `${row.volume} ${row.volumeUnit}`
    }
  ];

  // --- Row Actions for GenericTable ---
  const rowActions = [
    { 
      icon: <EyeIcon className="text-blue-600 hover:text-blue-800" size={22}/>, 
      title: 'View Product',
      onClick: handleViewProduct
    },
    { 
      icon: <EditIcon className="text-green-600 hover:text-green-800" size={22} />, 
      title: 'Edit Product',
      onClick: handleEditProduct
    },
    { 
      icon: <Trash2Icon className="text-red-600 hover:text-red-800" size={22} />, 
      title: 'Delete Product', 
      onClick: (row) => handleRemoveProduct(row.id) 
    }
  ];

  return (
    <div className="p-4 px-6 ">
      <div className="customer-header">
        <div className="text-3xl font-bold text-teal-700 text-left  mb-4 p-0">Products</div>
        <button
          onClick={handleAddProductClick}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
        >Add Product</button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : (
          <GenericTable
            columns={columns}
            data={data} // Use real data instead of MOCK_PRODUCTS
            rowActions={rowActions}
            defaultSort={{ key: 'name', direction: 'ascending' }}
          />
        )}
      </div>
      
      {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        title={drawerTitle}
      >
        <ProductForm 
          initialProductData={selectedProduct}
          onSave={handleSaveProduct}
          onCancel={handleDrawerClose}
          isViewOnly={drawerTitle === 'View Product Details'}
        />
      </Drawer>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteProduct}
      />
    </div>
  );
};

export default Products;