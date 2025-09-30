import React, { useState, useMemo, useEffect } from 'react';
import { DeleteConfirmationModal } from '@components/common/DeleteConfirmationModal';
import ExpenseForm from './ExpenseForm';
import { X, EyeIcon, EditIcon, Trash2Icon, FileTextIcon, ImageIcon, FileIcon } from "lucide-react";
import GenericTable from "@components/common/GenericTable";
import { expensesApi } from '../../apis/APIs';
// Assuming Tailwind CSS is set up in your project
// Hypothetical import for the Billing component modal - replace with actual path
// import BillingComponentModal from './BillingComponentModal'; // Or however you structure it


// --- Modal Component Definition ---
const Modal = ({ isOpen, onClose, title, children, widthClass = 'w-1/2' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${widthClass} max-h-[90vh] overflow-y-auto flex flex-col`}>
         <div className="flex-shrink-0 flex justify-between items-center sticky top-0 bg-white z-10 p-4 border-b"> 
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
         <div className="flex-grow p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Receipt Modal Component ---
const ReceiptModal = ({ isOpen, onClose, receiptId, expenseName }) => {
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && receiptId) {
      fetchReceiptFile();
    }
    return () => {
      if (receiptUrl) {
        URL.revokeObjectURL(receiptUrl);
      }
    };
  }, [isOpen, receiptId]);

  const fetchReceiptFile = async () => {
    try {
      setLoading(true);
      setError(null);
      const blob = await expensesApi.getReceiptFile(receiptId);
      const url = URL.createObjectURL(blob);
      setReceiptUrl(url);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setError('Failed to load receipt file');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FileIcon className="w-6 h-6" />;
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <ImageIcon className="w-6 h-6" />;
    }
    return <FileTextIcon className="w-6 h-6" />;
  };

  const isImage = (filename) => {
    if (!filename) return false;
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Receipt - ${expenseName}`} widthClass="w-3/4 max-w-4xl">
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <span className="ml-2 text-gray-600">Loading receipt...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {receiptUrl && !loading && !error && (
          <div className="text-center">
            {isImage(receiptId) ? (
              <img 
                src={receiptUrl} 
                alt="Receipt" 
                className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                style={{ maxHeight: '70vh' }}
              />
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="flex flex-col items-center space-y-4">
                  {getFileIcon(receiptId)}
                  {/* <p className="text-gray-600">Receipt file: {receiptId}</p> */}
                  <a 
                    href={receiptUrl} 
                    download={receiptId}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Download Receipt
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// --- Drawer Component ---
const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0  bg-opacity-50  z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 border-l border-gray-300 h-full bg-white shadow-lg z-300 transform transition-transform duration-300 ease-in-out animate-slidein ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: 'min(800px, 95vw)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <p className="text-lg font-semibold text-teal-700">{title}</p>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          {children}
        </div>
      </div>
    </>
  );
};


// Mock store ID - in real app this would come from context/props
const STORE_ID = "99f2c0af-6a83-4bd5-b367-25ce1d5c75a2";

// --- Billing History Component ---
function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerTitle, setDrawerTitle] = useState('Add Expense');
    const [deleteModal, setDeleteModal] = useState({ open: false, expense: null });
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [receiptModal, setReceiptModal] = useState({ open: false, receiptId: null, expenseName: null });

    // Fetch expenses on component mount
    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await expensesApi.getExpenses(STORE_ID);
            if (response.success) {
                setExpenses(response.data.expenses);
                setSummary(response.data.summary);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique categories and payment methods for filters from current data
    const uniqueCategories = [...new Set(expenses.map(item => item.category))];
    const uniquePaymentMethods = [...new Set(expenses.map(item => item.paymentMethod))];

    // Table columns configuration
    const columns = [
        {
            id: "expenseName",
            header: "Expense Name",
            accessor: "expenseName",
            sortable: true,
            searchable: true,
            width: '20%'
        },
        {
            id: "employee",
            header: "Employee",
            accessor: "employee",
            sortable: true,
            searchable: true,
            cellRenderer: (row, value) => {
                if (!value) return 'N/A';
                if (typeof value === 'string') return value;
                if (typeof value === 'object' && value.name) return value.name;
                return 'N/A';
            },
            width: '15%'
        },
        {
            id: "date",
            header: "Date",
            accessor: "date",
            sortable: true,
            filterable: true,
            filterType: "dateRange",
            cellRenderer: (row, value) => {
                const date = new Date(value);
                return date.toLocaleDateString();
            },
            width: '12%'
        },
        {
            id: "category",
            header: "Category",
            accessor: "category",
            sortable: true,
            filterable: true,
            filterType: "custom",
            filterRenderer: (value, onChange) => {
                const options = uniqueCategories;
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
                        <div className="text-sm font-medium text-gray-700 mb-1">Select Category</div>
                        {options.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`category-${option}`}
                                    checked={selectedOptions.includes(option)}
                                    onChange={() => handleToggleOption(option)}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <label htmlFor={`category-${option}`} className="text-sm text-gray-700">
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
            },
            width: '12%'
        },
        {
            id: "amount",
            header: "Amount",
            accessor: "amount",
            sortable: true,
            cellRenderer: (row, value) => `₹${value.toFixed(2)}`,
            width: '10%'
        },
        {
            id: "paymentMethod",
            header: "Payment Method",
            accessor: "paymentMethod",
            sortable: true,
            filterable: true,
            filterType: "custom",
            filterRenderer: (value, onChange) => {
                const options = uniquePaymentMethods;
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
                        <div className="text-sm font-medium text-gray-700 mb-1">Select Payment Method</div>
                        {options.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`payment-${option}`}
                                    checked={selectedOptions.includes(option)}
                                    onChange={() => handleToggleOption(option)}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <label htmlFor={`payment-${option}`} className="text-sm text-gray-700">
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
            },
            width: '12%'
        },
        {
            id: "status",
            header: "Status",
            accessor: "status",
            sortable: true,
            cellRenderer: (row, value) => {
                const statusColors = {
                    'pending': 'bg-yellow-100 text-yellow-800',
                    'approved': 'bg-green-100 text-green-800',
                    'rejected': 'bg-red-100 text-red-800'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
                        {value?.toUpperCase() || 'N/A'}
                    </span>
                );
            },
            width: '10%'
        },
        {
            id: "description",
            header: "Description",
            accessor: "description",
            sortable: false,
            searchable: true,
            cellRenderer: (row, value) => {
                if (!value) return 'N/A';
                return value.length > 50 ? `${value.substring(0, 50)}...` : value;
            },
            width: '9%'
        }
    ];

    // Row actions for GenericTable
    const rowActions = [
        {
            icon: <EyeIcon size={22} color="blue" />,
            title: "View",
            onClick: (row) => {
                setSelectedExpense(row);
                setDrawerTitle('View Expense Details');
                setIsDrawerOpen(true);
            },
        },
        {
            icon: <EditIcon size={22} color="green" />,
            title: "Edit",
            onClick: (row) => {
                setSelectedExpense(row);
                setDrawerTitle('Edit Expense');
                setIsDrawerOpen(true);
            },
        },
        {
            icon: <Trash2Icon size={22} color="red" />,
            title: "Delete",
            onClick: (row) => {
                setDeleteModal({ open: true, expense: row });
            },
        },
    ];

    // Close drawer
    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedExpense(null);
    };

    // Handle add expense
    const handleAddExpense = () => {
        setSelectedExpense(null);
        setDrawerTitle('Add Expense');
        setIsDrawerOpen(true);
    };

    // Handle delete expense
    const handleDelete = async () => {
        try {
            await expensesApi.deleteExpense(STORE_ID, deleteModal.expense.id);
            setExpenses((prev) => prev.filter((e) => e.id !== deleteModal.expense.id));
            setDeleteModal({ open: false, expense: null });
        } catch (error) {
            console.error('Error deleting expense:', error);
            // You might want to show an error message to the user here
        }
    };

    // Handle approve expense
    const handleApproveExpense = async (comments) => {
        if (!selectedExpense) return;
        
        try {
            await expensesApi.approveExpense(STORE_ID, selectedExpense.id, comments);
            // Refresh the expenses list to get updated status
            await fetchExpenses();
            closeDrawer();
        } catch (error) {
            console.error('Error approving expense:', error);
            // You might want to show an error message to the user here
        }
    };

    // Handle reject expense
    const handleRejectExpense = async (comments) => {
        if (!selectedExpense) return;
        
        try {
            await expensesApi.rejectExpense(STORE_ID, selectedExpense.id, comments);
            // Refresh the expenses list to get updated status
            await fetchExpenses();
            closeDrawer();
        } catch (error) {
            console.error('Error rejecting expense:', error);
            // You might want to show an error message to the user here
        }
    };

    return (
        <div className="p-8 space-y-6">
            {/* Summary Cards */}
            {/* {summary && (
                <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                        <p className="text-2xl font-bold text-gray-900">{summary.totalExpenses}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                        <p className="text-2xl font-bold text-green-600">₹{summary.totalAmount}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                        <p className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                        <p className="text-2xl font-bold text-green-600">{summary.approvedCount}</p>
                    </div>
                </div>
            )} */}

            <div className="customer-header">
                <div className="text-3xl font-bold text-teal-700 text-left mb-4 p-0">Expenses</div>
                <button
                    onClick={handleAddExpense}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                >
                    Add Expense
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                        <span className="ml-2 text-gray-600">Loading expenses...</span>
                    </div>
                ) : (
                    <GenericTable
                        columns={columns}
                        data={expenses}
                        rowActions={rowActions}
                        defaultSort={{ key: "date", direction: "descending" }}
                    />
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, expense: null })}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${deleteModal.expense?.expenseName}"?`}
            />

            {/* Receipt Modal */}
            <ReceiptModal
                isOpen={receiptModal.open}
                onClose={() => setReceiptModal({ open: false, receiptId: null, expenseName: null })}
                receiptId={receiptModal.receiptId}
                expenseName={receiptModal.expenseName}
            />

            {/* Drawer for Expense Form */}
            <Drawer 
                isOpen={isDrawerOpen} 
                onClose={closeDrawer} 
                title={drawerTitle}
            >
                <ExpenseForm 
                    initialData={selectedExpense}
                    isViewOnly={drawerTitle === 'View Expense Details'}
                    showApprovalButtons={drawerTitle === 'Edit Expense' && selectedExpense?.status === 'pending'}
                    onApprove={handleApproveExpense}
                    onReject={handleRejectExpense}
                    onSave={async (expenseData, receiptFile) => {
                        try {
                            if (selectedExpense && drawerTitle !== 'View Expense Details') {
                                // Update existing expense
                                await expensesApi.updateExpense(STORE_ID, selectedExpense.id, expenseData, receiptFile);
                            } else if (drawerTitle !== 'View Expense Details') {
                                // Add new expense
                                await expensesApi.createExpense(STORE_ID, expenseData, receiptFile);
                            }
                            // Refresh the expenses list if not just viewing
                            if (drawerTitle !== 'View Expense Details') {
                                await fetchExpenses();
                            }
                            closeDrawer();
                        } catch (error) {
                            console.error('Error saving expense:', error);
                            // You might want to show an error message to the user here
                        }
                    }}
                />
            </Drawer>

            {/* Animation style for drawer */}
            <style jsx global>{`
                @keyframes slidein {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                .animate-slidein {
                    animation: slidein 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}



export default Expenses;
