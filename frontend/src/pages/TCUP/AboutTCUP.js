import React from 'react';
import { Box, Container, Typography, Paper, Grid, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

const AboutTCUP = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8f8f8',
        py: 8,
        px: 2
      }}
    >
      <Container maxWidth="lg">
        {/* Page Title */}
        <Typography 
          variant="h2" 
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
            mb: 6
          }}
        >
          About TCUP
        </Typography>
        
        {/* Main Section */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: 'white',
            p: 4,
            mb: 6,
            borderRadius: 2
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
              textTransform: 'uppercase'
            }}
          >
            Performers are building power for fair pay + MORE
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
                It's obvious, but it needs to be said: being a musician or performer is a real job – one that enriches our community and deserves to be paid well and treated fairly.
              </Typography>
              <Typography variant="body1" sx={{ color: '#333', mb: 2, fontWeight: 'bold' }}>
                But right now, too many of us are expected to struggle for our art and pay our bills with "exposure."
              </Typography>
              <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
                Greedy streaming services exploit our labor and make billions, and we barely see enough to make rent.
              </Typography>
              <Typography variant="body1" sx={{ color: '#333' }}>
                Twin Cities United Performers (TCUP) is organizing to make Minnesota a state where musicians and performers are in community and solidarity with each other, treated with dignity, and supported to thrive as artists – not just survive.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  width: '100%',
                  height: '100%',
                  minHeight: '250px',
                  bgcolor: '#f0f0f0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography sx={{ color: '#999' }}>Image Placeholder</Typography>
                {/* Replace with your image: 
                <Box 
                  component="img"
                  src="your-image-url"
                  alt="Musicians performing"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 2
                  }}
                /> */}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Vision Section */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#faf5ff',
            p: 4,
            mb: 6,
            borderRadius: 2,
            border: '1px solid rgba(156, 39, 176, 0.1)'
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
              textTransform: 'uppercase'
            }}
          >
            OUR VISION
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#333', mb: 3 }}>
            Minnesota is a state where musicians and performers are:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <CircleIcon sx={{ color: '#9c27b0', fontSize: 10 }} />
              </ListItemIcon>
              <ListItemText 
                primary="In community and solidarity, supporting one another to navigate the challenges of this industry."
                primaryTypographyProps={{ color: '#333' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CircleIcon sx={{ color: '#9c27b0', fontSize: 10 }} />
              </ListItemIcon>
              <ListItemText 
                primary="Organizing with allied workers and movements to improve conditions for all of us."
                primaryTypographyProps={{ color: '#333' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CircleIcon sx={{ color: '#9c27b0', fontSize: 10 }} />
              </ListItemIcon>
              <ListItemText 
                primary="Supported to create and thrive as artists – not just survive – with fair and transparent pay, access to opportunity, and dignified working conditions."
                primaryTypographyProps={{ color: '#333' }}
              />
            </ListItem>
          </List>
        </Paper>
        
        {/* First Ave Section */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: 'white',
            p: 4,
            borderRadius: 2
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
              textTransform: 'uppercase'
            }}
          >
            Organizing at First Ave
          </Typography>
          
          <Grid container spacing={4} direction={{ xs: 'column-reverse', md: 'row' }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
                TCUP was born out of an historic campaign to organize and unionize workers at First Ave venues during the fall of 2023. Over 300 musicians organized in solidarity alongside venue workers, demanding workers be treated with dignity and respect – from fair scheduling and pay to adequate training.
              </Typography>
              <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
                When venue workers voted to unionize, First Ave venues voluntarily recognized the union within 24 hours.
              </Typography>
              <Typography variant="body1" sx={{ color: '#333' }}>
                TCUP formed out of the momentum from that organizing, ready to win changes for musicians, performers, and our community.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  width: '100%',
                  height: '100%',
                  minHeight: '250px',
                  bgcolor: '#f0f0f0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography sx={{ color: '#999' }}>Image Placeholder</Typography>
                {/* Replace with your image:
                <Box 
                  component="img"
                  src="your-image-url"
                  alt="First Ave organizing"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 2
                  }}
                /> */}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutTCUP;