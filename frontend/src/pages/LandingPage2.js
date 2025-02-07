import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

const LandingPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Box
            component="img"
            src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1735343525/LOGO_512_3x_t11sld.png"
            alt="TCUP Logo"
            sx={{
              width: '200px',
              height: '200px',
              objectFit: 'contain'
            }}
          />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="h1"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Coming Soon
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Twin Cities United Performers
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;