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
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import NewConversationModal from './NewConversationModal';

const ConversationList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationCreated = (newConversation) => {
    setConversations([newConversation, ...conversations]);
    setIsModalOpen(false);
    // Navigate to the new conversation
    navigate(`/messages/${newConversation.id}`);
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/messages/${conversationId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1 : 2 }}>
      {/* Header with Messages title and New Message button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: { xs: 2, sm: 3 },
          mt: { xs: 2, sm: 0 } 
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h3"} 
          sx={{ color: 'text.primary' }}
        >
          MESSAGES
        </Typography>
  
        {isAuthenticated && (
          <Stack direction="row" spacing={2}>
            {isMobile ? (
              <IconButton
                size="small"
                color="primary"
                onClick={() => setIsModalOpen(true)}
                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <AddIcon />
              </IconButton>
            ) : (
              <Button 
                variant="contained" 
                size="small"
                startIcon={<AddIcon />} 
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
            onConversationCreated={handleConversationCreated}
          />
        </Box>
      </Dialog>
  
      {/* Conversations List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : conversations.length > 0 ? (
        <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
          <List sx={{ width: '100%' }}>
            {conversations.map((conversation, index) => (
              <React.Fragment key={conversation.id}>
                <ListItem 
                  alignItems="flex-start"
                  button
                  onClick={() => handleConversationClick(conversation.id)}
                  sx={{ 
                    py: 2,
                    '&:hover': { 
                      bgcolor: 'rgba(0, 0, 0, 0.04)' 
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      alt={conversation.other_user.username} 
                      src={conversation.other_user.avatar_url} 
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={
                        conversation.unread ? 600 : 400
                      }>
                        {conversation.other_user.username}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline', color: conversation.unread ? 'text.primary' : 'text.secondary', fontWeight: conversation.unread ? 500 : 400 }}
                          component="span"
                          variant="body2"
                        >
                          {conversation.last_message.substring(0, 50)}
                          {conversation.last_message.length > 50 ? '...' : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          {new Date(conversation.last_message_at).toLocaleDateString()}
                        </Typography>
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
    </Container>
  );
};

export default ConversationList;