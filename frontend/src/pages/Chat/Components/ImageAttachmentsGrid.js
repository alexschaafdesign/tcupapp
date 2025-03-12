import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Grid, Box, IconButton, Dialog } from '@mui/material';
import { ZoomIn as ZoomInIcon, Close as CloseIcon } from '@mui/icons-material';

// Image display component
const ImageAttachmentsGrid = ({ images }) => {
  const [enlargedImage, setEnlargedImage] = useState(null);
  
  if (!images || images.length === 0) return null;
  
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
              />
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