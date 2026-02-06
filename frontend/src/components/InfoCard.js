import React from "react";
import { Paper, Typography, Box } from "@mui/material";

const InfoPaper = ({ label, value }) => {
  return (
    <Paper
      sx={{
        display: "inline-block", // Ensure the card hugs its content
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // Align label and value to the left
          gap: 1, // Add space between label and value
        }}
      >
        {/* Label */}
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ fontWeight: "bold", textTransform: "uppercase" }}
        >
          {label}
        </Typography>
        {/* Value */}
        <Typography variant="body1">{value || "Not Available"}</Typography>
      </Box>
    </Paper>
  );
};

export default InfoPaper;