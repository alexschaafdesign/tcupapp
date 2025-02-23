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
} from '@mui/material';
import useCloudinaryUpload from '../../hooks/useCloudinaryUpload';
import useApi from '../../hooks/useApi';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';
import ProfileImageAdjuster from "../../components/ProfileImageAdjuster";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';



function UserProfile() {
  const { uploadImage, uploading, uploadProgress } = useCloudinaryUpload();
  const { avatarUrl, setAvatarUrl } = useUserProfile();
  const { callApi } = useApi();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Profile info state

  // Editing username
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(null);

  // Editing title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState(null);



  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email change state
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [emailError, setEmailError] = useState(null);


  // Data arrays for bands and shows
  const [userBands, setUserBands] = useState([]);
  const [claimedBands, setClaimedBands] = useState([]);
  const [favoriteBands, setFavoriteBands] = useState([]);
  const [savedShows, setSavedShows] = useState([]);

  // Other UI states
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleTitleUpdate = async () => {
    try {
      setTitleError(null);
      const response = await callApi(`${apiUrl}/users/title`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
  
      if (response.error) throw new Error(response.error);
      setIsEditingTitle(false);
    } catch (error) {
      setTitleError('Failed to update title. Please try again.');
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
            if (profileData.title) setTitle(profileData.title);
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
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
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
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error removing avatar:', error);
      setUploadError('Failed to remove profile picture. Please try again.');
    }
  };

  // === Profile Info Update Handlers ===
  const handleUsernameUpdate = async () => {
    try {
      setUsernameError(null);
      const response = await callApi(`${apiUrl}/users/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (response.error) throw new Error(response.error);
      setIsEditingUsername(false);
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameError('Failed to update username. Please try again.');
    }
  };

  const handleEmailUpdate = async () => {
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
      setShowEmailSuccess(true);
      setTimeout(() => setShowEmailSuccess(false), 3000);
    } catch (error) {
      setEmailError('Failed to update email. Please try again.');
    } finally {
      setIsChangingEmail(false);
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
      setShowPasswordSuccess(true);
      setTimeout(() => setShowPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
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

    {showPasswordSuccess && (
      <Alert 
        severity="success" 
        sx={{ 
          position: 'fixed', 
          top: 24, 
          right: 24, 
          zIndex: 2000 
        }}
      >
        Password updated successfully!
      </Alert>
    )}

    {showEmailSuccess && (
      <Alert 
        severity="success" 
        sx={{ 
          position: 'fixed', 
          top: 24, 
          right: 24, 
          zIndex: 2000 
        }}
      >
        Email updated successfully!
      </Alert>
    )}

      {/* Profile Info Section */}
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
          {/* Avatar / Image Adjuster */}
          <Box sx={{ position: 'relative' }}>
            <ProfileImageAdjuster
              initialImage={avatarUrl || user.picture}
              onSave={handleAvatarUpload}
              onDelete={() => setShowRemoveDialog(true)}
              isUploading={uploading}
              uploadProgress={uploadProgress}
            />
            {uploadSuccess && (
              <Alert
                severity="success"
                sx={{
                  position: 'absolute',
                  bottom: -60,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
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
                  whiteSpace: 'nowrap',
                }}
              >
                {uploadError}
              </Alert>
            )}
          </Box>

          {/* Profile Details */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Profile Information
            </Typography>

            {/* Username */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Username:</Typography>
              {isEditingUsername ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TextField
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    size="small"
                    error={!!usernameError}
                    helperText={usernameError}
                  />
                  <Button onClick={handleUsernameUpdate} variant="contained" sx={{ ml: 1 }}>
                    Save
                  </Button>
                  <Button onClick={() => setIsEditingUsername(false)} variant="outlined" sx={{ ml: 1 }}>
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography>{username || user.name}</Typography>
                  <Button onClick={() => setIsEditingUsername(true)} size="small" sx={{ ml: 1 }}>
                    Edit
                  </Button>
                </Box>
              )}
            </Box>

            {/* Title */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Title:</Typography>
              {isEditingTitle ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TextField
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="small"
                    error={!!titleError}
                    helperText={titleError || `${title.length}/16 characters`}
                    inputProps={{ maxLength: 16 }}
                  />
                  <Button onClick={handleTitleUpdate} variant="contained" sx={{ ml: 1 }}>
                    Save
                  </Button>
                  <Button onClick={() => setIsEditingTitle(false)} variant="outlined" sx={{ ml: 1 }}>
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography>{title || 'TCUP Member'}</Typography>
                  <Button onClick={() => setIsEditingTitle(true)} size="small" sx={{ ml: 1 }}>
                    Edit
                  </Button>
                </Box>
              )}
            </Box>

            {/* Email */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Email:</Typography>
              {isEditingEmail ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TextField
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="small"
                    error={!!emailError}
                    helperText={emailError}
                  />
                  <Button 
                    onClick={handleEmailUpdate} 
                    variant="contained" 
                    sx={{ ml: 1 }}
                    disabled={isChangingEmail}
                  >
                    {isChangingEmail ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
                  <Button onClick={() => setIsEditingEmail(false)} variant="outlined" sx={{ ml: 1 }}>
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography>{email}</Typography>
                  <Button onClick={() => setIsEditingEmail(true)} size="small" sx={{ ml: 1 }}>
                    Edit
                  </Button>
                </Box>
              )}
            </Box>

            {/* Password */}
            <Box>
              <Typography variant="subtitle1">Password:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography>********</Typography>
                <Button onClick={() => setShowPasswordDialog(true)} size="small" sx={{ ml: 1 }}>
                  Change
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Bands Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Bands
        </Typography>
        {bandsToShow.length === 0 ? (
          <Typography sx={{ p: 2 }}>No bands added yet</Typography>
        ) : (
          <Grid container spacing={2}>
            {bandsToShow.map((band) => (
              <Grid item xs={12} sm={6} md={4} key={band.id}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                  }}
                  onClick={() => navigate(`/bands/${band.slug}`)}
                >
                  <Typography variant="h6">{band.name}</Typography>
                  {band.genre && (
                    <Typography variant="body2">
                      {Array.isArray(band.genre) ? band.genre.join(', ') : band.genre}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Favorite Bands Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Favorite Bands
        </Typography>
        {favoriteBands.length === 0 ? (
          <Typography sx={{ p: 2 }}>No favorite bands yet</Typography>
        ) : (
          <Grid container spacing={2}>
            {favoriteBands.map((band) => (
              <Grid item xs={12} sm={6} md={4} key={band.id}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                  }}
                  onClick={() => navigate(`/bands/${band.slug}`)}
                >
                  <Typography variant="h6">{band.name}</Typography>
                  {band.genre && (
                    <Typography variant="body2">
                      {Array.isArray(band.genre) ? band.genre.join(', ') : band.genre}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Saved Shows Section */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Saved Shows
        </Typography>
        {savedShows.length === 0 ? (
          <Typography sx={{ p: 2 }}>No saved shows yet</Typography>
        ) : (
          <Grid container spacing={2}>
            {savedShows.map((show) => (
              <Grid item xs={12} sm={6} md={4} key={show.id}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                  }}
                  onClick={() => navigate(`/shows/${show.id}`)}
                >
                  <Typography variant="h6">{show.title}</Typography>
                  <Typography variant="body2">
                    {new Date(show.date).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Dialog for removing avatar */}
      <Dialog open={showRemoveDialog} onClose={() => setShowRemoveDialog(false)}>
        <DialogTitle>Remove Profile Picture</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove your profile picture?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRemoveDialog(false)}>Cancel</Button>
          <Button onClick={handleRemoveAvatar} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for changing password */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
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
            }}
          />

          <TextField
            autoComplete="current-password"
            name="current-password"
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
            }}
          />

          <TextField
            autoComplete="current-password"
            name="current-password"
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
            }}
          />
          {passwordError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {passwordError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
      <Button type="button" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
      <Button type="submit" variant="contained" disabled={isChangingPassword}>
        {isChangingPassword ? <CircularProgress size={24} /> : 'Change Password'}
      </Button>
    </DialogActions>
       </form>
      </Dialog>
    </Container>
  );
}

export default UserProfile;