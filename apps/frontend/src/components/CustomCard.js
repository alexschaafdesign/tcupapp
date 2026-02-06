import React from "react";
import { Box, Card, CardContent, Typography, Icon, ButtonBase } from "@mui/material";

const CustomCard = ({ title, description, color, icon, link }) => {
  return (
    <ButtonBase
      component="a" // Makes the card act as a link
      href={link} // Link destination
      sx={{
        width: "100%",
        textAlign: "inherit",
        textDecoration: "none",
        display: "block",
        borderRadius: 2,
      }}
    >
      <Card
        sx={{
          height: "100%",
          backgroundColor: color,
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
            {title}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {description}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 2,
            }}
          >
            <Icon sx={{ fontSize: 48 }}>{icon}</Icon>
          </Box>
        </CardContent>
      </Card>
    </ButtonBase>
  );
};

export default CustomCard;