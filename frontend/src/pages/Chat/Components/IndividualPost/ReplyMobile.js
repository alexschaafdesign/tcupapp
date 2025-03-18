// ReplyMobile.js
import React from 'react';
import { Paper, Box, Avatar, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import palette from '../../../../styles/colors/palette';
import ImageAttachmentsGrid from './ImageAttachmentsGrid';

const ReplyMobile = ({
  post,
  userHasLiked,
  hasImages,
  canDelete,
  canEditPost,
  likedUsers,
  renderContent,
  navigateToUserProfile,
  handleLikeClick,
  handleReplyClick,
  handleLocalEditClick,
  setDeleteDialogOpen,
  isHighlighted,
  replyRef
}) => {
  return (
    <Paper
      ref={isHighlighted ? replyRef : null}
      elevation={0}
      sx={{
        mb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        backgroundColor: isHighlighted ? 'rgba(124, 96, 221, 0.1)' : 'background.default',
        transition: 'background-color 0.3s ease',
        scrollMarginTop: '100px',
      }}
    >
      {/* Compact header with avatar, username, and timestamp */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}>
        <Avatar 
          src={post.avatar_url} 
          alt={post.username || 'User'} 
          sx={{ 
            width: 36, 
            height: 36, 
            mr: 1.5,
            cursor: 'pointer' 
          }}
          onClick={navigateToUserProfile} 
        />
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={navigateToUserProfile}
          >
            {post.username || 'Anonymous User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(post.created_at).toLocaleString(undefined, {
              year: '2-digit',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </Typography>
        </Box>
        
        {/* Edit button */}
        {canEditPost && (
          <IconButton 
            size="small" 
            color="primary" 
            onClick={handleLocalEditClick}
            sx={{ mx: 1, color: palette.warning.main }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        
        {/* Delete button */}
        {canDelete && (
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ color: palette.error.main }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 1.5, pt: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
        {renderContent(post.content)}
        
        {/* Display images if present */}
        {hasImages && <ImageAttachmentsGrid images={post.images} />}
      </Box>

      {/* Bottom actions */}
      <Box sx={{ 
        px: 1.5, 
        py: 1, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}>
        {/* Like count */}
        <Typography variant="caption" color="text.secondary">
          {likedUsers.length > 0 && (
            <>
              {likedUsers.length} {likedUsers.length === 1 ? 'like' : 'likes'}
            </>
          )}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography 
            variant="caption"
            sx={{
              cursor: 'pointer',
              fontWeight: userHasLiked ? 'bold' : 'normal',
              color: userHasLiked ? '#2E7D32' : 'primary.main',
            }}
            onClick={() => handleLikeClick(post.id)}
          >
            {userHasLiked ? 'Liked' : 'Like'}
          </Typography>
          <Typography 
            variant="caption" 
            color="primary" 
            sx={{ cursor: 'pointer' }}
            onClick={() => handleReplyClick(post)}
          >
            Reply
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReplyMobile;