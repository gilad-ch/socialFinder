import { PlatformProvider } from "./contexts/PlatformContext";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import DashBoard from "./pages/DashBoard";
import AdminPanel from "./pages/AdminPanel";
import "./css/App.css";

function App() {
  return (
    <PlatformProvider>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<DashBoard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </PlatformProvider>
  );
}

export default App;
