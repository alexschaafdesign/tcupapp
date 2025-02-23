import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Avatar, Tooltip, Typography, Paper, ClickAwayListener } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import useApi from '../../hooks/useApi';
import { useUserProfile } from '../../hooks/useUserProfile';
import Breadcrumbs from './Breadcrumbs';
import NotificationBell from './NotificationBell';

const TopBar = () => {
  const { user, logout, isAuthenticated } = useAuth0();
  const { avatarUrl, setAvatarUrl } = useUserProfile();
  const { callApi } = useApi();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State for dropdowns
  const [profileOpen, setProfileOpen] = useState(false);
  
  // References to button elements
  const profileBtnRef = useRef(null);
  
  // References to dropdown elements
  const profileDropdownRef = useRef(null);
  
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
      <NotificationBell />
    
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