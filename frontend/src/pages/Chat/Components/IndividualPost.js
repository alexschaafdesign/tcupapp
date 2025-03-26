// IndividualPost.js - Modified to use the new Post component
import React from 'react';
import Post from './Post'; // Import the new Post component
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
  const { getAccessTokenSilently } = useAuth0();
  const { isAdmin, userRoles } = useAuth();
  const navigate = useNavigate();
  
  // Use the new Post component
  return (
    <Post
      post={post}
      isReply={isReply}
      isThreadStarter={isThreadStarter}
      isHighlighted={isHighlighted}
      user={user}
      handleLikeClick={handleLikeClick}
      handleReplyClick={handleReplyClick}
      handleEditClick={handleEditClick}
      canEditPost={canEditPost}
      renderContent={renderContent}
      postReactions={postReactions}
      highlightedReplyId={highlightedReplyId}
      userRoles={userRoles || []}
      getAccessTokenSilently={getAccessTokenSilently}
    />
  );
};

export default IndividualPost;