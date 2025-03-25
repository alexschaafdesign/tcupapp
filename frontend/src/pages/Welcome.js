import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Divider, 
  Link,
  Card,
  Avatar,
  Fade,
  Chip
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import BlockIcon from '@mui/icons-material/Block';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import palette from '../styles/colors/palette';
import WarningIcon from '@mui/icons-material/Warning';
import HandymanIcon from '@mui/icons-material/Handyman';


const WelcomePage = () => {
  const { loginWithRedirect } = useAuth0();

  // Function to handle login with Auth0
  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
      }
    });
  };
  

  // Function to handle signup with Auth0
  const handleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      }
    });
  };

  // Common noise background style
  const noiseBackground = {
    position: 'relative',
    "&::before": {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'url("https://res.cloudinary.com/dsll3ms2c/image/upload/v1740072216/noisebg_for_header_xyr0ou.png")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      opacity: 0.15,
      zIndex: 0,
    }
  };

  // Feature box component for reuse
  const FeatureBox = ({ icon, title, description }) => (
    <Card elevation={0} sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 2, 
      p: 1.5,
      backgroundColor: 'rgba(255,255,255,0.6)',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 2,
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }
    }}>
      <Avatar sx={{ 
        bgcolor: 'rgba(156, 39, 176, 0.1)', 
        color: '#9c27b0',
        mr: 2
      }}>
        {icon}
      </Avatar>
      <Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: "bold",
            mb: 0.5,
            color: '#333'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#555'
          }}
        >
          {description}
        </Typography>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #ECECEC 0%, #FFFFFF 100%)',
      p: 2,
      ...noiseBackground
    }}>
      <Fade in={true} timeout={1000}>
        <Paper elevation={4} sx={{ 
          maxWidth: 900, 
          width: '100%',
          p: { xs: 3, sm: 4 }, 
          borderRadius: 3,
          position: 'relative',
          zIndex: 1,
          bgcolor: 'white',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '5px',
          },
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }
        }}>
          {/* Header Section */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 3,
            position: 'relative',
            zIndex: 1 
          }}>
            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 1
              }}
            >
              <Box
                component="img"
                src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1740082499/TCUPlogo-traced_BLACK_a0wwot.png"
                alt="TCUP Logo"
                sx={{
                  width: "140px",
                  height: "auto",
                  mb: 1,
                }}
              />
              <Box
                sx={{
                  textAlign: "center",
                  mb: 1
                }}
              >
                <Box sx={{ fontSize: "16px", fontWeight: 400, lineHeight: 1 }}>
                  the
                </Box>
                <Box sx={{ fontSize: "25px", fontWeight: 900, color: "#6138B3" }}>
                  CUPBOARD
                </Box>
              </Box>
            </Box>

            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: palette.text.main,
                position: 'relative',
                display: 'inline-block',
                textTransform: "lowercase",
                mb: 0
              }}
            >
              welcome to the new Cupboard !!!
            </Typography>
          </Box>

          {/* Alert about account creation */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              bgcolor: 'rgba(156, 39, 176, 0.05)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}
            >
              <WarningIcon sx={{ color: palette.secondary.dark, mr: 1 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: palette.secondary.dark,
                  textTransform: 'lowercase'
                }}
              >
                you'll need a new account
              </Typography>
              <WarningIcon sx={{ color: palette.secondary.dark, ml: 1 }} />
            </Box>
            <Typography 
              variant="body1" 
              sx={{ mb: 1 }}
            >
              for technical reasons, we couldn't transfer accounts automatically from the old Cupboard -- 
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ mb: 1 }}
            >
              BUT it just takes five seconds (i swear) to set up a new one. Hundreds of people* have already done it. don't be left behind.  
            </Typography>
            <Typography 
              variant="caption" 
            >
             *technically not true at the time i'm writing this
            </Typography>
          </Paper>

          {/* Main Content Section */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Left Column: Features */}
            <Grid item xs={12} md={6} sx={{ 
              position: 'relative',
              zIndex: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h5" 
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'lowercase',
                    position: 'relative',
                    display: 'inline-block'
                  }}
                >
                  what we've got, uh, brewing --
                </Typography>
                
              </Box>
              
              <FeatureBox 
                icon={<ForumIcon />}
                title="chat" 
                description="Get advice, find bandmates, share resources"
              />
              
              <FeatureBox 
                icon={<EventIcon />}
                title="the official SHOW LIST" 
                description="A comprehensive listing of every show on every day"
              />

            <FeatureBox 
                icon={<HandymanIcon />}
                title="resources" 
                description="Booking contacts, venue info, flyering locations, and more"
              />            
              
              <FeatureBox 
                icon={<PeopleIcon />}
                title="band profiles (coming soon)" 
                description="having to use IG for everything is so 2024"
              />
            </Grid>
            
            {/* Right Column: Sign-up/Sign-in */}
            <Grid item xs={12} md={6} sx={{ position: 'relative', zIndex: 1 }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  bgcolor: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '5px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #9c27b0, #f50057)'
                  },
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    size="large"
                    onClick={handleSignup}
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      p: 1.5,
                      mb: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        sx={{ 
                          fontWeight: 'bold', 
                          lineHeight: 1.2,
                        }}
                      >
                        sign up
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontSize: '0.95em', 
                          fontWeight: 'regular',
                          lineHeight: 1.2,
                          textTransform: "none"
                        }}
                      >
                        (for new users OR cupboard 1.0 users)
                      </Typography>
                    </Box>
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    fullWidth
                    size="large"
                    onClick={handleLogin}
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      p: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        sx={{ 
                          fontWeight: 'bold', 
                          lineHeight: 1.2,
                        }}
                      >
                        SIGN IN
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontSize: '0.95em', 
                          fontWeight: 'regular',
                          lineHeight: 1.2,
                          textTransform: "lowercase"
                        }}
                      >
                        (if you already made an account on this new Cupboard)
                      </Typography>
                    </Box>
                  </Button>
                </Box>
                
                
              </Paper>
            </Grid>
          </Grid>
          
          {/* Full-width No Ads box */}
          <Box sx={{ 
            p: 2.5, 
            bgcolor: 'rgba(156, 39, 176, 0.05)', 
            borderRadius: 2,
            border: '1px solid rgba(156, 39, 176, 0.15)',
            position: 'relative',
            zIndex: 1,
            width: '100%'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'bold',
                color: '#333',
                justifyContent: 'center'
              }}
            >
              <BlockIcon sx={{ mr: 1, color: '#9c27b0' }} />
              NO ADS / NO ALGORITHMS / NO TRACKING
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#555',
                textAlign: 'center'
              }}
            >
              trying to be a band/artist/performer on the internet shouldn't be so annoying
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default WelcomePage;