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
  useMediaQuery
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
  const [messageEditorState, setMessageEditorState] = useState(EditorState.createEmpty());
  const [messageImages, setMessageImages] = useState([]);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch conversation data
  const fetchConversation = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/messages/${conversationId}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data.messages);
      setOtherUser(data.other_user);
      
      // Mark as read
      await fetch(`${apiUrl}/messages/${conversationId}/read`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    try {
      const token = await getAccessTokenSilently();
      const contentState = messageEditorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
  
      const response = await fetch(`${apiUrl}/messages/${conversationId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: rawContent,
          images: messageImages
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
  
      // Clear the message editor and images
      setMessageEditorState(EditorState.createEmpty());
      setMessageImages([]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Navigate back to the messages list
  const handleBackClick = () => {
    navigate('/messages');
  };

  // Render the message content (reusing the same logic as in ViewSingleThread)
  const renderMessageContent = (content) => {
    // Reuse the renderContent function from ViewSingleThread
    // This would handle parsing the Draft.js content and displaying it
    try {
      const contentObj = typeof content === 'string' ? JSON.parse(content) : content;
      const contentState = convertFromRaw(contentObj);
      const html = stateToHTML(contentState);
      return parse(html);
    } catch (error) {
      return <Typography>{content}</Typography>;
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
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
      </Box>
      
      {/* Conversation Header with user info */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          alt={otherUser?.username} 
          src={otherUser?.avatar_url} 
          sx={{ width: 48, height: 48 }}
        />
        <Typography variant="h5">
          {otherUser?.username}
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
          maxHeight: '60vh',
          overflow: 'auto',
          p: 2
        }}
      >
        {messages.length === 0 ? (
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
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            disabled={!messageEditorState.getCurrentContent().hasText() && messageImages.length === 0}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConversationDetail;