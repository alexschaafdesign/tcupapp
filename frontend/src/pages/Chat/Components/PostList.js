import React from 'react';
import { Box, Typography, Tooltip, Avatar, List, ListItem, Chip, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthWrapper from '../../../components/auth/AuthWrapper';
import { useAuth0 } from '@auth0/auth0-react';

const PostList = ({ posts }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = now - postDate;
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 1) {
      if (postDate.getDate() === now.getDate()) {
        return `Today at ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return `Yesterday at ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (days < 7) {
      return `${postDate.toLocaleDateString([], { weekday: 'long' })} at ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return postDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleClick = (post, showAuthModal) => {
    if (isAuthenticated) {
      navigate(`/chat/${post.id}`);
    } else {
      showAuthModal();
    }
  };

  return (
    <Paper elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <List sx={{ p: 0 }}>
        {posts.map((post) => {
          const visibleTags = post.tags ? post.tags.slice(0, 3) : [];
          const moreTagsCount = post.tags && post.tags.length > 3 ? post.tags.length - 3 : 0;

          return (
            <AuthWrapper 
              key={post.id}
              message="Please log in to view thread details"
              renderContent={(showModal) => (
                <ListItem
                  onClick={() => handleClick(post, showModal)}
                  sx={{
                    p: 0.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.50' },
                    display: 'flex',
                    gap: 2
                  }}
                >
                  {/* Left Side: Avatar + Subtitle */}
                  <Box 
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 90,
                      bgcolor: 'grey.100',
                      p: 1,
                      borderRadius: '8px 0 0 8px',
                      borderRight: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Avatar 
                      src={post.avatar_url} 
                      sx={{ width: 60, height: 60 }}
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mt: 1, textAlign: 'center' }}
                    >
                      {post.author}
                    </Typography>
                  </Box>

                  {/* Main Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Title and Tags Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography 
                        sx={{ 
                          color: 'primary.main',
                          fontWeight: 600,
                          fontSize: '1.2rem',
                          flex: 1,
                          mr: 2
                        }}
                      >
                        {post.title}
                      </Typography>

                      {/* 🏷️ Tags (Limit to 3, show more with Tooltip) */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        {visibleTags.map((tag) => (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                            sx={{ 
                              height: 20,
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              '& .MuiChip-label': {
                                px: 1,
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                        ))}

                        {moreTagsCount > 0 && (
                          <Tooltip title={post.tags.map(tag => tag.name).join(', ')}>
                            <Typography
                              variant="caption"
                              sx={{ 
                                bgcolor: 'grey.300',
                                borderRadius: 12,
                                px: 1,
                                fontSize: '0.75rem',
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              +{moreTagsCount}
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {/* Preview Text */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        mb: 2
                      }}
                    >
                      {post.content ? (
                        typeof post.content === 'string' && post.content.startsWith('{') 
                          ? JSON.parse(post.content).blocks?.[0]?.text || 'No preview available'
                          : post.content.substring(0, 100)
                      ) : 'No preview available'}
                    </Typography>

                    {/* Bottom Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Author Info and Stats */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          by {post.author} · {formatDate(post.created_at)}
                        </Typography>
                        
                        <Typography variant="caption">
                          {post.reply_count || 0} replies
                        </Typography>
                      </Box>

                      {/* Right side - Last post info */}
{post.reply_count > 0 && post.last_reply_at && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right', lineHeight: 1 }}>
                          {/* LAST POST text inline without adding height */}
                          <Typography 
                            variant="caption" 
                            color="text.tertiary" 
                            sx={{ display: 'inline', fontSize: '0.7rem', mr: 0.5 }}
                          >
                            LAST POST
                          </Typography>

                          {/* Timestamp with link */}
                          <Typography 
                            variant="caption" 
                            sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {formatDate(post.last_reply_at)}
                          </Typography>

                          {/* Username */}
                          <Typography 
                            variant="caption" 
                            display="block"
                            sx={{ color: 'text.secondary' }}
                          >
                            {post.last_reply_author}
                          </Typography>
                        </Box>
                        
                        <Avatar 
                          src={post.last_reply_avatar_url} 
                          sx={{ width: 24, height: 24 }}
                        />
                      </Box>
                    )}
                    </Box>
                  </Box>
                </ListItem>
              )}
            />
          );
        })}
      </List>
    </Paper>
  );
};

export default PostList;