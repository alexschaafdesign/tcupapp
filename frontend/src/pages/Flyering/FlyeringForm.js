import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  Grid,
} from "@mui/material";
import { FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import DayHours from "./DayHours";



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

  const formatHours = (hours) => {
    const formatted = {};
    Object.keys(hours).forEach(day => {
      if (hours[day].isClosed) {
        formatted[`hours_${day}`] = 'CLOSED';
      } else if (hours[day].open && hours[day].close) {
        formatted[`hours_${day}`] = `${format(hours[day].open, 'HH:mm')}-${format(hours[day].close, 'HH:mm')}`;
      } else {
        formatted[`hours_${day}`] = 'CLOSED';
      }
    });
    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

    try {
      const response = await fetch(`${apiUrl}/flyering`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        throw new Error("Failed to submit flyering data");
      }

      navigate("/flyering");
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred while submitting the form.");
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Flyering Location
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Location Name"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Business Hours</Typography>
          {days.map((day) => (
            <DayHours
              key={day}
              day={day}
              hours={formData[day]}
              onChange={(day, newHours) => setFormData(prev => ({
                ...prev,
                [day]: newHours
              }))}
            />
          ))}
        </LocalizationProvider>

        <TextField
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2, mt: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Add Location
        </Button>
      </form>
    </Box>
  );
};

export default FlyeringForm;