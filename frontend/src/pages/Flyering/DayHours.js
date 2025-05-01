import React from 'react';
import { Grid, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
// Removed unused imports: Select, MenuItem, FormControl, InputLabel, useMemo, format, parse

const DayHours = ({ day, hours, onChange }) => {

  // Handles changes from either TimePicker component
  const handleTimeChange = (type, newDateValue) => {
    // The newDateValue from TimePicker is already a Date object or null
    onChange(day, {
      ...hours,
      [type]: newDateValue, // Pass the Date object or null directly
      isClosed: false // Automatically uncheck 'Closed' when a time is selected
    });
  };

  // Handles changes for the "Closed" checkbox
  const handleCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    onChange(day, {
      ...hours,
      isClosed: isChecked,
      // Clear times if 'Closed' is checked for consistency
      open: isChecked ? null : hours.open,
      close: isChecked ? null : hours.close,
    });
  };

  // No need for timeOptions or getDisplayTime anymore

  return (
    // Use alignItems="center" for better vertical alignment of items in the row
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>

      {/* Day Label */}
      <Grid item xs={12} sm={3} md={2}> {/* Adjusted Grid sizing */}
        <Typography sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}>
          {day}
        </Typography>
      </Grid>

      {/* Closed Checkbox */}
      <Grid item xs={5} sm={3} md={2}> {/* Adjusted Grid sizing */}
        <FormControlLabel
          control={
            <Checkbox
              checked={hours.isClosed}
              onChange={handleCheckboxChange} // Use dedicated handler
            />
          }
          label="Closed"
          sx={{ whiteSpace: 'nowrap'}} // Prevent label wrapping on small screens if possible
        />
      </Grid>

      {/* Open Time Picker */}
      <Grid item xs={7} sm={4} md={4}> {/* Adjusted Grid sizing */}
        <TimePicker
          // Use standard TextField styling within TimePicker via slotProps
          slotProps={{
            textField: {
                size: 'small', // Make the input field smaller
                fullWidth: true, // Ensure it takes up grid item width
                label: 'Open', // Label directly on the component
            }
          }}
          value={hours.open} // Should be a Date object or null
          onChange={(newValue) => handleTimeChange('open', newValue)}
          disabled={hours.isClosed}
          ampm // Use AM/PM display format (optional, set to false for 24hr)
          // minutesStep={15} // Optionally set minute increments
        />
      </Grid>

      {/* Close Time Picker */}
      <Grid item xs={7} sm={4} md={4}> {/* Adjusted Grid sizing */}
         <TimePicker
          slotProps={{
            textField: {
                size: 'small',
                fullWidth: true,
                label: 'Close',
            }
          }}
          value={hours.close} // Should be a Date object or null
          onChange={(newValue) => handleTimeChange('close', newValue)}
          disabled={hours.isClosed}
          ampm // Use AM/PM display format
          // minutesStep={15}
        />
      </Grid>

    </Grid>
  );
};

export default DayHours;