import { createContext, useState } from "react";

const DashboardContext = createContext();

function DashboardProvider({ children }) {
  const [currentStatus, setCurrentStatus] = useState(0);
  const [filters, setFilters] = useState({
    keywords: [],
    userId: null,
  });

  const updateFilter = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  return (
    <DashboardContext.Provider
      value={{
        currentStatus,
        setCurrentStatus,
        filters,
        setFilters,
        updateFilter, // Helper to update individual filters
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export { DashboardContext, DashboardProvider };
