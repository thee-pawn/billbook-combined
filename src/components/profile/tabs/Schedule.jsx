import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Copy, X, Edit, Plus, Calendar } from 'lucide-react';
import { PanelHeader } from '@components/common/FormElements';
import { getStoreShifts, updateStoreShifts, getStoreSpecialShifts, updateStoreSpecialShift, deleteStoreSpecialShift, createStoreSpecialShift } from '../../../apis/APIs';
import { useStore } from '../../login/StoreContext';

// --- Helper Functions & Initial Data ---

const initialSchedule = {
    weeklyHours: [
        { day: 'Monday', isOpen: true, is24Hours: false, slots: [{ start: '09:00', end: '17:00' }] },
        { day: 'Tuesday', isOpen: true, is24Hours: false, slots: [{ start: '09:00', end: '17:00' }] },
        { day: 'Wednesday', isOpen: true, is24Hours: false, slots: [{ start: '09:00', end: '17:00' }] },
        { day: 'Thursday', isOpen: true, is24Hours: false, slots: [{ start: '09:00', end: '17:00' }] },
        { day: 'Friday', isOpen: true, is24Hours: false, slots: [{ start: '09:00', end: '17:00' }] },
        { day: 'Saturday', isOpen: false, is24Hours: false, slots: [{ start: '10:00', end: '16:00' }] },
        { day: 'Sunday', isOpen: false, is24Hours: false, slots: [{ start: '10:00', end: '16:00' }] },
    ],
    overrides: [
        { id: 1, date: '2025-12-25', description: 'Christmas Day', isOpen: false, is24Hours: false, slots: [] },
        { id: 2, date: '2026-01-01', description: 'New Year\'s Day', isOpen: false, is24Hours: false, slots: [] },
        { id: 3, date: '2025-11-27', description: 'Black Friday', isOpen: true, is24Hours: true, slots: [] },
    ],
};

const dayIndexMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

// --- Sub-Components ---

const ToggleSwitch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-teal-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
    </label>
);

