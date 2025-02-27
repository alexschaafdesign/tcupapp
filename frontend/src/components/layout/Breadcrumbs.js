import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { Box, Typography } from "@mui/material";
import useApi from "../../hooks/useApi";

const routeNames = {
  thread: "Chat", // Map "thread" to "Chat"
  chat: "Chat",
  shows: "Show List",
  powerpledge: "TCUP Power Pledge",
  sessionmusicians: "Session Musician Database",
  venues: "Venuepedia"
};

const truncateText = (text, maxLength = 30) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

const Breadcrumbs = () => {
  const location = useLocation();
  const { threadId } = useParams(); // Ensure this matches `App.js`
  const [threadTitle, setThreadTitle] = useState(null);
  const { callApi } = useApi();

  const pathnames = location.pathname.split("/").filter((x) => x);

  console.log("Breadcrumbs pathnames:", pathnames);
  console.log("Thread Id from useParams():", threadId);

  useEffect(() => {
    if (threadId) {
      console.log("Fetching thread title for Id:", threadId);
      callApi(`${process.env.REACT_APP_API_URL}/posts/${threadId}`)
              .then((data) => {
          console.log("API response:", data);
          if (data?.post?.title) {
            setThreadTitle(data.post.title);
          } else {
            console.warn("Thread title not found in API response.");
          }
        })
        .catch((err) => console.error("Failed to fetch thread title:", err));
    }
  }, [threadId, callApi]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0, ml: 3 }}>
      <Typography
        variant="body2"
        component={Link}
        to="/"
        sx={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}
      >
        Home
      </Typography>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        let displayName = routeNames[value] || decodeURIComponent(value);
        if (threadId && value === threadId && threadTitle) {
          displayName = threadTitle;
        }

        // Apply character limit
        displayName = truncateText(displayName);

        console.log(`Breadcrumb segment: ${value}, Display Name: ${displayName}`);

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