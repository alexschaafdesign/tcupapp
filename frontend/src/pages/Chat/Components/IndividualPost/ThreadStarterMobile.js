// ThreadStarterMobile.js

import React from 'react';
import { 
  Paper, 
  Box, 
  Avatar, 
  Typography, 
  Tooltip, 
  IconButton, 
  Link 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import palette from '../../../../styles/colors/palette';
import ImageAttachmentsGrid from '../ImageAttachmentsGrid';

const ThreadStarterMobile = ({
  post,
  userHasLiked,
  hasImages,
  canDelete,
  canEditPost,
  likedUsers,
  renderContent,
  navigateToUserProfile,
  navigateToOtherUserProfile,
  handleLikeClick,
  handleReplyClick,
  handleLocalEditClick,
  setDeleteDialogOpen
}) => {
  // Determine if this is an imported post
  const isImported = post.is_imported === true;
  
  // Derive the correct avatar src
  const avatarSrc = isImported
  ? post.avatar_url // or post.imported_avatar_url directly
  : post.avatar_url;

  // Derive the correct author name
  const authorName = isImported 
    ? post.imported_author_name 
    : (post.author 
       || (post.auth0_id?.startsWith('google-oauth2|') 
           ? (post.name || post.email?.split('@')[0] || 'Google User') 
           : 'User'));

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Title bar at top */}
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
        <Typography variant="h5" sx={{ fontWeight: 600, mr: 1 }}>
          {post.title}
        </Typography>
        {/* If you want actions (edit/delete) up here for the thread starter, 
            you can add them. Otherwise, keep it just a title. */}
      </Box>

      {/* Main content */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        {/* Author row */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={avatarSrc} 
            alt={authorName} 
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
              {authorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {post.tagline || ''}
            </Typography>
          </Box>
        </Box>

        {/* Post content (Rich Text / Quill / etc.) */}
        <Box sx={{ mb: 2 }}>
          {renderContent(post.content)}
        </Box>

        {/* Images, if present */}
        {hasImages && (
          <Box sx={{ mb: 2 }}>
            <ImageAttachmentsGrid images={post.images} />
          </Box>
        )}

        {/* Bottom row: Liked-by, Like, Reply, Edit, Delete */}
        <Box 
          sx={{ 
            mt: 'auto',
            pt: 1, 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1
          }}
        >
          {/* Liked-by info */}
          {likedUsers.length > 0 && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Liked by{' '}
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
              {likedUsers.length > 2 && (
                <> and {likedUsers.length - 2} others</>
              )}
            </Typography>
          )}

          {/* Action row (Like/Reply/Edit/Delete) */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-start', 
              gap: 3 
            }}
          >
            {/* Like */}
            <Typography 
              variant="caption"
              sx={{
                cursor: 'pointer',
                fontWeight: userHasLiked ? 'bold' : 'normal',
                color: userHasLiked ? '#2E7D32' : 'primary.main',
                transition: 'color 0.2s ease-in-out, fontWeight 0.2s ease-in-out',
                '&:hover': { textDecoration: 'underline' },
                width: '45px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
              onClick={() => handleLikeClick(post.id)}
            >
              {userHasLiked ? 'Liked' : 'Like'}
            </Typography>

            {/* Reply */}
            <Typography 
              variant="caption" 
              color="primary" 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { textDecoration: 'underline' } 
              }}
              onClick={() => handleReplyClick(post)}
            >
              Reply
            </Typography>

            {/* Edit button (admin or owner) */}
            {canEditPost && (
              <Tooltip title="Edit Thread">
                <IconButton 
                  size="small" 
                  onClick={handleLocalEditClick}
                  sx={{ p: 0, color: palette.warning.main }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Delete button (admin or owner) */}
            {canDelete && (
              <Tooltip title="Delete Thread">
                <IconButton 
                  size="small"
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ p: 0, color: palette.error.main }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ThreadStarterMobile;