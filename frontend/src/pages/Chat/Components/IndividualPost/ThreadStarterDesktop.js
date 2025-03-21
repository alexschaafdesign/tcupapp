import React from 'react';
import { Paper, Box, Avatar, Typography, Link, Tooltip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import palette from '../../../../styles/colors/palette';
import PostHeader from '../PostHeader';
import ImageAttachmentsGrid from '../ImageAttachmentsGrid';
const ThreadStarterDesktop = ({
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
  // Check if this is an imported post (but only hide actions, not styling)
  const isImported = post.is_imported === true;

  const avatarSrc = isImported
  ? post.avatar_url // or post.imported_avatar_url directly
  : post.avatar_url;  
  // Get the appropriate author name
  const authorName = isImported 
    ? post.imported_author_name 
    : (post.author || post.username || 'User');
      
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        transition: 'background-color 0.3s ease',
        scrollMarginTop: '100px',
        overflow: 'hidden',
      }}
    >
      {/* Thread starter header */}
      <PostHeader 
        post={post} 
        isMobile={false} 
        isThreadStarter={true}
        canEditPost={canEditPost} // Allow editing for admins regardless of import status
        canDelete={canDelete} // Allow deletion for admins regardless of import status
        handleLocalEditClick={handleLocalEditClick}
        setDeleteDialogOpen={setDeleteDialogOpen}
        navigateToUserProfile={navigateToUserProfile}
      />

      <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'background.paper', minHeight: 120 }}>
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
            src={avatarSrc} 
            alt={authorName} 
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
            {authorName}
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
          <Box sx={{ mt: 0.5, width: '100%', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {renderContent(post.content)}
            
            {hasImages && <ImageAttachmentsGrid images={post.images} />}
          </Box>

          {/* Bottom Row: Like/Reply/Edit/Delete */}
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
              
              {/* Add Edit button */}
              {canEditPost && (
                <Tooltip title="Edit Thread">
                  <IconButton 
                    size="small" 
                    onClick={handleLocalEditClick}
                    sx={{ ml: 1, p: 0, color: palette.warning.main }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Delete button for admins or post owner */}
              {canDelete && (
                <Tooltip title="Delete Thread">
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ ml: 1, p: 0, color: palette.error.main  }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ThreadStarterDesktop;