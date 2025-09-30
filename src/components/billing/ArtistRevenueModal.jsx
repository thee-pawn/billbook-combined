import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from '@components/common/Modal';

/**
 * Modal for editing artist revenue sharing
 */
const ArtistRevenueModal = ({ 
    isOpen, 
    onClose, 
    serviceArtists, 
    allArtists, 
    totalAmount, 
    onSave 
}) => {
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        setArtists(JSON.parse(JSON.stringify(serviceArtists)));
    }, [isOpen, serviceArtists]);

    if (!isOpen) return null;

    const handleArtistUpdate = (index, field, value) => {
        const updated = [...artists];
        updated[index][field] = value;
        setArtists(updated);
    };
    
    const removeArtist = (index) => {
        setArtists(artists.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(artists);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Artist Revenue Share" widthClass="max-w-lg">
            <div className="mb-4 text-right font-semibold text-gray-700">Service Total Amount: ₹{totalAmount || '0.00'}</div>
            <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 bg-gray-100 p-2 rounded-md text-sm font-semibold">
                    <div className="col-span-6">Artist Name</div>
                    <div className="col-span-3 text-center">Amount (₹)</div>
                    <div className="col-span-2 text-center">%</div>
                    <div className="col-span-1"></div>
                </div>
                {artists.map((artist, index) => (
                    <div key={artist.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6 font-medium">{artist.name}</div>
                        <div className="col-span-3">
                            <input 
                                type="number" 
                                placeholder="INR" 
                                value={artist.inr || ''} 
                                onChange={(e) => handleArtistUpdate(index, 'inr', e.target.value)} 
                                className="w-full px-2 py-1 border border-gray-300 rounded-md sm:text-sm text-right"
                            />
                        </div>
                        <div className="col-span-2">
                            <input 
                                type="number" 
                                placeholder="%" 
                                value={artist.percentage || ''} 
                                onChange={(e) => handleArtistUpdate(index, 'percentage', e.target.value)} 
                                className="w-full px-2 py-1 border border-gray-300 rounded-md sm:text-sm text-right"
                            />
                        </div>
                        <div className="col-span-1 text-center">
                            <button 
                                onClick={() => removeArtist(index)} 
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleSave} 
                    className="bg-teal-600 text-white font-bold py-2 px-6 rounded-md hover:bg-teal-700 text-sm"
                >
                    Save Share
                </button>
            </div>
        </Modal>
    );
};

export default ArtistRevenueModal;
