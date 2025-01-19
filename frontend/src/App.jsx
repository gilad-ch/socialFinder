import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import DashBoard from "./pages/DashBoard";
import AdminPanel from "./pages/AdminPanel";
import "./css/App.css";

function App() {
  const [selectedPlatform, setSelectedPlatform] = useState("Twitter");

  return (
    <div className="app">
      <Header
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
      />
      <Routes>
        <Route
          path="/"
          element={<DashBoard selectedPlatform={selectedPlatform} />}
        />
        <Route
          path="/admin"
          element={<AdminPanel selectedPlatform={selectedPlatform} />}
        />
      </Routes>
    </div>
  );
}

export default App;