const TimeSlot = ({ slot, onUpdate, onRemove, isReadOnly }) => (
    <div className="flex items-center space-x-2 mb-2">
        <input
            type="time"
            value={slot.start}
            onChange={(e) => onUpdate({ ...slot, start: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white disabled:bg-gray-100"
            disabled={isReadOnly}
        />
        <span className="text-gray-500">-</span>
        <input
            type="time"
            value={slot.end}
            onChange={(e) => onUpdate({ ...slot, end: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white disabled:bg-gray-100"
            disabled={isReadOnly}
        />
        {!isReadOnly && (
            <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
            </button>
        )}
    </div>
);

const DayRow = ({ day, onUpdate, onCopyTo }) => {
    const [isCopyMenuOpen, setIsCopyMenuOpen] = useState(false);

    const handleToggleOpen = () => {
        onUpdate({ ...day, isOpen: !day.isOpen });
    };

    const handleToggle24Hours = () => {
        onUpdate({ ...day, is24Hours: !day.is24Hours });
    };

    const handleAddSlot = () => {
        onUpdate({ ...day, slots: [...day.slots, { start: '09:00', end: '17:00' }] });
    };

    const handleUpdateSlot = (index, updatedSlot) => {
        const newSlots = [...day.slots];
        newSlots[index] = updatedSlot;
        onUpdate({ ...day, slots: newSlots });
    };

    const handleRemoveSlot = (index) => {
        const newSlots = day.slots.filter((_, i) => i !== index);
        onUpdate({ ...day, slots: newSlots });
    };

    const handleCopyTo = (targetDays) => {
        onCopyTo(day, targetDays);
        setIsCopyMenuOpen(false);
    };

    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 items-start py-4 border-b border-gray-200 last:border-b-0">
            <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-700 w-24">{day.day}</span>
                <ToggleSwitch checked={day.isOpen} onChange={handleToggleOpen} />
                <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${day.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {day.isOpen ? 'Open' : 'Closed'}
                </div>
            </div>
            <div className="col-span-1 md:col-span-2">
                {day.isOpen ? (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={day.is24Hours}
                                    onChange={handleToggle24Hours}
                                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-600">Open 24 hours</span>
                            </label>
                            <div className="relative">
                                <button onClick={() => setIsCopyMenuOpen(!isCopyMenuOpen)} className="text-gray-500 hover:text-teal-600">
                                    <Copy size={18} />
                                </button>
                                {isCopyMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                        <div className="p-2 font-semibold text-sm border-b">Copy to...</div>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleCopyTo(['Tuesday', 'Wednesday', 'Thursday', 'Friday']) }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Weekdays</a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleCopyTo(['Saturday', 'Sunday']) }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Weekends</a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleCopyTo(initialSchedule.weeklyHours.map(d => d.day).filter(d => d !== day.day)) }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All other days</a>
                                        <button onClick={() => setIsCopyMenuOpen(false)} className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"><X size={16} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {!day.is24Hours && (
                            <>
                                {day.slots.map((slot, index) => (
                                    <TimeSlot
                                        key={index}
                                        slot={slot}
                                        onUpdate={(updatedSlot) => handleUpdateSlot(index, updatedSlot)}
                                        onRemove={() => handleRemoveSlot(index)}
                                    />
                                ))}
                                <button
                                    onClick={handleAddSlot}
                                    className="mt-2 flex items-center space-x-1 text-sm text-teal-600 hover:text-teal-800 font-medium"
                                >
                                    <PlusCircle size={16} />
                                    <span>Add hours</span>
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-sm md:mt-1">Unavailable</p>
                )}
            </div>
        </div>
    );
};

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  bg-opacity-60 z-300 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Drawer = ({ isOpen, onClose, children }) => {
    return (
        <div className={`fixed inset-0 z-300 border-l transition-opacity duration-300 ${isOpen ? ' bg-opacity-50' : 'pointer-events-none bg-transparent'}`} onClick={onClose}>
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

const OverrideForm = ({ overrideData, onSave, onCancel, onRemove }) => {
    const [override, setOverride] = useState(overrideData);
    

    const handleUpdate = (field, value) => {
        setOverride(prev => ({ ...prev, [field]: value }));
    };

    const handleSlotUpdate = (index, updatedSlot) => {
        const newSlots = [...override.slots];
        newSlots[index] = updatedSlot;
        handleUpdate('slots', newSlots);
    };

    const handleAddSlot = () => {
        handleUpdate('slots', [...override.slots, { start: '09:00', end: '17:00' }]);
    };

    const handleRemoveSlot = (index) => {
        handleUpdate('slots', override.slots.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">{override.id ? 'Edit Special Date' : 'Add Special Date'}</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                    type="date"
                    value={override.date}
                    onChange={(e) => handleUpdate('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                    type="text"
                    placeholder="e.g., Holiday, Special Event"
                    value={override.description}
                    onChange={(e) => handleUpdate('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                />
            </div>
            <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-700">Status</span>
                <ToggleSwitch checked={override.isOpen} onChange={() => handleUpdate('isOpen', !override.isOpen)} />
                <span className={`text-sm font-semibold ${override.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {override.isOpen ? 'Open' : 'Closed'}
                </span>
            </div>
            {override.isOpen && (
                <div className="pl-4 border-l-2 border-gray-200 space-y-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={override.is24Hours}
                            onChange={() => handleUpdate('is24Hours', !override.is24Hours)}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-600">Open 24 hours</span>
                    </label>
                    {!override.is24Hours && (
                        <div>
                            {override.slots.map((slot, index) => (
                                <TimeSlot
                                    key={index}
                                    slot={slot}
                                    onUpdate={(updatedSlot) => handleSlotUpdate(index, updatedSlot)}
                                    onRemove={() => handleRemoveSlot(index)}
                                />
                            ))}
                            <button onClick={handleAddSlot} className="mt-2 flex items-center space-x-1 text-sm text-teal-600 hover:text-teal-800 font-medium">
                                <PlusCircle size={16} />
                                <span>Add hours</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t">
                {override.id ? (
                    <button onClick={() => onRemove(override.id)} className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                        <Trash2 size={16} /> Delete
                    </button>
                ) : (<div></div>)}
                <div className="flex gap-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={() => onSave(override)} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
    const { currentStore } = useStore();
    const [schedule, setSchedule] = useState(initialSchedule);
    const [currentStatus, setCurrentStatus] = useState({ isOpen: false, message: 'Closed' });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOverride, setEditingOverride] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch schedule data when component mounts or store changes
    useEffect(() => {
        const fetchScheduleData = async () => {
            if (!currentStore?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
                // Fetch both regular schedule and special shifts
                const schedulePromise = getStoreShifts(currentStore.id);
                const specialShiftsPromise = getStoreSpecialShifts(currentStore.id).catch(err => {
                    console.warn("Failed to load special shifts, using empty array:", err);
                    return { overrides: [] }; // Return empty overrides if special shifts fail
                });
                
                const [scheduleData, specialShiftsData] = await Promise.all([
                    schedulePromise,
                    specialShiftsPromise
                ]);
                
                // Update schedule state with fetched data
                setSchedule(prevSchedule => ({
                    ...prevSchedule,
                    weeklyHours: scheduleData.weeklyHours,
                    overrides: specialShiftsData.overrides || []
                }));
                
            } catch (err) {
                console.error("Failed to load schedule data:", err);
                setError(`Failed to load schedule data: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchScheduleData();
    }, [currentStore?.id]);

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const todayDate = now.toISOString().split('T')[0];
            const todayDayIndex = now.getDay();
            const todayDayName = Object.keys(dayIndexMap).find(key => dayIndexMap[key] === todayDayIndex);
            const currentTime = now.toTimeString().slice(0, 5);

            const override = schedule.overrides.find(o => o.date === todayDate);
            if (override) {
                if (!override.isOpen) {
                    setCurrentStatus({ isOpen: false, message: `Closed today (${override.description})` }); return;
                }
                if (override.is24Hours) {
                    setCurrentStatus({ isOpen: true, message: `Open 24 hours (${override.description})` }); return;
                }
                for (const slot of override.slots) {
                    if (currentTime >= slot.start && currentTime < slot.end) {
                        setCurrentStatus({ isOpen: true, message: `Open until ${slot.end} (${override.description})` }); return;
                    }
                }
                setCurrentStatus({ isOpen: false, message: `Closed now (${override.description})` }); return;
            }

            const daySchedule = schedule.weeklyHours.find(d => d.day === todayDayName);
            if (!daySchedule || !daySchedule.isOpen) {
                setCurrentStatus({ isOpen: false, message: 'Closed today' }); return;
            }
            if (daySchedule.is24Hours) {
                setCurrentStatus({ isOpen: true, message: 'Open 24 hours' }); return;
            }
            for (const slot of daySchedule.slots) {
                if (currentTime >= slot.start && currentTime < slot.end) {
                    setCurrentStatus({ isOpen: true, message: `Open until ${slot.end}` }); return;
                }
            }
            setCurrentStatus({ isOpen: false, message: 'Closed now' });
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, [schedule]);

    const handleUpdateDay = (dayIndex, updatedDay) => {
        const newWeeklyHours = [...schedule.weeklyHours];
        newWeeklyHours[dayIndex] = updatedDay;
        setSchedule({ ...schedule, weeklyHours: newWeeklyHours });
        setHasChanges(true);
    };

    const handleCopyTo = (sourceDay, targetDayNames) => {
        const newWeeklyHours = schedule.weeklyHours.map(day => {
            if (targetDayNames.includes(day.day)) {
                return { ...day, isOpen: sourceDay.isOpen, is24Hours: sourceDay.is24Hours, slots: JSON.parse(JSON.stringify(sourceDay.slots)) };
            }
            return day;
        });
        setSchedule({ ...schedule, weeklyHours: newWeeklyHours });
        setHasChanges(true);
    };

    const openAddModal = () => {
        setEditingOverride({
            date: new Date().toISOString().split('T')[0],
            description: '',
            isOpen: true,
            is24Hours: false,
            slots: [{ start: '09:00', end: '17:00' }]
        });
        setIsModalOpen(true);
    };

    const openEditModal = (override) => {
        setEditingOverride(override);
        setIsModalOpen(true);
    };

    const handleSaveOverride = async (overrideToSave) => {
        try {
            const newId = overrideToSave.id || Date.now();
            let finalOverride = { ...overrideToSave, id: newId };

            const exists = schedule.overrides.some(o => o.id === finalOverride.id);
            
            
            if (currentStore?.id) {
                try {
                    if (exists && finalOverride.apiId) {
                        // Update existing special shift
                        await updateStoreSpecialShift(currentStore.id, finalOverride.apiId, finalOverride);
                    } else if (!exists) {
                        // Create new special shift
                        const createdShift = await createStoreSpecialShift(currentStore.id, finalOverride);
                        // Use the created shift data with API ID
                        finalOverride = createdShift;
                    }
                } catch (error) {
                    console.error('Failed to save special shift via API, updating locally only:', error);
                }
            } else {
            }

            let newOverrides;
            if (exists) {
                newOverrides = schedule.overrides.map(o => o.id === finalOverride.id ? finalOverride : o);
            } else {
                newOverrides = [...schedule.overrides, finalOverride];
            }
            setSchedule({ ...schedule, overrides: newOverrides });
            setHasChanges(true);
            setIsModalOpen(false);
            setEditingOverride(null);
        } catch (error) {
            console.error('Error saving override:', error);
            // Still update locally even if API call fails
            const newId = overrideToSave.id || Date.now();
            const finalOverride = { ...overrideToSave, id: newId };

            const exists = schedule.overrides.some(o => o.id === finalOverride.id);
            let newOverrides;
            if (exists) {
                newOverrides = schedule.overrides.map(o => o.id === finalOverride.id ? finalOverride : o);
            } else {
                newOverrides = [...schedule.overrides, finalOverride];
            }
            setSchedule({ ...schedule, overrides: newOverrides });
            setHasChanges(true);
            setIsModalOpen(false);
            setEditingOverride(null);
        }
    };

    const handleRemoveOverride = async (id) => {
        try {
            const overrideToDelete = schedule.overrides.find(o => o.id === id);
            
            
            // If this override came from the API and we have store context, call the API
            if (currentStore?.id && overrideToDelete?.apiId) {
                try {
                    await deleteStoreSpecialShift(currentStore.id, overrideToDelete.apiId);
                } catch (error) {
                    console.error('Failed to delete special shift via API, removing locally only:', error);
                }
            } else {
                console.log('Skipping API call for delete:', {
                    hasStoreId: !!currentStore?.id,
                    hasApiId: !!overrideToDelete?.apiId
                });
            }

            // Remove from local state regardless of API result
            const newOverrides = schedule.overrides.filter(o => o.id !== id);
            setSchedule({ ...schedule, overrides: newOverrides });
            setHasChanges(true);
            setIsModalOpen(false);
            setEditingOverride(null);
        } catch (error) {
            console.error('Error removing override:', error);
            // Still remove locally even if API call fails
            const newOverrides = schedule.overrides.filter(o => o.id !== id);
            setSchedule({ ...schedule, overrides: newOverrides });
            setHasChanges(true);
            setIsModalOpen(false);
            setEditingOverride(null);
        }
    };

    const handleUpdateSchedule = async () => {
        if (!hasChanges || !currentStore?.id) return;
        
        setIsSaving(true);
        setError(null);
        
        try {
            const response = await updateStoreShifts(currentStore.id, schedule.weeklyHours);
            
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to update schedule:', error);
            setError(`Failed to update schedule: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Function to cancel changes and revert to original data
    const handleCancelChanges = async () => {
        if (!hasChanges || !currentStore?.id) return;
        
        try {
            setIsLoading(true);
            // Re-fetch the original data from API
            const schedulePromise = getStoreShifts(currentStore.id);
            const specialShiftsPromise = getStoreSpecialShifts(currentStore.id).catch(err => {
                console.warn("Failed to load special shifts, using empty array:", err);
                return { overrides: [] };
            });
            
            const [scheduleData, specialShiftsData] = await Promise.all([
                schedulePromise,
                specialShiftsPromise
            ]);
            
            // Reset schedule state with original data
            setSchedule(prevSchedule => ({
                ...prevSchedule,
                weeklyHours: scheduleData.weeklyHours,
                overrides: specialShiftsData.overrides || []
            }));
            
            setHasChanges(false);
            setError(null);
        } catch (err) {
            console.error("Failed to revert changes:", err);
            setError(`Failed to revert changes: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading schedule...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="font-bold text-red-700">Error</p>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* No Store Selected */}
            {!currentStore && !isLoading && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-gray-600">Please select a store to view schedule</p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!isLoading && !error && currentStore && (
                <div>
                    <div className='flex justify-between items-center'>
                        <PanelHeader title="Schedule" />
                        <div className="flex items-center space-x-2">
                    <button onClick={openAddModal} className="flex items-center space-x-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 whitespace-nowrap">
                        <Plus size={20} />
                        <span className="sm:hidden md:inline">Create Override</span>
                    </button>
                    <button onClick={() => setIsDrawerOpen(true)} className="flex items-center space-x-2 bg-white text-teal-600 font-semibold px-4 py-2 rounded-lg border-2 border-teal-600 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 whitespace-nowrap">
                        <Calendar size={20} />
                        <span className="sm:hidden md:inline">View Overrides</span>
                    </button>
                </div>
            </div>



            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
                <div className="p-4 sm:p-6">
                    {schedule.weeklyHours.map((day, index) => (
                        <DayRow key={day.day} day={day} onUpdate={(updatedDay) => handleUpdateDay(index, updatedDay)} onCopyTo={handleCopyTo} />
                    ))}
                </div>
            </div>

            {/* Update Schedule Button */}
            <div className="flex justify-end mb-8 space-x-3">
                {/* Cancel Button - only show if there are changes */}
                {hasChanges && (
                    <button
                        onClick={handleCancelChanges}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                )}
                
                {/* Save/Update Button */}
                <button
                    onClick={handleUpdateSchedule}
                    disabled={!hasChanges || isSaving}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                        hasChanges && !isSaving
                            ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-sm'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                >
                    {isSaving ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating Schedule...
                        </span>
                    ) : (
                        'Update Schedule'
                    )}
                </button>
            </div>

                </div>
            )}

            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                <div className="flex flex-col h-full z-300">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Schedule Overrides</h2>
                        <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <div className="flex-grow p-6 overflow-y-auto space-y-4">
                        {schedule.overrides.length > 0 ? (
                            schedule.overrides.sort((a, b) => new Date(a.date) - new Date(b.date)).map(override => (
                                <div key={override.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                                    <div>
                                        <p className="font-semibold text-gray-800">{new Date(override.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-sm text-gray-600">{override.description}</p>
                                    </div>
                                    <button onClick={() => openEditModal(override)} className="text-teal-600 hover:text-teal-800">
                                        <Edit size={20} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No special dates added yet.</p>
                        )}
                    </div>
                </div>
            </Drawer>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {editingOverride && (
                    <OverrideForm
                        overrideData={editingOverride}
                        onSave={handleSaveOverride}
                        onCancel={() => setIsModalOpen(false)}
                        onRemove={handleRemoveOverride}
                    />
                )}
            </Modal>
        </div>
    );
}
