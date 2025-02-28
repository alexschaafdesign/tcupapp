import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Grid, List, ListItem, ListItemText, ListItemIcon, 
  Divider, Chip, Fade, Button, Link } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import UpdatesSection from './Updates/UpdatesSection';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useInView } from 'react-intersection-observer';

const AboutTCUP = () => {
  // Animation on scroll
  const [ref1, inView1] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [ref2, inView2] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [ref3, inView3] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '50vh',
          minHeight: '100px',
          maxHeight: '200px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://res.cloudinary.com/dsll3ms2c/image/upload/v1740716422/472505985_1150728213085988_6028807238254085019_n_i1vd58.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mb: 4,
          mt: 4,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="%23ffffff" fill-opacity="0.05"/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
            opacity: 0.2,
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h2" 
            component="h1"
            sx={{
              fontWeight: 500,
              color: 'white',
              textAlign: 'center',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontSize: { xs: '2.5rem', md: '4rem' }
            }}
          >
            Twin Cities United Performers
          </Typography>
          <Typography 
            variant="h5" 
            sx={{
              color: 'white',
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              lineHeight: 1.6
            }}
          >
            Building power for musicians and performers in Minnesota
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 10 }}>        
        {/* Main Section with staggered layout */}
       {/* Main Section with staggered layout */}
{/* Main Section with staggered layout */}
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
        left: 0,
        width: '100%',
        height: '5px',
        background: 'linear-gradient(90deg, #9c27b0, #f50057)'
      },
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      }
    }}
  >
    <Grid container spacing={5} alignItems="flex-start">
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h2" 
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
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
              background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)'
            }
          }}
        >
          Performers are building power
        </Typography>
        
        <Typography variant="body1" sx={{ color: '#333', mb: 2, lineHeight: 1.7 }}>
          It's obvious, but it needs to be said: being a musician or performer is a real job – one that enriches our community and deserves to be paid well and treated fairly.
        </Typography>
        
        <Typography variant="body1" sx={{ color: '#333', mb: 2, lineHeight: 1.7 }}>

            But right now, too many of us are expected to struggle for our art and pay our bills with "exposure."
          </Typography>
        
        
        <Typography variant="body1" sx={{ color: '#333', mb: 2, lineHeight: 1.7 }}>
          Greedy streaming services exploit our labor and make billions, and we barely see enough to make rent.
        </Typography>

        <Box sx={{ position: 'relative', my: 2, pl: 0 }}>
          <Typography variant="h4" sx={{ color: '#333', mb: 2, fontWeight: 'bold', fontStyle: 'italic' }}>          
            Twin Cities United Performers (TCUP) is organizing to make Minnesota a state where musicians and performers are in community and solidarity with each other, treated with dignity, and supported to thrive as artists – not just survive.
        </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ color: '#333', mt: 2, lineHeight: 1.7 }}>
          By building collective power, we can demand fair treatment, transparent pay practices, and better conditions throughout the local music scene. Together, we're stronger.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box 
          sx={{ 
            width: '100%',
            position: 'relative',
            mt: { xs: 0, md: 1 }, // Small top margin to align with heading
          }}
        >
          <Link
            href="https://www.startribune.com/minneapolis-music-census-underpaid-musicians-data-released-economic-study-venues-mniva-city/601184756?taid=673fa66b6047c9000197d69a&utm_campaign=trueanthem&utm_medium=social&utm_source=twitter"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'block' }}
          >
            <Box 
              sx={{
                width: '100%',
                backgroundColor: 'white',
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                // Remove the padding to let image go to top
                padding: '20px 20px 0'
              }}
            >
              <Box 
                component="img"
                src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1740716106/468091081_18204999625289454_9211408636181580442_n_vnh4rv.jpg"
                alt="Minneapolis Music Census - Star Tribune Article"
                sx={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
                  borderRadius: '12px',
                }}
              /> 
            </Box>
          </Link>
        </Box>
      </Grid>
    </Grid>
  </Paper>
