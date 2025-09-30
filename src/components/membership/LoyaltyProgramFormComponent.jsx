import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from "../login/StoreContext";
import { InputField } from '@components/common/FormElements';



const LoyaltyProgramFormComponent = ({ initialData, onSave, onCancel, readOnly = false }) => {
  const { currentStore } = useStore();
  const storeId = currentStore?.id;
  // derive normalized initial values
  const normalizedInitial = useMemo(() => ({
    pointsPerRupee: initialData?.pointsPerRupee ?? '',
    servicePoints: initialData?.servicePoints ?? '',
    productPoints: initialData?.productPoints ?? '',
    membershipPoints: initialData?.membershipPoints ?? '',
    minServiceRedemption: initialData?.minServiceRedemption ?? '',
    maxServiceRedemption: initialData?.maxServiceRedemption ?? '',
    minProductsRedemption: initialData?.minProductsRedemption ?? '',
    maxProductsRedemption: initialData?.maxProductsRedemption ?? '',
    minMembershipRedemption: initialData?.minMembershipRedemption ?? '',
    maxMembershipRedemption: initialData?.maxMembershipRedemption ?? '',
  }), [initialData]);

  // Points to rupee conversion
  const [pointsPerRupee, setPointsPerRupee] = useState(normalizedInitial.pointsPerRupee);
  // Points earned per rupee spent
  const [servicePoints, setServicePoints] = useState(normalizedInitial.servicePoints);
  const [productPoints, setProductPoints] = useState(normalizedInitial.productPoints);
  const [membershipPoints, setMembershipPoints] = useState(normalizedInitial.membershipPoints);
  const [minServiceRedemption, setMinServiceRedemption] = useState(normalizedInitial.minServiceRedemption);
  const [maxServiceRedemption, setMaxServiceRedemption] = useState(normalizedInitial.maxServiceRedemption);
  const [minProductsRedemption, setMinProductsRedemption] = useState(normalizedInitial.minProductsRedemption);
  const [maxProductsRedemption, setMaxProductsRedemption] = useState(normalizedInitial.maxProductsRedemption);
  const [minMembershipRedemption, setMinMembershipRedemption] = useState(normalizedInitial.minMembershipRedemption);
  const [maxMembershipRedemption, setMaxMembershipRedemption] = useState(normalizedInitial.maxMembershipRedemption);

  // track dirty state
  const [dirty, setDirty] = useState(false);
  const initialRef = useRef(normalizedInitial);

  useEffect(() => {
    // when initialData changes, reset fields and dirty
    initialRef.current = normalizedInitial;
    setPointsPerRupee(normalizedInitial.pointsPerRupee);
    setServicePoints(normalizedInitial.servicePoints);
    setProductPoints(normalizedInitial.productPoints);
    setMembershipPoints(normalizedInitial.membershipPoints);
    setMinServiceRedemption(normalizedInitial.minServiceRedemption);
    setMaxServiceRedemption(normalizedInitial.maxServiceRedemption);
    setMinProductsRedemption(normalizedInitial.minProductsRedemption);
    setMaxProductsRedemption(normalizedInitial.maxProductsRedemption);
    setMinMembershipRedemption(normalizedInitial.minMembershipRedemption);
    setMaxMembershipRedemption(normalizedInitial.maxMembershipRedemption);
    setDirty(false);
  }, [normalizedInitial]);

  useEffect(() => {
    const a = initialRef.current;
    const isDirty = (
      String(pointsPerRupee ?? '') !== String(a.pointsPerRupee ?? '') ||
      String(servicePoints ?? '') !== String(a.servicePoints ?? '') ||
      String(productPoints ?? '') !== String(a.productPoints ?? '') ||
      String(membershipPoints ?? '') !== String(a.membershipPoints ?? '') ||
      String(minServiceRedemption ?? '') !== String(a.minServiceRedemption ?? '') ||
      String(maxServiceRedemption ?? '') !== String(a.maxServiceRedemption ?? '') ||
      String(minProductsRedemption ?? '') !== String(a.minProductsRedemption ?? '') ||
      String(maxProductsRedemption ?? '') !== String(a.maxProductsRedemption ?? '') ||
      String(minMembershipRedemption ?? '') !== String(a.minMembershipRedemption ?? '') ||
      String(maxMembershipRedemption ?? '') !== String(a.maxMembershipRedemption ?? '')
    );
    setDirty(isDirty);
  }, [pointsPerRupee, servicePoints, productPoints, membershipPoints, minServiceRedemption, maxServiceRedemption, minProductsRedemption, maxProductsRedemption, minMembershipRedemption, maxMembershipRedemption]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Pass UI values to parent; parent handles API and mapping
    const values = {
      pointsPerRupee,
      servicePoints,
      productPoints,
      membershipPoints,
      minServiceRedemption,
      maxServiceRedemption,
      minProductsRedemption,
      maxProductsRedemption,
      minMembershipRedemption,
      maxMembershipRedemption,
    };

    try {
      if (!storeId) throw new Error('Missing storeId');
      if (onSave) {
        await onSave(values);
      }
      // update initial snapshot on successful save
      initialRef.current = {
        pointsPerRupee: String(pointsPerRupee ?? ''),
        servicePoints: String(servicePoints ?? ''),
        productPoints: String(productPoints ?? ''),
        membershipPoints: String(membershipPoints ?? ''),
        minServiceRedemption: String(minServiceRedemption ?? ''),
        maxServiceRedemption: String(maxServiceRedemption ?? ''),
        minProductsRedemption: String(minProductsRedemption ?? ''),
        maxProductsRedemption: String(maxProductsRedemption ?? ''),
        minMembershipRedemption: String(minMembershipRedemption ?? ''),
        maxMembershipRedemption: String(maxMembershipRedemption ?? ''),
      };
      setDirty(false);
      // Switch back to view mode (parent provided onCancel sets editing=false)
      onCancel?.();
    } catch (err) {
      const msg = err?.message || err?.data?.message || 'Failed to save loyalty configuration';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto p-6">
  <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm text-left">
            {error}
          </div>
        )}
        {/* Points to Rupee Conversion */}
        <div className="bg-white p-6 rounded-xl border border-teal-200 shadow-sm space-y-4">
          <h4 className="text-md font-medium text-teal-900 mb-4 text-left">Points Conversion Rate</h4>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">1 Rupee =</span>
            <div className="flex-1 max-w-xs">
              <InputField
                id="pointsPerRupee"
                label=""
                type="number"
                placeholder="Enter points"
                value={pointsPerRupee}
                onChange={e => setPointsPerRupee(e.target.value)}
                required={false}
                disabled={readOnly}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">Points</span>
          </div>
        </div>

        {/* Points Earned on Spending */}
        <div className="bg-white p-6 rounded-xl border border-teal-200 shadow-sm space-y-4">

          <div className="space-y-4 grid sm:grid-cols-1 md:grid-cols-3 gap-4">
            {/* Services Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className=" space-x-4">
                <div className="text-md font-medium text-teal-700 mb-4 text-left">Services:</div>
                <div className=" max-w-xs space-y-4">
                  <InputField
                    id="servicePoints"
                    label="Points per Rupee"
                    type="number"
                    placeholder="Points per rupee"
                    value={servicePoints}
                    onChange={e => setServicePoints(e.target.value)}
                    required={false}
                    disabled={readOnly}
                  />
                  <InputField
                    id="minServiceRedemption"
                    label="Minimum Redemption"
                    type="number"
                    placeholder="Minimum Redemption"
                    value={minServiceRedemption}
                    onChange={e => setMinServiceRedemption(e.target.value)}
                    required={false}
                    disabled={readOnly}
                  />
                  <InputField
                    id="maxServiceRedemption"
                    label="Maximum Redemption"
                    type="number"
                    placeholder="Maximum Redemption"
                    value={maxServiceRedemption}
                    onChange={e => setMaxServiceRedemption(e.target.value)}
                    required={false}
                    disabled={readOnly}
                  />
                </div>
                
              </div>
            </div>

            {/* Products Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className=" space-x-4">
                <div className="text-md font-medium text-teal-700 mb-4 text-left">Products:</div>
                <div className=" max-w-xs space-y-4">
                  <InputField
                    id="productPoints"
                    label="Points per Rupee"
                    type="number"
                    placeholder="Points per rupee"
                    value={productPoints}
                    onChange={e => setProductPoints(e.target.value)}
                    required={false}
                    disabled={readOnly}
                  />
                  <InputField
                    id="minProductRedemption"
                    label="Minimum Redemption"
                    type="number"
                    placeholder="Minimum Redemption"
                    value={minProductsRedemption}
                    onChange={e => setMinProductsRedemption(e.target.value)}
                    required={false}
                    disabled={readOnly}
                  />
                  <InputField
                    id="maxProductRedemption"
                    label="Maximum Redemption"
                    type="number"
                    placeholder="Maximum Redemption"
                    value={maxProductsRedemption}
                    onChange={e => setMaxProductsRedemption(e.target.value)}
                    required={false}
                    disabled={readOnly}
                  />
                </div>
                
              </div>
            </div>

            {/* Memberships Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className=" space-x-4">
                <div className="text-md font-medium text-teal-700 mb-4 text-left">Memberships:</div>
                <div className=" max-w-xs space-y-4">
                  <InputField
                    id="membershipPoints"
                    label="Points per Rupee"
                    type="number"
                    placeholder="Points per rupee"
                    value={membershipPoints}
                    onChange={e => setMembershipPoints(e.target.value)}
                    required={false}
                    disabled={readOnly}
                  />
                  <InputField
                    id="minMembershipRedemption"
                    label="Minimum Redemption"
                    type="number"
                    placeholder="Minimum Redemption"
                    value={minMembershipRedemption}
                    onChange={e => setMinMembershipRedemption(e.target.value)}
                    required={false}
                    disabled={readOnly}
                  />
                  <InputField
                    id="maxMembershipRedemption"
                    label="Maximum Redemption"
                    type="number"
                    placeholder="Maximum Redemption"
                    value={maxMembershipRedemption}
                    onChange={e => setMaxMembershipRedemption(e.target.value)}
                    required={false}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        {!readOnly && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !dirty}
              className={`px-6 py-2 text-white rounded-lg transition ${(saving || !dirty) ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoyaltyProgramFormComponent;
