import { createContext, useState } from "react";

const DashboardContext = createContext();

function DashboardProvider({ children }) {
  const [currentStatus, setCurrentStatus] = useState(0);

  return (
    <DashboardContext.Provider value={{ currentStatus, setCurrentStatus }}>
      {children}
    </DashboardContext.Provider>
  );
}

export { DashboardContext, DashboardProvider };
