import React, { useState, useMemo, useEffect } from 'react';
import { Clock, User, X, ChevronLeft, ChevronRight, Pencil, Save, Ban, Briefcase, Bed, Meh, PartyPopper } from 'lucide-react';

// --- Mock Data ---
// Attendance records now include `status` and `leaveType` for more detailed tracking.
const initialStaffMembers = [
    {
        id: 1,
        name: 'John Doe',
        attendance: [
            { date: '2025-07-01', inTime: '09:15', outTime: '18:45', status: 'present', leaveType: null },
            { date: '2025-07-02', inTime: '09:00', outTime: '13:00', status: 'present', leaveType: null }, // First half
            { date: '2025-07-03', status: 'on_leave', leaveType: 'sick' },
            { date: '2025-07-04', status: 'on_leave', leaveType: 'pto' },
            { date: '2025-07-08', status: 'holiday', leaveType: 'holiday'},
            { date: '2025-07-10', inTime: '09:01', outTime: '', status: 'present', leaveType: null }, // Today
        ]
    },
    {
        id: 2,
        name: 'Jane Smith',
        attendance: [
            { date: '2025-07-01', inTime: '09:00', outTime: '18:30', status: 'present', leaveType: null },
            { date: '2025-07-07', status: 'on_leave', leaveType: 'unpaid' },
            { date: '2026-02-20', inTime: '10:00', outTime: '18:00', status: 'present', leaveType: null },
        ]
    }
];

// --- Configuration ---
const ATTENDANCE_RULES = {
    FIRST_HALF_ENDS: '13:00',
    SECOND_HALF_STARTS: '14:00',
    FULL_DAY_START: '09:00',
    FULL_DAY_END: '18:30',
};

const LEAVE_TYPES = {
    pto: { label: 'PTO', color: 'bg-blue', icon: Briefcase },
    sick: { label: 'Sick Leave', color: 'bg-orange', icon: Bed },
    unpaid: { label: 'Unpaid', color: 'bg-yellow', icon: Meh },
    holiday: { label: 'Holiday', color: 'bg-purple', icon: PartyPopper }
};

// --- Helper & Logic Functions ---
const timeToMinutes = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTime12Hour = (time24) => {
    if (!time24) return 'N/A';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
};

const getCurrentTime24 = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const getAttendanceDisplay = (record) => {
    if (!record || !record.status) {
        return { status: 'No Record', color: 'bg-gray-400' };
    }

    if (record.status === 'on_leave' || record.status === 'holiday') {
        const type = LEAVE_TYPES[record.leaveType];
        return { status: type.label, color: type.color };
    }

    if (record.status === 'present') {
        const inMinutes = timeToMinutes(record.inTime);
        const outMinutes = timeToMinutes(record.outTime);

        if (!inMinutes || !outMinutes || inMinutes === outMinutes) {
            return { status: 'Absent', color: 'bg-red-500' };
        }

        const firstHalfEndMinutes = timeToMinutes(ATTENDANCE_RULES.FIRST_HALF_ENDS);
        const secondHalfStartMinutes = timeToMinutes(ATTENDANCE_RULES.SECOND_HALF_STARTS);

        const isPresentFirstHalf = inMinutes <= firstHalfEndMinutes && outMinutes > inMinutes; // Changed to <= to include exact end time
        const isPresentSecondHalf = outMinutes >= secondHalfStartMinutes && inMinutes < outMinutes; // Changed to >= to include exact start time

        if (isPresentFirstHalf && isPresentSecondHalf) return { status: 'Full Day', color: 'bg-green-500' };
        if (isPresentFirstHalf) return { status: 'First Half', color: 'linear-gradient(to bottom, #22c55e 50%, #ef4444 50%)' };
        if (isPresentSecondHalf) return { status: 'Second Half', color: 'linear-gradient(to bottom, #ef4444 50%, #22c55e 50%)' };
    }

    return { status: 'Absent', color: 'bg-red-500' };
};


// --- Child Components for Details Pane ---

