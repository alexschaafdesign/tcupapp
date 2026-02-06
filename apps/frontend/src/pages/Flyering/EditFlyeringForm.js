import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  Grid,
} from "@mui/material";
import { FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse } from 'date-fns';
import DayHours from "./DayHours";



const EditFlyeringForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
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

  const parseHours = (hoursStr) => {
    if (hoursStr === 'CLOSED') {
      return { ...emptyHours, isClosed: true };
    }
    const [openStr, closeStr] = hoursStr.split('-');
    return {
      open: parse(openStr, 'HH:mm', new Date()),
      close: parse(closeStr, 'HH:mm', new Date()),
      isClosed: false
    };
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`${apiUrl}/flyering/${id}`);
        if (!response.ok) throw new Error("Failed to fetch location");
        
        const data = await response.json();
        const location = data.data;

        setFormData({
          location: location.location,
          address: location.address,
          monday: parseHours(location.hours_monday),
          tuesday: parseHours(location.hours_tuesday),
          wednesday: parseHours(location.hours_wednesday),
          thursday: parseHours(location.hours_thursday),
          friday: parseHours(location.hours_friday),
          saturday: parseHours(location.hours_saturday),
          sunday: parseHours(location.hours_sunday),
          notes: location.notes || "",
        });
      } catch (err) {
        setErrorMessage("Failed to load location data");
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchLocation();
  }, [id, apiUrl]);

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
      const response = await fetch(`${apiUrl}/flyering/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        throw new Error("Failed to update location");
      }

      navigate("/flyering");
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred while updating the location.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        const response = await fetch(`${apiUrl}/flyering/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete location");
        }

        navigate("/flyering");
      } catch (err) {
        console.error(err);
        setErrorMessage("An error occurred while deleting the location.");
      }
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (initialLoading) {
    return (
      <Box sx={{ padding: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Flyering Location
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
          Update Location
        </Button>

        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleDelete}
        >
          Delete Location
        </Button>
      </form>
    </Box>
  );
};

export default EditFlyeringForm;