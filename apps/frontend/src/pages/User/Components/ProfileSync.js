// src/components/ProfileSync.js
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

function ProfileSync() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log('ProfileSync mounted');
    
    if (isAuthenticated && user) {
      console.log('User is authenticated:', user?.sub);
      
      const saveUserProfile = async () => {
        try {
          const token = await getAccessTokenSilently();
          console.log('Token retrieved:', !!token);
          console.log('Complete user object being sent to backend:', user);

          
          // Use the correct API URL from your environment
          // If apiUrl is "http://localhost:3001/api" then this becomes
          // "http://localhost:3001/api/users/profile"
          const endpoint = `${apiUrl}/users/profile`;
          console.log('Making request to:', endpoint);
          
          const response = await axios.post(`${apiUrl}/users/profile`, {
            sub: user.sub,
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            // Make sure we include the custom claim specifically
            [`https://tcupboard.org/username`]: user[`https://tcupboard.org/username`],
            preferred_username: user.preferred_username
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('Profile saved successfully:', response.data);
        } catch (error) {
          console.error('Error in saveUserProfile:', error);
          if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
          }
          console.error('Request URL:', error.config?.url);
        }
      };

      saveUserProfile();
    }
  }, [isAuthenticated, user, getAccessTokenSilently, apiUrl]);

  return null;
}

export default ProfileSync;