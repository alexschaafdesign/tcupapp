import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import palette from '../../../../styles/colors/palette';

const PostFooter = ({
  post,
  isImported = false,
  userHasLiked = false,
  likedUsers = [],
  handleLikeClick,
  handleReplyClick,
  navigateToOtherUserProfile,
  isMobile = false
}) => {
  return (
    <Box sx={{ 
      pt: 1, 
      mt: 'auto', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      width: '100%',
      px: isMobile ? 1.5 : 0,
      py: isMobile ? 1 : 0,
      borderTop: isMobile ? '1px solid' : 'none',
      borderColor: 'divider'
    }}>
      <Box sx={{ flexGrow: 1 }}>
        {!isImported && likedUsers.length > 0 && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Liked by{" "}
            {likedUsers.slice(0, 2).map((user, index) => (
              <React.Fragment key={user.id}>
                <Link 
                  sx={{ 
                    textDecoration: "none", 
                    fontWeight: "bold",
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' } 
                  }}
                  onClick={() => navigateToOtherUserProfile(user.id)}
                >
                  {user.username}
                </Link>
                {index < Math.min(likedUsers.length - 1, 1) ? ", " : ""}
                {index === 0 && likedUsers.length === 2 ? " and " : ""}
              </React.Fragment>
            ))}
            {likedUsers.length > 2 && <> and {likedUsers.length - 2} others</>}
          </Typography>
        )}
        
        {isImported && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Transferred post from previous forum
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: isMobile ? 3 : 2 }}>
        {!isImported && (
          <>
            <Typography 
              variant="caption"
              sx={{
                cursor: 'pointer',
                fontWeight: userHasLiked ? 'bold' : 'normal',
                color: userHasLiked ? '#2E7D32' : 'primary.main',
                transition: 'color 0.2s ease-in-out, font-weight 0.2s ease-in-out',
                '&:hover': { textDecoration: 'underline' },
                ...(isMobile ? {} : {
                  width: '45px',
                  display: 'inline-block',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                })
              }}
              onClick={() => handleLikeClick(post.id)}
            >
              {userHasLiked ? 'Liked' : 'Like'}
            </Typography>
            <Typography 
              variant="caption" 
              color="primary" 
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => handleReplyClick(post)}
            >
              Reply
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PostFooter;