import React from 'react';
import { Box, Typography, Paper, Button, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { useNavigate } from 'react-router-dom';

const PwaUpdatePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      p: 2
    }}>
      <Paper elevation={3} sx={{ 
        maxWidth: 800, 
        width: '100%',
        p: { xs: 2, sm: 4 }, 
        borderRadius: 2
      }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <PhoneIphoneIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" gutterBottom color="primary">
            Updating Your TCUP Board App
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          We've completely redesigned the TCUP Board with new features and improvements! 
          Our new platform operates as a website rather than a Progressive Web App (PWA).
        </Typography>

        <Typography variant="body1" paragraph>
          To continue using TCUP Board, you'll need to remove the current app from your device and access the new site directly through your browser.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Follow these steps:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon><DeleteOutlineIcon color="error" /></ListItemIcon>
            <ListItemText 
              primary="Remove the current app" 
              secondary="Find the TCUP Board app on your home screen, press and hold, then select 'Remove' or 'Delete'"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon><ArrowBackIcon color="primary" /></ListItemIcon>
            <ListItemText 
              primary="Open your browser" 
              secondary="Use Safari (iOS) or Chrome (Android) to visit tcupboard.org"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon><BookmarkBorderIcon color="primary" /></ListItemIcon>
            <ListItemText 
              primary="Bookmark the new site" 
              secondary="Add the site to your home screen or bookmarks for easy access"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon><HomeIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Create a new account" 
              secondary="Sign up with a new account on our improved platform"
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/welcome')}
          >
            Back to Welcome
          </Button>
          
          <Button 
            variant="contained" 
            onClick={() => window.location.href = 'https://tcupboard.org'}
          >
            Visit New Site
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PwaUpdatePage;