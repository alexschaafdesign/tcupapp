import { useAuth0 } from '@auth0/auth0-react';
import { Box, Avatar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';

function HeaderUserProfile() {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const { avatarUrl } = useUserProfile();

  // Add console logs
  console.log('HeaderUserProfile - isAuthenticated:', isAuthenticated);
  console.log('HeaderUserProfile - avatarUrl:', avatarUrl);
  console.log('HeaderUserProfile - user:', user);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleNavigation = () => {
    navigate('/profile');
  };

  return (
    <Box sx={{ 
      padding: 2,
      color: 'white',
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
            {user.name}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default HeaderUserProfile;