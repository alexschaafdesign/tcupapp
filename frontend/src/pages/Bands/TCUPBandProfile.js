import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Modal, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useAuth0 } from "@auth0/auth0-react";
import formatBandData from "../../utils/formatBandData";
import AppBreadcrumbs from "../../components/Breadcrumbs";
import ProfilePhotoCard from "../../components/bands/ProfilePhotoCard";
import ShowsTableCore from "../Shows/ShowsTableCore";
import BandClaim from "../../components/bands/BandClaim";

const TCUPBandProfile = ({ allShows = [] }) => {
  const { bandid } = useParams();
  const { bandSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();  
  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch band data and check ownership on mount
  useEffect(() => {
    const fetchBandAndOwnership = async () => {
      try {
        // Fetch band data
        const bandResponse = await fetch(`${apiUrl}/bands/${bandSlug}`);
        if (!bandResponse.ok) throw new Error("Failed to fetch band data");
        const bandData = await bandResponse.json();
        const formattedBand = formatBandData(bandData.data);
        setBand(formattedBand);

        // Check ownership if authenticated
        if (isAuthenticated) {
          const ownershipResponse = await fetch(`${apiUrl}/bands/${bandSlug}/check-ownership`, {
            headers: {
              Authorization: `Bearer ${await getAccessTokenSilently()}`
            }
          });
          if (ownershipResponse.ok) {
            const ownershipData = await ownershipResponse.json();
            setIsOwner(ownershipData.isOwner);
          }
        }
      } catch (err) {
        console.error("Error fetching band:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBandAndOwnership();
  }, [bandSlug, apiUrl, isAuthenticated]);

  // Fetch shows for this band
  const [bandShows, setBandShows] = useState([]);

  useEffect(() => {
    const fetchBandShows = async () => {
      try {
        const response = await fetch(`${apiUrl}/bands/${bandSlug}/shows`);
        if (!response.ok) throw new Error("Failed to fetch shows");
        const data = await response.json();
        setBandShows(data);
      } catch (err) {
        console.error("Error fetching shows:", err);
        setError(err.message);
      }
    };

    if (bandSlug) {
      fetchBandShows();
    }
  }, [bandSlug, apiUrl]);

  // Handle claim status change
  const handleClaimStatusChange = (newOwnerStatus) => {
    setIsOwner(newOwnerStatus);
  };

  // Conditional rendering for loading, errors, and missing band data
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!band) return <Typography>Band not found</Typography>;

  // Spotify Embed URL Conversion
  const spotifyEmbedUrl = band?.music_links?.spotify
    ? band.music_links.spotify.includes("/embed/")
      ? band.music_links.spotify
      : band.music_links.spotify.replace(
          /open\.spotify\.com\/(track|album|playlist|artist)\//,
          "open.spotify.com/embed/$1/"
        )
    : null;

  // Convert filtered links back into an object
  const validSocialLinks = Object.fromEntries(
    Object.entries(band.social_links || {}).filter(
      ([_, link]) => typeof link === "string" && link.trim() !== ""
    )
  );

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`;
    return url;
  };

  // Handle modal image
  const handleOpen = (image) => {
    if (image) {
      setSelectedImage(image);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  // Navigate to edit page
  const handleEdit = () => {
    if (band) {
      navigate(`/bands/${bandSlug}/edit`, { state: { band } });
    }
  };

  // Band profile image handling
  const profileImageUrl = band.profile_image || "";
  const otherImages = Array.isArray(band.other_images) ? band.other_images : [];

  return (
    <Box sx={{ paddingLeft: 0, paddingRight: 0, paddingTop: 1, paddingBottom: 4 }}>
      {/* Top bar with breadcrumbs, claim button, and edit button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <AppBreadcrumbs />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <BandClaim 
            bandSlug={bandSlug}
            onClaimStatusChange={handleClaimStatusChange}
          />
          
          {isOwner && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleEdit}
              sx={{ textTransform: "none" }}
            >
              Edit Band
            </Button>
          )}
        </Box>
      </Box>

      {/* Rest of your existing JSX code remains the same */}
      <Grid
        container
        spacing={3}
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left Column */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <ProfilePhotoCard
            name={band.name}
            bandId={band.id}
            imageUrl={profileImageUrl}
            location={band.location || ""}
            genre={band.genre}
            socialLinks={validSocialLinks}
            play_shows={band.play_shows}
          />

          {/* Bio */}
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="body" sx={{ whiteSpace: 'pre-wrap' }}>
              {band.bio || "No bio"}
            </Typography>
          </Box>

          {/* Links */}
          <Box sx={{ marginTop: 4 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 2 }}>
              <Box sx={{ flex: 1, minWidth: '45%' }}>
                <Typography>
                  <a
                    href="https://drive.google.com/file/d/1mDjatch2BQOje0g0sV5YzYhChjN5Oei8/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#8E6CD1',
                      textDecoration: 'none',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Stage Plot (pdf)
                  </a>
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: '45%' }}></Box>
            </Box>
            
            <Grid item xs={12} md={8}>
              {/* Other Images */}
              <Box>
                {Array.isArray(otherImages) && otherImages.length > 0 ? (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems="center"
                    justifyContent="flex-start"
                  >
                    {otherImages.map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={image || "/default-placeholder.jpg"}
                        alt={`Band Photo ${index + 1}`}
                        onClick={() => handleOpen(image)}
                        sx={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography>No additional images available.</Typography>
                )}
              </Box>
            </Grid>
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 4
          }}
        >
          {/* Spotify Embed */}
          {spotifyEmbedUrl && (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <iframe
                src={spotifyEmbedUrl}
                width="100%"
                height="600px"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                title="Spotify Player"
                style={{
                  borderRadius: "8px",
                  border: "none",
                }}
              />
            </Box>
          )}

          {/* YouTube Music Embed */}
          {band.music_links?.youtube && (
            <Box sx={{ position: "relative", overflow: "hidden", paddingTop: "56.25%" }}>
              <iframe
                src={getYouTubeEmbedUrl(band.music_links.youtube)}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              />
            </Box>
          )}
        </Grid>

        {/* Bottom show section */}
        <Box sx={{ marginTop: 4, width: '100%' }}>
          {bandShows.length > 0 ? (
            <ShowsTableCore data={bandShows} onShowClick={(id) => console.log("Show clicked:", id)} />
          ) : (
            <Typography>No upcoming shows for this band.</Typography>
          )}
        </Box>
      </Grid>

      {/* Image Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "transparent",
            boxShadow: "none",
          }}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Expanded Image"
              style={{
                maxWidth: "calc(100vw - 32px)",
                maxHeight: "calc(100vh - 32px)",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default TCUPBandProfile;