const AggregatedDataView = ({ staff, currentDate }) => {
    const monthlyData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

        let presentDays = 0;
        let onLeaveDays = 0;

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = staff.attendance.find(a => a.date === dateStr);
            if (!record) continue;
            
            if (record.status === 'on_leave' || record.status === 'holiday') {
                onLeaveDays += 1;
            } else if (record.status === 'present') {
                const display = getAttendanceDisplay(record);
                if (display.status === 'Full Day') presentDays += 1;
                else if (display.status === 'First Half' || display.status === 'Second Half') presentDays += 0.5;
            }
        }
        
        const absentDays = totalDaysInMonth - presentDays - onLeaveDays;
        
        return { presentDays, absentDays, onLeaveDays };
    }, [staff, currentDate]);

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-fade-in h-full flex flex-col justify-center">
            <h3 className="text-lg font-bold mb-6 text-center">
                Monthly Summary for {currentDate.toLocaleString('default', { month: 'long' })}
            </h3>
            <div className="flex justify-around text-center">
                <div><p className="text-2xl font-bold text-green-500">{monthlyData.presentDays}</p><p className="text-sm text-gray-500">Present</p></div>
                <div><p className="text-2xl font-bold text-red-500">{monthlyData.absentDays}</p><p className="text-sm text-gray-500">Absent</p></div>
                <div><p className="text-2xl font-bold text-blue-500">{monthlyData.onLeaveDays}</p><p className="text-sm text-gray-500">On Leave</p></div>
            </div>
        </div>
    );
};

