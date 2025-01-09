import React from 'react';
import { Box } from '@mui/material';

const RootLayout = ({ children, maxWidth = "md" }) => {
  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'background.default'
    }}>
      {/* Fixed sidebar spacer */}
      <Box sx={{ 
        width: { xs: 0, md: '140px' }, 
        flexShrink: 0 
      }} />
      
      {/* Main content area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflowX: 'auto',
        px: { xs: 2, sm: 3, md: 12 },
        py: { xs: 2, sm: 3 }
      }}>
        {/* Constrain width for normal content but allow full width for tables */}
        <Box sx={{ 
          width: '100%',
          maxWidth: maxWidth === 'md' ? '900px' : '100%',
          mx: 'auto'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default RootLayout;