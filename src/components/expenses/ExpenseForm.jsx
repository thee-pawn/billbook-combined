import React, { useState, useEffect } from 'react';
import { InputField, SelectField, Button, FormSection, TextAreaField } from '@components/common/FormElements';
import { expensesApi, staffApi } from '../../apis/APIs';
import { FileTextIcon, ImageIcon, FileIcon } from "lucide-react";

// --- Mock Data ---
// Using real staff API now instead of mock data

const paymentMethods = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Debit Card', label: 'Debit Card' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Company Account', label: 'Company Account' }
];

const expenseCategories = [
  { value: 'Travel', label: 'Travel' },
  { value: 'Meals', label: 'Meals' },
  { value: 'Supplies', label: 'Supplies' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Software', label: 'Software' },
  { value: 'Training', label: 'Training' },
  { value: 'Other', label: 'Other' }
];

// --- Helper Icons (Optional, for visual flair) ---
const UploadIcon = ({ className = "w-5 h-5 mr-2" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
         <div className="flex-shrink-0 flex justify-between items-center sticky top-0 bg-white z-10 p-4 border-b"> 
            <h3 className="text-lg font-semibold text-gray-900">Receipt - {expenseName}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
         <div className="flex-grow p-4 overflow-y-auto">
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
                      <p className="text-gray-600">Receipt file: {receiptId}</p>
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
        </div>
      </div>
    </div>
  );
};

// --- Add Expense Form Component ---
function ExpenseForm({ initialData = null, onSave, isViewOnly = false, onApprove = null, onReject = null, showApprovalButtons = false }) {
  // State for form fields
  const [title, setTitle] = useState(initialData?.expenseName || '');
  const [employeeId, setEmployeeId] = useState(initialData?.employee?.id || '');
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '');
  const [amount, setAmount] = useState(initialData?.amount ? initialData.amount.toString() : '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || '');
  const [receipt, setReceipt] = useState(null); // State for the file object
  const [category, setCategory] = useState(initialData?.category || '');
  const [formErrors, setFormErrors] = useState({});
  const [description, setDescription] = useState(initialData?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptModal, setReceiptModal] = useState({ open: false, receiptId: null, expenseName: null });
  const [approvalComments, setApprovalComments] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Mock store ID - in real app this would come from context/props
  const STORE_ID = "99f2c0af-6a83-4bd5-b367-25ce1d5c75a2";

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await staffApi.getStaff(STORE_ID);
        if (response.success && response.data) {
          setEmployees(response.data);
        } 
      } catch (error) {
        console.error('Error fetching employees:', error);
        // Fallback to mock data if API fails
        
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  // Update form fields when initialData changes (for editing different expenses)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.expenseName || '');
      setEmployeeId(initialData.employee?.id || '');
      setDate(initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setPaymentMethod(initialData.paymentMethod || '');
      setCategory(initialData.category || '');
      setDescription(initialData.description || '');
      // Reset receipt file and approval comments when switching expenses
      setReceipt(null);
      setApprovalComments('');
      setFormErrors({});
      
      // Clear file input
      const fileInput = document.getElementById('receipt-upload');
      if (fileInput) fileInput.value = '';
    } else {
      // Reset form for new expense
      setTitle('');
      setEmployeeId('');
      setDate('');
      setAmount('');
      setPaymentMethod('');
      setCategory('');
      setDescription('');
      setReceipt(null);
      setApprovalComments('');
      setFormErrors({});
      
      // Clear file input
      const fileInput = document.getElementById('receipt-upload');
      if (fileInput) fileInput.value = '';
    }
  }, [initialData]);

  // Generate employee options for select field
  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: emp.name
  }));

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    } else {
      setReceipt(null);
    }
  };

  // Basic form validation
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Expense name is required';
    if (!employeeId) errors.employeeId = 'Employee selection is required';
    if (!date) errors.date = 'Date is required';
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) errors.amount = 'Valid amount is required';
    if (!paymentMethod) errors.paymentMethod = 'Payment method is required';
    if (!category) errors.category = 'Category is required';
    if (!description.trim()) errors.description = 'Description is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }

    if (!onSave) {
        console.error("No onSave callback provided");
        return;
    }

    setIsSubmitting(true);

    try {
        // Prepare the expense data
        const expenseData = {
            expenseName: title,
            employeeId: employeeId,
            date: date,
            amount: parseFloat(amount),
            paymentMethod: paymentMethod,
            category: category,
            description: description
        };

        // Call the onSave callback with the data and receipt file
        await onSave(expenseData, receipt);

        // Reset form after successful submission
        setTitle('');
        setEmployeeId('');
        setDate('');
        setAmount('');
        setPaymentMethod('');
        setReceipt(null);
        setCategory('');
        setDescription('');
        setFormErrors({});

        // Reset file input
        const fileInput = document.getElementById('receipt-upload');
        if (fileInput) fileInput.value = '';

    } catch (error) {
        console.error('Error submitting expense:', error);
        // You could set an error state here to show to the user
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <div className="p-4 ">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSection>
            {/* Title */}
            <InputField
              label="Expense Name"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter expense title"
              required={!isViewOnly}
              disabled={isViewOnly}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Date"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required={!isViewOnly}
                disabled={isViewOnly}
              />

            {/* Employee */}
            <SelectField
              label="Employee"
              name="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              options={loadingEmployees ? [{ value: '', label: 'Loading employees...' }] : employeeOptions}
              placeholder={loadingEmployees ? "Loading employees..." : "Select Employee"}
              required={!isViewOnly}
              disabled={isViewOnly || loadingEmployees}
              />
              
              <SelectField
              label="Category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={expenseCategories}
              placeholder="Select Category"
              required={!isViewOnly}
              disabled={isViewOnly}
            />

            {/* Date and Amount (Side-by-side) */}
            
              
              <InputField
                label="Amount"
                name="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required={!isViewOnly}
                disabled={isViewOnly}
              />
            </div>

            {/* Payment Method */}
            <SelectField
              label="Payment Method"
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={paymentMethods}
              placeholder="Select Payment Method"
              required={!isViewOnly}
              disabled={isViewOnly}
            />
            <TextAreaField
              label="Description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              required={!isViewOnly}
              disabled={isViewOnly}
            />

            {/* Receipt Section */}
            {isViewOnly && initialData?.receiptId ? (
              // View mode - show receipt link
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Receipt</label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <button
                    type="button"
                    onClick={() => setReceiptModal({ 
                      open: true, 
                      receiptId: initialData.receiptId,
                      expenseName: initialData.expenseName 
                    })}
                    className="text-teal-600 hover:text-teal-800 underline flex items-center space-x-2"
                  >
                    <FileTextIcon className="w-4 h-4" />
                    <span>View Receipt</span>
                  </button>
                </div>
              </div>
            ) : !isViewOnly && (
              // Edit/Create mode - show file upload
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Attach Receipt</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="receipt-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500 text-left"
                      >
                        <span>Upload a file</span>
                        <input id="receipt-upload" name="receipt-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf"/>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    {receipt ? (
                      <p className="text-xs text-gray-500 pt-1">Selected: {receipt.name}</p>
                    ) : (
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    )}
                  </div>
                </div>
                {formErrors.receipt && <p className="text-red-500 text-xs mt-1">{formErrors.receipt}</p>}
              </div>
            )}

            {/* Show additional view-only fields */}
            {isViewOnly && initialData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      initialData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      initialData.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {initialData.status?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-700">{new Date(initialData.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {/* {initialData.approvedBy && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Approved By</label>
                      <p className="text-sm text-gray-700">{initialData.approvedBy}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Approved At</label>
                      <p className="text-sm text-gray-700">{new Date(initialData.approvedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )} */}
              </div>
            )}

            {/* Submit Button - only show if not in view mode */}
            {!isViewOnly && (
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-1/3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (initialData ? 'Update Expense' : 'Add Expense')}
                </Button>
              </div>
            )}

            {/* Approval/Rejection Buttons - only show for pending expenses when editing */}
            {!isViewOnly && showApprovalButtons && initialData?.status === 'pending' && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Expense Approval</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    PENDING APPROVAL
                  </span>
                </div>
                
                {/* Comments for approval/rejection */}
                <div className="mb-4">
                  <TextAreaField
                    label="Comments (Optional)"
                    name="approvalComments"
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    placeholder="Add comments for approval or rejection..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => onApprove && onApprove(approvalComments || "Expense approved for processing")}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Approve Expense'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onReject && onReject(approvalComments || "Expense rejected")}
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Reject Expense'}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Once approved or rejected, this expense cannot be edited further.
                </p>
              </div>
            )}
          </FormSection>
        </form>

        {/* Receipt Modal */}
        <ReceiptModal
          isOpen={receiptModal.open}
          onClose={() => setReceiptModal({ open: false, receiptId: null, expenseName: null })}
          receiptId={receiptModal.receiptId}
          expenseName={receiptModal.expenseName}
        />
      </div>
    </div>
  );
}

export default ExpenseForm;
