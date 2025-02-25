import React from "react";
import { useContext } from "react";
import { PlatformContext } from "../contexts/PlatformContext";
import TwitterSidebar from "./Twitter/TwitterSidebar";

function MainContent() {
  const { selectedPlatform } = useContext(PlatformContext);
  const renderContent = () => {
    if (selectedPlatform === "Twitter") {
      return <TwitterSidebar />;
    } else {
      return "";
    }
  };

  return renderContent();
}

export default MainContent;
