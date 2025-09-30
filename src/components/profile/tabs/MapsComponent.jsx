import { InputField } from '@components/common/FormElements';
import React, { useState, useEffect, useRef } from 'react';

// Google Maps script loader with global state management
const googleMapsLoader = (() => {
    let isLoading = false;
    let isLoaded = false;
    let loadPromise = null;
    
    // Function to load the Google Maps API
    const load = (apiKey) => {
        // If already loaded, return resolved promise
        if (isLoaded && window.google && window.google.maps) {
            return Promise.resolve();
        }
        
        // If currently loading, return the existing promise
        if (isLoading && loadPromise) {
            return loadPromise;
        }
        
        // Start loading process
        isLoading = true;
        loadPromise = new Promise((resolve, reject) => {
            // Unique callback name
            const callbackName = `googleMapsCallback_${Date.now()}`;
            
            // Global callback
            window[callbackName] = () => {
                isLoaded = true;
                isLoading = false;
                
                // Clean up callback
                delete window[callbackName];
                resolve();
            };
            
            // Create script
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}&loading=async`;
            script.async = true;
            script.defer = true;
            
            // Handle errors
            script.onerror = (error) => {
                isLoading = false;
                reject(new Error('Failed to load Google Maps'));
            };
            
            // Append to document
            document.head.appendChild(script);
        });
        
        return loadPromise;
    };
    
    // Reset the loader state (useful for testing or recovery)
    const reset = () => {
        isLoading = false;
        isLoaded = false;
        loadPromise = null;
    };
    
    // Check if Maps is already loaded
    const checkIfLoaded = () => {
        if (window.google && window.google.maps) {
            isLoaded = true;
            return true;
        }
        return false;
    };
    
    return { load, reset, checkIfLoaded };
})();

// --- Helper Functions ---

/**
 * Parses the address components from the Google Maps Geocoding API response
 * to extract specific location details.
 * @param {Array} address_components - The array of address components from the API.
 * @returns {Object} An object containing the extracted location details.
 */
const parseAddressComponents = (address_components) => {
    const details = {
        city: '',
        state: '',
        country: '',
        pincode: '',
        locality: ''
    };

    address_components.forEach(component => {
        const types = component.types;
        if (types.includes('locality')) {
            details.locality = component.long_name;
        }
        // A city can be represented by 'administrative_area_level_2' or 'locality'
        if (types.includes('administrative_area_level_2') && !details.city) {
            details.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
            details.state = component.long_name;
        }
        if (types.includes('country')) {
            details.country = component.long_name;
        }
        if (types.includes('postal_code')) {
            details.pincode = component.long_name;
        }
    });
    
    // Fallback for city if not found in administrative_area_level_2
    if (!details.city && details.locality) {
        details.city = details.locality;
    }

    return details;
};


// --- Main App Component ---

export default function MapsComponent({ onAddressUpdate, hasChanges = false, isSaving = false, onSave = null, onCancel = null, initialLocation = null }) {
    // --- State Management ---
    const [locationDetails, setLocationDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [localChanges, setLocalChanges] = useState(false); // Renamed to avoid conflict with prop
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [mapInitialized, setMapInitialized] = useState(false); // Track if map is already initialized
    const [address, setAddress] = useState({
        addressLine1: '',
        locality: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        latitude: '',
        longitude: ''
    });

    // Initialize address state with initial location data if provided
    useEffect(() => {
        if (initialLocation) {
            setAddress(prevAddress => ({
                ...prevAddress,
                ...initialLocation
            }));
        }
    }, [initialLocation]);
    
    // --- IMPORTANT: Replace with your own Google Maps API Key ---
    const GOOGLE_MAPS_API_KEY = 'AIzaSyBWl3DvXDP5kWvBYbvyTAOycpxMKCflh9Y';

    // --- Effects ---

    // Effect to load the Google Maps script
    useEffect(() => {
        let isMounted = true;
        
        // Check if Maps is already available
        if (googleMapsLoader.checkIfLoaded()) {
            // Don't initialize map immediately, wait for address data
            return;
        }
        
        // Set loading state
        setIsLoading(true);
        
        // Load Google Maps
        googleMapsLoader.load(GOOGLE_MAPS_API_KEY)
            .then(() => {
                if (isMounted) {
                    // Don't initialize map immediately, wait for address data
                }
            })
            .catch(err => {
                if (isMounted) {
                    setError("Failed to load Google Maps. Please refresh the page.");
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });
        
        return () => {
            isMounted = false;
        };
    }, []);

    // New effect to initialize map when both Google Maps is loaded and address data is ready
    useEffect(() => {
        const initMapWhenReady = () => {
            if (googleMapsLoader.checkIfLoaded() && !isLoading) {
                try {
                    initializeMap();
                } catch (err) {
                    setError(`Failed to initialize map: ${err.message}`);
                }
            }
        };

        // Small delay to ensure state updates are complete
        const timeoutId = setTimeout(initMapWhenReady, 300);
        
        return () => clearTimeout(timeoutId);
    }, [address, isLoading]); // Re-run when address changes or loading state changes


    // --- Core Functions ---

    /**
     * Initializes the Google Map and sets up the initial marker and event listeners.
     */
    const initializeMap = () => {
        try {
            // Prevent multiple initializations
            if (mapInitialized) {
                return;
            }
            
            // Verify Google Maps is loaded
            if (!window.google || !window.google.maps) {
                setError("Google Maps API not available. Try refreshing the page.");
                // Try to reset and reload the maps
                googleMapsLoader.reset();
                return;
            }

            // Check map container
            if (!mapRef.current) {
                setError("Map container not found. Please refresh the page.");
                return;
            }

            // Ensure map container has proper dimensions
            mapRef.current.style.height = "500px";
            mapRef.current.style.minHeight = "500px";

            // Use existing coordinates if available, otherwise default to Lucknow
            let initialPosition = { lat: 26.8467, lng: 80.9462 }; // Default to Lucknow, UP
            
            if (address.latitude && address.longitude) {
                const lat = parseFloat(address.latitude);
                const lng = parseFloat(address.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    initialPosition = { lat, lng };
                }
            }

            const mapOptions = {
                center: initialPosition,
                zoom: 13,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
                zoomControl: true,
                gestureHandling: 'greedy', // Makes it easier to navigate on mobile
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "on" }]
                    }
                ]
            };

            const map = new window.google.maps.Map(mapRef.current, mapOptions);
            
            // Mark map as initialized
            setMapInitialized(true);
            
            // Trigger a resize event after a short delay to ensure the map renders correctly
            setTimeout(() => {
                window.google.maps.event.trigger(map, 'resize');
                map.setCenter(initialPosition);
            }, 500);

            // Create marker with animation
            markerRef.current = new window.google.maps.Marker({
                position: initialPosition,
                map: map,
                draggable: true,
                title: "Drag me to set your location",
                animation: window.google.maps.Animation.DROP
            });

            // Fetch initial location details only if we don't have existing address details
            if (!address.addressLine1 || !address.latitude || !address.longitude) {
                fetchLocationDetails(initialPosition.lat, initialPosition.lng);
            } else {
                // We have existing address data, just set the location details
                setLocationDetails({
                    locality: address.locality,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    country: address.country,
                    formattedAddress: [address.addressLine1, address.locality, address.city, address.state, address.pincode, address.country].filter(Boolean).join(', '),
                    coordinates: { lat: initialPosition.lat, lng: initialPosition.lng }
                });
            }

            // Add event listener for marker drag end
            markerRef.current.addListener('dragend', () => {
                const newPosition = markerRef.current.getPosition();
                fetchLocationDetails(newPosition.lat(), newPosition.lng());
            });

            // Add event listener for map click
            map.addListener('click', (mapsMouseEvent) => {
                const newPosition = mapsMouseEvent.latLng;
                markerRef.current.setPosition(newPosition);
                fetchLocationDetails(newPosition.lat(), newPosition.lng());
            });

            // Add a search box to the map
            try {
                const input = document.createElement('input');
                input.className = 'controls';
                input.type = 'text';
                input.placeholder = 'Search for a location';
                input.style.margin = '10px';
                input.style.padding = '8px';
                input.style.borderRadius = '4px';
                input.style.border = '1px solid #ccc';
                input.style.width = 'calc(100% - 20px)';
                input.style.maxWidth = '300px';
                input.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
                
                map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);
                
                const searchBox = new window.google.maps.places.SearchBox(input);
                
                // Bias the SearchBox results towards current map's viewport
                map.addListener('bounds_changed', () => {
                    searchBox.setBounds(map.getBounds());
                });
                
                searchBox.addListener('places_changed', () => {
                    const places = searchBox.getPlaces();
                    
                    if (places.length === 0) {
                        return;
                    }
                    
                    const place = places[0];
                    
                    if (!place.geometry || !place.geometry.location) {
                        return;
                    }
                    
                    // Update the marker position
                    markerRef.current.setPosition(place.geometry.location);
                    
                    // Center the map on the search result
                    map.setCenter(place.geometry.location);
                    map.setZoom(16);
                    
                    // Fetch details for the new location
                    fetchLocationDetails(
                        place.geometry.location.lat(),
                        place.geometry.location.lng()
                    );
                });
                
            } catch (searchError) {
                // Continue without search box if it fails
            }

        } catch (error) {
            setError(`Failed to initialize map: ${error.message}`);
        }
    };

    /**
     * Fetches location details from Google Geocoding API based on latitude and longitude.
     * @param {number} lat - The latitude of the location.
     * @param {number} lng - The longitude of the location.
     */
    const fetchLocationDetails = async (lat, lng) => {
        setIsLoading(true);
        setError(null);
        
        if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
            setError("Please replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual Google Maps API key.");
            setIsLoading(false);
            return;
        }

        try {
            // Make sure Google Maps is loaded
            if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
                throw new Error("Google Maps API is not fully loaded. Please refresh the page.");
            }
            
            const geocoder = new window.google.maps.Geocoder();
            
            // Using a Promise wrapper for the geocode method to handle errors better
            const geocodePromise = new Promise((resolve, reject) => {
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results && results.length > 0) {
                        resolve(results);
                    } else {
                        reject(new Error(`Geocoding failed with status: ${status}`));
                    }
                });
            });
            
            const results = await geocodePromise;
            
            if (results && results.length > 0) {
                const addressComponents = results[0].address_components;
                const details = parseAddressComponents(addressComponents);
                
                // Update the location details state
                setLocationDetails({ 
                    ...details, 
                    formattedAddress: results[0].formatted_address,
                    coordinates: { lat, lng }
                });
                
                // Update the form data
                const newAddress = {
                    addressLine1: results[0].formatted_address.split(',')[0] || '',
                    locality: details.locality || '',
                    city: details.city || '',
                    state: details.state || '',
                    pincode: details.pincode || '',
                    country: details.country || '',
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6)
                };
                
                setAddress(newAddress);
                setLocalChanges(true);
                
                // Send the address data to the parent component if callback exists
                if (onAddressUpdate) {
                    onAddressUpdate(newAddress);
                }
            } else {
                throw new Error("No results found for this location");
            }
        } catch (error) {
            // More specific error messages based on the error
            if (error.message.includes("OVER_QUERY_LIMIT")) {
                setError("API quota exceeded. Please try again later or check your API key settings.");
            } else if (error.message.includes("REQUEST_DENIED")) {
                setError("API request denied. Please verify your API key has the Geocoding API enabled.");
            } else if (error.message.includes("INVALID_REQUEST")) {
                setError("Invalid request to the Geocoding API. Please try a different location.");
            } else {
                setError("Failed to fetch location details. " + error.message);
            }
            
            setLocationDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render ---

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex sm:flex-col lg:flex-row">
                {/* Details Section - Now on the left */}
                <div className=" lg:w-1/3 p-6 flex flex-col">
                    <p className="text-gray-500 mb-6 text-sm">Click on the map or drag the marker to set your location.</p>
                    
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4" role="alert">
                            <p className="font-semibold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                        </div>
                    ) : (
                        locationDetails && (
                                <div className="space-y-2 text-gray-700">
                                <InputField label="Address Line 1" value={address.addressLine1} onChange={(e) => {
                                    const updatedAddress = { ...address, addressLine1: e.target.value };
                                    setAddress(updatedAddress);
                                    setLocalChanges(true);
                                    if (onAddressUpdate) onAddressUpdate(updatedAddress);
                                }} />
                                <InputField label="Locality" value={address.locality} onChange={(e) => {
                                    const updatedAddress = { ...address, locality: e.target.value };
                                    setAddress(updatedAddress);
                                    setLocalChanges(true);
                                    if (onAddressUpdate) onAddressUpdate(updatedAddress);
                                }} />
                                <InputField label="City" value={address.city} onChange={(e) => {
                                    const updatedAddress = { ...address, city: e.target.value };
                                    setAddress(updatedAddress);
                                    setLocalChanges(true);
                                    if (onAddressUpdate) onAddressUpdate(updatedAddress);
                                }} />
                                <InputField label="Pincode" value={address.pincode} onChange={(e) => {
                                    const updatedAddress = { ...address, pincode: e.target.value };
                                    setAddress(updatedAddress);
                                    setLocalChanges(true);
                                    if (onAddressUpdate) onAddressUpdate(updatedAddress);
                                }} />
                                <InputField label="State" value={address.state} onChange={(e) => {
                                    const updatedAddress = { ...address, state: e.target.value };
                                    setAddress(updatedAddress);
                                    setLocalChanges(true);
                                    if (onAddressUpdate) onAddressUpdate(updatedAddress);
                                }} />
                                <InputField label="Country" value={address.country} onChange={(e) => {
                                    const updatedAddress = { ...address, country: e.target.value };
                                    setAddress(updatedAddress);
                                    setLocalChanges(true);
                                    if (onAddressUpdate) onAddressUpdate(updatedAddress);
                                }} />
                                
                            <div className="flex mt-2 text-xs text-gray-500">
                            <span className="mr-4">Latitude: {address.latitude}</span>
                            <span>Longitude: {address.longitude}</span>
                        </div>
                            </div>
                        )
                    )}
                </div>

                {/* Map Section - Now on the right */}
                <div 
                    className="sm:w-full lg:w-2/3 h-[500px]" 
                    ref={mapRef} 
                    id="map"
                    style={{ height: "500px", minHeight: "500px", position: "relative" }}
                >
                    {/* Loading indicator */}
                    {(!window.google || !window.google.maps || isLoading) && (
                        <div className="absolute inset-0 flex items-center justify-center h-full bg-gray-100 z-10">
                            <div className="text-center p-5 bg-white rounded-lg shadow-md">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto mb-4"></div>
                                <p className="text-gray-700 font-medium">Loading Google Maps...</p>
                                <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
                                <button 
                                    className="mt-4 px-4 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-colors"
                                    onClick={() => {
                                        // Reset and try again
                                        googleMapsLoader.reset();
                                        window.location.reload();
                                    }}
                                >
                                    Refresh Map
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Error display */}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center h-full bg-gray-100 bg-opacity-80 z-20">
                            <div className="text-center p-5 bg-white rounded-lg shadow-md max-w-md">
                                <div className="text-red-500 text-4xl mb-3">⚠️</div>
                                <p className="text-red-600 font-medium">Error Loading Map</p>
                                <p className="text-gray-700 mt-2">{error}</p>
                                <button 
                                    className="mt-4 px-4 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-colors"
                                    onClick={() => {
                                        setError(null);
                                        googleMapsLoader.reset();
                                        window.location.reload();
                                    }}
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Update Profile Button */}
            <div className="mt-6 flex justify-end space-x-3">
                {/* Cancel Button - only show if there are changes */}
                {hasChanges && onCancel && (
                    <button
                        className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        onClick={onCancel}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                )}
                
                {/* Save/Update Button */}
                <button
                    className={`px-6 py-2.5 rounded-lg text-white font-medium ${
                        hasChanges 
                            ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer' 
                            : 'bg-gray-400 cursor-not-allowed'
                    } transition-colors`}
                    disabled={!hasChanges || isSaving}
                    onClick={onSave}
                >
                    {isSaving ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating Profile...
                        </span>
                    ) : (
                        'Update Profile'
                    )}
                </button>
            </div>
        </div>
    );
}

// --- Sub-component for displaying a detail row ---
const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between border-b border-gray-200 py-2">
            <span className="font-semibold text-gray-600">{label}:</span>
            <span className="text-right">{value}</span>
        </div>
    );
};
