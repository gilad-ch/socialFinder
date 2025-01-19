import React from "react";
import TwitterAdminPanel from "../components/Twitter/TwitterAdminPanel";
import { Twitter } from "lucide-react";
import "../css/Twitter/TwitterAdminPanel.css";

function AdminPanel({ selectedPlatform }) {
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
