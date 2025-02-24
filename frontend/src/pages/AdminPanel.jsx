import React from "react";
import { useContext } from "react";
import { PlatformContext } from "../contexts/PlatformContext";
import TwitterAdminPanel from "../components/Twitter/TwitterAdminPanel";

function AdminPanel() {
  const { selectedPlatform } = useContext(PlatformContext);
  if (selectedPlatform === "Twitter") {
    return <TwitterAdminPanel />;
  }

  return (
    <div className="in-working-message">
      <h3>Admin panel for {selectedPlatform} is in progress</h3>
      <p>Please check back soon!</p>
    </div>
  );
}

export default AdminPanel;
