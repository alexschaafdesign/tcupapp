import React from 'react';
import { Box, Container } from '@mui/material';

// RootLayout.js
const RootLayout = ({ children, maxWidth = "md" }) => {
    console.log('Current maxWidth:', maxWidth); // Add this to debug
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Box sx={{ 
          marginLeft: { md: '140px' },
          display: 'flex',
          justifyContent: 'center',
          maxWidth: '100%' // Add this
        }}>
          <Container 
            maxWidth={maxWidth}
            disableGutters // Add this
            sx={{
              px: { xs: 2, sm: 3, md: 1 },
              py: { xs: 2, sm: 3, md: 1 },
              minHeight: '100vh',
              maxWidth: '100%' // Add this
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    );
  };

export default RootLayout;