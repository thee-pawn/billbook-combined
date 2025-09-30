import React, { useState, useEffect } from "react";
import "./../../css/Customer.css";
import GenericTable from "@components/common/GenericTable";
import { ArrowLeftRightIcon, Edit, Edit2, Edit2Icon, EyeIcon, Trash2Icon, X } from "lucide-react";
import AddStaff from "./AddStaff";
import { staffApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';
import { DeleteConfirmationModal } from '@components/common/DeleteConfirmationModal';
import InlineStaffAttendance from "./InlineStaffAttendance";
import StaffSalaryData from "./StaffSalarayData";
import FineManagement from "./FineManagement";
import OvertimeManagement from "./OvertimeManagement";
import EmployeeRevenueReport from "./EmployeeRevenueReport";
import TransferStaff from "./StaffTransfer";

// Placeholder local fallback if API fails (empty by default)
const initialStaffMembers = [];

const Staff = () => {
	const { currentStore } = useStore();
	const [showForm, setShowForm] = useState(false);
	const [data, setData] = useState([]);
	const [formData, setFormData] = useState({});
	const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

	const [staffMembers, setStaffMembers] = useState(initialStaffMembers);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [selectedStaff, setSelectedStaff] = useState(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [formMode, setFormMode] = useState('create'); // 'create' | 'edit' | 'view'
	const [drawerTab, setDrawerTab] = useState("salary");
	const [deleteModal, setDeleteModal] = useState({ open: false, staff: null });
	const [transferModal, setTransferModal] = useState({ open: false, staff: null });
	const [selectedStore, setSelectedStore] = useState("");

	useEffect(() => {
		if (!currentStore?.id) return;
		let active = true;
		const loadStaff = async () => {
			setLoading(true); setError(null);
			try {
				const res = await staffApi.getStaff(currentStore.id);
				if (active && res.success) {
					setStaffMembers(res.data);
				}
			} catch (err) {
				if (active) setError(err.message || 'Failed to load staff');
			} finally { if (active) setLoading(false); }
		};
		loadStaff();
		return () => { active = false; };
	}, [currentStore?.id]);

	const handleAddCustomerClick = () => {
		setSelectedStaff(null);
		setFormMode('create');
		setIsAddServiceModalOpen(true);
	};

	const handleCloseModals = () => {
		setIsAddServiceModalOpen(false);
	};

	const handleCloseForm = () => {
		setShowForm(false);
	};

	const handleAddCustomer = (newCustomer) => {
		setData([...data, newCustomer]);
		handleCloseForm();
	};

	const onEdit = (record) => {
		setShowForm(true);
		setFormData(record);
	};

	const handleRemoveCustomer = async (customerId) => {
		try {
			const response = await fetch(`http://localhost:8080/products/${customerId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			setData((prevData) => prevData.filter((customer) => customer.id !== customerId));
		} catch (error) {
			console.error("Error deleting customer:", error);
		}
	};

	const storeOptions = [
		{ value: "store1", label: "Store 1" },
		{ value: "store2", label: "Store 2" },
		{ value: "store3", label: "Store 3" },
	];

	// Extract unique values for filters
	const uniqueDesignations = [...new Set(staffMembers.map(item => item.designation).filter(Boolean))];

	// Table columns configuration
	const columns = [
		{
			id: "name",
			header: "Name",
			accessor: "name",
			sortable: true,
			searchable: true,
		},
		{
			id: "contact",
			header: "Phone",
			accessor: "contact",
			searchable: true,
		},
		{
			id: "designation",
			header: "Designation",
			accessor: "designation",
			filterable: true,
			filterType: "custom",
			filterRenderer: (value, onChange) => {
				const options = uniqueDesignations;
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
						<div className="text-sm font-medium text-gray-700 mb-1">Select Designation</div>
						{options.map(option => (
							<div key={option} className="flex items-center space-x-2">
								<input
									type="checkbox"
									id={`designation-${option}`}
									checked={selectedOptions.includes(option)}
									onChange={() => handleToggleOption(option)}
									className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
								/>
								<label htmlFor={`designation-${option}`} className="text-sm text-gray-700">
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
			id: "dateOfJoining",
			header: "Date of Joining",
			accessor: "dateOfJoining",
			filterable: true,
			filterType: "dateRange",
			cellRenderer: (row, value) => {
				if (!value) return '-';
				const date = new Date(value);
				return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
			},
		},
		{
			id: 'status',
			header: 'Status',
			accessor: 'status',
			filterable: true,
			filterType: 'select',
			options: ['active','inactive'],
			cellRenderer: (row, value) => <span className={`px-2 py-1 rounded text-xs font-medium ${value==='active'?'bg-green-100 text-green-700':'bg-gray-200 text-gray-600'}`}>{value}</span>
		}
	];

	// Row actions for GenericTable
	const rowActions = [
		{
			icon: <EyeIcon color="blue" size={22} />,
			title: "View",
			onClick: (row) => {
				setSelectedStaff(row);
				setFormMode('view');
				setIsAddServiceModalOpen(true);
			},
		},
		{
			icon: <Edit color="green" size={22} />,
			title: "Edit",
			onClick: (row) => {
				setSelectedStaff(row);
				setFormMode('edit');
				setIsAddServiceModalOpen(true);
			},
		},
		{
			icon: <ArrowLeftRightIcon size={22} />,
			title: "Transfer",
			onClick: (row) => {
				setSelectedStaff(row);
				setTransferModal({ open: true, staff: row });
			},
		},
		{
			icon: <Trash2Icon color="red" size={22} />,

			title: "Delete",
			onClick: (row) => {
				setSelectedStaff(row);
				setDeleteModal({ open: true, staff: row });
			},
		},
	];

	// Delete staff
	const handleDelete = () => {
		setStaffMembers((prev) => prev.filter((s) => s.id !== deleteModal.staff.id));
		setDeleteModal({ open: false, staff: null });
	};

	// Transfer staff
	const handleTransfer = () => {
		if (!selectedStore) return;

		// Update staff member's store
		setStaffMembers((prev) =>
			prev.map((staff) =>
				staff.id === transferModal.staff.id ? { ...staff, storeId: selectedStore } : staff
			)
		);

		setTransferModal({ open: false, staff: null });
		setSelectedStore("");
	};

	// Update attendance for staff member
	const handleUpdateAttendance = (staffId, date, attendanceData) => {
		setStaffMembers((prev) =>
			prev.map((staff) => {
				if (staff.id === staffId) {
					const updatedAttendance = staff.attendance.filter((record) => record.date !== date);
					updatedAttendance.push({ date, ...attendanceData, revenue: { service: 0, product: 0, membership: 0 } });
					return { ...staff, attendance: updatedAttendance };
				}
				return staff;
			})
		);
	};

	return (
		<div className="p-4 space-y-6">
			<div className="customer-header">
        <div className="text-3xl font-bold text-teal-700 text-left  mb-4 p-0">Staff</div>
        <button
          onClick={handleAddCustomerClick}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
        >
          Add Staff
        </button>
      </div>

			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				{loading && <div className="p-4 text-sm text-gray-500">Loading staff...</div>}
				{error && <div className="p-4 text-sm text-red-600">{error}</div>}
				<GenericTable
					columns={columns}
					data={staffMembers}
					rowActions={rowActions}
					defaultSort={{ key: "name", direction: "ascending" }}
				/>
			</div>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={deleteModal.open}
				onClose={() => setDeleteModal({ open: false, staff: null })}
				onConfirm={handleDelete}
				title="Confirm Deletion"
				message={`Are you sure you want to delete ${deleteModal.staff?.name || 'this staff member'}?`}
			/>

			{/* Transfer Modal */}
			{transferModal.open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40">
					<TransferStaff handleClose={() => setTransferModal({ open: false })} />
				</div>
			)}

			{/* Drawer for Staff Details */}
			{drawerOpen && selectedStaff && (
				<div className="w-full fixed inset-0 z-250 flex justify-end">
					<div
						className=" bg-opacity-40 flex-1"
						onClick={() => setDrawerOpen(false)}
					></div>
					<div className="w-1/2 bg-white h-full shadow-2xl flex flex-col animate-slidein relative">
						{/* Nav Bar styled like Lists */}
						<div className="flex flex-row items-center justify-between gap-4 mb-4 p-2 border-b border-gray-200 bg-white sticky top-0 z-10">
							<div className="flex rounded-xl border border-gray-200 overflow-hidden shadow-sm border-gray-300 font-bold text-teal-700 w-2/3">
								<button
									onClick={() => setDrawerTab('attendance')}
									className={`flex-1 py-3 px-4 text-center text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-300 ease-in-out border-r border-gray-300 ${drawerTab === 'attendance' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} rounded-l-lg`}
								>
									Attendance
								</button>
								<button
									onClick={() => setDrawerTab('salary')}
									className={`flex-1 py-3 px-4 text-center text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-300 ease-in-out border-r border-gray-300 ${drawerTab === 'salary' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} `}
								>
									Salary
								</button>

								<button
									onClick={() => setDrawerTab('revenue')}
									className={`flex-1 py-3 px-4 text-center text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-300 ease-in-out border-r border-gray-300 ${drawerTab === 'revenue' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} `}
								>
									Revenue
								</button>
								<button
									onClick={() => setDrawerTab('fine')}
									className={`flex-1 py-3 px-4 text-center text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-300 ease-in-out border-r border-gray-300 ${drawerTab === 'fine' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} `}
								>
									Fine
								</button>
								<button
									onClick={() => setDrawerTab('overtime')}
									className={`flex-1 py-3 px-4 text-center text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-300 ease-in-out border-r border-gray-300 ${drawerTab === 'overtime' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} rounded-r-lg`}
								>
									Overtime
								</button>
							</div>
							<button
								onClick={() => setDrawerOpen(false)}
								className="text-gray-400 hover:text-gray-700"
							>
								<X size={20} />
							</button>
						</div>
						{/* Drawer Content */}
						<div className="flex-1 overflow-y-auto px-16 py-4">
							<div className="flex flex-row justify-between mb-4">
								<p className="text-lg font-bold">{selectedStaff.name} - <span className="font-semibold text-sm">[{selectedStaff.designation}]</span></p>
								{/* <p className="text-gray-600">{selectedStaff.designation}</p> */}
								<p className="text-gray-500 text-md">{selectedStaff.contact}</p>
							</div>

							{drawerTab === "salary" && (
								<div className="text-center text-gray-500 mt-8">
									<StaffSalaryData />
								</div>
							)}

							{drawerTab === "attendance" && (
								<div className="h-full">
									<InlineStaffAttendance
										staff={selectedStaff}
										onUpdateAttendance={handleUpdateAttendance}
									/>
								</div>
							)}
							{drawerTab === "fine" && (
								<div className="h-full">
									<FineManagement />
								</div>
							)}
							{drawerTab === "overtime" && (
								<div className="h-full">
									<OvertimeManagement />
								</div>
							)}

							{drawerTab === "revenue" && (
								<div className="text-center text-gray-500 mt-8">
									<EmployeeRevenueReport />
								</div>
							)}
						</div>
					</div>

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
			)}

			{/* Drawer for Add Staff */}
			{isAddServiceModalOpen && (
				<div className="w-full fixed inset-0 z-250 flex justify-end">
					<div
						className="bg-opacity-40 flex-1"
						onClick={handleCloseModals}
					></div>
					<div className="w-1/2 bg-white h-full shadow-2xl flex flex-col animate-slidein relative">
						<div className="flex items-center justify-between border-b px-4 py-3 sticky top-0 bg-white z-10">
							<h3 className="text-lg font-semibold">Add Staff</h3>
							<button
								onClick={handleCloseModals}
								className="text-gray-400 hover:text-gray-700"
							>
								<X size={20} />
							</button>
						</div>
						<div className="flex-1 overflow-y-auto p-4">
							<AddStaff
								isOpen={isAddServiceModalOpen}
								title={formMode === 'create' ? 'Add Staff' : formMode === 'edit' ? 'Edit Staff' : 'View Staff'}
								onClose={() => { handleCloseModals(); setSelectedStaff(null); setFormMode('create'); }}
								editData={selectedStaff}
								mode={formMode}
									onAddStaff={async (payload) => {
									if (formMode === 'view') return; // safety
									try {
										if (!currentStore?.id) throw new Error('No store selected');
										if (selectedStaff) {
											// update flow
											const res = await staffApi.updateStaff(currentStore.id, selectedStaff.staffId || selectedStaff.id, payload);
											const list = await staffApi.getStaff(currentStore.id);
											if (list.success) setStaffMembers(list.data);
										} else {
											const res = await staffApi.createStaff(currentStore.id, payload);
											if (res?.data?.staff) {
												setStaffMembers(prev => [...prev, res.data.staff]);
											} else {
												const list = await staffApi.getStaff(currentStore.id);
												if (list.success) setStaffMembers(list.data);
											}
										}
										handleCloseModals();
									} catch (err) {
										console.error('Save staff failed', err);
									}
								}}
							/>
						</div>
					</div>
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
			)}
		</div>
	);
};

export default Staff;