import React, { useEffect, useState } from 'react';
import { useStore } from '../login/StoreContext';
import loyaltyApi from '../../apis/loyaltyApi';
import LoyaltyProgramFormComponent from './LoyaltyProgramFormComponent';

const LoyaltyPointsTab = () => {
	const { currentStore } = useStore();
	const [initialData, setInitialData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [editing, setEditing] = useState(false);
	const [error, setError] = useState('');

	const loadConfig = async () => {
		if (!currentStore?.id) return;
		setLoading(true); setError('');
		try {
			const resp = await loyaltyApi.getPointsConfiguration(currentStore.id);
			const cfg = resp?.data?.configuration;
			if (cfg) {
				// Map API response to form's expected shape
				setInitialData({
					pointsPerRupee: cfg.loyaltyPointsConversionRate,
					servicePoints: cfg.serviceLoyaltyPoints,
					productPoints: cfg.productLoyaltyPoints,
					membershipPoints: cfg.membershipLoyaltyPoints,
					minServiceRedemption: cfg.minServiceRedemption,
					maxServiceRedemption: cfg.maxServiceRedemption,
					minProductsRedemption: cfg.minProductsRedemption,
					maxProductsRedemption: cfg.maxProductsRedemption,
					minMembershipRedemption: cfg.minMembershipRedemption,
					maxMembershipRedemption: cfg.maxMembershipRedemption,
				});
			} else {
				setInitialData(null);
			}
		} catch (e) {
			setError(e?.message || 'Failed to load');
			setInitialData(null);
		} finally { setLoading(false); }
	};

	useEffect(() => { loadConfig(); }, [currentStore?.id]);

	const handleSave = async (values) => {
		if (!currentStore?.id) return;
		const payload = {
			loyaltyPointsConversionRate: Number(values?.pointsPerRupee || 0),
			serviceLoyaltyPoints: Number(values?.servicePoints || 0),
			productLoyaltyPoints: Number(values?.productPoints || 0),
			membershipLoyaltyPoints: Number(values?.membershipPoints || 0),
			minServiceRedemption: Number(values?.minServiceRedemption || 0),
			maxServiceRedemption: Number(values?.maxServiceRedemption || 0),
			minProductsRedemption: Number(values?.minProductsRedemption || 0),
			maxProductsRedemption: Number(values?.maxProductsRedemption || 0),
			minMembershipRedemption: Number(values?.minMembershipRedemption || 0),
			maxMembershipRedemption: Number(values?.maxMembershipRedemption || 0),
		};
		try { await loyaltyApi.updatePointsConfiguration(currentStore.id, payload); }
		catch { await loyaltyApi.savePointsConfiguration(currentStore.id, payload); }
		await loadConfig();
		setEditing(false);
	};

	return (
		<div className="w-full min-h-[60vh] flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-md w-full  overflow-hidden p-4">
				<div className="flex items-center justify-between mb-4">
					<div className="text-3xl font-bold text-teal-700">Loyalty Points Configuration</div>
					{!editing && (
						<button
							onClick={() => setEditing(true)}
							className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition"
						>
							Edit
						</button>
					)}
				</div>
				{error && <div className="text-red-600 text-sm mb-2">{error}</div>}
				<LoyaltyProgramFormComponent
					initialData={initialData}
					onSave={handleSave}
					onCancel={() => setEditing(false)}
					readOnly={!editing}
				/>
			</div>
		</div>
	);
};

export default LoyaltyPointsTab;

