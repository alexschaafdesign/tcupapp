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
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";
import { format, parseISO, isWithinInterval, addMinutes, parse } from 'date-fns';

const FlyeringTable = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const apiUrl = process.env.REACT_APP_API_URL;

  const formatDisplayTime = (timeStr) => {
    if (timeStr === 'CLOSED') return 'CLOSED';
    
    const [openStr, closeStr] = timeStr.split('-');
    const openTime = parse(openStr, 'HH:mm', new Date());
    const closeTime = parse(closeStr, 'HH:mm', new Date());
    
    return `${format(openTime, 'h:mma')}-${format(closeTime, 'h:mma')}`.toLowerCase();
  };

  const getLocationStatus = (hours) => {
    const now = new Date();
    const day = format(now, 'EEEE').toLowerCase();
    const hoursToday = hours[`hours_${day}`];
    
    if (hoursToday === 'CLOSED') return { status: 'closed', color: 'error' };
    
    const [openStr, closeStr] = hoursToday.split('-');
    const [openHour, openMin] = openStr.split(':').map(Number);
    const [closeHour, closeMin] = closeStr.split(':').map(Number);
    
    const openTime = new Date().setHours(openHour, openMin, 0);
    const closeTime = new Date().setHours(closeHour, closeMin, 0);
    
    const soon = 30; // minutes

    if (isWithinInterval(now, { start: openTime, end: closeTime })) {
      if (isWithinInterval(now, { start: addMinutes(closeTime, -soon), end: closeTime })) {
        return { status: 'closing soon', color: 'warning' };
      }
      return { status: 'open', color: 'success' };
    } else if (isWithinInterval(now, { start: addMinutes(openTime, -soon), end: openTime })) {
      return { status: 'opening soon', color: 'info' };
    }
    return { status: 'closed', color: 'error' };
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${apiUrl}/flyering`);
        if (!response.ok) throw new Error("Failed to fetch flyering locations");
        const data = await response.json();
        setLocations(data.data || []);
        setFilteredLocations(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
    // Refresh status every minute
    const intervalId = setInterval(fetchLocations, 60000);
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = locations.filter(location =>
      location.location.toLowerCase().includes(query.toLowerCase()) ||
      location.address.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredLocations(filtered);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ padding: 0 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => navigate("/flyering/add")}>
          Add Location
        </Button>
      </Box>

      <TextField
        label="Search Locations"
        value={searchQuery}
        onChange={handleSearch}
        variant="outlined"
        fullWidth
        sx={{ marginBottom: 2 }}
      />

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Address</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Today's Hours</strong></TableCell>
              <TableCell><strong>Notes</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLocations.map((location) => {
              const { status, color } = getLocationStatus(location);
              const today = format(new Date(), 'EEEE').toLowerCase();
              const todaysHours = location[`hours_${today}`] || 'Closed';
              
              return (
                <TableRow key={location.id}>
                  <TableCell>{location.location}</TableCell>
                  <TableCell>{location.address}</TableCell>
                  <TableCell>
                    <Chip
                      label={status}
                      color={color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDisplayTime(todaysHours)}</TableCell>
                  <TableCell>{location.notes || "No notes"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Location">
                      <IconButton
                        onClick={() => navigate(`/flyering/edit/${location.id}`)}
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
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default FlyeringTable;