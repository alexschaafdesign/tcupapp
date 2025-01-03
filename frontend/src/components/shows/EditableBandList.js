import React, { useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Paper,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

const EditableBandList = ({ bands, onChange }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBands = [...bands];
    const draggedBand = newBands[draggedIndex];
    newBands.splice(draggedIndex, 1);
    newBands.splice(index, 0, draggedBand);
    
    onChange(newBands);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditValue(bands[index].name);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      const newBands = bands.map((band, index) => 
        index === editingIndex ? { ...band, name: editValue.trim() } : band
      );
      onChange(newBands);
    }
    setEditingIndex(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  const removeBand = (index) => {
    const newBands = bands.filter((_, i) => i !== index);
    onChange(newBands);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {bands.map((band, index) => (
        <Paper
          key={index}
          elevation={draggedIndex === index ? 0 : 1}
          sx={{
            opacity: draggedIndex === index ? 0.5 : 1,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.02)'
            }
          }}
        >
          <Box
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              gap: 1
            }}
          >
            <IconButton 
              size="small"
              sx={{ cursor: 'move', color: 'action.active' }}
            >
              <DragIndicatorIcon />
            </IconButton>
            
            {editingIndex === index ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <TextField
                  value={editValue}
                  onChange={handleEditChange}
                  onKeyDown={handleKeyPress}
                  onBlur={saveEdit}
                  autoFocus
                  size="small"
                  fullWidth
                  sx={{ mr: 1 }}
                />
              </Box>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box component="span" sx={{ flex: 1, px: 1 }}>
                  {band.name}
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => startEditing(index)}
                    sx={{ color: 'primary.main' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removeBand(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default EditableBandList;