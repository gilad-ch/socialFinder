import React, { useState, useEffect, useRef } from "react";
import "../../css/general/MultiSelect.css";

function MultiSelect({
  options = [],
  selectedOptions = [],
  placeholder = "Select options...",
  onChange = () => {},
}) {
  const [internalSelectedOptions, setInternalSelectedOptions] =
    useState(selectedOptions);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef();
  const inputRef = useRef(); // Ref for the input element

  // Synchronize internal state with selectedOptions prop
  useEffect(() => {
    setInternalSelectedOptions(selectedOptions);
  }, [selectedOptions]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    const updatedSelection = internalSelectedOptions.includes(option)
      ? internalSelectedOptions.filter((item) => item !== option)
      : [...internalSelectedOptions, option];
    setInternalSelectedOptions(updatedSelection);
    onChange(updatedSelection);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleHeaderClick = () => {
    setIsOpen((prev) => !prev);
    inputRef.current?.focus();
  };

  return (
    <div ref={dropdownRef} className="multiselect-container">
      <div
        className="multiselect-header"
        onClick={(e) => {
          e.stopPropagation();
          handleHeaderClick();
        }}
        style={
          isOpen
            ? {
                borderBottomLeftRadius: "0px",
                borderBottomRightRadius: "0px",
              }
            : {}
        }
      >
        <input
          ref={inputRef}
          className="search-input"
          placeholder={placeholder}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className={`arrow ${isOpen ? "up" : "down"}`}></span>
      </div>

      {isOpen && (
        <div
          className="multiselect-dropdown"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="options-list">
            {filteredOptions.map((option) => (
              <li
                key={option}
                className={`option ${
                  internalSelectedOptions.includes(option) ? "selected" : ""
                }`}
                onClick={() => toggleOption(option)}
              >
                <input
                  type="checkbox"
                  checked={internalSelectedOptions.includes(option)}
                  readOnly
                />
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
