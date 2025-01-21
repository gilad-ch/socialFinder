import { createContext, useState } from "react";

const PlatformContext = createContext();

function PlatformProvider({ children }) {
  const [selectedPlatform, setSelectedPlatform] = useState("Twitter");

  return (
    <PlatformContext.Provider value={{ selectedPlatform, setSelectedPlatform }}>
      {children}
    </PlatformContext.Provider>
  );
}

export { PlatformContext, PlatformProvider };
