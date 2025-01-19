import { Link, useLocation } from "react-router-dom";
import React from "react";
import { Twitter, Send, Instagram, ChevronDown, Ship } from "lucide-react";
import { useState } from "react";
import "../css/Header.css";

function Header({ selectedPlatform, setSelectedPlatform }) {
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
      <div className="platform-dropdown">
        <button className="dropdown-button">
          {React.createElement(
            platforms.find((p) => p.name === selectedPlatform).icon,
            { size: 18 }
          )}
          <span>{selectedPlatform}</span>
          <ChevronDown size={18} />
        </button>
        <div className="dropdown-content">
          {platforms.map((platform) => (
            <button
              key={platform.name}
              className="dropdown-item"
              onClick={() => setSelectedPlatform(platform.name)}
            >
              {React.createElement(platform.icon, { size: 18 })}
              <span>{platform.name}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
