import React, { useState } from 'react';
import { PanelHeader } from '../../common/FormElements';
import { EyeIcon, EditIcon } from '../../common/Icons';

// This is a placeholder component that would typically be imported
const AccessControlDrawer = ({ isOpen, onClose, editMode, roleData }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {editMode ? 'Edit Access Control' : 'Create Access Control'}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {editMode 
                                        ? `Editing access control for ${roleData?.name}` 
                                        : 'Create a new access control role'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button 
                        type="button" 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        {editMode ? 'Save Changes' : 'Create'}
                    </button>
                    <button 
                        type="button" 
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const AccessControlsPanel = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const roles = [
        { id: 1, name: 'Admin', pages: 'Home, Analytics\nInvoices', permissions: 'Add: All, Edit: All, Delete: All' },
        { id: 2, name: 'Owner', pages: 'Home, Analytics\nInvoices', permissions: 'Add: All, Edit: All, Delete: All' },
        { id: 3, name: 'Receptionist', pages: 'Home, Analytics\nInvoices', permissions: 'Add: Some, Edit: Some, Delete: Some' },
        { id: 4, name: 'Artist', pages: 'Home, Analytics\nInvoices', permissions: 'Add: None, Edit: Some, Delete: None' },
        { id: 5, name: 'Only Billing', pages: 'Invoices', permissions: 'Add: None, Edit: None, Delete: None' },
    ];

    const handleView = (id) => {
        const role = roles.find(role => role.id === id);
        setEditingRole(role);
        setIsEditMode(true);
        setIsDrawerOpen(true);
    };
    
    const handleDelete = (id) => {
        // In a real application, you would implement deletion logic here
    };
    
    const openCreateDrawer = () => {
        setEditingRole(null);
        setIsEditMode(false);
        setIsDrawerOpen(true);
    };
    
    const closeDrawer = () => {
        setIsDrawerOpen(false);
    };

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
                <PanelHeader title="Access Controls" />
                <button 
                    onClick={openCreateDrawer}
                    className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                >
                    Create New Access Control
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-teal-500 text-white px-6 py-4 grid grid-cols-4 gap-4 items-center">
                    <div className="font-semibold text-left">SELECT ROLE</div>
                    <div className="font-semibold text-left">ALLOWED PAGE</div>
                    <div className="font-semibold text-left">ADD, EDIT & DELETE</div>
                    <div className="font-semibold text-right">ACTION</div>
                </div>
                
                {roles.map(role => (
                    <div key={role.id} className="border-b border-gray-200 px-6 py-4 grid grid-cols-4 gap-4 items-center">
                        <div className="text-gray-800 font-medium text-left">{role.name}</div>
                        <div className="text-gray-600 whitespace-pre-line text-left">{role.pages}</div>
                        <div className="text-gray-600 text-left">{role.permissions}</div>
                        <div className="flex items-center justify-end space-x-2">
                            <button 
                                onClick={() => handleView(role.id)} 
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                title="View details"
                            >
                                <EyeIcon />
                            </button>
                            <button 
                                onClick={() => handleView(role.id)} 
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                title="Edit role"
                            >
                                <EditIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* AccessControlDrawer usage */}
            {isDrawerOpen && (
                <AccessControlDrawer
                    isOpen={isDrawerOpen}
                    onClose={closeDrawer}
                    editMode={isEditMode}
                    roleData={editingRole}
                />
            )}
        </div>
    );
};

export default AccessControlsPanel;
