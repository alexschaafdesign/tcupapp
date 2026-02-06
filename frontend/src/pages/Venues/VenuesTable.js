import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Alert,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";

const VenuesTable = () => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch(`${apiUrl}/venues`);
        if (!response.ok) {
          throw new Error("Failed to fetch venues");
        }
        const data = await response.json();
        console.log("Fetched Venues:", data);
        setVenues(data.data || []);
        setFilteredVenues(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const applyFilters = () => {
    let filtered = venues;

    if (searchQuery) {
      filtered = filtered.filter((venue) =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVenues(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery]);

  const handleAddVenue = () => {
    navigate("/venues/add");
  };

  const handleEdit = (e, venueId) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/venues/edit/${venueId}`);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ padding: 0 }}>
      {/* Add Venue Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2, mt:4 }}>
        <Button variant="contained" color="primary" onClick={handleAddVenue}>
          Add Venue
        </Button>
      </Box>

      {/* Search Field */}
      <TextField
        label="Search Venue Name"
        value={searchQuery}
        onChange={handleSearch}
        variant="outlined"
        fullWidth
        sx={{ marginBottom: 2 }}
      />

      {/* Venues Table */}
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Venue Name</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Capacity</strong></TableCell>
              <TableCell><strong>Cover Image</strong></TableCell>
              <TableCell align="right" sx={{ pr: 3 }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(filteredVenues) && filteredVenues.length > 0 ? (
              filteredVenues.map((venue) => (
                <TableRow
                  key={venue.id}
                  onClick={() => navigate(`/venues/${venue.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{venue.venue}</TableCell>
                  <TableCell>{venue.location || "No Location"}</TableCell>
                  <TableCell>{venue.capacity || "N/A"}</TableCell>
                  <TableCell>
                    {venue.cover_image ? (
                      <img
                        src={venue.cover_image}
                        alt={`${venue.name} cover`}
                        style={{ width: 50, height: 50 }}
                        onError={(e) => {
                          console.error(`Error loading image for ${venue.name}`);
                          e.target.alt = 'No Image';
                        }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      pr: 3,
                      display: { xs: 'none', sm: 'table-cell' }
                    }}
                  >
                    <Tooltip title="Edit Venue">
                      <IconButton 
                        onClick={(e) => handleEdit(e, venue.id)}
                        sx={{
                          color: 'action.active',
                          '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
                  No Venues Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default VenuesTable;