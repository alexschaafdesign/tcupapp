import React, { useState, useEffect } from 'react';
import { Box, IconButton, Menu, MenuItem, Avatar, Badge, Tooltip, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { useUserProfile } from '../../hooks/useUserProfile';

const TopBar = () => {
  const { user, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const { avatarUrl, setAvatarUrl } = useUserProfile();
  const { callApi } = useApi();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State for profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
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
  
  // Sample notifications (replace with actual data)
  const notifications = [
    { id: 1, text: "New venue review submitted", read: false },
    { id: 2, text: "Someone replied to your post", read: false },
    { id: 3, text: "New show added at Amsterdam Bar", read: true },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };
  
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin
      }
    });
  };
  
  return (
    <Box 
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: { xs: 0, md: '224px' },
        height: '60px',
        background: 'linear-gradient(90deg, #7C60DD 0%, #9375FF 100%)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 20px',
        "& *": { zIndex: 2 },
        "&::before": {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'url("https://res.cloudinary.com/dsll3ms2c/image/upload/v1740149767/noisebg2_for_header_mf37pv.png")',
          backgroundSize: '200px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          opacity: 0.4,
          zIndex: 1,
        },
      }}
    >
      {/* Notification Section */}
      <Box sx={{ mr: 2 }}>
        <Tooltip title="Notifications">
          <IconButton onClick={handleNotificationClick} sx={{ color: 'white' }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: { width: 320, maxHeight: 300 }
          }}
        >
          <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
            Notifications
          </Typography>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <MenuItem 
                key={notification.id} 
                onClick={handleNotificationClose}
                sx={{ 
                  whiteSpace: 'normal',
                  backgroundColor: notification.read ? 'transparent' : 'rgba(124, 96, 221, 0.1)',
                  '&:hover': {
                    backgroundColor: notification.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(124, 96, 221, 0.2)'
                  }
                }}
              >
                {notification.text}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No notifications</MenuItem>
          )}
        </Menu>
      </Box>
    
      
      {/* User Profile */}
      <Box>
        <Tooltip title={user?.name || "User Profile"}>
          <IconButton onClick={handleProfileClick}>
            <Avatar 
              src={avatarUrl || user?.picture}
              alt={user?.name || "User"} 
              sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileClose}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {username || user?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {user?.email}
            </Typography>
          </Box>
          <MenuItem onClick={() => { window.location.href = '/profile'; handleProfileClose(); }}>
            My Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default TopBar;