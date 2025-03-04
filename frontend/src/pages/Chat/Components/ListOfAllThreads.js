import React from 'react';
import { Box, Typography, Avatar, List, ListItem, Paper, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthWrapper from '../../../components/auth/AuthWrapper';
import { useAuth0 } from '@auth0/auth0-react';
import ActiveTags from './ActiveTags';

const PostList = ({ posts }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const TAG_LIMIT = isMobile ? 1 : 2; // Only show 1 tag on mobile

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
          return (
            <AuthWrapper 
              key={post.id}
              message="Please log in to view thread details"
              renderContent={(showModal) => (
                <ListItem
                  onClick={() => handleClick(post, showModal)}
                  sx={{
                    p: isMobile ? 1 : 0.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.50' },
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: 1
                  }}
                >
                  {/* Mobile Layout */}
                  {isMobile ? (
                    <>
                      {/* Top Section - Title and Avatar */}
                      <Box sx={{ 
                        display: 'flex', 
                        width: '100%', 
                        alignItems: 'center',
                        gap: 1,
                        mb: 1
                      }}>
                        <Avatar 
                          src={post.avatar_url} 
                          sx={{ width: 40, height: 40 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            sx={{ 
                              color: 'primary.main',
                              fontWeight: 600,
                              fontSize: '1rem',
                              lineHeight: 1.2
                            }}
                          >
                            {post.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            by {post.author} · {formatDate(post.created_at)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Bottom Section - Preview Text and Stats */}
                      <Box sx={{ width: '100%', pl: 6 }}>
                        {/* We're removing tags from mobile view as requested */}
                        
                        {/* Preview Text - Shorter on mobile */}
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.8rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            mb: 0.5
                          }}
                        >
                          {post.content ? (
                            typeof post.content === 'string' && post.content.startsWith('{') 
                              ? JSON.parse(post.content).blocks?.[0]?.text || 'No preview available'
                              : post.content.substring(0, 60) + '...'
                          ) : 'No preview available'}
                        </Typography>
                        
                        {/* Reply Count */}
                        <Typography variant="caption" color="text.secondary">
                          {post.reply_count || 0} replies
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    /* Desktop Layout */
                    <>
                      {/* Left Side: Avatar */}
                      <Box 
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 70,
                          bgcolor: 'grey.100',
                          p: 1,
                          borderRadius: '8px 0 0 8px',
                          borderRight: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Avatar 
                          src={post.avatar_url} 
                          sx={{ width: 50, height: 50 }}
                        />
                      </Box>

                      {/* Main Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Title and Tags Row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography 
                            sx={{ 
                              color: 'primary.main',
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              flex: 1,
                              mr: 2
                            }}
                          >
                            {post.title}
                          </Typography>

                          {/* Removed tags as requested */}
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
                            mb: 1
                          }}
                        >
                          {post.content ? (
                            typeof post.content === 'string' && post.content.startsWith('{') 
                              ? JSON.parse(post.content).blocks?.[0]?.text || 'No preview available'
                              : post.content.substring(0, 100)
                          ) : 'No preview available'}
                        </Typography>

                        {/* Bottom Row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          {/* Author Info and Stats */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              by {post.author} · {formatDate(post.created_at)}
                            </Typography>
                            
                            <Typography variant="caption">
                              {post.reply_count || 0} replies
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}
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