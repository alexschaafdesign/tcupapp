import React from 'react';
import { Box, Avatar, Typography, Tooltip, IconButton } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import EmailIcon from '@mui/icons-material/Email'; // Import the email icon


const PostUser = ({ 
  post, 
  isImported = false, 
  size = "medium", 
  navigateToUserProfile,
  showTagline = true,
  onSendDM  // Add this new prop for handling DM clicks
}) => {
  // Determine sizes based on the size prop
  const avatarSizes = {
    small: { width: 36, height: 36 },
    medium: { width: 50, height: 50 },
    large: { width: 60, height: 60 }
  };
  
  const avatarSize = avatarSizes[size] || avatarSizes.medium;
  
  // Extract user data
  const avatarSrc = post.avatar_url;
  const authorName = isImported 
    ? post.imported_author_name 
    : (post.author || post.name || post.username || post.email || 'User');
  
  // Handler for user profile navigation with error prevention
  const handleProfileClick = () => {
    if (isImported) return; // Don't navigate for imported posts
    if (typeof navigateToUserProfile === 'function') {
      navigateToUserProfile();
    } else {
      console.warn('navigateToUserProfile is not defined or not a function');
    }
  };

    // Define a handler for the DM button
    const handleSendDM = (e) => {
      e.stopPropagation();
      console.log("DM icon clicked in PostUser");
      if (typeof onSendDM === 'function') {
        console.log("onSendDM is a function, calling it");
        onSendDM(post);
      } else {
        console.log("onSendDM is not a function", onSendDM);
      }
    };
    
  const ActionIcons = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mt: 0.5, 
      justifyContent: size === 'large' ? 'center' : 'flex-start'
    }}>
      <Tooltip title="Send direct message">
        <IconButton 
          size="small" 
          onClick={handleSendDM}
          disabled={isImported} // Disable for imported posts
          sx={{ 
            p: 0.5, 
            color: 'primary.main',
            opacity: isImported ? 0.5 : 1,
            '&:hover': { 
              backgroundColor: 'rgba(0, 0, 0, 0.04)' 
            } 
          }}
        >
          <EmailIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {/* Future social icons would go here */}
    </Box>
  );
  
  // Vertical layout (for sidebar)
  if (size === "large") {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: 160, 
        bgcolor: 'grey.100', 
        p: 1, 
        borderRadius: '8px 0 0 8px', 
        borderRight: '1px solid', 
        borderColor: 'divider', 
        flexShrink: 0, 
        minHeight: 120 
      }}>
        <Avatar 
          src={avatarSrc} 
          alt={authorName} 
          sx={{ 
            ...avatarSize,
            cursor: isImported ? 'default' : 'pointer',
            bgcolor: isImported ? 'grey.400' : undefined
          }}
          onClick={handleProfileClick}
        >
          {isImported && <HistoryIcon />}
        </Avatar>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 600, 
            mt: 1, 
            wordBreak: 'break-word', 
            overflowWrap: 'break-word', 
            maxWidth: '100%', 
            display: 'block',
            cursor: isImported ? 'default' : 'pointer',
            '&:hover': { textDecoration: isImported ? 'none' : 'underline' }
          }}
          onClick={handleProfileClick}
        >
          {authorName}
          {isImported && (
            <Tooltip title="Imported from previous forum">
              <HistoryIcon fontSize="small" sx={{ ml: 0.5, fontSize: '0.8rem', color: 'text.secondary' }} />
            </Tooltip>
          )}
        </Typography>
        
        {/* Add the action icons row */}
        <ActionIcons />
        
        {showTagline && post.tagline && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'gray',
              textAlign: 'center',
              mt: 0.5 
            }}
          >
            {post.tagline}
          </Typography>
        )}
      </Box>
    );
  }
  
  // Horizontal layout (for mobile/compact)
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      <Avatar
        src={avatarSrc}
        alt={authorName}
        sx={{
          ...avatarSize,
          mr: 1.5,
          cursor: isImported ? 'default' : 'pointer',
          bgcolor: isImported ? 'grey.400' : undefined
        }}
        onClick={handleProfileClick}
      >
        {isImported && <HistoryIcon fontSize="small" />}
      </Avatar>

      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            cursor: isImported ? 'default' : 'pointer',
            '&:hover': { textDecoration: isImported ? 'none' : 'underline' }
          }}
          onClick={handleProfileClick}
        >
          {authorName}
          {isImported && (
            <Tooltip title="Imported from previous forum">
              <HistoryIcon
                fontSize="small"
                sx={{ ml: 0.5, fontSize: '0.8rem', color: 'text.secondary' }}
              />
            </Tooltip>
          )}
        </Typography>
        
        {/* Add the action icons row */}
        <ActionIcons />
        
        {showTagline && post.tagline && (
          <Typography variant="caption" color="text.secondary">
            {post.tagline}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PostUser;