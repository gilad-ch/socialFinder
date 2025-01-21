import React from "react";
import { useContext } from "react";
import { PlatformContext } from "../contexts/PlatformContext";
function PlatformInProgress() {
  const { selectedPlatform } = useContext(PlatformContext);
  return (
    <div className="in-working-message">
      <h3>{selectedPlatform} integration is in progress</h3>
      <p>Please check back soon!</p>
    </div>
  );
}

export default PlatformInProgress;
