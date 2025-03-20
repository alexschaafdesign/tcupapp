// PostHeader.js
import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History'; // Add this import
import palette from '../../../styles/colors/palette';

const PostHeader = ({ 
  post,
  isMobile,
  isThreadStarter,
  canEditPost,
  canDelete,
  handleLocalEditClick,
  setDeleteDialogOpen,
  navigateToUserProfile
}) => {
  if (!isThreadStarter) return null;

  // Check if this is an imported post
  const isImported = post.is_imported === true;
  
  // Format date for display
  const getDateDisplay = () => {
    // For imported posts, use the imported_date directly
    if (isImported && post.imported_date) {
      return post.imported_date;
    }
    
    // For regular posts, return formatted date
    try {
      const dateObj = new Date(post.created_at);
      return dateObj.toLocaleString();
    } catch (e) {
      return ''; // Fallback if date parsing fails
    }
  };

  return (
    <Box 
      sx={{
        bgcolor: palette.secondary.main, 
        color: palette.neutral.black,
        px: 2,
        py: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant={isMobile ? "h5" : "h4"}>
          {post.title}
        </Typography>
        
        {/* Add icon for imported posts */}
        {isImported && (
          <Tooltip title="Imported from previous forum">
            <HistoryIcon sx={{ ml: 2, fontSize: isMobile ? '1.5rem' : '2rem' }} />
          </Tooltip>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Add date display */}
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {getDateDisplay()}
        </Typography>

        {/* Only show actions in header for desktop view and non-imported posts */}
        {!isMobile && !isImported && (
          <Box sx={{ display: 'flex' }}>
            {canEditPost && (
              <Tooltip title="Edit Thread">
                <IconButton 
                  onClick={handleLocalEditClick}
                  sx={{ color: palette.warning.main }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {canDelete && (
              <Tooltip title="Delete Thread">
                <IconButton 
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ color: palette.error.main }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PostHeader;