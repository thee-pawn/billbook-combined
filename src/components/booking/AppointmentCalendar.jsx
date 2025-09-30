import React, { useState, useRef, useEffect } from 'react';

// Helper function to convert HH:MM time strings to total minutes from midnight.
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
    console.warn(`Invalid time string provided to timeToMinutes: "${timeStr}". Defaulting to 0.`);
    return 0;
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.warn(`Invalid time values in timeToMinutes: "${timeStr}". Defaulting to 0.`);
    return 0;
  }
  return hours * 60 + minutes; // Total minutes from midnight
};

// --- Modal Component ---
const ClickTimeModal = ({ isOpen, time, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xs mx-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalenter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Time Slot Clicked</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <p className="text-3xl font-bold text-center text-sky-600 mb-6 py-2">
          {time}
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-1"
        >
          OK
        </button>
      </div>
      <style jsx global>{`
        @keyframes modalenter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalenter {
          animation: modalenter 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};


/**
 * AppointmentCalendar Component
 * Renders a daily schedule grid with fixed lane headers and a fixed time column.
 * The main event grid scrolls underneath these fixed elements.
 */
const AppointmentCalendar = ({
  events,
  dayStartTime = '08:00',
  dayEndTime = '18:00',
  eventCalcUnitMinutes = 5,
  heightPerCalcUnitPx = 8,
  visualGridIntervalMinutes = 15,
  minLaneWidthPx = 200,
  laneTitles,
  onGridClick,
  staff,// Prop to be called when an empty grid slot is clicked
  onAppointmentClick // Prop to be called when an appointment is clicked
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedTimeStr, setClickedTimeStr] = useState('');
  const [currentTimeLineTop, setCurrentTimeLineTop] = useState(null);


  const headerScrollRef = useRef(null);
  const numberOfLanes = (Array.isArray(staff) ? staff.length : 0) + 1; // Always include Unassigned lane
  const timeGutterScrollRef = useRef(null);
  const gridScrollRef = useRef(null);

  // Validate essential parameters
  if (!events || !Array.isArray(events)) {
    console.error("Invalid 'events' prop: must be an array.");
    return <div className="text-red-500 p-4">Error: Events data is invalid.</div>;
  }

  const dayStartMinutes = timeToMinutes(dayStartTime);
  const dayEndMinutes = timeToMinutes(dayEndTime);
  const totalMinutesInDayView = dayEndMinutes - dayStartMinutes;

  if (totalMinutesInDayView <= 0 || eventCalcUnitMinutes <= 0 || visualGridIntervalMinutes <= 0 || heightPerCalcUnitPx <= 0 || minLaneWidthPx <= 0) {
    console.error("Invalid time, duration, height, or lane width parameters for AppointmentCalendar.");
    return <div className="text-red-500 p-4">Error: Invalid calendar parameters.</div>;
  }
  if (staff.length <= 0) {
    console.warn("No staff found; rendering only the Unassigned lane.");
  }
  if (laneTitles && laneTitles.length !== numberOfLanes) {
    console.warn("Warning: `laneTitles` array length does not match `numberOfLanes`.");
  }

  const totalEventCalcUnitsInDay = totalMinutesInDayView / eventCalcUnitMinutes;
  const mainEventGridHeightPx = totalEventCalcUnitsInDay * heightPerCalcUnitPx;

  const numVisualSlots = totalMinutesInDayView / visualGridIntervalMinutes;
  const heightOfOneVisualSlotPx = (visualGridIntervalMinutes / eventCalcUnitMinutes) * heightPerCalcUnitPx;

  // Effect for Current Time Line
  useEffect(() => {
    const calculateAndSetTimeLine = () => {
      const now = new Date();
      const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

      if (currentMinutesFromMidnight >= dayStartMinutes && currentMinutesFromMidnight < dayEndMinutes) { // Use < dayEndMinutes so line is not at the very end
        const minutesFromDayStart = currentMinutesFromMidnight - dayStartMinutes;
        const topPx = (minutesFromDayStart / eventCalcUnitMinutes) * heightPerCalcUnitPx;
        setCurrentTimeLineTop(topPx);
      } else {
        setCurrentTimeLineTop(null); // Current time is outside of the displayed day range
      }
    };

    calculateAndSetTimeLine(); // Initial calculation
    const intervalId = setInterval(calculateAndSetTimeLine, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [dayStartMinutes, dayEndMinutes, eventCalcUnitMinutes, heightPerCalcUnitPx]); // Re-calculate if these parameters change


  const timeLabels = [];
  for (let i = 0; i <= numVisualSlots; i++) {
    const currentVisualSlotTimeInMinutes = dayStartMinutes + (i * visualGridIntervalMinutes);
    const hours = Math.floor(currentVisualSlotTimeInMinutes / 60);
    const minutes = currentVisualSlotTimeInMinutes % 60;
    const isHourMark = minutes === 0;
    const isHalfHourMark = minutes === 30;
    let displayThisLabel = i === 0 || i === numVisualSlots || isHourMark || isHalfHourMark;

    if (displayThisLabel) {
      timeLabels.push({
        timeStr: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
        topPositionPx: i * heightOfOneVisualSlotPx,
        isHour: isHourMark,
      });
    }
  }

  const internalGridClickHandler = (e) => {
    // If the click is on an event item, its own handler (with stopPropagation) would have already fired.
    // So, if this handler is reached, it means the click was on the grid background or a non-interactive element.
    // The original check `if (e.target !== e.currentTarget) return;` was removed to allow clicks on background elements
    // (like lane separators) to be treated as grid clicks.

    const rect = e.currentTarget.getBoundingClientRect(); // e.currentTarget is the div with this onClick handler
    const offsetY = e.clientY - rect.top;
    const normalizedOffsetY = Math.max(0, Math.min(offsetY, rect.height - 1));
    const clickProportion = normalizedOffsetY / rect.height;
  const clickedMinuteInDayView = Math.floor(clickProportion * totalMinutesInDayView);
  let absoluteClickedMinute = dayStartMinutes + clickedMinuteInDayView;
  // Snap to nearest visual grid interval for cleaner defaults
  const interval = visualGridIntervalMinutes || 15;
  absoluteClickedMinute = Math.round(absoluteClickedMinute / interval) * interval;
  // Clamp within day range
  const dayStart = dayStartMinutes;
  const dayEnd = dayEndMinutes - 1; // keep within bounds
  if (absoluteClickedMinute < dayStart) absoluteClickedMinute = dayStart;
  if (absoluteClickedMinute > dayEnd) absoluteClickedMinute = dayEnd;
    const hours = Math.floor(absoluteClickedMinute / 60);
    const minutesValue = absoluteClickedMinute % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutesValue).padStart(2, '0')}`;

    setClickedTimeStr(timeStr); // Set time for the modal

    // Call the passed-in handler prop, if it exists
    if (typeof onGridClick === 'function') {
      // To determine which lane was clicked:
      const clickX = e.clientX - rect.left; // X position relative to the grid container
      const scrollLeft = e.currentTarget.scrollLeft || 0; // Account for horizontal scroll
      const effectiveClickX = clickX + scrollLeft;

      // Calculate lane width based on the actual rendered width of the grid content, not just minLaneWidthPx
      // This assumes all lanes are equally distributed if the total width is greater than sum of minLaneWidthPx
      const totalGridContentWidth = e.currentTarget.scrollWidth;
      const lanes = (Array.isArray(staff) ? staff.length : 0) + 1; // Total lanes incl. Unassigned
      const laneWidth = totalGridContentWidth / lanes; // Calculate effective lane width based on content width
      const clickedLaneIndex = Math.floor(effectiveClickX / laneWidth);

      if (clickedLaneIndex >= 0 && clickedLaneIndex < lanes) {
        onGridClick(timeStr, clickedLaneIndex);
      } else {
        // Fallback or error if lane index is out of bounds, though it shouldn't be if click is within grid
        onGridClick(timeStr);
      }
    }

  };

  const getEventLane = (event) => {
    if (event.staffId === undefined) {
      return 1;
    }
    let laneIndex = 1;
    staff.forEach((staffMember, index) => {
      if (staffMember.id === event.staffId) {
        laneIndex = index + 2; // +1 because lane 0 is for unassigned
      }
    }
    );
    return laneIndex;
  };

  const geteventColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-sky-500 hover:bg-sky-600';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'inProgress':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      case 'enquiry':
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        console.warn(`Unknown event status "${status}" for event. Defaulting to 'scheduled'.`);
        return 'bg-sky-500 hover:bg-sky-600'; // Default color for unknown status
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const gridColsTemplate = `repeat(${numberOfLanes}, minmax(${minLaneWidthPx}px, 1fr))`;

  const handleGridScroll = () => {
    if (gridScrollRef.current) {
      if (headerScrollRef.current) {
        headerScrollRef.current.scrollLeft = gridScrollRef.current.scrollLeft;
      }
      if (timeGutterScrollRef.current) {
        timeGutterScrollRef.current.scrollTop = gridScrollRef.current.scrollTop;
      }
    }
  };

  return (
    <>
      <div className="flex flex-col w-full h-full mx-auto shadow-xl rounded-lg bg-white border border-slate-200 overflow-hidden">

        {/* Row 1: Top-Left Corner + Lane Headers */}
        <div className="flex flex-shrink-0 shadow-sm pr-4">
          <div className="w-24 flex-shrink-0 bg-slate-100 border-r border-b border-slate-300 z-20">
            &nbsp;
          </div>
          <div className="flex-grow overflow-x-hidden border-b border-slate-300 bg-slate-100 z-20" ref={headerScrollRef}>
            <div className="grid" style={{ gridTemplateColumns: gridColsTemplate, minWidth: `${numberOfLanes * minLaneWidthPx}px` }}>
              <div
                className="p-3 text-center text-md font-semibold text-slate-600 border-r border-slate-300 truncate"
                title={'unassigned lane'}
              >
                {'Unassigned'}
              </div>
              {Array.from({ length: numberOfLanes - 1 }).map((_, i) => (
                <div
                  key={`header-${i}`}
                  className={`p-3 text-center text-md font-semibold text-slate-600 
                             ${i < numberOfLanes ? 'border-r border-slate-300' : ''} truncate`}
                  title={staff[i] ? staff[i].name : `Staff ${i + 1}`}
                >
                  {staff[i] ? staff[i].name : `Staff ${i + 1}`}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Time Gutter + Scrollable Event Grid */}
        <div className="flex flex-grow overflow-hidden">
          {/* Time Column (Y-axis) */}
          <div className="w-24 py-2 flex-shrink-0 bg-slate-50 border-r border-slate-300 overflow-y-hidden select-none z-10" ref={timeGutterScrollRef}>
            <div className="relative" style={{ height: `${mainEventGridHeightPx}px` }}>
              {timeLabels.map((label, index) => (
                <div
                  key={`time-${index}`}
                  className="absolute text-slate-600 pr-2 text-right leading-none"
                  style={{
                    top: `${label.topPositionPx - 7}px`,
                    right: '6px',
                    fontSize: label.isHour ? '0.8rem' : '0.75rem',
                    fontWeight: label.isHour ? '500' : 'normal',
                  }}
                >
                  {label.timeStr}
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Event Grid Area */}
          {/* This is gridScrollRef.current */}
          <div className="flex-grow overflow-auto relative" ref={gridScrollRef} onScroll={handleGridScroll}>
            {/* This is e.currentTarget in internalGridClickHandler */}
            <div
              className="grid relative"
              style={{
                gridTemplateColumns: gridColsTemplate,
                height: `${mainEventGridHeightPx}px`,
                minWidth: `${numberOfLanes * minLaneWidthPx}px`,
              }}
              onClick={internalGridClickHandler}
            >
              {/* 1. Vertical Lane Demarcation Lines */}
              {Array.from({ length: numberOfLanes }).map((_, laneIndex) => (
                <div
                  key={`lane-separator-bg-${laneIndex}`}
                  style={{
                    gridColumn: `${laneIndex + 1} / span 1`,
                    borderRight: laneIndex < numberOfLanes - 1 ? '1px solid #cbd5e1' : 'none',
                    zIndex: 0,
                  }}
                />
              ))}

              {/* 2. Background Horizontal Grid Lines */}
              {Array.from({ length: Math.floor(numVisualSlots) }).map((_, slotIndex) => (
                <div
                  key={`slotline-${slotIndex}`}
                  className="absolute w-full border-b border-slate-200"
                  style={{
                    top: `${(slotIndex + 1) * heightOfOneVisualSlotPx}px`,
                    left: 0,
                    zIndex: 1,
                  }}
                ></div>
              ))}

              {/* 3. Current Time Line */}
              {currentTimeLineTop !== null && (
                <div
                  className="absolute bg-red-500"
                  style={{
                    top: `${currentTimeLineTop}px`,
                    left: 0,
                    right: 0,
                    height: '2px',
                    zIndex: 5,
                  }}
                />
              )}

              {/* 4. Render Events */}
              {events.map((event) => {
                const eventStartTotalMinutes = timeToMinutes(event.startTime);
                const eventEndTotalMinutes = timeToMinutes(event.endTime);
                if (eventEndTotalMinutes <= dayStartMinutes || eventStartTotalMinutes >= dayEndMinutes) return null;
                const startOffsetMinutes = Math.max(0, eventStartTotalMinutes - dayStartMinutes);
                const endOffsetMinutes = Math.min(totalMinutesInDayView, eventEndTotalMinutes - dayStartMinutes);
                const effectiveDurationMinutes = endOffsetMinutes - startOffsetMinutes;
                if (effectiveDurationMinutes <= 0) return null;
                const topPositionPx = (startOffsetMinutes / eventCalcUnitMinutes) * heightPerCalcUnitPx;
                const eventHeightPx = (effectiveDurationMinutes / eventCalcUnitMinutes) * heightPerCalcUnitPx;
                const showDescThreshold = heightPerCalcUnitPx * (20 / eventCalcUnitMinutes);
                const showTimeThreshold = heightPerCalcUnitPx * (30 / eventCalcUnitMinutes);

                return (
                  <div
                    key={event.id}
                    className={`absolute flex flex-col p-1.5 rounded shadow-md text-white transition-all duration-150 ease-in-out cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-black hover:ring-opacity-50 ${geteventColor(event.status) }`}
                    style={{
                      top: `${topPositionPx}px`,
                      height: `${Math.max(heightPerCalcUnitPx * 0.8, eventHeightPx - 2)}px`,
                      gridColumnStart: getEventLane(event),
                      gridColumnEnd: 'span 1',
                      left: '2px',
                      width: `calc(100% - 4px)`,
                      zIndex: 10,
                      boxSizing: 'border-box',
                      minHeight: `${heightPerCalcUnitPx * 0.75}px`,
                    }}
                    title={`${event.title}\n${event.startTime} - ${event.endTime}\n${event.description || ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onAppointmentClick === 'function') {
                        onAppointmentClick(event); // Call prop for appointment click
                      }
                    }}
                  >
                    <div className="text-xs font-bold truncate leading-tight"><span className='flex flex-row justify-between'><div>{event.customerName}</div><div>{event.contactNo}</div></span></div>
                    {eventHeightPx > showDescThreshold && event.services && (
                      <div className="text-xs my-1 leading-tight truncate">
                        {event.services.map((service, index) => (
                          <span className='flex flex-row justify-between' key={index}>
                            <div>{service.name}</div>
                            <div>{service.duration}</div>
                          </span>
                        ))}
                      </div>
                    )}
                    {eventHeightPx > showTimeThreshold && (
                      <p className="text-[10px] mt-auto pt-0.5 leading-tight">{event.startTime} - {event.endTime}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ClickTimeModal isOpen={isModalOpen} time={clickedTimeStr} onClose={closeModal} />
    </>
  );
};

export default AppointmentCalendar;