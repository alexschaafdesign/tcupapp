// src/pages/Home.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const Home = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h2" gutterBottom>
        Welcome to TCUP's SHOW PORTAL
      </Typography>
      
      <Typography variant="body1" paragraph>
        Click below to view the show table:
      </Typography>
      <Link to="/shows">
        <Button variant="contained" color="primary" sx={{ marginBottom: 2 }}>
          Go to Shows Table
        </Button>
      </Link>

      <Typography variant="body1" paragraph>
        Click below to view the Bands table:
      </Typography>
      <Link to="/bands">
        <Button variant="contained" color="primary" sx={{ marginBottom: 2 }}>
          Go to Bands Table
        </Button>
      </Link>

      <Typography variant="body1" paragraph>
        Click below to view the Venues table:
      </Typography>
      <Link to="/venues">
        <Button variant="contained" color="primary" sx={{ marginBottom: 2 }}>
          Go to Venues Table
        </Button>
      </Link>

      <Typography variant="body1" paragraph>
        Click below to add a Band:
      </Typography>
      <Link to="/add-band">
        <Button variant="contained" color="secondary">
          Add a Band
        </Button>
      </Link>

      <Typography variant="body1" paragraph>
        Click below for the TCUP Bands table:
      </Typography>
      <Link to="/bands">
        <Button variant="contained" color="secondary">
          TCUP Bands table
        </Button>
      </Link>

    </Box>
  );
};

export default Home;