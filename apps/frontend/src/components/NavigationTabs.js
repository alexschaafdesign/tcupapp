import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the active tab based on the current route
  const getActiveTab = () => {
    if (location.pathname.startsWith("/organize")) return 0;
    if (location.pathname.startsWith("/shows")) return 1;
    if (location.pathname.startsWith("/venues")) return 2;
    if (location.pathname.startsWith("/bands")) return 3;
    if (location.pathname.startsWith("/people")) return 4;

    return false; // No tab selected
  };

  const handleTabChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate("/organize")
        break;
      case 1:
        navigate("/shows");
        break;
      case 2:
        navigate("/venues");
        break;
      case 3:
        navigate("/bands");
        break;
      case 4:
        navigate("/people");
        break;
      default:
        break;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center", // Center align tabs horizontally
        alignItems: "center",
        padding: "0px 16px", // Adjust padding as needed
        margin: 0,
      }}
    >
      <Tabs
        value={getActiveTab()}
        onChange={handleTabChange}
        centered
      >
        <Tab
          label="Organize"
        />
        <Tab
          label="Shows"
        />
        <Tab
          label="Venues"
        />
        <Tab
          label="Bands"
        />
        <Tab  
          label="People"
        />
      </Tabs>
    </Box>
  );
};

export default NavigationTabs;