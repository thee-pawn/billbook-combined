import { Collapse } from 'antd';
import { Calendar, List } from 'lucide-react';
import { Drawer } from '@components/common/Drawer';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentCalendar from './booking/AppointmentCalendar';
import AppointmentForm from './booking/AppointmentForm';
import Stats from './booking/Stats';
import { BookingForm } from './booking/BookingForm';
import { EnquiryForm } from './booking/EnquiryForm';
import Lists from './lists/Lists';
import { staffApi, appointmentsApi, storesApi } from '../apis/APIs';
import { useStore } from './login/StoreContext';
import { useNotification } from '../contexts/NotificationContext';

// No mock data; will load from backend
const appointmentStatuses = [
  { id: 'booked', name: 'Booked', color: 'bg-yellow-300 border-yellow-400' }, // From image example
  { id: 'cancelled', name: 'Cancelled', color: 'bg-red-300 border-red-400' },
  { id: 'inProgress', name: 'In Progress', color: 'bg-orange-300 border-orange-400' },
  { id: 'completed', name: 'Completed', color: 'bg-green-300 border-green-400' },
  { id: 'billed', name: 'Billed', color: 'bg-blue-300 border-blue-400' },
  { id: 'default', name: 'Default', color: 'bg-gray-200 border-gray-300' }, // Added more statuses for variety
  // Added more statuses for variety
];  

// --- Helper Components ---

// Simple Modal Wrapper
const Modal = ({ isOpen, onClose, title, children, widthClass }) => { // Default width
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-1">
      {/* Apply widthClass here */}
      <div className={`bg-white rounded-lg shadow-xl  ${widthClass} max-h-[90vh] overflow-y-auto flex flex-col border-2`}>
         {/* Sticky Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-1 border-b-1 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-teal-500">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
         {/* Scrollable Content Area */}
        <div className="flex-grow  p-4 md:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Using shared Drawer

// Simple Stat Card
const StatCard = ({ title, value, bgColor = 'bg-gray-100', borderColor }) => (
  <div className={`${bgColor} p-3 rounded-lg shadow text-center border`} style={{ borderWidth: '2px', borderColor: borderColor }}>
    <div className="text-sm text-gray-600">{title}</div>
    <div className="text-xl font-bold text-gray-800">{value}</div>
  </div>
);

const StatCard2 = ({ title, value, bgColor = 'bg-gray-100', borderColor }) => (
  <div className={`${bgColor} p-3 rounded-lg shadow text-center border`} style={{ borderWidth: '2px', borderColor: borderColor }}>
    <div className="text-sm text-gray-600">{title} : <b>{value}</b></div>
  
  </div>
);

// Calendar Icon
const CalendarIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);

// Filter Icon
const FilterIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
);

