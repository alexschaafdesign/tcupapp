import React, { useRef, useState } from 'react';
import { Paper, Box, Avatar, Typography, Link, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../../hooks/useAuth';

const IndividualPost = ({ 
  post, 
  isReply,
  isThreadStarter,
  isHighlighted, 
  user, 
  handleLikeClick, 
  handleReplyClick, 
  renderContent, 
  postReactions, 
  highlightedReplyId 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const { isAdmin } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const userAuth0Id = user?.sub;
  const likedUsers = postReactions[post.id] || [];
  const userHasLiked = likedUsers.some(reaction => reaction.id === userAuth0Id);
  const replyRef = useRef(null);
  
  // Check if user can delete (is admin or post owner)
  const isPostOwner = userAuth0Id === post.auth0_id;
  const canDelete = isAdmin || isPostOwner;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`${apiUrl}/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      setDeleteDialogOpen(false);
      
      // If it's a thread (no parent_id), navigate to /chat instead of /forum
      if (!post.parent_id) {
        navigate('/chat');
      } else {
        // If it's a reply, reload the page to reflect the changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Thread starter specific styles and rendering
  if (isThreadStarter) {
    return (
      <>
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
          <Box sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            px: 2,
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">Thread Starter</Typography>
            <Typography variant="body2">
              {new Date(post.created_at).toLocaleString()}
            </Typography>
          </Box>

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
                src={post.avatar_url} 
                alt={post.username || post.name || 'User'} 
                sx={{ width: 60, height: 60 }} 
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
                  display: 'block' 
                }}
              >
                {post.username || (post.auth0_id?.startsWith('google-oauth2|') ? (post.name || post.email?.split('@')[0] || 'Google User') : 'User')}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'gray',
                  textAlign: 'center',
                  mt: 0.5
                }}
              >
                {post.tagline || (post.auth0_id?.startsWith('google-oauth2|') ? 'Google User' : 'Member')}
              </Typography>
            </Box>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minHeight: 120 }}>
              <Box sx={{ mt: 0.5, width: '100%', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {renderContent(post.content)}
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
                            component="button" 
                            onClick={() => navigate(`/profile/${user.id}`)} 
                            sx={{ textDecoration: "none", fontWeight: "bold" }}
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
                  
                  {/* Delete button for admins or post owner */}
                  {canDelete && (
                    <Tooltip title="Delete Thread">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => setDeleteDialogOpen(true)}
                        sx={{ ml: 1, p: 0 }}
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        >
          <DialogTitle>
            Delete Thread
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this thread? This will delete the entire thread and all replies. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Mobile layout for replies
  if (isMobile) {
    return (
      <>
        <Paper
          ref={isHighlighted ? replyRef : null}
          elevation={0}
          sx={{
            mb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
            backgroundColor: isHighlighted ? 'rgba(124, 96, 221, 0.1)' : (isReply ? 'background.default' : 'background.paper'),
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
            bgcolor: isReply ? 'background.default' : 'background.paper',
          }}>
            <Avatar 
              src={post.avatar_url} 
              alt={post.username || 'User'} 
              sx={{ width: 36, height: 36, mr: 1.5 }} 
            />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
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
            
            {/* Delete button */}
            {canDelete && (
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Content */}
          <Box sx={{ p: 1.5, pt: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {renderContent(post.content)}
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

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        >
          <DialogTitle>
            {post.parent_id ? "Delete Reply" : "Delete Thread"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {post.parent_id
                ? "Are you sure you want to delete this reply?"
                : "Are you sure you want to delete this thread and all replies?"
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" disabled={isDeleting}>
              {isDeleting ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Desktop layout - for replies
  return (
    <>
      <Paper
        ref={isHighlighted ? replyRef : null}
        elevation={0}
        sx={{
          mb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
          backgroundColor: isHighlighted ? 'rgba(124, 96, 221, 0.1)' : (isReply ? 'background.default' : 'background.paper'),
          transition: 'background-color 0.3s ease',
          scrollMarginTop: '100px',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: isReply ? 'background.default' : 'background.paper', minHeight: 120 }}>
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
              sx={{ width: 60, height: 60 }} 
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
                display: 'block' 
              }}
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
              {post.tagline || (post.email ? 'Google User' : 'Member')}
            </Typography>
          </Box>

          {/* Main Content */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minHeight: 120 }}>
            <Box sx={{ width: '100%', borderBottom: '1px solid', borderColor: 'divider', mb: 1, position: 'relative', top: '-6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
              
              {/* Add Delete button here if user can delete */}
              {canDelete && (
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Box sx={{ mt: 0.5, width: '100%', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {renderContent(post.content)}
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
                          component="button" 
                          onClick={() => navigate(`/profile/${user.id}`)} 
                          sx={{ textDecoration: "none", fontWeight: "bold" }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          {post.parent_id ? "Delete Reply" : "Delete Thread"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {post.parent_id
              ? "Are you sure you want to delete this reply? This action cannot be undone."
              : "Are you sure you want to delete this thread? This will delete the entire thread and all replies. This action cannot be undone."
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IndividualPost;