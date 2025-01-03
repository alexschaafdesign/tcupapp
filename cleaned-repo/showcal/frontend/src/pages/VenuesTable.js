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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const VenuesTable = () => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch(`${apiUrl}/venues`);
        if (!response.ok) {
          throw new Error("Failed to fetch venues");
        }
        const data = await response.json();
        console.log("Fetched Venues:", data); // Debugging
        setVenues(data.data || []); // Ensure data.data is used
        setFilteredVenues(data.data || []); // Avoid undefined
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
    navigate("/venues/add"); // Redirect to the "Add Venue" form page
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ padding: 0 }}>
      {/* Add Venue Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} style={{ textAlign: "center" }}>
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