import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Avatar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { useUserProfile } from '../../hooks/useUserProfile';

function HeaderUserProfile({ closeDrawer }) {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const { avatarUrl, setAvatarUrl, fetchUserProfile } = useUserProfile();
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUsername] = useState('');
  
  const apiUrl = process.env.REACT_APP_API_URL;
  const { callApi } = useApi();
  
  // Add console logs
  console.log('HeaderUserProfile - isAuthenticated:', isAuthenticated);
  console.log('HeaderUserProfile - avatarUrl:', avatarUrl);
  console.log('HeaderUserProfile - user:', user);

  useEffect(() => {
    const fetchUserProfile = async () => {
        if (isAuthenticated && !isLoaded) {
            try {
                console.log('Fetching profile from:', `${apiUrl}/users/profile`); // Debug URL
                const userProfile = await callApi(`${apiUrl}/users/profile`);
                if (userProfile?.username) {
                  setUsername(userProfile.username);
                }                
                console.log('Profile response:', userProfile);
                if (userProfile?.avatar_url) {
                    setAvatarUrl(userProfile.avatar_url);
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
            }
        }
    };

    fetchUserProfile();
}, [isAuthenticated, isLoaded]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleNavigation = () => {
    navigate('/profile');
    // Close the drawer if closeDrawer function is provided
    if (closeDrawer) {
      closeDrawer();
    }
  };

  return (
    <Box sx={{ 
      padding: 2,
      color: 'black',
      cursor: 'pointer'
    }}
    onClick={handleNavigation}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        gap: 1
      }}>
        <Avatar 
          src={avatarUrl || user?.picture}
          alt={user.name}
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: 'primary.light'
          }}
        >
          {user.name?.charAt(0)}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {username}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default HeaderUserProfile;