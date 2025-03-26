import React from 'react';
import palette from '../../../styles/colors/palette';
import { Box, Typography, Tooltip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History'; // Add this import

const PostHeader = ({ post, isMobile, isThreadStarter }) => {
  // Check if this is an imported post
  const isImported = post.is_imported === true;
  
  // Get the appropriate date display
  const getDateDisplay = () => {
    // For imported posts, use the imported_date directly
    if (isImported && post.imported_date) {
      return post.imported_date;
    }
    
    // For regular posts, format the timestamp
    try {
      return new Date(post.created_at).toLocaleString();
    } catch (e) {
      return ''; // Fallback if date parsing fails
    }
  };

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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4">{post.title}</Typography>
            {isImported && (
              <Tooltip title="Imported from previous forum">
                <HistoryIcon sx={{ ml: 2, fontSize: '1.5rem' }} />
              </Tooltip>
            )}
          </Box>
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4">{post.title}</Typography>

        </Box>
        <Typography variant="body2" sx={{ color: palette.text.secondary }}>
          {getDateDisplay()}
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
        {isImported && post.imported_date ? post.imported_date : new Date(post.created_at).toLocaleString()}
      </Typography>
      
      {/* Edit/Delete buttons should be included here */}
      {/* You should pass canEditPost, canDelete, handleLocalEditClick, setDeleteDialogOpen as props */}
    </Box>
  );
};

export default PostHeader;