import React, { useState, useMemo, useRef, useEffect } from 'react';

// --- Icon Placeholders (Replace with your actual icons) ---
const SortIcon = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>;
const SortAscIcon = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>;
const SortDescIcon = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5 4v-12m0 0l-4 4m4-4l4 4" /></svg>;
const SearchIcon = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const FilterIcon = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const XIcon = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// Custom checkbox component
const CustomCheckbox = ({ checked, onChange, small = false }) => (
  <div
    onClick={onChange}
    className={`cursor-pointer border-2 rounded flex items-center justify-center transition-colors duration-200
      ${checked 
        ? 'bg-teal-700 border-teal-700' 
        : 'bg-white border-gray-300 hover:border-teal-500'}
      ${small ? 'w-4 h-4' : 'w-5 h-5'}`
    }
    style={{ minWidth: small ? '1rem' : '1rem' }}
  >
    {checked && <CheckIcon className="text-white w-3 h-3" />}
  </div>
);


/**
 * GenericTable Component
 * @param {object[]} columns - Array of column definitions.
 * Each column object: {
 * id: string, (Unique identifier for the column)
 * header: string, (Display name for the header)
 * accessor: string | function, (Key in data object or accessor function)
 * sortable?: boolean,
 * searchable?: boolean, (Enables simple text search input below header)
 * filterable?: boolean, (Enables filter icon and dropdown)
 * filterType?: 'text' | 'select' | 'dateRange' | 'custom', (Required if filterable)
 * filterOptions?: { value: any, label: string }[], (Required for filterType 'select')
 * filterRenderer?: (value: any, onChange: (newValue: any) => void, closeFilter: () => void) => JSX.Element, (Required for filterType 'custom')
 * filterMatcher?: (rowValue: any, filterValue: any) => boolean, (Optional custom logic for matching filter value to row value)
 * cellRenderer?: (row, value) => JSX.Element,
 * textAlign?: 'left' | 'center' | 'right',
 * headerClassName?: string,
 * cellClassName?: string,
 * width?: string, (e.g., '100px', '10%', etc.)
 * minWidth?: string, (e.g., '100px', etc.)
 * maxWidth?: string, (e.g., '200px', '20%', etc.)
 * }
 * @param {object[]} data - Array of data objects to display.
 * @param {object[]} [rowActions] - Optional array of action definitions for each row.
 * @param {string} [tableClassName] - Optional CSS class for the table element.
 * @param {string} [theadClassName] - Optional CSS class for the thead element.
 * @param {string} [tbodyClassName] - Optional CSS class for the tbody element.
 * @param {string} [trClassName] - Optional CSS class for table row (tbody tr).
 * @param {string} [noDataMessage] - Message to display when data is empty.
 * @param {object} [defaultSort] - Optional. { key: string (accessor), direction: 'ascending' | 'descending' }.
 * @param {object} [initialFilterValues] - Optional. Initial state for filters { columnId: value, ... }.
 * @param {boolean} [enableRowSelection] - Optional. If true, enables row selection with checkboxes.
 * @param {function} [onRowSelect] - Optional. Callback function when a row is selected/deselected.  Passes the row data and selection status.
 * @param {function} [onSelectAll] - Optional. Callback function when all rows are selected/deselected. Passes an array of all row data.
 * @param {number} [pageSize] - Optional. Default number of rows per page for pagination.
 * @param {number[]} [pageSizeOptions] - Optional. Array of available page size options for the user to select.
 */
