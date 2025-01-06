import React from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Avatar, 
  Box, 
  Chip,
  Divider,
  alpha
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ChatBubbleOutline } from '@mui/icons-material';

export const ThreadPreview = ({ post, onReplyClick }) => {
  const previewReplies = post.replies?.slice(0, 2) || [];
  const totalReplies = post.replies?.length || 0;

  return (
    <Card 
      sx={{ 
        mb: 3,
        '&:hover': {
          boxShadow: 6
        },
        transition: 'box-shadow 0.2s'
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar 
            src={post.avatar_url} 
            alt={post.author}
            sx={{ width: 48, height: 48, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 0.5,
                fontWeight: 500,
                color: 'primary.main'
              }}
            >
              {post.title}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2,
                color: 'text.primary',
                lineHeight: 1.6
              }}
            >
              {post.content}
            </Typography>
            
            {/* Tags */}
            <Box sx={{ mb: 2 }}>
              {post.tags?.map(tag => (
                <Chip 
                  key={tag.id} 
                  label={tag.name}
                  size="small"
                  sx={{ 
                    mr: 1,
                    bgcolor: alpha('#000', 0.05),
                    '&:hover': {
                      bgcolor: alpha('#000', 0.1)
                    }
                  }}
                />
              ))}
            </Box>

            {/* Meta info */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="caption" color="text.secondary">
                Posted by {post.author} • {new Date(post.created_at).toLocaleString()}
              </Typography>
              <Button 
                startIcon={<ChatBubbleOutline />}
                onClick={onReplyClick}
                size="small"
                sx={{ ml: 2 }}
              >
                Reply
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Replies section */}
        {previewReplies.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ 
              ml: 6, 
              pl: 2,
              borderLeft: 2,
              borderColor: 'divider'
            }}>
              {previewReplies.map(reply => (
                <Box 
                  key={reply.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    mb: 2,
                    '&:last-child': { mb: 0 }
                  }}
                >
                  <Avatar 
                    src={reply.avatar_url} 
                    alt={reply.username} 
                    sx={{ width: 32, height: 32, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ mb: 0.5 }}
                    >
                      {reply.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reply.author} • {new Date(reply.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {totalReplies > 2 && (
                <Link 
                  to={`/thread/${post.id}`} 
                  style={{ textDecoration: 'none' }}
                >
                  <Button 
                    color="primary"
                    sx={{ mt: 1 }}
                  >
                    View all {totalReplies} replies
                  </Button>
                </Link>
              )}
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
};

export default ThreadPreview;