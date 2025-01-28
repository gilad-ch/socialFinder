import React from "react";
import { DashboardContext } from "../../contexts/DashboardContext";
import { useState, useEffect, useContext } from "react";
import { UserCheck, Bookmark, ScanEye, FileSearch2 } from "lucide-react";
import "../../css/Sidebar.css";
import MultiSelect from "../general/MultiSelect";
import SingleSelect from "../general/SingleSelect";
import { fetchKeywords, fetchUsers } from "../../services/twitterApi";

function Sidebar() {
  const { currentStatus, setCurrentStatus, filters, updateFilter } =
    useContext(DashboardContext);
  const [keywordList, setKeywordList] = useState([]);
  const [Users, setUsers] = useState();

  const handleUserSelected = (selectedUsername) => {
    updateFilter("username", selectedUsername);
  };
  const handleKeywordSelected = (selectedKeywords) => {
    updateFilter("keywords", selectedKeywords);
  };

  // Fetch keywords on component mount
  useEffect(() => {
    fetchKeywords()
      .then((keywords) => {
        const keywordList = keywords.map((kw_obj) => kw_obj.keyword);
        setKeywordList(keywordList);
      })
      .catch((error) => console.error("Error fetching keywords:", error));
  }, []);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
      .then((users) => {
        const usersList = users.map((user_obj) => user_obj.username);
        setUsers(usersList);
      })
      .catch((error) => console.error("Error fetching keywords:", error));
  }, []);
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
          <h2>Dashboard</h2>
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
        <div className="filters-section">
          {currentStatus !== 0 && (
            <MultiSelect
              options={keywordList}
              selectedOptions={filters.keywords}
              placeholder="Keywords Filters"
              onChange={handleKeywordSelected}
            />
          )}
          <SingleSelect
            options={Users}
            selectedOptions={null}
            placeholder="Users Filters"
            onChange={handleUserSelected}
          />
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;
