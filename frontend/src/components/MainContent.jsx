import React from "react";
import { useContext } from "react";
import { DashboardContext } from "../contexts/DashboardContext";
import { PlatformContext } from "../contexts/PlatformContext";
import TwitterFeed from "./Twitter/TwitterFeed";
import PlatformInProgress from "./PlatformInProgress";
import "../css/MainContent.css";

function MainContent() {
  const { selectedPlatform } = useContext(PlatformContext);
  const renderContent = () => {
    if (selectedPlatform === "Twitter") {
      return <TwitterFeed />;
    } else {
      return <PlatformInProgress />;
    }
  };

  return (
    <main className="main-content" id="main-content">
      {renderContent()}
    </main>
  );
}

export default MainContent;
