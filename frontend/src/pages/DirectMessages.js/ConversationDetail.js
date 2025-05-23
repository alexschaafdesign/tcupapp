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
  Collapse,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Send as SendIcon,
  Attachment as AttachmentIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Reply as ReplyIcon
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
import ImageAttachmentsGrid from '../Chat/Components/Post/ImageAttachmentsGrid';
import linkifyHtml from 'linkify-html';
import { LinkDecorator } from '../Chat/Components/LinkDecorator';
import { useMessages } from './MessageBadge';

const ConversationDetail = () => {
  const { conversationId } = useParams();
  const { getAccessTokenSilently, user } = useAuth0();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageEditorState, setMessageEditorState] = useState(
    EditorState.createEmpty(LinkDecorator)
  );
  const [messageImages, setMessageImages] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const replyFormRef = useRef(null);
  const MESSAGES_PER_PAGE = 10;
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { refreshUnreadCount } = useMessages();

// In your ConversationDetail component
// Mark conversation as read when opened
useEffect(() => {
  const markAsRead = async () => {
    if (conversationId) {
      try {
        // Call your existing endpoint with the correct path
        const response = await fetch(`${process.env.REACT_APP_API_URL}/direct-messages/${conversationId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await getAccessTokenSilently()}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // After successfully marking as read, refresh badge count
          refreshUnreadCount();
        } else {
          console.error('Failed to mark conversation as read:', await response.text());
        }
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    }
  };
  
  markAsRead();
}, [conversationId, getAccessTokenSilently, refreshUnreadCount]);

  
  // API Calls
  const fetchConversation = async (reset = false) => {
    try {
      setError(null);
      if (reset) {
        setPage(1);
        setMessages([]);
        setLoading(true);
      }
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/direct-messages/conversation-by-id/${conversationId}?page=1&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load conversation: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.messages) {
        setMessages(data.messages.reverse()); // Reverse to get oldest first
        setHasMore(data.pagination.has_more);
        setPage(1);
            } else {
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
  
  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/direct-messages/conversation-by-id/${conversationId}?page=${nextPage}&limit=${MESSAGES_PER_PAGE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load more messages: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        setMessages(prevMessages => [...data.messages.reverse(), ...prevMessages]);
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

  const handleSendMessage = async () => {
    try {
      if (!messageEditorState.getCurrentContent().hasText() && messageImages.length === 0) {
        return;
      }
      
      setSendingMessage(true);
      setError(null);
      
      const token = await getAccessTokenSilently();
      const contentState = messageEditorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      
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
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setMessageEditorState(EditorState.createEmpty(LinkDecorator));
       setMessageImages([]);
      setShowImageUpload(false);
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Event Handlers
  const handleBackClick = () => {
    navigate('/messages');
  };

  const handleCloseError = () => {
    setError(null);
  };

  const toggleImageUpload = () => {
    setShowImageUpload(!showImageUpload);
  };
  
  const toggleExpandMessages = () => {
    setExpandedMessages(!expandedMessages);
  };

  const containerRef = useRef(null);

  
  const handleReplyClick = () => {
    setShowReplyForm(true);
    
    // Increase the delay to give the reply form time to render
    setTimeout(() => {
      if (replyFormRef.current) {
        replyFormRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end', // scroll so the reply form is fully visible at the bottom
        });
      }
    }, 500);
  };

  // Utility Functions
  const formatMessageDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    const thisYear = date.getFullYear() === today.getFullYear();
    
    if (thisYear) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const linkifyOptions = {
    defaultProtocol: 'https', // so "google.com" becomes "https://google.com"
    // You can add more config if needed
  };
  
  const renderMessageContent = (content) => {
    if (!content) return <Typography variant="body1">No content</Typography>;
  
    try {
      const contentObj = typeof content === 'string' ? JSON.parse(content) : content;
      if (!contentObj || !contentObj.blocks) {
        return <Typography variant="body1">{typeof content === 'string' ? content : JSON.stringify(content)}</Typography>;
      }

      // Custom renderer for Draft.js content that directly controls spacing
      return (
        <div>
          {contentObj.blocks.map((block, i) => {
            // Get any inline styling for this block
            const inlineStyles = {};
            const text = block.text;
            
            if (!text) return null; // Skip empty blocks
  
            // This is the key - we're controlling the element creation directly
            // For single line breaks, we simply return a div with appropriate styling
            return (
              <div key={i} style={{ marginBottom: '0.5em' }}>
                {/* Handle links and other entities */}
                {block.entityRanges.length > 0 ? (
                  // Handle text with entities (links)
                  renderTextWithEntities(text, block.entityRanges, contentObj.entityMap)
                ) : (
                  // Plain text - apply any inline styles
                  text
                )}
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error("Error rendering message content:", error);
      return <Typography variant="body1">{typeof content === 'string' ? content : 'Unreadable content'}</Typography>;
    }
  };
  
  // Helper function to render text with entities (like links)
  const renderTextWithEntities = (text, entityRanges, entityMap) => {
    // If no entities, just return the text
    if (entityRanges.length === 0) return text;
    
    // Sort entity ranges by offset to ensure proper order
    const sortedRanges = [...entityRanges].sort((a, b) => a.offset - b.offset);
    
    // Build an array of text segments and links
    const result = [];
    let lastIndex = 0;
    
    sortedRanges.forEach((range, i) => {
      const { offset, length, key } = range;
      const entity = entityMap[key];
      
      // Add text before this entity if there is any
      if (offset > lastIndex) {
        result.push(text.slice(lastIndex, offset));
      }
      
      // Get the entity text
      const entityText = text.slice(offset, offset + length);
      
      // Handle different entity types
      if (entity.type.toLowerCase() === 'link') {
        result.push(
          <a 
            key={i} 
            href={entity.data.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {entityText}
          </a>
        );
      } else {
        // For other entity types, just add the text
        result.push(entityText);
      }
      
      lastIndex = offset + length;
    });
    
    // Add any remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }
    
    return result;
  };

  // Effects
  useEffect(() => {
    if (conversationId && user?.sub) {
      fetchConversation();
    }
  }, [conversationId, user]);

  // Determine which messages to show
  const DEFAULT_VISIBLE = 3;
  const messagesToShow = !expandedMessages && messages.length > DEFAULT_VISIBLE
    ? messages.slice(-DEFAULT_VISIBLE)
    : messages;
    
  const hiddenMessagesCount = messages.length - messagesToShow.length;

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ 
        py: 4, 
        height: 'calc(100vh - 75px)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" ref={containerRef} sx={{ 
      pt: 2, 
      pb: 4,
      px: { xs: 1, sm: 2 },
      height: '100%',
      minHeight: 'calc(100vh - 75px)',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'white',
      overflowY: 'auto'
    }}>
      {/* Simplified header with back button and conversation info */}
      <Box sx={{ 
        py: 1,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 2
      }}>
        <IconButton 
          onClick={handleBackClick} 
          edge="start"
          sx={{ color: 'text.secondary' }}
          aria-label="Back to messages"
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h6" sx={{ 
          fontWeight: 400, 
          flexGrow: 1,
          ml: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          Back to inbox
        </Typography>
      </Box>
      
      {/* Conversation subject */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3">
          Conversation with{' '}
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {otherUser?.username || 'Unknown User'}
          </Box>
        </Typography>
      </Box>
      
      {/* Messages list - Gmail style */}
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.length === 0 ? (
          <Paper elevation={0} sx={{ 
            p: 3, 
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1
          }}>
            <Typography color="text.secondary">
              No messages in this conversation yet. Click Reply to start the conversation.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Show collapsed indicator if there are hidden messages */}
            {hiddenMessagesCount > 0 && (
              <Button
                onClick={toggleExpandMessages}
                startIcon={<ExpandMoreIcon />}
                sx={{ 
                  alignSelf: 'center',
                  mb: 2,
                  textTransform: 'none',
                  color: 'text.secondary',
                  bgcolor: 'rgba(0,0,0,0.04)',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.08)'
                  }
                }}
              >
                Show {hiddenMessagesCount} earlier message{hiddenMessagesCount !== 1 ? 's' : ''}
              </Button>
            )}
            
            {/* Display messages */}
            {messagesToShow.map((message, index) => {
              const isCurrentUser = message.sender_id === user?.sub;
              const formattedDate = formatMessageDate(message.created_at);
              const senderName = isCurrentUser ? 'You' : otherUser?.username || 'Unknown User';
              const isLast = index === messagesToShow.length - 1;
              
              return (
                <Paper
                  key={message.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: isLast ? 0 : 2,
                    borderRadius: 1, 
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'white'
                  }}
                >
                  {/* Message header */}
                  <Box sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Avatar 
                      src={isCurrentUser ? user?.picture : otherUser?.avatar_url}
                      alt={senderName}
                      sx={{ width: 40, height: 40, mr: 1.5 }}
                    />
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {senderName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {formattedDate}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        to {isCurrentUser ? otherUser?.username : 'you'}
                      </Typography>
                    </Box>
                    
                    {/* Only show reply button directly on messages if needed */}
                    {isLast && !showReplyForm && (
                      <IconButton 
                        size="small" 
                        onClick={handleReplyClick}
                        sx={{ color: 'text.secondary' }}
                      >
                        <ReplyIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {/* Message content */}
                  <Box sx={{ pl: 7 }}>
                    <Box 
                      className="message-content"
                      sx={{ 
                        typography: 'body1', 
                        lineHeight: 1.6, 
                        mb: 2,
                        // Use direct CSS injection for more control
                        '&::before': {
                          content: '""',
                          display: 'block',
                          marginBottom: '0px'
                        },
                        // The combination of these styles will ensure single spacing
                        '& span': { display: 'inline' },
                        '& span + span': { marginTop: '0 !important', paddingTop: '0 !important' }
                      }}
                    >
                      {renderMessageContent(message.content)}
                    </Box>
                    
                    {/* Show images if present */}
                    {message.images && message.images.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <ImageAttachmentsGrid images={message.images} />
                      </Box>
                    )}
                  </Box>
                </Paper>
                  );
                })}
              </>
            )}
          </Box>
          
          {/* If all messages viewed, show expand less button */}
          {expandedMessages && messages.length > 2 && (
            <Button
              onClick={toggleExpandMessages}
              startIcon={<ExpandLessIcon />}
              sx={{ 
                alignSelf: 'center',
                my: 2,
                textTransform: 'none',
                color: 'text.secondary'
              }}
            >
              Show less
            </Button>
          )}
          
          {/* Reply button - Only show if compose area is hidden */}
          {!showReplyForm && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                variant="contained"
                startIcon={<ReplyIcon />}
                onClick={handleReplyClick}
                sx={{ 
                  borderRadius: 4,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  bgcolor: '#f2f2f2',
                  color: 'text.primary',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: '#e0e0e0',
                    boxShadow: 2
                  }
                }}
              >
                Reply
              </Button>
            </Box>
          )}
          
          {/* Reply composition area - Only visible after clicking Reply */}
          <Collapse
              in={showReplyForm}
              onEntered={() => {
                // Scroll the container (if it’s scrollable) or the window
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    top: containerRef.current.scrollHeight,
                    behavior: 'smooth',
                  });
                } else {
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth',
                  });
                }
                // Optionally, trigger focus on the reply editor if you can access its ref
                // For example, if EditorWithFormatting passes its ref upward or accepts an onEntered callback
              }}
            >         
           <Box 
              ref={replyFormRef}
              sx={{ 
                mt: 3,
                p: 2,
                borderRadius: 1, 
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'white',
                boxShadow: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Reply to {otherUser?.username || 'Unknown User'}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setShowReplyForm(false)}
                  sx={{ color: 'text.secondary' }}
                >
                  <ExpandLessIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <EditorWithFormatting
                  editorState={messageEditorState}
                  setEditorState={setMessageEditorState}
                  placeholder="Compose your reply here..."
                  autoFocus={true}
                />
              </Box>
              
              {showImageUpload && (
                <Box sx={{ mb: 2, p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                  <ChatImageUpload 
                    images={messageImages} 
                    setImages={setMessageImages}
                  />
                </Box>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}>
                <Button
                  startIcon={<AttachmentIcon />}
                  onClick={toggleImageUpload}
                  color="primary"
                  variant="text"
                  sx={{ textTransform: 'none' }}
                >
                  {showImageUpload ? 'Hide Attachments' : 'Add Attachments'}
                  {!showImageUpload && messageImages.length > 0 && ` (${messageImages.length})`}
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !otherUser || (!messageEditorState.getCurrentContent().hasText() && messageImages.length === 0)}
                  sx={{ 
                    borderRadius: 4,
                    px: 3,
                    textTransform: 'none'
                  }}
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </Button>
              </Box>
            </Box>
          </Collapse>
          
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