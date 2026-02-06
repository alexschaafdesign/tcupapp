import React from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Avatar, 
  Box, 
  Chip,
  Divider,
  alpha,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ChatBubbleOutline, AccessTime } from '@mui/icons-material';

export const ThreadPreview = ({ post, onReplyClick }) => {
  const previewReplies = post.replies?.slice(0, 2) || [];
  const totalReplies = post.replies?.length || 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return diffInHours < 1 
        ? 'Just now' 
        : `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 3,
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        overflow: 'visible'
      }}
      elevation={1}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Author Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={post.avatar_url} 
            alt={post.author}
            sx={{ 
              width: 42, 
              height: 42, 
              mr: 2,
              border: '2px solid #f5f5f5' 
            }}
          />
          <Box>
            <Typography 
              variant="subtitle1"
              fontWeight={500}
            >
              {post.author}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.created_at)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Post Content */}
        <Box sx={{ ml: { xs: 0, sm: 7 } }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1.5,
              fontWeight: 500,
              fontSize: '1.1rem',
              color: 'primary.main'
            }}
          >
            {post.title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 2,
              color: 'text.primary',
              lineHeight: 1.6
            }}
          >
            {post.content}
          </Typography>
          
          {/* Tags */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {post.tags?.map(tag => (
              <Chip 
                key={tag.id} 
                label={tag.name}
                size="small"
                sx={{ 
                  borderRadius: '4px',
                  height: '24px',
                  bgcolor: alpha('#000', 0.05),
                  '&:hover': {
                    bgcolor: alpha('#000', 0.1)
                  }
                }}
              />
            ))}
          </Stack>

          {/* Action Button */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            mb: previewReplies.length > 0 ? 1 : 0
          }}>
            <Button 
              variant="outlined"
              startIcon={<ChatBubbleOutline />}
              onClick={onReplyClick}
              size="small"
              sx={{ 
                borderRadius: '6px',
                textTransform: 'none'
              }}
            >
              Reply
            </Button>
          </Box>
        </Box>

        {/* Replies section */}
        {previewReplies.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ 
              ml: { xs: 2, sm: 7 }, 
              pl: 2,
              borderLeft: 2,
              borderColor: 'divider',
              borderRadius: '0 0 0 4px'
            }}>
              {previewReplies.map(reply => (
                <Box 
                  key={reply.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    mb: 2,
                    '&:last-child': { mb: totalReplies > 2 ? 1 : 0 }
                  }}
                >
                  <Avatar 
                    src={reply.avatar_url} 
                    alt={reply.username} 
                    sx={{ width: 32, height: 32, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ mr: 1 }}
                      >
                        {reply.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(reply.created_at)}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        lineHeight: 1.4
                      }}
                    >
                      {reply.content}
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
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 500,
                      pl: 0,
                      '&:hover': {
                        bgcolor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
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