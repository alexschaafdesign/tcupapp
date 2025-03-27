import React, { useState, useEffect, useContext, createContext } from 'react';
import { Badge, Tooltip, IconButton } from '@mui/material';
import MailIcon from "@mui/icons-material/Mail";
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a context to share the unread count and refresh function
export const MessageContext = createContext({
  unreadCount: 0,
  refreshUnreadCount: () => {},
});

// Provider component to wrap your app
export const MessageProvider = ({ children }) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

  const fetchUnreadMessages = async () => {
    if (isAuthenticated && user?.sub) {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/direct-messages/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) return;
        
        const conversations = await response.json();
        
        let totalUnread = 0;
        
        if (Array.isArray(conversations)) {
          for (const conv of conversations) {
            if (conv.unread_count && 
                typeof conv.unread_count === 'number' && 
                conv.unread_count > 0) {
              totalUnread += conv.unread_count;
            }
          }
        }
        
        setUnreadMessageCount(totalUnread);
      } catch (err) {
        console.error('Error fetching unread messages:', err);
      }
    }
  };

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      // Subscribe to direct_messages table for inserts where this user is the recipient
      const subscription = supabase
        .channel('new-direct-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `recipient_id=eq.${user.sub}`
          },
          (payload) => {
            console.log('New message received!', payload);
            // Immediately refresh unread count when a new message is received
            fetchUnreadMessages();
          }
        )
        .subscribe();

      // Also subscribe to updates on conversations table
      const conversationSubscription = supabase
        .channel('conversation-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations'
          },
          (payload) => {
            console.log('Conversation updated!', payload);
            // If this update affects unread counts, refresh
            fetchUnreadMessages();
          }
        )
        .subscribe();

      // Initial fetch
      fetchUnreadMessages();
      
      // Poll occasionally as a fallback
      const interval = setInterval(fetchUnreadMessages, 60000);
      
      return () => {
        // Clean up subscriptions and interval
        subscription.unsubscribe();
        conversationSubscription.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, user?.sub]);

  return (
    <MessageContext.Provider 
      value={{ 
        unreadCount: unreadMessageCount, 
        refreshUnreadCount: fetchUnreadMessages 
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Hook to easily access the message context
export const useMessages = () => useContext(MessageContext);

/**
 * Reusable component for displaying message icon with unread count badge
 * Uses the shared context for consistent unread counts
 */
const MessageBadge = ({ 
  iconColor = 'inherit', 
  iconSize = 'medium',
  buttonSx = {}
}) => {
  const { unreadCount } = useMessages();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/messages');
  };

  return (
    <Tooltip title="Messages">
      <IconButton
        onClick={handleClick}
        sx={{ 
          color: iconColor,
          ...buttonSx
        }}
      >
        {unreadCount > 0 ? (
          <Badge badgeContent={unreadCount} color="error">
            <MailIcon fontSize={iconSize} />
          </Badge>
        ) : (
          <MailIcon fontSize={iconSize} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default MessageBadge;