// ReplyDesktop.js
import React from 'react';
import { Paper, Box, Avatar, Typography, Link, Tooltip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import palette from '../../../../styles/colors/palette';
import ImageAttachmentsGrid from './ImageAttachmentsGrid';

const ReplyDesktop = ({
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
      <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'background.default', minHeight: 120 }}>
        {/* Left Side: Avatar + Username */}
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
            src={post.avatar_url} 
            alt={post.username || post.name || 'User'} 
            sx={{ 
              width: 60, 
              height: 60,
              cursor: 'pointer'
            }}
            onClick={navigateToUserProfile}
          />
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
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={navigateToUserProfile}
          >
            {post.username || post.name || post.email || 'User'}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'gray',
              textAlign: 'center',
              mt: 0.5 
            }}
          >
            {post.tagline || []}
          </Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minHeight: 120 }}>
          <Box sx={{ width: '100%', borderBottom: '1px solid', borderColor: 'divider', mb: 1, position: 'relative', top: '-6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.created_at).toLocaleString()}
            </Typography>
            
            <Box sx={{ display: 'flex' }}>
              {/* Add Edit button */}
              {canEditPost && (
                <Tooltip title="Edit">
                  <IconButton 
                    size="small" 
                    onClick={handleLocalEditClick}
                    sx={{ ml: 1, color: palette.warning.main }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Delete button */}
              {canDelete && (
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ ml: 1, color: palette.error.main }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 0.5, width: '100%', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {renderContent(post.content)}
            
            {hasImages && <ImageAttachmentsGrid images={post.images} />}
          </Box>

          {/* Bottom Row: Like/Reply */}
          <Box sx={{ pt: 1, mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box sx={{ flexGrow: 1 }}>
              {likedUsers.length > 0 && (
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
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography 
                variant="caption"
                sx={{
                  cursor: 'pointer',
                  fontWeight: userHasLiked ? 'bold' : 'normal',
                  color: userHasLiked ? '#2E7D32' : 'primary.main',
                  transition: 'color 0.2s ease-in-out, font-weight 0.2s ease-in-out',
                  '&:hover': { textDecoration: 'underline' },
                  width: '45px',
                  display: 'inline-block',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
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
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReplyDesktop;