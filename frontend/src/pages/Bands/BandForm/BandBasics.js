import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Paper,
  Fade,
  Divider,
  Alert,
  Zoom
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import ProfileImageAdjuster from "../../../components/ProfileImageAdjuster";
import colorTokens from "../../../styles/colors/palette";

// Styled components
const StepContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  '& .MuiTextField-root': {
    marginBottom: theme.spacing(3),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: colorTokens.primary.dark,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: colorTokens.primary.main,
    borderRadius: 2,
  }
}));

const PreviewCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  backgroundColor: '#f8f8f8',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: `linear-gradient(to right, ${colorTokens.primary.main}, ${colorTokens.secondary.main})`,
  }
}));

const BandBasics = ({ formData, updateFormData }) => {
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const [profileUploadProgress, setProfileUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file, preset, isProfile = false) => {
    const formDataObj = new FormData();
    formDataObj.append("file", file);
    formDataObj.append("upload_preset", preset);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setProfileUploadProgress(progress);
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

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    
    // Show preview after user starts filling out form
    if (!showPreview && value.length > 0) {
      setTimeout(() => setShowPreview(true), 500);
    }
  };

  // Character count indicator style based on remaining characters
  const getCharCountColor = (current, max) => {
    const percentage = current / max;
    if (percentage < 0.7) return "success.main";
    if (percentage < 0.9) return "warning.main";
    return "error.main";
  };

  return (
    <StepContainer>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Let's Start With The Basics
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This is the foundation of your band profile. A good name, engaging bio, and professional image 
            will help fans discover and connect with your music.
          </Alert>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Box>
                <SectionTitle variant="h6">Band Identity</SectionTitle>
                
                <TextField
                  label="Band Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  helperText="This is how fans will find you on our platform"
                />
                
                <TextField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  fullWidth
                  required
                  helperText="City, State or Region where you're based"
                />
                
                <TextField
                  label="Year Formed"
                  name="yearFormed"
                  value={formData.yearFormed}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., 2020"
                  helperText="When did your project start?"
                />
                
                <Divider sx={{ my: 3 }} />
                
                <SectionTitle variant="h6">Tell Your Story</SectionTitle>
                
                <TextField
                  label="Origin Story"
                  name="originStory"
                  value={formData.originStory}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="How did your band form? What's the story behind your name?"
                  helperText={`${formData.originStory.length}/300 characters`}
                  FormHelperTextProps={{ 
                    sx: { color: getCharCountColor(formData.originStory.length, 300) } 
                  }}
                  inputProps={{ maxLength: 300 }}
                />
                
                <TextField
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  multiline
                  rows={5}
                  fullWidth
                  placeholder="Share your band's story, influences, and what makes you unique..."
                  helperText={`${formData.bio.length}/1000 characters`}
                  FormHelperTextProps={{ 
                    sx: { color: getCharCountColor(formData.bio.length, 1000) } 
                  }}
                  inputProps={{ maxLength: 1000 }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <SectionTitle variant="h6" align="center" sx={{ alignSelf: 'flex-start', mb: 3 }}>
                  Profile Image
                </SectionTitle>
                
                <ProfileImageAdjuster
                  initialImage={formData.profile_image}
                  onSave={async (file) => {
                    try {
                      setIsProfileUploading(true);
                      const uploadedUrl = await uploadToCloudinary(file, "band_profile_image_upload", true);
                      if (uploadedUrl) {
                        updateFormData({ profile_image: uploadedUrl });
                      }
                    } catch (error) {
                      console.error('Upload error:', error);
                      alert('Failed to upload image. Please try again.');
                    } finally {
                      setIsProfileUploading(false);
                      setProfileUploadProgress(0);
                    }
                  }}
                  onDelete={() => updateFormData({ profile_image: null })}
                  isUploading={isProfileUploading}
                  uploadProgress={profileUploadProgress}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  This image will be your band's primary visual identity across the platform.
                  Best dimensions are 500x500 pixels.
                </Typography>
              </Box>
              
              <Zoom in={showPreview} style={{ transitionDelay: showPreview ? '300ms' : '0ms' }}>
                <PreviewCard elevation={3}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Profile Preview
                  </Typography>
                  
                  <Box sx={{ mt: 1, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={formData.profile_image || "https://via.placeholder.com/60?text=Band"}
                      alt="Band preview"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        mr: 2,
                        border: `2px solid ${colorTokens.primary.light}`
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {formData.name || "Your Band Name"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.location || "Location"} • {formData.yearFormed ? `Est. ${formData.yearFormed}` : "Year"}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      fontStyle: 'italic',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {formData.originStory || "Your band's origin story will appear here..."}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {formData.bio || "Your band's bio will appear here..."}
                  </Typography>
                </PreviewCard>
              </Zoom>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </StepContainer>
  );
};

BandBasics.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired
};

export default BandBasics;