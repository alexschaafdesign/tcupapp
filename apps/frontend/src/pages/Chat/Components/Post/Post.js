import React, { useState } from 'react';
import { Paper, Box, useMediaQuery, useTheme, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostUser from './PostUser';
import PostFooter from './PostFooter';
import DeleteDialog from './ui/DeleteDialog';
import EditPostDialog from './ui/EditPostDialog';

const Post = ({
    post,
    isThreadStarter = false,
    isReply = false,
    isHighlighted = false,
    user,
    handleLikeClick,
    handleReplyClick,
    handleEditClick: externalEditClick,
    renderContent,
    postReactions = {},
    highlightedReplyId,
    canEditPost = false,
    userRoles = [],
    getAccessTokenSilently,  // Add this prop
    onSendDM  // Add this prop
  }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isImported = post.is_imported === true;
  const userAuth0Id = user?.sub;
  const likedUsers = postReactions[post.id] || [];
  const userHasLiked = likedUsers.some(reaction => reaction.id === userAuth0Id);
  const hasImages = post.images && Array.isArray(post.images) && post.images.length > 0;
  const postRef = React.useRef(null);

  // Determine if user can delete this post
  const isPostOwner = userAuth0Id === post.auth0_id;
  const canDelete = userRoles.includes('admin') || isPostOwner;
  
  // Navigation handlers
  const navigateToUserProfile = () => {
    if (post.auth0_id) {
      navigate(`/profile/${post.auth0_id}`);
    }
  };

  const navigateToOtherUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleLocalEditClick = () => {
    if (typeof externalEditClick === 'function') {
      externalEditClick(post);
    } else {
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    setEditDialogOpen(false);
    window.location.reload(); // Refresh to see changes
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = await getAccessTokenSilently();
      const apiUrl = process.env.REACT_APP_API_URL;
      
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
        ref={isHighlighted ? postRef : null}
        elevation={0}
        sx={{
          mb: 1,
          border: isThreadStarter ? '1px solid' : 'none',
          borderBottom: !isThreadStarter ? '1px solid' : 'none',
          borderColor: 'divider',
          borderRadius: isThreadStarter ? 2 : 0,
          backgroundColor: isHighlighted 
            ? 'rgba(124, 96, 221, 0.1)' 
            : 'background.paper',
          transition: 'background-color 0.3s ease',
          scrollMarginTop: '100px',
          overflow: 'hidden',
        }}
      >
        {/* Thread starter header */}
        {isThreadStarter && (
          <PostHeader 
            post={post} 
            isMobile={isMobile} 
            isThreadStarter={true}
            canEditPost={canEditPost}
            canDelete={canDelete}
            handleLocalEditClick={handleLocalEditClick}
            setDeleteDialogOpen={setDeleteDialogOpen}
            navigateToUserProfile={navigateToUserProfile}
          />
        )}

        {/* Different layouts for mobile and desktop */}
        {isMobile ? (
          <>
            {/* Mobile Layout */}
            {!isThreadStarter && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                justifyContent: 'space-between'
              }}>
                <PostUser 
                  post={post}
                  isImported={isImported}
                  size="small"
                  navigateToUserProfile={navigateToUserProfile}
                  showTagline={false}
                  onSendDM={() => onSendDM && onSendDM(post)} // Add this line
                />
                
                {!isImported && (
                  <Box sx={{ display: 'flex' }}>
                    {canEditPost && (
                      <IconButton 
                        size="small" 
                        sx={{ mx: 1, color: theme.palette.warning.main }}
                        onClick={handleLocalEditClick}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton 
                        size="small" 
                        sx={{ color: theme.palette.error.main }}
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                )}
              </Box>
            )}
            
            <Box sx={{ p: 1.5, pt: !isThreadStarter ? 1 : 1.5 }}>
              <PostContent 
                post={post}
                renderContent={renderContent}
              />
            </Box>
            
            <PostFooter 
              post={post}
              isImported={isImported}
              userHasLiked={userHasLiked}
              likedUsers={likedUsers}
              handleLikeClick={handleLikeClick}
              handleReplyClick={handleReplyClick}
              navigateToOtherUserProfile={navigateToOtherUserProfile}
              isMobile={true}
            />
          </>
        ) : (
          <>
            {/* Desktop Layout */}
            <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'background.paper', minHeight: 120 }}>
              {/* Left side: User info */}
              <PostUser 
                post={post}
                isImported={isImported}
                size="large"
                navigateToUserProfile={navigateToUserProfile}
                onSendDM={() => onSendDM && onSendDM(post)} // Add this line
              />
              
              {/* Right side: Content and footer */}
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 120 }}>
                {!isThreadStarter && (
                  <Box sx={{ 
                    width: '100%', 
                    borderBottom: '1px solid', 
                    borderColor: 'divider', 
                    mb: 1, 
                    position: 'relative', 
                    top: '-6px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {isImported ? post.imported_date : new Date(post.created_at).toLocaleString()}
                    </Typography>
                    
                    {!isImported && (
                      <Box sx={{ display: 'flex' }}>
                        {canEditPost && (
                          <IconButton 
                            size="small" 
                            onClick={handleLocalEditClick}
                            sx={{ ml: 1, color: theme.palette.warning.main }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        
                        {canDelete && (
                          <IconButton 
                            size="small" 
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{ ml: 1, color: theme.palette.error.main }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
                
                <PostContent 
                  post={post}
                  renderContent={renderContent}
                />
                
                <PostFooter 
                  post={post}
                  isImported={isImported}
                  userHasLiked={userHasLiked}
                  likedUsers={likedUsers}
                  handleLikeClick={handleLikeClick}
                  handleReplyClick={handleReplyClick}
                  navigateToOtherUserProfile={navigateToOtherUserProfile}
                  handleLocalEditClick={handleLocalEditClick}
                  setDeleteDialogOpen={setDeleteDialogOpen}
                  canDelete={canDelete}
                  canEditPost={canEditPost}
                  isMobile={false}
                />
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Dialogs */}
      <DeleteDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        isReply={!isThreadStarter}
      />

      <EditPostDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveEdit}
        post={post}
      />
    </>
  );
};

export default Post;