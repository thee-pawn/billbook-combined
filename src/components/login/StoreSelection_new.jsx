import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './StoreContext';
import { useAuth } from './useAuth';
import { useNotification } from '../../contexts/NotificationContext';

const StoreSelection = ({ embedded = false, onStoreSelected, onCancel }) => {
  const { 
    userStores, 
    loadUserStores, 
    selectStore, 
    isLoading, 
    error, 
    hasNoStores, 
    createStore, 
    isLoadingStores,
    storesLoadAttempted
  } = useStore();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  
  // Load stores when component mounts
  useEffect(() => {
    const fetchStores = async () => {
      try {
        if (!storesLoadAttempted) {
          const stores = await loadUserStores();
          
          // If stores exist and there's exactly one store, auto-select it
          if (stores && stores.length === 1) {
            try {
              await handleStoreSelect(stores[0].id);
            } catch (err) {
              console.error('Error auto-selecting store:', err);
            }
          }
        } else {
          if (userStores && userStores.length === 1) {
            try {
              await handleStoreSelect(userStores[0].id);
            } catch (err) {
              console.error('Error auto-selecting existing store:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchStores:', error);
      }
    };

    fetchStores();
  }, [loadUserStores, storesLoadAttempted, userStores, embedded, navigate]);

  const handleStoreSelect = async (storeId) => {
    try {
      const selectedStore = await selectStore(storeId);
      
      if (embedded && onStoreSelected) {
        onStoreSelected(selectedStore);
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Error selecting store:', error);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    
    if (!newStoreName.trim()) {
      showNotification('Please enter a store name', 'error');
      return;
    }

    try {
      const storeData = {
        name: newStoreName.trim(),
        address_line_1: newStoreAddress.trim(),
        phone: newStorePhone.trim(),
        email: newStoreEmail.trim(),
      };

      const newStore = await createStore(storeData);
      
      // Auto-select the newly created store
      await handleStoreSelect(newStore.id);
      
      // Reset form
      setNewStoreName('');
      setNewStoreAddress('');
      setNewStorePhone('');
      setNewStoreEmail('');
      setIsCreatingStore(false);
      
    } catch (error) {
      console.error('Error creating store:', error);
      showNotification('Failed to create store. Please try again.', 'error');
    }
  };

  const handleRetry = async () => {
    try {
      await loadUserStores();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoadingStores) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your stores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Stores</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={isLoadingStores}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isLoadingStores ? 'Retrying...' : 'Try Again'}
              </button>
              <button
                onClick={handleRefresh}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasNoStores && storesLoadAttempted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stores Available</h3>
            <p className="text-gray-600 mb-6">You don't have any stores yet. Create your first store to get started.</p>
          </div>

          {!isCreatingStore ? (
            <div className="space-y-3">
              <button
                onClick={() => setIsCreatingStore(true)}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition"
              >
                Create New Store
              </button>
              <button
                onClick={handleRetry}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateStore} className="space-y-4">
              <input
                type="text"
                placeholder="Store Name *"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Store Address"
                value={newStoreAddress}
                onChange={(e) => setNewStoreAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newStorePhone}
                onChange={(e) => setNewStorePhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newStoreEmail}
                onChange={(e) => setNewStoreEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingStore(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Store</h2>
          <p className="text-gray-600">Choose a store to continue</p>
        </div>

        <div className="space-y-3">
          {userStores.map((store) => {
            const addressParts = [
              store.address_line_1,
              store.locality,
              store.city,
              store.state,
              store.country
            ].filter(Boolean);
            
            return (
              <div
                key={store.id}
                onClick={() => handleStoreSelect(store.id)}
                className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 cursor-pointer transition group"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">{store.name}</h3>
                {addressParts.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">{addressParts.join(', ')}</p>
                )}
              </div>
            );
          })}
        </div>

        {embedded && onCancel && (
          <button
            onClick={onCancel}
            className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default StoreSelection;
