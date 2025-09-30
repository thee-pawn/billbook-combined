import React, { useState } from "react";

const InputWithDropdown = ({ options, selectedValue, setSelectedValue, setOptions }) => {
  const [inputValue, setInputValue] = useState(selectedValue || "");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelectOption = (option) => {
    setSelectedValue(option); // Update parent state
    setInputValue(option); // Update local input value
    setShowDropdown(false);
  };

  const handleAddNewOption = () => {
    if (inputValue.trim() !== "" && !options.includes(inputValue)) {
      const updatedOptions = [...options, inputValue];
      setOptions(updatedOptions); // Update parent options
      setSelectedValue(inputValue); // Select new option
    }
    setShowDropdown(false);
  };

  return (
    <div style={{ position: "relative", width: "150px", }}>
      {/* Input Box */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Select or type..."
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "16px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      {/* Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: 0,
            width: "100%",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            zIndex: 10,
          }}
        >
          {/* Filtered Options */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <div
                key={index}
                onClick={() => handleSelectOption(opt)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div style={{ padding: "8px", color: "#777" }}>No matches found</div>
          )}

          {/* Add New Option (Always Visible) */}
          <div
            onClick={handleAddNewOption}
            style={{
              padding: "8px",
              cursor: "pointer",
              textAlign: "center",
              background: "#007bff",
              color: "white",
              borderRadius: "0 0 4px 4px",
            }}
          >
            + Add "{inputValue}"
          </div>
        </div>
      )}
    </div>
  );
};

export default InputWithDropdown;
