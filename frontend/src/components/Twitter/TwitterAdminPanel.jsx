import React, { useState } from "react";
import "../../css/Twitter/TwitterAdminPanel.css";
import UsersTable from "./AdminPanel_Tables/UsersTable";
import KeywordsTable from "./AdminPanel_Tables/KeywordsTable";

function TwitterAdminPanel() {
  const [activeTable, setActiveTable] = useState("users");

  return (
    <div className="admin-panel">
      <div className="upper-section">
        <select
          className="table-selector"
          value={activeTable}
          onChange={(e) => setActiveTable(e.target.value)}
        >
          <option className="table-selector-options" value="users">
            Users
          </option>
          <option className="table-selector-options" value="keywords">
            Keywords
          </option>
        </select>
      </div>
      {activeTable === "users" ? <UsersTable /> : <KeywordsTable />}
    </div>
  );
}

export default TwitterAdminPanel;
