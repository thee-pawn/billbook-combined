import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './Icons';

/**
 * Artist Selector component for selecting artists from a dropdown
 */
const ArtistSelector = ({ 
    allArtists, 
    selectedArtists, 
    onAdd, 
    onRemove, 
    onClickArtist 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef(null);

    const availableArtists = allArtists.filter(
        artist => !selectedArtists.some(selected => selected.id === artist.id)
    );




    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectorRef]);
    
    return (
        <div className="relative" ref={selectorRef}>
            <div 
                className="relative block w-full min-h-[38px] p-1 border border-gray-300 bg-white rounded-md shadow-sm cursor-pointer" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 pr-8">
                    {selectedArtists.length > 1 ? (
                        selectedArtists.map((artist, index) => (
                            <div 
                                key={artist.id} 
                                className="flex items-center gap-1 bg-gray-200 rounded-md pl-2 cursor-pointer" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onClickArtist(); 
                                }}
                            >
                                <span className="text-sm font-medium">{artist.name}</span>
                                <span className="text-sm font-medium text-gray-600 border-l border-gray-400 px-2">
                                    Amt: {artist.amount || 0}
                                </span>
                                <button 
                                    type="button" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        onRemove(index); 
                                    }} 
                                    className="text-gray-500 hover:text-red-600 p-0.5"
                                >
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    ) : selectedArtists.length > 0 ? (
                        selectedArtists[0].name
                    ) : (
                        !selectedArtists.length && <span className="text-sm text-gray-400 p-1">Select Artist(s)</span>
                    )}
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg 
                        className="w-5 h-5 text-gray-400" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path 
                            fillRule="evenodd" 
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                            clipRule="evenodd" 
                        />
                    </svg>
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <ul className="py-1 max-h-40 overflow-y-auto">
                        {availableArtists.length > 0 ? (
                            availableArtists.map(artist => (
                                <li 
                                    key={artist.id} 
                                    onClick={() => { 
                                        onAdd(artist.id); 
                                        setIsOpen(false); 
                                    }} 
                                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left"
                                >
                                    {artist.name}
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-gray-500">No more artists</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ArtistSelector;
