import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Tooltip,
  Fade,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import useCloudinaryUpload from '../../hooks/useCloudinaryUpload';
import useApi from '../../hooks/useApi';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';
import ProfileImageAdjuster from "../../components/ProfileImageAdjuster";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import palette from '../../styles/colors/palette';
import { useAuth } from '../../hooks/useAuth';

function UserProfile() {
  const { uploadImage, uploading, uploadProgress } = useCloudinaryUpload();
  const { avatarUrl, setAvatarUrl } = useUserProfile();
  const { callApi } = useApi();
  const { getAccessTokenSilently, user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const { isAdmin } = useAuth(); // Add this to check admin role
  


  // Profile info state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(null);
  const [isChangingUsername, setIsChangingUsername] = useState(false);

  const [isEditingTagline, setIsEditingTagline] = useState(false);
  const [tagline, setTagline] = useState('');
  const [taglineError, setTaglineError] = useState(null);
  const [isChangingTagline, setIsChangingTagline] = useState(false);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isChangingBio, setIsChangingBio] = useState(false);

  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Data arrays for bands and shows
  const [userBands, setUserBands] = useState([]);
  const [claimedBands, setClaimedBands] = useState([]);
  const [favoriteBands, setFavoriteBands] = useState([]);
  const [savedShows, setSavedShows] = useState([]);

  // Other UI states
  const [uploadError, setUploadError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  
  // Success messages
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Join date (would normally come from API)
  const joinDate = new Date(2023, 10, 15).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    async function checkToken() {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          console.log("Token retrieved successfully:", token ? "Yes" : "No");
          
          // Test a direct fetch with this token
          const response = await fetch(`${apiUrl}/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log("Direct fetch status:", response.status);
        } catch (error) {
          console.error("Token retrieval error:", error);
        }
      }
    }
    
    checkToken();
  }, [isAuthenticated, getAccessTokenSilently, apiUrl]);

  const handleTaglineUpdate = async () => {
    if (tagline.length > 16) {
      setTaglineError('Tagline must be 16 characters or less');
      return;
    }
    
    try {
      setTaglineError(null);
      setIsChangingTagline(true);
      
      const response = await callApi(`${apiUrl}/users/tagline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagline }),
      });
  
      if (response.error) throw new Error(response.error);
      
      setIsEditingTagline(false);
      setSuccessMessage('Tagline updated successfully');
      setShowSuccess(true);
    } catch (error) {
      setTaglineError('Failed to update tagline. Please try again.');
    } finally {
      setIsChangingTagline(false);
    }
  };

  // Requirements for changing password 
  const PasswordRequirements = ({ password }) => {
    const requirements = [
      {
        test: (p) => p.length >= 8,
        text: "At least 8 characters"
      },
      {
        test: (p) => /[A-Z]/.test(p),
        text: "At least one uppercase letter"
      },
      {
        test: (p) => /[a-z]/.test(p),
        text: "At least one lowercase letter"
      },
      {
        test: (p) => /[0-9]/.test(p),
        text: "At least one number"
      },
      {
        test: (p) => /[!@#$%^&*]/.test(p),
        text: "At least one special character (!@#$%^&*)"
      }
    ];
  
    return (
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Password Requirements:
        </Typography>
        {requirements.map((req, index) => (
          <Box 
            key={index} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: req.test(password) ? 'success.main' : 'text.secondary',
              mb: 0.5
            }}
          >
            {req.test(password) ? (
              <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
            ) : (
              <CancelOutlinedIcon sx={{ fontSize: 16 }} />
            )}
            <Typography variant="body2">{req.text}</Typography>
          </Box>
        ))}
      </Box>
    );
  };

  // Fetch the profile info and related data in one effect
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && !isLoaded) {
        try {
          // Get profile information
          const profileData = await callApi(`${apiUrl}/users/profile`);
          if (profileData) {
            if (profileData.username) setUsername(profileData.username);
            if (profileData.avatar_url) setAvatarUrl(profileData.avatar_url);
            if (profileData.email) setEmail(profileData.email);
            if (profileData.tagline) setTagline(profileData.tagline);
            if (profileData.bio) setBio(profileData.bio);
          }
          // Get additional user data
          const [bandsData, showsData, favoritesData, claimedData] = await Promise.all([
            callApi(`${apiUrl}/users/bands`),
            callApi(`${apiUrl}/users/shows`),
            callApi(`${apiUrl}/favorites`),
            callApi(`${apiUrl}/bands/myclaims`),
          ]);
          setUserBands(bandsData || []);
          setSavedShows(showsData || []);
          setFavoriteBands(favoritesData || []);
          setClaimedBands(claimedData || []);
          setIsLoaded(true);
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };

    fetchData();
  }, [isAuthenticated, isLoaded, callApi, apiUrl, setAvatarUrl]);

  // === Avatar Upload / Removal Handlers ===
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    try {
      setUploadError(null);
      const imageUrl = await uploadImage(file, 'user-avatars');

      const response = await callApi(`${apiUrl}/users/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: imageUrl }),
      });

      if (response.error) throw new Error(response.error);
      setAvatarUrl(imageUrl);
      setSuccessMessage('Profile picture updated successfully!');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError('Failed to update profile picture. Please try again.');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const response = await callApi(`${apiUrl}/users/avatar`, {
        method: 'DELETE',
      });

      if (response.error) throw new Error(response.error);
      setAvatarUrl(null);
      setShowRemoveDialog(false);
      setSuccessMessage('Profile picture removed successfully!');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error removing avatar:', error);
      setUploadError('Failed to remove profile picture. Please try again.');
    }
  };

  // === Profile Info Update Handlers ===
  const handleUsernameUpdate = async () => {
    if (!username) {
      setUsernameError('Username cannot be empty');
      return;
    }
    
    try {
      setUsernameError(null);
      setIsChangingUsername(true);
      
      const response = await callApi(`${apiUrl}/users/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (response.error) throw new Error(response.error);
      
      setIsEditingUsername(false);
      setSuccessMessage('Username updated successfully!');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameError('Failed to update username. Please try again.');
    } finally {
      setIsChangingUsername(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    try {
      setEmailError(null);
      setIsChangingEmail(true);
      
      const response = await callApi(`${apiUrl}/users/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      if (response.error) throw new Error(response.error);
      
      setIsEditingEmail(false);
      setSuccessMessage('Email updated successfully!');
      setShowSuccess(true);
    } catch (error) {
      setEmailError('Failed to update email. Please try again.');
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleBioUpdate = async () => {
    try {
      setIsChangingBio(true);
      
      const response = await callApi(`${apiUrl}/users/bio`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });
  
      if (response.error) throw new Error(response.error);
      
      setIsEditingBio(false);
      setSuccessMessage('Bio updated successfully!');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error updating bio:', error);
    } finally {
      setIsChangingBio(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    try {
      setPasswordError(null);
      setIsChangingPassword(true);
      
      const response = await callApi(`${apiUrl}/users/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.error) throw new Error(response.error);
      
      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password changed successfully!');
      setShowSuccess(true);
    } catch (error) {
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  // While data is loading
  if (isLoading || !isLoaded) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // If not logged in
  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Please log in to view your profile</Typography>
        </Paper>
      </Container>
    );
  }

  // Decide which bands to show (use claimedBands if available, otherwise userBands)
  const bandsToShow = claimedBands.length > 0 ? claimedBands : userBands;

  return (
    <Container maxWidth="lg">
      <Snackbar 
        open={showSuccess} 
        autoHideDuration={4000} 
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSuccess} 
          severity="success" 
          sx={{ width: '100%' }}
          elevation={6}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Modern Profile Card */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          mt: 4,
          mb: 4
        }}
      >
        {/* Header with background color */}
        <Box sx={{ 
          height: '120px', 
          background: palette.secondary.main,
          position: 'relative'
        }}>
          {isAdmin && (
         <Chip 
            label="Admin" 
            color="secondary" 
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16,
              background: 'rgba(255,255,255,0.9)',
              color: '#673ab7',
              fontWeight: 'bold'
            }} 
          />
          )}
        </Box> 
        
        {/* Main content */}
        <Box sx={{ px: 4, pb: 4, position: 'relative' }}>
          {/* Avatar - positioned to overlap the header */}
          <Box 
            sx={{ 
              position: 'relative',
              mt: '-60px',
              mb: 3,
              width: 120,
              height: 120,
              mx: 'auto'
            }}
            onMouseEnter={() => setImageHover(true)}
            onMouseLeave={() => setImageHover(false)}
          >
            <Avatar
              src={avatarUrl || user?.picture} 
              alt="Profile"
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s ease',
                filter: imageHover ? 'brightness(0.8)' : 'brightness(1)'
              }}
            />
            <Fade in={imageHover}>
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('profile-image-input').click()}
              >
                <PhotoCameraIcon sx={{ color: 'white', mb: 1 }} />
                <Typography variant="caption" sx={{ color: 'white' }}>
                  Change Photo
                </Typography>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleAvatarUpload(e.target.files[0]);
                    }
                  }}
                />
              </Box>
            </Fade>
          </Box>

          {/* Username Heading */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {username || user?.name}
            </Typography>
            <Typography variant="subtitle1" color="primary" sx={{ mt: 0.5 }}>
              {tagline || []}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Joined {joinDate}
            </Typography>
          </Box>

          {/* Biography section */}
          <Box sx={{ mb: 3, mx: 'auto', maxWidth: '600px' }}>
            {isEditingBio ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  multiline
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio about yourself..."
                  fullWidth
                  variant="outlined"
                  disabled={isChangingBio}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    onClick={() => setIsEditingBio(false)} 
                    variant="outlined"
                    startIcon={<CloseIcon />}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBioUpdate} 
                    variant="contained"
                    disabled={isChangingBio}
                    startIcon={isChangingBio ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                <Typography variant="body1" color="text.primary" sx={{ fontStyle: bio ? 'normal' : 'italic' }}>
                  {bio || "Add a bio to tell people about yourself..."}
                </Typography>
                <IconButton 
                  size="small" 
                  sx={{ 
                    position: 'absolute', 
                    right: -8, 
                    top: -8,
                    color: 'primary.main',
                    '&:hover': { background: 'rgba(103, 58, 183, 0.1)' }
                  }}
                  onClick={() => setIsEditingBio(true)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Profile Details in a cleaner layout */}
          <Grid container spacing={3} sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Profile Details
              </Typography>
            </Grid>
            
            {/* Username */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Username
                  </Typography>
                    {!isEditingUsername && (
                 <Tooltip title="Edit username">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => setIsEditingUsername(true)}
                        sx={{ '&:hover': { background: 'rgba(103, 58, 183, 0.1)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                
                {isEditingUsername ? (
                  <Fade in={isEditingUsername}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <TextField
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        size="small"
                        fullWidth
                        error={!!usernameError}
                        helperText={usernameError}
                        disabled={isChangingUsername}
                        autoFocus
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={handleUsernameUpdate} 
                          disabled={isChangingUsername}
                          sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          {isChangingUsername ? <CircularProgress size={20} /> : <CheckIcon />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => setIsEditingUsername(false)}
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                        >
                          <CloseIcon />
                        </IconButton>
                       
                      </Box>
                    </Box>
                    
                  </Fade>
                  
                ) : (
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {username || user?.name}
                  </Typography>
                   
                )}
                
              </Box>
            </Grid>
            
            {/* Tagline */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tagline
                  </Typography>
                  {!isEditingTagline && (
                    <Tooltip title="Edit tagline">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => setIsEditingTagline(true)}
                        sx={{ '&:hover': { background: 'rgba(103, 58, 183, 0.1)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                
                {isEditingTagline ? (
                  <Fade in={isEditingTagline}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <TextField
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        size="small"
                        fullWidth
                        error={!!taglineError}
                        helperText={taglineError || `${tagline.length}/16 characters`}
                        inputProps={{ maxLength: 16 }}
                        disabled={isChangingTagline}
                        autoFocus
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={handleTaglineUpdate} 
                          disabled={isChangingTagline}
                          sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          {isChangingTagline ? <CircularProgress size={20} /> : <CheckIcon />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => setIsEditingTagline(false)}
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Fade>
                ) : (
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {tagline || []}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            {/* Email - temporarily disabled
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  {!isEditingEmail && (
                    <Tooltip title="Edit email">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => setIsEditingEmail(true)}
                        sx={{ '&:hover': { background: 'rgba(103, 58, 183, 0.1)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                
                {isEditingEmail ? (
                  <Fade in={isEditingEmail}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <TextField
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="small"
                        fullWidth
                        error={!!emailError}
                        helperText={emailError}
                        disabled={isChangingEmail}
                        autoFocus
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={handleEmailUpdate} 
                          disabled={isChangingEmail}
                          sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          {isChangingEmail ? <CircularProgress size={20} /> : <CheckIcon />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => setIsEditingEmail(false)}
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Fade>
                ) : (
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {email}
                  </Typography>
                )}
              </Box>
            </Grid> */}

            {/* Email - Read only version */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {email}
                  </Typography>
                </Box>
              </Grid>
            
            {/* Password */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Password
                  </Typography>
                  <Tooltip title="Change password">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => setShowPasswordDialog(true)}
                      sx={{ '&:hover': { background: 'rgba(103, 58, 183, 0.1)' } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  ••••••••
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Bands Section with improved styling */}
<Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
      Your Bands
    </Typography>
    <Button variant="contained" color="primary" size="small">
      Add Band
    </Button>
  </Box>
  {bandsToShow.length === 0 ? (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        textAlign: 'center', 
        bgcolor: 'background.default',
        borderStyle: 'dashed'
      }}
    >
      <Typography sx={{ color: 'text.secondary' }}>No bands added yet</Typography>
    </Paper>
  ) : (
    <Grid container spacing={2}>
      {bandsToShow.map((band) => (
        <Grid item xs={12} sm={6} md={4} key={band.id}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              cursor: 'pointer',
              borderRadius: 2,
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': { 
                boxShadow: 6,
                transform: 'translateY(-4px)' 
              },
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => navigate(`/bands/${band.slug}`)}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{band.name}</Typography>
            {band.genre && (
              <Chip 
                label={Array.isArray(band.genre) ? band.genre.join(', ') : band.genre}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              />
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  )}
</Paper>

{/* Favorite Bands Section */}
<Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
    Favorite Bands
  </Typography>
  {favoriteBands.length === 0 ? (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        textAlign: 'center', 
        bgcolor: 'background.default',
        borderStyle: 'dashed'
      }}
    >
      <Typography sx={{ color: 'text.secondary' }}>No favorite bands yet</Typography>
    </Paper>
  ) : (
    <Grid container spacing={2}>
      {favoriteBands.map((band) => (
        <Grid item xs={12} sm={6} md={4} key={band.id}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              cursor: 'pointer',
              borderRadius: 2,
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': { 
                boxShadow: 6,
                transform: 'translateY(-4px)' 
              },
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => navigate(`/bands/${band.slug}`)}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{band.name}</Typography>
            {band.genre && (
              <Chip 
                label={Array.isArray(band.genre) ? band.genre.join(', ') : band.genre}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              />
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  )}
</Paper>

{/* Saved Shows Section */}
<Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
    Saved Shows
  </Typography>
  {savedShows.length === 0 ? (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        textAlign: 'center', 
        bgcolor: 'background.default',
        borderStyle: 'dashed'
      }}
    >
      <Typography sx={{ color: 'text.secondary' }}>No saved shows yet</Typography>
    </Paper>
  ) : (
    <Grid container spacing={2}>
      {savedShows.map((show) => (
        <Grid item xs={12} sm={6} md={4} key={show.id}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              cursor: 'pointer',
              borderRadius: 2,
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': { 
                boxShadow: 6,
                transform: 'translateY(-4px)' 
              },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onClick={() => navigate(`/shows/${show.id}`)}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{show.title}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Chip 
                label={new Date(show.date).toLocaleDateString()} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )}
</Paper>

{/* Dialog for removing avatar */}
<Dialog 
  open={showRemoveDialog} 
  onClose={() => setShowRemoveDialog(false)}
  PaperProps={{
    sx: { borderRadius: 2 }
  }}
>
  <DialogTitle sx={{ pb: 1 }}>Remove Profile Picture</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to remove your profile picture?
    </DialogContentText>
  </DialogContent>
  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button onClick={() => setShowRemoveDialog(false)}>Cancel</Button>
    <Button 
      onClick={handleRemoveAvatar} 
      color="error" 
      variant="contained"
      sx={{ borderRadius: 1.5 }}
    >
      Remove
    </Button>
  </DialogActions>
</Dialog>

{/* Dialog for changing password */}
<Dialog 
  open={showPasswordDialog} 
  onClose={() => setShowPasswordDialog(false)}
  PaperProps={{
    sx: { borderRadius: 2 }
  }}
>
  <DialogTitle sx={{ pb: 1 }}>Change Password</DialogTitle>
  <form onSubmit={(e) => {
    e.preventDefault();
    handlePasswordUpdate();
  }}>
    <DialogContent>
      <TextField
        autoComplete="current-password"
        name="current-password"
        margin="dense"
        label="Current Password"
        type={showCurrentPassword ? "text" : "password"}
        fullWidth
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
          sx: { borderRadius: 1.5 }
        }}
      />

      <TextField
        autoComplete="new-password"
        name="new-password"
        margin="dense"
        label="New Password"
        type={showNewPassword ? "text" : "password"}
        fullWidth
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
          sx: { borderRadius: 1.5 }
        }}
      />

      <TextField
        autoComplete="new-password"
        name="confirm-password"
        margin="dense"
        label="Confirm New Password"
        type={showConfirmPassword ? "text" : "password"}
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
          sx: { borderRadius: 1.5 }
        }}
      />
      
      <PasswordRequirements password={newPassword} />
      
      {passwordError && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {passwordError}
        </Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button type="button" onClick={() => setShowPasswordDialog(false)}>
        Cancel
      </Button>
      <Button 
        type="submit" 
        variant="contained" 
        disabled={isChangingPassword}
        sx={{ borderRadius: 1.5 }}
      >
        {isChangingPassword ? <CircularProgress size={24} /> : 'Change Password'}
      </Button>
    </DialogActions>
  </form>
</Dialog>
    </Container>
  );
}

export default UserProfile;