import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  Grid,
  Paper, // Import Paper
  InputAdornment, // Import InputAdornment
} from "@mui/material";
// Keep these imports even if DayHours changes internally
import { FormControlLabel, Checkbox } from '@mui/material'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Import Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotesIcon from '@mui/icons-material/Notes';
import SaveIcon from '@mui/icons-material/Save'; // Or AddLocationIcon etc.

import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import DayHours from "./DayHours"; // Assuming DayHours.js is updated to use TimePicker

const FlyeringForm = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  const emptyHours = {
    open: null,
    close: null,
    isClosed: false
  };

  const [formData, setFormData] = useState({
    location: "",
    address: "",
    monday: { ...emptyHours },
    tuesday: { ...emptyHours },
    wednesday: { ...emptyHours },
    thursday: { ...emptyHours },
    friday: { ...emptyHours },
    saturday: { ...emptyHours },
    sunday: { ...emptyHours },
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // This function remains the same, sending UNKNOWN/CLOSED/time-range
  const formatHours = (hours) => {
    const formatted = {};
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    daysOfWeek.forEach(day => {
      if (hours[day].isClosed) {
        formatted[`hours_${day}`] = 'CLOSED';
      }
      // Check if both open and close are valid Date objects before formatting
      else if (hours[day].open instanceof Date && !isNaN(hours[day].open) && 
               hours[day].close instanceof Date && !isNaN(hours[day].close)) {
        try {
            formatted[`hours_${day}`] = `${format(hours[day].open, 'HH:mm')}-${format(hours[day].close, 'HH:mm')}`;
        } catch (err) {
            console.error(`Error formatting time for ${day}: `, err);
            formatted[`hours_${day}`] = 'UNKNOWN'; // Fallback if formatting fails
        }
      }
      else {
        formatted[`hours_${day}`] = 'UNKNOWN';
      }
    });
    return formatted;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    const formattedHours = formatHours({
      monday: formData.monday,
      tuesday: formData.tuesday,
      wednesday: formData.wednesday,
      thursday: formData.thursday,
      friday: formData.friday,
      saturday: formData.saturday,
      sunday: formData.sunday,
    });

    const dataToSubmit = {
      location: formData.location,
      address: formData.address,
      notes: formData.notes,
      ...formattedHours,
    };

    // Basic Frontend Validation Example (optional but recommended)
    if (!formData.location || !formData.address) {
        setErrorMessage("Location Name and Address are required.");
        return;
    }

    try {
      const response = await fetch(`${apiUrl}/flyering`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      const responseData = await response.json(); // Try to get response body

      if (!response.ok) {
        // Use error message from backend if available
        const errorMsg = responseData?.error || responseData?.message || "Failed to submit flyering data";
        throw new Error(errorMsg);
      }

      navigate("/flyering"); // Navigate on success
    } catch (err) {
      console.error(err);
      // Display specific error from backend or a generic one
      setErrorMessage(err.message || "An error occurred while submitting the form.");
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Handler for DayHours component changes
   const handleHoursChange = (day, newHours) => {
    setFormData(prev => ({
        ...prev,
        [day]: newHours
    }));
   };

  return (
    // Use Box for overall padding
    <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}> 
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Add New Flyering Location
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Location Details */}
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Location Details
          </Typography>
          <TextField
            label="Location Name"
            name="location"
            value={formData.location}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            required
            helperText="Enter the specific street address if possible"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Section 2: Business Hours */}
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Business Hours
          </Typography>
          {/* NOTE: Remember to update DayHours.js to use TimePicker */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {days.map((day) => (
              <DayHours
                key={day}
                day={day}
                hours={formData[day]}
                onChange={handleHoursChange} // Pass the handler
              />
            ))}
          </LocalizationProvider>
        </Paper>

        {/* Section 3: Notes */}
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
           <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
             Notes
           </Typography>
          <TextField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            placeholder="Any specific instructions or observations (e.g., 'Bulletin board near entrance', 'Ask manager first')"
            sx={{ mb: 2 }}
             InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NotesIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Submit Button Area */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            sx={{ px: 3, py: 1 }} // Add some padding
            >
            Add Location
            </Button>
        </Box>
      </form>
    </Box>
  );
};

export default FlyeringForm;