const SelectedDayDetails = ({ 
    selectedDayData, isEditing, setIsEditing, editedInTime, setEditedInTime, 
    editedOutTime, setEditedOutTime, handleSave, handleCancel, isToday, isFutureDate, 
    handlePunchIn, handlePunchOut, handleMarkStatus, showLeaveSelector, setShowLeaveSelector,
    handleRequestLeave // New prop for future leave requests
}) => {
    const hasPunchedIn = !!editedInTime;
    const hasPunchedOut = !!editedOutTime;
    const displayInfo = getAttendanceDisplay(selectedDayData);
    const LeaveIcon = selectedDayData?.leaveType ? LEAVE_TYPES[selectedDayData.leaveType]?.icon : null;

    return (
        <div className="space-y-4 animate-fade-in">
             {isFutureDate && (
                <div className="text-sm text-center text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-md">
                    Cannot modify future dates directly.
                    <button 
                        onClick={handleRequestLeave} 
                        className="ml-2 py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                    >
                        Request Leave
                    </button>
                </div>
            )}
            
            <div className="p-3 rounded-lg text-center font-bold text-white" style={{ background: displayInfo.color }}>
                <div className='flex items-center justify-center gap-2'>
                    {LeaveIcon && <LeaveIcon size={20} />}
                    <span>{displayInfo.status}</span>
                </div>
            </div>

            {/* --- Status Marking Buttons --- */}
            {!isFutureDate && isEditing && ( // Only show status editing in edit mode for non-future dates
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <button onClick={() => handleMarkStatus('present')} className="p-2 bg-green-500 text-bold font-bold text-white rounded-md hover:bg-green-700">Present</button>
                        <button onClick={() => handleMarkStatus('half_day')} className="p-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-700">Half Day</button>
                        <button onClick={() => setShowLeaveSelector(!showLeaveSelector)} className="p-2 bg-blue-500 font-bold text-white rounded-md hover:bg-blue-700">On Leave</button>
                    </div>

                    {showLeaveSelector && (
                        <div className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 grid grid-cols-2 gap-2">
                          {Object.entries(LEAVE_TYPES).map(([key, {label, color}]) => (
                            <button
                              key={key}
                              onClick={() => handleMarkStatus(key === 'holiday' ? 'holiday' : 'on_leave', key)}
                              className={`p-2 text-md font-bold border rounded-md hover:${color}-600 text-white ${color}-500`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                    )}
                </div>
            )}


            {/* --- Punch Time Details --- */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Clock size={20} className="text-gray-500"/><strong>Punch Times</strong></div>
                {!isFutureDate && ( // Don't show edit button for future dates
                    isEditing ? (
                        <div className="flex items-center gap-2">
                            <button onClick={handleSave} className="p-2 rounded-full text-green-600 hover:bg-green-100"><Save size={16}/></button>
                            <button onClick={handleCancel} className="p-2 rounded-full text-gray-600 hover:bg-gray-200"><Ban size={16}/></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-gray-200">
                            <Pencil size={16} />
                        </button>
                    )
                )}
            </div>

            <div className="space-y-3 pl-2 min-h-[80px]">
                {isToday && !isEditing && !isFutureDate && (
                     <>
                        {!hasPunchedIn && (<button onClick={handlePunchIn} className="w-full text-white font-bold py-2 px-4 rounded bg-green-500 hover:bg-green-600">Punch In</button>)}
                        {hasPunchedIn && !hasPunchedOut && (<button onClick={handlePunchOut} className="w-full text-white font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-600">Punch Out</button>)}
                     </>
                )}
                <div className="flex justify-between items-center">
                    <label className="font-medium text-sm text-gray-600">Punch In:</label>
                    {isEditing ? <input type="time" value={editedInTime} onChange={e => setEditedInTime(e.target.value)} disabled={isFutureDate} className="w-32 p-1 rounded-md bg-white border disabled:bg-gray-200"/> : <span className="font-mono text-gray-800">{formatTime12Hour(editedInTime)}</span>}
                </div>
                <div className="flex justify-between items-center">
                    <label className="font-medium text-sm text-gray-600">Punch Out:</label>
                    {isEditing ? <input type="time" value={editedOutTime} onChange={e => setEditedOutTime(e.target.value)} disabled={isFutureDate} className="w-32 p-1 rounded-md bg-white border disabled:bg-gray-200"/> : <span className="font-mono text-gray-800">{formatTime12Hour(editedOutTime)}</span>}
                </div>
            </div>
        </div>
    );
};

const CoreAttendance = ({ staff, onUpdateAttendance }) => {
    const [currentDate, setCurrentDate] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedInTime, setEditedInTime] = useState('');
    const [editedOutTime, setEditedOutTime] = useState('');
    const [showLeaveSelector, setShowLeaveSelector] = useState(false);

    const attendanceMap = useMemo(() => {
        const map = new Map();
        staff?.attendance?.forEach(rec => map.set(rec.date, rec));
        return map;
    }, [staff]);
    
    const todayString = useMemo(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const data = attendanceMap.get(selectedDate);
            setEditedInTime(data?.inTime || '');
            setEditedOutTime(data?.outTime || '');
            // Only enable editing by default if there's no record and it's not a future date
            const isFuture = new Date(selectedDate) > new Date(todayString);
            setIsEditing(false); // Default to disabled edit mode as per new requirement
            setShowLeaveSelector(false); // Hide leave selector on new date selection
        } else {
            setIsEditing(false);
        }
    }, [selectedDate, attendanceMap, todayString]);

    const handleDateClick = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(prevSelectedDate => prevSelectedDate === dateStr ? null : dateStr);
    };

    const handleUpdateAndSave = (update) => {
        if (selectedDate) {
            onUpdateAttendance(staff.id, selectedDate, update);
            setIsEditing(false); // Exit edit mode after saving
        }
    };
    
    const handleSave = () => {
        handleUpdateAndSave({ inTime: editedInTime, outTime: editedOutTime, status: 'present' });
    };

    const handlePunchIn = () => {
        const currentTime = getCurrentTime24();
        setEditedInTime(currentTime);
        handleUpdateAndSave({ inTime: currentTime, outTime: '', status: 'present' });
    };
    const handlePunchOut = () => {
        const currentTime = getCurrentTime24();
        setEditedOutTime(currentTime);
        handleUpdateAndSave({ inTime: editedInTime, outTime: currentTime, status: 'present' });
    };

    const handleMarkStatus = (status, leaveType = null) => {
        let update = { status, leaveType, inTime: '', outTime: '' };
        const currentRecord = attendanceMap.get(selectedDate);

        switch(status) {
            case 'present':
                update.inTime = currentRecord?.inTime || ATTENDANCE_RULES.FULL_DAY_START;
                update.outTime = currentRecord?.outTime || ATTENDANCE_RULES.FULL_DAY_END;
                break;
            case 'half_day':
                update.status = 'present'; // Half day is still 'present' but with specific times
                update.inTime = currentRecord?.inTime || ATTENDANCE_RULES.FULL_DAY_START;
                update.outTime = currentRecord?.outTime || ATTENDANCE_RULES.FIRST_HALF_ENDS;
                break;
            case 'on_leave':
            case 'holiday':
                update.leaveType = leaveType;
                update.inTime = ''; // Clear times for leave/holiday
                update.outTime = ''; // Clear times for leave/holiday
                break;
        }
        setEditedInTime(update.inTime);
        setEditedOutTime(update.outTime);
        handleUpdateAndSave(update);
        setShowLeaveSelector(false);
    };

    const handleCancel = () => {
        const originalData = attendanceMap.get(selectedDate);
        setEditedInTime(originalData?.inTime || '');
        setEditedOutTime(originalData?.outTime || '');
        setIsEditing(false);
        setShowLeaveSelector(false); // Hide leave selector on cancel
    };

    const handleRequestLeave = () => {
        // This is a placeholder. In a real app, you'd open a modal
        // to collect leave type (paid/unpaid) and potentially a date range.
        alert(`Requesting leave for ${selectedDate}. You would implement a form/modal here for details.`);
        // Example of how you might then update:
        // onUpdateAttendance(staff.id, selectedDate, { status: 'on_leave', leaveType: 'pto' });
    };
    
    const changeMonth = (offset) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() + offset, 1);
            return newDate;
        });
        setSelectedDate(null);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const isFutureDate = selectedDate ? (new Date(selectedDate) > new Date(todayString)) : false;

    return (
        <AttendanceContent 
            currentDate={currentDate}
            selectedDate={selectedDate}
            attendanceMap={attendanceMap}
            handleDateClick={handleDateClick}
            changeMonth={changeMonth}
            year={year}
            month={month}
        >
             {!selectedDate ? 
                <AggregatedDataView staff={staff} currentDate={currentDate} /> :
                <SelectedDayDetails 
                    selectedDayData={attendanceMap.get(selectedDate)}
                    isEditing={isEditing} setIsEditing={setIsEditing}
                    editedInTime={editedInTime} setEditedInTime={setEditedInTime}
                    editedOutTime={editedOutTime} setEditedOutTime={setEditedOutTime}
                    handleSave={handleSave} handleCancel={handleCancel}
                    isToday={selectedDate === todayString} isFutureDate={isFutureDate}
                    handlePunchIn={handlePunchIn} handlePunchOut={handlePunchOut}
                    handleMarkStatus={handleMarkStatus}
                    showLeaveSelector={showLeaveSelector} setShowLeaveSelector={setShowLeaveSelector}
                    handleRequestLeave={handleRequestLeave}
                />
            }
        </AttendanceContent>
    );
};


