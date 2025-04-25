import React, { useState, useEffect } from 'react';
import { Box, Container, CircularProgress, IconButton, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const DigitalZine3 = () => {
  // Your image URLs
  const pages = [
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618860/ISSUE_3_-_COVER_vgycje.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618858/ISSUE_3_-_PAGE_1_-_INTRO_sl1bdr.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618862/ISSUE_3_-_PAGE_2_-_KUWT_zntilj.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618862/ISSUE_3_-_PAGE_3_-_KUWT_xd5gcz.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618863/ISSUE_3_-_PAGE_4_-_KUWT_saegva.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618863/ISSUE_3_-_PAGE_5_-_KUWT_b3i4a2.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618863/ISSUE_3_-_PAGE_6_-_KUWT_j79z0z.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618863/ISSUE_3_-_PAGE_7_-_KUWT_b40ykv.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618858/ISSUE_3_-_PAGE_8_-_TITN_fac2o2.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618858/ISSUE_3_-_PAGE_9_xjguy2.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618858/ISSUE_3_-_PAGE_10_-TITN_opb4fy.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618858/ISSUE_3_-_PAGE_11_-_TITN_f0a3wa.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618858/ISSUE_3_-_PAGE_12_-_TITN_zbx1bs.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618859/ISSUE_3_-_PAGE_13_-_OTR_it69ur.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618861/ISSUE_3_PAGE_-_14_-_OTR_y2udvu.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618859/ISSUE_3_-_PAGE_15_-_OTR_iw0gen.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618859/ISSUE_3_-_PAGE_16_-_OTR_qmsekk.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618859/ISSUE_3_-_PAGE_17_khf3bw.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618859/issue_3_-_page_18_-_OTR_ubibyh.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618860/ISSUE_3_-_PAGE_19_-_OTR_tol6lj.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618860/ISSUE_3_-_PAGE_20_-_OTR_xig3gi.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618860/ISSUE_3_-_PAGE_21_jfp2md.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618861/ISSUE_3_-_PAGE_22_gscvxa.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618861/ISSUE_3_-_PAGE_23_czvd2q.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618861/ISSUE_3_-_PAGE_24_pffqbr.jpg",
    "https://res.cloudinary.com/dsll3ms2c/image/upload/v1745618864/ISSUE_3_-_PAGE_25_khpuip.jpg",
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
      const indicesToLoad = [currentPage];
      if (currentPage > 0) indicesToLoad.push(currentPage - 1);
      if (currentPage < pages.length - 1) indicesToLoad.push(currentPage + 1);

      indicesToLoad.forEach(index => {
        if (!imagesLoaded[index]) {
          const img = new Image();
          img.src = pages[index];
          img.onload = () => {
            setImagesLoaded(prev => ({ ...prev, [index]: true }));
          };
          // Optional: handle image loading errors
          // img.onerror = () => console.error(`Failed to load image: ${pages[index]}`);
        }
      });
    };

    preloadImages();
    // Only re-run when currentPage changes, pages array assumed stable
  }, [currentPage, pages, imagesLoaded]); // Added imagesLoaded dependency for robustness


  // Auto-hide controls after inactivity
  useEffect(() => {
    let timer = null; // Use let instead of state for timer ID

    const showControls = () => {
      setControlsVisible(true);
      if (timer) clearTimeout(timer);

      // Hide controls after 3 seconds of inactivity
      timer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    };

    // Show controls immediately on mount and reset timer
    showControls();

    // Add event listeners
    document.addEventListener('mousemove', showControls);
    document.addEventListener('touchstart', showControls);
    document.addEventListener('keydown', showControls); // Added keydown to reset timer

    return () => {
      // Cleanup listeners and timer
      document.removeEventListener('mousemove', showControls);
      document.removeEventListener('touchstart', showControls);
      document.removeEventListener('keydown', showControls);
      if (timer) clearTimeout(timer);
    };
  }, []); // Run once on mount

  // Fullscreen toggle function
  const toggleFullscreen = () => {
    const element = document.documentElement; // Target the whole page

    if (!document.fullscreenElement) {
      // Request fullscreen
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`));
      } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) { // Chrome, Safari & Opera
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari & Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
    }
    // Note: setIsFullscreen is handled by the event listener below
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari, Chrome
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);    // Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);   // IE/Edge

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []); // Run once on mount

  // Navigation functions
  const goToNextPage = React.useCallback(() => { // Wrap in useCallback
    if (currentPage < pages.length - 1 && !isFlipping) {
      setNextPage(currentPage + 1);
      setFlipDirection('forward');
      setIsFlipping(true);

      setTimeout(() => {
        setCurrentPage(prev => prev + 1); // Use functional update
        setIsFlipping(false);
        setNextPage(null); // Reset nextPage after flip completes
      }, 600); // Match animation duration
    }
  }, [currentPage, pages.length, isFlipping]);

  const goToPreviousPage = React.useCallback(() => { // Wrap in useCallback
    if (currentPage > 0 && !isFlipping) {
      setNextPage(currentPage - 1);
      setFlipDirection('backward');
      setIsFlipping(true);

      setTimeout(() => {
        setCurrentPage(prev => prev - 1); // Use functional update
        setIsFlipping(false);
        setNextPage(null); // Reset nextPage after flip completes
      }, 600); // Match animation duration
    }
  }, [currentPage, isFlipping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keypresses if an input field is focused, etc.
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
          return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault(); // Prevent browser back navigation if zine is embedded
        goToPreviousPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'f') { // Changed from Ctrl+F to just 'f' for simplicity
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousPage, goToNextPage]); // Add dependencies

  // Handle swipe gestures for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50; // Minimum distance for a swipe

  const handleTouchStart = (e) => {
    setTouchEnd(null); // Reset touch end ensure calculations are fresh
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return; // Need both start and end points

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextPage();
    } else if (isRightSwipe) {
      goToPreviousPage();
    }
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    // Outer Box - Ensures component takes full width and acts as a flex container
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      minHeight: '100vh', // Ensures the background covers the full viewport height at least
      py: 2 // Add some vertical padding to the whole page area
    }}>

      {/* Newsletter signup link */}
      <Box
        component="a"
        href="https://secure.everyaction.com/xGrCCCak6EWC-liPxFFvEg2"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          bgcolor: 'rgba(102, 51, 153, 0.8)',
          color: 'white',
          px: 2, py: 1,
          borderRadius: 1,
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 'medium',
          mb: 1.5, // Adjusted margin for tighter spacing
          display: 'inline-block',
          transition: 'background-color 0.3s',
          '&:hover': {
            bgcolor: 'rgba(102, 51, 153, 1)',
            textDecoration: 'none'
          }
        }}
      >
        Sign up to receive TCUP's newsletter by email
      </Box>

      {/* Main Zine Container */}
      <Container
        maxWidth={false} // Control width via the inner Box
        disableGutters
        className="digital-zine-container"
        sx={{
          // Removed fixed height and overflow:hidden to allow natural sizing and page scroll
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start', // Align zine to top
          bgcolor: 'transparent',
          position: 'relative', // For absolute positioning of controls
          userSelect: 'none',
          cursor: controlsVisible ? 'default' : 'none',
          p: 0, m: 0,
          flexGrow: 1, // Allow container to take up space
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Book container - Controls max width and holds pages */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '1000px', // Adjust as needed for desired width/tightness
            aspectRatio: 'auto', // Let image determine aspect ratio
            position: 'relative', // For perspective and loading indicator
            perspective: '2000px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0, margin: 0,
            mb: 2, // Add some margin below the zine image area
          }}
        >
          {/* Loading indicator */}
          {/* Show loader only if the *current* page isn't loaded */}
          {!imagesLoaded[currentPage] && (
            <Box
              sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 5,
                // backgroundColor: 'rgba(255, 255, 255, 0.5)', // Optional subtle background
              }}
            >
              <CircularProgress sx={{ color: 'primary.main' }} /> {/* Use theme color */}
            </Box>
          )}

          {/* Page container (handles flip animation) */}
          <Box
            className={isFlipping ? `page-flip ${flipDirection}` : ''}
            sx={{
              width: '100%',
              height: 'auto', // Height determined by content
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: 'rotateY(0deg)',
              transformOrigin: flipDirection === 'forward' ? 'left center' : 'right center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 0,
            }}
          >
            {/* Current page image */}
            <Box
              component="img"
              src={pages[currentPage]}
              alt={`Digital zine page ${currentPage + 1}`}
              sx={{
                display: 'block', // Remove extra space below image
                width: '100%',
                height: 'auto', // Allow height to scale with aspect ratio
                maxHeight: '85vh', // Constrain max height to prevent excessive tallness
                objectFit: 'contain', // Ensure entire image is visible
                backgroundColor: 'transparent',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // Page shadow
                borderRadius: '2px', // Slight rounding
                // Show only when loaded and not currently flipping away
                opacity: imagesLoaded[currentPage] && (!isFlipping || flipDirection !== 'forward') ? 1 : 0,
                transition: 'opacity 0.3s ease',
                backfaceVisibility: 'hidden', // Hide back during flip
              }}
            />

            {/* Next page (for flip animation) - Render only when flipping */}
            {isFlipping && nextPage !== null && (
              <Box
                component="img"
                // Preload handled by useEffect, load image source directly
                src={pages[nextPage]}
                alt={`Digital zine page ${nextPage + 1}`}
                sx={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  maxHeight: '85vh', // Apply same max height
                  objectFit: 'contain',
                  backgroundColor: 'transparent',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  borderRadius: '2px',
                  position: 'absolute', // Overlay for flip effect
                  top: 0, left: 0,
                  backfaceVisibility: 'hidden', // Only front is visible
                  // Determine initial rotation based on flip direction
                  transform: flipDirection === 'forward' ? 'rotateY(180deg)' : 'rotateY(-180deg)',
                  // Show only when loaded and flipping towards this page
                  opacity: imagesLoaded[nextPage] ? 1 : 0,
                  transition: 'opacity 0.1s ease', // Faster opacity transition for reveal
                }}
              />
            )}
          </Box>
        </Box>

        {/* Controls overlay - Adapts to container size */}
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: controlsVisible ? 'auto' : 'none',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between', // Space out top/bottom controls
            alignItems: 'center', // Center items horizontally like page counter
            opacity: controlsVisible ? 1 : 0,
            transition: 'opacity 0.3s ease',
            p: 1, // Padding inside the overlay for all controls
          }}
        >
          {/* Top bar (Fullscreen button) - Aligned to top-right */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              onClick={toggleFullscreen}
              size="small"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              sx={{
                bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>

          {/* Navigation buttons (Prev/Next) - Vertically centered, horizontally spaced */}
          <Box
            sx={{
              position: 'absolute', // Position within the overlay Box
              top: '50%',
              left: '10px', // Small offset from edge
              right: '10px',// Small offset from edge
              transform: 'translateY(-50%)', // Center vertically
              width: 'calc(100% - 20px)', // Span width minus offsets
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <IconButton
              onClick={goToPreviousPage}
              disabled={currentPage === 0 || isFlipping}
              size="small"
              aria-label="Previous page"
              sx={{
                bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                opacity: currentPage === 0 || isFlipping ? 0.3 : 1, // Dim when disabled
                transition: 'opacity 0.3s ease',
              }}
            >
              <ArrowBackIosNewIcon fontSize="inherit" />
            </IconButton>

            <IconButton
              onClick={goToNextPage}
              disabled={currentPage === pages.length - 1 || isFlipping}
              size="small"
              aria-label="Next page"
              sx={{
                bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                opacity: currentPage === pages.length - 1 || isFlipping ? 0.3 : 1, // Dim when disabled
                transition: 'opacity 0.3s ease',
              }}
            >
              <ArrowForwardIosIcon fontSize="inherit" />
            </IconButton>
          </Box>

          {/* Page counter - Aligned to bottom-center */}
          <Box // Wrapper ensures it stays at the bottom due to parent's justify-content: space-between
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%', // Take full width to center inner box
            }}
          >
            <Box // The actual counter element
              sx={{
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                px: 1.5, py: 0.5,
                borderRadius: 1,
                minWidth: '50px',
                display: 'flex',
                justifyContent: 'center',
                fontSize: '0.75rem',
              }}
            >
              <Typography variant="caption" sx={{ color: 'inherit', fontSize: 'inherit' }}>
                {currentPage + 1} / {pages.length}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Global CSS for page turning animations and body scroll */}
        {/* Using React's standard style tag for global styles */}
        <style>{`
          .page-flip {
            transition: transform 0.6s ease-in-out; /* Match timeout duration */
          }
          .page-flip.forward {
            animation: flipForward 0.6s ease-in-out forwards; /* Use forwards to keep end state */
          }
          .page-flip.backward {
            animation: flipBackward 0.6s ease-in-out forwards; /* Use forwards to keep end state */
          }
          @keyframes flipForward {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(-180deg); }
          }
          @keyframes flipBackward {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(180deg); }
          }

          /* Allow body to scroll if needed, reset margins */
          body {
            margin: 0;
            padding: 0;
            /* overflow-x: hidden; /* Optional: If you only want vertical scroll */
          }

          /* Ensure container uses standard box model */
          .digital-zine-container {
            box-sizing: border-box;
          }
        `}</style>
      </Container>
    </Box>
  );
};

export default DigitalZine3;