import React, { useState } from 'react';
import { Grid, Box, IconButton, Dialog } from '@mui/material';
import { ZoomIn as ZoomInIcon, Close as CloseIcon } from '@mui/icons-material';

const ImageAttachmentsGrid = ({ images }) => {
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});

  if (!images || images.length === 0) return null;

  console.log("Images array:", images);

  const handleImageLoad = (index) => {
    setLoadingStates(prev => ({...prev, [index]: false}));
  };

  const handleImageError = (image, index, e) => {
    console.error(`Image failed to load: ${image.url}`, e);
    setLoadingStates(prev => ({...prev, [index]: false}));
    
    // Try to reload with direct URL if there's a publicId
    if (image.publicId) {
      // If image has a publicId, we can try a different URL format
      const directUrl = `https://res.cloudinary.com/dsll3ms2c/image/upload/${image.publicId}`;
      e.target.src = directUrl;
    }
  };
  
  return (
    <>
      <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
        {images.map((image, index) => (
          <Grid item key={index} xs={6} sm={4} md={images.length === 1 ? 6 : 3}>
            <Box
              sx={{
                position: 'relative',
                height: 0,
                paddingTop: '75%',
                backgroundColor: '#f0f0f0',
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => setEnlargedImage(image.url)}
            >
              <img
                src={image.url}
                alt={`Post image ${index + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onLoad={() => handleImageLoad(index)}
                onError={(e) => handleImageError(image, index, e)}
              />
              {loadingStates[index] !== false && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0f0f0'
                }}>
                  Loading...
                </div>
              )}

              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Enlarged image dialog */}
      <Dialog
        open={!!enlargedImage}
        onClose={() => setEnlargedImage(null)}
        maxWidth="xl"
        PaperProps={{
          sx: { 
            bgcolor: 'rgba(0,0,0,0.9)',
            boxShadow: 'none',
            position: 'relative'
          }
        }}
      >
        <IconButton
          onClick={() => setEnlargedImage(null)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        {enlargedImage && (
          <img
            src={enlargedImage}
            alt="Enlarged post image"
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
          />
        )}
      </Dialog>
    </>
  );
};

export default ImageAttachmentsGrid;