const GenericTable = ({
  columns,
  data,
  rowActions,
  tableClassName = "w-full text-sm text-left text-gray-700",
  theadClassName = "text-xs text-white uppercase bg-gray-50 relative",
  tbodyClassName = "",
  trClassName = "even:bg-white odd:bg-gray-50 hover:bg-gray-100",
  noDataMessage = "No data available.",
  defaultSort,
  initialFilterValues = {},
  enableRowSelection = false,
  onRowSelect,
  onSelectAll,
  pageSize = 10, // Default page size
  pageSizeOptions = [5, 10, 25, 50, 100], // Default page size options
}) => {
  const [sortConfig, setSortConfig] = useState(defaultSort || null);
  const [searchTerms, setSearchTerms] = useState(() => {
    const initialSearch = {};
    columns.forEach(col => { if (col.searchable) initialSearch[getColumnAccessorKey(col)] = ''; });
    return initialSearch;
  });
  const [showSearchInput, setShowSearchInput] = useState(() => {
    const initialShow = {};
    columns.forEach(col => { if (col.searchable) initialShow[getColumnAccessorKey(col)] = false; });
    return initialShow;
  });
  // State for filters
  const [filterValues, setFilterValues] = useState(initialFilterValues);
  const [activeFilterColId, setActiveFilterColId] = useState(null); // ID of the column whose filter dropdown is open
  const [selectedRows, setSelectedRows] = useState({}); // Track selected rows by their index or a unique identifier
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const filterDropdownRef = useRef(null); // Ref for the filter dropdown container

  // Effect to close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        // Check if the click target is NOT a filter toggle button
        if (!event.target.closest('[data-filter-toggle]')) {
            setActiveFilterColId(null); // Close dropdown
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterDropdownRef]);

    // Effect to handle select all
    useEffect(() => {
        if (enableRowSelection) {
            if (selectAll) {
                const allRowKeys = data.map((row, index) => index); // Use index as key
                const initialSelected = {};
                allRowKeys.forEach(key => initialSelected[key] = true);
                setSelectedRows(initialSelected);
                if (onSelectAll) {
                    onSelectAll(data); // Pass all row data
                }
            } else {
                setSelectedRows({});
                if (onSelectAll) {
                    onSelectAll([]); // Pass empty array
                }
            }
        }
    }, [selectAll, data, enableRowSelection, onSelectAll]);


  // Helper to get the accessor key (string or function id)
  function getColumnAccessorKey(column) {
    return typeof column.accessor === 'string' ? column.accessor : column.id;
  }

  // Helper to get the actual value from a row based on accessor
  function getRowValue(row, column) {
      if (!column) return undefined;
      return typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor];
  }

  // --- Data Processing (Search, Filter, Sort) ---
  const processedData = useMemo(() => {
    let items = [...data];

    // 1. Apply Search (Simple text search)
    const activeSearchTerms = Object.entries(searchTerms).filter(([, value]) => value.trim() !== '');
    if (activeSearchTerms.length > 0) {
      items = items.filter(item => {
        return activeSearchTerms.every(([accessorKey, term]) => {
          const column = columns.find(col => getColumnAccessorKey(col) === accessorKey);
          const value = String(getRowValue(item, column) ?? '').toLowerCase();
          return value.includes(term.toLowerCase());
        });
      });
    }

    // 2. Apply Filters (From internal filter state)
    const activeFilters = Object.entries(filterValues).filter(([, value]) => value !== undefined && value !== '' && value !== null);
    if (activeFilters.length > 0) {
        items = items.filter(item => {
            return activeFilters.every(([colId, filterValue]) => {
                const column = columns.find(col => col.id === colId);
                if (!column) return true; // Should not happen if state is managed correctly

                const rowValue = getRowValue(item, column);

                // Use custom matcher if provided
                if (column.filterMatcher) {
                    return column.filterMatcher(rowValue, filterValue);
                }

                // Default matching logic based on type
                switch (column.filterType) {
                    case 'text':
                        return String(rowValue ?? '').toLowerCase().includes(String(filterValue ?? '').toLowerCase());
                    case 'select':
                        // Handle potential array values if needed, otherwise direct comparison
                        return String(rowValue) === String(filterValue);
                    case 'dateRange':
                        if (!filterValue.start && !filterValue.end) return true; // No range set
                        const itemDate = new Date(rowValue);
                        if (isNaN(itemDate)) return false; // Invalid date in data
                        const startDate = filterValue.start ? new Date(filterValue.start) : null;
                        const endDate = filterValue.end ? new Date(filterValue.end) : null;
                        // Adjust end date to include the whole day
                        if (endDate) endDate.setHours(23, 59, 59, 999); 
                        
                        return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
                    case 'custom':
                        // For custom filters, assume filterValue holds enough info,
                        // or rely solely on a filterMatcher if complex logic needed.
                        // This default might need adjustment based on custom filter needs.
                        console.warn(`Default matching for 'custom' filter on column ${colId} might be insufficient without a filterMatcher.`);
                        return String(rowValue ?? '').includes(String(filterValue ?? ''));
                    default:
                        return true; // No matching logic for unknown type
                }
            });
        });
    }

    // 3. Apply Sort
    if (sortConfig !== null && sortConfig.key) {
      items.sort((a, b) => {
        const column = columns.find(col => getColumnAccessorKey(col) === sortConfig.key);
        if (!column) return 0;

        let valA = getRowValue(a, column);
        let valB = getRowValue(b, column);

        // Handle different data types for sorting
        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        // Basic date comparison (assumes date strings or Date objects)
        const dateA = new Date(valA);
        const dateB = new Date(valB);
        if (!isNaN(dateA) && !isNaN(dateB)) {
             return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }

        // Fallback comparison
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return items;
  }, [data, searchTerms, sortConfig, filterValues, columns]);

  // --- Pagination ---
  // Calculate pagination values
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = processedData.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (totalPages > 5) {
      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // --- Handlers ---
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      setSortConfig(null); // Third click removes sort
      return;
    }
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (accessorKey, value) => {
    setSearchTerms(prev => ({ ...prev, [accessorKey]: value }));
  };

  const toggleSearchInput = (accessorKey) => {
    setShowSearchInput(prev => {
        const newState = !prev[accessorKey];
        if (!newState) handleSearchChange(accessorKey, ''); // Clear search on hide
        return {...prev, [accessorKey]: newState };
    });
  };

  const handleFilterValueChange = (colId, value) => {
    setFilterValues(prev => ({ ...prev, [colId]: value }));
  };

  const clearFilter = (colId) => {
     setFilterValues(prev => {
        const newFilters = { ...prev };
        delete newFilters[colId]; // Remove the filter value for this column
        return newFilters;
    });
    setActiveFilterColId(null); // Close dropdown after clearing
  }

  const toggleFilterDropdown = (colId) => {
    setActiveFilterColId(prev => (prev === colId ? null : colId)); // Toggle dropdown
  };

    const handleRowSelect = (rowIndex, row) => {
        setSelectedRows(prev => {
            const isSelected = !!prev[rowIndex];
            const newSelectedRows = { ...prev };

            if (isSelected) {
                delete newSelectedRows[rowIndex];
            } else {
                newSelectedRows[rowIndex] = true;
            }

            // Get all selected rows data
            const selectedData = processedData.filter((_, index) => newSelectedRows[index]);

            if (onRowSelect) {
                onRowSelect(selectedData); // Pass array of selected rows
            }

            return newSelectedRows;
        });
    };

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        
        if (newSelectAll) {
          // Select all rows
          const allRowKeys = processedData.map((_, index) => index);
          const initialSelected = {};
          allRowKeys.forEach(key => initialSelected[key] = true);
          setSelectedRows(initialSelected);
          
          if (onRowSelect) {
            onRowSelect(processedData); // Pass all rows when selecting all
          }
        } else {
          // Deselect all rows
          setSelectedRows({});
          if (onRowSelect) {
            onRowSelect([]); // Pass empty array when deselecting all
          }
        }
      };

  // --- Render Helpers ---
  const renderSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <SortIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0" />;
    }
    return sortConfig.direction === 'ascending' ?
      <SortAscIcon className="w-4 h-4 text-white ml-1 flex-shrink-0" /> :
      <SortDescIcon className="w-4 h-4 text-white ml-1 flex-shrink-0" />;
  };

  const renderFilterDropdown = (col) => {
    if (activeFilterColId !== col.id) return null;

    const currentValue = filterValues[col.id];

    const handleLocalChange = (newValue) => {
        handleFilterValueChange(col.id, newValue);
        // Optionally close dropdown on change for some filter types like 'select'
        // if (col.filterType === 'select') setActiveFilterColId(null);
    };

    const closeFilter = () => setActiveFilterColId(null);

    let filterContent;
    switch (col.filterType) {
        case 'text':
            filterContent = (
                <input
                    type="text"
                    value={currentValue || ''}
                    onChange={(e) => handleLocalChange(e.target.value)}
                    placeholder={`Filter ${col.header}...`}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            );
            break;
        case 'select':
            filterContent = (
                <select
                    value={currentValue || ''}
                    onChange={(e) => handleLocalChange(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                    <option value="">All</option>
                    {col.filterOptions?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );
            break;
        case 'dateRange':
             const startDate = currentValue?.start || '';
             const endDate = currentValue?.end || '';
             filterContent = (
                 <div className="space-y-2">
                    <div>
                        <label className="block text-xs mb-1 text-gray-500">Start Date:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => handleLocalChange({
                                start: e.target.value,
                                end: currentValue?.end || ''
                            })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                         />
                    </div>
                     <div>
                        <label className="block text-xs mb-1 text-gray-500">End Date:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => handleLocalChange({
                                start: currentValue?.start || '',
                                end: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                         />
                    </div>
                 </div>
             );
             break;
        case 'custom':
            if (col.filterRenderer) {
                filterContent = col.filterRenderer(currentValue, handleLocalChange, closeFilter);
            } else {
                filterContent = <span className="text-xs text-red-500">filterRenderer not provided</span>;
            }
            break;
        default:
            filterContent = <span className="text-xs text-gray-500">Unknown filter type</span>;
    }

    return (
      <div
        ref={filterDropdownRef} // Attach ref here
        className="absolute z-10 top-full left-0 mt-1 p-3 bg-white border border-gray-300 rounded-md shadow-lg w-60" // Adjust width (w-60) as needed
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {filterContent}
        <div className="mt-3 flex justify-between items-center">
            <button
                onClick={() => clearFilter(col.id)}
                className="text-xs text-blue-600 hover:underline"
            >
                Clear Filter
            </button>
             <button
                onClick={closeFilter}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
                Close
            </button>
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="overflow-x-auto overflow-y-visible min-h-60">
      <table className={`${tableClassName} table-fixed w-full`}>
        <colgroup>
          {enableRowSelection && (
            <col style={{ width: '60px' }} />
          )}
          {columns.map((col) => (
            <col 
              key={col.id} 
              style={{ 
                width: col.width || 'auto',
                minWidth: col.minWidth || '100px',
                maxWidth: col.maxWidth || 'auto'
              }} 
            />
          ))}
          {rowActions && rowActions.length > 0 && (
            <col style={{ width: `${rowActions.length * 40}px` }} />
          )}
        </colgroup>
        <thead className={theadClassName}>
          <tr>
            {enableRowSelection && (
              <th scope="col" className="px-4 py-3 text-center whitespace-nowrap text-lg bg-teal-500">
                <div className="flex justify-center items-center">
                  <CustomCheckbox
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </div>
              </th>
            )}
            {columns.map((col) => {
              const accessorKey = getColumnAccessorKey(col);
              const isFilterActive = filterValues[col.id] !== undefined && filterValues[col.id] !== '' && filterValues[col.id] !== null;
              return (
                <th
                  key={col.id}
                  scope="col"
                  className={`px-4 py-3 bg-teal-500 relative ${col.headerClassName || ''}`}
                  style={{ textAlign: col.textAlign || 'left', width: col.width, maxWidth: col.maxWidth }}
                >
                  <div className="flex flex-col w-full">
                    {/* Header Text & Icons */}
                    <div className="flex items-center justify-between flex-nowrap">
                      {/* Column header with proper wrapping */}
                      <div className="flex items-center min-w-0 flex-grow">
                        {col.sortable ? (
                          <button onClick={() => requestSort(accessorKey)} className="flex items-center group text-lg min-w-0">
                            <span className="break-words hyphens-auto leading-tight text-left truncate mr-1">{col.header}</span>
                            {renderSortIcon(accessorKey)}
                          </button>
                        ) : (
                          <button className="flex items-center group text-lg min-w-0">
                            <span className="break-words hyphens-auto leading-tight text-left truncate">{col.header}</span>
                          </button>
                        )}
                      </div>

                      {/* Icons container - ensures they stay on same line */}
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-1 whitespace-nowrap">
                        {/* Search and Filter Icons */}
                        {col.searchable && (
                          <button onClick={() => toggleSearchInput(accessorKey)} className="p-1 rounded hover:bg-white-200" title={`Search ${col.header}`} data-search-toggle>
                            <SearchIcon className={`w-4 h-4 ${showSearchInput[accessorKey] ? 'text-white' : 'text-white opacity-70'}`} />
                          </button>
                        )}
                        {col.filterable && (
                          <button onClick={() => toggleFilterDropdown(col.id)} className="p-1 rounded hover:bg-white-200" title={`Filter ${col.header}`} data-filter-toggle>
                            <FilterIcon className={`w-4 h-4 ${activeFilterColId === col.id || isFilterActive ? 'text-white' : 'text-white opacity-70'}`} />
                          </button>
                        )}

                        {/* Other Header Actions */}
                        {col.headerActions?.map((action, index) => (
                          <button key={index} onClick={action.onClick} className={`p-1 rounded hover:bg-white/20 ${action.isActive ? 'text-white bg-white/20' : 'text-white opacity-70'}`} title={action.title}>
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Search Input (if enabled and shown) */}
                    {col.searchable && showSearchInput[accessorKey] && (
                      <div className="absolute left-0 right-0 top-full mt-1 px-4 py-2 bg-white shadow-lg z-10 border border-gray-200 rounded-md">
                        <input
                          type="text"
                          placeholder={`Search ${col.header}...`}
                          value={searchTerms[accessorKey] || ''}
                          onChange={(e) => handleSearchChange(accessorKey, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-white-500 focus:border-white-500"
                        />
                      </div>
                    )}
                  </div>
                  {/* Filter Dropdown (Rendered conditionally) */}
                  {renderFilterDropdown(col)}
                </th>
              );
            })}
            {/* Row Actions Header */}
            {rowActions && rowActions.length > 0 && (
              <th scope="col" className="px-4 py-3 text-center whitespace-nowrap text-lg bg-teal-500">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className={tbodyClassName}>
          {currentData.length > 0 ? (
            currentData.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className={trClassName}>
                {enableRowSelection && (
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center items-center">
                      <CustomCheckbox
                        checked={!!selectedRows[rowIndex]}
                        onChange={() => handleRowSelect(rowIndex, row)}
                        small
                      />
                    </div>
                  </td>
                )}
                {columns.map((col) => {
                  const value = getRowValue(row, col);
                  return (
                    <td 
                      key={col.id} 
                      className={`px-4 py-2 ${col.cellClassName || ''}`} 
                      style={{ 
                        textAlign: col.textAlign || 'left',
                        width: col.width,
                        maxWidth: col.maxWidth,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      <div className="truncate">
                        {col.cellRenderer ? col.cellRenderer(row, value) : (value !== null && value !== undefined ? String(value) : '')}
                      </div>
                    </td>
                  );
                })}
                {rowActions && rowActions.length > 0 && (
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      {rowActions.map((action, actionIndex) => (
                        <button key={actionIndex} onClick={() => action.onClick(row)} className="text-gray-500 hover:text-gray-700 p-1" title={action.title}>
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (rowActions ? 1 : 0) + (enableRowSelection ? 1 : 0)} className="text-center py-4 text-gray-500">
                {noDataMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {totalItems > 0 && (
        <div className="flex sm:flex-row justify-between items-center gap-4 mt-4 px-4 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 pr-6 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {endIndex} of {totalItems} entries
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ««
            </button>

            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm border rounded hover:bg-gray-50 
                  ${currentPage === page ? 'bg-teal-500 text-white hover:bg-teal-600' : ''}`}
              >
                {page}
              </button>
            ))}

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericTable;