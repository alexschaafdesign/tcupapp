import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ProfileImageAdjuster = ({ 
  initialImage, 
  onSave, 
  onDelete,
  isUploading,
  uploadProgress
}) => {
  const [currentImage, setCurrentImage] = useState(initialImage);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setCurrentImage(initialImage);
  }, [initialImage]);

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      onSave(e.target.files[0]);
      e.target.value = '';
      setCurrentImage(null);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ 
        display: 'inline-block',
        position: 'relative',
        width: 200,
        height: 200,
        borderRadius: '50%',
        border: '2px solid #ccc',
        overflow: 'hidden'
      }}>
        <img
          src={currentImage || "/api/placeholder/200/200"}
          alt="Profile"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: currentImage ? 'transparent' : '#f0f0f0',
          }}
        />

        {currentImage && (
          <IconButton
            onClick={onDelete}
            sx={{ 
              position: 'absolute',
              top: -8,
              right: -8,
              padding: '4px',
              color: 'error.light',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              },
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}

        {isUploading && (
          <Box sx={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            p: 1
          }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <Typography 
        variant="body2" 
        sx={{ 
          mt: 1,
          cursor: 'pointer',
          color: 'primary.main',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {currentImage ? 'Change profile image' : 'Upload profile image'}
      </Typography>
    </Box>
  );
};

export default ProfileImageAdjuster;