</Fade>

        {/* Latest Updates Section */}
        <Fade in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
          <Paper
            elevation={4}
            sx={{
              bgcolor: 'white',
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              mb: 6,
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
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
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
                    background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)'
                  }
                }}
              >
                Latest Updates
              </Typography>
              
              <Button
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: '#9c27b0',
                  '&:hover': {
                    backgroundColor: 'rgba(156, 39, 176, 0.08)'
                  }
                }}
              >
                View All
              </Button>
            </Box>      

            <UpdatesSection />
            
            <Typography variant="body2" sx={{ mt: 3, color: '#666', fontStyle: 'italic', textAlign: 'right' }}>
              * Updates are managed by TCUP administrators
            </Typography>
          </Paper>
        </Fade>
        
        {/* Vision Section */}
        <div ref={ref1}>
          <Fade in={inView1} timeout={1000}>
            <Paper
              elevation={4}
              sx={{
                background: 'linear-gradient(to right, #faf5ff, #ffffff)',
                p: { xs: 3, md: 5 },
                mb: 6,
                borderRadius: 3,
                border: '1px solid rgba(156, 39, 176, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h40v40H0V0zm40 40h-40V0h40v40zM13.71 20l8.66 8.66 1.41-1.42L16.83 20l6.95-6.95-1.41-1.41L13.71 20z" fill="%239c27b0" fill-opacity="0.03" fill-rule="evenodd"/%3E%3C/svg%3E")',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
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
                      background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)'
                    }
                  }}
                >
                  OUR VISION
                </Typography>
                <Chip 
                  label="Building Community" 
                  sx={{ 
                    ml: 3, 
                    backgroundColor: 'rgba(156, 39, 176, 0.1)', 
                    color: '#9c27b0',
                    borderRadius: '4px',
                  }} 
                />
              </Box>
              
              <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.7 }}>
                Minnesota is a state where musicians and performers are:
              </Typography>
              
              <List>
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <MusicNoteIcon sx={{ color: '#9c27b0' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="In community and solidarity, supporting one another"
                    secondary="Navigating challenges of this industry together through mutual aid and shared resources."
                    primaryTypographyProps={{ 
                      color: '#333', 
                      fontWeight: 'bold' 
                    }}
                    secondaryTypographyProps={{
                      color: '#555',
                      lineHeight: 1.6
                    }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <MusicNoteIcon sx={{ color: '#9c27b0' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Organizing with allied workers and movements"
                    secondary="Improving conditions for all of us through collective action and solidarity."
                    primaryTypographyProps={{ 
                      color: '#333', 
                      fontWeight: 'bold' 
                    }}
                    secondaryTypographyProps={{
                      color: '#555',
                      lineHeight: 1.6
                    }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <MusicNoteIcon sx={{ color: '#9c27b0' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Supported to create and thrive as artists"
                    secondary="Not just survive – with fair and transparent pay, access to opportunity, and dignified working conditions."
                    primaryTypographyProps={{ 
                      color: '#333', 
                      fontWeight: 'bold' 
                    }}
                    secondaryTypographyProps={{
                      color: '#555',
                      lineHeight: 1.6
                    }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Fade>
        </div>
        
        {/* First Ave Section */}
        <div ref={ref2}>
          <Fade in={inView2} timeout={1000}>
            <Paper
              elevation={4}
              sx={{
                bgcolor: 'white',
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  background: 'linear-gradient(90deg, #9c27b0, #f50057)'
                },
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Typography 
                variant="h4" 
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 4,
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
                    background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)'
                  }
                }}
              >
                Organizing at First Ave
              </Typography>
              
              <Grid container spacing={5} direction={{ xs: 'column-reverse', md: 'row' }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.7 }}>
                    TCUP was born out of an historic campaign to organize and unionize workers at First Ave venues during the fall of 2023. Over 300 musicians organized in solidarity alongside venue workers, demanding workers be treated with dignity and respect – from fair scheduling and pay to adequate training.
                  </Typography>
                  
                  <Box sx={{ position: 'relative', my: 4, pr: 4,  textAlign: 'left' }}>
                    <Typography variant="body1" sx={{ color: '#333', mb: 2, fontWeight: 'bold', fontStyle: 'italic', fontSize: '1.1rem' }}>
                      When venue workers voted to unionize, First Ave venues voluntarily recognized the union within 24 hours.
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.7 }}>
                    TCUP formed out of the momentum from that organizing, ready to win changes for musicians, performers, and our community.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: '100%',
                      position: 'relative',
                     
                    }}
                  >
                    <Box 
                      sx={{
                        width: '100%',
                        minHeight: '300px',
                        bgcolor: '#f0f0f0',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                     
                      <Box 
                        component="img"
                        src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1740718505/400384480_1789627691491926_782054630015382584_n_l5iitb.jpg"
                        alt="First Ave organizing"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 3
                        }}
                      /> 
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        </div>
        
        {/* Call to Action */}
        <div ref={ref3}>
          <Fade in={inView3} timeout={1000}>
            <Paper
              elevation={4}
              sx={{
                mt: 8,
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #9c27b0 0%, #f50057 100%)',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h40v40H0V0zm40 40h-40V0h40v40zM13.71 20l8.66 8.66 1.41-1.42L16.83 20l6.95-6.95-1.41-1.41L13.71 20z" fill="%23ffffff" fill-opacity="0.1" fill-rule="evenodd"/%3E%3C/svg%3E")',
                }
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                Ready to Get Involved?
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: '700px', mx: 'auto', lineHeight: 1.7 }}>
                Join TCUP today and help build power for musicians and performers across Minnesota. Together, we can create a more fair, transparent, and supportive music scene.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="https://airtable.com/appWhJi1YbIsdiXrw/pagHJycS1fOI0TGLS/form"
                target="_blank" // For opening in new tab
                rel="noopener noreferrer" // Security best practice for external links
                sx={{
                  bgcolor: 'white',
                  color: '#9c27b0',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                  px: 4
                }}
              >
                Join TCUP
              </Button>
               
              </Box>
            </Paper>
          </Fade>
        </div>
        
      </Container>
    </Box>
  );
};

export default AboutTCUP;