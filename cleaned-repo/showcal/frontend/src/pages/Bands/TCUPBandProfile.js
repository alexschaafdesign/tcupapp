
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Modal, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import formatBandData from "../../utils/formatBandData";
import AppBreadcrumbs from "../../components/Breadcrumbs";
import ProfilePhotoCard from "../../components/bands/ProfilePhotoCard";
import ShowsTableCore from "../Shows/ShowsTableCore";

const TCUPBandProfile = ({ allShows = [] }) => {
  const { bandid } = useParams();
  const { bandSlug } = useParams();
  const navigate = useNavigate();
  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file

  // Fetch band data on mount
  useEffect(() => {
    const fetchBand = async () => {
      try {
        const response = await fetch(`${apiUrl}/bands/${bandSlug}`);
        if (!response.ok) throw new Error("Failed to fetch band data");
        const data = await response.json();
        setBand(formatBandData(data.data));
      } catch (err) {
        console.error("Error fetching band:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBand();
  }, [bandSlug, apiUrl]);

  // Fetch shows for this band
  const [bandShows, setBandShows] = useState([]);

  useEffect(() => {
    const fetchBandShows = async () => {
      try {
        const response = await fetch(`${apiUrl}/bands/${bandSlug}/shows`);
        if (!response.ok) throw new Error("Failed to fetch shows");
        const data = await response.json();
        console.log("Fetched Band Shows:", data); // Debug log
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

  // Conditional rendering for loading, errors, and missing band data
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!band) return <Typography>Band not found</Typography>;

  // Spotify Embed URL Conversion
  const spotifyEmbedUrl = band?.music_links?.spotify
  ? band.music_links.spotify.includes("/embed/")
    ? band.music_links.spotify // Already an embed link
    : band.music_links.spotify.replace(
        /open\.spotify\.com\/(track|album|playlist|artist)\//,
        "open.spotify.com/embed/$1/"
      )
  : null;

  const getBandcampEmbedUrl = (url) => {
    // Matches typical album or track URLs
    const match = url.match(/https:\/\/([\w-]+)\.bandcamp\.com\/(album|track)\/([\w-]+)/);
    if (match) {
      const artist = match[1];
      const type = match[2];
      const slug = match[3];
      return `https://${artist}.bandcamp.com/${type}/${slug}`;
    }
    return null; // Invalid URL
  };

    // Convert filtered links back into an object
    const validSocialLinks = Object.fromEntries(
      Object.entries(band.social_links || {}).filter(
        ([_, link]) => typeof link === "string" && link.trim() !== ""
      )
    );

    // Debugging to confirm the structure
    console.log("Valid Social Links Object:", validSocialLinks);

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
  const profileImageUrl = band.profile_image || ""; // Fallback if no profile image
  const otherImages = Array.isArray(band.other_images) ? band.other_images : []; // Ensure it's an array

  console.log("ProfilePhotoCard Props:", {
    name: band.name,
    imageUrl: profileImageUrl,
    location: band.location || "",
    genre: band.genre,
    socialLinks: validSocialLinks,
  });

  console.log('play_shows value:', band.play_shows);


  

  return (

    // OVERALL BOX 

    <Box sx={{ paddingLeft: 0, paddingRight: 0, paddingTop: 1, paddingBottom: 4 }}>

    {/* Box holding the two columns */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3, // Add some margin below the row
          }}
        >

          {/* Breadcrumbs on the top left */}
          <AppBreadcrumbs />

          {/* Edit button on the top right */}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleEdit}
            sx={{
              textTransform: "none", // Optional: Disable uppercase if undesired
            }}
          >
            Edit your band
          </Button>
        </Box>
          
          {/* Main two-column container */}

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
            {/* Bio Header */}
            {/* Bio */}
            <Typography variant="body
            " sx={{ whiteSpace: 'pre-wrap' }}>
              {band.bio || "No bio"} {/* Fallback if location is missing */}
            </Typography>
            </Box>

             {/* Links */}
             <Box sx={{ marginTop: 4 }}>


            {/* Links Content - a two column sub-section */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 2 }}>
              {/* First sub-Column */}
              <Box sx={{ flex: 1, minWidth: '45%' }}>
              <Typography>
                <a
                  href="https://drive.google.com/file/d/1mDjatch2BQOje0g0sV5YzYhChjN5Oei8/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#8E6CD1',
                    textDecoration: 'none',
                    fontSize: '1.25rem', // Adjust the font size as needed
                    fontWeight: 'bold', // Makes the font bold
                  }}
                >
                  Stage Plot (pdf)
                </a>
              </Typography>
              </Box>

                {/* Second sub-Column */}
                <Box sx={{ flex: 1, minWidth: '45%' }}>
                  
                </Box>
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
                      src={image || "/default-placeholder.jpg"} // Fallback to a placeholder image
                      alt={`Band Photo ${index + 1}`}
                      onClick={() => {
                        if (handleOpen && typeof handleOpen === "function") {
                          handleOpen(image);
                        } else {
                          console.error("handleOpen is not a valid function");
                        }
                      }}
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

          {/* End of left main column */}

          {/* Right main Column */}
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
                flexGrow: 1, // Allow it to grow and take up available space
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
              ></iframe>
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


          {/* Bandcamp Embed
          {band?.music_links?.bandcamp && (
            <Box mt={2}>
              <iframe
                src={band.music_links.bandcamp}
                width="100%" // Adjust width as needed
                height="100px" // Keep the height consistent with the standard
                frameBorder="0"
                seamless
                style={{
                  border: "none",
                  borderRadius: "8px",
                }}
                title="Bandcamp Player"
              ></iframe>
            </Box>
          )} */}
        </Grid>

          {/* Bottom show section that spans full width*/}
          <Box sx={{ marginTop: 4 }}>
        {bandShows.length > 0 ? (
          <ShowsTableCore data={bandShows} onShowClick={(id) => console.log("Show clicked:", id)} />
        ) : (
          <Typography>No upcoming shows for this band.</Typography>
        )}
      </Box>
        
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