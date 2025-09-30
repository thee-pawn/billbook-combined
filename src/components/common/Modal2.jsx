export const Modal2 = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidthClass = 'w-1/2 max-w-1/2', // Default max-width (e.g., 'max-w-xs', 'max-w-md', 'max-w-2xl', 'max-w-screen-md')
    maxHeightClass = 'max-h-[95vh]' // Default max-height (e.g., 'max-h-[70vh]', 'max-h-screen')
  }) => {
    if (!isOpen) return null;

    return (
      // Backdrop: Covers the entire screen and centers the modal
      <div
        className="fixed inset-0  bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out"
        onClick={onClose} // Optional: Close modal on backdrop click
      >
        {/* Modal Panel: Dynamically sizes to content, constrained by max-width and max-height */}
        <div
          className={`
          bg-white rounded-lg shadow-2xl 
          w-auto h-auto
          min-w-1/3
          ${maxWidthClass} ${maxHeightClass} 
          flex flex-col 
          border border-slate-300 
          overflow-hidden 
          transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalenter
        `}
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside the panel
        >
          {/* Sticky Header */}
          <div className="flex-shrink-0 flex justify-between items-center p-1 md:p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
            {/* Title: Display if provided */}
            {title && <h4 className="text-lg font-semibold text-slate-800 truncate pr-2">{title}</h4>}

            {/* Spacer: If no title, this helps push the close button to the right */}
            {!title && <div className="flex-grow"></div>}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-300 rounded-full p-1"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Scrollable Content Area */}
          {/* This div will take up the available space and scroll if content overflows */}
          <div className="flex-grow overflow-y-auto p-3 md:p-4">
            {children}
          </div>
        </div>
        {/* Basic CSS for modal animation (add to your global CSS or a <style> tag if needed) */}

      </div>
    );
  };