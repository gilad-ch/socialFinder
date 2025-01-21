import { Link, useLocation } from "react-router-dom";
import React from "react";
import { useContext } from "react";
import { PlatformContext } from "../contexts/PlatformContext";
import { Twitter, Send, Instagram, ChevronDown, Ship } from "lucide-react";
import { useState } from "react";
import SelectMenu from "./general/selectMenu"; // If the file is named selectMenu.jsx
import "../css/Header.css";

function Header() {
  const { selectedPlatform, setSelectedPlatform } = useContext(PlatformContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const platforms = [
    { name: "Twitter", icon: Twitter },
    { name: "Telegram", icon: Send },
    { name: "Instagram", icon: Instagram },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <div className="app-title">
        <Ship size={24} className="app-icon" />
        <span className="title-text">Columbus</span>
      </div>
      <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          to="/admin"
          className={`nav-link ${
            location.pathname === "/admin" ? "active" : ""
          }`}
        >
          Admin Panel
        </Link>
      </nav>
      <SelectMenu
        options={platforms}
        selectedOption={selectedPlatform}
        setSelectedOption={setSelectedPlatform}
      />
    </header>
  );
}

export default Header;
