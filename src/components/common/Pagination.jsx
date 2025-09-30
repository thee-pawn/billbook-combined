import React from "react";
import { Select, Input, Button } from "antd";
import { ArrowBigDownIcon, ArrowBigLeft, ArrowBigRight, ArrowBigRightDashIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoveLeftIcon } from "lucide-react";

const PaginationComponent = ({
  entriesPerPage,
  setEntriesPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="pagination-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #ddd", paddingTop: "10px", marginTop: "10px" }}>
      <span style={{gap: "10px"}}>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}><ChevronsLeft/></Button>
        <Button onClick={() => setCurrentPage(1)}><ChevronLeft/></Button>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label>No. of items per page</label>
        <Input value={entriesPerPage} style={{ width: "50px" }} />
        <label style={{marginLeft: "100px"}}>Go to page</label>
        <Input value={currentPage} style={{ width: "50px" }} />/ {totalPages}
      </span>
      <span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}><ChevronRight/></Button>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}><ChevronsRight/></Button>
      </span>
    </div>
  );
};

export default PaginationComponent;