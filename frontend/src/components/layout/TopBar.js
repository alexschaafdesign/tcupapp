import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Avatar, Tooltip, Typography, Paper, ClickAwayListener, Button, Menu, MenuItem, Badge } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import useApi from '../../hooks/useApi';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import NotificationBell from './NotificationBell';
import palette from '../../styles/colors/palette';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MailIcon from "@mui/icons-material/Mail"; // Import the inbox/mail icon
import MessageBadge from '../../pages/DirectMessages.js/MessageBadge';

const TopBar = ({ isPublic = false }) => {
  // Existing state and hooks
  const { user, logout, isAuthenticated, loginWithRedirect } = useAuth0();
  const { avatarUrl, setAvatarUrl } = useUserProfile();
  const { callApi } = useApi();
  const { isAdmin } = useAuth(); // Add this to check admin role
  const apiUrl = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  
  // State for dropdowns
  const [profileOpen, setProfileOpen] = useState(false);
  
  // State for unread messages count
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // References to button elements
  const profileBtnRef = useRef(null);
  const adminBtnRef = useRef(null);
  

  
  // Existing useEffect and handlers
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && !isLoaded) {
        try {
          const userProfile = await callApi(`${apiUrl}/users/profile`);
          if (userProfile?.username) {
            setUsername(userProfile.username);
          }
          if (userProfile?.avatar_url) {
            setAvatarUrl(userProfile.avatar_url);
          }
          setIsLoaded(true);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, isLoaded, apiUrl, callApi, setAvatarUrl]);
  
  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (isAuthenticated) {
        try {
          const conversations = await callApi(`${apiUrl}/direct-messages/conversations`);
          // Now each conversation has `unread_count` for the current user
          const totalUnread = conversations.reduce(
            (sum, conv) => sum + (conv.unread_count || 0),
            0
          );
          setUnreadMessages(totalUnread);
        } catch (err) {
          console.error('Error fetching unread messages:', err);
        }
      }
    };

    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 60000); // e.g. poll every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, apiUrl, callApi]);
  
  const handleProfileClick = () => {
    setProfileOpen(prev => !prev);
  };
  
  const handleProfileClose = () => {
    setProfileOpen(false);
  };


  
  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin
      }
    });
  };

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleRegister = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  };
  
  const handleMessageClick = () => {
    navigate('/messages');
  };
  
  // Calculate dropdown positions using refs
  const getDropdownStyle = (buttonRef) => {
    if (!buttonRef.current) return {};
    
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom + 5,
      right: window.innerWidth - rect.right,
      zIndex: 9999,
      boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
      backgroundColor: 'white',
      borderRadius: '4px',
      overflow: 'hidden'
    };
  };

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: palette.primary.main, padding: '0 20px', height: '60px' }}>
      {/* Left-aligned Breadcrumbs, starting at the right edge of the nav bar */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', marginLeft: '200px' }}>
        <Breadcrumbs />
      </Box>
          
      {/* Admin menu - Only show for admins on desktop */}
      {isAuthenticated && isAdmin && (
        <Box sx={{ display: { xs: 'none', md: 'block' }, mr: 2 }}>
          <Button 
            variant="text" 
            onClick={() => navigate('/admin')}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': { 
                borderColor: 'white', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              }
            }}
          >
            ADMIN
          </Button>
        </Box>
      )}


     {/* Message icon - Only show when authenticated  */}
     {isAuthenticated && (
        <Box sx={{ mr: 2 }}>
          <MessageBadge iconColor="white" />
        </Box>
      )}
      {/* Notification Section - Only show when authenticated */}
      {isAuthenticated && <NotificationBell />}
    
      {/* User Profile or Login/Register Buttons */}
      {isAuthenticated ? (
        <Box>
          <Tooltip title={user?.name || "User Profile"}>
            <IconButton 
              onClick={handleProfileClick}
              ref={profileBtnRef}
            >
              <Avatar 
                src={avatarUrl || user?.picture}
                alt={user?.name || "User"} 
                sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          {profileOpen && (
            <ClickAwayListener onClickAway={handleProfileClose}>
              <Paper 
                sx={{
                  ...getDropdownStyle(profileBtnRef),
                  width: '240px'
                }}
              >
                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {username || user?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {user?.email}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                  onClick={() => { 
                    navigate(`/profile/${user.sub}`);
                    handleProfileClose();
                  }}
                >
                  My Profile
                </Box>
                
                <Box 
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </Box>
              </Paper>
            </ClickAwayListener>
          )}
        </Box>
      ) : (
        // Authentication buttons for non-logged in users
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleLogin}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': { 
                borderColor: 'white', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              }
            }}
          >
            Log In
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRegister}
            sx={{ 
              backgroundColor: 'white', 
              color: 'primary.main',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.9)' 
              }
            }}
          >
            Register
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TopBar;