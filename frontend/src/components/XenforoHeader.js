import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  IconButton,
  colors
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const XenForoHeader = () => {
  const handleBack = () => {
    window.location.href = 'https://tcupboard.org'; // Or whatever your XenForo base URL is
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: '#9575cd',
        width: '100%',
        left: 0,
        right: 0,
        margin: 0,
        boxShadow: 'none',  // Remove shadow for a flatter look
      }}
    >
      <Toolbar sx={{ minHeight: '50px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit" 
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="body1"
            sx={{ 
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={handleBack}
          >
            Back to tCUPBOARD
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default XenForoHeader;