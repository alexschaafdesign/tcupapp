import React, { useRef } from 'react';
import { Paper, Box, Avatar, Typography, Link } from '@mui/material';

const PostCard = ({ post, isReply, isHighlighted, user, handleLikeClick, handleReplyClick, renderContent, postReactions, highlightedReplyId }) => {
  const userAuth0Id = user?.sub;
  const likedUsers = postReactions[post.id] || [];
  const userHasLiked = likedUsers.some(reaction => reaction.id === userAuth0Id);
  const replyRef = useRef(null);

  return (
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
          <Box sx={{ width: '100%', borderBottom: '1px solid', borderColor: 'divider', mb: 1, position: 'relative', top: '-6px' }}>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.created_at).toLocaleString()}
            </Typography>
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
  );
};

export default PostCard;