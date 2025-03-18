// ImageAttachmentsGrid.js
import React, { useState } from 'react';
import { Grid, Box, Modal } from '@mui/material';

const ImageAttachmentsGrid = ({ images }) => {
  const [openImage, setOpenImage] = useState(null);
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  const handleOpenImage = (imageUrl) => {
    setOpenImage(imageUrl);
  };

  const handleCloseImage = () => {
    setOpenImage(null);
  };

  // Calculate how many images per row based on count
  const getGridSize = (count) => {
    if (count === 1) return 12;
    if (count === 2) return 6;
    if (count === 3) return 4;
    return 3; // For 4 or more images
  };

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 2 }}>
        {images.slice(0, 4).map((image, index) => (
          <Grid item xs={6} md={getGridSize(Math.min(images.length, 4))} key={index}>
            <Box
              component="img"
              src={image}
              alt={`Attachment ${index + 1}`}
              sx={{
                width: '100%',
                height: images.length === 1 ? 'auto' : '120px',
                maxHeight: images.length === 1 ? '300px' : 'auto',
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer',
              }}
              onClick={() => handleOpenImage(image)}
            />
          </Grid>
        ))}
        {images.length > 4 && (
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                width: '100%',
                height: '120px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
              onClick={() => handleOpenImage(images[4])}
            >
              +{images.length - 4} more
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Image modal */}
      <Modal
        open={!!openImage}
        onClose={handleCloseImage}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          component="img"
          src={openImage}
          alt="Enlarged image"
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            outline: 'none',
          }}
          onClick={handleCloseImage}
        />
      </Modal>
    </>
  );
};

export default ImageAttachmentsGrid;