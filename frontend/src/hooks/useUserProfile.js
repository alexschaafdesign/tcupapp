// hooks/useUserProfile.js
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useApi from './useApi';

export function useUserProfile() {
  const { user, isAuthenticated } = useAuth0();
  const { callApi } = useApi();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchUserProfile = async () => {
    if (isAuthenticated) {
      try {
        const userProfile = await callApi(`${apiUrl}/users/profile`);
        if (userProfile?.avatar_url) {
          setAvatarUrl(userProfile.avatar_url);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [isAuthenticated]);

  return { avatarUrl, setAvatarUrl, fetchUserProfile };
}