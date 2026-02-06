// File: UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box } from '@mui/material';

// Hooks
import { useAuth0 } from '@auth0/auth0-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import useCloudinaryUpload from '../../hooks/useCloudinaryUpload';

// Components
import ProfileHeader from './Components/ProfileHeader';
import ProfileTabs from './Components/ProfileTabs';
import PasswordDialog from './Components/PasswordDialog';
import Feedback from './Components/Feedback';
import Loading from './Components/Loading';

// Contexts
import { ProfileProvider } from '../../contexts/ProfileContext';

// Main Component
const UserProfile = () => {
  const { userId } = useParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth0();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize isOwnProfile state
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsOwnProfile(!userId || userId === user.sub);
    }
  }, [userId, isAuthenticated, user]);

  // Just check auth loading state
  if (authLoading) {
    return <Loading />;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <NotAuthenticated />;
  }

  const showFeedback = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
  };

  return (
    <ProfileProvider>
      <Feedback
        message={successMessage}
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      
      <Container maxWidth="md" sx={{ mt: 3, mb: 6 }}>
        <Box sx={{ mb: 2 }}>
          <ProfileHeader 
            isOwnProfile={isOwnProfile}
            showFeedback={showFeedback}
          />
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <ProfileTabs 
            isOwnProfile={isOwnProfile} 
            onPasswordChange={() => setShowPasswordDialog(true)}
            showFeedback={showFeedback}
          />
        </Box>
      </Container>
      
      <PasswordDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        showFeedback={showFeedback}
      />
    </ProfileProvider>
  );
};

// Not authenticated component
const NotAuthenticated = () => (
  <Container maxWidth="sm" sx={{ mt: 3 }}>
    <Paper elevation={1} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
      <Typography>Please log in to view profiles</Typography>
    </Paper>
  </Container>
);

export default UserProfile;