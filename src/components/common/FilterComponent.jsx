import React, { useState } from "react";
import { Select, Input, DatePicker, Button } from "antd";
import { EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import LogoIcon from "../sidebar/LogoIcon";
import { Search } from "lucide-react";
import "./../../css/Filter.css";

const { RangePicker } = DatePicker;
const operations = [
    { op: "=", label: "equals" },
    { op: "!=", label: "not equals" },
    { op: ">", label: "greater than" },
    { op: "<", label: "less than" },
    { op: "in range", label: "in range" }
];


const FilterComponent = ({ keys }) => {
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [value, setValue] = useState(null);
  const [filters, setFilters] = useState([]);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [showFilterButton, setFiletButton] = useState(true);

  const handleKeyChange = (key) => {
    const selected = keys.find((item) => item.key === key);
    setSelectedKey(key);
    setSelectedType(selected ? selected.type : null);
    setSelectedOperation(null);
    setValue(null);
  };

  const handleOperationChange = (op) => {
    setSelectedOperation(op);
    setValue(null);
  };

  const handleFIlterCancellation = () => {
    setSelectedKey(null);
    setSelectedType(null);
    setSelectedOperation(null);
    setValue(null);
    setShowFilterOptions(false);
    setFiletButton(true);
  }

  const onAddFilterClick = () => {
    setShowFilterOptions(true);
    setFiletButton(false);
  }


  const addFilter = () => {
    if (!selectedKey || !selectedOperation || !value) return;
    const newFilter = { key: selectedKey, operation: selectedOperation, value };
    if (editingIndex !== null) {
      const updatedFilters = [...filters];
      updatedFilters[editingIndex] = newFilter;
      setFilters(updatedFilters);
      setEditingIndex(null);
    } else {
      setFilters([...filters, newFilter]);
    }
    setSelectedKey(null);
    setSelectedType(null);
    setSelectedOperation(null);
    setValue(null);
    setShowFilterOptions(false);
    setFiletButton(true);
  };

  const editFilter = (index) => {
    const filter = filters[index];
    setSelectedKey(filter.key);
    setSelectedType(keys.find((item) => item.key === filter.key)?.type);
    setSelectedOperation(filter.operation);
    setValue(filter.value);
    setEditingIndex(index);
    setShowFilterOptions(true);
  };

  const deleteFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  return (
    <div className="container">
        <div className="div1">
            <div style={{ gap: "5px", textAlign: "left", marginBottom: "10px"}}>
            {showFilterButton && <Button onClick={() => onAddFilterClick()}>Add Filter</Button>}
            {showFilterOptions && (
                <div style={{display: "flex", gap: "5px"}}>
                    <Select
                        placeholder="Select Key"
                        options={keys.map(({ key }) => ({ value: key, label: key }))}
                        onChange={handleKeyChange}
                        value={selectedKey}
                    />
                    {selectedType && (<span>
                        <Select
                        placeholder="Select Operation"
                        options={operations.map(({ op, label }) => ({ value: op, label }))}
                        onChange={handleOperationChange}
                        value={selectedOperation}
                        style={{maxWidth: "200px"}}
                        />
                        </span>
                    )}
                    {selectedOperation && selectedType === "Text" && (
                        <Input
                        placeholder="Enter value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        style={{maxWidth: "200px"}}
                        />
                    )}
                    {selectedOperation && selectedType === "Number" && (
                        <Input
                        type="number"
                        placeholder="Enter value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        style={{maxWidth: "200px"}}
                        />
                    )}
                    {selectedOperation && selectedType === "Date" && selectedOperation !== "in range" && (
                        <DatePicker
                        value={value}
                        onChange={(date) => setValue(date)}
                        style={{maxWidth: "200px"}}
                        />
                    )}
                    {selectedOperation === "in range" && selectedType === "Date" && (
                        <RangePicker
                        onChange={(dates) => setValue(dates)}
                        style={{maxWidth: "200px"}}
                        />
                    )}
                    {value && <Button type="primary" onClick={addFilter} style={{marginLeft : "5px"}}>+</Button>}
                    <Button type="primary" onClick={() => handleFIlterCancellation(false)} style={{marginLeft : "5px"}}>X</Button>
                </div>
            )}
            </div>
        </div>
        <div className="div2">
            <span style={{float: "right", display: "flex"}}>
                <input type="text" placeholder="Search" style={{padding: "5px", borderRadius: "5px", border: "1px solid #ccc"}}/>
                <Button><Search size={16} color="grey" strokeWidth={1.5}/></Button>
                <Button style = {{marginLeft: "20px"}}><ReloadOutlined/></Button>
            </span>
        </div>
        <div className="div3">
            {filters.map((filter, index) => (
            <span style={{ gap: "10px", marginTop: "5px", float: "left", border: "1px solid #ccc", borderRadius: "5px", padding: "5px", marginRight: "5px"}}
                key={index}
            >
                <span>{`${filter.key} ${filter.operation} ${JSON.stringify(filter.value)}`}</span>
                <span style={{marginLeft: "5px"}}>
                <Button icon={<EditOutlined />} onClick={() => editFilter(index)} size="small" />
                <Button icon={<DeleteOutlined />} onClick={() => deleteFilter(index)} size="small" danger style={{marginLeft: "5px"}}/>
                </span>
                
            </span>
            ))}
        </div>
    </div>
  );
};

export default FilterComponent;
