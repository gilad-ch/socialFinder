import React from "react";
import { X } from "lucide-react";
import { useContext } from "react";
import { DashboardContext } from "../../contexts/DashboardContext";
import "../../css/Twitter/filterChips.css";

function FilterChips() {
  const { filters, updateFilter } = useContext(DashboardContext);
  const handleRemoveChip = (chipToRemove) => {
    const updatedKeywords = filters.keywords.filter(
      (chip) => chip !== chipToRemove
    );
    updateFilter("keywords", updatedKeywords);
  };

  return (
    <div className="filters-container">
      {filters.keywords.map((chip, i) => (
        <div key={i} className="filter-chip">
          <span
            className="chip-value"
            title="Filter Chip"
            onClick={() => handleRemoveChip(chip)}
          >
            <X size={14} className="x-icon" />
            {chip}
          </span>
        </div>
      ))}
    </div>
  );
}

export default FilterChips;
