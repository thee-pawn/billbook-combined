import React, { useState, useEffect } from 'react';
import { useStore } from '../login/StoreContext';
import { useAuth } from '../login/useAuth';

const StoreSelect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { 
    currentStore, 
    userStores, 
    loadUserStores, 
    selectStore, 
    isLoading,
    isLoadingStores,
    storesLoadAttempted,
    error
  } = useStore();

  // Force re-render when currentStore changes
  useEffect(() => {
  }, [currentStore]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleStoreSelect = async (store) => {
    await selectStore(store.id);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="w-full relative">
      {/* Selected Store Display */}
      <button
        onClick={toggleDropdown}
        className="w-full text-left border border-dashed border-gray-400 rounded p-2 flex items-center justify-between"
        disabled={isLoading}
      >
        <div style={{ maxWidth: 'calc(100% - 20px)' }}>
          {
            currentStore ? (
            <>
              <div className="text-xl font-bold">{currentStore.name}</div>
                <div className="text-sm text-gray-700 overflow-hidden text-ellipsis">
                  {currentStore.address_line_1 && (
                    `${currentStore.address_line_1}${currentStore.locality ? `, ${currentStore.locality}` : ''}${currentStore.city ? `, ${currentStore.city}` : ''}`
                  )}
                </div>
            </>
          ) : (
            <div>{isLoading ? 'Loading stores...' : 'No store available - Click to contact support'}</div>
          )}
        </div>
        <span>&#9660;</span> {/* Down arrow icon */}
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute sm:w-full md:w-3/4 lg:w-3/4 xl:w-2/3 left-0 mt-1 bg-white border rounded shadow-md z-50" style={{ minWidth: '300px', maxWidth: '600px' }}>
          {isLoading ? (
            <div className="px-4 py-2 text-center">Loading stores...</div>
          ) : userStores && userStores.length > 0 ? (
            userStores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleStoreSelect(store)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${currentStore && store.id === currentStore.id ? 'bg-gray-100' : ''}`}
              >
                <div className="font-medium">{store.name}</div>
                <div className="text-xs text-gray-600 overflow-hidden text-ellipsis" style={{ maxWidth: '100%' }}>
                  {store.address_line_1 && (
                    `${store.address_line_1}${store.locality ? `, ${store.locality}` : ''}${store.city ? `, ${store.city}` : ''}`
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-6 py-4 text-center bg-gray-50 border-t">
              <div className="font-medium text-gray-800 mb-2">Please contact support to get your store onboarded.</div>
              <div className="text-sm text-gray-600">
                <span className="block mb-1">Email: <a href="mailto:billbookplusupport@gmail.com" className="text-blue-600 hover:underline">billbookplusupport@gmail.com</a></span>
                <span className="block">Phone: <a href="tel:+919608163637" className="text-blue-600 hover:underline">+919608163637</a></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreSelect;