// IndividualPost.js - Main component
import React from 'react';
import { Paper, Box, useMediaQuery, useTheme } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import palette from '../../../styles/colors/palette';

// Component imports
import ThreadStarterDesktop from './IndividualPost/ThreadStarterDesktop';
import ThreadStarterMobile from './IndividualPost/ThreadStarterMobile';
import ReplyDesktop from './IndividualPost/ReplyDesktop';
import ReplyMobile from './IndividualPost/ReplyMobile';
import DeleteDialog from './IndividualPost/DeleteDialog';
import EditPostDialog from './IndividualPost/EditPostDialog';

const IndividualPost = ({ 
  post, 
  isReply,
  isThreadStarter,
  isHighlighted, 
  user, 
  handleLikeClick, 
  handleReplyClick,
  handleEditClick,
  canEditPost,
  renderContent, 
  postReactions, 
  highlightedReplyId 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const { isAdmin } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const userAuth0Id = user?.sub;
  const likedUsers = postReactions[post.id] || [];
  const userHasLiked = likedUsers.some(reaction => reaction.id === userAuth0Id);
  const replyRef = React.useRef(null);
  
  // Check if post has images
  const hasImages = post.images && Array.isArray(post.images) && post.images.length > 0;
  
  // Check if user can delete (is admin or post owner)
  const isPostOwner = userAuth0Id === post.auth0_id;
  const canDelete = isAdmin || isPostOwner;

  // Navigation handlers
  const navigateToUserProfile = () => {
    if (post.auth0_id) {
      navigate(`/profile/${post.auth0_id}`);
    }
  };

  const navigateToOtherUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Action handlers
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

  const handleLocalEditClick = () => {
    if (typeof handleEditClick === 'function') {
      handleEditClick(post);
    } else {
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    setEditDialogOpen(false);
    window.location.reload(); // Refresh to see changes
  };

  // Shared props for all post variants
  const sharedProps = {
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
  };

  // Choose the appropriate component based on post type and device
  let PostComponent;
  if (isThreadStarter) {
    PostComponent = isMobile ? ThreadStarterMobile : ThreadStarterDesktop;
  } else {
    PostComponent = isMobile ? ReplyMobile : ReplyDesktop;
  }

  return (
    <>
      <PostComponent {...sharedProps} />

      {/* Dialogs */}
      <DeleteDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        isReply={!!post.parent_id}
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

export default IndividualPost;