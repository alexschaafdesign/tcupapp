import React from 'react';
import { Box, Container, Typography, Paper, Grid, Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const LandingPage = () => {
  const { loginWithRedirect } = useAuth0();

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
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            p: 4
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'center'
                }}
              >
                <Box
                  component="img"
                  src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1735343525/LOGO_512_3x_t11sld.png"
                  alt="TCUP Logo"
                  sx={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                    mb: 4
                  }}
                />
                
                <Typography 
                  variant="h3" 
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3
                  }}
                >
                  Welcome to the New Cupboard!
                </Typography>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'white',
                    mb: 4 
                  }}
                >
                  Hi! We are very excited to be launching a new version of the Cupboard.
                </Typography>

                <Box sx={{ mb: 4, p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'white',
                      mb: 2,
                      fontSize: '1.1rem'
                    }}
                  >
                    Are you already a member of the Cupboard? If so, all you have to do is reset your password below and then login to the new site!
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'white',
                      mb: 3,
                      fontSize: '1.1rem'
                    }}
                  >
                    If you haven't joined the Cupboard yet, you can sign up below!
                  </Typography>
                </Box>

                <Typography variant="h6" color="text.secondary">
                  Twin Cities United Performers
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  p: 4
                }}
              >
                <Typography variant="h4" sx={{ color: 'white', textAlign: 'center', mb: 2 }}>
                  Ready to Join?
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => loginWithRedirect()}
                  sx={{
                    background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
                    color: 'white',
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7b1fa2 30%, #c51162 90%)',
                    }
                  }}
                >
                  Login / Sign Up
                </Button>
                
                <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', mt: 2 }}>
                  Click above to access the Cupboard. You'll be able to login with your existing account or create a new one.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;