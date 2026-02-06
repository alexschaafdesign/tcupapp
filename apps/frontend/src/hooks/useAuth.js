import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    getAccessTokenSilently 
  } = useAuth0();
  const [tokenReady, setTokenReady] = useState(false);

  // Add debugging logs only when user exists to avoid console spam
  if (user) {
    // console.log('Auth0 user object:', user);
    // console.log('Roles namespace check:', user?.['https://tcupboard.org/roles']);
  }
  
  // Role utilities
  const userRoles = user?.['https://tcupboard.org/roles'] || [];
  
  const isAdmin = userRoles.includes('admin');
  const isModerator = userRoles.includes('moderator');
  const isContributor = userRoles.includes('contributor');
  const hasRole = (role) => userRoles.includes(role);

  useEffect(() => {
    if (isAuthenticated) {
      const updateToken = async () => {
        try {
          // Get the token but don't try to use it directly with Supabase
          const token = await getAccessTokenSilently();
          setTokenReady(true);
          
          // No need to test Supabase connection - we'll use the backend proxy
        } catch (error) {
          console.error('Error getting access token:', error);
          setTokenReady(false);
        }
      };

      updateToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return { 
    user, 
    isAuthenticated,
    tokenReady,  // renamed from supabaseReady to be clearer
    getAccessTokenSilently,
    // Role-related properties
    userRoles,
    isAdmin,
    isModerator,
    isContributor,
    hasRole
  };
};