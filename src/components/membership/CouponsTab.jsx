import React, { useState, useEffect, useMemo } from "react";
import "./../../css/Customer.css";
import GenericTable from "@components/common/GenericTable";
import { couponApi } from "../../apis/couponApi";
import { useStore } from "../login/StoreContext";
import { EditIcon, EyeIcon, Trash2 } from "lucide-react";
import { Drawer } from "@components/common/Drawer";
import CouponFormComponent from "./CouponFormComponent";
import { DeleteConfirmationModal } from "@components/common/DeleteConfirmationModal";

const CouponsTab = () => {
    const { currentStore } = useStore();
    const [formData, setFormData] = useState({});
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [drawerTitle, setDrawerTitle] = useState('Add Coupon');
    const [deleteModal, setDeleteModal] = useState({ open: false, coupon: null });
    const [coupons, setCoupons] = useState([]);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [editingCoupon, setEditingCoupon] = useState(false);
    const [drawerMode, setDrawerMode] = useState('edit'); // 'view', 'edit', 'create'


    const loadCoupons = async () => {
        if (!currentStore?.id) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const response = await couponApi.getCoupons(currentStore.id);
            const couponsData = response.coupons || [];
            const transformedCoupons = couponsData.map(coupon => ({
                id: coupon.id,
                name: coupon.couponCode,
                couponCode: coupon.couponCode,
                type: 'Coupon',
                description: coupon.description,
                validFrom: new Date(coupon.validForm).toLocaleDateString(),
                validTo: new Date(coupon.validTill).toLocaleDateString(),
                discount: coupon.discount.type === 'percentage' ? `${coupon.discount.value}%` : `₹${coupon.discount.value}`,
                discountType: coupon.discount.type,
                discountValue: coupon.discount.value,
                minPurchase: coupon.conditions?.minimumSpend || 0,
                maxDiscount: coupon.conditions?.maximumDisc || 0,
                usageLimit: coupon.conditions?.limit || 0,
                usage: coupon.usage || 0,
                status: coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1),
                _raw: coupon
            }));
            setCoupons(transformedCoupons);
        } catch (e) {
            setCouponError(e?.message || e?.data?.message || 'Failed to load coupons');
            setCoupons([]);
        } finally {
            setCouponLoading(false);
        }
    };

    useEffect(() => { loadCoupons(); }, [currentStore?.id]);

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setSelectedCoupon(null);
    };

    const handleViewCoupon = (coupon) => {
        setSelectedCoupon(coupon);
        setDrawerMode('view');
        setDrawerTitle('View Coupon');
        setIsDrawerOpen(true);
    };

    const handleEditCoupon = (coupon) => {
        setSelectedCoupon(coupon);
        setDrawerMode('edit');
        setDrawerTitle('Edit Coupon');
        setIsDrawerOpen(true);
    };

    const handleDeleteCoupon = (coupon) => {
        setDeleteModal({ open: true, coupon: coupon });
    };

    const handleSaveCoupon = async (couponData) => {
        try {
            if (!currentStore?.id) {
                console.error('No store selected. Cannot create coupon.');
                return;
            }

            // Handle coupon creation/update
        const servicesAllIncluded = Boolean(couponData.servicesAllIncluded);
        const productsAllIncluded = Boolean(couponData.productsAllIncluded);
        const membershipsAllIncluded = Boolean(couponData.membershipsAllIncluded);

        const couponPayload = {
                couponCode: couponData.name,
                description: couponData.description,
                validForm: couponData.validFrom,
                validTill: couponData.validTo,
                discount: {
                    type: couponData.discountType === 'Percentage' ? 'percentage' : 'fixed',
                    value: couponData.discountType === 'Percentage' ? Number(couponData.percentage || 0) : Number(couponData.discountAmount || 0)
                },
                conditions: {
                    minimumSpend: Number(couponData.minPurchase || 0),
                    maximumDisc: Number(couponData.maxDiscount || 0),
                    limit: Number(couponData.usageLimit || 1)
                },
                includedServices: {
            allIncluded: servicesAllIncluded,
            inclusions: servicesAllIncluded ? [] : (Array.isArray(couponData.applicableServices) ? couponData.applicableServices : [])
                },
                includedProducts: {
            allIncluded: productsAllIncluded,
            inclusions: productsAllIncluded ? [] : (Array.isArray(couponData.applicableProducts) ? couponData.applicableProducts : [])
                },
                includedMemberships: {
            allIncluded: membershipsAllIncluded,
            inclusions: membershipsAllIncluded ? [] : (Array.isArray(couponData.applicableMemberships) ? couponData.applicableMemberships : [])
                }
            };

            if (selectedCoupon && selectedCoupon.id) {
                // Update existing coupon
                await couponApi.updateCoupon(currentStore.id, selectedCoupon.id, couponPayload);
            } else {
                // Create new coupon
                await couponApi.createCoupon(currentStore.id, couponPayload);
            }

            // Refresh coupon data
            await loadCoupons();
            handleDrawerClose();
            return;


        } catch (err) {
            console.error('Failed to save data:', err);
        } finally {
            handleDrawerClose();
        }
    };


    const handleDelete = async () => {
        if (deleteModal.coupon) {
            try {

                // Call API to delete coupon
                await couponApi.deleteCoupon(currentStore.id, deleteModal.coupon.id);
                // Refresh coupon data
                await loadCoupons();

            } catch (error) {
                console.error('Error deleting item:', error);
                // You might want to show an error message to the user here
            } finally {
                // Close the modal
                setDeleteModal({ open: false, coupon: null });
            }
        }
    };


    const columns = [
        { id: 'couponCode', header: 'Coupon Code', accessor: 'couponCode', width: '20%', sortable: true },
        { id: 'validFrom', header: 'Valid From', accessor: 'validFrom', width: '20%', sortable: true },
        { id: 'validTo', header: 'Valid To', accessor: 'validTo', width: '20%', sortable: true },
        { id: 'discount', header: 'Discount', accessor: 'discount', width: '20%', sortable: true },
        { id: 'actions', header: 'Usage', accessor: 'usage', width: '20%', sortable: true },
    ];


    const rowActions = useMemo(() => ([
        { icon: <EyeIcon className="text-blue-600 hover:text-blue-800" size={22} />, title: 'View Coupon', onClick: (row) => handleViewCoupon(row) },
        { icon: <EditIcon className="text-green-600 hover:text-green-800" size={22} />, title: 'Edit Coupon', onClick: (row) => handleEditCoupon(row) },
        { icon: <Trash2 className="text-red-600 hover:text-red-800" size={22} />, title: 'Delete Coupon', onClick: (row) => handleDeleteCoupon(row) },
    ]), [handleViewCoupon, handleEditCoupon, handleDeleteCoupon]);

    // Helper function to get the appropriate button styling based on the active tab

    // Function to determine which data to display based on active tab
    const getDisplayData = () => {
        return coupons
    };

    // Function to get the appropriate add button text
    const getAddButtonText = () => {
        return 'Add Coupon'
    };

    // Function to set appropriate drawer title
    const handleAddClick = () => {
        setSelectedCoupon(null);
        setIsDrawerOpen(true);
    };

    // Refetch on store change handled above

    return (
        <div className=" space-y-6">
            {/* Tabs navigation - moved to top */}

            <div className="customer-header flex flex-row justify-between items-center">
                <div className="text-3xl font-bold text-teal-700">
                    {'Coupons'}
                </div>
                {<button
                    onClick={handleAddClick}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                >
                    {getAddButtonText()}
                </button>}
            </div>

            {/* Content area: table for most tabs; dedicated form for loyalty */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <GenericTable
                    columns={columns}
                    data={getDisplayData()}
                    rowActions={rowActions}
                    defaultSort={{ key: 'name', direction: 'ascending' }}
                />
            </div>

            {/* Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
                title={drawerTitle}
            >
                <CouponFormComponent
                    initialData={selectedCoupon}
                    onSave={handleSaveCoupon}
                    onCancel={handleDrawerClose}
                />
            </Drawer>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, coupon: null })}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${deleteModal.coupon?.name || 'this coupon'}?`}
            />
        </div>
    );
};

export default CouponsTab;
