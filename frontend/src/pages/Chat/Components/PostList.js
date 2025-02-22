import React from 'react';
import { Box, Typography, Avatar, IconButton, List, ListItem, Chip, Paper } from '@mui/material';
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
    <Paper elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <List sx={{ p: 0 }}>
        {posts.map((post) => (
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
      width: 90, // Slightly wider than avatar to fit text
      bgcolor: 'grey.100', // Light shading
      p: 1,
      borderRadius: '8px 0 0 8px', // Soft edge on left
      borderRight: '1px solid', // Creates a separator
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
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1 }}>
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

      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
        {post.tags?.map(tag => (
          <Chip
            key={tag.id}
            label={tag.name}
            size="small"
            sx={{ 
              height: 20,
              backgroundColor: 'grey.100',
              '& .MuiChip-label': {
                px: 1,
                fontSize: '0.75rem'
              }
            }}
          />
        ))}
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
          <Box sx={{ textAlign: 'right' }}>
            <Typography 
              variant="caption" 
              sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              {formatDate(post.last_reply_at)}
            </Typography>
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
        ))}
      </List>
    </Paper>
  );
};

export default PostList;