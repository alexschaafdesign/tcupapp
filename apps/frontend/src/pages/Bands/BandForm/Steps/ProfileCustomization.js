import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Divider,
  Button,
  Alert,
  Fade,
  Chip,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  List,
  LinearProgress,
  Avatar,
  Link
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import AlbumIcon from '@mui/icons-material/Album';
import StoreIcon from '@mui/icons-material/Store';
import MicIcon from '@mui/icons-material/Mic';
import EventIcon from '@mui/icons-material/Event';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CheckIcon from '@mui/icons-material/Check';
import palette from "../../../../styles/colors/palette";

// Styled components
const StepContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: palette.primary.dark,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: palette.primary.main,
    borderRadius: 2,
  }
}));

// Color Theme Selector Component
const ColorThemeSelector = ({ selectedTheme, onThemeChange }) => {
  // Predefined theme options
  const themeOptions = [
    { id: 'default', name: 'Classic', primary: '#3f51b5', secondary: '#f50057' },
    { id: 'dark', name: 'Dark Stage', primary: '#272727', secondary: '#ff4081' },
    { id: 'vintage', name: 'Vintage', primary: '#a67c00', secondary: '#bf360c' },
    { id: 'indie', name: 'Indie', primary: '#1976d2', secondary: '#388e3c' },
    { id: 'punk', name: 'Punk', primary: '#d32f2f', secondary: '#212121' },
    { id: 'electronic', name: 'Electronic', primary: '#6200ea', secondary: '#00b0ff' },
    { id: 'folk', name: 'Folk', primary: '#5d4037', secondary: '#8d6e63' },
    { id: 'jazz', name: 'Jazz', primary: '#283593', secondary: '#ff9800' },
  ];

  return (
    <Box>
      <SectionTitle variant="h6">Select Your Profile Theme</SectionTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose a color theme that matches your band's style and branding
      </Typography>
      
      <Grid container spacing={2}>
        {themeOptions.map((theme) => (
          <Grid item key={theme.id} xs={6} sm={4} md={3}>
            <Paper 
              elevation={selectedTheme === theme.id ? 8 : 1}
              onClick={() => onThemeChange(theme.id)}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: selectedTheme === theme.id ? 
                  `2px solid ${theme.primary}` : '2px solid transparent',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
                }
              }}
            >
              <Typography variant="subtitle1" gutterBottom align="center">
                {theme.name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: theme.primary }} />
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: theme.secondary }} />
              </Box>
              
              {selectedTheme === theme.id && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 8, 
                    right: 8, 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme.primary,
                    color: 'white'
                  }}
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Header Layout Selector Component
const HeaderLayoutSelector = ({ selectedLayout, onLayoutChange }) => {
  const layoutOptions = [
    { id: 'classic', name: 'Classic', description: 'Image on left, text on right' },
    { id: 'centered', name: 'Centered', description: 'Large centered image with text below' },
    { id: 'hero', name: 'Hero', description: 'Full-width banner with image overlay' },
    { id: 'minimal', name: 'Minimal', description: 'Text-focused with small image' }
  ];
  
  return (
    <Box>
      <SectionTitle variant="h6">Choose Header Layout</SectionTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select how your profile header will be displayed
      </Typography>
      
      <Grid container spacing={2}>
        {layoutOptions.map((layout) => (
          <Grid item key={layout.id} xs={12} sm={6}>
            <Paper 
              elevation={selectedLayout === layout.id ? 8 : 1}
              onClick={() => onLayoutChange(layout.id)}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: selectedLayout === layout.id ? 
                  `2px solid ${palette.primary.main}` : '2px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {/* Layout preview visualization */}
                <Box sx={{ 
                  width: 80, 
                  height: 50, 
                  border: '1px solid #ddd',
                  mr: 2,
                  position: 'relative',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  // Custom styling for each layout preview
                  ...(layout.id === 'classic' && {
                    background: `linear-gradient(to right, #ddd 30%, #f5f5f5 30%)`,
                  }),
                  ...(layout.id === 'centered' && {
                    background: `#f5f5f5`,
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: '5px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#ddd',
                    },
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '5px',
                      left: '30%',
                      right: '30%',
                      height: '5px',
                      backgroundColor: '#eee',
                    }
                  }),
                  ...(layout.id === 'hero' && {
                    background: `#ddd`,
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '8px',
                      left: '10px',
                      right: '10px',
                      height: '10px',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                    }
                  }),
                  ...(layout.id === 'minimal' && {
                    background: `#f5f5f5`,
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      backgroundColor: '#ddd',
                    },
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      top: '15px',
                      left: '30px',
                      right: '10px',
                      height: '5px',
                      backgroundColor: '#eee',
                    }
                  }),
                }}>
                  {selectedLayout === layout.id && (
                    <CheckIcon 
                      sx={{ 
                        color: 'white', 
                        fontSize: 20, 
                        zIndex: 2,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: '50%',
                        p: 0.5
                      }} 
                    />
                  )}
                </Box>
                <Typography variant="subtitle1">{layout.name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {layout.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Featured Content Selector Component
const FeaturedContentSelector = ({ formData, selectedFeatures, onFeaturesChange }) => {
  // Generate options based on data already in the form
  const getContentOptions = () => {
    const options = [];
    
    // Latest release
    if (formData.releases?.length > 0) {
      formData.releases.forEach((release, index) => {
        if (release.title) {
          options.push({
            id: `release-${index}`,
            type: 'release',
            title: release.title,
            description: `${release.type ? release.type.charAt(0).toUpperCase() + release.type.slice(1) : 'Release'} - ${release.releaseDate || 'Recent'}`
          });
        }
      });
    }
    
    // Merch
    if (formData.hasMerch && formData.merchUrl) {
      options.push({
        id: 'merch',
        type: 'merch',
        title: 'Merchandise',
        description: 'Your band merchandise store'
      });
    }
    
    // Looking to play shows
    if (formData.play_shows) {
      const showsStatus = {
        'yes': 'Actively seeking shows',
        'maybe': 'Selectively booking',
        'not right now': 'Currently not booking'
      };
      
      options.push({
        id: 'shows',
        type: 'shows',
        title: 'Booking Status',
        description: showsStatus[formData.play_shows] || 'Booking information'
      });
    }
    
    // Social media
    if (Object.values(formData.social_links).some(link => link)) {
      options.push({
        id: 'social',
        type: 'social',
        title: 'Social Media',
        description: 'Your social profiles'
      });
    }
    
    // Band members
    if (formData.members?.length > 0 && formData.members[0].name) {
      options.push({
        id: 'members',
        type: 'members',
        title: 'Band Members',
        description: `${formData.members.length} members`
      });
    }
    
    return options;
  };
  
  const contentOptions = getContentOptions();
  
  return (
    <Box>
      <SectionTitle variant="h6">Feature Content (Select up to 3)</SectionTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose what content to highlight on your profile
      </Typography>
      
      <List>
        {contentOptions.map((option) => (
          <ListItem key={option.id} disablePadding>
            <ListItemButton 
              onClick={() => {
                const isSelected = selectedFeatures.includes(option.id);
                let newSelected = [...selectedFeatures];
                
                if (isSelected) {
                  // Remove if already selected
                  newSelected = newSelected.filter(id => id !== option.id);
                } else if (newSelected.length < 3) {
                  // Add if not already selected and fewer than 3 items selected
                  newSelected.push(option.id);
                }
                
                onFeaturesChange(newSelected);
              }}
              selected={selectedFeatures.includes(option.id)}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: `${palette.primary.light}20`,
                  '&:hover': {
                    backgroundColor: `${palette.primary.light}30`,
                  }
                }
              }}
            >
              <ListItemIcon>
                {option.type === 'release' && <AlbumIcon color="secondary" />}
                {option.type === 'merch' && <StoreIcon color="secondary" />}
                {option.type === 'shows' && <EventIcon color="secondary" />}
                {option.type === 'social' && <MusicNoteIcon color="secondary" />}
                {option.type === 'members' && <MicIcon color="secondary" />}
              </ListItemIcon>
              <ListItemText 
                primary={option.title} 
                secondary={option.description} 
              />
              {selectedFeatures.includes(option.id) && (
                <Chip 
                  size="small" 
                  color="primary" 
                  icon={<CheckIcon />} 
                  label="Featured" 
                  variant="outlined"
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {contentOptions.length === 0 && (
        <Alert severity="info">
          Add releases, merchandise, or other content in previous steps to select featured content.
        </Alert>
      )}
      
      {selectedFeatures.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Features ({selectedFeatures.length}/3)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedFeatures.map(id => {
              const option = contentOptions.find(opt => opt.id === id);
              return option ? (
                <Chip 
                  key={id} 
                  label={option.title}
                  onDelete={() => {
                    const newSelected = selectedFeatures.filter(item => item !== id);
                    onFeaturesChange(newSelected);
                  }}
                  color="primary"
                  variant="outlined"
                />
              ) : null;
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Background Image Selector Component
const BackgroundImageSelector = ({ backgroundImage, onImageChange, backgroundPattern, onPatternChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Predefined patterns
  const patternOptions = [
    { id: 'none', name: 'None', preview: 'none' },
    { id: 'dots', name: 'Dots', preview: 'radial-gradient(#ddd 2px, transparent 2px)' },
    { id: 'lines', name: 'Lines', preview: 'linear-gradient(90deg, transparent, transparent 90%, #ddd 90%, #ddd)' },
    { id: 'waves', name: 'Waves', preview: 'repeating-radial-gradient(#ddd 2px, #f5f5f5 4px, #f5f5f5 8px)' },
    { id: 'geometric', name: 'Geometric', preview: 'repeating-linear-gradient(45deg, #ddd, #ddd 5px, #f5f5f5 5px, #f5f5f5 10px)' },
    { id: 'noise', name: 'Noise', preview: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' },
  ];
  
  // Upload handler - similar to profile image upload
  const uploadToCloudinary = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append("file", file);
    formDataObj.append("upload_preset", "band_background_image_upload");

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formDataObj);
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };
  
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadToCloudinary(files[0]);
      if (uploadedUrl) {
        onImageChange(uploadedUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <Box>
      <SectionTitle variant="h6">Profile Background</SectionTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Customize your profile's background image or pattern
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>Background Image</Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          {backgroundImage ? (
            <Box sx={{ position: 'relative', mb: 2, width: '100%' }}>
              <img 
                src={backgroundImage} 
                alt="Background preview" 
                style={{ 
                  width: '100%', 
                  maxHeight: 200, 
                  objectFit: 'cover', 
                  borderRadius: 8 
                }}
              />
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)',
                  }
                }}
                onClick={() => onImageChange(null)}
              >
                <DeleteIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          ) : (
            <Box 
              sx={{ 
                width: '100%', 
                height: 100, 
                bgcolor: '#f5f5f5', 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 2,
                mb: 2,
                border: '1px dashed #ccc'
              }}
            >
              <Typography color="text.secondary">No background image</Typography>
            </Box>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
            style={{ display: 'none' }}
          />
          
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Background Image'}
          </Button>
          
          {isUploading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress}
              />
              <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
                {uploadProgress}%
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      <Box>
        <Typography variant="subtitle1" gutterBottom>Background Pattern</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select a pattern instead of or in addition to a background image
        </Typography>
        
        <Grid container spacing={2}>
          {patternOptions.map((pattern) => (
            <Grid item key={pattern.id} xs={4} sm={2}>
              <Paper 
                elevation={backgroundPattern === pattern.id ? 3 : 1}
                onClick={() => onPatternChange(pattern.id)}
                sx={{
                  p: 1, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: backgroundPattern === pattern.id ? 
                    `2px solid ${palette.primary.main}` : '2px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 40, 
                    mb: 1,
                    backgroundImage: pattern.preview,
                    backgroundSize: pattern.id === 'noise' ? 'cover' : '10px 10px',
                    borderRadius: 1,
                    position: 'relative',
                  }}
                >
                  {backgroundPattern === pattern.id && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%',
                        backgroundColor: palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CheckIcon sx={{ color: 'white', fontSize: 12 }} />
                    </Box>
                  )}
                </Box>
                <Typography variant="caption">
                  {pattern.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Note: If both a background image and pattern are selected, the pattern will overlay the image.
        </Typography>
      </Box>
    </Box>
  );
};

// Profile Badges Selector Component
const ProfileBadgesSelector = ({ selectedBadges, onBadgesChange }) => {
  // Badge options that would be available to all bands
  const badgeOptions = [
    { id: 'local-favorite', name: 'Local Favorite', icon: '🏆', description: 'Highlight your local scene presence' },
    { id: 'new-release', name: 'New Release', icon: '🎵', description: 'Show you have new music out' },
    { id: 'touring', name: 'Currently Touring', icon: '🚐', description: 'Indicate you\'re actively touring' },
    { id: 'booking', name: 'Open for Bookings', icon: '📅', description: 'Let venues know you\'re available' },
    { id: 'collab', name: 'Open to Collabs', icon: '🤝', description: 'Interested in collaborating with others' },
    { id: 'diy', name: 'DIY', icon: '🛠️', description: 'Committed to DIY ethos' },
    { id: 'indie', name: 'Independent', icon: '🔖', description: 'Proudly independent artist' },
    { id: 'fresh', name: 'Fresh Talent', icon: '✨', description: 'New to the scene' },
  ];
  
  return (
    <Box>
      <SectionTitle variant="h6">Profile Badges</SectionTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select badges to display on your profile (up to 3)
      </Typography>
      
      <Grid container spacing={2}>
        {badgeOptions.map((badge) => (
          <Grid item key={badge.id} xs={12} sm={6} md={4}>
            <Paper 
              elevation={selectedBadges.includes(badge.id) ? 3 : 1}
              onClick={() => {
                const isSelected = selectedBadges.includes(badge.id);
                let newSelected = [...selectedBadges];
                
                if (isSelected) {
                  // Remove if already selected
                  newSelected = newSelected.filter(id => id !== badge.id);
                } else if (newSelected.length < 3) {
                  // Add if not already selected and fewer than 3 badges selected
                  newSelected.push(badge.id);
                }
                
                onBadgesChange(newSelected);
              }}
              sx={{
                p: 2, 
                cursor: 'pointer',
                border: selectedBadges.includes(badge.id) ? 
                  `2px solid ${palette.primary.main}` : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                }
              }}
            >
              <Box 
                sx={{ 
                  fontSize: 28, 
                  mr: 2, 
                  width: 40, 
                  height: 40, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '50%',
                  bgcolor: selectedBadges.includes(badge.id) ? `${palette.primary.light}20` : 'transparent',
                }}
              >
                {badge.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1">{badge.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {badge.description}
                </Typography>
              </Box>
              
              {selectedBadges.includes(badge.id) && (
                <Box 
                  sx={{ 
                    ml: 'auto', 
                    mr: 0, 
                    bgcolor: palette.primary.main, 
                    color: 'white',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {selectedBadges.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1">Selected Badges:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {selectedBadges.map(id => {
              const badge = badgeOptions.find(b => b.id === id);
              return badge ? (
                <Chip 
                  key={id} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 8 }}>{badge.icon}</span>
                      {badge.name}
                    </Box>
                  }
                  onDelete={() => {
                    const newSelected = selectedBadges.filter(item => item !== id);
                    onBadgesChange(newSelected);
                  }}
                  color="primary"
                />
              ) : null;
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Custom URL Slug Component
const CustomUrlSlug = ({ bandName, slug, onSlugChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customSlug, setCustomSlug] = useState(slug);
  const [error, setError] = useState('');
  
  const validateSlug = (value) => {
    if (!value.trim()) {
      return 'URL slug cannot be empty';
    }
    
    if (value.length < 3) {
      return 'URL slug must be at least 3 characters';
    }
    
    if (!/^[a-zA-Z0-9-]+$/.test(value)) {
      return 'URL slug can only contain letters, numbers, and hyphens';
    }
    
    return '';
  };
  
  const handleSlugChange = (e) => {
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setCustomSlug(newSlug);
    setError(validateSlug(newSlug));
  };
  
  const handleSave = () => {
    const validationError = validateSlug(customSlug);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onSlugChange(customSlug);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setCustomSlug(slug);
    setError('');
    setIsEditing(false);
  };
  
  return (
    <Box>
      <SectionTitle variant="h6">Custom Profile URL</SectionTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Customize your band's URL to create a memorable web address
      </Typography>
      
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            tcupboard.org/
          </Typography>
          
          {isEditing ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}>
              <TextField
                value={customSlug}
                onChange={handleSlugChange}
                error={!!error}
                helperText={error}
                size="small"
                placeholder="your-band-name"
                sx={{ flexGrow: 1 }}
              />
              <Button 
                onClick={handleSave} 
                disabled={!!error}
                sx={{ ml: 1 }}
                variant="contained"
                color="primary"
                size="small"
              >
                Save
              </Button>
              <Button 
                onClick={handleCancel}
                sx={{ ml: 1 }}
                size="small"
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <>
              <Typography 
                variant="body1" 
                fontWeight="bold"
                sx={{ 
                  color: palette.primary.main,
                  mr: 2
                }}
              >
                {slug || bandName.toLowerCase().replace(/[^a-z0-9-]/g, '')}
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => setIsEditing(true)}
              >
                Customize
              </Button>
            </>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This will be the web address you can share with fans and promoters. 
          Choose something simple, memorable, and easy to type.
        </Typography>
      </Paper>
    </Box>
  );
};

// Main Profile Customization Component
const ProfileCustomization = ({ formData, updateFormData }) => {
  return (
    <StepContainer>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Customize Your Profile
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Make your band profile unique with these customization options.
            These settings will help your profile stand out and be more shareable.
          </Alert>
          
          <CustomUrlSlug 
            bandName={formData.name || ''}
            slug={formData.customSlug || ''}
            onSlugChange={(newSlug) => updateFormData({ customSlug: newSlug })}
          />
          
          <Divider sx={{ my: 4 }} />
          
          <ColorThemeSelector 
            selectedTheme={formData.profileTheme || 'default'} 
            onThemeChange={(theme) => updateFormData({ profileTheme: theme })}
          />
          
          <Divider sx={{ my: 4 }} />
          
          <HeaderLayoutSelector 
            selectedLayout={formData.headerLayout || 'classic'} 
            onLayoutChange={(layout) => updateFormData({ headerLayout: layout })}
          />
          
          <Divider sx={{ my: 4 }} />
          
          <FeaturedContentSelector 
            formData={formData}
            selectedFeatures={formData.featuredContent || []} 
            onFeaturesChange={(features) => updateFormData({ featuredContent: features })}
          />
          
          <Divider sx={{ my: 4 }} />
          
          <BackgroundImageSelector 
            backgroundImage={formData.backgroundImage} 
            onImageChange={(image) => updateFormData({ backgroundImage: image })}
            backgroundPattern={formData.backgroundPattern || 'none'} 
            onPatternChange={(pattern) => updateFormData({ backgroundPattern: pattern })}
          />
          
          <Divider sx={{ my: 4 }} />
          
          <ProfileBadgesSelector 
            selectedBadges={formData.profileBadges || []} 
            onBadgesChange={(badges) => updateFormData({ profileBadges: badges })}
          />
          
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f8f8', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Preview how your customizations will look
            </Typography>
            <Typography variant="body2" color="text.secondary">
              These settings will be applied to your band profile once you submit the form.
              You can always come back and update them later.
            </Typography>
          </Box>
        </Box>
      </Fade>
    </StepContainer>
  );
};

ProfileCustomization.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired
};

export default ProfileCustomization;