// MODIFICATION: New Staff Filter Popover Component
const StaffFilterPopover = ({ isOpen, onClose, staffList, selectedIds, selectedStatuses, onStaffSelectionChange, onStatusSelectionChange,  onStaffSelectAll, onStaffDeselectAll, onStatusSelectAll, onStatusDeselectAll }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-2 w-150 bg-white border border-gray-300 rounded-lg shadow-xl z-200">
      <div className='grid grid-cols-2'>
        <div className="p-3 ">
          <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-md">Filter by Staff</h4>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <div className="flex justify-between mb-3 px-1">
              <button onClick={onStaffSelectAll} className="text-xs text-teal-600 hover:underline font-semibold">Select All</button>
              <button onClick={onStaffDeselectAll} className="text-xs text-red-600 hover:underline font-semibold">Deselect All</button>
          </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {staffList.map(staff => (
                <label key={staff.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(staff.id)}
                    onChange={() => onStaffSelectionChange(staff.id)}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-gray-700">{staff.name}</span>
                </label>
              ))}
          </div>
        </div>
        <div className="p-3 ">
          <div className="flex justify-between items-center mb-2 border-l border-gray-200 pl-3">
              <h4 className="font-bold text-md">Filter by Status</h4>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <div className="flex justify-between mb-3 px-1">
              <button onClick={onStatusSelectAll} className="text-xs text-teal-600 hover:underline font-semibold">Select All</button>
              <button onClick={onStatusDeselectAll} className="text-xs text-red-600 hover:underline font-semibold">Deselect All</button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
              {appointmentStatuses.map(status => (
                <label key={status.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status.id)}
                    onChange={() => onStatusSelectionChange(status.id)}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-gray-700">{status.name}</span>
                </label>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Appointment Scheduler Component ---

function BookingCalendar() {
  const navigate = useNavigate();
  const { currentStore } = useStore();
  const { showNotification } = useNotification();
  // --- State ---
  const [isListView, setIsListView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [availability, setAvailability] = useState({ opening: '09:00', closing: '21:00', isOpen: true });
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [isEnquiryFormOpen, setIsEnquiryFormOpen] = useState(false); // For stats modal
  // For booking form modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [newAppointment, setIsNewAppointment] = useState(false); // For loading state
  const [isExpanded, setIsExpanded] = useState(false); // For editing/viewing details/pre-filling
  
  // MODIFICATION: State for staff filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(() => appointmentStatuses.map(s => s.id));
  // Derived filtered events are computed via useMemo

  // --- Derived State & Constants ---
  const timeSlots = useMemo(() => {
    // Build slots based on availability opening/closing
    const toMinutes = (t) => {
      if (!t) return 0;
      const parts = String(t).split(':');
      const h = parseInt(parts[0] || '0', 10);
      const m = parseInt(parts[1] || '0', 10);
      return h * 60 + m;
    };
    const fromMinutes = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const start = toMinutes(availability.opening || '09:00');
    const end = toMinutes(availability.closing || '21:00');
    const slots = [];
    for (let t = start; t <= end; t += 30) slots.push(fromMinutes(t));
    return slots;
  }, [availability.opening, availability.closing]);

  const formattedSelectedDate = selectedDate.toLocaleDateString('en-CA');

  const appointmentsForSelectedDate = useMemo(() => {
    const compareDate = selectedDate.toISOString().split('T')[0];
    return appointments.filter(appt => appt.date === compareDate);
  }, [appointments, selectedDate]);

  // MODIFICATION: Memoized lists based on staff filter
  const filteredStaff = useMemo(() => {
    if (!selectedStaffIds.length) return staffList;
    return staffList.filter(staff => selectedStaffIds.includes(staff.id));
  }, [selectedStaffIds, staffList]);

  // const filteredEvents = useMemo(() => {

    
  //   return mockEvents.filter(event => {
  //     selectedStatuses.includes(event.status)
  //   }
  //   );
  // }, [selectedStatuses]);


  // --- Handlers ---
  const handleDateChange = (event) => {
    const [year, month, day] = event.target.value.split('-');
    setSelectedDate(new Date(year, month - 1, day));
  };

  // MODIFICATION: Handlers for the filter popover
  const handleStaffSelectionChange = (staffId) => {
    setSelectedStaffIds(prevIds => 
      prevIds.includes(staffId) 
        ? prevIds.filter(id => id !== staffId) 
        : [...prevIds, staffId]
    );
  };

  const handleStatusChange = (statusId) => {
    setSelectedStatuses(prevIds => 
      prevIds.includes(statusId) 
        ? prevIds.filter(id => id !== statusId) 
        : [...prevIds, statusId]
    );
  };

  const handleSelectAllStatus = () => setSelectedStatuses(appointmentStatuses.map(s => s.id));
  const handleDeselectAllStatus = () => setSelectedStatuses([]);

  const handleSelectAllStaff = () => setSelectedStaffIds(staffList.map(s => s.id));
  const handleDeselectAllStaff = () => setSelectedStaffIds([]);


  const handleOpenAppointmentModal = (appointmentData = null) => {
    const defaultDateStr = selectedDate.toLocaleDateString('en-CA');
    setIsNewAppointment(true);
    setCurrentAppointment(appointmentData || { 
      id: null,
        date: appointmentData?.date || defaultDateStr,
        time: appointmentData?.time || timeSlots[0] || '09:00',
        staffId: appointmentData?.staffId || null,
      duration: 60,
      status: 'Booked',
    });
    setIsAppointmentModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleOpenBookingModal = () => {
    setIsBookingFormOpen(true);
  };

  const handleOpenBillingModal = () => {
    navigate('/billing');
  };

  const handleCloseModals = () => {
    setIsAppointmentModalOpen(false);
    setIsBillingModalOpen(false);
    setIsDetailModalOpen(false);
    setIsEnquiryFormOpen(false);
    setIsBookingFormOpen(false);
    setCurrentAppointment(null);
  };

  const handleSaveAppointment = (appointmentData) => {
    if (appointmentData.id) {
      setAppointments(appointments.map(appt =>
        appt.id === appointmentData.id ? { ...appt, ...appointmentData } : appt
      ));
    } else {
      const newAppointment = {
        ...appointmentData,
        id: `appt-${Date.now()}`,
      };
      setAppointments([...appointments, newAppointment]);
    }
    handleCloseModals();
  };

  // Grid click from AppointmentCalendar: laneIndex 0 = Unassigned, 1..N map to filteredStaff[0..N-1]
  const handleSlotClick = (time, laneIndex) => {
    const defaultDateStr = selectedDate.toLocaleDateString('en-CA');
    let newStaffId = null;
    if (typeof laneIndex === 'number' && laneIndex > 0) {
      const idx = laneIndex - 1; // lane 1 is first staff, since 0 is Unassigned
      const staff = filteredStaff[idx];
      newStaffId = staff ? staff.id : null;
    }
    handleOpenAppointmentModal({ id: null, staffId: newStaffId, date: defaultDateStr, time, duration: 60, status: 'Booked' });
  };

  const handleAppointmentClick = async (appointment) => {
    setIsNewAppointment(false);
    let record = appointment;
    const idForFetch = appointment?.appointmentId || appointment?.id;
    if (currentStore?.id && idForFetch && appointmentsApi.getById) {
      try {
        const resp = await appointmentsApi.getById(currentStore.id, idForFetch);
        // Prefer nested data shapes similar to bookings
        const full = resp?.data?.appointment || resp?.appointment || resp?.data?.data || resp?.data || resp || appointment;
        record = full;
      } catch (e) {
        console.error('Failed to fetch full appointment by id, using clicked event data', e);
      }
    }
    setCurrentAppointment(record);
    setIsDetailModalOpen(true);
    setIsAppointmentModalOpen(true);
  };

  const handleEnquiryModal = () => {
    setIsEnquiryFormOpen(true);
  };

  // Load staff list
  useEffect(() => {
    if (!currentStore?.id) return;
    let active = true;
    (async () => {
      setLoadingStaff(true);
      try {
        const res = await staffApi.getStaff(currentStore.id, 1, 100, 'active');
        if (!active) return;
        const list = res?.data || res?.staff || [];
        const mapped = list.map(s => ({ id: s.id || s.staffId, name: s.name || s.personal?.name || '—' }));
        setStaffList(mapped);
        setSelectedStaffIds(mapped.map(s => s.id));
      } catch (e) {
        console.error('Failed to load staff', e);
        setStaffList([]);
      } finally { if (active) setLoadingStaff(false); }
    })();
    return () => { active = false; };
  }, [currentStore?.id]);

  // Load store availability for selected date
  useEffect(() => {
    if (!currentStore?.id || !selectedDate) return;
    let active = true;
    (async () => {
      try {
        const ymd = selectedDate.toLocaleDateString('en-CA');
        const res = await storesApi.getAvailability(currentStore.id, ymd);
        if (!active) return;
        const opening = (res.opening || '09:00').slice(0,5);
        const closing = (res.closing || '21:00').slice(0,5);
        setAvailability({ opening, closing, isOpen: !!res.isOpen });
      } catch (e) {
        console.error('Failed to load availability', e);
        setAvailability({ opening: '09:00', closing: '21:00', isOpen: true });
      }
    })();
    return () => { active = false; };
  }, [currentStore?.id, selectedDate]);

  // Helper: normalize status from backend to our filter IDs
  const normalizeStatus = (s) => {
    if (!s) return 'booked';
    const v = String(s).trim().toLowerCase();
    if (v === 'scheduled' || v === 'booked') return 'booked';
    if (v === 'in_progress' || v === 'in-progress' || v === 'inprogress') return 'inProgress';
    if (v === 'completed' || v === 'done' || v === 'finished') return 'completed';
    if (v === 'cancelled' || v === 'canceled') return 'cancelled';
    if (v === 'billed' || v === 'paid' || v === 'invoiced') return 'billed';
    return 'booked';
  };

  // Load appointments for selected date
  useEffect(() => {
    if (!currentStore?.id || !selectedDate) return;
    let active = true;
    (async () => {
      setLoadingAppointments(true);
      try {
        const ymd = selectedDate.toLocaleDateString('en-CA');
        const res = await appointmentsApi.list(currentStore.id, { date: ymd, limit: 200 });
        if (!active) return;
        // Extract list from various shapes
        const list = res?.data?.appointments || res?.appointments || res?.data?.items || res?.items || [];
        const mapToBase = (a) => {
          const toHM = (iso) => {
            if (!iso) return null;
            const d = new Date(iso);
            return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
          };
          const rawItems = (a.services || a.items || []);
          const services = rawItems.map(s => ({ name: s.service_name || s.name || 'Service', duration: s.duration || '' }));
          // collect all staff ids from services
          const perServiceStaffIds = Array.from(new Set(rawItems.map(s => s.staff_id || s.staffId).filter(Boolean)));
          const staffId = a.staff_id || a.staffId || perServiceStaffIds[0] || null;
          // Prefer explicit time fields, else derive from date_time
          const startHM = a.time || toHM(a.date_time) || toHM(a.scheduled_at) || '09:00';
          const duration = a.total_duration_minutes || a.duration || 60;
          // Compute end time
          const [sh, sm] = startHM.split(':').map(n=>parseInt(n,10));
          const endDate = new Date(); endDate.setHours(sh, sm + Number(duration), 0, 0);
          const endHM = `${String(endDate.getHours()).padStart(2,'0')}:${String(endDate.getMinutes()).padStart(2,'0')}`;
          const base = {
            appointmentId: a.id,
            customerName: a.customer_name || a.customerName || a.name || '',
            contactNo: `${a.country_code || a.countryCode || ''}${a.contact_no || a.contactNo || ''}`,
            startTime: startHM,
            endTime: endHM,
            services,
            status: normalizeStatus(a.status),
            date: a.date || (a.date_time ? new Date(a.date_time).toLocaleDateString('en-CA') : ymd)
          };
          return { base, perServiceStaffIds, staffId };
        };
        // Expand events: if appointment has multiple services with different staff, create one event per staff
        const expanded = list.flatMap(a => {
          const { base, perServiceStaffIds, staffId } = mapToBase(a);
          const ids = perServiceStaffIds.length ? perServiceStaffIds : [staffId];
          const uniqueIds = Array.from(new Set((ids || []).filter(id => id !== undefined)));
          if (!uniqueIds.length) {
            return [{ id: `${base.appointmentId}:unassigned`, staffId: null, ...base }];
          }
          return uniqueIds.map(sid => ({ id: `${base.appointmentId}:${sid}`, staffId: sid, ...base }));
        });
        setAppointments(expanded);
      } catch (e) {
        console.error('Failed to load appointments', e);
        setAppointments([]);
      } finally { if (active) setLoadingAppointments(false); }
    })();
    return () => { active = false; };
  }, [currentStore?.id, selectedDate]);

  const eventsForCalendar = useMemo(() => {
    // Filter by selected staff and statuses (string-compare IDs to avoid type mismatches)
    const selectedStaffStr = new Set((selectedStaffIds || []).map(id => String(id)));
    const selectedStatusSet = new Set((selectedStatuses || []).map(s => s));
    return appointments
      .filter(ev => (!selectedStaffStr.size || (ev.staffId ? selectedStaffStr.has(String(ev.staffId)) : true)))
      .filter(ev => (!selectedStatusSet.size || selectedStatusSet.has(ev.status)));
  }, [appointments, selectedStaffIds, selectedStatuses]);

  return (
    <div className="flex flex-col h-[85vh] bg-gray-50 font-sans overflow-hidden">
      <div className='px-4'>
        <Stats />
      </div>
      
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-4 mb-4 p-3 bg-white rounded-lg shadow">
        <div className="flex items-center gap-2 px-4">
           
           <input
             type="date"
             value={formattedSelectedDate}
             onChange={handleDateChange}
             className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
           />
           {/* MODIFICATION: Filter button and popover */}
           <div className="relative">
            {!isListView && <button
              onClick={() => setIsFilterOpen(prev => !prev)}
              className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded"
            >
            <FilterIcon/>
            </button>}
             <button
                onClick={() => setIsListView(prev => !prev)}
                className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded ml-2"
                title={isListView ? "Switch to Calendar View" : "Switch to List View"}
             >
              {isListView ? <Calendar size={20} color='teal' /> : <List size={20} color='teal'/>}
             </button>
         <StaffFilterPopover
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
           staffList={staffList}
              selectedIds={selectedStaffIds}
              selectedStatuses={selectedStatuses}
              onStaffSelectionChange={handleStaffSelectionChange}
              onStatusSelectionChange={handleStatusChange}
              onStaffSelectAll={handleSelectAllStaff}
              onStaffDeselectAll={handleDeselectAllStaff}
              onStatusSelectAll={handleSelectAllStatus}
              onStatusDeselectAll={handleDeselectAllStatus}
              />
           </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenBookingModal()}
            className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium py-1.5 px-3 rounded shadow focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            + New Booking
          </button>
          <button
            onClick={() => handleEnquiryModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-1.5 px-3 rounded shadow focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            + New Enquiry
          </button>
          <button
            onClick={() => handleOpenAppointmentModal()}
            className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-1.5 px-3 rounded shadow focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            + New Appointment
          </button>
          <button
            onClick={handleOpenBillingModal}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1.5 px-3 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            + New Bill
          </button>
        </div>
      </div>

      <div className="flex-grow bg-white rounded-lg shadow overflow-auto relative">
        {isListView ? (
          <Lists />
        ) : (
          <AppointmentCalendar
              events={eventsForCalendar}
              staff={filteredStaff}
              dayStartTime={availability.opening || '08:00'}
              dayEndTime={availability.closing || '22:00'}
              eventCalcUnitMinutes={5}
              heightPerCalcUnitPx={12}
              visualGridIntervalMinutes={15}
              onGridClick={handleSlotClick}
              onAppointmentClick={handleAppointmentClick}
          />
        )}
      </div>

      <Drawer isOpen={isAppointmentModalOpen} onClose={handleCloseModals} title={newAppointment ? "Add Appointment" : "Edit Appointment"}>
        {currentAppointment && (
          <AppointmentForm
            appointment={currentAppointment}
            customers={[]}
            services={[]}
            staff={staffList}
            statuses={appointmentStatuses}
            onSave={handleSaveAppointment}
            onCancel={handleOpenBillingModal}
            newAppointment={newAppointment}
          />
        )}
      </Drawer>

      <Drawer isOpen={isBookingFormOpen} onClose={handleCloseModals} title="Add Booking" width={'min(1200px, 95vw)'}>
        <BookingForm/>
      </Drawer>

      <Drawer isOpen={isEnquiryFormOpen} onClose={handleCloseModals} title="Add Enquiry">
        <EnquiryForm/>
      </Drawer>
    </div>
  );
}

export default BookingCalendar;