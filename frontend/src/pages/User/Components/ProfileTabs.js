// src/pages/User/Components/ProfileTabs.js
import React, { useState } from 'react';
import { 
  Card, Box, Tabs, Tab, CardContent, Grid, Typography, 
  Button, useTheme, useMediaQuery, IconButton, Fade
} from '@mui/material';
import {
  Person as PersonIcon,
  ChatBubble as ChatBubbleIcon,
  Settings as SettingsIcon,
  Badge as BadgeIcon,
  Key as KeyIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import { useProfile } from '../../../contexts/ProfileContext';
import EditableField from './EditableField';
import UserBands from './UserBands';

const ProfileTabs = ({ isOwnProfile, onPasswordChange, showFeedback }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [passwordHover, setPasswordHover] = useState(false);
  
  const { 
    username, editedUsername, setEditedUsername, tagline, setTagline,
    email, bio, setBio, isEditingUsername, setIsEditingUsername,
    isChangingUsername, usernameError, isEditingTagline, setIsEditingTagline,
    isChangingTagline, taglineError, isEditingBio, setIsEditingBio,
    isChangingBio, handleUsernameUpdate, handleTaglineUpdate, handleBioUpdate
  } = useProfile();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Card elevation={1} sx={{ borderRadius: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          sx={{ px: 2 }}
        >
          <Tab 
            label="Info" 
            icon={<PersonIcon />} 
            iconPosition="start"
            sx={{ minHeight: 48, textTransform: 'none', fontSize: '0.9rem' }}
          />
          <Tab 
            label="About" 
            icon={<ChatBubbleIcon />} 
            iconPosition="start"
            sx={{ minHeight: 48, textTransform: 'none', fontSize: '0.9rem' }}
          />
          {isOwnProfile && (
            <Tab 
              label="Settings" 
              icon={<SettingsIcon />} 
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: 'none', fontSize: '0.9rem', ml: 'auto' }}
            />
          )}
        </Tabs>
      </Box>
      
      {/* Basic Info Tab */}
      <Box role="tabpanel" hidden={activeTab !== 0} sx={{ p: 0 }}>
        {activeTab === 0 && (
          <CardContent>
            <Grid container spacing={2}>
              {/* Username */}
              <Grid item xs={12} sm={6}>
                <EditableField
                  label="Username"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  onSave={() => handleUsernameUpdate(showFeedback)}
                  onCancel={() => {
                    setEditedUsername(username);
                    setIsEditingUsername(false);
                  }}
                  isEditing={isEditingUsername}
                  setIsEditing={setIsEditingUsername}
                  isLoading={isChangingUsername}
                  error={usernameError}
                  icon={<BadgeIcon fontSize="small" />}
                  canEdit={isOwnProfile}
                />
              </Grid>
              
              {/* Tagline */}
              <Grid item xs={12} sm={6}>
                <EditableField
                  label="Tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  onSave={() => handleTaglineUpdate(showFeedback)}
                  onCancel={() => setIsEditingTagline(false)}
                  isEditing={isEditingTagline}
                  setIsEditing={setIsEditingTagline}
                  isLoading={isChangingTagline}
                  error={taglineError}
                  maxLength={32}
                  icon={<ChatBubbleIcon fontSize="small" />}
                  canEdit={isOwnProfile}
                />
              </Grid>
              
              {/* Email */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 1.5,
                  borderRadius: 1,
                }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Box sx={{ 
                        color: 'primary.main', 
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.7
                      }}>
                        <EmailIcon fontSize="small" />
                      </Box>
                    </Grid>
                    <Grid item xs>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}
                      >
                        Email
                      </Typography>
                      <Typography variant="body2">
                        {email}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              
              {/* Password */}
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    p: 1.5,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': isOwnProfile ? { 
                      bgcolor: 'rgba(0,0,0,0.02)'
                    } : {},
                  }}
                  onMouseEnter={() => setPasswordHover(true)}
                  onMouseLeave={() => setPasswordHover(false)}
                >
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Box sx={{ 
                        color: 'primary.main', 
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.7
                      }}>
                        <KeyIcon fontSize="small" />
                      </Box>
                    </Grid>
                    <Grid item xs>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}
                      >
                        Password
                      </Typography>
                      <Typography variant="body2">••••••••</Typography>
                    </Grid>
                    {isOwnProfile && (
                      <Grid item>
                        <Fade in={passwordHover}>
                          <IconButton 
                            size="small" 
                            onClick={onPasswordChange}
                            sx={{ 
                              color: 'primary.main',
                              p: 0.8,
                              border: '1px solid',
                              borderColor: 'primary.main',
                              opacity: 0.7,
                              '&:hover': { 
                                opacity: 1, 
                                bgcolor: 'primary.main',
                                color: 'white'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Fade>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Box>

      {/* About Tab */}
      <Box role="tabpanel" hidden={activeTab !== 1} sx={{ p: 0 }}>
        {activeTab === 1 && (
          <CardContent>
            <EditableField
              label="About"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onSave={() => handleBioUpdate(showFeedback)}
              onCancel={() => setIsEditingBio(false)}
              isEditing={isEditingBio}
              setIsEditing={setIsEditingBio}
              isLoading={isChangingBio}
              placeholder="Add a bio to tell people about yourself..."
              multiline
              rows={4}
              icon={<ChatBubbleIcon fontSize="small" />}
              canEdit={isOwnProfile}
            />
          </CardContent>
        )}
      </Box>

      {/* Bands Tab */}
      <Box role="tabpanel" hidden={activeTab !== 2} sx={{ p: 0 }}>
        {activeTab === 2 && (
          <CardContent>
            <UserBands isOwnProfile={isOwnProfile} />
          </CardContent>
        )}
      </Box>


      {/* Settings Tab - Only visible for own profile */}
      {isOwnProfile && (
        <Box role="tabpanel" hidden={activeTab !== 3} sx={{ p: 0 }}>
          {activeTab === 3 && (
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Account Settings
              </Typography>
              
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={onPasswordChange}
                startIcon={<KeyIcon />}
                sx={{ mr: 2, mb: 2 }}
              >
                Change Password
              </Button>
            </CardContent>
          )}
        </Box>
      )}
    </Card>
  );
};

export default ProfileTabs;