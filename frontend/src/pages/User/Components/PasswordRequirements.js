import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { CheckCircleOutline as CheckIcon, Cancel as XIcon } from '@mui/icons-material';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    {
      test: (p) => p.length >= 8,
      text: "At least 8 characters"
    },
    {
      test: (p) => /[A-Z]/.test(p),
      text: "At least one uppercase letter"
    },
    {
      test: (p) => /[a-z]/.test(p),
      text: "At least one lowercase letter"
    },
    {
      test: (p) => /[0-9]/.test(p),
      text: "At least one number"
    },
    {
      test: (p) => /[!@#$%^&*]/.test(p),
      text: "At least one special character (!@#$%^&*)"
    }
  ];

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Password Requirements:
      </Typography>
      
      <Grid container spacing={1}>
        {requirements.map((req, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: req.test(password) ? 'success.main' : 'text.secondary',
                mb: 0.5
              }}
            >
              {req.test(password) ? (
                <CheckIcon sx={{ fontSize: 16 }} />
              ) : (
                <XIcon sx={{ fontSize: 16 }} />
              )}
              <Typography variant="body2">{req.text}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PasswordRequirements;