import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Box, 
  Avatar, 
  Typography, 
  Button, 
  Paper,
  Container,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  TextField
} from '@mui/material';
import useCloudinaryUpload from '../hooks/useCloudinaryUpload';
import useApi from '../hooks/useApi';
import AuthTest from '../components/AuthTest';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';


function UserProfile() {
  const { uploadImage, uploading, uploadProgress } = useCloudinaryUpload();
  const { avatarUrl, setAvatarUrl, fetchUserProfile } = useUserProfile();
  const { callApi } = useApi();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState(0);
  const [userBands, setUserBands] = useState([]);
  const [favoriteBands, setFavoriteBands] = useState([]);
  const [savedShows, setSavedShows] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);  // Add this flag
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(null);
  const [claimedBands, setClaimedBands] = useState([]);
  const navigate = useNavigate();


  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUserProfile = async () => {
        if (isAuthenticated && !isLoaded) {
            try {
                console.log('Fetching profile from:', `${apiUrl}/users/profile`); // Debug URL
                const userProfile = await callApi(`${apiUrl}/users/profile`);
                if (userProfile?.username) {
                  setUsername(userProfile.username);
                }                console.log('Profile response:', userProfile);
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

const handleUsernameUpdate = async () => {
  try {
    setUsernameError(null);
    const response = await callApi(`${apiUrl}/users/username`, {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    setIsEditingUsername(false);
    // Show success message if you want
  } catch (error) {
    console.error('Error updating username:', error);
    setUsernameError('Failed to update username. Please try again.');
  }
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    setUploadError(null);
    // Upload to Cloudinary
    const imageUrl = await uploadImage(file, 'user-avatars');
    
    // Update database
    const response = await callApi(`${apiUrl}/users/avatar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarUrl: imageUrl }),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    setAvatarUrl(imageUrl);
    
    // Show success message
    setUploadSuccess(true);
    // Hide success message after 3 seconds
    setTimeout(() => setUploadSuccess(false), 3000);

  } catch (error) {
    console.error('Error uploading avatar:', error);
    setUploadError('Failed to update profile picture. Please try again.');
  }
};

  // Fetch user's bands and shows
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && !isLoaded) {
        try {
          // Existing fetch calls
          const bandsData = await callApi(`${apiUrl}/users/bands`);
          setUserBands(bandsData);
  
          const showsData = await callApi(`${apiUrl}/users/shows`);
          setSavedShows(showsData);
  
        // Update this line to use the correct endpoint
        const favoritesData = await callApi(`${apiUrl}/favorites`);  
        console.log('Fetched favorites:', favoritesData); // Debug log
        setFavoriteBands(favoritesData);
  
          // Add fetch for claimed bands  
          console.log('Fetching claimed bands...');
          const claimedData = await callApi(`${apiUrl}/bands/myclaims`);
          console.log('Received claimed bands:', claimedData);
          setClaimedBands(claimedData);
          
          setIsLoaded(true);
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };
  
    fetchUserData();
  }, [isAuthenticated, isLoaded]);


  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Please log in to view your profile</Typography>
        </Paper>
      </Container>
    );
  }
 
  return (
    <Container maxWidth="md">
{/*     <AuthTest /> */}

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        {/* Avatar and basic info section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={avatarUrl || user.picture}
            alt={user.name}
            sx={{ width: 120, height: 120 }}
          />
          {/* Upload progress overlay */}
          {uploading && (
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '50%',
                zIndex: 1  // Add this to ensure it shows above the avatar
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CircularProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ 
                    color: 'white',
                    zIndex: 2
                  }}
                />
                <Typography
                  variant="caption"
                  component="div"
                  color="white"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 3
                  }}
                >
                  {`${Math.round(uploadProgress)}%`}
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Edit button */}
          <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <label htmlFor="avatar-upload">
              <Button
                component="span"
                variant="contained"
                size="small"
                disabled={uploading}
                sx={{ 
                  minWidth: 'auto',
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.9)'
                  }
                }}
              >
                {uploading ? (
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress size={24} />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="white">
                        {uploadProgress}%
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  'Edit'
                )}
              </Button>
            </label>
          </Box>

          {/* Success/Error messages */}
          {uploadSuccess && (
            <Alert 
              severity="success" 
              sx={{ 
                position: 'absolute',
                bottom: -60,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              Profile picture updated!
            </Alert>
          )}

          {uploadError && (
            <Alert 
              severity="error"
              sx={{ 
                position: 'absolute',
                bottom: -60,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              {uploadError}
            </Alert>
          )}
        </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isEditingUsername ? (
          <>
            <TextField
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="small"
              error={!!usernameError}
              helperText={usernameError}
            />
            <Button 
              onClick={handleUsernameUpdate}
              variant="contained" 
              size="small"
            >
              Save
            </Button>
            <Button 
              onClick={() => setIsEditingUsername(false)}
              variant="outlined" 
              size="small"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4">{username || user.name}</Typography>
            <Button 
              onClick={() => setIsEditingUsername(true)}
              size="small"
              sx={{ ml: 1 }}
            >
              Edit
            </Button>
          </>
        )}
      </Box>

        <Box>
          <Typography color="textSecondary">{user.email}</Typography>
        </Box>
      </Box>

        {/* Tabs for bands and shows */}
        <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        mb: 3  // Add margin bottom for spacing
        }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ 
            '& .MuiTab-root': { 
              color: 'black',
              fontWeight: 500,
              fontSize: '1rem'
            },
            '& .Mui-selected': { 
              color: 'black',
              fontWeight: 600
            },
            '& .MuiTabs-indicator': { 
              backgroundColor: 'black',
              height: 2
            }
          }}
        >
          <Tab label="My Bands" />
          <Tab label="Claimed Bands" />
          <Tab label="Favorite Bands" />
          <Tab label="Saved Shows" />
        </Tabs>
        </Box>

        {/* Existing Bands Tab */}
        {activeTab === 0 && (
        <Box sx={{ pt: 2 }}>
            {userBands.length === 0 ? (
            <Typography sx={{ color: 'black', p: 2 }}>No bands added yet</Typography>
            ) : (
            userBands.map(band => (
                <Paper key={band.id} sx={{ p: 3, mb: 2, backgroundColor: '#fff', boxShadow: 2 }}>
                <Typography variant="h6" sx={{ color: 'black', mb: 1 }}>{band.name}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                    {band.relationship_type}
                </Typography>
                </Paper>
            ))
            )}
        </Box>
        )}

        {/* Add the Claimed Bands tab content */}
          {activeTab === 1 && (
            <Box sx={{ pt: 2 }}>
              {claimedBands.length === 0 ? (
                <Typography sx={{ color: 'black', p: 2 }}>No claimed bands yet</Typography>
              ) : (
                claimedBands.map(band => (
                  <Paper 
                    key={band.id} 
                    sx={{ 
                      p: 3, 
                      mb: 2, 
                      backgroundColor: '#fff', 
                      boxShadow: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                    onClick={() => navigate(`/bands/${band.slug}`)}
                  >
                    <Typography variant="h6" sx={{ color: 'black', mb: 1 }}>
                      {band.name}
                    </Typography>
                    {band.genre && (
                      <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                        {Array.isArray(band.genre) ? band.genre.join(', ') : band.genre}
                      </Typography>
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'success.main',
                        mt: 1
                      }}
                    >
                      Claimed on {new Date(band.claimed_at).toLocaleDateString()}
                    </Typography>
                  </Paper>
                ))
              )}
            </Box>
          )}

        {/* Favorite Bands Tab */}
        {activeTab === 2 && (
        <Box sx={{ pt: 2 }}>
            {favoriteBands.length === 0 ? (
            <Typography sx={{ color: 'black', p: 2 }}>No favorite bands yet</Typography>
            ) : (
            favoriteBands.map(band => (
                <Paper key={band.id} sx={{ p: 3, mb: 2, backgroundColor: '#fff', boxShadow: 2 }}>
                <Typography variant="h6" sx={{ color: 'black', mb: 1 }}>{band.name}</Typography>
                {band.genre && (
                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                    {Array.isArray(band.genre) ? band.genre.join(', ') : band.genre}
                    </Typography>
                )}
                </Paper>
            ))
            )}
        </Box>
        )}

        {/* Shows Tab */}
        {activeTab === 3 && (
        <Box sx={{ pt: 2 }}>
            {savedShows.length === 0 ? (
            <Typography sx={{ color: 'black', p: 2 }}>No saved shows yet</Typography>
            ) : (
            savedShows.map(show => (
                <Paper key={show.id} sx={{ p: 3, mb: 2, backgroundColor: '#fff', boxShadow: 2 }}>
                <Typography variant="h6" sx={{ color: 'black', mb: 1 }}>{show.title}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                    {new Date(show.date).toLocaleDateString()}
                </Typography>
                </Paper>
            ))
            )}
        </Box>
        )}
      </Paper>
    </Container>
  );
}

export default UserProfile;