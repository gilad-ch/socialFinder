import { useState } from "react";
import { DashboardProvider } from "../contexts/DashboardContext";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

function DashBoard() {
  const [currentStatus, setStatus] = useState(0);
  return (
    <DashboardProvider>
      <div className="content-wrapper">
        <Sidebar />
        <MainContent />
      </div>
    </DashboardProvider>
  );
}

export default DashBoard;
