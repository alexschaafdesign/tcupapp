import React from 'react';
import { Box, Container, CircularProgress } from '@mui/material';

const ImageDisplayPage = () => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setError(true);
    setImageLoaded(true); // Remove loading state even if there's an error
  };

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'white',
        overflow: 'hidden'
      }}
    >
      {!imageLoaded && (
        <Box 
          sx={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      )}
      
      {!error ? (
        <Box
          component="img"
          src="https://res.cloudinary.com/dsll3ms2c/image/upload/kiernan_test_ufirde.jpg" // Replace with your image path
          alt="Full page display"
          sx={{
            maxWidth: '100%',
            maxHeight: '100vh',
            objectFit: 'contain',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <Box 
          sx={{ 
            color: 'black',
            textAlign: 'center',
            p: 2 
          }}
        >
          Unable to load image
        </Box>
      )}
    </Container>
  );
};

export default ImageDisplayPage;