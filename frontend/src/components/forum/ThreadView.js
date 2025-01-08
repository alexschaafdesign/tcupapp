import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Container, Typography, TextField, Button, Avatar, Box, CircularProgress, Paper, IconButton, Dialog } from '@mui/material';
import { FormatQuote as QuoteIcon, Edit as EditIcon } from '@mui/icons-material';
import ReactionBar from './ReactionBar';
import EditHistoricalPost from './EditHistoricalPost.js';
import HistoricalReplyForm from './HistoricalReplyForm.js';

export const ThreadView = () => {
  const { threadId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [threadData, setThreadData] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const replyBoxRef = useRef(null);
  const textFieldRef = useRef(null);
  const [showHistoricalReplyModal, setShowHistoricalReplyModal] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchThread = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/posts/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setThreadData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [threadId, getAccessTokenSilently, apiUrl]);

  const handleReplyClick = (reply) => {
    setReplyingTo(reply);
    const content = reply.content.match(/\[quote="[^"]+"\](.*?)\[\/quote\]\s*(.*)/s);
    const textToQuote = content ? content[2] : reply.content;
    setReplyContent(`[quote="${reply.username}"]${textToQuote}[/quote]\n\n`);
    
    replyBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
      const textField = textFieldRef.current?.querySelector('textarea');
      if (textField) {
        textField.focus();
        textField.setSelectionRange(textField.value.length, textField.value.length);
      }
    }, 100);
  };

  const handleReply = async (parentId = null) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/posts/${threadId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: replyContent,
          parent_id: parentId || (replyingTo?.id || null)
        })
      });
      const newReply = await response.json();
      setThreadData(prev => ({
        ...prev,
        replies: [...prev.replies, newReply]
      }));
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderPostHeader = (post, isReply) => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      mb: 2 
    }}>
      <Box>
        {!isReply && (
          <Typography variant="h3" sx={{ mb: 1 }}>
            {post.title}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {new Date(post.created_at).toLocaleString()}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
        <IconButton 
          size="small" 
          onClick={() => setEditingPost(post)}
          sx={{ padding: 0.5 }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption" color="text.secondary">
          #{post.id}
        </Typography>
      </Box>
    </Box>
  );

  const renderPost = (post, isReply = false) => (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        p: 2,
        bgcolor: isReply ? 'background.gray' : 'background.paper',
      }}>
        <Box sx={{ width: 100, flexShrink: 0 }}>
          <Avatar 
            src={post.avatar_url} 
            alt={post.username}
            sx={{ mb: 1, width: 48, height: 48 }}
          />
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {post.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            TCUP Member
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          {renderPostHeader(post, isReply)}

          {post.content.includes('[quote="') ? (
            <Box>
              {renderQuotedContent(post.content)}
              {renderMainContent(post.content)}
            </Box>
          ) : (
            <Typography variant="body1">{post.content}</Typography>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <ReactionBar 
              postId={post.id} 
              postAuthor={post.username}
              onReplyClick={() => handleReplyClick(post)}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  const renderQuotedContent = (content) => {
    const match = content.match(/\[quote="([^"]+)"\](.*?)\[\/quote\]/s);
    if (!match) return null;
    
    return (
      <Box sx={{ 
        bgcolor: 'action.hover',
        borderLeft: '4px solid',
        borderColor: 'primary.main',
        p: 2,
        mb: 2,
        borderRadius: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <QuoteIcon fontSize="small" color="primary" />
          <Typography variant="caption">
            {match[1]} wrote:
          </Typography>
        </Box>
        <Typography variant="body2">{match[2]}</Typography>
      </Box>
    );
  };

  const renderMainContent = (content) => {
    const mainContent = content.replace(/\[quote="[^"]+"\].*?\[\/quote\]/s, '').trim();
    return <Typography variant="body1">{mainContent}</Typography>;
  };

  if (loading) return <CircularProgress />;
  if (!threadData?.post) return <Typography>Thread not found</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {renderPost(threadData.post)}
      
      {threadData.replies.map(reply => (
        <Box key={reply.id} sx={{ ml: reply.parent_id ? 4 : 0 }}>
          {renderPost(reply, true)}
        </Box>
      ))}

      {/* Adding 'historical reply' */}
      <Box ref={replyBoxRef} sx={{ mt: 3 }}>
        {replyingTo && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary">
              Replying to {replyingTo.username}
              <Button 
                size="small" 
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                sx={{ ml: 1 }}
              >
                Cancel
              </Button>
            </Typography>
          </Box>
        )}
        <TextField
          ref={textFieldRef}
          fullWidth
          multiline
          rows={3}
          placeholder="Write your reply..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained"
            onClick={() => handleReply(threadData.post.id)}
            disabled={!replyContent.trim()}
          >
            Post Reply
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowHistoricalReplyModal(true)}
          >
            Add Historical Reply
          </Button>
        </Box>
      </Box>

      {showHistoricalReplyModal && (
        <Dialog 
          open 
          onClose={() => setShowHistoricalReplyModal(false)} 
          maxWidth="md" 
          fullWidth
        >
          <HistoricalReplyForm
            threadId={threadId}
            onReplyCreated={(reply) => {
              setThreadData(prev => ({
                ...prev,
                replies: [...prev.replies, reply]
              }));
              setShowHistoricalReplyModal(false);
            }}
            onClose={() => setShowHistoricalReplyModal(false)}
          />
        </Dialog>
      )}

      {editingPost && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}>
          <Box sx={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 1
          }}>
            <EditHistoricalPost
              postId={editingPost.id}
              onClose={() => {
                setEditingPost(null);
                fetchThread();
              }}
            />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ThreadView;