import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  IconButton,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { LinearProgress } from '@mui/material';

const ProfileImageAdjuster = ({ 
  initialImage, 
  onSave, 
  onDelete, 
  isUploading, 
  uploadProgress,
  onTransformSave 
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [currentImage, setCurrentImage] = useState(initialImage);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const startEditing = () => {
    setIsEditing(true);
  };

    // Sync currentImage state with initialImage prop
    useEffect(() => {
      setCurrentImage(initialImage);
    }, [initialImage]);

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      onSave(e.target.files[0]);
      e.target.value = '';
  
      // Remove the File object and wait for Cloudinary URL
      setCurrentImage(null);
      setIsEditing(true);
    }
  };

  const getTransformedUrl = (url) => {
    if (!url) return "/api/placeholder/200/200";

    const parsedUrl = new URL(url);
    const searchParams = new URLSearchParams(parsedUrl.search);

    // Check if url already has transformations
    if (searchParams.has('c_fill')) {
      return url; // Return as-is if already transformed
    }

    const size = Math.round(400 * transform.zoom);

    searchParams.set('c_fill', '');
    searchParams.set('g_center', '');
    searchParams.set('w', size.toString());
    searchParams.set('h', size.toString());
    searchParams.set('x', Math.round(imagePosition.x).toString());
    searchParams.set('y', Math.round(imagePosition.y).toString());

    parsedUrl.search = searchParams.toString();
    return parsedUrl.toString();
  };

  const handleTransformSave = () => {
    if (!isEditing) return;
  
    const transformedUrl = getTransformedUrl(currentImage);
    const transformInfo = {
      zoom: transform.zoom,
      x: imagePosition.x,
      y: imagePosition.y,
    };
  
    // Call the parent callback to save transform data
    onTransformSave(transformedUrl, transformInfo);
  
    // Update the local state
    setCurrentImage(transformedUrl);
    setIsEditing(false);
    setTransform({ x: 0, y: 0, zoom: 1 });
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (!currentImage) return;
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    if (!currentImage) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - imagePosition.x,
      y: touch.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setImagePosition({ x: newX, y: newY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setImagePosition({ x: newX, y: newY });
    e.preventDefault(); // Prevent scrolling while dragging
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Main Image Display */}
      <Box 
        ref={containerRef}
        sx={{ 
          display: 'inline-block',
          position: 'relative',
          cursor: isEditing ? 'move' : 'default',
          overflow: 'hidden',
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '2px solid #ccc',
        }}
      >
        <img
          ref={imageRef}
          src={getTransformedUrl(currentImage)}
          alt="Profile"
          style={{
            width: `${200 * transform.zoom}px`,
            height: `${200 * transform.zoom}px`,
            objectFit: 'cover',
            backgroundColor: currentImage ? 'transparent' : '#f0f0f0',
            cursor: isEditing ? 'move' : 'default',
            userSelect: 'none',
            transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
            transformOrigin: 'center center',
          }}
          onMouseDown={isEditing ? handleMouseDown : undefined}
          onTouchStart={isEditing ? handleTouchStart : undefined}
          draggable={false}
        />

        {/* Delete Button */}
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

        {/* Upload Progress */}
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

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

     {/* Edit mode UI */}
     {isEditing ? (
        <>
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
            Upload a new image
          </Typography>

          <Box sx={{ mt: 2, px: 2, maxWidth: 300, margin: '0 auto' }}>
            <Slider
              value={transform.zoom}
              onChange={(e, value) => setTransform(prev => ({ ...prev, zoom: value }))}
              min={1}
              max={2}
              step={0.1}
              sx={{ mb: 2 }}
            />
          </Box>

          <Typography 
            variant="body2" 
            sx={{ 
              cursor: 'pointer',
              color: 'primary.main',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={handleTransformSave}
          >
            Save changes
          </Typography>
        </>
      ) : (
        /* Non-edit mode UI */
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
          onClick={() => {
            if (currentImage) {
              startEditing();
            } else {
              fileInputRef.current?.click();
            }
          }}
        >
          Edit your profile image
        </Typography>
      )}
    </Box>
  );
};

export default ProfileImageAdjuster;