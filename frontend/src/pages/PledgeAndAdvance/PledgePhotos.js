import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container,
  Grid,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Modal,
  Button,
  useTheme
} from '@mui/material';
import { 
  Close as CloseIcon,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material';
import { useInView } from 'react-intersection-observer';

const PledgePhotos = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalImages, setTotalImages] = useState(0);
  const theme = useTheme();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Infinite scroll detection
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const fetchImages = useCallback(async (cursor = null) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        perPage: '30',
        ...(cursor && { nextCursor: cursor }),
      });

      const response = await fetch(`${apiUrl}/images/pledge-photos?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const data = await response.json();
      
      setImages(prev => cursor ? [...prev, ...data.images] : data.images);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
      setTotalImages(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Initial load
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchImages(nextCursor);
    }
  }, [inView, hasMore, loading, fetchImages, nextCursor]);

  const openModal = (index) => {
    setSelectedImage(images[index]);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null);
    setCurrentIndex(null);
    document.body.style.overflow = 'unset';
  };

  const navigateImage = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      setSelectedImage(images[newIndex]);
      setCurrentIndex(newIndex);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          navigateImage(-1);
          break;
        case 'ArrowRight':
          navigateImage(1);
          break;
        case 'Escape':
          closeModal();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, currentIndex]);

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
            TCUP Power Pledge Signers
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: '800px', mx: 0 }}>
            These are the performers who have signed the TCUP Power Pledge, 
            committing to fair compensation and better working conditions in the Minneapolis music scene. 
            Each signature represents a voice for positive change in our community.
          </Typography>
          {totalImages > 0 && (
            <Typography variant="h3" sx={{ color: 'primary.main' }}>
              {totalImages} pledges and counting!
            </Typography>
          )}
        </Box>
        {totalImages > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {images.length} of {totalImages} signatures
          </Typography>
        )}
        
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              key={image.id}
            >
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: image.orientation === 'vertical' ? '150%' : '100%',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: 1,
                  backgroundColor: 'grey.100',
                  '&:hover img': {
                    transform: 'scale(1.05)',
                  }
                }}
                onClick={() => openModal(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease-in-out'
                  }}
                  loading="lazy"
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Loading indicator */}
        <Box 
          ref={ref} 
          display="flex" 
          justifyContent="center" 
          py={4}
        >
          {loading && <CircularProgress />}
        </Box>
      </Container>

      {/* Modal */}
      <Modal
        open={Boolean(selectedImage)}
        onClose={closeModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.9)'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
          onClick={closeModal}
        >
          {/* Close button */}
          <IconButton
            sx={{
              position: 'absolute',
              top: theme.spacing(2),
              right: theme.spacing(2),
              color: 'white'
            }}
            onClick={closeModal}
          >
            <CloseIcon />
          </IconButton>

          {/* Navigation buttons */}
          {currentIndex > 0 && (
            <IconButton
              sx={{
                position: 'absolute',
                left: theme.spacing(2),
                color: 'white'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigateImage(-1);
              }}
            >
              <NavigateBefore />
            </IconButton>
          )}
          {currentIndex < images.length - 1 && (
            <IconButton
              sx={{
                position: 'absolute',
                right: theme.spacing(2),
                color: 'white'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigateImage(1);
              }}
            >
              <NavigateNext />
            </IconButton>
          )}

          {/* Full size image */}
          {selectedImage && (
            <img
              src={selectedImage.fullSizeUrl}
              alt={selectedImage.alt}
              style={{
                maxHeight: '90vh',
                maxWidth: '90vw',
                objectFit: 'contain'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

export default PledgePhotos;