// ReplyMobile.js
import React from 'react';
import { 
  Paper, 
  Box, 
  Avatar, 
  Typography, 
  IconButton, 
  Tooltip, 
  Link 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
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
  navigateToOtherUserProfile,
  handleLikeClick,
  handleReplyClick,
  handleLocalEditClick,
  setDeleteDialogOpen,
  isHighlighted,
  replyRef
}) => {
  // Check if this is an imported post
  const isImported = post.is_imported === true;

  // Derive the correct avatar src
  const avatarSrc = isImported
  ? post.avatar_url // or post.imported_avatar_url directly
  : post.avatar_url;

  // Get the appropriate author name
  const authorName = isImported 
    ? post.imported_author_name 
    : (post.author || post.name || post.email || 'User');

  // Get the appropriate date display
  const dateDisplay = isImported
    ? post.imported_date
    : new Date(post.created_at).toLocaleString();

  return (
    <Paper
      ref={isHighlighted ? replyRef : null}
      elevation={0}
      sx={{
        mb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        backgroundColor: isHighlighted 
          ? 'rgba(124, 96, 221, 0.1)' 
          : 'background.default',
        transition: 'background-color 0.3s ease',
        scrollMarginTop: '100px',
      }}
    >
      {/* Header Row: Avatar, Name, Date, Edit/Delete */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default'
      }}>
        <Avatar
          src={avatarSrc}
          alt={authorName}
          sx={{
            width: 36,
            height: 36,
            mr: 1.5,
            cursor: isImported ? 'default' : 'pointer',
            bgcolor: isImported ? 'grey.400' : undefined
          }}
          onClick={isImported ? undefined : navigateToUserProfile}
        >
          {/* If imported, show a HistoryIcon inside the avatar (fallback) */}
          {isImported && <HistoryIcon fontSize="small" />}
        </Avatar>

        {/* Author name and date */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: isImported ? 'default' : 'pointer',
              '&:hover': { textDecoration: isImported ? 'none' : 'underline' }
            }}
            onClick={isImported ? undefined : navigateToUserProfile}
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
          <Typography variant="caption" color="text.secondary">
            {dateDisplay}
          </Typography>
        </Box>

        {/* Only show edit/delete buttons for non-imported posts */}
        {!isImported && (
          <>
            {canEditPost && (
              <IconButton 
                size="small" 
                sx={{ mx: 1, color: palette.warning.main }}
                onClick={handleLocalEditClick}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {canDelete && (
              <IconButton 
                size="small" 
                sx={{ color: palette.error.main }}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </>
        )}
      </Box>

      {/* Reply Content */}
      <Box sx={{ p: 1.5, pt: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
        {renderContent(post.content)}

        {/* Display images if present */}
        {hasImages && <ImageAttachmentsGrid images={post.images} />}
      </Box>

      {/* Bottom Row */}
      <Box sx={{ 
        px: 1.5, 
        py: 1, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ flexGrow: 1 }}>
          {/* If imported, show a note. Otherwise, show liked-by users. */}
          {isImported ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Transferred post from previous forum
            </Typography>
          ) : (
            likedUsers.length > 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Liked by{' '}
                {likedUsers.slice(0, 2).map((user, index) => (
                  <React.Fragment key={user.id}>
                    <Link
                      sx={{
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => navigateToOtherUserProfile(user.id)}
                    >
                      {user.username}
                    </Link>
                    {index < Math.min(likedUsers.length - 1, 1) ? ', ' : ''}
                    {index === 0 && likedUsers.length === 2 ? ' and ' : ''}
                  </React.Fragment>
                ))}
                {likedUsers.length > 2 && (
                  <> and {likedUsers.length - 2} others</>
                )}
              </Typography>
            )
          )}
        </Box>

        {/* Like/Reply only for non-imported */}
        {!isImported && (
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography
              variant="caption"
              sx={{
                cursor: 'pointer',
                fontWeight: userHasLiked ? 'bold' : 'normal',
                color: userHasLiked ? '#2E7D32' : 'primary.main'
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
        )}
      </Box>
    </Paper>
  );
};

export default ReplyMobile;