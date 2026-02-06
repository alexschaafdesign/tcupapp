import React from "react";
import { Box, Grid, Card, CardContent, Typography, Icon } from "@mui/material";
import LatestPosts from "../components/Xenforo/LatestPosts";
import ForumThreads from "../components/Xenforo/ForumThreads";
import XenForoEmbed from "../../components/XenforoEmbed";
import XenforoTest from "../components/Xenforo/XenforoTest";
import AuthTest from "../components/Xenforo/AuthTest";
import TestSupabase from "../../components/TestSupabase";
import CalendarEvents from "../../components/CalendarEvents";


const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file

const Organize = () => {
  const cards = [
    {
      title: "Join TCUP as an official member!",
      description:
        "Here's why you should become a full member (and how to do it)",
      color: "#8E6CD1",
      icon: "table_chart", // Material-UI icon name
    },
    {
      title: "Venue Report Card",
      description:
        "We are working to increase transparency around venue-artist relationships. Fill out a Venue Report Card after you play a show to help us in our quest!",
      color: "#8E6CD1",
      icon: "table_chart", // Material-UI icon name
    },
    {
      title: "Join Our Campaign",
      description:
        "We're meeting Dec 14. Join us.",
      color: "#8B0000",
      icon: "menu_book", // Material-UI icon name
    },
    // Add more cards here
  ];

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h2" textAlign="center" gutterBottom>
        Welcome to TCUP
      </Typography>
      <TestSupabase />

      <Grid container spacing={4} justifyContent="center">
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                backgroundColor: card.color,
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: 3,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  {card.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Icon sx={{ fontSize: 48 }}>{card.icon}</Icon>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <XenforoTest />
      <AuthTest />
    </Box>
  );
};

export default Organize;