import React from 'react';
import palette from '../../../styles/colors/palette';
import { Box, Typography } from '@mui/material';

const PostHeader = ({ post, isMobile, isThreadStarter }) => {
  // If it's a thread starter
  if (isThreadStarter) {
    // Mobile layout for thread starter
    if (isMobile) {
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
          <Typography variant="h4">{post.title}</Typography>
        </Box>
      );
    }
    
    // Desktop layout for thread starter
    return (
      <Box sx={{ 
        bgcolor: palette.secondary.main, 
        color: palette.neutral.black,
        px: 2,
        py: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h4">{post.title}</Typography>
        <Typography variant="body2" sx={{ color: palette.text.secondary }}>
          {new Date(post.created_at).toLocaleString()}
        </Typography>
      </Box>
    );
  }
  
  // For replies
  if (isMobile) {
    // Mobile layout for replies
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}>
        {/* Mobile reply header content would go here */}
        {/* You should pass avatar, username and navigateToUserProfile as props */}
      </Box>
    );
  }
  
  // Desktop layout for replies
  return (
    <Box sx={{ 
      width: '100%', 
      borderBottom: '1px solid', 
      borderColor: 'divider', 
      mb: 1, 
      position: 'relative', 
      top: '-6px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      <Typography variant="caption" color="text.secondary">
        {new Date(post.created_at).toLocaleString()}
      </Typography>
      
      {/* Edit/Delete buttons should be included here */}
      {/* You should pass canEditPost, canDelete, handleLocalEditClick, setDeleteDialogOpen as props */}
    </Box>
  );
};

export default PostHeader;