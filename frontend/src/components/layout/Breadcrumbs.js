import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import useApi from "../../hooks/useApi";
import palette from "../../styles/colors/palette";

const routeNames = {
  thread: "Chat",
  chat: "Chat",
  shows: "Show List",
  powerpledge: "TCUP Power Pledge",
  sessionmusicians: "Session Musician Database",
  venues: "Venuepedia",
  profile: "User Profile",
  about: "TCUP"
};

const truncateText = (text, maxLength = 30) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

const Breadcrumbs = () => {
  const location = useLocation();
  const { threadId } = useParams();
  const [threadTitle, setThreadTitle] = useState(null);
  const { callApi } = useApi();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Always call hooks at the top level, before any conditionals
  useEffect(() => {
    if (threadId) {
      callApi(`${process.env.REACT_APP_API_URL}/posts/thread/${threadId}`)
        .then((data) => {
          if (data?.post?.title) {
            setThreadTitle(data.post.title);
          }
        })
        .catch((err) => console.error("Failed to fetch thread title:", err));
    }
  }, [threadId, callApi]);

  // Don't render breadcrumbs on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0, ml: 3 }}>
      <Typography
        variant="body2"
        component={Link}
        to="/"
        sx={{ color: palette.text.inverse, textDecoration: "none" }}
      >
        Home
      </Typography>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        let displayName = routeNames[value] || decodeURIComponent(value);
        
        // For thread pages, just use "Thread" instead of the full title
        if (threadId && value === threadId) {
          displayName = "Thread";
        }

        // Apply character limit
        displayName = truncateText(displayName);

        return (
          <Typography
            key={to}
            variant="body2"
            component={isLast ? "span" : Link}
            to={to}
            sx={{
              color: isLast ? "white" : "rgba(255, 255, 255, 0.7)",
              textDecoration: "none",
              fontWeight: isLast ? "bold" : "normal",
              "&:before": { content: '" > "', mx: 1, color: "rgba(255, 255, 255, 0.5)" },
            }}
          >
            {displayName}
          </Typography>
        );
      })}
    </Box>
  );
};

export default Breadcrumbs;