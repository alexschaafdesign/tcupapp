import React from 'react';
import { Box, Slider, Typography } from '@mui/material';

function RatingSlider({ label, value, onChange, description }) {
  return (
    <Box sx={{ width: '100%', mt: 2, mb: 3 }}>
      <Typography gutterBottom>{label}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
      )}
      <Slider
        value={value}
        onChange={onChange}
        marks={false} // No discrete marks
        step={null}   // Continuous slider
        min={1}
        max={5}
        valueLabelDisplay="auto"
        sx={{
          '& .MuiSlider-thumb': {
            backgroundColor: '#1976d2',
          },
        }}
      />
    </Box>
  );
}

export default RatingSlider;