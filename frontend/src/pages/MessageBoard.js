import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Box,
  Avatar,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';

const categories = ['General', 'Help', 'TCUP'];

const MessageBoard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('General');
  const [error, setError] = useState(null);
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchMessages = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/messages?category=${currentCategory}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('public:forum_messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'forum_messages',
          filter: `category=eq.${currentCategory}`
        }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: newMessage,
          category: currentCategory 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post message');
      }

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error posting message:', error);
      setError(error.message);
    }
  };

  const handleCategoryChange = (event, newValue) => {
    setCurrentCategory(newValue);
  };

  const getInitials = (email) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0].toUpperCase())
      .join('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography>Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Paper sx={{ mb: 3 }}>
        <Tabs
            value={currentCategory}
            onChange={handleCategoryChange}
            variant="fullWidth"
            sx={{
            '& .MuiTabs-indicator': {
                backgroundColor: '#8167E6', // Purple color for the indicator
                height: 2
            }
            }}
        >
            {categories.map((category) => (
            <Tab 
                key={category} 
                value={category} 
                label={category}
                sx={{
                textTransform: 'none',
                color: '#666666', // Visible gray for inactive tabs
                fontSize: '1rem',
                '&.Mui-selected': {
                    color: '#8167E6', // Purple for active tab
                    fontWeight: 500
                },
                '&:hover': {
                    backgroundColor: 'rgba(129, 103, 230, 0.04)' // Very light purple on hover
                },
                borderBottom: '1px solid #E0E0E0', // Light border to separate tabs
                '&.Mui-selected + .MuiTab-root': {
                    borderLeft: '1px solid #E0E0E0' // Separator between active and next tab
                }
                }}
            />
            ))}
        </Tabs>
        </Paper>

      {isAuthenticated && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Write a message in ${currentCategory}...`}
              sx={{ mb: 2 }}
            />
            <Button 
              type="submit" 
              variant="contained"
              disabled={!newMessage.trim()}
            >
              Post Message
            </Button>
          </form>
        </Paper>
      )}

      {messages.map((message) => (
        <Paper key={message.id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar 
              src={message.avatar_url || null}
              sx={{ bgcolor: 'primary.main' }}
            >
              {!message.avatar_url && getInitials(message.author || 'Anonymous')}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">{message.author}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(message.created_at).toLocaleString()}
              </Typography>
              <Typography sx={{ mt: 1 }}>{message.content}</Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default MessageBoard;