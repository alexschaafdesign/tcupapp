import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Avatar, Badge, Tooltip, Typography, Paper, ClickAwayListener } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth0 } from '@auth0/auth0-react';
import useApi from '../../hooks/useApi';
import { useUserProfile } from '../../hooks/useUserProfile';
import Breadcrumbs from './Breadcrumbs';

const TopBar = () => {
  const { user, logout, isAuthenticated } = useAuth0();
  const { avatarUrl, setAvatarUrl } = useUserProfile();
  const { callApi } = useApi();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State for dropdowns
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // References to button elements
  const profileBtnRef = useRef(null);
  const notificationBtnRef = useRef(null);
  
  // References to dropdown elements
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  
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
  
  // Sample notifications
  const notifications = [
    { id: 1, text: "New venue review submitted", read: false },
    { id: 2, text: "Someone replied to your post", read: false },
    { id: 3, text: "New show added at Amsterdam Bar", read: true },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleProfileClick = () => {
    setProfileOpen(prev => !prev);
    setNotificationOpen(false); // Close other dropdown
  };
  
  const handleNotificationClick = () => {
    setNotificationOpen(prev => !prev);
    setProfileOpen(false); // Close other dropdown
  };
  
  const handleProfileClose = () => {
    setProfileOpen(false);
  };
  
  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };
  
  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin
      }
    });
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
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, #7C60DD 0%, #9375FF 100%)', padding: '0 20px', height: '60px' }}>
    {/* Left-aligned Breadcrumbs, starting at the right edge of the nav bar */}
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', marginLeft: '200px' }}>
      <Breadcrumbs />
    </Box>
      {/* Notification Section */}
      <Box sx={{ mr: 2 }}>
        <Tooltip title="Notifications">
          <IconButton 
            onClick={handleNotificationClick} 
            sx={{ color: 'white' }}
            ref={notificationBtnRef}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        {notificationOpen && (
          <ClickAwayListener onClickAway={handleNotificationClose}>
            <Paper 
              ref={notificationDropdownRef}
              sx={{
                ...getDropdownStyle(notificationBtnRef),
                width: '320px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}
            >
              <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
                Notifications
              </Typography>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    onClick={handleNotificationClose}
                    sx={{
                      px: 2,
                      py: 1,
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      whiteSpace: 'normal',
                      bgcolor: notification.read ? 'transparent' : 'rgba(124, 96, 221, 0.1)',
                      '&:hover': {
                        bgcolor: notification.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(124, 96, 221, 0.2)'
                      }
                    }}
                  >
                    {notification.text}
                  </Box>
                ))
              ) : (
                <Box sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                  No notifications
                </Box>
              )}
            </Paper>
          </ClickAwayListener>
        )}
      </Box>
    
      {/* User Profile */}
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
              ref={profileDropdownRef}
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
                  window.location.href = '/profile'; 
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
    </Box>
  );
};

export default TopBar;