import React from "react";
import { ChevronDown } from "lucide-react";
import "../../css/general/selectMenu.css";

function SelectMenu({ options, selectedOption, setSelectedOption }) {
  return (
    <div className="platform-dropdown">
      <button className="dropdown-button">
        {React.createElement(
          options.find((p) => p.name === selectedOption).icon,
          { size: 18 }
        )}
        <span>{selectedOption}</span>
        <ChevronDown size={18} />
      </button>
      <div className="dropdown-content">
        {options.map((option) => (
          <button
            key={option.name}
            className="dropdown-item"
            onClick={() => setSelectedOption(option.name)}
          >
            {React.createElement(option.icon, { size: 18 })}
            <span>{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectMenu;
