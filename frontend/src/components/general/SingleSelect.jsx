import React, { useState, useEffect, useRef } from "react";
import "../../css/general/SingleSelect.css";

function SingleSelect({
  options = [],
  selectedOption = "",
  placeholder = "Select an option...",
  onChange = () => {},
}) {
  const [internalSelectedOption, setInternalSelectedOption] =
    useState(selectedOption);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef();
  const inputRef = useRef(); // Ref for the input element

  // Synchronize internal state with selectedOption prop
  useEffect(() => {
    setInternalSelectedOption(selectedOption);
  }, [selectedOption]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectOption = (option) => {
    setInternalSelectedOption(option);
    onChange(option);
    setIsOpen(false); // Close the dropdown after selecting an option
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
        {internalSelectedOption && (
          <button
            className="reset-icon"
            size={16}
            onClick={(e) => {
              e.stopPropagation();
              selectOption(null);
            }}
          >
            x
          </button>
        )}
        <input
          ref={inputRef}
          className="search-input"
          placeholder={
            internalSelectedOption ? `${internalSelectedOption}` : placeholder
          }
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
                  internalSelectedOption === option ? "selected" : ""
                }`}
                onClick={() => selectOption(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SingleSelect;
