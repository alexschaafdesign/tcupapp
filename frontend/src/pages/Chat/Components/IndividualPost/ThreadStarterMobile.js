// ThreadStarterMobile.js
import React from 'react';
import { Paper, Box, Avatar, Typography } from '@mui/material';
import palette from '../../../../styles/colors/palette';
import ImageAttachmentsGrid from './ImageAttachmentsGrid';

const ThreadStarterMobile = ({
  post,
  hasImages,
  renderContent,
  navigateToUserProfile
}) => {
  return (
    <Paper
      elevation={0}
      sx={{ mb: 1 }}
    >
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

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={post.avatar_url} 
            alt={post.username || 'User'} 
            sx={{ width: 40, height: 40, mr: 1.5, cursor: 'pointer' }} 
            onClick={navigateToUserProfile}
          />
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={navigateToUserProfile}
            >
              {post.username || 'Anonymous'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {post.tagline || []}
            </Typography>
          </Box>
        </Box>

        {renderContent(post.content)}
        {hasImages && <ImageAttachmentsGrid images={post.images} />}
      </Box>
    </Paper>
  );
};

export default ThreadStarterMobile;