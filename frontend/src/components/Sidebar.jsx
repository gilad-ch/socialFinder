import React from "react";
import { useContext } from "react";
import { DashboardContext } from "../contexts/DashboardContext";
import { useState } from "react";
import { UserCheck, Bookmark, ScanEye, FileSearch2 } from "lucide-react";
import "../css/Sidebar.css";

function Sidebar() {
  const { currentStatus, setCurrentStatus } = useContext(DashboardContext);
  const statuses = [
    {
      name: "Monitored Users",
      icon: UserCheck,
      color: "#2196F3",
      statusCode: 0,
    },
    {
      name: "Keyword Search",
      icon: FileSearch2,
      color: "#2196F3",
      statusCode: 2,
    },
    { name: "Saved Tweets", icon: Bookmark, color: "#ff5733", statusCode: 1 },
  ];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="sidebar-section">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? "✕" : "☰"}
      </button>
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Filters menu</h2>
        </div>
        <nav className="sidebar-nav">
          {statuses.map((status) => (
            <button
              key={status.statusCode}
              className={`status-button ${
                currentStatus === status.statusCode ? "active" : ""
              }`}
              onClick={() => setCurrentStatus(status.statusCode)}
              style={{ "--status-color": status.color }}
            >
              <status.icon size={24} />
              <span>{status.name}</span>
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;
