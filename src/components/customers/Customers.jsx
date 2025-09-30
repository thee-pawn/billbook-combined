import React, { useState, useEffect } from "react";
import "./../../css/Customer.css";
import GenericTable from "@components/common/GenericTable";
import { EditIcon, EyeIcon, PencilIcon, Send, MessageCircle, Trash2Icon, Moon, X, StickyNoteIcon, HistoryIcon } from "lucide-react";
import { CustomerNotes } from "./CustomerNotes";
import FilterComponent from "@components/common/FilterComponent";
import { MultiSelectDropdown } from "@components/common/MultiSelectDropdown";
import WhatsAppPromotion from "./WhatsAppPromotion";
import { Modal } from "@components/common/Modal";
import { Drawer } from "@components/common/Drawer";
import SmsPromotion from "./SmsPromotion";
import CustomerForm2 from "./Customer2";
import CustomerForm from "./CustomerForm";
import CustomerHistory from "./CustomerHistory";
import { DeleteConfirmationModal } from "@components/common/DeleteConfirmationModal";
import { customersApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';
import { useNotification } from '../../contexts/NotificationContext';

// Using shared Drawer


const MOCK_PRODUCTS = [
  {
    number: "+917667129348",
    name: "Cutomer 2",
    gender: "Female",
    walletBalance: "5000",
    notes: "good customer",
    loyaltyPoints: 100,
    dues: "0",
    revenue: "20000",
    membership : "Silver",
    status: "Active"
  },
  {
    number: "+919110178227",
    name: "Cutomer 3",
    gender: "Male",
    walletBalance: "2000",
    notes: "bad customer",
    loyaltyPoints: 100,
    dues: "500",
    revenue: "1500",
    membership : "Bronze",
    status: "Active"
  },
  {
    number: "+917992269740",
    name: "Cutomer 4",
    gender: "Male",
    walletBalance: "2000",
    notes: "bad customer",
    loyaltyPoints: 100,
    dues: "500",
    revenue: "1500",
    membership : "Bronze",
    status: "Active"
  },
  {
    number: "+919608163637",
    name: "Cutomer 5",
    gender: "Male",
    walletBalance: "2000",
    notes: "bad customer",
    loyaltyPoints: 100,
    dues: "500",
    revenue: "1500",
    membership : "Bronze",
    status: "Active"
  },
  {
    number: "+918146050920",
    name: "L J",
    gender: "Male",
    walletBalance: "2000",
    notes: "bad customer",
    loyaltyPoints: 100,
    dues: "500",
    revenue: "1500",
    membership : "Bronze",
    status: "Active"
  },
]

// Create a detailed mock customer for CustomerForm2
const MOCK_DETAILED_CUSTOMER = {
  id: "cust123",
  number: "+919110178227",
  name: "Rahul Sharma",
  gender: "Male",
  birthday: "1990-05-15",
  anniversary: "2015-11-22",
  walletBalance: "5000",
  paymentDues: "1200",
  advanceAmount: "500",
  loyaltyPoints: 250,
  referralPoints: 100,
  membership: "Gold",
  packages: "Premium Spa Package",
  lastVisit: "2025-07-10",
  email: "rahul.sharma@example.com",
  address: "123 Main Street, Bangalore",
  notes: "Prefers evening appointments. Allergic to certain oils."
};

const cutomerFilters = ['HighValue', 'Birthday This Week', 'Birthday Today', 'Anniversary This Week', 'Anniversary Today', 'Only Enquiry', 'Frequent'];
const Customers = () => {
  const [data, setData] = useState([]);
  const { currentStore } = useStore();
  const { showWarning, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isSMSPromotionModalOpen, setIsSMSPromotionModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerFilters, setCustomerFilters] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customersToDelete, setCustomersToDelete] = useState([]);

  // Close all small modals
  const handleCloseModals = () => {
    setIsWhatsAppModalOpen(false);
    setIsSMSPromotionModalOpen(false);
    setIsAddServiceModalOpen(false);
  };

  // Table row selection handler
  const handleRowSelect = (rows) => {
    setSelectedRows(rows);
  };

  const handleWhatsAppPromotion = () => {
    if (!selectedRows || selectedRows.length === 0) {
      showWarning('Please select customers to send WhatsApp promotion');
      return;
    }
    setIsWhatsAppModalOpen(true);
  };

  const handleSMSPromotion = () => {
    if (!selectedRows || selectedRows.length === 0) {
      showWarning('Please select customers to send SMS promotion');
      return;
    }
    setIsSMSPromotionModalOpen(true);
  };

  const handleRemoveCustomer = async (customerId) => {
    try {
      const response = await fetch(`http://localhost:8080/products/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Update the state to remove the deleted customer
      setData((prevData) => prevData.filter((customer) => customer.id !== customerId));
      handleDrawerClose();
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const productData = [];
  const keys = [
      { key: "annivesary", type: "Date" },
      { key: "birthday", type: "Date" },
      { key: "createdAt", type: "Date" },
      { key: "status", type: "Text" },
      { key: "membership", type: "Text" }
  ];

  const columns = [
  {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      searchable: true,
      sortable: true// Enable text search via input below header
    },
  {
      id: 'number',
      header: 'Number',
      accessor: 'number',
      searchable: true
    },
    
    {
      id: 'gender',
      header: 'Gender',
      accessor: 'gender',
      filterable: true,
      filterType: 'custom',
      filterRenderer: (value, onChange) => {
        const options = ['Male', 'Female', 'Other'];
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
            <div className="text-sm font-medium text-gray-700 mb-1">Select Gender</div>
            {options.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`gender-${option}`}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor={`gender-${option}`} className="text-sm text-gray-700">
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
      id: 'layaltyPoints',
      header: 'Loyalty Points',
      accessor: 'loyaltyPoints',
      sortable: true,
    },
    {
      id: 'walletBalance',
      header: 'Wallet Balance',
      accessor: 'walletBalance',
      sortable: true
    },
    {
      id: 'membership',
      header: 'Membership',
      accessor: 'membership',
      sortable: true,
      filterable: true,
      filterType: 'custom',
      filterRenderer: (value, onChange) => {
        const options = ['Gold', 'Silver', 'Bronze', 'Platinum'];
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
            <div className="text-sm font-medium text-gray-700 mb-1">Select Memberships</div>
            {options.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`membership-${option}`}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor={`membership-${option}`} className="text-sm text-gray-700">
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
      id: 'dues',
      header: 'Dues',
      accessor: 'dues',
      sortable: true,
      filterable: true,
      filterType: 'custom',
      filterRenderer: (value, onChange) => (
        <div className="flex items-center">
          <input
            id="dues-filter-checkbox"
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked ? true : undefined)}
            className="cursor-pointer border-2 rounded flex items-center justify-center transition-colors duration-200"
          />
          <label htmlFor="dues-filter-checkbox" className="ml-2 text-sm text-gray-700">
            Has Dues
          </label>
        </div>
      ),
      filterMatcher: (rowValue, filterValue) => {
        if (!filterValue) return true;
        return parseFloat(rowValue) > 0;
      }
    },
    {
      id: 'revenue',
      header: 'Revenue',
      accessor: 'revenue',
      sortable: true
    }


  ];

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setDrawerContent(null);
    setSelectedCustomer(null);
  };

  const handleAddCustomer = () => {
    setDrawerTitle('Add Customer');
    setDrawerContent(
      <CustomerForm
        onCreated={async () => {
          // Re-fetch list so new customer appears
          try {
            if (currentStore?.id) {
              const res = await customersApi.getCustomers(currentStore.id, 1, 50);
              if (res.success) setData(res.data);
            }
          } catch (e) { /* silent */ }
        }}
        onClose={handleDrawerClose}
      />
    );
    setIsDrawerOpen(true);
  };

  const refreshCustomers = async () => {
    try {
      if (currentStore?.id) {
        const res = await customersApi.getCustomers(currentStore.id, 1, 50);
        if (res.success) setData(res.data);
      }
    } catch {}
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDrawerTitle('Edit Customer');
    setDrawerContent(
      <CustomerForm
        customer={customer}
        mode="edit"
        onUpdated={() => refreshCustomers()}
        onClose={handleDrawerClose}
      />
    );
    setIsDrawerOpen(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDrawerTitle('View Customer');
    // Map table row to detailed structure expected by CustomerForm2
    const ddmmToISO = (ddmm) => {
      if (!ddmm || !ddmm.includes('/')) return ddmm || '';
      const [d,m] = ddmm.split('/');
      const year = new Date().getFullYear();
      return `${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    };
    const details = {
      id: customer.id,
      number: customer.number,
      name: customer.name,
      gender: (customer.gender || '').toLowerCase(),
      birthday: ddmmToISO(customer.birthday),
      anniversary: ddmmToISO(customer.anniversary),
      paymentDues: customer.dues ?? 0,
      advanceAmount: customer.advanceAmount ?? 0,
      walletBalance: customer.walletBalance ?? 0,
      loyaltyPoints: customer.loyaltyPoints ?? 0,
      referralPoints: customer.referralPoints ?? 0,
      membership: customer.membership || '',
      packages: customer.packages || '',
      lastVisit: customer.lastVisit || '',
    };
    setDrawerContent(
      <CustomerForm2
        customerDetails={details}
        handleCustomerDataChange={() => {}}
        openClientHistory={null}
        openNotesModal={null}
        openDuesHistory={null}
      />
    );
    setIsDrawerOpen(true);
  };

  const viewCustomerNotes = (customer) => {
    setSelectedCustomer(customer);
    setDrawerTitle('Customer Notes');
    setDrawerContent(
      <CustomerNotes customer={customer} />
    );
    setIsDrawerOpen(true);
  };

  const viewCustomerHistory = (customer) => {
    setSelectedCustomer(customer);
    setDrawerTitle('Customer History');
    setDrawerContent(
      <CustomerHistory />
    );
    setIsDrawerOpen(true);
  };

  // Using shared DeleteConfirmationModal

  const handleDeleteSelected = () => {
    if (!selectedRows || selectedRows.length === 0) return;
    setCustomersToDelete(selectedRows);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteClick = (customer) => {
    setCustomersToDelete([customer]);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Delete each customer in the customersToDelete array
      for (const customer of customersToDelete) {
        await fetch(`http://localhost:8080/products/${customer.id}`, {
          method: "DELETE",
        });
      }

      // Update the state to remove the deleted customers
      setData((prevData) => 
        prevData.filter((customer) => 
          !customersToDelete.some(toDelete => toDelete.id === customer.id)
        )
      );

      // Clear selected rows if bulk delete was performed
      if (customersToDelete.length > 1) {
        setSelectedRows([]);
      }

      setIsDeleteModalOpen(false);
      setCustomersToDelete([]);
    } catch (error) {
      console.error("Error deleting customers:", error);
      showError("Failed to delete customers. Please try again.");
    }
  };

  // --- Row Actions for GenericTable (Remain the same) ---
  const rowActions = [
    { 
      icon: <EyeIcon className="text-blue-600 hover:text-blue-800" size={22}/>, 
      title: 'View Customer',
      onClick: handleViewCustomer
    },
    { 
      icon: <EditIcon className="text-green-600 hover:text-green-800" size={22} />, 
      title: 'Edit Customer',
      onClick: handleEditCustomer
    },
    { 
      icon: <HistoryIcon className="text-green-600 hover:text-green-800" size={22} />, 
      title: 'View Customer History',
      onClick: viewCustomerHistory
    },
    { 
      icon: <StickyNoteIcon className="text-green-600 hover:text-green-800" size={22} />, 
      title: 'View Notes',
      onClick: viewCustomerNotes
    },
    { 
      icon: <Trash2Icon className="text-red-600 hover:text-red-800" size={22} />, 
      title: 'Delete Customer',
      onClick: handleDeleteClick
    }
  ];

  

  useEffect(() => {
    if (!currentStore?.id) return;
    let active = true;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await customersApi.getCustomers(currentStore.id, 1, 50);
        if (active && res.success) setData(res.data);
      } catch (e) { if (active) setError(e.message || 'Failed to load customers'); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [currentStore?.id]);

  return (
    <div className="p-4 px-6 ">
      <div className="customer-header">
        <div className="text-3xl font-bold text-teal-700 text-left  mb-4 p-0">Customers</div>
        <div className="flex space-x-4">
          <button
            onClick={handleWhatsAppPromotion}
            disabled={!selectedRows || selectedRows.length === 0}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <MessageCircle size={20} />
            WhatsApp Promotion ({selectedRows?.length || 0})
          </button>
          <button
            onClick={handleSMSPromotion}
            disabled={!selectedRows || selectedRows.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={20} />
            SMS Promotion ({selectedRows?.length || 0})
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedRows || selectedRows.length === 0}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2Icon size={20} />
            Delete Selected ({selectedRows?.length || 0})
          </button>
          <button
            onClick={handleAddCustomer}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            Add Customer
          </button>
        </div>
      </div>

      <div className="text-gray-600 w-1/4 w-max-1/4">
        <MultiSelectDropdown
                                           options={cutomerFilters}
                                           selectedOptions={customerFilters}
          onChange={setCustomerFilters}
          placeholder="Select Filters"
          heading=""
                                       />
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-4">
        {loading && <div className="p-4 text-sm text-gray-500">Loading customers...</div>}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <GenericTable
            columns={columns}
            data={data}
            rowActions={rowActions}
            defaultSort={{ key: 'name', direction: 'ascending' }}
            enableRowSelection={true}
            onRowSelect={handleRowSelect}
            selectedRows={selectedRows}
          />
        )}
      </div>
      <Modal isOpen={isAddServiceModalOpen} onClose={handleCloseModals} title="Add Customer">
        <CustomerForm />
      </Modal>

      <Modal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} title="WhatsApp Promotion">
        <WhatsAppPromotion
          selectedCustomers={selectedRows || []}
          onClose={() => setIsWhatsAppModalOpen(false)}
        />
      </Modal>
      <Modal isOpen={isSMSPromotionModalOpen} onClose={() => setIsSMSPromotionModalOpen(false)} title="SMS Promotion">
        <SmsPromotion
          selectedCustomers={selectedRows || []}
          onClose={() => setIsSMSPromotionModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomersToDelete([]);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Do you want to delete ${customersToDelete.length === 1 ? 'this customer' : `${customersToDelete.length} customers`} ? This action cannot be undone.`}
      />

  {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        title={drawerTitle}
      >
        {drawerContent}
      </Drawer>

    </div>
  );
};

export default Customers;