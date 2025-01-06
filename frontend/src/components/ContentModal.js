// ContentModal.js
import React from 'react';
import { Modal, Box } from '@mui/material';
import VideoPlayer from './VideoPlayer';

const ContentModal = ({ open, onClose, content }) => {
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '90vw',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 0,
    outline: 'none',
    overflow: 'hidden',
    borderRadius: 1
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="content-modal"
    >
      <Box sx={modalStyle}>
        {content.type === 'video' ? (
          <Box sx={{ width: 'auto', height: 'auto' }}>
            <VideoPlayer 
              src={content.src} 
              poster={content.poster}
              autoPlay={false}
            />
          </Box>
        ) : (
          <img
            src={content.src}
            alt={content.alt}
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              display: 'block'
            }}
          />
        )}
      </Box>
    </Modal>
  );
};

export default ContentModal;
