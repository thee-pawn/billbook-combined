import React, { useState } from 'react';
import { FormInputField, PanelHeader } from '../../common/FormElements';

const CreateLoyaltyPointsPanel = () => {
    const [loyaltyState, setLoyaltyState] = useState({
        service: { spend: '0', value: '0', maxRedeem: '0' },
        products: { spend: '0', value: '0', maxRedeem: '0' },
        membership: { spend: '0', value: '0', maxRedeem: '0' },
    });
    
    const handleChange = (section, field, value) => { 
        setLoyaltyState(prev => ({ 
            ...prev, 
            [section]: { ...prev[section], [field]: value } 
        })); 
    };
    
    const LoyaltySection = ({ title, sectionKey, state }) => (
        <div className="w-full">
            <div className="bg-teal-500 text-white font-bold px-4 py-2 rounded-t-lg">
                <label>{title}</label>
            </div>
            <div className="bg-white p-4 rounded-b-lg border border-t-0 border-gray-200 space-y-4">
                <FormInputField 
                    label="Customer Spend to Earn 1 Loyalty Point" 
                    name={`spend_${sectionKey}`} 
                    type="number" 
                    value={state.spend} 
                    onChange={(e) => handleChange(sectionKey, 'spend', e.target.value)} 
                    placeholder="0" 
                />
                <FormInputField 
                    label="Value of 1 Loyalty Point" 
                    name={`value_${sectionKey}`} 
                    type="number" 
                    value={state.value} 
                    onChange={(e) => handleChange(sectionKey, 'value', e.target.value)} 
                    placeholder="0" 
                />
                <FormInputField 
                    label="Max Redeem one Time" 
                    name={`maxRedeem_${sectionKey}`} 
                    type="number" 
                    value={state.maxRedeem} 
                    onChange={(e) => handleChange(sectionKey, 'maxRedeem', e.target.value)} 
                    placeholder="0" 
                />
            </div>
        </div>
    );
    
    return (
        <div className="mt-6">
            <PanelHeader title="Create Loyalty Points" />
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <LoyaltySection 
                    title="Service" 
                    sectionKey="service" 
                    state={loyaltyState.service} 
                />
                <LoyaltySection 
                    title="Products" 
                    sectionKey="products" 
                    state={loyaltyState.products} 
                />
                <LoyaltySection 
                    title="Membership" 
                    sectionKey="membership" 
                    state={loyaltyState.membership} 
                />
            </div>
        </div>
    );
};

export default CreateLoyaltyPointsPanel;
