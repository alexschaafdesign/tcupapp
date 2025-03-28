import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Grid,
  IconButton,
  Paper,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Fade,
  Collapse,
  Alert,
  InputAdornment,
  Link
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AlbumIcon from '@mui/icons-material/Album';
import LinkIcon from '@mui/icons-material/Link';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import colorTokens from "../../../../styles/colors/palette";

// Styled components
const StepContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: colorTokens.primary.dark,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: colorTokens.primary.main,
    borderRadius: 2,
  }
}));

const ReleaseCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}));

const GenreChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: `${colorTokens.secondary.light}20`,
  borderColor: colorTokens.secondary.light,
  '& .MuiChip-label': {
    fontWeight: 500,
  }
}));

// Common genre suggestions
const genreSuggestions = [
  "Rock", "Indie", "Pop", "Electronic", "Hip Hop", "R&B", "Folk", "Metal", 
  "Jazz", "Classical", "Country", "Blues", "Punk", "Alternative", "Ambient"
];

const MusicReleases = ({ formData, updateFormData }) => {
  const [showGenreSuggestions, setShowGenreSuggestions] = useState(false);

  // Add a new release
  const handleAddRelease = () => {
    const updatedReleases = [
      ...formData.releases,
      { title: "", releaseDate: "", type: "", link: "" }
    ];
    updateFormData({ releases: updatedReleases });
  };

  // Remove a release
  const handleRemoveRelease = (index) => {
    const updatedReleases = formData.releases.filter((_, i) => i !== index);
    updateFormData({ releases: updatedReleases });
  };

  // Update a release's information
  const handleReleaseChange = (index, field, value) => {
    const updatedReleases = [...formData.releases];
    updatedReleases[index] = {
      ...updatedReleases[index],
      [field]: value
    };
    updateFormData({ releases: updatedReleases });
  };

  // Handle genre change
  const handleGenreChange = (index, value) => {
    const updatedGenres = [...formData.genre];
    updatedGenres[index] = value;
    updateFormData({ genre: updatedGenres });
    
    if (index === 0 && value.trim() !== "") {
      // Show genre suggestions when user starts typing in first genre field
      setShowGenreSuggestions(true);
    }
  };

  // Add a suggested genre
  const handleAddSuggestedGenre = (genre) => {
    // Find the first empty genre slot
    const emptyIndex = formData.genre.findIndex(g => !g.trim());
    
    if (emptyIndex !== -1) {
      const updatedGenres = [...formData.genre];
      updatedGenres[emptyIndex] = genre;
      updateFormData({ genre: updatedGenres });
    } else if (formData.genre.length < 3) {
      updateFormData({ genre: [...formData.genre, genre] });
    }
  };

  // Update music links
  const handleMusicLinkChange = (platform, value) => {
    updateFormData({
      music_links: {
        ...formData.music_links,
        [platform]: value
      }
    });
  };

  // Check if link is valid
  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return true; // Empty is fine
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <StepContainer>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Your Music & Releases
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Help fans discover your sound by sharing your genres and music. 
            Adding your releases creates a discography that showcases your work.
          </Alert>
          
          <SectionTitle variant="h6">Music Genre</SectionTitle>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[0, 1, 2].map((index) => (
              <Grid item xs={12} sm={4} key={index}>
                <TextField
                  label={`Genre ${index + 1}`}
                  value={formData.genre[index] || ""}
                  onChange={(e) => handleGenreChange(index, e.target.value)}
                  fullWidth
                  placeholder={index === 0 ? "Primary genre" : "Secondary genre"}
                  required={index === 0}
                  InputProps={{
                    startAdornment: <MusicNoteIcon color="secondary" sx={{ mr: 1, opacity: 0.7 }} />,
                  }}
                />
              </Grid>
            ))}
          </Grid>
          
          <Collapse in={showGenreSuggestions}>
            <Box sx={{ mb: 4, mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Popular genres:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {genreSuggestions
                  .filter(genre => !formData.genre.includes(genre))
                  .map((genre, index) => (
                    <GenreChip
                      key={index}
                      label={genre}
                      onClick={() => handleAddSuggestedGenre(genre)}
                      clickable
                    />
                  ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click a genre to add it to your profile. You can add up to 3 genres.
              </Typography>
            </Box>
          </Collapse>
          
          <Divider sx={{ my: 4 }} />
          
          <SectionTitle variant="h6">Releases & Discography</SectionTitle>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Add your albums, EPs, and singles with links to where fans can listen.
          </Typography>
          
          {formData.releases.map((release, index) => (
            <Fade in={true} key={index} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
              <ReleaseCard elevation={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Release Title"
                      value={release.title}
                      onChange={(e) => handleReleaseChange(index, "title", e.target.value)}
                      fullWidth
                      placeholder="e.g. 'Debut Album', 'Summer EP'"
                      InputProps={{
                        startAdornment: <AlbumIcon color="secondary" sx={{ mr: 1, opacity: 0.7 }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Release Date"
                      value={release.releaseDate}
                      onChange={(e) => handleReleaseChange(index, "releaseDate", e.target.value)}
                      fullWidth
                      placeholder="MM/YYYY or YYYY"
                      InputProps={{
                        startAdornment: <CalendarTodayIcon color="secondary" sx={{ mr: 1, opacity: 0.7 }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Release Type</InputLabel>
                      <Select
                        value={release.type}
                        onChange={(e) => handleReleaseChange(index, "type", e.target.value)}
                        label="Release Type"
                      >
                        <MenuItem value="album">Album</MenuItem>
                        <MenuItem value="ep">EP</MenuItem>
                        <MenuItem value="single">Single</MenuItem>
                        <MenuItem value="compilation">Compilation</MenuItem>
                        <MenuItem value="live">Live Album</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Link to Listen"
                      value={release.link}
                      onChange={(e) => handleReleaseChange(index, "link", e.target.value)}
                      fullWidth
                      placeholder="Spotify, Bandcamp, etc."
                      error={!isValidUrl(release.link)}
                      helperText={!isValidUrl(release.link) ? "Please enter a valid URL" : ""}
                      InputProps={{
                        startAdornment: <LinkIcon color="secondary" sx={{ mr: 1, opacity: 0.7 }} />,
                      }}
                    />
                  </Grid>
                </Grid>
                
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    color: colorTokens.error.main,
                    '&:hover': { backgroundColor: `${colorTokens.error.light}20` }
                  }}
                  onClick={() => handleRemoveRelease(index)}
                  aria-label="Remove release"
                >
                  <DeleteIcon />
                </IconButton>
              </ReleaseCard>
            </Fade>
          ))}
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddRelease}
            sx={{ mb: 4 }}
          >
            Add Another Release
          </Button>
          
          <Divider sx={{ my: 4 }} />
          
          <SectionTitle variant="h6">Music Platforms</SectionTitle>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Where can fans find your music online? Add links to your profiles.
          </Typography>
          
          <Grid container spacing={3}>
            {[
              { key: "spotify", label: "Spotify Artist Link", placeholder: "https://open.spotify.com/artist/..." },
              { key: "bandcamp", label: "Bandcamp Link", placeholder: "https://yourbandname.bandcamp.com" },
              { key: "soundcloud", label: "SoundCloud Link", placeholder: "https://soundcloud.com/yourbandname" },
              { key: "youtube", label: "YouTube Music Channel", placeholder: "https://youtube.com/c/yourbandname" }
            ].map((platform) => (
              <Grid item xs={12} sm={6} key={platform.key}>
                <TextField
                  label={platform.label}
                  value={formData.music_links[platform.key] || ""}
                  onChange={(e) => handleMusicLinkChange(platform.key, e.target.value)}
                  fullWidth
                  placeholder={platform.placeholder}
                  error={!isValidUrl(formData.music_links[platform.key])}
                  helperText={!isValidUrl(formData.music_links[platform.key]) ? "Please enter a valid URL" : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img 
                          src={`/icons/${platform.key}.svg`} 
                          alt={platform.key} 
                          style={{ width: 20, height: 20, opacity: 0.7 }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/icons/music-default.svg';
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            ))}
          </Grid>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Adding these links enables automatic embedding on your profile, so fans can listen without leaving the site!
          </Typography>
        </Box>
      </Fade>
    </StepContainer>
  );
};

MusicReleases.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired
};

export default MusicReleases;