import { DashboardProvider } from "../contexts/DashboardContext";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

function DashBoard() {
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
