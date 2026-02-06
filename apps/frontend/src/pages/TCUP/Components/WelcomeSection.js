import React from 'react';
import { Box, Typography, Paper, Grid, Fade, Link } from '@mui/material';
import palette from '../../../styles/colors/palette';

const WelcomeSection = () => {
  return (
    <Fade in={true} timeout={1000}>
      <Paper
        elevation={4}
        sx={{
          bgcolor: 'white',
          p: { xs: 3, md: 5 },
          mb: 6,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '5px',
            height: '100%',
            background: 'linear-gradient(180deg, #f50057, #9c27b0)'
          },
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Typography 
          variant="h3" 
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #f50057 30%, #9c27b0 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
            textTransform: 'uppercase',
            position: 'relative',
            display: 'inline-block',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '60px',
              height: '3px',
              background: 'linear-gradient(45deg, #f50057 30%, #9c27b0 90%)'
            }
          }}
        >
          Welcome to the new Cupboard!
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
                    
            <Box component="ul" sx={{ pl: 4, color: '#333', lineHeight: 1.7 }}>
              <Box component="li" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  This is the new all-in-one home for the Minnesota music scene, brought to you by Twin Cities United Performers (TCUP), a group organizing to make Minnesota the best place in the world to be a performer.
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 2 }}>
                <Typography variant="body1">
                This new site is owned completely by TCUP -- no algorithms, no data harvesting, no advertising.  
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>If you recently registered and noticed that your username is something like "user_1741363821366", go to your user profile and you can update the username from there! </strong> (this is a bug we will be fixing asap)
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 2 }}>
                <Typography variant="body1">
                After that, head to the <Link href="/chat" sx={{ fontWeight: 'medium', color: palette.primary.main, textDecoration: 'none' }}>Chat</Link> to start talking to your fellow performers, and also check out the <Link href="/shows" sx={{ fontWeight: 'medium', color: palette.primary.main, textDecoration: 'none' }}>Show List</Link> to see what's happening around town!
                </Typography>
              </Box>
            </Box>
          </Grid>
          
        
        </Grid>
      </Paper>
    </Fade>
  );
};

export default WelcomeSection;