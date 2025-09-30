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

const CustomerTable = ({ data, onDelete, onEdit }) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <div style={{ maxWidth: "200px", wordWrap: "break-word" }}>
            {row.original.firstName} {row.original.lastName}
          </div>
        ),
      },
      {
        Header: "M/F",
        accessor: "gender",
        Cell: ({ value }) => {
          const gender = value.toLowerCase();
          return gender === "male" ? "M" : gender === "female" ? "F" : "O";
        },
      },
      { Header: "Birthday", accessor: "birthday",
        Cell: ({ row }) => (
          <div style={{ maxWidth: "200px", wordWrap: "break-word" }}>
            {row.original.birthdayDay} {months.at(row.original.birthdayMonth)}
          </div>
        ),
       },
      { Header: "Anniversary", accessor: "anniversary",
        Cell: ({ row }) => (
          <div style={{ maxWidth: "200px", wordWrap: "break-word" }}>
            {row.original.anniversaryDay} {months.at(row.original.anniversaryMonth)}
          </div>
        ),
       },
      { Header: "Membership", accessor: "membership",
        Cell: ({ value }) => (
          <div style={{ maxWidth: "100px", wordWrap: "break-word" }}>
            {value === null || value === "" ? "N/A" : value}
          </div>
        ),
       },
      {
        Header: "Loyalty Points",
        accessor: "points",
        style: { maxWidth: "120px" },
        Cell: ({ value }) => (
          <div style={{ maxWidth: "100px", wordWrap: "break-word" }}>
            {value}
          </div>
        ),
      },
      { Header: "Wallet Amount", accessor: "walletBalance",
        style: { maxWidth: "120px" },
        Cell: ({ value }) => (
          <div style={{ maxWidth: "100px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {value}
          </div>
        ),
       },
      { Header: "Revenue", accessor: "totalRevenue" },
      { Header: "Dues", accessor: "dues" },
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

export default CustomerTable;