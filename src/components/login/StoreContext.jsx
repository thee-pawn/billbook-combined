import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { storeApi } from '../../apis';
import { getReceiptSettings, getStoreProfile } from '../../apis/APIs';

const StoreContext = createContext();

export function useStore() {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}

function StoreProvider({ children }) {
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

    // Core state
    const [userStores, setUserStores] = useState([]);
    const [currentStore, setCurrentStore] = useState(null);

    // UX and control flags (kept for compatibility with consumers)
    const [isLoading, setIsLoading] = useState(false); // generic op loading (e.g., selecting)
    const [isLoadingStores, setIsLoadingStores] = useState(false); // loading the list
    const [storesLoadAttempted, setStoresLoadAttempted] = useState(false);
    const [storeLoadAttempted, setStoreLoadAttempted] = useState(false);
    const [error, setError] = useState(null);
    const [hasNoStores, setHasNoStores] = useState(false);

    // Cache: store profile and receipt settings by storeId
    const [storeProfileByStore, setStoreProfileByStore] = useState({});
    const [receiptSettingsByStore, setReceiptSettingsByStore] = useState({});
    const [isLoadingStoreProfile, setIsLoadingStoreProfile] = useState(false);
    const [isLoadingReceiptSettings, setIsLoadingReceiptSettings] = useState(false);

    // Fetch all stores for the authenticated user
    const loadUserStores = useCallback(async () => {
        if (!isAuthenticated) return [];
        setIsLoadingStores(true);
        setError(null);
        setStoresLoadAttempted(true);
        try {
            const resp = await storeApi.getStores();
            const stores = resp?.data?.stores || [];
            setUserStores(stores);
            setHasNoStores(stores.length === 0);
            return stores;
        } catch (e) {
            console.error('Error loading stores:', e);
            setUserStores([]);
            setHasNoStores(true);
            setError(e?.message || 'Failed to load stores');
            return [];
        } finally {
            setIsLoadingStores(false);
        }
    }, [isAuthenticated]);

    // Select a store by id and persist to localStorage
    const selectStore = useCallback(async (storeId) => {
        setIsLoading(true);
        try {
            // Try to find the selected store from the cached list
            const store = userStores.find(s => String(s.id) === String(storeId));
            if (store) {
                setCurrentStore(store);
                localStorage.setItem('currentStoreId', String(store.id));
                return store;
            } else {
                // Minimal fallback: persist id and set a minimal currentStore
                localStorage.setItem('currentStoreId', String(storeId));
                const minimal = { id: storeId };
                setCurrentStore(minimal);
                return minimal;
            }
        } finally {
            setIsLoading(false);
        }
    }, [userStores]);

    // Clear selected store
    const clearStore = useCallback(() => {
        localStorage.removeItem('currentStoreId');
        setCurrentStore(null);
        // Optional: do not clear caches so switching back is fast
    }, []);

    // On auth changes, load stores or reset state (but do not clear while auth is still loading)
    useEffect(() => {
        if (isAuthenticated && user) {
            if (!storesLoadAttempted && !isLoadingStores) {
                loadUserStores();
            }
        } else if (!isAuthLoading) {
            // Auth check completed and user is not authenticated -> reset store state
            setUserStores([]);
            setCurrentStore(null);
            setIsLoading(false);
            setIsLoadingStores(false);
            setStoresLoadAttempted(false);
            setStoreLoadAttempted(false);
            setError(null);
            setHasNoStores(false);
            localStorage.removeItem('currentStoreId');
            setStoreProfileByStore({});
            setReceiptSettingsByStore({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user, isAuthLoading]);

    // After stores load, try restore currentStore from localStorage
    useEffect(() => {
        if (!storesLoadAttempted || storeLoadAttempted) return;
        const storedId = localStorage.getItem('currentStoreId');
        if (storedId) {
            const existing = userStores.find(s => String(s.id) === String(storedId));
            if (existing) {
                setCurrentStore(existing);
            } else {
                // Keep only the id if not found in current list
                setCurrentStore({ id: storedId });
            }
        }
        setStoreLoadAttempted(true);
    }, [storesLoadAttempted, storeLoadAttempted, userStores]);

    // Reconcile: if currentStore only has id and full store exists in list, upgrade it
    useEffect(() => {
        if (!currentStore || !currentStore.id) return;
        const match = userStores.find(s => String(s.id) === String(currentStore.id));
        if (match && match !== currentStore) {
            setCurrentStore(match);
        }
    }, [userStores, currentStore?.id]);

    // Load and cache store profile for current store
    const loadStoreProfile = useCallback(async (storeId) => {
        if (!storeId) return null;
        if (storeProfileByStore[storeId]) return storeProfileByStore[storeId];
        setIsLoadingStoreProfile(true);
        try {
            const profile = await getStoreProfile(storeId);
            setStoreProfileByStore(prev => ({ ...prev, [storeId]: profile }));
            return profile;
        } catch (e) {
            console.error('Error loading store profile:', e);
            return null;
        } finally {
            setIsLoadingStoreProfile(false);
        }
    }, [storeProfileByStore]);

    // Load and cache receipt settings for current store
    const loadReceiptSettings = useCallback(async (storeId) => {
        if (!storeId) return null;
        if (receiptSettingsByStore[storeId]) return receiptSettingsByStore[storeId];
        setIsLoadingReceiptSettings(true);
        try {
            const resp = await getReceiptSettings(storeId);
            const data = resp?.data || resp; // support either shape
            if (data) {
                setReceiptSettingsByStore(prev => ({ ...prev, [storeId]: data }));
            }
            return data || null;
        } catch (e) {
            console.error('Error loading receipt settings:', e);
            return null;
        } finally {
            setIsLoadingReceiptSettings(false);
        }
    }, [receiptSettingsByStore]);

    // Prefetch for current store (non-blocking)
    useEffect(() => {
        if (!currentStore?.id) return;
        loadStoreProfile(currentStore.id);
        loadReceiptSettings(currentStore.id);
    }, [currentStore?.id, loadStoreProfile, loadReceiptSettings]);

    const currentStoreProfile = currentStore?.id ? storeProfileByStore[currentStore.id] : null;
    const currentReceiptSettings = currentStore?.id ? receiptSettingsByStore[currentStore.id] : null;

    const value = {
        // data
        currentStore,
        userStores,
        currentStoreProfile,
        currentReceiptSettings,
        // flags
        isLoading,
        isLoadingStores,
        storesLoadAttempted,
        storeLoadAttempted,
        error,
        hasNoStores,
        isLoadingStoreProfile,
        isLoadingReceiptSettings,
        // actions
        loadUserStores,
        selectStore,
        clearStore,
        loadStoreProfile,
        loadReceiptSettings,
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

export { StoreContext };
export { StoreProvider };
