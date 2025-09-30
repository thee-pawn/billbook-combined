import React, { useMemo, useState, useEffect } from 'react';
import GenericTable from '@components/common/GenericTable';
import { EyeIcon, EditIcon, Trash2 } from 'lucide-react';
import MembershipFormComponent from './MembershipFormComponent';
import { membershipsApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';
import { Drawer } from '@components/common/Drawer';
import { DeleteConfirmationModal } from '@components/common/DeleteConfirmationModal';

const MembershipsTab = () => {
  const { currentStore } = useStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [drawerMode, setDrawerMode] = useState('create'); // create | view | edit
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  // Fetch memberships when component mounts or store changes
  useEffect(() => {
    if (currentStore?.id) {
      fetchMemberships();
    }
  }, [currentStore?.id]);

  const fetchMemberships = async () => {
    if (!currentStore?.id) return;

    try {
      setLoading(true);
      const response = await membershipsApi.getAll(currentStore.id);
      
      if (response?.data?.memberships) {
        // Transform API response to match table expectations
        const transformedMemberships = response.data.memberships.map(membership => ({
          id: membership.id,
          name: membership.name,
          price: `$${parseFloat(membership.price || 0).toFixed(2)}`,
          status: membership.status,
          description: membership.description,
          validity: membership.validity,
          // Keep original data for editing
          _raw: membership
        }));
        setRows(transformedMemberships);
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const mapMembershipDetailToForm = (raw) => {
    if (!raw) return null;
    const validity = raw.validity || raw.validity_json || {}; // adjust if API returns differently
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description || '',
      price: raw.price || 0,
      validity: {
        years: validity.years ?? validity.validity_years ?? 0,
        months: validity.months ?? validity.validity_months ?? 0,
        days: validity.days ?? validity.validity_days ?? 0,
      },
      walletBalance: raw.walletBalance || raw.wallet_balance || 0,
      percentage: raw.overallDiscount?.value || raw.percentage || 0,
      totalDiscountType: raw.overallDiscount?.type || 'percentage',
      crossServiceDiscountType: raw.serviceDiscount?.type || 'percentage',
      crossServiceDiscountValue: raw.serviceDiscount?.value || 0,
      crossSelectedServices: raw.serviceDiscount?.includedServices || [],
      serviceInclusion: raw.serviceDiscount?.includeAllServices ? 'Include All' : (raw.serviceDiscount?.excludedServices?.length ? 'Exclude' : 'Include Specific'),
      isServicePackage: !!raw.servicePackage?.services?.length,
      packageServices: (raw.servicePackage?.services || []).map((s, idx) => ({
        id: idx + 1,
        service: s.serviceName || s.service || '',
        serviceId: s.serviceId || s.service_id || '',
        quantityType: s.quantityType || s.quantity_type || 'sessions',
        sessions: (s.quantityType === 'sessions' || s.quantity_type === 'sessions') ? s.quantityValue || s.qty || 1 : 1,
        hours: (s.quantityType === 'hours' || s.quantity_type === 'hours') ? s.quantityValue || s.qty || 1 : 1,
        discountType: 'Percentage',
        discountValue: 0,
      })),
      isLoyaltyPoints: !!(raw.loyaltyPoints && (raw.loyaltyPoints.oneTimeBonus || raw.loyaltyPoints.servicePointsMultiplier || raw.loyaltyPoints.productPointsMultiplier || raw.loyaltyPoints.membershipPointsMultiplier)),
      isBonusPoints: !!(raw.loyaltyPoints?.oneTimeBonus),
      bonusPoints: raw.loyaltyPoints?.oneTimeBonus || 0,
      isAdditionalPoints: !!(raw.loyaltyPoints && (raw.loyaltyPoints.servicePointsMultiplier || raw.loyaltyPoints.productPointsMultiplier || raw.loyaltyPoints.membershipPointsMultiplier)),
      additionalPointsConfig: {
        service: { multiplier: raw.loyaltyPoints?.servicePointsMultiplier || 0 },
        products: { multiplier: raw.loyaltyPoints?.productPointsMultiplier || 0 },
        membership: { multiplier: raw.loyaltyPoints?.membershipPointsMultiplier || 0 },
      },
      status: raw.status || 'active',
      _raw: raw,
    };
  };

  const handleView = async (row) => {
    setDrawerMode('view');
    if (!currentStore?.id) { setSelected(row); return setIsDrawerOpen(true); }
    try {
      const res = await membershipsApi.getById(currentStore.id, row.id);
      const raw = res?.data?.membership || res?.data || row._raw || row;
      setSelected(mapMembershipDetailToForm(raw));
    } catch {
      setSelected(row);
    } finally { setIsDrawerOpen(true); }
  };

  const handleEdit = async (row) => {
    setDrawerMode('edit');
    if (!currentStore?.id) { setSelected(row); return setIsDrawerOpen(true); }
    try {
      const res = await membershipsApi.getById(currentStore.id, row.id);
      const raw = res?.data?.membership || res?.data || row._raw || row;
      setSelected(mapMembershipDetailToForm(raw));
    } catch {
      setSelected(row);
    } finally { setIsDrawerOpen(true); }
  };

  const handleDelete = (row) => {
    setDeleteModal({ open: true, item: row });
  };

  const handleDeleteConfirm = async () => {
    if (!currentStore?.id || !deleteModal.item?.id) { setDeleteModal({ open: false, item: null }); return; }
    try {
      await membershipsApi.delete(currentStore.id, deleteModal.item.id);
      await fetchMemberships();
    } catch (e) {
      // optionally surface toast
    } finally {
      setDeleteModal({ open: false, item: null });
    }
  };

  const columns = [
    { id: 'name', header: 'Name', accessor: 'name', width: '30%' },
    { id: 'price', header: 'Price', accessor: 'price', width: '15%' },
    { id: 'status', header: 'Status', accessor: 'status', width: '15%' },
  ];

  const rowActions = useMemo(() => ([
    { icon: <EyeIcon className="text-blue-600" size={20} />, title: 'View', onClick: handleView },
    { icon: <EditIcon className="text-green-600" size={20} />, title: 'Edit', onClick: handleEdit },
    { icon: <Trash2 className="text-red-600" size={20} />, title: 'Delete', onClick: handleDelete },
  ]), [currentStore?.id]);

  const handleSave = async (membershipData) => {
    if (!currentStore?.id) return;
    const payload = {
      name: membershipData.name,
      description: membershipData.description,
      price: Number(membershipData.price || 0),
      walletBalance: Number(membershipData.walletBalance || 0),
      validity: {
        years: Number(membershipData.validity?.years || 0),
        months: Number(membershipData.validity?.months || 0),
        days: Number(membershipData.validity?.days || 0),
      },
      overallDiscount: {
        type: (membershipData.totalDiscountType || 'Percentage').toLowerCase(),
        value: Number(membershipData.percentage || 0),
      },
      serviceDiscount: {
        type: (membershipData.crossServiceDiscountType || 'Percentage').toLowerCase(),
        value: Number(membershipData.crossServiceDiscountValue || 0),
        includedServices: Array.isArray(membershipData.crossSelectedServices) ? membershipData.crossSelectedServices : [],
        includeAllServices: membershipData.serviceInclusion === 'Include All',
        excludedServices: membershipData.serviceInclusion === 'Exclude' ? (membershipData.crossSelectedServices || []) : [],
      },
      productDiscount: { type: 'percentage', value: 0, includedProducts: [], includeAllProducts: false, excludedProducts: [] },
      servicePackage: membershipData.isServicePackage ? {
        servicePackageId: null,
        services: (membershipData.packageServices || []).map(s => ({
          serviceId: s.serviceId || null,
          quantityType: s.quantityType,
          quantityValue: s.quantityType === 'sessions' ? Number(s.sessions || 0) : Number(s.hours || 0),
        }))
      } : { servicePackageId: null, services: [] },
      loyaltyPoints: membershipData.isLoyaltyPoints ? {
        oneTimeBonus: membershipData.isBonusPoints ? Number(membershipData.bonusPoints || 0) : 0,
        servicePointsMultiplier: Number(membershipData.additionalPointsConfig?.service?.multiplier || 0),
        productPointsMultiplier: Number(membershipData.additionalPointsConfig?.products?.multiplier || 0),
        membershipPointsMultiplier: Number(membershipData.additionalPointsConfig?.membership?.multiplier || 0),
      } : { oneTimeBonus: 0, servicePointsMultiplier: 0, productPointsMultiplier: 0, membershipPointsMultiplier: 0 },
      status: (membershipData.status || 'Active').toLowerCase(),
    };

    if (drawerMode === 'edit' && selected?.id) {
      await membershipsApi.update(currentStore.id, selected.id, payload);
    } else {
      await membershipsApi.create(currentStore.id, payload);
    }
    await fetchMemberships();
    setIsDrawerOpen(false);
  };

  return (
    <div className=" space-y-6">
      <div className="customer-header flex flex-row justify-between items-center">
        <div className="text-3xl font-bold text-teal-700">Memberships</div>
        <button onClick={() => { setSelected(null); setDrawerMode('create'); setIsDrawerOpen(true); }} className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md">Add Membership</button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Loading memberships...</div>
          </div>
        ) : (
          <GenericTable columns={columns} data={rows} rowActions={rowActions} />
        )}
      </div>
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={drawerMode === 'view' ? 'View Membership' : (drawerMode === 'edit' ? 'Edit Membership' : 'Add Membership')}>
        <MembershipFormComponent initialData={selected} onSave={handleSave} onCancel={() => setIsDrawerOpen(false)} readOnly={drawerMode === 'view'} />
      </Drawer>
      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${deleteModal.item?.name || 'this membership'}?`}
      />
    </div>
  );
};

export default MembershipsTab;
