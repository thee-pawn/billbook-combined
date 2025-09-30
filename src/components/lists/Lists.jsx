import GenericTable from '@components/common/GenericTable';
import { EditIcon, EyeIcon, Trash2Icon, X } from 'lucide-react';
import { Drawer } from '@components/common/Drawer';
import { DeleteConfirmationModal } from '@components/common/DeleteConfirmationModal';
import React, { useEffect, useState } from 'react';
import AppointmentForm from '@components/booking/AppointmentForm';
import { BookingForm } from '@components/booking/BookingForm';
import { EnquiryForm } from '@components/booking/EnquiryForm';
import { bookingsApi, enquiriesApi, appointmentsApi } from '../../apis/APIs';
import { useStore } from '@components/login/StoreContext';
import { useNotification } from '../../contexts/NotificationContext';

// Using shared DeleteConfirmationModal

const AppointmentColumns = [
    { id: 'name', header: 'Name', accessor: 'name', searchable: true, sortable: true },
    { id: 'contact', header: 'Contact', accessor: 'contact', searchable: true },
    { id: 'dateTime', header: 'Date & Time', accessor: 'dateTime', sortable: true, filterable: true, filterType: 'dateRange' },
    { id: 'services', header: 'Service', accessor: 'services', filterable: true },
    { id: 'staff', header: 'Staff', accessor: 'staff', filterable: true },
    { id: 'advanceAmt', header: 'Advance Paid', accessor: 'advanceAmt', filterable: true },
    { id: 'payableAmt', header: 'Payable Amount', accessor: 'payableAmt', filterable: true },
    { id: 'totalAmt', header: 'Total Amount', accessor: 'totalAmt', filterable: true },
    { id: 'status', header: 'Status', accessor: 'status', filterable: true, sortable: true },

]

// Backend data will be loaded; no mocks

const getRowActions = (handleViewOrEdit, handleDelete) => [
    { 
        icon: <EyeIcon className="text-blue-600 hover:text-blue-800" size={16} />, 
        title: 'View',
        onClick: (row) => handleViewOrEdit(row, 'view')
    },
    { 
        icon: <EditIcon className="text-green-600 hover:text-green-800" size={16} />, 
        title: 'Edit',
        onClick: (row) => handleViewOrEdit(row, 'edit')
    },
    { 
        icon: <Trash2Icon className="text-red-600 hover:text-red-800" size={16} />, 
        title: 'Delete',
        onClick: (row) => handleDelete(row)
    }
];


const enquiryColumns = [
    { id: 'name', header: 'Name', accessor: 'name', searchable: true, sortable: true },
    { id: 'contact', header: 'Contact', accessor: 'contact', searchable: true },
    { id: 'source', header: 'Source', accessor: 'source', sortable: true, filterable: true },
    { id: 'type', header: 'Type', accessor: 'type', sortable: true, filterable: true },
    { id: 'followDateTime', header: 'Follow Up Time', accessor: 'followDateTime', sortable: true, filterable: true, filterType: 'dateRange' },
    { id: 'enquiryStatus', header: 'Status', accessor: 'enquiryStatus', filterable: true },
    { id: 'details', header: 'Details', accessor: 'details' }

]

const bookingColumns = [
    { id: 'name', header: 'Name', accessor: 'name', searchable: true, sortable: true },
    { id: 'contact', header: 'Contact', accessor: 'contact', searchable: true },
    { id: 'eventDateTime', header: 'Event Date', accessor: 'eventDateTime', sortable: true, filterable: true, filterType: 'dateRange' },
    { id: 'payableAmt', header: 'Amount', accessor: 'payableAmt', filterable: true, width: "150px" },
    { id: 'advanceAmt', header: 'Advance', accessor: 'advanceAmt', filterable: true },
    { id: 'venue', header: 'Venue', accessor: 'venue', filterable: true },
    { id: 'status', header: 'Status', accessor: 'status', filterable: true, sortable: true },

]


// Using shared Drawer

// Placeholder component for the Booking List
const BookingListComponent = ({ data, onAction, handleDelete }) => (
    <GenericTable
        columns={bookingColumns}
        data={data}
        rowActions={getRowActions(onAction, handleDelete)}
        defaultSort={{ key: 'bookingDateTime', direction: 'descending' }}
    />
);

