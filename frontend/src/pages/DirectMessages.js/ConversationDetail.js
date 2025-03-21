import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Container, 
  Typography, 
  Button, 
  Avatar, 
  Box, 
  CircularProgress, 
  Paper, 
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  LinearProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon 
} from '@mui/icons-material';
import {
  EditorState,
  convertToRaw,
  convertFromRaw
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { stateToHTML } from 'draft-js-export-html';
import parse from 'html-react-parser';
import EditorWithFormatting from '../Chat/Components/EditorWithFormatting';
import ChatImageUpload from '../Chat/Components/ChatImageUpload';
import ImageAttachmentsGrid from '../Chat/Components/ImageAttachmentsGrid';

const ConversationDetail = () => {
  const { conversationId } = useParams();
  const { getAccessTokenSilently, user } = useAuth0();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageEditorState, setMessageEditorState] = useState(EditorState.createEmpty());
  const [messageImages, setMessageImages] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const MESSAGES_PER_PAGE = 10;
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch initial conversation data (most recent messages)
  const fetchConversation = async (reset = false) => {
    try {
      setError(null);
      if (reset) {
        setPage(1);
        setMessages([]);
        setLoading(true);
      }
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/direct-messages/conversation-by-id/${conversationId}?page=1&limit=${MESSAGES_PER_PAGE}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response (${response.status}):`, errorText);
        throw new Error(`Failed to load conversation: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.messages) {
        setMessages(data.messages);
        setHasMore(data.pagination.has_more);
        setPage(1);
      } else {
        console.warn("No messages found in response:", data);
        setMessages([]);
        setHasMore(false);
      }
      
      if (data.other_user) {
        setOtherUser(data.other_user);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setError(error.message || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };
  
  // Load more (older) messages
  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/direct-messages/conversation-by-id/${conversationId}?page=${nextPage}&limit=${MESSAGES_PER_PAGE}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load more messages: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        // Append older messages to the end of the messages array
        setMessages(prevMessages => [...prevMessages, ...data.messages]);
        setPage(nextPage);
        setHasMore(data.pagination.has_more);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
      setError(error.message || "Failed to load more messages");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (conversationId && user?.sub) {
      fetchConversation();
    }
  }, [conversationId, user]);

  const handleSendMessage = async () => {
    try {
      // Don't send if the message is empty (no text and no images)
      if (!messageEditorState.getCurrentContent().hasText() && messageImages.length === 0) {
        return;
      }
      
      setSendingMessage(true);
      setError(null);
      
      const token = await getAccessTokenSilently();
      const contentState = messageEditorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      
      // Now using the conversationId/send endpoint
      const response = await fetch(`${apiUrl}/direct-messages/${conversationId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: rawContent,
          images: messageImages
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Send message error (${response.status}):`, errorText);
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const newMessage = await response.json();
      
      // Add the new message to the TOP of the UI
      setMessages(prev => [newMessage, ...prev]);
  
      // Clear the message editor and images
      setMessageEditorState(EditorState.createEmpty());
      setMessageImages([]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Navigate back to the messages list
  const handleBackClick = () => {
    navigate('/messages');
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Render the message content
  const renderMessageContent = (content) => {
    if (!content) {
      return <Typography variant="body2">No content</Typography>;
    }
    
    try {
      const contentObj = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Verify we have proper Draft.js content with blocks
      if (!contentObj || !contentObj.blocks) {
        return <Typography variant="body2">{typeof content === 'string' ? content : JSON.stringify(content)}</Typography>;
      }
      
      const contentState = convertFromRaw(contentObj);
      const html = stateToHTML(contentState, {
        // Customize HTML conversion options if needed
        inlineStyles: {
          BOLD: { element: 'strong' },
          ITALIC: { element: 'em' },
        }
      });
      
      return parse(html);
    } catch (error) {
      console.error("Error rendering message content:", error);
      // Fallback for non-parsable content
      return <Typography variant="body2">{typeof content === 'string' ? content : 'Unreadable content'}</Typography>;
    }
  };

  // Loading state
  if (loading) return (
    <Container maxWidth="lg" sx={{ 
      py: 4, 
      height: 'calc(100vh - 75px)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <CircularProgress />
    </Container>
  );

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 1, sm: 2 },
        px: { xs: 1, sm: 2 },
        height: 'calc(100vh - 75px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with back button and user info */}
      <Paper 
        elevation={1}
        sx={{ 
          p: 1.5, 
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <IconButton 
          onClick={handleBackClick} 
          size="small" 
          sx={{ mr: 1, color: 'text.secondary' }}
          aria-label="Back to messages"
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Avatar 
          alt={otherUser?.username || 'User'} 
          src={otherUser?.avatar_url} 
          sx={{ width: 40, height: 40, mr: 2 }}
        />
        
        <Typography variant="h6" component="div" sx={{ fontWeight: 500, flexGrow: 1 }}>
          {otherUser?.username || 'Unknown User'}
        </Typography>
        
        {error && (
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={fetchConversation}
          >
            Retry
          </Button>
        )}
      </Paper>
      
      {/* Message Editor - At the top */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 1.5, 
          borderRadius: 2,
          bgcolor: 'background.paper',
          mb: 1
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <EditorWithFormatting
            editorState={messageEditorState}
            setEditorState={setMessageEditorState}
            placeholder="Type a message..."
          />
          
          <Box sx={{ mt: 0.5 }}>
            <ChatImageUpload 
              images={messageImages} 
              setImages={setMessageImages} 
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={
                sendingMessage ||
                !otherUser || 
                (!messageEditorState.getCurrentContent().hasText() && messageImages.length === 0)
              }
              sx={{ 
                borderRadius: 6,
                px: 3,
                textTransform: 'none'
              }}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Messages Container - Flex grow to fill available space */}
      <Paper 
        elevation={1}
        sx={{ 
          flexGrow: 1,
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2,
          position: 'relative', // For loading indicator
          overflow: 'auto' // Allow scrolling in the messages container
        }}
      >
        {/* Loading progress indicator */}
        {loadingMore && (
          <LinearProgress 
            sx={{ 
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              zIndex: 2
            }}
          />
        )}
        
        {/* Messages listed newest to oldest (top to bottom) */}
        <Box 
          sx={{ 
            py: 1.5,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          {!messages || messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              py: 4
            }}>
              <Typography 
                color="text.secondary" 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper', 
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            // Display messages newest first
            messages.map((message, index) => {
              const isCurrentUser = message.sender_id === user?.sub;
              const isPreviousSameSender = index > 0 && messages[index - 1].sender_id === message.sender_id;
              
              return (
                <Box 
                  key={message.id}
                  sx={{
                    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                    maxWidth: { xs: '85%', sm: '70%' },
                    display: 'flex',
                    flexDirection: 'column',
                    mt: isPreviousSameSender ? 0.5 : 1.5
                  }}
                >
                  {/* Show avatar for first message in a series */}
                  {!isPreviousSameSender && !isCurrentUser && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, ml: 0.5 }}>
                      <Avatar 
                        alt={otherUser?.username || 'User'} 
                        src={otherUser?.avatar_url} 
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {otherUser?.username || 'Unknown User'}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    {/* Message bubble */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2,
                        bgcolor: isCurrentUser 
                          ? 'primary.main' 
                          : 'background.paper',
                        color: isCurrentUser 
                          ? 'primary.contrastText' 
                          : 'text.primary',
                        borderTopLeftRadius: (!isPreviousSameSender && !isCurrentUser) ? 0 : 2,
                        borderTopRightRadius: (!isPreviousSameSender && isCurrentUser) ? 0 : 2,
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                        wordBreak: 'break-word'
                      }}
                    >
                      {renderMessageContent(message.content)}
                      
                      {/* Show images if present */}
                      {message.images && message.images.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <ImageAttachmentsGrid images={message.images} />
                        </Box>
                      )}
                      
                      {/* Timestamp inside bubble at bottom right */}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          opacity: 0.8,
                          fontSize: '0.7rem'
                        }}
                      >
                        {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : ''}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              );
            })
          )}
          
          {/* Load More button (at the bottom to load older messages) */}
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ExpandMoreIcon />}
                onClick={loadMoreMessages}
                disabled={loadingMore}
                sx={{ 
                  borderRadius: 4,
                  py: 0.5,
                  boxShadow: 1,
                  bgcolor: 'background.paper'
                }}
              >
                {loadingMore ? (
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                ) : (
                  'Load older messages'
                )}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConversationDetail;