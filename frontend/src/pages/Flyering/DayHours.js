import React, { useMemo } from 'react';
import { Grid, Typography, FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { format, parse } from 'date-fns';

const DayHours = ({ day, hours, onChange }) => {
  const timeOptions = useMemo(() => {
    const options = [];
    const current = new Date();
    current.setHours(5, 0, 0); // Start at 5 AM
    
    while (current.getHours() < 23) { // Until 11 PM
      options.push({
        value: format(current, 'HH:mm'),
        label: format(current, 'h:mm a')
      });
      current.setMinutes(current.getMinutes() + 30);
    }
    return options;
  }, []);

  const handleTimeChange = (type, timeString) => {
    const newTime = timeString ? parse(timeString, 'HH:mm', new Date()) : null;
    onChange(day, { 
      ...hours,
      [type]: newTime,
      isClosed: false
    });
  };

  const getDisplayTime = (time) => {
    console.log('Time input:', time);
    if (!time) return '';
    try {
      const value = format(time, 'HH:mm');
      console.log('Formatted value:', value);
      return value;
    } catch (err) {
      console.error('Format error:', err);
      return '';
    }
  };

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={3}>
        <Typography sx={{ textTransform: 'capitalize' }}>{day}</Typography>
      </Grid>
      <Grid item xs={12} sm={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={hours.isClosed}
              onChange={(e) => onChange(day, { ...hours, isClosed: e.target.checked })}
            />
          }
          label="Closed"
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <InputLabel>Open</InputLabel>
          <Select
            value={getDisplayTime(hours.open)}
            onChange={(e) => handleTimeChange('open', e.target.value)}
            disabled={hours.isClosed}
            label="Open"
          >
            {timeOptions.map(time => (
              <MenuItem key={time.value} value={time.value}>{time.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <InputLabel>Close</InputLabel>
          <Select
            value={getDisplayTime(hours.close)}
            onChange={(e) => handleTimeChange('close', e.target.value)}
            disabled={hours.isClosed}
            label="Close"
          >
            {timeOptions.map(time => (
              <MenuItem key={time.value} value={time.value}>{time.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default DayHours;