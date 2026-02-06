// src/pages/User/Components/EditableField.js
import React, { useState } from 'react';
import {
  Box, Grid, Typography, TextField, IconButton,
  Fade, InputAdornment, CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Check as CheckIcon, 
  Close as CloseIcon 
} from '@mui/icons-material';

const EditableField = ({ 
  value, 
  onChange, 
  onSave, 
  onCancel, 
  isEditing, 
  setIsEditing, 
  isLoading, 
  error, 
  label, 
  icon,
  placeholder, 
  maxLength,
  multiline = false,
  rows = 1,
  helperText = null,
  canEdit = true
}) => {
  const [hover, setHover] = useState(false);
  
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: '100%',
        transition: 'all 0.2s ease',
        borderRadius: 1,
        p: 1.5,
        '&:hover': canEdit && !isEditing ? { 
          bgcolor: 'rgba(0,0,0,0.02)',
        } : {},
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Grid container spacing={1} alignItems="center">
        {icon && (
          <Grid item>
            <Box sx={{ 
              color: 'primary.main', 
              display: 'flex', 
              alignItems: 'center',
              opacity: 0.7
            }}>
              {icon}
            </Box>
          </Grid>
        )}
        
        <Grid item xs>
          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                display: 'block', 
                mb: 0.5
              }}
            >
              {label}
            </Typography>
            
            {isEditing ? (
              <TextField
                value={value}
                onChange={onChange}
                size="small"
                fullWidth
                error={!!error}
                helperText={error || (maxLength ? `${value.length}/${maxLength}` : helperText)}
                inputProps={{ maxLength }}
                disabled={isLoading}
                autoFocus
                multiline={multiline}
                rows={rows}
                placeholder={placeholder}
                variant="outlined"
                InputProps={{ 
                  sx: { borderRadius: 1 },
                  endAdornment: isLoading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={16} />
                    </InputAdornment>
                  ) : null
                }}
              />
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: value ? 400 : 300,
                  fontStyle: value ? 'normal' : 'italic',
                  color: value ? 'text.primary' : 'text.secondary',
                  minHeight: multiline ? '3.5rem' : 'auto',
                  wordBreak: 'break-word',
                  lineHeight: 1.5
                }}
              >
                {value || placeholder}
              </Typography>
            )}
          </Box>
        </Grid>
        
        {canEdit && (
          <Grid item sx={{ ml: 'auto' }}>
            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <IconButton 
                  color="primary" 
                  size="small" 
                  onClick={onSave} 
                  disabled={isLoading}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    p: 0.8,
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={onCancel}
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider',
                    p: 0.8
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Fade in={hover}>
                <IconButton 
                  size="small" 
                  onClick={() => setIsEditing(true)}
                  sx={{ 
                    color: 'primary.main',
                    p: 0.8,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    opacity: 0.7,
                    '&:hover': { 
                      opacity: 1, 
                      bgcolor: 'primary.main',
                      color: 'white'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EditableField;