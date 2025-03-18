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
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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
import ImageAttachmentsGrid from '../Chat/Components/IndividualPost/ImageAttachmentsGrid';

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
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch conversation data
  const fetchConversation = async () => {
    try {
      console.log(`Fetching conversation details for ID: ${conversationId}`);
      setError(null);
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/direct-messages/conversation-by-id/${conversationId}`, {
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
      console.log("Received conversation data:", data);
      
      if (data.messages) {
        setMessages(data.messages);
      } else {
        console.warn("No messages found in response:", data);
        setMessages([]);
      }
      
      if (data.other_user) {
        setOtherUser(data.other_user);
      } else {
        console.warn("No other_user found in response:", data);
      }
      
      // Update read status - only if we found messages
      if (data.messages && data.messages.length > 0) {
        await fetch(`${apiUrl}/direct-messages/${conversationId}/read`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}` 
          },
        });
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setError(error.message || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId && user?.sub) {
      fetchConversation();
    }
  }, [conversationId, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    try {
      setSendingMessage(true);
      setError(null);
      
      const token = await getAccessTokenSilently();
      const contentState = messageEditorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      
      console.log("Sending message to conversation:", conversationId);
      
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
      console.log("New message sent:", newMessage);
      
      // Add the new message to the UI
      setMessages(prev => [...prev, newMessage]);
  
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

  // Render the message content (reusing the same logic as in ViewSingleThread)
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
    <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackClick}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 'medium',
            color: 'text.primary',
          }}
        >
          Back to messages
        </Button>
        
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
      </Box>
      
      {/* Conversation Header with user info */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          alt={otherUser?.username || 'User'} 
          src={otherUser?.avatar_url} 
          sx={{ width: 48, height: 48 }}
        />
        <Typography variant="h5">
          {otherUser?.username || 'Unknown User'}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Messages Container */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          mb: 3,
          height: '60vh',
          maxHeight: '60vh',
          overflow: 'auto',
          p: 2,
          bgcolor: 'background.default',
          borderRadius: 1
        }}
      >
        {!messages || messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map(message => (
            <Box 
              key={message.id}
              sx={{
                alignSelf: message.sender_id === user?.sub ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Paper 
                elevation={1}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: message.sender_id === user?.sub ? 'primary.light' : 'background.paper',
                  color: message.sender_id === user?.sub ? 'primary.contrastText' : 'text.primary'
                }}
              >
                {renderMessageContent(message.content)}
                
                {/* Show images if present */}
                {message.images && message.images.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <ImageAttachmentsGrid images={message.images} />
                  </Box>
                )}
              </Paper>
              <Typography 
                variant="caption" 
                sx={{ 
                  alignSelf: message.sender_id === user?.sub ? 'flex-end' : 'flex-start',
                  mt: 0.5,
                  color: 'text.secondary'
                }}
              >
                {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </Typography>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Message Editor */}
      <Paper sx={{ p: 2 }}>
        <EditorWithFormatting
          editorState={messageEditorState}
          setEditorState={setMessageEditorState}
          placeholder="Type a message..."
        />
        <ChatImageUpload 
          images={messageImages} 
          setImages={setMessageImages} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={
              sendingMessage ||
              !otherUser || 
              (!messageEditorState.getCurrentContent().hasText() && messageImages.length === 0)
            }
          >
            {sendingMessage ? 'Sending...' : 'Send'}
          </Button>
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