// Placeholder component for the Enquiry List
const EnquiryListComponent = ({ data, onAction, handleDelete }) => (
    <GenericTable
        columns={enquiryColumns}
        data={data}
        rowActions={getRowActions(onAction, handleDelete)}
        defaultSort={{ key: 'followDateTime', direction: 'descending' }}
    />
);

// Placeholder component for the Appointment List
const AppointmentListComponent = ({ data, onAction, handleDelete }) => (
    <GenericTable
        columns={AppointmentColumns}
        data={data}
        rowActions={getRowActions(onAction, handleDelete)}
        defaultSort={{ key: 'dateTime', direction: 'descending' }}
    />
);

// Main App Component
export default function Lists() {
    const { currentStore } = useStore();
    const { showNotification } = useNotification();
    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = `${d.getMonth() + 1}`.padStart(2, '0');
        const day = `${d.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [startDate, setStartDate] = useState('2025-06-01');
    const [endDate, setEndDate] = useState(formatDate(new Date()));
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerContent, setDrawerContent] = useState(null);
    const [drawerTitle, setDrawerTitle] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [bookingRows, setBookingRows] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [enquiryRows, setEnquiryRows] = useState([]);
    const [loadingEnquiries, setLoadingEnquiries] = useState(false);
    const [enquiryError, setEnquiryError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [appointmentRows, setAppointmentRows] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [appointmentError, setAppointmentError] = useState(null);

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setDrawerContent(null);
        setSelectedItem(null);
    };

    const handleViewOrEdit = async (row, action) => {
        setSelectedItem(row);
        setIsDrawerOpen(true);

        switch (activeView) {
            case 'appointment':
                setDrawerTitle(action === 'view' ? 'View Appointment' : 'Edit Appointment');
                setDrawerContent(
                    <AppointmentForm 
                        appointment={row?.__record}
                        onSave={(data) => {
                            loadAppointments();
                            handleDrawerClose();
                        }}
                        onCancel={handleDrawerClose}
                        newAppointment={false}
                        customers={[]}
                        services={[]}
                        staff={[]}
                        statuses={['Pending', 'Confirmed', 'Cancelled']}
                        isReadOnly={action === 'view'}
                    />
                );
                break;
            case 'booking': {
                setDrawerTitle(action === 'view' ? 'View Booking' : 'Edit Booking');
                // Show a lightweight loading state while fetching full booking details (items/services)
                setDrawerContent(<div className="p-4 text-sm text-gray-600">Loading booking…</div>);

                let record = row?.__record;
                if (currentStore?.id && record?.id) {
                    try {
                        const resp = await bookingsApi.getById(currentStore.id, record.id);
                        // If API returns separate booking and items, merge them
                        if (resp?.data?.booking) {
                            const merged = { ...(resp.data.booking || {}), items: resp.data.items || resp.data.booking.items || [] };
                            record = merged;
                        } else {
                            // Prefer deeply nested data.data (common shape), then data
                            const fullRecord = 
                                resp?.data?.data ||
                                (resp?.data && !resp?.data?.data ? resp.data : null) ||
                                resp ||
                                record;
                            record = fullRecord;
                        }
                    } catch (err) {
                        console.error('Failed to fetch booking details, falling back to list record:', err);
                    }
                }

                setDrawerContent(
                    <BookingForm
                        booking={record}
                        onSave={(data) => {
                            // reload bookings after save
                            loadBookings();
                            handleDrawerClose();
                        }}
                        onCancel={handleDrawerClose}
                        mode={action === 'view'? 'view' : 'edit'}
                    />
                );
                break;
            }
            case 'enquiry':
                setDrawerTitle(action === 'view' ? 'View Enquiry' : 'Edit Enquiry');
                setDrawerContent(
                    <EnquiryForm
                        enquiry={row?.__record}
                        onSave={(data) => {
                            loadEnquiries();
                            handleDrawerClose();
                        }}
                        onCancel={handleDrawerClose}
                        mode={action === 'view' ? 'view' : 'edit'}
                    />
                );
                break;
            default:
                break;
        }
    };

    const handleDelete = (row) => {
        setItemToDelete(row);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (activeView === 'booking' && itemToDelete?.__record?.id && currentStore?.id) {
                await bookingsApi.delete(currentStore.id, itemToDelete.__record.id);
                await loadBookings();
            } else if (activeView === 'enquiry' && itemToDelete?.__record?.id && currentStore?.id) {
                await enquiriesApi.delete(currentStore.id, itemToDelete.__record.id);
                await loadEnquiries();
            } else if (activeView === 'appointment' && itemToDelete?.__record?.id && currentStore?.id) {
                await appointmentsApi.delete(currentStore.id, itemToDelete.__record.id);
                await loadAppointments();
            }
        } catch (e) {
            console.error('Failed to delete:', e);
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const setDateRange = (range) => {
        const today = new Date();
        const end = new Date(today);
        let start = new Date(today);

        switch (range) {
            case 'today':
                break;
            case 'week':
                start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                break;
            case 'month':
                start.setDate(1); // First day of the current month
                break;
            case 'last7':
                start.setDate(today.getDate() - 7); // Last 7 days
                break;
            case 'last30':
                start.setDate(today.getDate() - 30); // Last 30 days
                break;
            default:
                break;
        }

        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
    };

    const handleFilter = () => {
        showNotification(`Filtering data from ${startDate} to ${endDate}. Check the console.`, 'info');
    };
    // State to keep track of the active view. 'enquiry' is the default.
    const [activeView, setActiveView] = useState('enquiry');

    // Load bookings
    const mapBookingToRow = (b) => {
        const customerName = b.customer_name || b.customerName || b.customer?.name || '';
        const countryCode = b.country_code || b.countryCode || '';
        const contactNo = b.contact_no || b.contactNo || b.customer?.contact_no || '';
        const bookingDT = b.booking_datetime || b.bookingDatetime || b.created_at || b.createdAt || '';
        const items = b.items || b.booking_items || b.services || [];
        const first = items[0] || {};
        const serviceName = first.service_name || first.serviceName || first.service?.name || first.service_id || first.serviceId || '';
        const eventDT = first.scheduled_at || first.scheduledAt || '';
    const venueType = (b.venue_type || b.venueType || 'indoor').toLowerCase();
    const venue = venueType === 'outdoor' ? (first.venue || b.venue || 'Outdoor') : 'Indoor';
        const payable = b.payable_amount ?? b.payableAmount ?? '';
        const advance = b.advance_amount ?? b.advanceAmount ?? '';
        return {
            __record: b,
            name: customerName,
            contact: `${countryCode}${contactNo}`,
            bookingDateTime: bookingDT,
            service: serviceName,
            eventDateTime: eventDT,
            payableAmt: payable,
            advanceAmt: advance,
            venue,
            status: b.status || ''
        };
    };

    const loadBookings = async () => {
        if (!currentStore?.id) return;
        setLoadingBookings(true); setBookingError(null);
        try {
            const resp = await bookingsApi.list(currentStore.id, { page: 1, limit: 20 });
            const candidates = [
                resp?.data?.bookings,
                resp?.bookings,
                resp?.data?.items,
                resp?.items,
                resp?.data?.results,
                resp?.results,
                resp?.data?.data,
                resp?.data?.list,
            ];
            const list = candidates.find(a => Array.isArray(a)) || [];
            const items = list.map(mapBookingToRow);
            setBookingRows(items);
        } catch (e) {
            setBookingError('Failed to load bookings');
            setBookingRows([]);
        } finally {
            setLoadingBookings(false);
        }
    };

    useEffect(() => { if (activeView === 'booking') loadBookings(); }, [activeView, currentStore?.id]);

    // Load enquiries
    const mapEnquiryToRow = (e) => ({
        __record: e,
        name: e.name,
        contact: `${e.country_code || ''}${e.contact_no || ''}`,
        source: e.source,
        type: e.enquiry_type,
        followDateTime: e.follow_up_at,
        enquiryStatus: e.enquiry_status,
        details: (e.details || e.enquiry_details || []).map(d => d.name).join(', ')
    });

    const loadEnquiries = async () => {
        if (!currentStore?.id) return;
        setLoadingEnquiries(true); setEnquiryError(null);
        try {
            const resp = await enquiriesApi.list(currentStore.id, { page: 1, limit: 20 });
            const list = resp?.data?.enquiries || resp?.enquiries || [];
            setEnquiryRows(list.map(mapEnquiryToRow));
        } catch (e) {
            setEnquiryError('Failed to load enquiries');
            setEnquiryRows([]);
        } finally { setLoadingEnquiries(false); }
    };

    useEffect(() => { if (activeView === 'enquiry') loadEnquiries(); }, [activeView, currentStore?.id]);

    // Load appointments
    const mapAppointmentToRow = (a) => ({
        __record: a,
        name: a.customer_name || a.customerName || a.name,
        contact: `${a.country_code || ''}${a.contact_no || a.phone_number || ''}`,
        dateTime: a.date_time || (a.date && a.time ? `${a.date} ${a.time}` : a.dateTime),
        services: (a.services || a.items || []).map(s => s.service_name || s.name).filter(Boolean).join(', '),
        staff: (a.services || a.items || []).map(s => s.staff_name || s.staff).filter(Boolean).join(', '),
        advanceAmt: a.advance_amount || a.advanceAmt,
        payableAmt: a.payable_amount || a.payableAmt,
        totalAmt: a.total_amount || a.totalAmt,
        status: a.status
    });

    const loadAppointments = async () => {
        if (!currentStore?.id) return;
        setLoadingAppointments(true); setAppointmentError(null);
        try {
            const resp = await appointmentsApi.list(currentStore.id, { page: 1, limit: 20 });
            const list = resp?.data?.appointments || resp?.appointments || [];
            setAppointmentRows(list.map(mapAppointmentToRow));
        } catch (e) {
            setAppointmentError('Failed to load appointments');
            setAppointmentRows([]);
        } finally { setLoadingAppointments(false); }
    };

    useEffect(() => { if (activeView === 'appointment') loadAppointments(); }, [activeView, currentStore?.id]);

    // Function to render the correct component based on the active view
    const renderContent = () => {
        switch (activeView) {
            case 'booking':
                return <BookingListComponent data={bookingRows} onAction={handleViewOrEdit} handleDelete={handleDelete} />;
            case 'enquiry':
                return <EnquiryListComponent data={enquiryRows} onAction={handleViewOrEdit} handleDelete={handleDelete} />;
            case 'appointment':
                return <AppointmentListComponent data={appointmentRows} onAction={handleViewOrEdit} handleDelete={handleDelete} />;
            default:
                return <EnquiryListComponent onAction={handleViewOrEdit} handleDelete={handleDelete} />;
        }
    };

    // A helper function to determine button classes for styling
    const getButtonClasses = (viewName) => {
        const baseClasses = "flex-1 py-3 px-4 text-center text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-300 ease-in-out";
        if (activeView === viewName) {
            return `${baseClasses} bg-teal-500 text-white`;
        }
        return `${baseClasses} bg-white text-gray-700 hover:bg-gray-100`;
    };

    return (
        <div className="p-4 mx-4">

            


            <div className="flex flex-row sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex rounded-xl border border-gray-200 overflow-hidden shadow-sm border-gray-300 font-bold text-teal-700 w-1/2">
                    <button
                        onClick={() => setActiveView('appointment')}
                        className={`${getButtonClasses('appointment')} rounded-l-lg border-r border-gray-300 w-1/3`}
                    >
                        Appointments
                    </button>
                    <button
                        onClick={() => setActiveView('booking')}
                        className={`${getButtonClasses('booking')}  border-r text-3xl border-gray-300 w-1/3`}
                    >
                        Bookings
                    </button>
                    <button
                        onClick={() => setActiveView('enquiry')}
                        className={`${getButtonClasses('enquiry')} rounded-r-lg border-r border-gray-300 w-1/3`}
                    >
                        Enquiries
                    </button>


                </div>
                <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg shadow-sm justify-end">
                    <div className="flex items-center">
                        <select
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 pr-8 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                            defaultValue=""
                        >
                            <option value="" disabled>Select Date Range</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="last7">Last 7 Days</option>
                            <option value="last30">Last 30 Days</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 border-l pl-2">
                        <div>
                            {/* <label htmlFor="startDate" className="text-xs text-gray-500 block">Start Date</label> */}
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-1 rounded-md border-gray-300 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            {/* <label htmlFor="endDate" className="text-xs text-gray-500 block">End Date</label> */}
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-1 rounded-md border-gray-300 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <button onClick={handleFilter} className="self-end h-full px-4 py-1 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-colors">Apply</button>
                    </div>
                </div>
            </div>

            {/* Dynamically Rendered Content */}
            <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
                {renderContent()}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Confirm Delete"
                message={`Do you want to delete this ${activeView}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />

            {/* Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
                title={drawerTitle}
                width={drawerTitle.includes('Booking') ? 'min(1200px, 95vw)' : undefined}
            >
                {drawerContent}
            </Drawer>
        </div>
    );
}
