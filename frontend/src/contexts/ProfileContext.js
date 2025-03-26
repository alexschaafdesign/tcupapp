// File: contexts/ProfileContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import useApi from '../hooks/useApi';
import { useUserProfile } from '../hooks/useUserProfile';

// Create context
const ProfileContext = createContext();

// Custom hook to use the profile context
export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const { userId } = useParams();
  const { user, isAuthenticated } = useAuth0();
  const { callApi } = useApi();
  const { setAvatarUrl } = useUserProfile();
  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Profile data state
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null);
  
  // Form fields and their edit states
  const [username, setUsername] = useState('');
  const [editedUsername, setEditedUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState(null);
  
  const [tagline, setTagline] = useState('');
  const [isEditingTagline, setIsEditingTagline] = useState(false);
  const [isChangingTagline, setIsChangingTagline] = useState(false);
  const [taglineError, setTaglineError] = useState(null);
  
  const [email, setEmail] = useState('');
  
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isChangingBio, setIsChangingBio] = useState(false);
  
  // Join date formatting
  const joinDate = new Date(2023, 10, 15).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const endpoint = userId ? `${apiUrl}/users/profile/${userId}` : `${apiUrl}/users/profile`;

  // Initialize state on user/profile ID change
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsOwnProfile(!userId || userId === user.sub);
    }
  }, [userId, isAuthenticated, user]);

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && !isLoaded) {
        try {
          // Fetch user profile data
          const profileData = await callApi(endpoint);
          
          if (profileData) {
            if (profileData.username) {
              setUsername(profileData.username);
              setEditedUsername(profileData.username);
            }
            if (profileData.avatar_url) setProfileAvatarUrl(profileData.avatar_url);
            if (profileData.email) setEmail(profileData.email);
            if (profileData.tagline) setTagline(profileData.tagline);
            if (profileData.bio) setBio(profileData.bio);
          }

          if (isOwnProfile && profileData.avatar_url) {
            setAvatarUrl(profileData.avatar_url);
          }
          
          setIsLoaded(true);
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };

    fetchData();
  }, [isAuthenticated, isLoaded, callApi, endpoint, apiUrl, setAvatarUrl, isOwnProfile, userId, user?.sub]);

  // Username update handler
  const handleUsernameUpdate = async (callback) => {
    if (!isOwnProfile) return;
    
    if (!editedUsername) {
      setUsernameError('Username cannot be empty');
      return;
    }
    
    try {
      setUsernameError(null);
      setIsChangingUsername(true);
      
      const response = await callApi(`${apiUrl}/users/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editedUsername }),
      });
  
      if (response.error) throw new Error(response.error);
      
      setUsername(editedUsername);
      setIsEditingUsername(false);
      if (callback) callback('Username updated');
    } catch (error) {
      setUsernameError('Failed to update username');
    } finally {
      setIsChangingUsername(false);
    }
  };

  // Tagline update handler
  const handleTaglineUpdate = async (callback) => {
    if (!isOwnProfile) return;
    
    if (tagline.length > 32) {
      setTaglineError('Tagline must be 32 characters or less');
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
      if (callback) callback('Tagline updated');
    } catch (error) {
      setTaglineError('Failed to update tagline');
    } finally {
      setIsChangingTagline(false);
    }
  };

  // Bio update handler
  const handleBioUpdate = async (callback) => {
    if (!isOwnProfile) return;
    
    try {
      setIsChangingBio(true);
      
      const response = await callApi(`${apiUrl}/users/bio`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });
  
      if (response.error) throw new Error(response.error);
      
      setIsEditingBio(false);
      if (callback) callback('Bio updated');
    } catch (error) {
      console.error('Error updating bio:', error);
    } finally {
      setIsChangingBio(false);
    }
  };

  // Helper function to get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Context value
  const value = {
    // Profile data
    username,
    editedUsername,
    setEditedUsername,
    tagline,
    setTagline,
    email,
    bio,
    setBio,
    profileAvatarUrl,
    setProfileAvatarUrl,
    isOwnProfile,
    joinDate,
    
    // Edit states
    isEditingUsername,
    setIsEditingUsername,
    isChangingUsername,
    usernameError,
    
    isEditingTagline,
    setIsEditingTagline,
    isChangingTagline,
    taglineError,
    
    isEditingBio,
    setIsEditingBio,
    isChangingBio,
    
    // Update handlers
    handleUsernameUpdate,
    handleTaglineUpdate,
    handleBioUpdate,
    
    // Helper functions
    getInitials,
    
    // Loading state
    isLoaded
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};