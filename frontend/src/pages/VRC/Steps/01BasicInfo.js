import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  Autocomplete
} from '@mui/material';
import RatingSlider from '../Components/RatingSlider';

function BasicInfo({ formData, onSubmit, isSubmitting }) {
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [stepData, setStepData] = useState(
    formData.basicInfo || {
      venueName: '',
      dateOfPerformance: '',
      numberOfBands: '',
      bandMembers: '',
      attendance: '',
      isTouringBand: false
    }
  );

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch(`${apiUrl}/venues`);
        if (!response.ok) {
          throw new Error("Failed to fetch venues");
        }
        const data = await response.json();
        const venuesData = data.data || [];
        setVenues(venuesData);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchVenues();
  }, [apiUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStepData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVenueChange = (event, newValue) => {
    setStepData(prev => ({
      ...prev,
      venueName: typeof newValue === 'string' ? newValue : newValue?.venue || ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ basicInfo: stepData });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Autocomplete
          freeSolo
          loading={loadingVenues}
          options={venues}
          value={stepData.venueName}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return option.venue || '';
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Venue Name"
              required
              helperText="Select a venue or type a new one"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingVenues ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          onChange={handleVenueChange}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.venue}
            </li>
          )}
          isOptionEqualToValue={(option, value) => 
            option.id === value.id || option.venue === value
          }
        />

        <TextField
          label="Date of Performance"
          type="date"
          name="dateOfPerformance"
          value={stepData.dateOfPerformance}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
        />

        <TextField
          label="How many bands/acts were on the bill?"
          name="numberOfBands"
          type="number"
          value={stepData.numberOfBands}
          onChange={handleChange}
          fullWidth
          InputProps={{ inputProps: { min: 1 } }}
        />

        <TextField
          label="How many members were in your band?"
          name="bandMembers"
          type="number"
          value={stepData.bandMembers}
          onChange={handleChange}
          fullWidth
          InputProps={{ inputProps: { min: 1 } }}
        />

        <TextField
          label="How many people attended the show? (estimate)"
          name="attendance"
          type="number"
          value={stepData.attendance}
          onChange={handleChange}
          fullWidth
          helperText="A rough estimate is fine!"
          InputProps={{ inputProps: { min: 0 } }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={stepData.isTouringBand}
              onChange={handleChange}
              name="isTouringBand"
            />
          }
          label="Are you a touring musician passing through Minnesota?"
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Next'}
        </Button>
      </Box>
    </form>
  );
}

export default BasicInfo;