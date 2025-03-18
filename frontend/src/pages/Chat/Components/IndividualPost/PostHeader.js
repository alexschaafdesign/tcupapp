// PostHeader.js
import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
      <Typography variant={isMobile ? "h5" : "h4"}>
        {post.title}
      </Typography>

      {/* Only show actions in header for desktop view */}
      {!isMobile && (
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
  );
};

export default PostHeader;