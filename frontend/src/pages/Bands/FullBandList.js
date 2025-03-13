import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  InputAdornment,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import formatBandData from "../../utils/formatBandData";
import BandSocialLinks from "../../components/bands/BandSocialLinks";
import ProfileImage from "../../components/ProfileImage";

const BandCard = ({ band, onClick }) => (
  <Card 
    sx={{ 
      width: '100%',
      backgroundColor: 'background.paper',
      borderRadius: 2,
      overflow: 'hidden',
      transition: 'all 0.2s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        cursor: 'pointer'
      }
    }}
    onClick={onClick}
    elevation={0}
  >
    {/* Image/Icon Container */}
    <Box sx={{ 
      width: '100%',
      pt: '100%', // Makes it square
      position: 'relative',
      bgcolor: 'grey.50'
    }}>
      {band.profile_image ? (
        <Box
          component="img"
          src={band.profile_image.replace("/upload/", "/upload/c_scale,w_400/")}
          alt={band.name || "Band"}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MusicNoteIcon sx={{ fontSize: 48, color: 'grey.200' }} />
        </Box>
      )}
    </Box>

    {/* Band Name - Always shown at bottom */}
    <Box sx={{ 
      p: 2,
      textAlign: 'center',
      bgcolor: 'background.paper'
    }}>
      <Typography 
        variant="h6" 
        component="h3" 
        sx={{ 
          fontWeight: 400,
          fontSize: '1.25rem'
        }}
      >
        {band.name || "Unnamed Band"}
      </Typography>
    </Box>
  </Card>
);

const TCUPBandsGrid = () => {
  const [bands, setBands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [playShowsFilter, setPlayShowsFilter] = useState("");
  const [bandSizeFilter, setBandSizeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchBands = async () => {
      try {
        const response = await fetch(`${apiUrl}/bands`);
        if (!response.ok) throw new Error("Failed to fetch bands");
        const data = await response.json();
        const formattedBands = data.data.map(formatBandData);
        setBands(formattedBands);
      } catch (err) {
        console.error("Error fetching bands:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBands();

    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, apiUrl]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBands = bands.filter((band) => {
    const matchesSearch = !searchQuery || band.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !genreFilter || (Array.isArray(band.genre) && band.genre.includes(genreFilter));
    const matchesPlayShows =
      !playShowsFilter || (band.play_shows && band.play_shows.toLowerCase() === playShowsFilter.toLowerCase());
    const matchesBandSize = !bandSizeFilter || (Array.isArray(band.group_size) && band.group_size.includes(bandSizeFilter));
    return matchesSearch && matchesGenre && matchesPlayShows && matchesBandSize;
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Header Controls */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
          <Button variant="contained" color="primary" onClick={() => navigate("/bands/add")}>
            Add your band
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search band name..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Filter by Genre</InputLabel>
            <Select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
              <MenuItem value="">All Genres</MenuItem>
              {Array.from(new Set(bands.flatMap((band) => band.genre || []))).map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Looking to Play Shows?</InputLabel>
            <Select value={playShowsFilter} onChange={(e) => setPlayShowsFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="maybe">Maybe</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Filter by Band Size</InputLabel>
            <Select value={bandSizeFilter} onChange={(e) => setBandSizeFilter(e.target.value)}>
              <MenuItem value="">All Sizes</MenuItem>
              {Array.from(new Set(bands.flatMap((band) => band.group_size || []).filter(Boolean))).map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Bands Grid */}
      <Grid container spacing={3}>
        {filteredBands.length > 0 ? (
          filteredBands.map((band) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={band.id}>
              <BandCard
                band={band}
                onClick={() => navigate(`/bands/${band.slug}`)}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No Bands Found</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TCUPBandsGrid;