// --- Main Modal and Inline Components ---
const StaffAttendance = ({ isOpen, onClose, staff, onUpdateAttendance }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3"><User className="text-blue-500" size={24} /><h2 className="text-xl font-bold">{staff.name}</h2></div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
                </header>
                <CoreAttendance staff={staff} onUpdateAttendance={onUpdateAttendance} />
            </div>
        </div>
    );
};

const InlineStaffAttendance = ({ staff, onUpdateAttendance }) => {
    return <CoreAttendance staff={staff} onUpdateAttendance={onUpdateAttendance} />;
};


// Shared content component
const AttendanceContent = ({
    currentDate, selectedDate, attendanceMap, handleDateClick, changeMonth, year, month, children
}) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <main className="flex flex-col md:flex-row p-4 gap-4 overflow-y-auto h-full">
            <div className="w-full md:w-3/5">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} /></button>
                    <h3 className="text-lg font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20} /></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
                    {weekDays.map(day => <div key={day} className="w-12 h-8 flex items-center justify-center">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`empty-${i}`} className="w-12 h-12"></div>)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateObj = new Date(year, month, day);
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const record = attendanceMap.get(dateStr);
                        const display = getAttendanceDisplay(record);
                        const isSelected = selectedDate === dateStr;
                        const today = new Date();
                        const isCurrentDay = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                        // If no data, use gray-400 as per getAttendanceDisplay for 'No Record'
                        const noData = !record || !record.status;
                        const circleColor = noData ? 'bg-gray-400' : (display.color.startsWith('linear') ? undefined : display.color);
                        return (
                            <button key={day} onClick={() => handleDateClick(day)}
                                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 text-white font-semibold relative
                                    ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''} hover:scale-110 hover:shadow-lg`}
                                style={{ background: display.color.startsWith('linear') ? display.color : undefined }} >
                                { !display.color.startsWith('linear') && <div className={`absolute inset-0 rounded-full ${circleColor}`}></div>}
                                <span className="relative z-10">{day}</span>
                                {isCurrentDay && <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="w-full md:w-2/5 bg-gray-50 rounded-lg p-4">
                {children}
            </div>
        </main>
    );
};

export default InlineStaffAttendance;