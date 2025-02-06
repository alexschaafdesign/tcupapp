import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import VideoPlayer from '../components/VideoPlayer';
import ContentModal from '../components/ContentModal';

const ContentBox = ({ item, onClick }) => (
    <Box 
      onClick={() => onClick(item)}
      sx={{ 
        mb: 3,
        bgcolor: 'black',
        borderRadius: 1,
        overflow: 'hidden',
        aspectRatio: '1/1',
        position: 'relative',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.9
        }
      }}
    >
      {item.type === 'video' ? (
        <VideoPlayer src={item.src} poster={item.poster} />
      ) : (
        <img
          src={item.src}
          alt={item.alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', position: 'absolute', bottom: 0, width: '100%' }}>
        <Typography variant="h6">{item.title}</Typography>
      </Box>
    </Box>
  );
  

const LandingPage2 = () => {
  const content = [
    { 
      type: 'video',
      src: 'https://res.cloudinary.com/dsll3ms2c/video/upload/v1736177186/Snapinsta.app_video_AQPzX3EjBD8u1ewOVMoE_LShcO7zvGLkiIA017HjoGwg-bfvxq__SMa8yIs8odUOF2nuw-1M_vEaN3SRBO5j5uo2l_mMwM-MtxS2JlQ_ofacr8.mp4',
      poster: 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1736177451/Screenshot_2025-01-06_at_9.30.44_AM_vfj5yt.png',
      title: 'Live Shows'
    },
    { 
      type: 'photo',
      src: 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1736176646/Screenshot_2025-01-06_at_9.01.07_AM_wdxzws.png',
      alt: 'Local venue',
      title: 'Iconic Venues'
    },
    { 
      type: 'video',
      src: 'https://res.cloudinary.com/dsll3ms2c/video/upload/v1736177265/Snapinsta.app_video_AQPwlsQz6ByKbkget92gSeodWrsYcHdHfuhdjd1JHHwx2fpcDEh8FjRCIBP4-FWZF3rJ2Xdvdih8PHi2aygffnN-U_qgL9SrV48emww_pixugv.mp4',
      poster: '/api/placeholder/800/600',
      title: 'Artist Performances'
    },
    { 
      type: 'photo',
      src: 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1736176969/TCUP_Open_Meeting_Instagram_Post_dkziph.jpg',
      alt: 'Concert crowd',
      title: 'Community'
    }
  ];

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h2" sx={{ mb: 3 }}>Minneapolis Music Scene</Typography>
        <Typography variant="h4" sx={{ mb: 4 }}>Your Gateway to Local Music Culture</Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          size="large"
          sx={{ mb: 6 }}
        >
          Explore Shows
        </Button>

        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          maxWidth: '90%',
          mx: 'auto'
        }}>
          {/* Left Column - Videos */}
          <Box sx={{ width: '60%' }}>
            {content.filter(item => item.type === 'video').map((item, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 3,
                  bgcolor: 'black',
                  borderRadius: 1,
                  overflow: 'hidden',
                  aspectRatio: '9/16',
                  position: 'relative',
                  width: '100%'
                }}
              >
                <VideoPlayer src={item.src} poster={item.poster} />
                <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', position: 'absolute', bottom: 0, width: '100%' }}>
                  <Typography variant="h6">{item.title}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Right Column - Photos */}
          <Box sx={{ width: '40%' }}>
            {content.filter(item => item.type === 'photo').map((item, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 3,
                  bgcolor: 'black',
                  borderRadius: 1,
                  overflow: 'hidden',
                  aspectRatio: '1/1',
                  position: 'relative'
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', position: 'absolute', bottom: 0, width: '100%' }}>
                  <Typography variant="h6">{item.title}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2 }}>Join the Conversation</Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Connect with local music lovers, discover new artists, and stay updated with the latest shows.
          </Typography>
          <Button variant="contained" color="secondary" size="large">
            Visit Our Forum
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage2;