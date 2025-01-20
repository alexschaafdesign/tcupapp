import React from 'react';
import { 
  Box, 
  Typography, 
  Avatar,
  IconButton,
  List,
  ListItem,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { NotificationsNone as BellIcon } from '@mui/icons-material';
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
      navigate(`/thread/${post.id}`);
    } else {
      showAuthModal();
    }
  };

  return (
    <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
      {posts.map((post) => (
        <AuthWrapper 
          key={post.id}
          message="Please log in to view thread details"
          renderContent={(showModal) => (
            <ListItem
              onClick={() => handleClick(post, showModal)}
              sx={{
                display: 'flex',
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              {/* Left side - Author info */}
              <Box sx={{ display: 'flex', alignItems: 'center', width: '200px', mr: 2 }}>
                <Avatar src={post.avatar_url} sx={{ width: 40, height: 40, mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2" noWrap>
                    {post.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {formatDate(post.created_at)}
                  </Typography>
                </Box>
              </Box>

              {/* Middle - Post title and tags */}
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  component="div" 
                  sx={{ color: 'primary.main', mb: 0.5 }}
                >
                  {post.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {post.tags?.map(tag => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20 }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Right side - Stats */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end',
                minWidth: '100px'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Replies: {post.replies?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Views: {post.views || 0}
                  </Typography>
                </Box>
                {post.last_reply && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Last reply {formatDate(post.last_reply.created_at)}
                  </Typography>
                )}
              </Box>

              {/* Notification bell */}
              <IconButton 
                size="small" 
                sx={{ ml: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle notification toggle
                }}
              >
                <BellIcon fontSize="small" />
              </IconButton>
            </ListItem>
          )}
        />
      ))}
    </List>
  );
};

export default PostList;