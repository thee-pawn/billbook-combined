import React, { useState, useEffect } from "react";
import "./../../css/Customer.css"; // Import the CSS file
import GenericTable from "@components/common/GenericTable";
import { EditIcon, EyeIcon, KeyRoundIcon, RecycleIcon, Trash2Icon, X } from "lucide-react";
import { Drawer } from "@components/common/Drawer";
import AddServiceForm from "./ServicesForm";
import { servicesApi } from "../../apis/APIs";
import { DeleteConfirmationModal } from "@components/common/DeleteConfirmationModal";
import { useStore } from '../login/StoreContext';
import { useNotification } from '../../contexts/NotificationContext';

// Using shared DeleteConfirmationModal

// Using shared Drawer

const Services = () => {
  const { currentStore } = useStore();
  const { showNotification } = useNotification();
  const [data, setData] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    if (!currentStore?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await servicesApi.getAll(currentStore.id);
      
      if (response && response.data && response.data.services) {
        // Transform the data to match frontend expectations
        const transformedServices = response.data.services.map(service => ({
          id: service.id,
          name: service.name,
          category: service.category,
          description: service.description,
          gender: service.gender,
          duration: service.duration,
          price: parseFloat(service.price),
          reminder: service.reminder,
          status: service.status,
          taxPercnt: parseFloat(service.tax_prcnt),
          createdAt: service.created_at,
          updatedAt: service.updated_at,
          storeId: service.store_id,
          productUsage: service.productUsage || []
        }));
        setData(transformedServices);
      } else {
        console.warn('No services found in response');
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      // Set empty array on error instead of mock data
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStore?.id) {
      fetchServices();
    }
  }, [currentStore?.id]);

  const handleAddService = () => {
    setSelectedService(null);
    setDrawerTitle("Add Service");
    setIsDrawerOpen(true);
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setDrawerTitle('View Service Details');
    setIsDrawerOpen(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setDrawerTitle('Edit Service');
    setIsDrawerOpen(true);
  };

  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedService(null);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setDrawerTitle("Edit Service");
    setIsDrawerOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentStore?.id || !serviceToDelete) return;
    
    try {
      await servicesApi.delete(currentStore.id, serviceToDelete.id);
      
      // Update the state to remove the deleted service
      setData((prevData) => prevData.filter((service) => service.id !== serviceToDelete.id));
    } catch (error) {
      console.error("Error deleting service:", error);
    } finally {
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleSaveService = async (serviceData) => {
    if (!currentStore?.id) return;
    
    
    try {
      if (selectedService) {
        // Update existing service
        const response = await servicesApi.update(currentStore.id, selectedService.id, serviceData);
        
        // Update the local state with the updated service
        if (response && response.data && response.data.service) {
          const updatedService = {
            id: response.data.service.id,
            name: response.data.service.name,
            category: response.data.service.category,
            description: response.data.service.description,
            gender: response.data.service.gender,
            duration: response.data.service.duration,
            price: parseFloat(response.data.service.price),
            reminder: response.data.service.reminder,
            status: response.data.service.status,
            taxPercnt: parseFloat(response.data.service.tax_prcnt),
            createdAt: response.data.service.created_at,
            updatedAt: response.data.service.updated_at,
            storeId: response.data.service.store_id,
            productUsage: response.data.service.productUsage || []
          };
          
          setData(prevData => 
            prevData.map(service => 
              service.id === selectedService.id ? updatedService : service
            )
          );
        }
      } else {
        // Add new service
        const response = await servicesApi.create(currentStore.id, serviceData);
        
        // Add the new service to local state
        if (response && response.data && response.data.service) {
          const newService = {
            id: response.data.service.id,
            name: response.data.service.name,
            category: response.data.service.category,
            description: response.data.service.description,
            gender: response.data.service.gender,
            duration: response.data.service.duration,
            price: parseFloat(response.data.service.price),
            reminder: response.data.service.reminder,
            status: response.data.service.status,
            taxPercnt: parseFloat(response.data.service.tax_prcnt),
            createdAt: response.data.service.created_at,
            updatedAt: response.data.service.updated_at,
            storeId: response.data.service.store_id,
            productUsage: response.data.service.productUsage || []
          };
          setData(prevData => [...prevData, newService]);
        }
      }
      
      handleDrawerClose();
    } catch (error) {
      console.error("Error saving service:", error);
      // Handle error appropriately - maybe show a toast notification
    }
  };

  // Extract unique values for filters
  const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);

  const columns = [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      searchable: true,
      sortable: true
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      filterable: true,
      filterType: 'custom',
      filterRenderer: (value, onChange) => {
        const options = uniqueCategories;
        const selectedOptions = value || [];
        
        const handleToggleOption = (option) => {
          if (selectedOptions.includes(option)) {
            onChange(selectedOptions.filter(item => item !== option));
          } else {
            onChange([...selectedOptions, option]);
          }
        };
        
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Select Category</div>
            {options.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`category-${option}`}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor={`category-${option}`} className="text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      },
      filterMatcher: (rowValue, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        return filterValue.includes(rowValue);
      }
    },
    {
      id: 'gender',
      header: 'Gender',
      accessor: 'gender',
      filterable: true,
      filterType: 'custom',
      cellRenderer: (row) => {
        if (row.gender.toLowerCase() === 'male') return 'Male'
        else if (row.gender.toLowerCase() === 'female') return 'Female'
        else return 'Unisex'
      },
        
      filterRenderer: (value, onChange) => {
        const options = ['Male', 'Female'];
        const selectedOptions = value || [];
        
        const handleToggleOption = (option) => {
          if (selectedOptions.includes(option)) {
            onChange(selectedOptions.filter(item => item !== option));
          } else {
            onChange([...selectedOptions, option]);
          }
        };
        
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Select Gender</div>
            {options.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`gender-${option}`}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor={`gender-${option}`} className="text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      },
      filterMatcher: (rowValue, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        return filterValue.includes(rowValue);
      }
    },
    {
      id: 'duration',
      header: 'Duration',
      accessor: 'duration',
      cellRenderer: (row) => {
        let hours = Math.floor(row.duration / 60) ;
        let minutes = (row.duration % 60) ;
        if(hours > 0) {
          return `${hours} hr ${minutes} min`;
        }
        return `${minutes} min`;
      } 
    },
    {
      id: 'price',
      header: 'Price',
      accessor: 'price',
      sortable: true
    },
    {
      id: 'reminder',
      header: 'Reminder',
      accessor: 'reminder',
      cellRenderer: (row) => + (row.reminder) + ' Days'
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      filterable: true,
      filterType: 'custom',
      cellRenderer: (row) => {
        if (row.status.toLowerCase() === 'active') return 'Active'
        else if (row.status.toLowerCase() === 'inactive') return 'Inactive'
      },
      filterRenderer: (value, onChange) => {
        const options = ['Active', 'Inactive'];
        const selectedOptions = value || [];
        
        const handleToggleOption = (option) => {
          if (selectedOptions.includes(option)) {
            onChange(selectedOptions.filter(item => item !== option));
          } else {
            onChange([...selectedOptions, option]);
          }
        };
        
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Select Status</div>
            {options.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`status-${option}`}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor={`status-${option}`} className="text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      },
      filterMatcher: (rowValue, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        return filterValue.includes(rowValue);
      }
    }
  ];

  // Row Actions for GenericTable
  const rowActions = [
    { 
      icon: <EyeIcon className="text-blue-600 hover:text-blue-800" size={22}/>, 
      title: 'View Service',
      onClick: (row) => handleViewService(row)
    },
    { 
      icon: <EditIcon className="text-green-600 hover:text-green-800" size={22} />, 
      title: 'Edit Service',
      onClick: (row) => handleEditService(row)
    },
    { 
      icon: <Trash2Icon className="text-red-600 hover:text-red-800" size={22} />, 
      title: 'Delete Service', 
      onClick: (row) => handleDeleteService(row)
    }
  ];

  return (
    <div className="p-4 px-6 ">
      <div className="customer-header">
        <div className="text-3xl font-bold text-teal-700 text-left  mb-4 p-0">Services</div>
        <button
          onClick={handleAddService}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
        >
          Add Service
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <GenericTable
          columns={columns}
          data={data}
          rowActions={rowActions}
          defaultSort={{ key: 'name', direction: 'ascending' }}
          loading={loading}
        />
      </div>
      
      {/* Drawer for Add/Edit Service */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={handleDrawerClose} 
        title={drawerTitle}
      >
        <AddServiceForm 
          onSave={handleSaveService}
          onCancel={handleDrawerClose}
          initialServiceData={selectedService}
          isViewMode={drawerTitle === 'View Service Details'}
        />
      </Drawer>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Services;