import React, { useState } from 'react';
import {
  Box, Grid, Typography, Avatar, CircularProgress, Fade, Card
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useProfile } from '../../../contexts/ProfileContext';
import useCloudinaryUpload from '../../../hooks/useCloudinaryUpload';
import { useApi } from '../../../hooks/useApi';
import { useUserProfile } from '../../../hooks/useUserProfile';

const ProfileHeader = ({ isOwnProfile, showFeedback }) => {
  const { uploadImage } = useCloudinaryUpload();
  const { callApi } = useApi();
  const { setAvatarUrl } = useUserProfile();
  const { 
    username, profileAvatarUrl, setProfileAvatarUrl, 
    tagline, joinDate, getInitials
  } = useProfile();
  
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Avatar upload handler
  const handleAvatarUpload = async (file) => {
    if (!file || !isOwnProfile) return;
    
    try {
      setAvatarUploading(true);
      
      const imageUrl = await uploadImage(file, 'user-avatars');
      
      const response = await callApi(`${apiUrl}/users/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: imageUrl }),
      });
  
      if (response.error) throw new Error(response.error);
      
      setProfileAvatarUrl(imageUrl);
      setAvatarUrl(imageUrl);
      
      showFeedback('Profile picture updated');
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <Card elevation={1} sx={{ borderRadius: 2, mb: 2, overflow: 'hidden' }}>
      <Box sx={{ 
        backgroundColor: 'primary.main',
        pt: 2, pb: 2, px: 3,
        color: 'white'
      }}>
        <Grid container spacing={2} alignItems="center">
          {/* Avatar */}
          <Grid item>
            <Box 
              sx={{ position: 'relative', width: 72, height: 72 }}
              onMouseEnter={() => !avatarUploading && isOwnProfile && setImageHover(true)}
              onMouseLeave={() => setImageHover(false)}
            >
              <Avatar
                src={profileAvatarUrl}
                alt={username}
                sx={{
                  width: 72, height: 72,
                  border: '2px solid rgba(255,255,255,0.7)',
                  fontSize: !profileAvatarUrl ? '1.8rem' : undefined,
                  bgcolor: !profileAvatarUrl ? 'rgba(255,255,255,0.2)' : undefined,
                  filter: (imageHover && !avatarUploading && isOwnProfile) ? 'brightness(0.8)' : 'brightness(1)',
                }}
              >
                {!profileAvatarUrl && getInitials(username)}
              </Avatar>
              
              {/* Loading overlay */}
              {avatarUploading && (
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '50%', zIndex: 3
                }}>
                  <CircularProgress size={30} sx={{ color: 'white' }} />
                </Box>
              )}
              
              {/* Edit overlay */}
              {isOwnProfile && (
                <Fade in={imageHover && !avatarUploading}>
                  <Box 
                    sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '50%', zIndex: 2
                    }}
                    onClick={() => document.getElementById('profile-image-input').click()}
                  >
                    <PhotoCameraIcon sx={{ color: 'white', fontSize: 22 }} />
                    <Typography variant="caption" sx={{ color: 'white', mt: 0.5, fontSize: '0.6rem' }}>
                      Change
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
                      disabled={avatarUploading}
                    />
                  </Box>
                </Fade>
              )}
            </Box>
          </Grid>

          {/* Username and Tagline */}
          <Grid item xs>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {username}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8, mt: 0.5 }}>
                {tagline || '-'}
              </Typography>
            </Box>
          </Grid>

          {/* Join date */}
          <Grid item>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', gap: 1,
              opacity: 0.8, fontSize: '0.875rem'
            }}>
              <CalendarIcon fontSize="small" />
              <Typography variant="body2">
                Joined {joinDate}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

export default ProfileHeader;