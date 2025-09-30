import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './StoreContext';
import { useAuth } from './useAuth';

const StoreSelection = ({ embedded = false, onStoreSelected, onCancel }) => {
  const { 
    userStores, 
    loadUserStores, 
    selectStore, 
    isLoading, 
    error, 
    hasNoStores, 
    isLoadingStores,
    storesLoadAttempted
  } = useStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Load stores when component mounts - but only if not already loaded
  useEffect(() => {
    const fetchStores = async () => {
      try {
        if (!storesLoadAttempted && !isLoadingStores) {
          const stores = await loadUserStores();
          
          // If stores exist and there's exactly one store, auto-select it
          if (stores && stores.length === 1) {
            try {
              await handleStoreSelect(stores[0].id);
            } catch (err) {
              console.error('Error auto-selecting store:', err);
            }
          }
        } else if (storesLoadAttempted && userStores && userStores.length === 1) {
          try {
            await handleStoreSelect(userStores[0].id);
          } catch (err) {
            console.error('Error auto-selecting existing store:', err);
          }
        }
      } catch (error) {
        console.error('Error in fetchStores:', error);
      }
    };

    fetchStores();
  }, [storesLoadAttempted, isLoadingStores, userStores]); // Only depend on state, not functions

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
            <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stores Available</h3>
            <p className="text-gray-600 mb-6">
              You don't have any stores associated with your account. Please contact our support team to set up your store access.
            </p>
            
            {/* Support Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm">
              <h4 className="font-semibold text-gray-800 mb-2">Contact Support:</h4>
              <div className="space-y-1 text-gray-600">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +919608163637
                </div>
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@billbookplus.com
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.open('tel:+919608163637', '_self')}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Support
            </button>
            <button
              onClick={() => window.open('mailto:support@billbookplus.com', '_blank')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Support
            </button>
            <button
              onClick={logout}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
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

        {/* Login with Another Account Option */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Login with Another Account
          </button>
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
