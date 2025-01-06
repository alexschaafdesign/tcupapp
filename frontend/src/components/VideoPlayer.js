import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';

const VideoPlayer = ({ src, poster }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef();

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!videoRef.current.paused);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        preload="metadata"
        onPlay={handlePlayPause}
        onPause={handlePlayPause}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
      {!isPlaying && (
        <Box
          onClick={handlePlayClick}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.8)'
            }
          }}
        >
          <Box
            sx={{
              width: 0,
              height: 0,
              borderTop: '20px solid transparent',
              borderBottom: '20px solid transparent',
              borderLeft: '30px solid white',
              marginLeft: '5px'
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;