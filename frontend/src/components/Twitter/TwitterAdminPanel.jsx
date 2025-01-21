import React, { useState } from "react";
import "../../css/Twitter/TwitterAdminPanel.css";
import UsersTable from "./AdminPanel_Tables/UsersTable";
import KeywordsTable from "./AdminPanel_Tables/KeywordsTable";
import { UserCog, FolderSearch } from "lucide-react";
import SelectMenu from "../general/selectMenu";

function TwitterAdminPanel() {
  const [activeTable, setActiveTable] = useState("Users");
  const options = [
    { name: "Users", icon: UserCog },
    { name: "Keywords", icon: FolderSearch },
  ];

  return (
    <div className="admin-panel">
      <div className="upper-section">
        <SelectMenu
          options={options}
          selectedOption={activeTable}
          setSelectedOption={setActiveTable}
        />
      </div>
      {activeTable === "Users" ? <UsersTable /> : <KeywordsTable />}
    </div>
  );
}

export default TwitterAdminPanel;
