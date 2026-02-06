import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Dialog,
  IconButton,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import NewConversationModal from './NewConversationModal';

const ConversationList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      console.log("Fetching conversations");
      setLoading(true);
      setError(null);
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/direct-messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} conversations`);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationCreated = (newConversation) => {
    console.log("New conversation created:", newConversation);
    
    if (!newConversation || !newConversation.id) {
      console.error("Created conversation has no ID:", newConversation);
      setError("Could not navigate to new conversation - missing ID");
      return;
    }
    
    setConversations(prev => [newConversation, ...prev]);
    setIsModalOpen(false);
    
    // Navigate to the new conversation
    navigate(`/messages/${newConversation.id}`);
  };

  const handleConversationClick = (conversationId) => {
    if (!conversationId) {
      console.error("Attempted to navigate to conversation with undefined ID");
      setError("Cannot open conversation - missing ID");
      return;
    }
    
    console.log(`Navigating to conversation: ${conversationId}`);
    navigate(`/messages/${conversationId}`);
  };

  const handleRetry = () => {
    fetchConversations();
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 0 : 0, px: isMobile ? 1 : 2 }}>
      {/* Header with Messages title and New Message button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: { xs: 2, sm: 3 },
          mt: { xs: 0, sm: 0 } 
        }}
      >
        <Typography 
          variant={isMobile ? "h3" : "h3"} 
          sx={{ color: 'text.primary' }}
        >
          MESSAGES
        </Typography>
  
        {isAuthenticated && (
          <Stack direction="row" spacing={2}>
            {error && (
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleRetry}
              >
                Retry
              </Button>
            )}
            
            {isMobile ? (
              <IconButton
                size="small"
                color="primary"
                onClick={() => setIsModalOpen(true)}
                sx={{ bgcolor: 'secondary.main', color: 'black', '&:hover': { bgcolor: 'secondary.dark' } }}
              >
                <CreateIcon />
              </IconButton>
            ) : (
              <Button 
                variant="contained" 
                size="small"
                startIcon={<CreateIcon />} 
                onClick={() => setIsModalOpen(true)}
              >
                New Message
              </Button>
            )}
          </Stack>
        )}
      </Box>
  
      {/* New Message Modal */}
      <Dialog 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: isMobile ? 0 : '8px' }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6" fontWeight={500}>New Message</Typography>
          <IconButton onClick={() => setIsModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          <NewConversationModal 
          onClose={() => setIsModalOpen(false)}  // Change this line
          onConversationCreated={handleConversationCreated}
          />
        </Box>
      </Dialog>
  
      {/* Conversations List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ mb: 4, textAlign: 'center', p: 4 }}>
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleRetry}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      ) : conversations && conversations.length > 0 ? (
        <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
          <List sx={{ width: '100%' }}>
            {conversations.map((conversation, index) => (
              <React.Fragment key={conversation.id || index}>
                <ListItem 
                  alignItems="flex-start"
                  button
                  onClick={() => handleConversationClick(conversation.id)}
                  sx={{ 
                    py: 2,
                    '&:hover': { 
                      bgcolor: 'rgba(0, 0, 0, 0.04)' 
                    },
                    cursor: 'pointer'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      alt={conversation.other_user?.username || 'User'} 
                      src={conversation.other_user?.avatar_url} 
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={
                        conversation.unread_count ? 600 : 400
                      }>
                        {conversation.other_user?.username || 'Unknown User'}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline', color: conversation.unread_count ? 'text.primary' : 'text.secondary', fontWeight: conversation.unread_count ? 500 : 400 }}
                          component="span"
                          variant="body2"
                        >
                          {conversation.last_message 
                            ? `${conversation.last_message.substring(0, 50)}${conversation.last_message.length > 50 ? '...' : ''}`
                            : 'No messages yet'}
                        </Typography>
                        {conversation.last_message_at && (
                          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                            {new Date(conversation.last_message_at).toLocaleDateString()}
                          </Typography>
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < conversations.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      ) : (
        <Box sx={{ mb: 4, textAlign: 'center', p: 4 }}>
          <Typography variant="body1">
            No messages yet. Start a new conversation!
          </Typography>
        </Box>
      )}
      
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

export default ConversationList;