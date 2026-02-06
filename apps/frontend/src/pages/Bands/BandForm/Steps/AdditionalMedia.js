import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Paper,
  Fade,
  Alert,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Zoom
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ImageIcon from '@mui/icons-material/Image';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import InfoIcon from '@mui/icons-material/Info';
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

const ImageCard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .image-actions': {
      opacity: 1,
    }
  }
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '100%', // 1:1 Aspect ratio
}));

const StyledImage = styled('img')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

const ImageActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'space-between',
  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  className: 'image-actions',
}));

const UploadZone = styled(Paper)(({ theme, isdragactive }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  borderStyle: 'dashed',
  borderWidth: 2,
  borderRadius: theme.spacing(2),
  borderColor: isdragactive === 'true' ? palette.primary.main : theme.palette.divider,
  backgroundColor: isdragactive === 'true' ? `${palette.primary.light}10` : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: palette.primary.main,
    backgroundColor: `${palette.primary.light}05`,
  }
}));

const AdditionalMedia = ({ formData, updateFormData }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append("file", file);
    formDataObj.append("upload_preset", "band_other_images_upload");

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
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

  // Handle image files selection
  const handleImageSelect = async (files) => {
    if (!files || files.length === 0) return;

    // Check max images limit
    if (formData.other_images.length + files.length > 10) {
      alert(`You can upload a maximum of 10 images. You can add ${10 - formData.other_images.length} more.`);
      return;
    }

    setIsUploading(true);
    try {
      const filesToUpload = Array.from(files);
      
      // Initialize progress for each file
      const initialProgress = {};
      filesToUpload.forEach(file => {
        initialProgress[file.name] = 0;
      });
      setUploadProgress(initialProgress);
      
      // Upload all files
      const uploadPromises = filesToUpload.map(file => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Filter out nulls (failed uploads)
      const successfulUrls = uploadedUrls.filter(url => url !== null);
      
      if (successfulUrls.length > 0) {
        updateFormData({
          other_images: [...formData.other_images, ...successfulUrls]
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload one or more images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  // Handle click on upload zone
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    handleImageSelect(e.target.files);
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    const updatedImages = formData.other_images.filter((_, i) => i !== index);
    updateFormData({ other_images: updatedImages });
  };

  // Handle preview image click
  const handlePreviewClick = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  // Handle close preview
  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageSelect(e.dataTransfer.files);
    }
  };

  return (
    <StepContainer>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Additional Media
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Upload additional photos to showcase your band's visual identity. 
            These will be displayed in a gallery on your profile page.
          </Alert>
          
          <SectionTitle variant="h6">
            Band Photos
            <Tooltip 
              title="Upload high-quality photos that represent your band's style and image. 
                    These could include live performance shots, professional promo photos, 
                    or behind-the-scenes images."
              placement="right"
            >
              <InfoIcon fontSize="small" sx={{ ml: 1, color: palette.primary.light, cursor: 'help' }} />
            </Tooltip>
          </SectionTitle>
          
          <Typography variant="body1" gutterBottom>
            Upload up to 10 additional images for your band gallery 
            <Typography component="span" color="text.secondary" variant="body2" sx={{ ml: 1 }}>
              ({formData.other_images.length}/10 uploaded)
            </Typography>
          </Typography>
          
          {formData.other_images.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                {formData.other_images.map((imageUrl, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                      <ImageCard elevation={3}>
                        <ImageContainer>
                          <StyledImage src={imageUrl} alt={`Band image ${index + 1}`} />
                          <ImageActions className="image-actions">
                            <IconButton 
                              size="small" 
                              sx={{ color: 'white' }}
                              onClick={() => handlePreviewClick(imageUrl)}
                            >
                              <FullscreenIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              sx={{ color: 'white' }}
                              onClick={() => handleRemoveImage(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ImageActions>
                        </ImageContainer>
                      </ImageCard>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {formData.other_images.length < 10 && (
            <Box sx={{ mt: 3, mb: 4 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
              
              <UploadZone
                isdragactive={isDragActive.toString()}
                onClick={handleUploadClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <Box>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                      Uploading Images...
                    </Typography>
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <Box key={fileName} sx={{ width: '100%', mb: 1, maxWidth: 400, mx: 'auto' }}>
                        <Typography variant="caption">{fileName}</Typography>
                        <LinearProgress variant="determinate" value={progress} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box>
                    <AddPhotoAlternateIcon sx={{ fontSize: 48, color: palette.primary.main, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Drag & Drop Images Here
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      or click to browse your files
                    </Typography>
                  </Box>
                )}
              </UploadZone>
            </Box>
          )}
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tips for Great Band Photos
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <ImageIcon sx={{ mr: 1, verticalAlign: 'middle', color: palette.primary.main }} />
                    Do Include:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    <li>High-quality performance photos</li>
                    <li>Professional promotional shots</li>
                    <li>Group photos that show all members</li>
                    <li>Images that represent your band's style</li>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <DeleteIcon sx={{ mr: 1, verticalAlign: 'middle', color: palette.error.main }} />
                    Avoid:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    <li>Low-resolution or blurry images</li>
                    <li>Non-band related personal photos</li>
                    <li>Heavily filtered images</li>
                    <li>Photos with dated appearances</li>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            These photos will be displayed in a gallery on your band profile. Fans, venue bookers, 
            and other bands will use these images to get a sense of your style and performance energy.
          </Typography>
          
          {/* Image Preview Dialog */}
          <Dialog 
            open={Boolean(previewImage)} 
            onClose={handleClosePreview}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Image Preview</DialogTitle>
            <DialogContent>
              {previewImage && (
                <Box 
                  component="img" 
                  src={previewImage}
                  alt="Preview"
                  sx={{ 
                    width: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePreview}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </StepContainer>
  );
};

AdditionalMedia.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired
};

export default AdditionalMedia;