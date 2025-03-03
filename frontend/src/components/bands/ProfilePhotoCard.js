import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material"; // Import Star icons
import BandSocialLinks from "./BandSocialLinks";
import ProfileImage from "../ProfileImage";
import colorTokens from "../../styles/colors/palette";
import StatusBadge from "./StatusBadge";
import useApi from "../../hooks/useApi";

const ProfilePhotoCard = ({ name, imageUrl, location, genre, play_shows, bandId, socialLinks }) => {
  // Validate `imageUrl` and fallback to a default image if necessary
  const validImageUrl = imageUrl || "https://res.cloudinary.com/dsll3ms2c/image/upload/v1735668160/generic_profile_image_3x_pdqol9.png"; // Replace with an actual default image path

  // Validate `genre` and join it safely
  const genreText = Array.isArray(genre) && genre.length > 0 ? genre.join(" • ") : "GENRE • GENRE • GENRE";

  const { callApi } = useApi(); // Initialize the custom API hook

    // State for handling favorite status and loading

  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file

  // Add useEffect to check if band is already favorited on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!bandId) return;
  
      try {
        console.log('Checking favorite status for bandId:', bandId);
        const favorites = await callApi(`${apiUrl}/favorites`);
        console.log('Received favorites:', favorites);
  
        const isFavorited = favorites.some(fav => 
          Number(fav.band_id) === Number(bandId)
        );
        
        console.log('Setting isFavorite to:', isFavorited);
        setIsFavorite(isFavorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
  
    checkFavoriteStatus();
  }, [bandId, callApi, apiUrl]);
  
  const handleFavoriteToggle = async () => {
    if (!bandId) return;
    
    setIsLoading(true);
    try {
      if (isFavorite) {
        await callApi(`${apiUrl}/favorites/${bandId}`, {
          method: 'DELETE'
        });
        setIsFavorite(false);
      } else {
        await callApi(`${apiUrl}/favorites`, {
          method: 'POST',
          body: JSON.stringify({ band_id: Number(bandId) })
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 3,
        boxShadow: 1,
        borderRadius: 2,
        backgroundColor: "background.paper",
        gap: 2,
        position: "relative"
      }}
    >
      {/* Top Row: Band Name */}
      <Typography
        variant="h3"
        sx={{
          textTransform: "uppercase",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {name || "Unknown Band"}
      </Typography>

      {/* Bottom Section: Two Columns */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
        }}
      >
        {/* Left Column: Profile Image */}
        <Box>
          <ProfileImage
            src={validImageUrl}
            alt={`${name || "Band"}'s Profile`}
            shape="circle"
            size={200}
          />
        </Box>

        {/* Right Column: Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {location || ""}
          </Typography>

          {genreText && (
            <Typography
              variant="body2"
              sx={{
                textTransform: "uppercase",
                color: colorTokens.text.secondary,
              }}
            >
              {genreText}
            </Typography>
          )}

          <StatusBadge playShows={play_shows} />

          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <BandSocialLinks links={socialLinks} />
          )}

          {/* Circular Icon Button for Favorite */}
          <IconButton
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: isFavorite ? "#FFD700" : "rgba(0, 0, 0, 0.1)", // Gold when favorited, light background when not
              color: isFavorite ? "#000000" : "#666666", // Dark icon when favorited, grey when not
              "&:hover": {
                backgroundColor: isFavorite ? "#DAA520" : "rgba(0, 0, 0, 0.2)", // Darker gold when favorited, darker background when not
              },
              transition: "all 0.2s ease-in-out", // Smooth transition for color changes
            }}
          >
            {isFavorite ? (
              <Star sx={{ fontSize: 32 }} /> // Filled star for favorites
            ) : (
              <StarBorder sx={{ fontSize: 32 }} /> // Outline star for non-favorites
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePhotoCard;