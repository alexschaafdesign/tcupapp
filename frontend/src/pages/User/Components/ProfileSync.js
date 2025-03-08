import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

function ProfileSync() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

  useEffect(() => {
    // Only run this if the user is authenticated
    if (isAuthenticated && user) {
      const saveUserProfile = async () => {
        try {
          const token = await getAccessTokenSilently();
          
          console.log('User data from Auth0:', user);
          
          // Send user data to your backend
          const response = await axios.post('/api/users/profile', user, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('Profile saved:', response.data);
        } catch (error) {
          console.error('Error saving profile:', error);
        }
      };

      saveUserProfile();
    }
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // This component doesn't render anything
  return null;
}

export default ProfileSync;