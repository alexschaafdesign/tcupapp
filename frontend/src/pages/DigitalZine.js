import React, { useState, useEffect } from 'react';
import { Box, Container, CircularProgress, IconButton, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const DigitalZine = () => {
  // Your image URLs
  const pages = [
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220832/COVER_ifyfyo.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220831/PAGE_1_k73im1.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220831/PAGE_2_fl8vqa.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220832/PAGE_3_vhwhen.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220832/PAGE_4_qzbnno.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220831/PAGE_5_read45.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220830/PAGE_6_nuftrf.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220830/PAGE_7_pfcrfk.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220831/PAGE_8_x8ksme.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220832/PAGE_9_awdyzx.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220831/PAGE_10_xbs7ue.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220831/PAGE_11_dbptgz.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220831/PAGE_12_er7uka.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1744220832/BACK_COVER_xvhwkp.jpg",
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [idleTimer, setIdleTimer] = useState(null);

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      // Preload current page
      const img = new Image();
      img.src = pages[currentPage];
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [currentPage]: true }));
      };

      // Preload next page
      if (currentPage < pages.length - 1) {
        const nextImg = new Image();
        nextImg.src = pages[currentPage + 1];
        nextImg.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [currentPage + 1]: true }));
        };
      }

      // Preload previous page
      if (currentPage > 0) {
        const prevImg = new Image();
        prevImg.src = pages[currentPage - 1];
        prevImg.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [currentPage - 1]: true }));
        };
      }
    };

    preloadImages();
  }, [currentPage, pages]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const showControls = () => {
      setControlsVisible(true);
      if (idleTimer) clearTimeout(idleTimer);
      
      // Hide controls after 3 seconds of inactivity
      const timer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
      
      setIdleTimer(timer);
    };

    // Show controls on any mouse movement or touch
    document.addEventListener('mousemove', showControls);
    document.addEventListener('touchstart', showControls);
    
    return () => {
      document.removeEventListener('mousemove', showControls);
      document.removeEventListener('touchstart', showControls);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [idleTimer]);

  const toggleFullscreen = () => {
    const element = document.documentElement;

    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }

    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setNextPage(currentPage + 1);
      setFlipDirection('forward');
      setIsFlipping(true);
      
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setNextPage(currentPage - 1);
      setFlipDirection('backward');
      setIsFlipping(true);
      
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isFlipping]);

  // Handle swipe gestures for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNextPage();
    }
    
    if (isRightSwipe) {
      goToPreviousPage();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Newsletter signup link - positioned OUTSIDE the zine container */}
      <Box
        component="a"
        href="https://secure.everyaction.com/xGrCCCak6EWC-liPxFFvEg2"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          bgcolor: 'rgba(102, 51, 153, 0.8)', // Purple background
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 1,
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 'medium',
          mb: 2, // Margin bottom to separate from zine
          display: 'inline-block',
          transition: 'background-color 0.3s',
          '&:hover': {
            bgcolor: 'rgba(102, 51, 153, 1)', // Darker on hover
            textDecoration: 'none'
          }
        }}
      >
        Sign up to receive TCUP's newsletter by email
      </Box>
      
      <Container 
        maxWidth={false} 
        disableGutters 
        className="digital-zine-container"
      sx={{
        height: '85vh', // Increased to give more vertical space
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
        cursor: controlsVisible ? 'default' : 'none',
        p: 0, // Remove all padding
        m: 0, // Remove all margins
        mt: 1, // Minimal top margin
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Book container - Expanded to minimize whitespace */}
      <Box
        sx={{
          width: '100%', // Take up full width of container
          maxWidth: '1000px', // Increased maximum width
          height: '100%',
          position: 'relative',
          perspective: '2000px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
          margin: 0,
        }}
      >
        {/* Loading indicator */}
        {!imagesLoaded[currentPage] && (
          <Box 
            sx={{
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              zIndex: 5
            }}
          >
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        )}

        {/* Page with expanded dimensions to fill the container */}
        <Box
          className={isFlipping ? `page-flip ${flipDirection}` : ''}
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            // Removed outer box shadow to avoid double shadow effect
            // Apply page flip styles depending on animation state
            transform: 'rotateY(0deg)',
            transformOrigin: flipDirection === 'forward' ? 'left center' : 'right center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // Remove any potential padding that creates whitespace
            p: 0,
          }}
        >
          {/* Current page - expanded to fill the available space */}
          <Box
            component="img"
            src={pages[currentPage]}
            alt={`Digital zine page ${currentPage + 1}`}
            sx={{
              width: '100%', // Fill the entire width
              height: '100%', // Fill the entire height
              objectFit: 'contain',
              backgroundColor: 'transparent',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)', // Add shadow to make it look like a page
              borderRadius: 0,
              backfaceVisibility: isFlipping ? 'hidden' : 'visible',
              opacity: imagesLoaded[currentPage] ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Next page (for flip animation) */}
          {isFlipping && nextPage !== null && (
            <Box
              component="img"
              src={pages[nextPage]}
              alt={`Digital zine page ${nextPage + 1}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: 'transparent',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                borderRadius: 0,
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                opacity: imagesLoaded[nextPage] ? 1 : 0,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Controls overlay - fade in/out based on activity */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: controlsVisible ? 'auto' : 'none',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: controlsVisible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Top bar with just fullscreen button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            padding: 1,
          }}
        >
          <IconButton 
            onClick={toggleFullscreen}
            sx={{
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>

        {/* Navigation buttons - positioned at the edges of the content */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'space-between',
            px: 1, // Minimal padding to keep buttons slightly off the edge
          }}
        >
          <IconButton 
            onClick={goToPreviousPage}
            disabled={currentPage === 0 || isFlipping}
            sx={{
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              },
              opacity: currentPage === 0 ? 0.3 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          
          <IconButton 
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1 || isFlipping}
            sx={{
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              },
              opacity: currentPage === pages.length - 1 ? 0.3 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        {/* Page counter - moved up slightly to avoid potential cutoff */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: 1,
            mb: 1, // Added margin to lift it up slightly
          }}
        >
          <Box
            sx={{
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              minWidth: '60px',
              display: 'flex',
              justifyContent: 'center',
              fontSize: '0.8rem',
            }}
          >
            <Typography variant="caption">
              {currentPage + 1} / {pages.length}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* CSS for page turning animations */}
      <style jsx global>{`
        .page-flip {
          transition: transform 0.5s ease-in-out;
        }
        
        .page-flip.forward {
          animation: flipForward 0.6s ease-in-out;
        }
        
        .page-flip.backward {
          animation: flipBackward 0.6s ease-in-out;
        }
        
        @keyframes flipForward {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }
        
        @keyframes flipBackward {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
        
        /* Hide scrollbars and ensure full viewport usage */
        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        
        /* Make sure the container maximizes available space */
        .digital-zine-container {
          box-sizing: border-box;
          max-width: 100%;
        }
      `}</style>
    </Container>
    </Box>
  );
};

export default DigitalZine;