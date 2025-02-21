import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Chip, 
  Stack,
  IconButton,
  Tooltip,
  Badge,
  TextField,
  Button,
  Collapse
} from '@mui/material';
import { 
  ChatBubbleOutline as ReplyIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { ThreadPreview } from './ThreadPreview';

const PostCard = ({ post, onPostUpdated }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { getAccessTokenSilently } = useAuth0();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleReply = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/posts/${post.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyContent })
      });
      const newReply = await response.json();
      onPostUpdated({ ...post, replies: [...(post.replies || []), newReply] });
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

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
      elevation={1}
      sx={{ 
        mb: 2, 
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2,
          bgcolor: 'rgba(0, 0, 0, 0.01)'
        },
        overflow: 'visible'
      }}
    >
      {/* Use the existing ThreadPreview, but wrapped in styled CardContent */}
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <ThreadPreview 
          post={post} 
          onReplyClick={() => setShowReplyForm(!showReplyForm)} 
        />
        
        {/* Stats displayed below the thread preview */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <ReplyIcon fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {post.reply_count || 0}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ViewIcon fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {post.views || 0}
            </Typography>
          </Box>
        </Box>
        
        {/* Reply form with animation */}
        <Collapse in={showReplyForm}>
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: '1px solid',
            borderColor: 'divider' 
          }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              sx={{ mb: 2 }}
              variant="outlined"
              size="small"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<CloseIcon />}
                onClick={() => setShowReplyForm(false)}
                sx={{ mr: 1, textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<SendIcon />}
                onClick={handleReply}
                disabled={!replyContent.trim()}
                sx={{ textTransform: 'none' }}
              >
                Post Reply
              </Button>
            </Box>
          </Box>
        </Collapse>
        
        {/* Preview of replies if available */}
        {post.recent_replies && post.recent_replies.length > 0 && !showReplyForm && (
          <Box 
            sx={{ 
              mt: 2, 
              pt: 1.5, 
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            {post.recent_replies.map((reply, index) => (
              <Box 
                key={reply.id || index}
                sx={{ 
                  display: 'flex',
                  mb: index < post.recent_replies.length - 1 ? 1.5 : 0,
                  pl: 1
                }}
              >
                <Avatar 
                  src={reply.avatar_url} 
                  alt={reply.author}
                  sx={{ width: 28, height: 28, mr: 1.5 }} 
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography 
                      variant="caption" 
                      component="span" 
                      fontWeight={500}
                      sx={{ mr: 1 }}
                    >
                      {reply.author}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                    >
                      {formatDate(reply.created_at)}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="caption" 
                    component="p"
                    sx={{ 
                      color: 'text.secondary',
                      mt: 0.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {reply.content}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;