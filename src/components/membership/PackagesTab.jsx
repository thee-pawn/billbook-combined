import React, { useEffect, useMemo, useState } from 'react';
import GenericTable from '@components/common/GenericTable';
import { EyeIcon, EditIcon, Trash2 } from 'lucide-react';
import PackageFormComponent from './PackageFormComponent';
import { Drawer } from '@components/common/Drawer';
import { packageApi } from '../../apis/packageApi';
import { useStore } from '../login/StoreContext';
import { DeleteConfirmationModal } from '@components/common/DeleteConfirmationModal';

const PackagesTab = () => {
	const { currentStore } = useStore();
	const [rows, setRows] = useState([]);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selected, setSelected] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [drawerMode, setDrawerMode] = useState('create'); // 'view' | 'edit' | 'create'
	const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

	const formatValidity = (y, m, d) => {
		const parts = [];
		if (Number(y) > 0) parts.push(`${y} ${Number(y) === 1 ? 'year' : 'years'}`);
		if (Number(m) > 0) parts.push(`${m} ${Number(m) === 1 ? 'month' : 'months'}`);
		if (Number(d) > 0) parts.push(`${d} ${Number(d) === 1 ? 'day' : 'days'}`);
		return parts.join(', ') || '—';
	};

	useEffect(() => { loadPackages(); }, [currentStore?.id]);

	const columns = [
		{ id: 'name', header: 'Package', accessor: 'name', width: '40%' },
		{ id: 'price', header: 'Price', accessor: 'price', width: '20%' },
		{ id: 'status', header: 'Status', accessor: 'status', width: '20%' },
		{ id: 'validity', header: 'Validity', accessor: 'validity', width: '20%' },
	];

	// row actions are defined later as `actions` to include handlers that fetch full details

	const handleSave = async (values) => {
		if (!currentStore?.id) return;
		// Map PackageFormComponent values to API payload
		const payload = {
			packageName: values.name || values.packageName || '',
			description: values.description || '',
			price: Number(values.price || 0),
			validity: {
				years: Number(values.validity?.years || 0),
				months: Number(values.validity?.months || 0),
				days: Number(values.validity?.days || 0),
			},
			services: Array.isArray(values.services) ? values.services.filter(s => s.serviceId).map(s => ({
				serviceId: s.serviceId,
				quantityType: s.quantityType === 'hours' ? 'hours' : 'sessions',
				qty: s.quantityType === 'hours' ? Number(s.hours || 0) : Number(s.sessions || 0),
				type: 'included',
			})) : [],
			status: 'active',
		};

		if (drawerMode === 'edit' && selected?.id) {
			await packageApi.updatePackage(currentStore.id, selected.id, payload);
		} else {
			await packageApi.createPackage(currentStore.id, payload);
		}
		// Reload packages
		await loadPackages();
		setIsDrawerOpen(false);
	};

	const mapPackageDetailToForm = (raw) => {
		if (!raw) return null;
		const servicesRaw = raw.services || raw.package_services || [];
		let lineId = 1;
		const services = servicesRaw.map(s => {
			const quantityType = (s.quantity_type || s.quantityType || '').toLowerCase() === 'hours' ? 'hours' : 'sessions';
			const qty = Number(s.qty || s.quantity || 0);
			return {
				id: lineId++,
				service: s.service_name || s.serviceName || '',
				serviceId: s.service_id || s.serviceId || '',
				servicePrice: s.service_price || s.price || '',
				serviceDuration: s.service_duration || s.duration || '',
				serviceCategory: s.service_category || s.category || '',
				quantityType,
				sessions: quantityType === 'sessions' ? qty : 1,
				hours: quantityType === 'hours' ? qty : 1,
				discountType: 'Percentage',
				discountValue: 0,
			};
		});

		return {
			id: raw.id,
			packageName: raw.packageName || raw.name || '',
			description: raw.description || '',
			price: raw.price || 0,
			validity: {
				years: Number(raw.validity_years || raw.validity?.years || 0),
				months: Number(raw.validity_months || raw.validity?.months || 0),
				days: Number(raw.validity_days || raw.validity?.days || 0),
			},
			services,
			_raw: raw,
		};
	};

	const handleView = async (row) => {
		setDrawerMode('view');
		if (!currentStore?.id) return;
		try {
			const res = await packageApi.getPackageById(currentStore.id, row.id);
			const raw = res?.data?.package || res?.data || null;
			setSelected(mapPackageDetailToForm(raw) || row);
		} catch (e) {
			setSelected(row);
		} finally {
			setIsDrawerOpen(true);
		}
	};

	const handleEdit = async (row) => {
		setDrawerMode('edit');
		if (!currentStore?.id) return setIsDrawerOpen(true);
		try {
			const res = await packageApi.getPackageById(currentStore.id, row.id);
			const raw = res?.data?.package || res?.data || null;
			setSelected(mapPackageDetailToForm(raw) || row);
		} catch (e) {
			setSelected(row);
		} finally {
			setIsDrawerOpen(true);
		}
	};

	const handleDelete = (row) => {
		setDeleteModal({ open: true, item: row });
	};

	// Rebuild row actions with handlers
	const actions = useMemo(() => ([
		{ icon: <EyeIcon className="text-blue-600" size={20} />, title: 'View', onClick: handleView },
		{ icon: <EditIcon className="text-green-600" size={20} />, title: 'Edit', onClick: handleEdit },
		{ icon: <Trash2 className="text-red-600" size={20} />, title: 'Delete', onClick: handleDelete },
	]), [currentStore?.id]);

	const loadPackages = async () => {
		if (!currentStore?.id) return;
		setLoading(true);
		setError('');
		try {
			const res = await packageApi.getPackages(currentStore.id, 1, 10);
			const list = res?.data?.packages || [];
			const mapped = list.map(p => ({
				id: p.id,
				name: p.package_name,
				price: p.price,
				status: p.status?.charAt(0).toUpperCase() + p.status?.slice(1),
				validity: formatValidity(p.validity_years, p.validity_months, p.validity_days),
				_raw: p,
			}));
			setRows(mapped);
		} catch (e) {
			setError(e?.message || 'Failed to load packages');
			setRows([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!currentStore?.id || !deleteModal.item?.id) { setDeleteModal({ open: false, item: null }); return; }
		try {
			await packageApi.deletePackage(currentStore.id, deleteModal.item.id);
			await loadPackages();
		} catch (e) {
			// optionally show toast
		} finally {
			setDeleteModal({ open: false, item: null });
		}
	};

	return (
		<div className=" space-y-6">
			<div className="customer-header flex flex-row justify-between items-center">
				<div className="text-3xl font-bold text-teal-700">Packages</div>
				<button onClick={() => { setSelected(null); setDrawerMode('create'); setIsDrawerOpen(true); }} className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md">Add Package</button>
			</div>
			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				<GenericTable columns={columns} data={rows} rowActions={actions} loading={loading} error={error} />
			</div>
			<Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={drawerMode === 'view' ? 'View Package' : (drawerMode === 'edit' ? 'Edit Package' : 'Add Package')}>
				<PackageFormComponent initialData={selected} onSave={handleSave} onCancel={() => setIsDrawerOpen(false)} readOnly={drawerMode === 'view'} />
			</Drawer>

			<DeleteConfirmationModal
				isOpen={deleteModal.open}
				onClose={() => setDeleteModal({ open: false, item: null })}
				onConfirm={handleDeleteConfirm}
				title="Confirm Deletion"
				message={`Are you sure you want to delete ${deleteModal.item?.name || 'this package'}?`}
			/>
		</div>
	);
};

export default PackagesTab;

