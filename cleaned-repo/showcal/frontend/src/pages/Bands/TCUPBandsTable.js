import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import formatBandData from "../../utils/formatBandData";
import BandSocialLinks from "../../components/bands/BandSocialLinks";
import ProfileImage from "../../components/ProfileImage";

const TCUPBandsTable = () => {
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
    <Box sx={{ padding: 0 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <Box sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "left", gap: 2, marginBottom: 2 }}>
          <Button variant="contained" color="primary" onClick={() => navigate("/bands/add")}>
            Add your band
          </Button>
        </Box>
        <TextField
          label="Search Band Name"
          value={searchQuery}
          onChange={handleSearch}
          variant="outlined"
          fullWidth
          sx={{ marginBottom: 2 }}
        />
        <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
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
        <Paper elevation={3}>
          
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Band Name</strong>
                </TableCell>
                <TableCell>
                </TableCell>
                <TableCell>
                  <strong>Social Links</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBands.map((band) => {
                console.log("Band data:", band); // Add this log
                return (
                  <TableRow
                    key={band.id}
                    onClick={() => navigate(`/bands/${band.slug}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>{band.name || "Unnamed Band"}</TableCell>
                    <TableCell>
                      {band.profile_image ? (
                        <ProfileImage
                          src={`${band.profile_image.replace("/upload/", "/upload/w_50,h_50,c_fill/")}`}
                          alt={`${band.name || "Band"} Thumbnail`}
                          shape="rectangle"
                          size={50}
                        />
                      ) : (
                        "No Image"
                      )}
                    </TableCell>
                    <TableCell>
                      <BandSocialLinks links={band.social_links || []} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
};

export default TCUPBandsTable;