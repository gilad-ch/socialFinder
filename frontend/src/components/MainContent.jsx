import React from "react";
import TwitterFeed from "./Twitter/TwitterFeed";
import PlatformInProgress from "./PlatformInProgress";
import "../css/MainContent.css";

function MainContent({ selectedPlatform, currentStatus }) {
  const renderContent = () => {
    if (selectedPlatform === "Twitter") {
      return <TwitterFeed currentStatus={currentStatus} />;
    } else {
      return <PlatformInProgress platform={selectedPlatform} />;
    }
  };

  return (
    <main className="main-content" id="main-content">
      {renderContent()}
    </main>
  );
}

export default MainContent;
