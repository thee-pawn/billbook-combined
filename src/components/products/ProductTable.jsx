import React from "react";
import {
  useTable,
  useSortBy,
  usePagination,
  useFilters,
  useGlobalFilter,
} from "react-table";
import "./../../css/CustomerTable.css"; // Import the CSS file
import { History, Pencil, Trash2 } from "lucide-react";

const ProductTable = ({ data, onDelete, onEdit }) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const columns = React.useMemo(
    () => [
      {Header: "Name",accessor: "name"},
      { Header: "Company",accessor: "company"},
      { Header: "Mfg Date", accessor: "mfgDate"},
      { Header: "Exp Date", accessor: "expDate"},
      { Header: "Price", accessor: "sellingPrice"},
      { Header: "Quantity", accessor: "quantity"},
      { Header: "Cost", accessor: "costPrice" },
      {
        Header: "Category",
        accessor: "category",
        Cell: ({ row }) => (
          <div style={{ maxWidth: "200px", wordWrap: "break-word" }}>
            {Array.isArray(row.original.category)
              ? row.original.category.join(", ") // Join array values with commas
              : row.original.category} {/* Handle non-array values */}
          </div>
        ),
      },
      
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="action-buttons">
            <button onClick={() => handleEdit(row.original)}><Pencil size={16} /></button>
            <button onClick={() => handleHistory(row.original)} style={{ marginLeft: "0.25rem", marginRight: "0.25rem" }}><History size={16} /></button>
            <button onClick={() => handleDelete(row.original)}><Trash2 size={16} /></button>
          </div>
        ),
      },
    ],
    []
  );

  const handleEdit = (record) => {
    onEdit(record);
  };

  const handleDelete = async (record) => {
      onDelete(record.id);
  };

  const handleHistory = (record) => {
    // Add your history logic here
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <div className="table-container">
      <table {...getTableProps()} className="customer-table">
      <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} style={column.style}>
                  <div className="header-content">
                    <span>{column.render("Header")}</span>
                    <span className="sort-arrows">
                      <span className={`arrow ${column.isSorted ? (column.isSortedDesc ? "sorted-desc" : "sorted-asc") : ""}`}>
                        {!column.isSortedDesc && <span className="arrow-up"></span>}
                        {column.isSortedDesc && <span className="arrow-down"></span>}
                      </span>
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} style={cell.column.style}>{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;