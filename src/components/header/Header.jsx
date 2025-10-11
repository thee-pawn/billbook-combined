import React, { useState, useRef, useEffect } from 'react';
import logoImage from "../../assets/images/bb_icon.png"; // Placeholder for logo image
import StoreSelect from './Stores';
import { Bell, X, Trash2 } from 'lucide-react';
import { useAuth } from '@components/login/useAuth';
import { useStore } from '@components/login/StoreContext';
// Assuming Tailwind CSS is set up in your project



// Placeholder Avatar SVG - Made slightly smaller
const PlaceholderAvatar = ({ className = "w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
  </svg>
);

// Chevron Down Icon for dropdown
const ChevronDownIcon = ({ className = "w-4 h-4 ml-1 text-gray-600" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
  </svg>
);


// --- Header Component ---

function Header() {
  const { logout, user } = useAuth();
  const { currentStore, clearStore } = useStore();
  // Removed unused navigate

  // State to manage the visibility of the logout dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Ref for the dropdown container to detect clicks outside
  const dropdownRef = useRef(null);
  // Get user name with proper fallbacks
  const getUserDisplayName = () => {
    if (!user) return "User";
    
    // Try different name fields in order of preference
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.phone) return user.phone; // Fallback to phone number
    return "User";
  };
  
  const userName = getUserDisplayName();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([
  ]);

  // Store logo state (fetched from API per selected store)
  const [storeLogoUrl, setStoreLogoUrl] = useState('');
  const logoObjectUrlRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const storeId = currentStore?.id;

  // Load store logo whenever currentStore changes
  useEffect(() => {
    // Cleanup previous object URL
    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current);
      logoObjectUrlRef.current = null;
    }
    setStoreLogoUrl('');

    const token = localStorage.getItem('token');
    if (!storeId || !token) return;

    let aborted = false;
    fetch(`${API_BASE_URL}/api/v1/stores/${storeId}/logo?ts=${Date.now()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then(resp => (resp.ok ? resp.blob() : null))
      .then(blob => {
        if (aborted || !blob) return;
        const url = URL.createObjectURL(blob);
        logoObjectUrlRef.current = url;
        setStoreLogoUrl(url);
      })
      .catch(() => {});

    return () => {
      aborted = true;
      if (logoObjectUrlRef.current) {
        URL.revokeObjectURL(logoObjectUrlRef.current);
        logoObjectUrlRef.current = null;
      }
    };
  }, [storeId]);

  // Function to handle logout action
  const handleLogout = () => {
    // Clear store context data first
    if (clearStore) {
      clearStore();
    }
    
    // Then logout from auth context
    logout();
  };

  const handleBellClick = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
    // You might want to navigate to a notifications page or open a dropdown here
  };

  const NotificationBell = ({
    notificationCount = 0,
    onBellClick,
    iconSize = 24,
    badgeColor = 'bg-red-500',
    textColor = 'text-white',
    bellColor = 'text-gray-600',
  }) => {
    const hasNotifications = notificationCount > 0;

    return (
      <button
        type="button"
        className="relative inline-flex items-center justify-center rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-gray-100"
        onClick={onBellClick}
        aria-label={hasNotifications ? `Notifications: ${notificationCount} new items` : 'Notifications: No new items'}
      >
        {/* Bell Icon */}
        <Bell size={iconSize} className={bellColor} />

        {/* Notification Badge - Renders only if notificationCount > 0 */}
        {hasNotifications && (
          <span
            className={`absolute right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none ${textColor} ${badgeColor} rounded-full transform translate-x-1/2 -translate-y-1/2`}
            aria-hidden="true" // Hide from screen readers as the button's aria-label provides the info
          >
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </button>
    );
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click is outside the dropdownRef element
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Add event listener when the dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the dropdown is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }
    // Cleanup function to remove listener when component unmounts or dropdown closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]); // Re-run effect when isDropdownOpen changes

  const handleCloseNotificationPanel = () => {
    setIsNotificationPanelOpen(false);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (id, link) => {
    // Remove the clicked notification
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);

    if (link) {
      // Redirect to the link
      window.location.href = link;
    }
  };


  return (
    <>
      <header className="bg-white px-4 md:px-6 mr-3 ml-3">
        <div className="w-full grid sm:grid-cols-1 md:grid-cols-3">

          <div className="flex items-center space-x-4 justify-start  w-8/10">
            <StoreSelect />
          </div>
          <div className="flex flex-row flex-shrink-0 gap-4 justify-center ">
            <div className='w-1/3 flex justify-center items-center'>
              <img
                src={storeLogoUrl || logoImage}
                className="max-h-20 w-auto" // max-h-56 = 14rem. w-auto maintains the aspect ratio.
                alt="Logo"
              />
            </div>
          </div>

          <div className="flex flex-row flex-shrink-0 gap-4 justify-end">
            <div className="flex items-center space-x-4"> {/* Space between icons */}
              <NotificationBell notificationCount={notifications.length} onBellClick={handleBellClick} />
            </div>    {/* Notification Icon */}

            <div ref={dropdownRef} className="flex items-center space-x-4 z-200"> {/* Keep relative for dropdown positioning */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <PlaceholderAvatar className="w-8 h-8 " />
                <span className="text-sm font-medium text-gray-700 sm:block">{userName}</span> {/* Added user name, hidden on small screens */}
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  {/* Optional: User Info */}
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{userName}</p>
                  </div>
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>
      {/* Notification Panel */}
      {isNotificationPanelOpen && (
        <div className="fixed top-14 right-0 h-screen w-1/4 bg-gray-200 shadow-lg z-50 overflow-y-auto p-2 pb-20">
          {/* Panel Header */}
          <div className="flex justify-between items-center p-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex gap-2">
              <button onClick={handleClearNotifications} className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                <Trash2 size={16} />
                <span className="ml-1">Clear All</span>
              </button>
              <button onClick={handleCloseNotificationPanel} className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                <X size={16} />

              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-4">
            <div className="space-y-2">
              {notifications.map(notification => (
                <div key={notification.id} className="bg-gray-50 rounded-md hover:bg-gray-100">
                  <button
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="block w-full text-left p-3"
                  >
                    <p className="text-sm">{notification.message}</p>
                  </button>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-3 text-center text-gray-500">
                  No new notifications
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Header;

