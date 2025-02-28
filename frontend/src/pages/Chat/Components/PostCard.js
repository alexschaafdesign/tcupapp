import React, { useRef, useState } from 'react';
import { Paper, Box, Avatar, Typography, Link, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../../hooks/useAuth';

const PostCard = ({ 
  post, 
  isReply, 
  isHighlighted, 
  user, 
  handleLikeClick, 
  handleReplyClick, 
  renderContent, 
  postReactions, 
  highlightedReplyId 
}) => {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const { isAdmin } = useAuth(); // Use your auth hook to get role information
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 160, bgcolor: 'grey.100', p: 1, borderRadius: '8px 0 0 8px', borderRight: '1px solid', borderColor: 'divider', flexShrink: 0, minHeight: 120 }}>
            <Avatar src={post.avatar_url} alt={post.username} sx={{ width: 60, height: 60 }} />
            <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 600, mt: 1, wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%', display: 'block' }}>
              {post.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'gray' }}>
              {post.title}
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
                        <Link to={`/profile/${user.id}`} style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}>
                          {user.username}
                        </Link>
                        {index < likedUsers.length - 1 ? (index === likedUsers.length - 2 ? " and " : ", ") : ""}
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

export default PostCard;